"""
Bulk Email Router
Features:
- Send single emails with HTML/templates
- Send bulk emails to multiple recipients
- Schedule emails for future delivery
- Track email status and analytics
- Support for HTML templates and attachments
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from enum import Enum
from bson import ObjectId
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formatdate, make_msgid
import jinja2
import asyncio
import aiosmtplib
from motor.motor_asyncio import AsyncIOMotorCollection
import logging
from database import db
import uuid
from auth.utils import get_current_user, oauth2_scheme
from datetime import datetime, timezone
import os
from pathlib import Path
import json

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bulk-email", tags=["Bulk Email"])

# Database collections
emails_collection = db["bulk_emails"]
templates_collection = db["email_templates"]
scheduled_emails_collection = db["scheduled_emails"]
email_analytics_collection = db["email_analytics"]

# SMTP Configuration (should be in config/settings)
SMTP_CONFIG = {
    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.getenv("SMTP_PORT", 587)),
    "username": os.getenv("SMTP_USERNAME", ""),
    "password": os.getenv("SMTP_PASSWORD", ""),
    "use_tls": True,
    "sender_email": os.getenv("SMTP_SENDER_EMAIL", "noreply@yourdomain.com"),
    "sender_name": os.getenv("SMTP_SENDER_NAME", "Your Platform")
}

# Email statuses
class EmailStatus(str, Enum):
    PENDING = "pending"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"
    BOUNCED = "bounced"
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"

# Priority levels
class EmailPriority(str, Enum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"

# Pydantic Models
class EmailRecipient(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    variables: Optional[Dict[str, Any]] = {}  # For template personalization

class EmailAttachment(BaseModel):
    filename: str
    content_type: str
    content_base64: str  # Base64 encoded file content

class SingleEmailRequest(BaseModel):
    to: EmailRecipient
    subject: str
    body: Optional[str] = None
    html_body: Optional[str] = None
    template_id: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = {}
    attachments: Optional[List[EmailAttachment]] = []
    priority: EmailPriority = EmailPriority.NORMAL
    send_immediately: bool = True

class BulkEmailRequest(BaseModel):
    recipients: List[EmailRecipient]
    subject: str
    body: Optional[str] = None
    html_body: Optional[str] = None
    template_id: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = {}
    attachments: Optional[List[EmailAttachment]] = []
    priority: EmailPriority = EmailPriority.NORMAL
    send_immediately: bool = True
    batch_size: int = Field(50, ge=1, le=100)  # Max 100 emails per batch
    
    @validator('recipients')
    def validate_recipients(cls, v):
        if len(v) > 1000:
            raise ValueError('Maximum 1000 recipients per bulk email')
        return v

class ScheduleEmailRequest(BaseModel):
    to: Union[EmailRecipient, List[EmailRecipient]]
    subject: str
    body: Optional[str] = None
    html_body: Optional[str] = None
    template_id: Optional[str] = None
    template_variables: Optional[Dict[str, Any]] = {}
    attachments: Optional[List[EmailAttachment]] = []
    priority: EmailPriority = EmailPriority.NORMAL
    schedule_time: datetime
    timezone: str = "UTC"
    
    @validator('schedule_time')
    def validate_schedule_time(cls, v):
        if v < datetime.now(timezone.utc):
            raise ValueError('Schedule time must be in the future')
        return v

class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    html_content: str
    text_content: Optional[str] = None
    category: Optional[str] = "general"
    variables: Optional[List[str]] = []
    is_active: bool = True

class EmailTemplateUpdate(BaseModel):
    name: Optional[str]
    subject: Optional[str]
    html_content: Optional[str]
    text_content: Optional[str]
    category: Optional[str]
    variables: Optional[List[str]]
    is_active: Optional[bool]

class EmailStatsRequest(BaseModel):
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    template_id: Optional[str]
    status: Optional[EmailStatus]

# Email Service Class
class EmailService:
    def __init__(self):
        self.smtp_config = SMTP_CONFIG
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader("email_templates"),
            autoescape=True
        )
    
    async def test_connection(self) -> bool:
        """Test SMTP connection"""
        try:
            async with aiosmtplib.SMTP(
                hostname=self.smtp_config["host"],
                port=self.smtp_config["port"],
                use_tls=self.smtp_config["use_tls"]
            ) as smtp:
                await smtp.connect()
                await smtp.login(
                    self.smtp_config["username"],
                    self.smtp_config["password"]
                )
                await smtp.quit()
            return True
        except Exception as e:
            logger.error(f"SMTP connection test failed: {str(e)}")
            return False
    
    def _create_message(
        self,
        to_email: str,
        to_name: Optional[str],
        subject: str,
        text_body: Optional[str] = None,
        html_body: Optional[str] = None,
        attachments: Optional[List[EmailAttachment]] = None
    ) -> MIMEMultipart:
        """Create email message with optional attachments"""
        msg = MIMEMultipart('alternative')
        msg['Message-ID'] = make_msgid()
        msg['Date'] = formatdate(localtime=True)
        msg['From'] = f"{self.smtp_config['sender_name']} <{self.smtp_config['sender_email']}>"
        msg['To'] = f"{to_name} <{to_email}>" if to_name else to_email
        msg['Subject'] = subject
        msg['X-Priority'] = '1'  # High priority
        
        # Add text body
        if text_body:
            text_part = MIMEText(text_body, 'plain', 'utf-8')
            msg.attach(text_part)
        
        # Add HTML body
        if html_body:
            html_part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(html_part)
        
        # Add attachments
        if attachments:
            for attachment in attachments:
                part = MIMEBase('application', 'octet-stream')
                import base64
                part.set_payload(base64.b64decode(attachment.content_base64))
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename="{attachment.filename}"'
                )
                msg.attach(part)
        
        return msg
    
    async def send_single_email(
        self,
        to_email: str,
        to_name: Optional[str],
        subject: str,
        text_body: Optional[str] = None,
        html_body: Optional[str] = None,
        attachments: Optional[List[EmailAttachment]] = None
    ) -> Dict[str, Any]:
        """Send single email using SMTP"""
        email_id = str(uuid.uuid4())
        status = EmailStatus.SENT
        error_message = None
        
        try:
            # Create message
            msg = self._create_message(
                to_email, to_name, subject,
                text_body, html_body, attachments
            )
            
            # Send via SMTP
            async with aiosmtplib.SMTP(
                hostname=self.smtp_config["host"],
                port=self.smtp_config["port"],
                use_tls=self.smtp_config["use_tls"]
            ) as smtp:
                await smtp.connect()
                await smtp.login(
                    self.smtp_config["username"],
                    self.smtp_config["password"]
                )
                await smtp.send_message(msg)
                await smtp.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            status = EmailStatus.FAILED
            error_message = str(e)
        
        return {
            "email_id": email_id,
            "to_email": to_email,
            "status": status,
            "error_message": error_message,
            "sent_at": datetime.utcnow() if status == EmailStatus.SENT else None
        }
    
    async def send_bulk_emails(
        self,
        recipients: List[EmailRecipient],
        subject: str,
        text_body: Optional[str] = None,
        html_body: Optional[str] = None,
        attachments: Optional[List[EmailAttachment]] = None,
        batch_size: int = 50
    ) -> List[Dict[str, Any]]:
        """Send bulk emails in batches"""
        results = []
        
        # Split recipients into batches
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i:i + batch_size]
            batch_results = []
            
            # Send emails concurrently in batch
            tasks = []
            for recipient in batch:
                task = self.send_single_email(
                    recipient.email,
                    recipient.name,
                    subject,
                    text_body,
                    html_body,
                    attachments
                )
                tasks.append(task)
            
            # Wait for all emails in batch to be sent
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    results.append({
                        "email": batch[j].email,
                        "status": EmailStatus.FAILED,
                        "error_message": str(result)
                    })
                else:
                    results.append(result)
            
            # Small delay between batches to avoid rate limiting
            if i + batch_size < len(recipients):
                await asyncio.sleep(1)
        
        return results
    
    def render_template(
        self,
        template_content: str,
        variables: Dict[str, Any]
    ) -> str:
        """Render email template with variables"""
        template = self.jinja_env.from_string(template_content)
        return template.render(**variables)
    
    async def get_template(self, template_id: str) -> Optional[Dict]:
        """Get email template from database"""
        template = await templates_collection.find_one({
            "_id": ObjectId(template_id),
            "is_active": True
        })
        return template

# Initialize email service
email_service = EmailService()

# Background task for sending scheduled emails
async def process_scheduled_emails():
    """Process scheduled emails that are due"""
    while True:
        try:
            current_time = datetime.utcnow()
            
            # Find emails scheduled to be sent now or in the past
            scheduled_emails = scheduled_emails_collection.find({
                "status": EmailStatus.SCHEDULED,
                "schedule_time": {"$lte": current_time}
            })
            
            async for email in scheduled_emails:
                try:
                    # Update status to sending
                    await scheduled_emails_collection.update_one(
                        {"_id": email["_id"]},
                        {"$set": {"status": EmailStatus.SENDING}}
                    )
                    
                    # Send email
                    if isinstance(email["to"], list):
                        # Bulk email
                        recipients = [
                            EmailRecipient(**r) for r in email["to"]
                        ]
                        results = await email_service.send_bulk_emails(
                            recipients=recipients,
                            subject=email["subject"],
                            text_body=email.get("body"),
                            html_body=email.get("html_body"),
                            attachments=email.get("attachments")
                        )
                        
                        # Update status for each recipient
                        for result in results:
                            await emails_collection.update_one(
                                {"email_id": result["email_id"]},
                                {"$set": {
                                    "status": result["status"],
                                    "sent_at": result.get("sent_at"),
                                    "error_message": result.get("error_message")
                                }}
                            )
                    else:
                        # Single email
                        recipient = EmailRecipient(**email["to"])
                        result = await email_service.send_single_email(
                            to_email=recipient.email,
                            to_name=recipient.name,
                            subject=email["subject"],
                            text_body=email.get("body"),
                            html_body=email.get("html_body"),
                            attachments=email.get("attachments")
                        )
                        
                        # Update email record
                        await emails_collection.update_one(
                            {"email_id": result["email_id"]},
                            {"$set": {
                                "status": result["status"],
                                "sent_at": result.get("sent_at"),
                                "error_message": result.get("error_message")
                            }}
                        )
                    
                    # Mark scheduled email as sent
                    await scheduled_emails_collection.update_one(
                        {"_id": email["_id"]},
                        {"$set": {
                            "status": EmailStatus.SENT,
                            "sent_at": datetime.utcnow()
                        }}
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to process scheduled email {email['_id']}: {str(e)}")
                    await scheduled_emails_collection.update_one(
                        {"_id": email["_id"]},
                        {"$set": {
                            "status": EmailStatus.FAILED,
                            "error_message": str(e)
                        }}
                    )
            
            # Wait before checking again
            await asyncio.sleep(60)  # Check every minute
            
        except Exception as e:
            logger.error(f"Error in scheduled email processor: {str(e)}")
            await asyncio.sleep(60)

# Start background task when app starts
@router.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(process_scheduled_emails())

# ==================== ROUTES ====================

@router.post("/test-connection")
async def test_smtp_connection(user: Dict = Depends(get_current_user)):
    """Test SMTP connection"""
    try:
        is_connected = await email_service.test_connection()
        
        if is_connected:
            return {
                "success": True,
                "message": "SMTP connection successful",
                "config": {
                    "host": SMTP_CONFIG["host"],
                    "port": SMTP_CONFIG["port"],
                    "sender": SMTP_CONFIG["sender_email"]
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SMTP connection failed"
            )
    
    except Exception as e:
        logger.error(f"SMTP test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SMTP connection failed: {str(e)}"
        )

@router.post("/send-single")
async def send_single_email(
    email_request: SingleEmailRequest,
    background_tasks: BackgroundTasks,
    user: Dict = Depends(get_current_user)
):
    """Send a single email"""
    try:
        # Check if using template
        html_body = email_request.html_body
        text_body = email_request.body
        
        if email_request.template_id:
            template = await email_service.get_template(email_request.template_id)
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Email template not found"
                )
            
            # Merge template variables with request variables
            all_variables = {**email_request.template_variables}
            if email_request.to.variables:
                all_variables.update(email_request.to.variables)
            
            # Render template
            html_body = email_service.render_template(
                template["html_content"],
                all_variables
            )
            
            if template.get("text_content"):
                text_body = email_service.render_template(
                    template["text_content"],
                    all_variables
                )
        
        # Create email record
        email_id = str(uuid.uuid4())
        email_record = {
            "email_id": email_id,
            "user_id": user["id"],
            "user_email": user["email"],
            "to_email": email_request.to.email,
            "to_name": email_request.to.name,
            "subject": email_request.subject,
            "body": text_body,
            "html_body": html_body,
            "template_id": email_request.template_id,
            "attachments_count": len(email_request.attachments or []),
            "priority": email_request.priority,
            "status": EmailStatus.PENDING,
            "created_at": datetime.utcnow(),
            "sent_at": None,
            "error_message": None
        }
        
        # Save to database
        await emails_collection.insert_one(email_record)
        
        # Send immediately or schedule
        if email_request.send_immediately:
            background_tasks.add_task(
                _send_and_update_email,
                email_id,
                email_request.to.email,
                email_request.to.name,
                email_request.subject,
                text_body,
                html_body,
                email_request.attachments
            )
            message = "Email queued for immediate sending"
        else:
            await emails_collection.update_one(
                {"email_id": email_id},
                {"$set": {"status": EmailStatus.SCHEDULED}}
            )
            message = "Email saved for manual sending"
        
        # Create analytics record
        analytics_record = {
            "email_id": email_id,
            "user_id": user["id"],
            "recipient_email": email_request.to.email,
            "subject": email_request.subject,
            "template_id": email_request.template_id,
            "status": EmailStatus.PENDING,
            "created_at": datetime.utcnow(),
            "opened_at": None,
            "clicked_at": None,
            "opened_count": 0,
            "clicked_count": 0,
            "bounce_reason": None
        }
        
        await email_analytics_collection.insert_one(analytics_record)
        
        return {
            "success": True,
            "message": message,
            "email_id": email_id,
            "recipient": {
                "email": email_request.to.email,
                "name": email_request.to.name
            },
            "subject": email_request.subject,
            "status": EmailStatus.PENDING if email_request.send_immediately else EmailStatus.SCHEDULED
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send single email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )

@router.post("/send-bulk")
async def send_bulk_emails(
    bulk_request: BulkEmailRequest,
    background_tasks: BackgroundTasks,
    user: Dict = Depends(get_current_user)
):
    """Send bulk emails to multiple recipients"""
    try:
        # Validate SMTP connection
        if not await email_service.test_connection():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SMTP server is not available"
            )
        
        # Check if using template
        html_body = bulk_request.html_body
        text_body = bulk_request.body
        
        if bulk_request.template_id:
            template = await email_service.get_template(bulk_request.template_id)
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Email template not found"
                )
            
            # For bulk, we'll render templates individually for each recipient
            html_template = template["html_content"]
            text_template = template.get("text_content")
        
        # Create batch record
        batch_id = str(uuid.uuid4())
        batch_record = {
            "batch_id": batch_id,
            "user_id": user["id"],
            "user_email": user["email"],
            "subject": bulk_request.subject,
            "template_id": bulk_request.template_id,
            "recipient_count": len(bulk_request.recipients),
            "attachments_count": len(bulk_request.attachments or []),
            "priority": bulk_request.priority,
            "status": EmailStatus.PENDING,
            "created_at": datetime.utcnow(),
            "completed_at": None,
            "success_count": 0,
            "failed_count": 0
        }
        
        await emails_collection.insert_one(batch_record)
        
        # Create individual email records
        email_records = []
        analytics_records = []
        
        for recipient in bulk_request.recipients:
            email_id = str(uuid.uuid4())
            
            # Render template for each recipient if template exists
            recipient_html_body = html_body
            recipient_text_body = text_body
            
            if bulk_request.template_id:
                # Merge variables
                all_variables = {**bulk_request.template_variables}
                if recipient.variables:
                    all_variables.update(recipient.variables)
                
                recipient_html_body = email_service.render_template(
                    html_template,
                    all_variables
                )
                
                if text_template:
                    recipient_text_body = email_service.render_template(
                        text_template,
                        all_variables
                    )
            
            email_record = {
                "email_id": email_id,
                "batch_id": batch_id,
                "user_id": user["id"],
                "to_email": recipient.email,
                "to_name": recipient.name,
                "subject": bulk_request.subject,
                "body": recipient_text_body,
                "html_body": recipient_html_body,
                "template_id": bulk_request.template_id,
                "priority": bulk_request.priority,
                "status": EmailStatus.PENDING,
                "created_at": datetime.utcnow()
            }
            
            analytics_record = {
                "email_id": email_id,
                "batch_id": batch_id,
                "user_id": user["id"],
                "recipient_email": recipient.email,
                "subject": bulk_request.subject,
                "template_id": bulk_request.template_id,
                "status": EmailStatus.PENDING,
                "created_at": datetime.utcnow()
            }
            
            email_records.append(email_record)
            analytics_records.append(analytics_record)
        
        # Bulk insert records
        if email_records:
            await emails_collection.insert_many(email_records)
        if analytics_records:
            await email_analytics_collection.insert_many(analytics_records)
        
        # Send emails in background
        if bulk_request.send_immediately:
            background_tasks.add_task(
                _send_bulk_emails_background,
                batch_id,
                bulk_request.recipients,
                bulk_request.subject,
                text_body,
                html_body,
                bulk_request.attachments,
                bulk_request.batch_size,
                bulk_request.template_id,
                bulk_request.template_variables
            )
            message = f"Bulk email batch queued for sending to {len(bulk_request.recipients)} recipients"
        else:
            await emails_collection.update_one(
                {"batch_id": batch_id},
                {"$set": {"status": EmailStatus.SCHEDULED}}
            )
            message = f"Bulk email batch saved for {len(bulk_request.recipients)} recipients"
        
        return {
            "success": True,
            "message": message,
            "batch_id": batch_id,
            "recipient_count": len(bulk_request.recipients),
            "status": EmailStatus.PENDING if bulk_request.send_immediately else EmailStatus.SCHEDULED
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send bulk emails: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send bulk emails: {str(e)}"
        )

@router.post("/schedule")
async def schedule_email(
    schedule_request: ScheduleEmailRequest,
    user: Dict = Depends(get_current_user)
):
    """Schedule email for future delivery"""
    try:
        # Create scheduled email record
        scheduled_id = str(uuid.uuid4())
        recipients = schedule_request.to if isinstance(schedule_request.to, list) else [schedule_request.to]
        
        scheduled_record = {
            "scheduled_id": scheduled_id,
            "user_id": user["id"],
            "user_email": user["email"],
            "to": [r.dict() for r in recipients],
            "subject": schedule_request.subject,
            "body": schedule_request.body,
            "html_body": schedule_request.html_body,
            "template_id": schedule_request.template_id,
            "template_variables": schedule_request.template_variables,
            "attachments": [a.dict() for a in (schedule_request.attachments or [])],
            "priority": schedule_request.priority,
            "status": EmailStatus.SCHEDULED,
            "schedule_time": schedule_request.schedule_time,
            "timezone": schedule_request.timezone,
            "created_at": datetime.utcnow(),
            "sent_at": None,
            "error_message": None
        }
        
        await scheduled_emails_collection.insert_one(scheduled_record)
        
        # Create individual email records for tracking
        email_records = []
        for recipient in recipients:
            email_id = str(uuid.uuid4())
            email_record = {
                "email_id": email_id,
                "scheduled_id": scheduled_id,
                "user_id": user["id"],
                "to_email": recipient.email,
                "to_name": recipient.name,
                "subject": schedule_request.subject,
                "body": schedule_request.body,
                "html_body": schedule_request.html_body,
                "template_id": schedule_request.template_id,
                "priority": schedule_request.priority,
                "status": EmailStatus.SCHEDULED,
                "schedule_time": schedule_request.schedule_time,
                "created_at": datetime.utcnow()
            }
            email_records.append(email_record)
        
        if email_records:
            await emails_collection.insert_many(email_records)
        
        return {
            "success": True,
            "message": f"Email scheduled for {schedule_request.schedule_time}",
            "scheduled_id": scheduled_id,
            "schedule_time": schedule_request.schedule_time,
            "recipient_count": len(recipients)
        }
    
    except Exception as e:
        logger.error(f"Failed to schedule email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule email: {str(e)}"
        )

@router.get("/scheduled")
async def get_scheduled_emails(
    status: Optional[EmailStatus] = None,
    limit: int = 20,
    skip: int = 0,
    user: Dict = Depends(get_current_user)
):
    """Get scheduled emails"""
    try:
        query = {"user_id": user["id"]}
        if status:
            query["status"] = status
        
        cursor = scheduled_emails_collection.find(query).sort("schedule_time", -1).skip(skip).limit(limit)
        
        scheduled_emails = []
        async for email in cursor:
            scheduled_emails.append({
                "id": str(email["_id"]),
                "scheduled_id": email.get("scheduled_id"),
                "subject": email["subject"],
                "recipient_count": len(email["to"]) if isinstance(email["to"], list) else 1,
                "status": email["status"],
                "schedule_time": email["schedule_time"],
                "created_at": email["created_at"],
                "sent_at": email.get("sent_at")
            })
        
        total = await scheduled_emails_collection.count_documents(query)
        
        return {
            "success": True,
            "scheduled_emails": scheduled_emails,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    
    except Exception as e:
        logger.error(f"Failed to get scheduled emails: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scheduled emails: {str(e)}"
        )

@router.delete("/scheduled/{scheduled_id}")
async def cancel_scheduled_email(
    scheduled_id: str,
    user: Dict = Depends(get_current_user)
):
    """Cancel a scheduled email"""
    try:
        result = await scheduled_emails_collection.update_one(
            {
                "scheduled_id": scheduled_id,
                "user_id": user["id"],
                "status": EmailStatus.SCHEDULED
            },
            {"$set": {"status": EmailStatus.CANCELLED}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scheduled email not found or cannot be cancelled"
            )
        
        # Also update individual email records
        await emails_collection.update_many(
            {
                "scheduled_id": scheduled_id,
                "user_id": user["id"]
            },
            {"$set": {"status": EmailStatus.CANCELLED}}
        )
        
        return {
            "success": True,
            "message": "Scheduled email cancelled successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel scheduled email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel scheduled email: {str(e)}"
        )

@router.post("/templates")
async def create_email_template(
    template_data: EmailTemplateCreate,
    user: Dict = Depends(get_current_user)
):
    """Create email template"""
    try:
        # Check if template with same name exists
        existing = await templates_collection.find_one({
            "name": template_data.name,
            "user_id": user["id"]
        })
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Template with this name already exists"
            )
        
        template = {
            "name": template_data.name,
            "subject": template_data.subject,
            "html_content": template_data.html_content,
            "text_content": template_data.text_content,
            "category": template_data.category,
            "variables": template_data.variables,
            "is_active": template_data.is_active,
            "user_id": user["id"],
            "user_email": user["email"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await templates_collection.insert_one(template)
        
        return {
            "success": True,
            "message": "Email template created successfully",
            "template_id": str(result.inserted_id),
            "template_name": template_data.name
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create email template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create email template: {str(e)}"
        )

@router.get("/templates")
async def get_email_templates(
    category: Optional[str] = None,
    active_only: bool = True,
    limit: int = 50,
    skip: int = 0,
    user: Dict = Depends(get_current_user)
):
    """Get email templates"""
    try:
        query = {"user_id": user["id"]}
        if active_only:
            query["is_active"] = True
        if category:
            query["category"] = category
        
        cursor = templates_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        templates = []
        async for template in cursor:
            templates.append({
                "id": str(template["_id"]),
                "name": template["name"],
                "subject": template["subject"],
                "category": template.get("category"),
                "variables": template.get("variables", []),
                "is_active": template.get("is_active", True),
                "created_at": template["created_at"],
                "updated_at": template.get("updated_at"),
                "usage_count": await emails_collection.count_documents({
                    "template_id": str(template["_id"]),
                    "user_id": user["id"]
                })
            })
        
        total = await templates_collection.count_documents(query)
        
        return {
            "success": True,
            "templates": templates,
            "total": total,
            "limit": limit,
            "skip": skip
        }
    
    except Exception as e:
        logger.error(f"Failed to get email templates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get email templates: {str(e)}"
        )

@router.get("/templates/{template_id}")
async def get_email_template(
    template_id: str,
    user: Dict = Depends(get_current_user)
):
    """Get specific email template"""
    try:
        template = await templates_collection.find_one({
            "_id": ObjectId(template_id),
            "user_id": user["id"]
        })
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
        
        return {
            "success": True,
            "template": {
                "id": str(template["_id"]),
                "name": template["name"],
                "subject": template["subject"],
                "html_content": template["html_content"],
                "text_content": template.get("text_content"),
                "category": template.get("category"),
                "variables": template.get("variables", []),
                "is_active": template.get("is_active", True),
                "created_at": template["created_at"],
                "updated_at": template.get("updated_at")
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get email template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get email template: {str(e)}"
        )

@router.put("/templates/{template_id}")
async def update_email_template(
    template_id: str,
    template_data: EmailTemplateUpdate,
    user: Dict = Depends(get_current_user)
):
    """Update email template"""
    try:
        # Check if template exists
        existing = await templates_collection.find_one({
            "_id": ObjectId(template_id),
            "user_id": user["id"]
        })
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
        
        # Build update fields
        update_fields = {"updated_at": datetime.utcnow()}
        if template_data.name is not None:
            # Check for duplicate name
            duplicate = await templates_collection.find_one({
                "name": template_data.name,
                "user_id": user["id"],
                "_id": {"$ne": ObjectId(template_id)}
            })
            
            if duplicate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Template with this name already exists"
                )
            update_fields["name"] = template_data.name
        
        if template_data.subject is not None:
            update_fields["subject"] = template_data.subject
        if template_data.html_content is not None:
            update_fields["html_content"] = template_data.html_content
        if template_data.text_content is not None:
            update_fields["text_content"] = template_data.text_content
        if template_data.category is not None:
            update_fields["category"] = template_data.category
        if template_data.variables is not None:
            update_fields["variables"] = template_data.variables
        if template_data.is_active is not None:
            update_fields["is_active"] = template_data.is_active
        
        await templates_collection.update_one(
            {"_id": ObjectId(template_id)},
            {"$set": update_fields}
        )
        
        return {
            "success": True,
            "message": "Email template updated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update email template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update email template: {str(e)}"
        )

@router.delete("/templates/{template_id}")
async def delete_email_template(
    template_id: str,
    user: Dict = Depends(get_current_user)
):
    """Delete email template"""
    try:
        result = await templates_collection.delete_one({
            "_id": ObjectId(template_id),
            "user_id": user["id"]
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email template not found"
            )
        
        return {
            "success": True,
            "message": "Email template deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete email template: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete email template: {str(e)}"
        )

@router.get("/stats")
async def get_email_statistics(
    stats_request: EmailStatsRequest = Depends(),
    user: Dict = Depends(get_current_user)
):
    """Get email statistics and analytics"""
    try:
        query = {"user_id": user["id"]}
        
        if stats_request.start_date:
            query["created_at"] = {"$gte": stats_request.start_date}
        if stats_request.end_date:
            if "created_at" in query:
                query["created_at"]["$lte"] = stats_request.end_date
            else:
                query["created_at"] = {"$lte": stats_request.end_date}
        if stats_request.template_id:
            query["template_id"] = stats_request.template_id
        if stats_request.status:
            query["status"] = stats_request.status
        
        # Get basic stats
        total_emails = await emails_collection.count_documents(query)
        
        # Get status distribution
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        
        cursor = emails_collection.aggregate(pipeline)
        status_distribution = {}
        async for doc in cursor:
            status_distribution[doc["_id"]] = doc["count"]
        
        # Get daily sending stats
        daily_pipeline = [
            {"$match": query},
            {"$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1},
                "sent_count": {
                    "$sum": {"$cond": [{"$eq": ["$status", "sent"]}, 1, 0]}
                }
            }},
            {"$sort": {"_id": 1}}
        ]
        
        daily_cursor = emails_collection.aggregate(daily_pipeline)
        daily_stats = []
        async for doc in daily_cursor:
            daily_stats.append({
                "date": doc["_id"],
                "total": doc["count"],
                "sent": doc.get("sent_count", 0)
            })
        
        # Get template usage
        template_pipeline = [
            {"$match": {
                **query,
                "template_id": {"$exists": True, "$ne": None}
            }},
            {"$group": {
                "_id": "$template_id",
                "count": {"$sum": 1},
                "sent_count": {
                    "$sum": {"$cond": [{"$eq": ["$status", "sent"]}, 1, 0]}
                }
            }},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        
        template_cursor = emails_collection.aggregate(template_pipeline)
        template_usage = []
        async for doc in template_cursor:
            # Get template name
            template = await templates_collection.find_one({
                "_id": ObjectId(doc["_id"])
            })
            template_name = template["name"] if template else "Unknown Template"
            
            template_usage.append({
                "template_id": doc["_id"],
                "template_name": template_name,
                "total": doc["count"],
                "sent": doc.get("sent_count", 0),
                "success_rate": round((doc.get("sent_count", 0) / doc["count"]) * 100, 1)
            })
        
        return {
            "success": True,
            "statistics": {
                "total_emails": total_emails,
                "status_distribution": status_distribution,
                "daily_stats": daily_stats,
                "template_usage": template_usage,
                "date_range": {
                    "start": stats_request.start_date,
                    "end": stats_request.end_date
                }
            }
        }
    
    except Exception as e:
        logger.error(f"Failed to get email statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get email statistics: {str(e)}"
        )

@router.get("/analytics/{email_id}")
async def get_email_analytics(
    email_id: str,
    user: Dict = Depends(get_current_user)
):
    """Get detailed analytics for a specific email"""
    try:
        # Get email record
        email = await emails_collection.find_one({
            "email_id": email_id,
            "user_id": user["id"]
        })
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found"
            )
        
        # Get analytics record
        analytics = await email_analytics_collection.find_one({
            "email_id": email_id
        })
        
        return {
            "success": True,
            "email": {
                "email_id": email["email_id"],
                "to_email": email["to_email"],
                "to_name": email.get("to_name"),
                "subject": email["subject"],
                "status": email["status"],
                "created_at": email["created_at"],
                "sent_at": email.get("sent_at"),
                "error_message": email.get("error_message")
            },
            "analytics": {
                "opened_at": analytics.get("opened_at") if analytics else None,
                "clicked_at": analytics.get("clicked_at") if analytics else None,
                "opened_count": analytics.get("opened_count", 0) if analytics else 0,
                "clicked_count": analytics.get("clicked_count", 0) if analytics else 0,
                "bounce_reason": analytics.get("bounce_reason") if analytics else None
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get email analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get email analytics: {str(e)}"
        )

@router.get("/batch/{batch_id}")
async def get_batch_status(
    batch_id: str,
    user: Dict = Depends(get_current_user)
):
    """Get status of a bulk email batch"""
    try:
        batch = await emails_collection.find_one({
            "batch_id": batch_id,
            "user_id": user["id"]
        })
        
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found"
            )
        
        # Get all emails in this batch
        cursor = emails_collection.find({
            "batch_id": batch_id,
            "user_id": user["id"]
        })
        
        emails = []
        status_counts = {}
        async for email in cursor:
            emails.append({
                "email_id": email["email_id"],
                "to_email": email["to_email"],
                "to_name": email.get("to_name"),
                "status": email["status"],
                "sent_at": email.get("sent_at"),
                "error_message": email.get("error_message")
            })
            
            # Count statuses
            status = email["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "success": True,
            "batch": {
                "batch_id": batch_id,
                "subject": batch["subject"],
                "recipient_count": batch.get("recipient_count", 0),
                "status": batch["status"],
                "created_at": batch["created_at"],
                "completed_at": batch.get("completed_at"),
                "success_count": batch.get("success_count", 0),
                "failed_count": batch.get("failed_count", 0)
            },
            "emails": emails,
            "status_counts": status_counts
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get batch status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get batch status: {str(e)}"
        )

# ==================== BACKGROUND TASKS ====================

async def _send_and_update_email(
    email_id: str,
    to_email: str,
    to_name: Optional[str],
    subject: str,
    text_body: Optional[str],
    html_body: Optional[str],
    attachments: Optional[List[EmailAttachment]]
):
    """Background task to send email and update status"""
    try:
        # Update status to sending
        await emails_collection.update_one(
            {"email_id": email_id},
            {"$set": {"status": EmailStatus.SENDING}}
        )
        
        # Send email
        result = await email_service.send_single_email(
            to_email=to_email,
            to_name=to_name,
            subject=subject,
            text_body=text_body,
            html_body=html_body,
            attachments=attachments
        )
        
        # Update email record
        await emails_collection.update_one(
            {"email_id": email_id},
            {"$set": {
                "status": result["status"],
                "sent_at": result.get("sent_at"),
                "error_message": result.get("error_message")
            }}
        )
        
        # Update analytics
        if result["status"] == EmailStatus.SENT:
            await email_analytics_collection.update_one(
                {"email_id": email_id},
                {"$set": {"status": EmailStatus.SENT}}
            )
        else:
            await email_analytics_collection.update_one(
                {"email_id": email_id},
                {"$set": {
                    "status": EmailStatus.FAILED,
                    "bounce_reason": result.get("error_message")
                }}
            )
        
    except Exception as e:
        logger.error(f"Background email sending failed for {email_id}: {str(e)}")
        
        # Update with error
        await emails_collection.update_one(
            {"email_id": email_id},
            {"$set": {
                "status": EmailStatus.FAILED,
                "error_message": str(e)
            }}
        )

async def _send_bulk_emails_background(
    batch_id: str,
    recipients: List[EmailRecipient],
    subject: str,
    text_body: Optional[str],
    html_body: Optional[str],
    attachments: Optional[List[EmailAttachment]],
    batch_size: int,
    template_id: Optional[str],
    template_variables: Dict[str, Any]
):
    """Background task to send bulk emails"""
    try:
        # Update batch status to sending
        await emails_collection.update_one(
            {"batch_id": batch_id},
            {"$set": {"status": EmailStatus.SENDING}}
        )
        
        # Get template if exists
        html_template = html_body
        text_template = text_body
        
        if template_id:
            template = await email_service.get_template(template_id)
            if template:
                html_template = template["html_content"]
                text_template = template.get("text_content")
        
        # Send emails in batches
        success_count = 0
        failed_count = 0
        
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i:i + batch_size]
            batch_tasks = []
            
            for recipient in batch:
                # Prepare email content for this recipient
                recipient_html_body = html_body
                recipient_text_body = text_body
                
                if template_id and template:
                    # Merge variables
                    all_variables = {**template_variables}
                    if recipient.variables:
                        all_variables.update(recipient.variables)
                    
                    recipient_html_body = email_service.render_template(
                        html_template,
                        all_variables
                    )
                    
                    if text_template:
                        recipient_text_body = email_service.render_template(
                            text_template,
                            all_variables
                        )
                
                # Create task for this email
                task = _send_single_email_in_batch(
                    batch_id=batch_id,
                    recipient=recipient,
                    subject=subject,
                    text_body=recipient_text_body,
                    html_body=recipient_html_body,
                    attachments=attachments
                )
                batch_tasks.append(task)
            
            # Execute batch
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Process results
            for result in batch_results:
                if isinstance(result, Exception):
                    failed_count += 1
                else:
                    if result.get("status") == EmailStatus.SENT:
                        success_count += 1
                    else:
                        failed_count += 1
            
            # Update batch progress
            await emails_collection.update_one(
                {"batch_id": batch_id},
                {"$set": {
                    "success_count": success_count,
                    "failed_count": failed_count
                }}
            )
            
            # Small delay between batches
            if i + batch_size < len(recipients):
                await asyncio.sleep(1)
        
        # Update batch completion
        await emails_collection.update_one(
            {"batch_id": batch_id},
            {"$set": {
                "status": EmailStatus.SENT,
                "completed_at": datetime.utcnow(),
                "success_count": success_count,
                "failed_count": failed_count
            }}
        )
        
        logger.info(f"Bulk email batch {batch_id} completed: {success_count} sent, {failed_count} failed")
        
    except Exception as e:
        logger.error(f"Background bulk email sending failed for batch {batch_id}: {str(e)}")
        
        # Update batch with error
        await emails_collection.update_one(
            {"batch_id": batch_id},
            {"$set": {
                "status": EmailStatus.FAILED,
                "error_message": str(e),
                "completed_at": datetime.utcnow()
            }}
        )

async def _send_single_email_in_batch(
    batch_id: str,
    recipient: EmailRecipient,
    subject: str,
    text_body: Optional[str],
    html_body: Optional[str],
    attachments: Optional[List[EmailAttachment]]
) -> Dict[str, Any]:
    """Send single email as part of a batch"""
    try:
        # Get email record
        email_record = await emails_collection.find_one({
            "batch_id": batch_id,
            "to_email": recipient.email
        })
        
        if not email_record:
            return {"status": EmailStatus.FAILED, "error_message": "Email record not found"}
        
        email_id = email_record["email_id"]
        
        # Update status to sending
        await emails_collection.update_one(
            {"email_id": email_id},
            {"$set": {"status": EmailStatus.SENDING}}
        )
        
        # Send email
        result = await email_service.send_single_email(
            to_email=recipient.email,
            to_name=recipient.name,
            subject=subject,
            text_body=text_body,
            html_body=html_body,
            attachments=attachments
        )
        
        # Update email record
        await emails_collection.update_one(
            {"email_id": email_id},
            {"$set": {
                "status": result["status"],
                "sent_at": result.get("sent_at"),
                "error_message": result.get("error_message")
            }}
        )
        
        # Update analytics
        if result["status"] == EmailStatus.SENT:
            await email_analytics_collection.update_one(
                {"email_id": email_id},
                {"$set": {"status": EmailStatus.SENT}}
            )
        else:
            await email_analytics_collection.update_one(
                {"email_id": email_id},
                {"$set": {
                    "status": EmailStatus.FAILED,
                    "bounce_reason": result.get("error_message")
                }}
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to send email to {recipient.email} in batch {batch_id}: {str(e)}")
        
        # Update with error
        if 'email_id' in locals():
            await emails_collection.update_one(
                {"email_id": email_id},
                {"$set": {
                    "status": EmailStatus.FAILED,
                    "error_message": str(e)
                }}
            )
        
        return {"status": EmailStatus.FAILED, "error_message": str(e)}

# ==================== TRACKING ENDPOINTS ====================

@router.get("/track/open/{email_id}")
async def track_email_open(email_id: str):
    """Track when an email is opened (called from email image pixel)"""
    try:
        # Update analytics
        result = await email_analytics_collection.update_one(
            {"email_id": email_id},
            {
                "$inc": {"opened_count": 1},
                "$set": {"opened_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            # Also update email status if not already delivered
            await emails_collection.update_one(
                {"email_id": email_id},
                {"$set": {"status": EmailStatus.OPENED}}
            )
        
        # Return a 1x1 transparent GIF
        from fastapi.responses import Response
        gif_data = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
        return Response(content=gif_data, media_type="image/gif")
    
    except Exception:
        # Return transparent GIF even on error
        gif_data = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
        return Response(content=gif_data, media_type="image/gif")

@router.get("/track/click/{email_id}")
async def track_email_click(email_id: str, redirect_url: str):
    """Track when a link in email is clicked"""
    try:
        # Update analytics
        await email_analytics_collection.update_one(
            {"email_id": email_id},
            {
                "$inc": {"clicked_count": 1},
                "$set": {"clicked_at": datetime.utcnow()}
            }
        )
        
        # Update email status
        await emails_collection.update_one(
            {"email_id": email_id},
            {"$set": {"status": EmailStatus.CLICKED}}
        )
        
        # Redirect to actual URL
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=redirect_url)
    
    except Exception:
        # Still redirect even if tracking fails
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=redirect_url)

# ==================== WEBHOOK FOR BOUNCE TRACKING ====================

@router.post("/webhook/bounce")
async def email_bounce_webhook(payload: Dict[str, Any]):
    """Webhook for email bounce notifications from email service provider"""
    try:
        # Parse bounce notification (this will vary by provider)
        # Example for SendGrid/Postmark/Mailgun webhook format
        
        for event in payload.get("events", []):
            email_id = event.get("email_id") or event.get("metadata", {}).get("email_id")
            bounce_type = event.get("type", "").lower()
            
            if email_id and bounce_type in ["bounce", "spam", "blocked"]:
                # Update email status
                await emails_collection.update_one(
                    {"email_id": email_id},
                    {"$set": {
                        "status": EmailStatus.BOUNCED,
                        "bounce_reason": event.get("reason") or event.get("description")
                    }}
                )
                
                # Update analytics
                await email_analytics_collection.update_one(
                    {"email_id": email_id},
                    {"$set": {
                        "status": EmailStatus.BOUNCED,
                        "bounce_reason": event.get("reason") or event.get("description")
                    }}
                )
        
        return {"success": True, "message": "Webhook processed"}
    
    except Exception as e:
        logger.error(f"Error processing bounce webhook: {str(e)}")
        return {"success": False, "error": str(e)}

# ==================== UTILITY FUNCTIONS ====================

def validate_smtp_config():
    """Validate SMTP configuration on startup"""
    required_configs = ["host", "port", "username", "password", "sender_email"]
    missing_configs = [config for config in required_configs if not SMTP_CONFIG.get(config)]
    
    if missing_configs:
        logger.warning(f"SMTP configuration missing: {missing_configs}")
        return False
    
    return True

# Initialize and validate
if not validate_smtp_config():
    logger.error("SMTP configuration is incomplete. Email functionality may not work.")