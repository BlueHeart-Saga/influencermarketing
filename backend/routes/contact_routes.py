from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from database import contact_submissions_collection
import logging
import smtplib
from email.mime.text import MIMEText
from bson import ObjectId
from dotenv import load_dotenv
import os


router = APIRouter()
logger = logging.getLogger(__name__)


# Load SMTP settings from .env
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL")

# Request/Response models
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

class ContactResponse(BaseModel):
    message: str
    submission_id: str

@router.post("/contact", response_model=ContactResponse)
async def submit_contact_form(
    contact_data: ContactRequest, 
    background_tasks: BackgroundTasks
):
    """
    Submit contact form and store in database
    """
    try:
        # Create submission document
        submission = {
            "name": contact_data.name.strip(),
            "email": contact_data.email.lower().strip(),
            "subject": contact_data.subject.strip() if contact_data.subject else None,
            "message": contact_data.message.strip(),
            "submitted_at": datetime.utcnow(),
            "status": "new",
            "read": False
        }
        
        # Insert into database
        result = contact_submissions_collection.insert_one(submission)

        submission_id = str(result.inserted_id)
        
        logger.info(f"Contact form submitted successfully. ID: {submission_id}")
        
        # Send email notification in background
        background_tasks.add_task(send_email_notification, contact_data)
        
        return ContactResponse(
            message="Thank you for contacting us! We'll get back to you within 24 hours.",
            submission_id=submission_id
        )
        
    except Exception as e:
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit contact form. Please try again later."
        )

def send_email_notification(contact_data: ContactRequest):
    """
    Send email notification for new contact form submission.
    Runs in background.
    """
    try:
        logger.info(f"Sending email notification for: {contact_data.email}")

        # Validate SMTP config
        if not SMTP_SERVER or not SMTP_USERNAME or not SMTP_PASSWORD:
            logger.error("SMTP credentials are missing in .env file")
            return

        # --- Email Body ---
        body = (
            f"New contact form submission:\n\n"
            f"Name: {contact_data.name}\n"
            f"Email: {contact_data.email}\n"
            f"Subject: {contact_data.subject or 'No subject'}\n\n"
            f"Message:\n{contact_data.message}\n\n"
            f"---\nThis is an automated message from InfluenceAI."
        )

        msg = MIMEText(body, "plain")
        msg["Subject"] = "New Contact Form Submission"
        msg["From"] = FROM_EMAIL
        msg["To"] = NOTIFICATION_EMAIL

        # --- SMTP Send ---
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        logger.info("Email notification sent successfully")

    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")

@router.get("/contact/messages")
async def get_contact_messages():
    """
    Return all contact form submissions for admin
    """
    try:
        submissions = list(contact_submissions_collection.find().sort("submitted_at", -1))
        
        for s in submissions:
            s["_id"] = str(s["_id"])

        return {"success": True, "data": submissions}

    except Exception as e:
        logger.error(f"Failed to fetch contact messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load contact messages")

@router.put("/contact/mark-read/{submission_id}")
async def mark_contact_read(submission_id: str):
    try:
        contact_submissions_collection.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {"read": True, "status": "read"}}
        )
        return {"success": True, "message": "Marked as read"}
    except Exception as e:
        logger.error(f"Failed to mark contact as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Action failed")
