# image_generation.py
from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks, status
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
import requests
import os
import uuid
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from auth.utils import get_subscription_benefits, get_current_user, ImageGenerationManager
from database import users_collection, image_generation_usage_collection
from bson import ObjectId
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json

router = APIRouter(prefix="/images", tags=["image-generation"])

# -----------------------------
# Configuration
# -----------------------------
APIFY_TOKEN = os.getenv("APIFY_TOKEN")

if not APIFY_TOKEN:
    raise ValueError("APIFY_TOKEN is not set")
    
APIFY_ACTOR_URL = f"https://api.apify.com/v2/acts/muhammetakkurtt~craiyon-ai-image-creator/runs?token={APIFY_TOKEN}"

# Email Configuration
SMTP_CONFIG = {
    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.getenv("SMTP_PORT", 587)),
    "username": os.getenv("SMTP_USERNAME", ""),
    "password": os.getenv("SMTP_PASSWORD", ""),
    "from_email": os.getenv("FROM_EMAIL", "noreply@influencerplatform.com")
}

logger = logging.getLogger("image_generation_service")

# -----------------------------
# Models
# -----------------------------
class ImagePrompt(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt for image generation")

class MultipleImagePrompt(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt for image generation")
    num_images: int = Field(4, ge=1, le=10, description="Number of images to generate (1-10)")

# -----------------------------
# Models - Add JSON encoders
# -----------------------------
from pydantic import BaseModel, Field, validator
from datetime import datetime

class ImageGenerationResponse(BaseModel):
    status: str
    prompt: str
    images_generated: int
    images: List[str]
    usage_info: Dict[str, Any]
    quota_info: Dict[str, Any]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
    
    @validator('quota_info', 'usage_info', pre=True)
    def convert_datetime_to_string(cls, v):
        """Convert datetime objects to ISO format strings"""
        if isinstance(v, dict):
            for key, value in v.items():
                if isinstance(value, datetime):
                    v[key] = value.isoformat()
                elif isinstance(value, dict):
                    v[key] = cls.convert_datetime_to_string(value)
        return v

class UsageCheckResponse(BaseModel):
    can_generate: bool
    reason: str
    message: str
    usage: Dict[str, Any]
    plan: str
    limits: Dict[str, Any]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
    
    @validator('usage', 'limits', pre=True)
    def convert_datetime_to_string(cls, v):
        """Convert datetime objects to ISO format strings"""
        if isinstance(v, dict):
            for key, value in v.items():
                if isinstance(value, datetime):
                    v[key] = value.isoformat()
                elif isinstance(value, dict):
                    v[key] = cls.convert_datetime_to_string(value)
        return v

# -----------------------------
# Enhanced Email Service
# -----------------------------
class ImageEmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str) -> bool:
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_CONFIG["from_email"]
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html'))

            server = smtplib.SMTP(SMTP_CONFIG["host"], SMTP_CONFIG["port"])
            server.starttls()
            server.login(SMTP_CONFIG["username"], SMTP_CONFIG["password"])
            server.send_message(msg)
            server.quit()
            logger.info(f"Image generation email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False

    @staticmethod
    def send_image_limit_notification(
        user_email: str, 
        username: str, 
        plan_name: str, 
        limit_reason: str, 
        usage: dict,
        subscription_data: dict
    ):
        """Send notification when user reaches image generation limits"""
        subject = f"🚫 Image Generation Limit Reached - {plan_name}"
        
        # Get plan benefits for upgrade options
        benefits = get_subscription_benefits(subscription_data)
        current_limits = benefits.get("limits", {})
        
        # Build upgrade options based on current plan
        upgrade_options = ImageEmailService._get_upgrade_options(subscription_data)
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #ff6b6b; text-align: center;">Image Generation Limit Reached</h2>
                    
                    <p>Hello <strong>{username}</strong>,</p>
                    
                    <p>You've reached the AI image generation limit for your <strong>{plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
                        <h4 style="color: #856404; margin-top: 0;">📊 Usage Details</h4>
                        <p><strong>Reason:</strong> {limit_reason}</p>
                        <p><strong>Today's Image Generations:</strong> {usage.get('today_used', 0)}</p>
                        <p><strong>Daily Limit:</strong> {usage.get('daily_limit', 0)}</p>
                        <p><strong>Reset Time:</strong> {usage.get('reset_time', 'Tomorrow')}</p>
                    </div>
                    
                    <h3 style="color: #4CAF50;">🚀 Upgrade Your Plan</h3>
                    <p>To get more AI image generations and access advanced features, consider upgrading your plan:</p>
                    
                    {upgrade_options}
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="/upgrade" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Upgrade Now
                        </a>
                    </div>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h4 style="color: #1976D2; margin-top: 0;">💡 Tips</h4>
                        <ul>
                            <li>Your daily limits reset at midnight UTC</li>
                            <li>Upgrade to unlock higher resolution images</li>
                            <li>Enterprise plans include custom model training</li>
                        </ul>
                    </div>
                    
                    <br>
                    <p>Best regards,<br><strong>Influencer Platform Team</strong></p>
                </div>
            </body>
        </html>
        """
        
        return ImageEmailService.send_email(user_email, subject, body)

    @staticmethod
    def _get_upgrade_options(subscription_data: dict) -> str:
        """Generate upgrade options HTML based on current plan"""
        current_plan = subscription_data.get("plan", "trial")
        plan_type = subscription_data.get("type", "trial")
        
        if plan_type == "trial":
            return """
            <ul>
                <li><strong>Starter:</strong> 50 image generations per day, medium resolutions</li>
                <li><strong>Pro:</strong> 200 image generations per day, high resolutions, premium models</li>
                <li><strong>Enterprise:</strong> 1000 image generations per day, all resolutions, custom models</li>
            </ul>
            """
        elif current_plan in ["starter", "starter_monthly", "starter_yearly"]:
            return """
            <ul>
                <li><strong>Pro:</strong> 4x more daily generations (200 vs 50)</li>
                <li><strong>Enterprise:</strong> 20x more daily generations (1000 vs 50)</li>
                <li><strong>All paid plans:</strong> Higher resolution options and premium models</li>
            </ul>
            """
        elif current_plan in ["pro", "pro_monthly", "pro_yearly"]:
            return """
            <ul>
                <li><strong>Enterprise:</strong> 5x more daily generations (1000 vs 200)</li>
                <li><strong>Custom model training</strong></li>
                <li><strong>Priority processing</strong></li>
            </ul>
            """
        else:
            return """
            <ul>
                <li><strong>Contact sales</strong> for custom enterprise solutions</li>
            </ul>
            """

    @staticmethod
    def send_image_generation_success(
        user_email: str, 
        username: str, 
        prompt: str, 
        num_images: int, 
        quota_info: dict,
        subscription_data: dict
    ):
        """Send notification for successful image generation"""
        subject = "✅ AI Image Generation Completed Successfully"
        
        plan_benefits = get_subscription_benefits(subscription_data)
        image_limits = ImageGenerationManager.get_image_generation_limits(subscription_data)
        
        # Build quota information
        daily_usage = quota_info['usage']['today_used']
        daily_limit = quota_info['limits']['max_image_generations_per_day']
        usage_percent = quota_info['usage']['daily_usage_percent']
        
        quota_html = f"""
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #4CAF50; margin-top: 0;">📈 Usage Statistics</h4>
            <p><strong>Image Generations Used Today:</strong> {daily_usage} / {daily_limit if daily_limit != -1 else 'Unlimited'}</p>
            <p><strong>Remaining Today:</strong> {quota_info['remaining']['daily']}</p>
            <div style="background: #f0f0f0; border-radius: 5px; height: 10px; margin: 10px 0;">
                <div style="background: linear-gradient(90deg, #4CAF50, #45a049); width: {usage_percent}%; height: 100%; border-radius: 5px;"></div>
            </div>
            <p style="text-align: center; font-size: 12px; color: #666;">{usage_percent}% of daily limit used</p>
        </div>
        """
        
        # Build plan features
        features_html = ""
        if image_limits.get('features'):
            features_html = "<h4 style='color: #2196F3; margin-top: 0;'>🎨 Your Plan Features</h4><ul>"
            for feature in image_limits['features'][:3]:  # Show first 3 features
                features_html += f"<li>{feature}</li>"
            features_html += "</ul>"
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4CAF50; text-align: center;">✅ AI Image Generation Complete!</h2>
                    
                    <p>Hello <strong>{username}</strong>,</p>
                    
                    <p>Your AI image generation for prompt <strong>"{prompt}"</strong> has been completed successfully.</p>
                    <p><strong>Number of images generated:</strong> {num_images}</p>
                    
                    {quota_html}
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #2196F3; margin-top: 0;">📋 Plan Details</h3>
                        <p><strong>Current Plan:</strong> {quota_info['plan']['name']}</p>
                        <p><strong>Plan Type:</strong> {quota_info['plan']['type'].title()}</p>
                        {features_html}
                    </div>
                    
                    <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h4 style="color: #ff9800; margin-top: 0;">💡 Next Steps</h4>
                        <ul>
                            <li>Download your generated images</li>
                            <li>Use them in your campaigns and content</li>
                            <li>Generate more images for different prompts</li>
                            <li>Share your creations with the community</li>
                        </ul>
                    </div>
                    
                    <br>
                    <p>Best regards,<br><strong>Influencer Platform Team</strong></p>
                </div>
            </body>
        </html>
        """
        
        return ImageEmailService.send_email(user_email, subject, body)

# -----------------------------
# Enhanced Image Generation Helper Functions
# -----------------------------
class ImageUsageManager:
    
    @staticmethod
    def get_user_image_usage(user_id: str) -> dict:
        """Get user's image generation usage statistics"""
        try:
            # Try to get from dedicated collection first
            usage_doc = image_generation_usage_collection.find_one({"user_id": ObjectId(user_id)})
            if usage_doc:
                return usage_doc
            
            # Fallback to user collection
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user and "image_generation_usage" in user:
                return user["image_generation_usage"]
            
            # Return default structure
            return ImageUsageManager._get_default_usage_structure()
        except Exception as e:
            logger.error(f"Error getting user image usage: {str(e)}")
            return ImageUsageManager._get_default_usage_structure()
    
    @staticmethod
    def _get_default_usage_structure() -> dict:
        """Get default usage structure"""
        today = datetime.utcnow().date()
        return {
            "total_used": 0,
            "today_used": 0,
            "last_used": None,
            "usage_history": [],
            "last_reset_date": today.isoformat(),
            "created_at": datetime.utcnow()
        }
    
    @staticmethod
    async def update_user_image_usage(user_id: str, count: int = 1, prompt: str = None) -> bool:
        """Update user's image generation usage count - FIXED VERSION"""
        try:
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            user_id_obj = ObjectId(user_id)
            
            # Get current usage
            current_usage = ImageUsageManager.get_user_image_usage(user_id)
            
            # Reset daily count if it's a new day
            if current_usage.get("last_reset_date") != today_start.date().isoformat():
                current_usage["today_used"] = 0
                current_usage["last_reset_date"] = today_start.date().isoformat()
            
            # Prepare update data for image_generation_usage_collection
            update_data = {
                "total_used": current_usage.get("total_used", 0) + count,
                "today_used": current_usage.get("today_used", 0) + count,
                "last_used": datetime.utcnow(),
                "last_reset_date": today_start.date().isoformat(),
                "updated_at": datetime.utcnow()
            }
            
            # Create usage record
            usage_record = {
                "timestamp": datetime.utcnow(),
                "action": "image_generation",
                "count": count,
                "prompt": prompt or "image_generation",
                "images_generated": count
            }
            
            # FIXED: Update image_generation_usage_collection without conflicts
            result = image_generation_usage_collection.update_one(
                {"user_id": user_id_obj},
                {
                    "$set": update_data,
                    "$push": {"usage_history": {"$each": [usage_record], "$slice": -1000}},
                    "$setOnInsert": {
                        "created_at": datetime.utcnow(),
                        "user_id": user_id_obj
                    }
                },
                upsert=True
            )
            
            # FIXED: Update user collection correctly
            # First, ensure the image_generation_usage field exists
            user_update_result = users_collection.update_one(
                {"_id": user_id_obj},
                {
                    "$setOnInsert": {"image_generation_usage": {}},
                },
                upsert=False
            )
            
            # Then update the nested fields correctly
            users_collection.update_one(
                {"_id": user_id_obj},
                {
                    "$set": {
                        "image_generation_usage.total_used": update_data["total_used"],
                        "image_generation_usage.today_used": update_data["today_used"],
                        "image_generation_usage.last_used": update_data["last_used"],
                        "image_generation_usage.last_reset_date": update_data["last_reset_date"],
                        "image_generation_usage.updated_at": update_data["updated_at"]
                    },
                    "$push": {
                        "image_generation_usage.usage_history": {
                            "$each": [usage_record],
                            "$position": 0,
                            "$slice": 1000
                        }
                    }
                }
            )
            
            return result.modified_count > 0 or result.upserted_id is not None
            
        except Exception as e:
            logger.error(f"Error updating user image usage: {str(e)}")
            return False
    
    @staticmethod
    async def can_generate_images(user_id: str, user_subscription: dict, num_images: int = 1) -> dict:
        """Check if user can generate images based on subscription using ImageGenerationManager"""
        try:
            # Get user email first
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return {
                    "can_generate": False,
                    "reason": "user_not_found",
                    "message": "User not found",
                    "error_code": "USER_NOT_FOUND"
                }
            
            # Use the enhanced ImageGenerationManager from auth utils
            permission_check = ImageGenerationManager.get_image_generation_limits(user_subscription)
            
            if not permission_check.get("can_generate_images", False):
                return {
                    "can_generate": False,
                    "reason": "image_generation_not_allowed",
                    "message": "Your current plan does not include AI image generation features.",
                    "error_code": "IMAGE_GENERATION_NOT_ALLOWED"
                }
            
            # ✅ FIXED: AWAIT the async method
            daily_check = await ImageGenerationManager.can_generate_image(
                user["email"],
                num_images
            )
            
            if not daily_check.get("can_generate", False):
                return {
                    "can_generate": False,
                    "reason": daily_check.get("reason", "daily_image_limit_reached"),
                    "message": daily_check.get("reason", "Daily limit reached"),
                    "error_code": "DAILY_IMAGE_LIMIT_REACHED",
                    "current_usage": daily_check.get("current_usage", 0),
                    "limit": daily_check.get("limit", 0),
                    "reset_time": daily_check.get("reset_time")
                }
            
            return {
                "can_generate": True,
                "current_usage": daily_check.get("current_usage", 0),
                "limit": daily_check.get("limit", 0),
                "remaining": daily_check.get("remaining", 0),
                "allowed_resolutions": permission_check.get("allowed_resolutions", []),
                "allowed_models": permission_check.get("allowed_models", [])
            }
            
        except Exception as e:
            logger.error(f"Error checking image generation permissions: {str(e)}")
            return {
                "can_generate": False,
                "reason": "error_checking_permissions",
                "message": "Error checking generation permissions",
                "error_code": "PERMISSION_CHECK_ERROR"
            }
    
    @staticmethod
    def get_image_generation_quota(user_id: str, user_subscription: dict) -> dict:
        """Get detailed image generation quota information - FIXED VERSION"""
        try:
            plan_benefits = get_subscription_benefits(user_subscription)
            image_limits = ImageGenerationManager.get_image_generation_limits(user_subscription)
            
            user_image_usage = ImageUsageManager.get_user_image_usage(user_id)
            today_used = user_image_usage.get("today_used", 0)
            max_daily_images = image_limits.get("max_images_per_day", 0)
            
            # Calculate usage percentage
            daily_usage_percent = 0
            if max_daily_images not in [None, -1] and max_daily_images > 0:
                daily_usage_percent = min(100, round((today_used / max_daily_images) * 100, 1))
            
            # Get reset time
            reset_time = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
            
            # Convert datetime objects to ISO strings
            last_used = user_image_usage.get("last_used")
            if isinstance(last_used, datetime):
                last_used = last_used.isoformat()
            
            return {
                "plan": {
                    "name": plan_benefits["name"],
                    "type": user_subscription.get("type", "trial"),
                    "key": user_subscription.get("plan", "trial")
                },
                "limits": {
                    "max_image_generations_per_day": max_daily_images,
                    "max_images_per_request": image_limits.get("max_images_per_request", 1),
                    "can_generate_images": image_limits.get("can_generate_images", False),
                    "allowed_resolutions": image_limits.get("allowed_resolutions", []),
                    "allowed_models": image_limits.get("allowed_models", []),
                    "features": image_limits.get("features", [])
                },
                "usage": {
                    "today_used": today_used,
                    "total_used": user_image_usage.get("total_used", 0),
                    "daily_usage_percent": daily_usage_percent,
                    "last_used": last_used,
                    "reset_time": reset_time.isoformat()  # Convert to string
                },
                "remaining": {
                    "daily": "unlimited" if max_daily_images == -1 else max(0, max_daily_images - today_used),
                    "reset_in": f"{(reset_time - datetime.utcnow()).seconds // 3600} hours"
                },
                "can_generate_images": (
                    user_subscription.get("is_active", False) and
                    image_limits.get("can_generate_images", False) and
                    (max_daily_images == -1 or today_used < max_daily_images)
                )
            }
        except Exception as e:
            logger.error(f"Error getting image generation quota: {str(e)}")
            return ImageUsageManager._get_default_quota()

    @staticmethod
    def _get_default_quota() -> dict:
        """Get default quota structure"""
        return {
            "plan": {"name": "Unknown", "type": "trial", "key": "trial"},
            "limits": {
                "max_image_generations_per_day": 0,
                "max_images_per_request": 1,
                "can_generate_images": False,
                "allowed_resolutions": [],
                "allowed_models": []
            },
            "usage": {
                "today_used": 0,
                "total_used": 0,
                "daily_usage_percent": 0,
                "last_used": None,
                "reset_time": None
            },
            "remaining": {"daily": 0, "reset_in": "unknown"},
            "can_generate_images": False
        }

# -----------------------------
# Core Image Generation Function
# -----------------------------
def generate_images_with_apify(prompt: str, num_images: int = 4) -> List[str]:
    """Generate images using Apify API"""
    try:
        logger.info(f"Starting image generation for prompt: {prompt[:50]}...")
        
        # Start the actor run
        payload = {"prompts": [prompt]}
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(APIFY_ACTOR_URL, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        
        run_info = response.json().get("data")
        if not run_info:
            raise HTTPException(status_code=500, detail="No run data returned from Apify")

        dataset_id = run_info.get("defaultDatasetId")
        if not dataset_id:
            raise HTTPException(status_code=500, detail="No dataset ID returned from Apify")

        # Poll the dataset until images appear (max 60s)
        dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items?token={APIFY_TOKEN}"
        images = []
        
        for attempt in range(12):  # 12 * 5s = 60s max wait
            logger.info(f"Polling for images (attempt {attempt + 1}/12)...")
            
            dataset_resp = requests.get(dataset_url, timeout=30)
            dataset_resp.raise_for_status()
            items = dataset_resp.json()
            
            if items and len(items) > 0:
                images = [item.get("image_url") for item in items if item.get("image_url")]
                if images:
                    logger.info(f"Successfully retrieved {len(images)} images")
                    break
                else:
                    logger.info("Items found but no image URLs yet")
            else:
                logger.info("No items in dataset yet")
                
            time.sleep(5)

        if not images:
            raise HTTPException(status_code=500, detail="No images generated after waiting 60 seconds")

        # Return requested number of images (up to available)
        final_images = images[:num_images]
        logger.info(f"Returning {len(final_images)} images for user")
        
        return final_images

    except requests.exceptions.Timeout:
        logger.error("Apify API timeout")
        raise HTTPException(status_code=504, detail="Image generation service timeout")
    except requests.exceptions.RequestException as e:
        logger.error(f"Apify request failed: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Image generation service unavailable: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in image generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

# -----------------------------
# Image Generation Endpoints
# -----------------------------

@router.post(
    "/generate",
    response_model=ImageGenerationResponse,
    summary="Generate multiple images",
    description="Generate multiple AI images with subscription-based restrictions"
)
async def generate_multiple_images(
    data: MultipleImagePrompt,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate multiple images with subscription-based restrictions
    
    - **Free Trial**: 10 images per day
    - **Starter**: 50 images per day  
    - **Pro**: 200 images per day
    - **Enterprise**: 1000 images per day
    """
    try:
        # Check user permissions
        if current_user["role"] not in ["brand", "influencer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions. Only brands, influencers, and admins can generate images."
            )
        
        # Get subscription data
        subscription_data = current_user.get("subscription", {})
        
        # Check image generation limits
        image_generation_check = await ImageUsageManager.can_generate_images(
            str(current_user["_id"]), 
            subscription_data, 
            data.num_images
        )
        
        if not image_generation_check["can_generate"]:
            # Send notification email for limit reached
            if current_user.get("email"):
                background_tasks.add_task(
                    ImageEmailService.send_image_limit_notification,
                    current_user["email"],
                    current_user.get("username", "User"),
                    get_subscription_benefits(subscription_data)["name"],
                    image_generation_check["reason"],
                    {
                        "today_used": image_generation_check.get("current_usage", 0),
                        "daily_limit": image_generation_check.get("limit", 0),
                        "reset_time": image_generation_check.get("reset_time", "tomorrow")
                    },
                    subscription_data
                )
            
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=image_generation_check["message"],
                headers={
                    "X-Image-Limit-Reason": image_generation_check["reason"],
                    "X-Error-Code": image_generation_check.get("error_code", "IMAGE_LIMIT_REACHED"),
                    "X-Current-Usage": str(image_generation_check.get("current_usage", 0)),
                    "X-Daily-Limit": str(image_generation_check.get("limit", 0)),
                    "X-Plan-Name": get_subscription_benefits(subscription_data)["name"]
                }
            )
        
        # Get current quota for response
        image_quota = ImageUsageManager.get_image_generation_quota(str(current_user["_id"]), subscription_data)
        
        # Generate images
        logger.info(f"Generating {data.num_images} images for user {current_user['_id']}")
        images = generate_images_with_apify(data.prompt, data.num_images)
        
        # Update usage count
        await ImageUsageManager.update_user_image_usage(str(current_user["_id"]), len(images), data.prompt)
        
        # Get updated quota
        updated_quota = ImageUsageManager.get_image_generation_quota(str(current_user["_id"]), subscription_data)
        
        # Send success notification
        if current_user.get("email"):
            background_tasks.add_task(
                ImageEmailService.send_image_generation_success,
                current_user["email"],
                current_user.get("username", "User"),
                data.prompt,
                len(images),
                updated_quota,
                subscription_data
            )
        
        # Prepare response data
        response_data = ImageGenerationResponse(
            status="success",
            prompt=data.prompt,
            images_generated=len(images),
            images=images,
            usage_info={
                "today_used": updated_quota["usage"]["today_used"],
                "daily_limit": updated_quota["limits"]["max_image_generations_per_day"],
                "remaining": updated_quota["remaining"]["daily"],
                "reset_time": updated_quota["usage"]["reset_time"]
            },
            quota_info=updated_quota
        )
        
        # Add usage information to response headers
        response_headers = {
            "X-Image-Generation-Count": str(updated_quota["usage"]["today_used"]),
            "X-Image-Daily-Limit": "unlimited" if updated_quota["limits"]["max_image_generations_per_day"] == -1 else str(updated_quota["limits"]["max_image_generations_per_day"]),
            "X-Image-Remaining": str(updated_quota["remaining"]["daily"]),
            "X-Image-Usage-Percent": str(updated_quota["usage"]["daily_usage_percent"]),
            "X-Plan-Type": updated_quota["plan"]["type"],
            "X-Plan-Name": updated_quota["plan"]["name"]
        }
        
        return JSONResponse(
            content=response_data.dict(),
            headers=response_headers
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating multiple images: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating images: {str(e)}"
        )

# -----------------------------
# Image Generation Usage Endpoints
# -----------------------------

@router.get(
    "/usage",
    summary="Get image generation usage",
    description="Get current image generation usage and limits for the authenticated user"
)
async def get_image_generation_usage(current_user: dict = Depends(get_current_user)):
    """Get current image generation usage and limits"""
    if current_user["role"] not in ["brand", "influencer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    subscription_data = current_user.get("subscription", {})
    image_quota = ImageUsageManager.get_image_generation_quota(str(current_user["_id"]), subscription_data)
    
    return image_quota

@router.get(
    "/can-generate",
    response_model=UsageCheckResponse,
    summary="Check image generation capability",
    description="Check if user can generate images right now with specified quantity"
)
async def check_image_generation_endpoint(
    current_user: dict = Depends(get_current_user),
    num_images: int = Query(1, ge=1, le=10, description="Number of images to check for generation")
):
    """Check if user can generate images right now"""
    if current_user["role"] not in ["brand", "influencer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    subscription_data = current_user.get("subscription", {})
    image_generation_check = await ImageUsageManager.can_generate_images(
        str(current_user["_id"]), 
        subscription_data, 
        num_images
    )
    
    plan_benefits = get_subscription_benefits(subscription_data)
    image_limits = ImageGenerationManager.get_image_generation_limits(subscription_data)
    
    return UsageCheckResponse(
        can_generate=image_generation_check["can_generate"],
        reason=image_generation_check.get("reason", "within_limits"),
        message=image_generation_check.get("message", "You can generate images."),
        usage={
            "current": image_generation_check.get("current_usage", 0),
            "limit": image_generation_check.get("limit", 0),
            "remaining": image_generation_check.get("remaining", 0),
            "requested": num_images
        },
        plan=plan_benefits["name"],
        limits=image_limits
    )

@router.get(
    "/usage-history",
    summary="Get usage history",
    description="Get image generation usage history for the authenticated user"
)
async def get_image_generation_history_endpoint(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100, description="Number of history records to return"),
    days: int = Query(30, ge=1, le=365, description="Number of days of history to include")
):
    """Get image generation usage history"""
    if current_user["role"] not in ["brand", "influencer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    user_image_usage = ImageUsageManager.get_user_image_usage(str(current_user["_id"]))
    usage_history = user_image_usage.get("usage_history", [])
    
    # Filter by date range
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    filtered_history = [
        record for record in usage_history 
        if record.get("timestamp", datetime.min) >= cutoff_date
    ]
    
    # Sort by timestamp descending and apply limit
    filtered_history.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)
    recent_history = filtered_history[:limit]
    
    return {
        "total_records": len(usage_history),
        "filtered_records": len(filtered_history),
        "recent_usage": recent_history,
        "summary": {
            "total_used": user_image_usage.get("total_used", 0),
            "today_used": user_image_usage.get("today_used", 0),
            "last_used": user_image_usage.get("last_used"),
            "period_days": days
        }
    }

# -----------------------------
# Download Image Endpoint
# -----------------------------

@router.get(
    "/download",
    summary="Download generated image",
    description="Download a generated image by URL"
)
async def download_image(
    url: str = Query(..., description="Image URL to download"),
    current_user: dict = Depends(get_current_user)
):
    """Download generated image"""
    try:
        if current_user["role"] not in ["brand", "influencer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        # Validate URL (basic check)
        if not url.startswith(('http://', 'https://')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image URL"
            )
        
        logger.info(f"Downloading image from: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        # Generate filename
        file_name = f"ai_generated_image_{uuid.uuid4().hex[:8]}.jpg"
        
        # Save file temporarily
        with open(file_name, "wb") as f:
            f.write(response.content)
        
        # Return file response
        return FileResponse(
            file_name, 
            media_type="image/jpeg", 
            filename=file_name,
            headers={
                "X-Image-Source": "AI Generation",
                "X-Download-Time": datetime.utcnow().isoformat()
            }
        )
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error downloading image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error downloading image: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error downloading image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading image: {str(e)}"
        )

# -----------------------------
# Health Check Endpoint
# -----------------------------

@router.get("/health")
async def health_check():
    """Health check for image generation service"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "image-generation",
        "version": "1.0.0"
    }