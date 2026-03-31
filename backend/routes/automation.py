# backend/automation.py
from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, time, date
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import requests
import os
from dotenv import load_dotenv
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json
import csv
import io
from fastapi.responses import JSONResponse
import aiofiles
from pathlib import Path
import uuid
import logging

# Import authentication
from auth.routes import get_current_user, oauth2_scheme
from database import db

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/automation", tags=["automation"])

# Database collections
contacts_collection = db["contacts"]
groups_collection = db["groups"]
templates_collection = db["templates"]
campaigns_collection = db["campaigns"]
attachments_collection = db["attachments"]
media_collection = db["media"]
usage_stats_collection = db["usage_stats"]

# --------- Request Models ---------
class ContactBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    tags: List[str] = []
    groups: List[str] = []
    custom_fields: Dict[str, Any] = {}
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#667eea"
    is_active: bool = True

class GroupCreate(GroupBase):
    pass

class TemplateBase(BaseModel):
    name: str
    channel: str  # email, whatsapp, sms
    subject: Optional[str] = None
    content: str
    category: Optional[str] = "general"
    variables: List[str] = []
    is_active: bool = True

class TemplateCreate(TemplateBase):
    pass

class EmailRequest(BaseModel):
    recipients: List[EmailStr]
    subject: str
    message: str
    template_id: Optional[str] = None
    attachments: List[str] = []
    is_bulk: bool = False
    schedule_time: Optional[datetime] = None
    track_opens: bool = True
    track_clicks: bool = True
    daily_limit: Optional[int] = None
    messages_per_minute: Optional[int] = 10

class ImportContactsRequest(BaseModel):
    group_id: Optional[str] = None
    update_existing: bool = False

# --------- Subscription Plan Limits ---------
PLAN_LIMITS = {
    "free": {
        "daily_emails": 50,
        "max_contacts": 100,
        "max_groups": 5,
        "can_attach_files": False,
        "can_schedule": False,
        "can_bulk_send": False,
        "can_whatsapp": False,
        "can_sms": False,
        "api_access": False
    },
    "free_trial": {
        "daily_emails": 200,
        "max_contacts": 500,
        "max_groups": 10,
        "can_attach_files": True,
        "can_schedule": True,
        "can_bulk_send": True,
        "can_whatsapp": False,
        "can_sms": False,
        "api_access": False,
        "trial_days": 15
    },
    "basic": {
        "daily_emails": 1000,
        "max_contacts": 5000,
        "max_groups": 50,
        "can_attach_files": True,
        "can_schedule": True,
        "can_bulk_send": True,
        "can_whatsapp": False,
        "can_sms": False,
        "api_access": False
    },
    "pro": {
        "daily_emails": 5000,
        "max_contacts": 20000,
        "max_groups": 100,
        "can_attach_files": True,
        "can_schedule": True,
        "can_bulk_send": True,
        "can_whatsapp": True,
        "can_sms": True,
        "api_access": True
    },
    "enterprise": {
        "daily_emails": 50000,
        "max_contacts": 100000,
        "max_groups": 500,
        "can_attach_files": True,
        "can_schedule": True,
        "can_bulk_send": True,
        "can_whatsapp": True,
        "can_sms": True,
        "api_access": True,
        "dedicated_support": True
    }
}

# --------- Helper Functions ---------

async def get_current_user_from_token(token: str = Depends(oauth2_scheme)):
    """Enhanced get_current_user that handles both user objects and IDs"""
    try:
        # Use the existing get_current_user function
        current_user = await get_current_user(token)
        
        # If current_user is an integer (user ID), fetch the full user object
        if isinstance(current_user, int):
            from auth.routes import users_collection
            user = await users_collection.find_one({"_id": ObjectId(str(current_user))})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            user["id"] = str(user["_id"])
            return user
        
        # If it's already a dict with _id, convert to id
        if isinstance(current_user, dict) and "_id" in current_user:
            current_user["id"] = str(current_user["_id"])
        
        return current_user
    except Exception as e:
        logger.error(f"Error in get_current_user_from_token: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_user_id(current_user: Dict) -> str:
    """Get user ID from current user object"""
    if not current_user:
        return ""
    
    # Try multiple possible ID fields
    if isinstance(current_user, dict):
        if "id" in current_user:
            return str(current_user["id"])
        elif "_id" in current_user:
            return str(current_user["_id"])
        elif "user_id" in current_user:
            return str(current_user["user_id"])
    
    # If it's already a string or integer, convert to string
    if isinstance(current_user, (str, int)):
        return str(current_user)
    
    return ""

def get_user_subscription_plan(user: Dict) -> str:
    """Extract subscription plan from user object"""
    if not user:
        return "free"
    
    # Check if subscription data exists in user object
    if user.get("subscription") and isinstance(user["subscription"], dict):
        return user["subscription"].get("plan", "free")
    
    # Check for subscription data from auth module
    if user.get("current_plan"):
        return user.get("current_plan", "free")
    
    # Default to free
    return "free"

def get_user_subscription_status(user: Dict) -> Dict:
    """Get user's full subscription status"""
    if not user:
        return {
            "plan": "free",
            "limits": PLAN_LIMITS["free"],
            "is_trial": False,
            "remaining_days": 0,
            "is_active": False,
            "current_period_start": None,
            "current_period_end": None
        }
    
    plan = get_user_subscription_plan(user)
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    # Check if user is in trial
    is_trial = plan == "free_trial"
    if is_trial and user.get("is_trial_active"):
        trial_end = user.get("current_period_end")
        if trial_end:
            try:
                if isinstance(trial_end, str):
                    trial_end = datetime.fromisoformat(trial_end.replace('Z', '+00:00'))
                remaining_days = max(0, (trial_end - datetime.utcnow()).days)
            except:
                remaining_days = 0
        else:
            remaining_days = 0
    else:
        remaining_days = 0
    
    return {
        "plan": plan,
        "limits": limits,
        "is_trial": is_trial,
        "remaining_days": remaining_days,
        "is_active": user.get("has_active_subscription", False) or is_trial,
        "current_period_start": user.get("current_period_start"),
        "current_period_end": user.get("current_period_end")
    }

def check_plan_permission(user: Dict, feature: str) -> bool:
    """Check if user's plan allows a specific feature"""
    plan = get_user_subscription_plan(user)
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    return limits.get(feature, False)

def get_plan_limits(user: Dict) -> Dict:
    """Get user's plan limits"""
    plan = get_user_subscription_plan(user)
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])

async def check_daily_limit(user: Dict, channel: str = "email") -> Dict:
    """Check if user has reached daily sending limit"""
    plan_limits = get_plan_limits(user)
    daily_limit = plan_limits.get(f"daily_{channel}s", 50)
    
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    
    user_id = get_user_id(user)
    if not user_id:
        return {
            "sent": 0,
            "limit": daily_limit,
            "remaining": daily_limit,
            "can_send": daily_limit > 0
        }
    
    # Use string for user_id
    user_id_str = str(user_id)
    
    # FIXED: Use await for async count_documents
    sent_today = await campaigns_collection.count_documents({
        "owner_id": user_id_str,
        "channel": channel,
        "status": {"$in": ["sent", "sending"]},
        "created_at": {"$gte": start_of_day}
    })
    
    remaining = max(0, daily_limit - sent_today)
    
    return {
        "sent": sent_today,
        "limit": daily_limit,
        "remaining": remaining,
        "can_send": remaining > 0
    }

async def send_email_smtp(recipient: str, subject: str, message: str, attachments: List[str] = None) -> bool:
    """Send email with SMTP"""
    try:
        msg = MIMEMultipart()
        msg["From"] = os.getenv("SMTP_USER", "noreply@example.com")
        msg["To"] = recipient
        msg["Subject"] = subject
        
        # Add HTML/plain text
        msg.attach(MIMEText(message, "html"))
        
        # Add attachments if any
        if attachments:
            for attachment_id in attachments:
                attachment = await attachments_collection.find_one({"_id": ObjectId(attachment_id)})
                if attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment["content"])
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename={attachment["filename"]}'
                    )
                    msg.attach(part)
        
        # Send email
        with smtplib.SMTP(
            os.getenv("SMTP_SERVER", "smtp.gmail.com"),
            int(os.getenv("SMTP_PORT", 587))
        ) as server:
            server.starttls()
            server.login(
                os.getenv("SMTP_USER"),
                os.getenv("SMTP_PASSWORD")
            )
            server.send_message(msg)
        
        return True
    except Exception as e:
        logger.error(f"Error sending email to {recipient}: {e}")
        return False

async def process_bulk_send(campaign_id: str, recipients: List[str], subject: str, message: str, 
                           attachments: List[str] = None, daily_limit: int = 500, 
                           messages_per_minute: int = 10, user: Dict = None):
    """Process bulk email sending with rate limiting"""
    try:
        user_id = get_user_id(user)
        
        # Update campaign status
        await campaigns_collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {"status": "sending", "started_at": datetime.utcnow()}}
        )
        
        sent_count = 0
        failed_count = 0
        
        # Rate limiting
        batch_size = min(messages_per_minute, 50)
        
        for i in range(0, len(recipients), batch_size):
            batch = recipients[i:i + batch_size]
            batch_tasks = []
            
            for recipient in batch:
                if sent_count >= daily_limit:
                    break
                
                # Add unsubscribe link with user tracking
                user_message = message
                unsubscribe_link = f"{os.getenv('APP_URL', 'https://yourapp.com')}/unsubscribe?user={user_id}&email={recipient}"
                user_message += f"\n\n---\nTo unsubscribe, click here: {unsubscribe_link}"
                
                task = send_email_smtp(recipient, subject, user_message, attachments)
                batch_tasks.append(task)
            
            # Execute batch
            if batch_tasks:
                results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for recipient, success in zip(batch, results):
                    if success and not isinstance(success, Exception):
                        sent_count += 1
                        # Track successful send
                        await track_email_send(campaign_id, recipient, user_id, "sent")
                    else:
                        failed_count += 1
                        error_msg = str(success) if isinstance(success, Exception) else "Unknown error"
                        await track_email_send(campaign_id, recipient, user_id, "failed", error_msg)
                
                # Rate limiting delay
                if i + batch_size < len(recipients) and sent_count < daily_limit:
                    await asyncio.sleep(60)  # Wait 1 minute before next batch
        
        # Update campaign completion
        await campaigns_collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {
                "$set": {
                    "status": "sent" if sent_count > 0 else "failed",
                    "completed_at": datetime.utcnow(),
                    "sent_count": sent_count,
                    "failed_count": failed_count
                }
            }
        )
        
        # Send notification to user
        if user and sent_count > 0:
            await send_campaign_completion_notification(user, campaign_id, sent_count, failed_count)
        
        return sent_count, failed_count
        
    except Exception as e:
        await campaigns_collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {"status": "failed", "error": str(e)}}
        )
        raise

async def track_email_send(campaign_id: str, recipient: str, user_id: str, status: str, error: str = None):
    """Track individual email sends for analytics"""
    try:
        tracking_collection = db["email_tracking"]
        
        tracking_data = {
            "campaign_id": campaign_id,
            "recipient": recipient,
            "user_id": user_id,
            "status": status,
            "error": error,
            "sent_at": datetime.utcnow(),
            "opened_at": None,
            "clicked_at": None
        }
        
        await tracking_collection.insert_one(tracking_data)
    except Exception as e:
        logger.error(f"Error tracking email send: {e}")

async def send_campaign_completion_notification(user: Dict, campaign_id: str, sent_count: int, failed_count: int):
    """Send notification to user when campaign completes"""
    try:
        # Get campaign details
        campaign = await campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return
        
        # Calculate success rate
        total = sent_count + failed_count
        success_rate = (sent_count / total * 100) if total > 0 else 0
        
        # Send email notification
        subject = f"Campaign '{campaign.get('subject', 'N/A')[:50]}...' Completed"
        message = f"""
        <html>
        <body>
            <h2>Your Email Campaign Has Been Completed!</h2>
            
            <p><strong>Campaign:</strong> {campaign.get('subject', 'N/A')}</p>
            <p><strong>Total Sent:</strong> {sent_count} emails</p>
            <p><strong>Failed:</strong> {failed_count} emails</p>
            <p><strong>Success Rate:</strong> {success_rate:.1f}%</p>
            <p><strong>Completed At:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
            
            <p>You can view detailed analytics in your dashboard.</p>
            
            <hr>
            <p>Best regards,<br>Your Automation Team</p>
        </body>
        </html>
        """
        
        user_email = user.get("email")
        if user_email:
            await send_email_smtp(user_email, subject, message)
        
    except Exception as e:
        logger.error(f"Error sending campaign notification: {e}")

async def log_user_activity(user_id: str, action: str, resource_type: str, resource_id: str, details: Dict = None):
    """Log user activity for audit trail"""
    try:
        activity_collection = db["user_activities"]
        
        activity = {
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details or {},
            "timestamp": datetime.utcnow()
        }
        
        await activity_collection.insert_one(activity)
    except Exception as e:
        logger.error(f"Error logging activity: {e}")

# --------- Middleware for Brand Users ---------

async def verify_brand_user(current_user: Dict):
    """Verify that the current user is a brand"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_role = current_user.get("role") if isinstance(current_user, dict) else None
    if user_role != "brand":
        raise HTTPException(
            status_code=403,
            detail="This feature is only available for brand users"
        )
    return current_user

# --------- API Routes with User Authentication ---------

@router.get("/user-info")
async def get_user_info(current_user = Depends(get_current_user_from_token)):
    """Get user information for automation dashboard"""
    try:
        # Ensure current_user is a dictionary
        if isinstance(current_user, (int, str)):
            # Fetch user from database
            from auth.routes import users_collection
            user_doc = await users_collection.find_one({"_id": ObjectId(str(current_user))})
            if not user_doc:
                raise HTTPException(status_code=401, detail="User not found")
            user_doc["id"] = str(user_doc["_id"])
            current_user = user_doc
        
        # Now current_user should be a dict
        if not isinstance(current_user, dict):
            raise HTTPException(status_code=401, detail="Invalid user data")
        
        # Get user ID as string
        user_id = get_user_id(current_user)
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID not found")
        
        # Ensure user_id is string
        user_id_str = str(user_id)
        
        # Get subscription status
        subscription_status = get_user_subscription_status(current_user)
        
        # Get usage stats
        email_usage = await check_daily_limit(current_user, "email")
        
        # Get user's stats - FIXED: Use await for async count_documents
        owner_query = {"owner_id": user_id_str}
        
        total_contacts = await contacts_collection.count_documents(owner_query)
        total_groups = await groups_collection.count_documents(owner_query)
        total_templates = await templates_collection.count_documents(owner_query)
        total_campaigns = await campaigns_collection.count_documents(owner_query)
        
        # Determine if user can use automation
        can_use_automation = current_user.get("role") == "brand" and subscription_status["is_active"]
        
        # Get plan limits
        plan_limits = subscription_status["limits"]
        
        # Build permissions
        permissions = {
            "can_use_automation": can_use_automation,
            "can_send_emails": plan_limits.get("daily_emails", 0) > 0,
            "can_attach_files": plan_limits.get("can_attach_files", False),
            "can_schedule": plan_limits.get("can_schedule", False),
            "can_bulk_send": plan_limits.get("can_bulk_send", False),
            "can_whatsapp": plan_limits.get("can_whatsapp", False),
            "can_sms": plan_limits.get("can_sms", False)
        }
        
        # Build usage data
        usage_data = {
            "email": email_usage,
            "contacts": {
                "total": total_contacts,
                "limit": plan_limits.get("max_contacts", 100)
            },
            "groups": {
                "total": total_groups,
                "limit": plan_limits.get("max_groups", 5)
            },
            "templates": total_templates,
            "campaigns": total_campaigns
        }
        
        # Build user data
        user_data = {
            "id": user_id,
            "email": current_user.get("email", ""),
            "username": current_user.get("username", ""),
            "role": current_user.get("role", ""),
            "profile_picture": current_user.get("profile_picture"),
            "brand_id": current_user.get("brand_id"),
            "brand_profile": current_user.get("brand_profile")
        }
        
        return {
            "success": True,
            "user": user_data,
            "subscription": subscription_status,
            "usage": usage_data,
            "permissions": permissions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get user information")

@router.get("/contacts")
async def get_contacts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    group_id: Optional[str] = None,
    tags: Optional[str] = None,
    current_user = Depends(get_current_user_from_token)
):
    """Get contacts with filtering (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        user_id = get_user_id(current_user)
        
        # Build query with owner filter
        query = {"owner_id": user_id}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}},
                {"notes": {"$regex": search, "$options": "i"}}
            ]
        
        if group_id:
            # Verify group belongs to user
            group = await groups_collection.find_one({
                "_id": ObjectId(group_id),
                "owner_id": user_id
            })
            if not group:
                raise HTTPException(
                    status_code=404,
                    detail="Group not found"
                )
            query["groups"] = group_id
        
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
            query["tags"] = {"$all": tag_list}
        
        # Get total count - FIXED: Use await
        total = await contacts_collection.count_documents(query)
        
        # Get contacts with pagination
        cursor = contacts_collection.find(query).skip(skip).limit(limit)
        contacts_list = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string and format response
        formatted_contacts = []
        for contact in contacts_list:
            contact_data = dict(contact)
            contact_data["id"] = str(contact_data.pop("_id"))
            
            # Convert group IDs to strings
            if "groups" in contact_data:
                contact_data["groups"] = [str(g) if isinstance(g, ObjectId) else g for g in contact_data["groups"]]
            
            formatted_contacts.append(contact_data)
        
        return {
            "success": True,
            "contacts": formatted_contacts,
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": (skip + limit) < total
            },
            "user_info": {
                "id": user_id,
                "email": current_user.get("email") if isinstance(current_user, dict) else ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting contacts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get contacts")

# Add other routes similarly (Groups, Templates, etc.)

# ... [Rest of the routes remain similar with async/await fixes]

@router.post("/groups")
async def create_group(
    group: GroupCreate, 
    current_user = Depends(get_current_user_from_token)
):
    """Create a new contact group (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        # Check subscription
        subscription_status = get_user_subscription_status(current_user)
        if not subscription_status["is_active"]:
            raise HTTPException(
                status_code=403,
                detail="Active subscription required to create groups"
            )
        
        user_id = get_user_id(current_user)
        
        # Check plan limits
        plan_limits = subscription_status["limits"]
        total_groups = await groups_collection.count_documents({"owner_id": user_id})
        
        if total_groups >= plan_limits.get("max_groups", 5):
            raise HTTPException(
                status_code=400,
                detail=f"Group limit reached. Your plan allows {plan_limits['max_groups']} groups."
            )
        
        # Check if group name already exists for this user
        existing = await groups_collection.find_one({
            "name": group.name,
            "owner_id": user_id
        })
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Group with this name already exists"
            )
        
        # Create group with owner info
        group_dict = group.dict()
        group_dict["owner_id"] = user_id
        group_dict["owner_email"] = current_user.get("email") if isinstance(current_user, dict) else ""
        group_dict["owner_username"] = current_user.get("username") if isinstance(current_user, dict) else ""
        group_dict["created_at"] = datetime.utcnow()
        group_dict["updated_at"] = datetime.utcnow()
        group_dict["member_count"] = 0
        
        result = await groups_collection.insert_one(group_dict)
        group_id = str(result.inserted_id)
        
        # Log activity
        await log_user_activity(
            user_id=user_id,
            action="group_created",
            resource_type="group",
            resource_id=group_id,
            details={"name": group.name}
        )
        
        return {
            "success": True,
            "message": "Group created successfully",
            "group_id": group_id,
            "group": {
                "id": group_id,
                **group_dict
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating group: {e}")
        raise HTTPException(status_code=500, detail="Failed to create group")

@router.get("/groups")
async def get_groups(current_user = Depends(get_current_user_from_token)):
    """Get all groups for current user (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        user_id = get_user_id(current_user)
        
        # Get groups
        cursor = groups_collection.find({"owner_id": user_id})
        groups_list = await cursor.to_list(length=100)
        
        # Format response
        formatted_groups = []
        for group in groups_list:
            group_data = dict(group)
            group_data["id"] = str(group_data.pop("_id"))
            formatted_groups.append(group_data)
        
        return {
            "success": True,
            "groups": formatted_groups,
            "total": len(formatted_groups)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting groups: {e}")
        raise HTTPException(status_code=500, detail="Failed to get groups")

@router.post("/templates")
async def create_template(
    template: TemplateCreate, 
    current_user = Depends(get_current_user_from_token)
):
    """Create a new template (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        # Check subscription
        subscription_status = get_user_subscription_status(current_user)
        if not subscription_status["is_active"]:
            raise HTTPException(
                status_code=403,
                detail="Active subscription required to create templates"
            )
        
        user_id = get_user_id(current_user)
        
        # Check if template name already exists for this user
        existing = await templates_collection.find_one({
            "name": template.name,
            "owner_id": user_id
        })
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Template with this name already exists"
            )
        
        # Validate channel based on plan
        if template.channel == "whatsapp" and not subscription_status["limits"].get("can_whatsapp", False):
            raise HTTPException(
                status_code=403,
                detail="WhatsApp templates require a higher subscription plan"
            )
        
        if template.channel == "sms" and not subscription_status["limits"].get("can_sms", False):
            raise HTTPException(
                status_code=403,
                detail="SMS templates require a higher subscription plan"
            )
        
        # Create template with owner info
        template_dict = template.dict()
        template_dict["owner_id"] = user_id
        template_dict["owner_email"] = current_user.get("email") if isinstance(current_user, dict) else ""
        template_dict["owner_username"] = current_user.get("username") if isinstance(current_user, dict) else ""
        template_dict["created_at"] = datetime.utcnow()
        template_dict["updated_at"] = datetime.utcnow()
        template_dict["usage_count"] = 0
        
        result = await templates_collection.insert_one(template_dict)
        template_id = str(result.inserted_id)
        
        # Log activity
        await log_user_activity(
            user_id=user_id,
            action="template_created",
            resource_type="template",
            resource_id=template_id,
            details={"name": template.name, "channel": template.channel}
        )
        
        return {
            "success": True,
            "message": "Template created successfully",
            "template_id": template_id,
            "template": {
                "id": template_id,
                **template_dict
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating template: {e}")
        raise HTTPException(status_code=500, detail="Failed to create template")

@router.get("/templates")
async def get_templates(
    channel: Optional[str] = None, 
    category: Optional[str] = None,
    current_user = Depends(get_current_user_from_token)
):
    """Get templates for current user (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        user_id = get_user_id(current_user)
        
        query = {"owner_id": user_id}
        if channel:
            query["channel"] = channel
        if category:
            query["category"] = category
        
        cursor = templates_collection.find(query)
        templates_list = await cursor.to_list(length=100)
        
        # Format response
        formatted_templates = []
        for template in templates_list:
            template_data = dict(template)
            template_data["id"] = str(template_data.pop("_id"))
            formatted_templates.append(template_data)
        
        return {
            "success": True,
            "templates": formatted_templates,
            "total": len(formatted_templates)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to get templates")

@router.post("/send-email")
async def send_email_campaign(
    request: EmailRequest, 
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user_from_token)
):
    """Send email campaign with user authentication (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        # Check subscription
        subscription_status = get_user_subscription_status(current_user)
        if not subscription_status["is_active"]:
            raise HTTPException(
                status_code=403,
                detail="Active subscription required to send campaigns"
            )
        
        user_id = get_user_id(current_user)
        plan_limits = subscription_status["limits"]
        
        # Check daily limit
        email_usage = await check_daily_limit(current_user, "email")
        if not email_usage["can_send"]:
            raise HTTPException(
                status_code=400,
                detail=f"Daily email limit reached ({email_usage['sent']}/{email_usage['limit']})"
            )
        
        # Check if requested recipients exceed remaining limit
        if len(request.recipients) > email_usage["remaining"]:
            raise HTTPException(
                status_code=400,
                detail=f"Request exceeds daily limit. You can send {email_usage['remaining']} more emails today."
            )
        
        # Check plan features
        if request.is_bulk and not plan_limits.get("can_bulk_send", False):
            raise HTTPException(
                status_code=400,
                detail="Bulk sending not available in your plan. Upgrade to send bulk emails."
            )
        
        if request.schedule_time and not plan_limits.get("can_schedule", False):
            raise HTTPException(
                status_code=400,
                detail="Scheduled sending not available in your plan. Upgrade to schedule emails."
            )
        
        if request.attachments and not plan_limits.get("can_attach_files", False):
            raise HTTPException(
                status_code=400,
                detail="File attachments not available in your plan. Upgrade to attach files."
            )
        
        # Validate attachments belong to user
        if request.attachments:
            for attachment_id in request.attachments:
                attachment = await attachments_collection.find_one({
                    "_id": ObjectId(attachment_id),
                    "owner_id": user_id
                })
                if not attachment:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Attachment {attachment_id} not found or access denied"
                    )
        
        # Use plan's daily limit if not specified
        daily_limit = request.daily_limit or plan_limits.get("daily_emails", 50)
        daily_limit = min(daily_limit, email_usage["remaining"])
        
        # Create campaign record
        campaign_data = {
            "owner_id": user_id,
            "owner_email": current_user.get("email") if isinstance(current_user, dict) else "",
            "owner_username": current_user.get("username") if isinstance(current_user, dict) else "",
            "name": f"Email Campaign {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
            "channel": "email",
            "subject": request.subject,
            "message": request.message,
            "recipients": request.recipients,
            "recipient_count": len(request.recipients),
            "template_id": ObjectId(request.template_id) if request.template_id else None,
            "attachments": request.attachments,
            "is_bulk": request.is_bulk,
            "schedule_time": request.schedule_time,
            "track_opens": request.track_opens,
            "track_clicks": request.track_clicks,
            "daily_limit": daily_limit,
            "messages_per_minute": request.messages_per_minute or 10,
            "status": "scheduled" if request.schedule_time else "queued",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "sent_count": 0,
            "failed_count": 0,
            "opened_count": 0,
            "clicked_count": 0
        }
        
        result = await campaigns_collection.insert_one(campaign_data)
        campaign_id = str(result.inserted_id)
        
        # Log activity
        await log_user_activity(
            user_id=user_id,
            action="campaign_created",
            resource_type="campaign",
            resource_id=campaign_id,
            details={
                "recipients": len(request.recipients),
                "subject": request.subject[:50],
                "scheduled": bool(request.schedule_time),
                "is_bulk": request.is_bulk
            }
        )
        
        # Process sending
        if not request.schedule_time:
            background_tasks.add_task(
                process_bulk_send,
                campaign_id,
                request.recipients,
                request.subject,
                request.message,
                request.attachments,
                daily_limit,
                request.messages_per_minute or 10,
                current_user
            )
        
        return {
            "success": True,
            "message": "Email campaign created successfully",
            "campaign_id": campaign_id,
            "campaign": {
                "id": campaign_id,
                "name": campaign_data["name"],
                "subject": campaign_data["subject"],
                "status": campaign_data["status"],
                "recipient_count": campaign_data["recipient_count"],
                "scheduled": bool(request.schedule_time)
            },
            "user_limits": {
                "plan": subscription_status["plan"],
                "daily_sent": email_usage["sent"],
                "daily_limit": email_usage["limit"],
                "remaining_after_send": max(0, email_usage["remaining"] - len(request.recipients))
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to create email campaign")

@router.post("/attachments")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user_from_token)
):
    """Upload attachment for emails (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        # Check if user can attach files
        subscription_status = get_user_subscription_status(current_user)
        if not subscription_status["limits"].get("can_attach_files", False):
            raise HTTPException(
                status_code=403,
                detail="File attachments not available in your plan. Upgrade to attach files."
            )
        
        user_id = get_user_id(current_user)
        
        # Check file size (max 10MB)
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 10MB limit"
            )
        
        # Check file type
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip', 'application/x-rar-compressed'
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Generate unique filename
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        
        # Save attachment
        attachment = {
            "filename": original_filename,
            "unique_filename": unique_filename,
            "content_type": file.content_type,
            "size": len(content),
            "content": content,
            "owner_id": user_id,
            "owner_email": current_user.get("email") if isinstance(current_user, dict) else "",
            "uploaded_at": datetime.utcnow(),
            "download_url": f"/api/automation/attachments/{unique_filename}"
        }
        
        result = await attachments_collection.insert_one(attachment)
        attachment_id = str(result.inserted_id)
        
        # Log activity
        await log_user_activity(
            user_id=user_id,
            action="attachment_uploaded",
            resource_type="attachment",
            resource_id=attachment_id,
            details={"filename": original_filename, "size": len(content), "type": file.content_type}
        )
        
        return {
            "success": True,
            "message": "Attachment uploaded successfully",
            "attachment": {
                "id": attachment_id,
                "filename": original_filename,
                "unique_filename": unique_filename,
                "content_type": file.content_type,
                "size": len(content),
                "download_url": attachment["download_url"],
                "uploaded_at": attachment["uploaded_at"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading attachment: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload attachment")

@router.post("/contacts/import")
async def import_contacts(
    file: UploadFile = File(...),
    group_id: Optional[str] = Form(None),
    update_existing: bool = Form(False),
    current_user = Depends(get_current_user_from_token)
):
    """Import contacts from CSV (brand users only)"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        # Check subscription
        subscription_status = get_user_subscription_status(current_user)
        if not subscription_status["is_active"]:
            raise HTTPException(
                status_code=403,
                detail="Active subscription required to import contacts"
            )
        
        user_id = get_user_id(current_user)
        plan_limits = subscription_status["limits"]
        
        # Verify group if provided
        if group_id:
            group = await groups_collection.find_one({
                "_id": ObjectId(group_id),
                "owner_id": user_id
            })
            if not group:
                raise HTTPException(
                    status_code=404,
                    detail="Group not found or access denied"
                )
        
        # Check current contact count against limit
        current_count = await contacts_collection.count_documents({"owner_id": user_id})
        max_contacts = plan_limits.get("max_contacts", 100)
        
        if current_count >= max_contacts:
            raise HTTPException(
                status_code=400,
                detail=f"Contact limit reached. Your plan allows {max_contacts} contacts."
            )
        
        # Read and parse CSV
        content = await file.read()
        content_str = content.decode('utf-8')
        
        csv_reader = csv.DictReader(io.StringIO(content_str))
        required_fields = ['name', 'email']
        
        # Validate CSV has required columns
        if not all(field in csv_reader.fieldnames for field in required_fields):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain columns: {', '.join(required_fields)}"
            )
        
        imported = 0
        updated = 0
        skipped = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # start=2 to account for header
            try:
                # Skip if we've reached the limit
                if current_count + imported >= max_contacts:
                    skipped += 1
                    continue
                
                # Validate required fields
                name = row.get('name', '').strip()
                email = row.get('email', '').strip().lower()
                
                if not name or not email:
                    errors.append(f"Row {row_num}: Missing name or email")
                    skipped += 1
                    continue
                
                # Validate email format
                if not "@" in email or not "." in email.split("@")[1]:
                    errors.append(f"Row {row_num}: Invalid email format '{email}'")
                    skipped += 1
                    continue
                
                # Prepare contact data
                contact_data = {
                    "owner_id": user_id,
                    "owner_email": current_user.get("email") if isinstance(current_user, dict) else "",
                    "owner_username": current_user.get("username") if isinstance(current_user, dict) else "",
                    "name": name,
                    "email": email,
                    "phone": row.get('phone', '').strip(),
                    "company": row.get('company', '').strip(),
                    "tags": [tag.strip() for tag in row.get('tags', '').split(',') if tag.strip()],
                    "custom_fields": {},
                    "notes": row.get('notes', '').strip(),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                # Add custom fields (columns not in standard fields)
                standard_fields = ['name', 'email', 'phone', 'company', 'tags', 'notes']
                for key, value in row.items():
                    if key not in standard_fields and value.strip():
                        contact_data["custom_fields"][key] = value.strip()
                
                # Add to group if specified
                if group_id:
                    contact_data["groups"] = [ObjectId(group_id)]
                
                # Check if contact exists
                existing = await contacts_collection.find_one({
                    "email": email,
                    "owner_id": user_id
                })
                
                if existing:
                    if update_existing:
                        await contacts_collection.update_one(
                            {"_id": existing["_id"]},
                            {"$set": contact_data}
                        )
                        updated += 1
                    else:
                        skipped += 1
                else:
                    await contacts_collection.insert_one(contact_data)
                    imported += 1
                    current_count += 1
                    
            except Exception as row_error:
                errors.append(f"Row {row_num}: {str(row_error)}")
                skipped += 1
        
        # Update group member count
        if group_id and (imported > 0 or updated > 0):
            await groups_collection.update_one(
                {"_id": ObjectId(group_id)},
                {"$inc": {"member_count": imported + updated}}
            )
        
        # Log activity
        await log_user_activity(
            user_id=user_id,
            action="contacts_imported",
            resource_type="batch",
            resource_id="csv_import",
            details={
                "imported": imported,
                "updated": updated,
                "skipped": skipped,
                "filename": file.filename,
                "errors": len(errors)
            }
        )
        
        return {
            "success": True,
            "message": f"Import completed: {imported} imported, {updated} updated, {skipped} skipped",
            "stats": {
                "imported": imported,
                "updated": updated,
                "skipped": skipped,
                "total_processed": imported + updated + skipped,
                "errors": errors[:10]  # Return first 10 errors
            },
            "user_info": {
                "id": user_id,
                "current_contacts": current_count,
                "max_contacts": max_contacts
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing contacts: {e}")
        raise HTTPException(status_code=500, detail="Failed to import contacts")

@router.get("/usage-stats")
async def get_usage_stats(current_user = Depends(get_current_user_from_token)):
    """Get usage statistics for current user"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        user_id = get_user_id(current_user)
        subscription_status = get_user_subscription_status(current_user)
        
        # Get today's usage
        email_usage = await check_daily_limit(current_user, "email")
        
        # Get monthly usage
        today = datetime.utcnow().date()
        first_of_month = datetime(today.year, today.month, 1)
        
        monthly_sent = await campaigns_collection.count_documents({
            "owner_id": user_id,
            "channel": "email",
            "status": {"$in": ["sent", "sending"]},
            "created_at": {"$gte": first_of_month}
        })
        
        # Get user's totals
        total_contacts = await contacts_collection.count_documents({"owner_id": user_id})
        total_groups = await groups_collection.count_documents({"owner_id": user_id})
        total_templates = await templates_collection.count_documents({"owner_id": user_id})
        total_campaigns = await campaigns_collection.count_documents({"owner_id": user_id})
        
        # Calculate monthly limit (rough estimate)
        daily_limit = subscription_status["limits"].get("daily_emails", 50)
        monthly_limit = daily_limit * 30
        
        # Get campaign performance
        successful_campaigns = await campaigns_collection.count_documents({
            "owner_id": user_id,
            "status": "sent"
        })
        
        failed_campaigns = await campaigns_collection.count_documents({
            "owner_id": user_id,
            "status": "failed"
        })
        
        success_rate = (successful_campaigns / total_campaigns * 100) if total_campaigns > 0 else 0
        
        return {
            "success": True,
            "usage_stats": {
                "daily": {
                    "sent": email_usage["sent"],
                    "limit": email_usage["limit"],
                    "remaining": email_usage["remaining"],
                    "percentage_used": (email_usage["sent"] / email_usage["limit"] * 100) if email_usage["limit"] > 0 else 0
                },
                "monthly": {
                    "sent": monthly_sent,
                    "limit": monthly_limit,
                    "remaining": max(0, monthly_limit - monthly_sent),
                    "percentage_used": (monthly_sent / monthly_limit * 100) if monthly_limit > 0 else 0
                },
                "totals": {
                    "contacts": {
                        "total": total_contacts,
                        "limit": subscription_status["limits"].get("max_contacts", 100),
                        "percentage_used": (total_contacts / subscription_status["limits"].get("max_contacts", 100) * 100) if subscription_status["limits"].get("max_contacts", 100) > 0 else 0
                    },
                    "groups": {
                        "total": total_groups,
                        "limit": subscription_status["limits"].get("max_groups", 5),
                        "percentage_used": (total_groups / subscription_status["limits"].get("max_groups", 5) * 100) if subscription_status["limits"].get("max_groups", 5) > 0 else 0
                    },
                    "templates": total_templates,
                    "campaigns": {
                        "total": total_campaigns,
                        "successful": successful_campaigns,
                        "failed": failed_campaigns,
                        "success_rate": round(success_rate, 1)
                    }
                },
                "subscription": subscription_status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting usage stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage statistics")

@router.get("/dashboard-stats")
async def get_dashboard_stats(current_user = Depends(get_current_user_from_token)):
    """Get dashboard statistics for current user"""
    try:
        # Verify user is a brand
        await verify_brand_user(current_user)
        
        user_id = get_user_id(current_user)
        subscription_status = get_user_subscription_status(current_user)
        
        # Recent campaigns (last 5)
        recent_campaigns_cursor = campaigns_collection.find({
            "owner_id": user_id,
            "status": {"$in": ["sent", "failed", "sending", "scheduled"]}
        }).sort("created_at", -1).limit(5)
        
        recent_campaigns = await recent_campaigns_cursor.to_list(length=5)
        
        formatted_campaigns = []
        for campaign in recent_campaigns:
            campaign_data = dict(campaign)
            campaign_data["id"] = str(campaign_data.pop("_id"))
            if "template_id" in campaign_data and campaign_data["template_id"]:
                campaign_data["template_id"] = str(campaign_data["template_id"])
            formatted_campaigns.append(campaign_data)
        
        # Campaign statistics
        total_campaigns = await campaigns_collection.count_documents({"owner_id": user_id})
        sent_campaigns = await campaigns_collection.count_documents({
            "owner_id": user_id,
            "status": "sent"
        })
        failed_campaigns = await campaigns_collection.count_documents({
            "owner_id": user_id,
            "status": "failed"
        })
        
        # Success rate
        success_rate = (sent_campaigns / total_campaigns * 100) if total_campaigns > 0 else 0
        
        # Recent contacts added (last 10)
        recent_contacts_cursor = contacts_collection.find({
            "owner_id": user_id
        }).sort("created_at", -1).limit(10)
        
        recent_contacts = await recent_contacts_cursor.to_list(length=10)
        
        formatted_contacts = []
        for contact in recent_contacts:
            contact_data = dict(contact)
            contact_data["id"] = str(contact_data.pop("_id"))
            formatted_contacts.append(contact_data)
        
        # Today's activity
        today = datetime.utcnow().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        
        today_contacts = await contacts_collection.count_documents({
            "owner_id": user_id,
            "created_at": {"$gte": start_of_day}
        })
        
        today_campaigns = await campaigns_collection.count_documents({
            "owner_id": user_id,
            "created_at": {"$gte": start_of_day}
        })
        
        # Get today's email usage
        email_usage = await check_daily_limit(current_user, "email")
        
        return {
            "success": True,
            "dashboard_stats": {
                "recent_campaigns": formatted_campaigns,
                "recent_contacts": formatted_contacts,
                "campaign_summary": {
                    "total": total_campaigns,
                    "sent": sent_campaigns,
                    "failed": failed_campaigns,
                    "success_rate": round(success_rate, 1)
                },
                "today_activity": {
                    "contacts_added": today_contacts,
                    "campaigns_created": today_campaigns,
                    "emails_sent": email_usage["sent"],
                    "emails_remaining": email_usage["remaining"]
                },
                "subscription": subscription_status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard statistics")

@router.get("/plan-upgrade-info")
async def get_plan_upgrade_info(current_user = Depends(get_current_user_from_token)):
    """Get information about available plan upgrades"""
    try:
        subscription_status = get_user_subscription_status(current_user)
        current_plan = subscription_status["plan"]
        
        # Define all available plans with detailed features
        all_plans = {
            "free": {
                "name": "Free",
                "price": "$0",
                "billing_cycle": "forever",
                "features": [
                    "50 Daily Emails",
                    "100 Contacts",
                    "5 Groups",
                    "Basic Templates",
                    "Email Support"
                ],
                "color": "gray",
                "popular": False,
                "upgrade_button": "Start Free Trial"
            },
            "basic": {
                "name": "Basic",
                "price": "$29/month",
                "billing_cycle": "monthly",
                "features": [
                    "1,000 Daily Emails",
                    "5,000 Contacts",
                    "50 Groups",
                    "File Attachments",
                    "Scheduled Sending",
                    "Bulk Sending",
                    "Advanced Templates",
                    "Priority Support"
                ],
                "color": "green",
                "popular": True,
                "upgrade_button": "Upgrade to Pro"
            },
            "pro": {
                "name": "Professional",
                "price": "$99/month",
                "billing_cycle": "monthly",
                "features": [
                    "5,000 Daily Emails",
                    "20,000 Contacts",
                    "100 Groups",
                    "WhatsApp Integration",
                    "SMS Campaigns",
                    "Advanced Analytics",
                    "API Access",
                    "Dedicated Support"
                ],
                "color": "purple",
                "popular": False,
                "upgrade_button": "Upgrade to Enterprise"
            },
            "enterprise": {
                "name": "Enterprise",
                "price": "Custom",
                "billing_cycle": "custom",
                "features": [
                    "50,000+ Daily Emails",
                    "100,000+ Contacts",
                    "500 Groups",
                    "All Features Included",
                    "Custom Integrations",
                    "24/7 Support",
                    "Account Manager",
                    "Custom SLA"
                ],
                "color": "gold",
                "popular": False,
                "upgrade_button": "Contact Sales"
            }
        }
        
        # Determine available upgrades
        available_upgrades = {}
        plan_order = ["free", "basic", "pro", "enterprise"]
        
        if current_plan in plan_order:
            current_index = plan_order.index(current_plan)
            for plan in plan_order[current_index + 1:]:
                available_upgrades[plan] = all_plans[plan]
        
        return {
            "success": True,
            "current_plan": {
                "name": current_plan,
                "details": all_plans.get(current_plan, {})
            },
            "available_upgrades": available_upgrades,
            "all_plans": all_plans
        }
    except Exception as e:
        logger.error(f"Error getting plan upgrade info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get plan upgrade information")