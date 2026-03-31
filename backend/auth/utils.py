# auth/utils.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from typing import Optional, Dict, Any, List
from database import db
from bson import ObjectId
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Configure logging
logger = logging.getLogger(__name__)

# ---------------- Configuration ----------------
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "sagasri143@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "jalz xmkg mmno lksa")

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 180

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Database collections
users_collection = db["users"]
subscriptions_collection = db["subscriptions"]
customers_collection = db["customers"]
notifications_collection = db["notifications"]

# ✅ FIXED: Remove free plan - only trial and paid plans
PLANS = {
    "trial": {"name": "Free Trial", "price": 0, "features": ["Full premium access"]},
    "starter_monthly": {"name": "Starter Monthly", "price": 9.99, "features": ["Essential features"]},
    "starter_yearly": {"name": "Starter Yearly", "price": 99.99, "features": ["Essential features"]},
    "pro_monthly": {"name": "Pro Monthly", "price": 19.99, "features": ["Advanced features"]},
    "pro_yearly": {"name": "Pro Yearly", "price": 199.99, "features": ["Advanced features"]},
    "enterprise_monthly": {"name": "Enterprise Monthly", "price": 49.99, "features": ["Full suite"]},
    "enterprise_yearly": {"name": "Enterprise Yearly", "price": 499.99, "features": ["Full suite"]},
}

FREE_TRIAL_DAYS = 15
SUBSCRIPTION_ALERT_DAYS = [1, 3, 7]

# ---------------- Image Generation Limits ----------------
class ImageGenerationManager:
    
    @staticmethod
    def get_image_generation_limits(subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get image generation limits based on subscription plan"""
        plan_type = subscription_data.get("type", "trial")
        plan_key = subscription_data.get("plan", "trial")
        
        # Image generation limits by plan
        image_limits_config = {
            "trial": {
                "can_generate_images": True,
                "max_images_per_day": 10,
                "max_images_per_request": 2,
                "allowed_resolutions": ["512x512", "256x256"],
                "allowed_models": ["basic"],
                "features": [
                    "✓ Generate up to 10 images per day",
                    "✓ Basic image resolutions",
                    "✓ Standard generation quality"
                ]
            },
            "starter": {
                "can_generate_images": True,
                "max_images_per_day": 50,
                "max_images_per_request": 4,
                "allowed_resolutions": ["512x512", "768x768", "256x256"],
                "allowed_models": ["basic", "standard"],
                "features": [
                    "✓ Generate up to 50 images per day",
                    "✓ Medium image resolutions",
                    "✓ Enhanced generation quality"
                ]
            },
            "pro": {
                "can_generate_images": True,
                "max_images_per_day": 200,
                "max_images_per_request": 8,
                "allowed_resolutions": ["512x512", "768x768", "1024x1024", "256x256"],
                "allowed_models": ["basic", "standard", "premium"],
                "features": [
                    "✓ Generate up to 200 images per day",
                    "✓ High-resolution images",
                    "✓ Premium generation models",
                    "✓ Priority processing"
                ]
            },
            "enterprise": {
                "can_generate_images": True,
                "max_images_per_day": 1000,
                "max_images_per_request": 20,
                "allowed_resolutions": ["512x512", "768x768", "1024x1024", "2048x2048"],
                "allowed_models": ["basic", "standard", "premium", "ultra"],
                "features": [
                    "✓ Generate up to 1000 images per day",
                    "✓ Ultra-high resolutions",
                    "✓ All generation models",
                    "✓ Instant processing",
                    "✓ Custom model training"
                ]
            }
        }
        
        # Map plan key to benefit key
        plan_mapping = {
            "trial": "trial",
            "free_trial": "trial",
            "starter": "starter",
            "starter_monthly": "starter",
            "starter_yearly": "starter", 
            "pro": "pro",
            "pro_monthly": "pro",
            "pro_yearly": "pro",
            "enterprise": "enterprise",
            "enterprise_monthly": "enterprise",
            "enterprise_yearly": "enterprise"
        }
        
        benefit_key = plan_mapping.get(plan_key, "trial")
        return image_limits_config.get(benefit_key, image_limits_config["trial"])
    
    @staticmethod
    async def can_generate_image(user_email: str, requested_count: int = 1) -> Dict[str, Any]:
        """Check if user can generate images based on their plan and usage"""
        try:
            # Get user's subscription data
            subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
            image_limits = ImageGenerationManager.get_image_generation_limits(subscription_data)
            
            # Check if image generation is allowed
            if not image_limits["can_generate_images"]:
                return {
                    "can_generate": False,
                    "reason": "Image generation not available for your plan",
                    "upgrade_required": True
                }
            
            # Check daily usage
            today = datetime.utcnow().date()
            daily_usage = await ImageGenerationManager.get_today_image_usage(user_email, today)
            
            remaining_today = image_limits["max_images_per_day"] - daily_usage
            
            if remaining_today <= 0:
                return {
                    "can_generate": False,
                    "reason": f"Daily image generation limit ({image_limits['max_images_per_day']}) reached",
                    "reset_time": datetime.combine(today + timedelta(days=1), datetime.min.time()),
                    "upgrade_required": True
                }
            
            # Check per-request limit
            if requested_count > image_limits["max_images_per_request"]:
                return {
                    "can_generate": False,
                    "reason": f"Max {image_limits['max_images_per_request']} images per request allowed",
                    "requested": requested_count,
                    "allowed": image_limits["max_images_per_request"]
                }
            
            # Check if requested count exceeds remaining daily limit
            if requested_count > remaining_today:
                return {
                    "can_generate": False,
                    "reason": f"Requested {requested_count} images but only {remaining_today} remaining today",
                    "remaining_today": remaining_today,
                    "requested": requested_count
                }
            
            return {
                "can_generate": True,
                "remaining_today": remaining_today,
                "max_per_request": image_limits["max_images_per_request"],
                "allowed_resolutions": image_limits["allowed_resolutions"],
                "allowed_models": image_limits["allowed_models"]
            }
            
        except Exception as e:
            logger.error(f"Error checking image generation permissions: {str(e)}")
            return {
                "can_generate": False,
                "reason": "Error checking permissions",
                "error": str(e)
            }
    
    @staticmethod
    async def get_today_image_usage(user_email: str, date: datetime.date) -> int:
        """Get today's image generation usage count"""
        try:
            # You'll need to create an image_usage collection to track this
            # For now, return 0 as placeholder
            return 0
        except Exception as e:
            logger.error(f"Error getting image usage: {str(e)}")
            return 0
    
    @staticmethod
    async def record_image_generation(user_email: str, count: int, resolution: str, model: str):
        """Record image generation usage"""
        try:
            # Implement this to record usage in your database
            # This should update the image_usage collection
            pass
        except Exception as e:
            logger.error(f"Error recording image generation: {str(e)}")

# ---------------- Subscription Management ----------------
class SubscriptionManager:
    
    @staticmethod
    async def get_user_subscription_status(user_email: str) -> Dict[str, Any]:
        """Get comprehensive subscription status with alerts and notifications"""
        try:
            user = users_collection.find_one({"email": user_email})
            if not user:
                return SubscriptionManager._get_trial_subscription_status()
            
            # Check cached data first
            cached_data = await SubscriptionManager._get_cached_subscription_data(user)
            if cached_data:
                return cached_data
            
            # Get fresh data from subscriptions collection
            return await SubscriptionManager._get_fresh_subscription_data(user_email, user)
            
        except Exception as e:
            logger.error(f"Error getting subscription status: {str(e)}")
            return SubscriptionManager._get_trial_subscription_status()
    
    @staticmethod
    async def _get_cached_subscription_data(user: Dict) -> Optional[Dict[str, Any]]:
        """Get cached subscription data if recent"""
        last_update = user.get("subscription_updated_at")
        if last_update and (datetime.utcnow() - last_update).total_seconds() < 300:
            return SubscriptionManager._format_subscription_from_user_data(user)
        return None
    
    @staticmethod
    async def _get_fresh_subscription_data(user_email: str, user: Dict) -> Dict[str, Any]:
        """Get fresh subscription data from database"""
        # Look for active paid subscriptions first
        active_paid_sub = subscriptions_collection.find_one({
            "user_email": user_email,
            "stripe_subscription_id": {"$exists": True, "$ne": None},
            "status": {"$in": ["active", "trialing", "incomplete", "past_due"]}
        })
        
        if active_paid_sub:
            subscription_data = SubscriptionManager._format_paid_subscription(active_paid_sub)
            await SubscriptionManager._update_user_cache(user_email, subscription_data)
            return subscription_data
        
        # Check for active trial
        trial_sub = subscriptions_collection.find_one({
            "user_email": user_email,
            "plan": "trial",
            "status": "active"
        })
        
        if trial_sub:
            subscription_data = SubscriptionManager._format_trial_subscription(trial_sub)
            if subscription_data["is_active"]:
                await SubscriptionManager._update_user_cache(user_email, subscription_data)
                return subscription_data
            else:
                # Trial expired - update to expired
                subscriptions_collection.update_one(
                    {"_id": trial_sub["_id"]},
                    {"$set": {"status": "expired", "updated_at": datetime.utcnow()}}
                )
        
        # No active subscription - default to trial
        subscription_data = SubscriptionManager._get_trial_subscription_status()
        await SubscriptionManager._update_user_cache(user_email, subscription_data)
        return subscription_data
    
    @staticmethod
    def _format_paid_subscription(sub_doc: Dict) -> Dict[str, Any]:
        """Format paid subscription data"""
        plan = sub_doc.get("plan", "starter_monthly")
        status_stripe = sub_doc.get("status", "active")
        is_trial = sub_doc.get("is_trial", False)
        
        current_period_end = sub_doc.get("current_period_end")
        remaining_days = SubscriptionManager._calculate_remaining_days(current_period_end)
        
        subscription_data = {
            "type": "paid",
            "plan": plan,
            "plan_name": PLANS.get(plan, {}).get("name", "Unknown Plan"),
            "billing_cycle": sub_doc.get("billing_cycle", "monthly"),
            "status": status_stripe,
            "is_active": status_stripe in ["active", "trialing"],
            "is_trial": is_trial,
            "current_period_start": sub_doc.get("current_period_start"),
            "current_period_end": current_period_end,
            "stripe_subscription_id": sub_doc.get("stripe_subscription_id"),
            "stripe_customer_id": sub_doc.get("stripe_customer_id"),
            "price_id": sub_doc.get("price_id"),
            "remaining_days": remaining_days,
            "trial_remaining_days": remaining_days if is_trial else 0,
            "alerts": SubscriptionManager._generate_subscription_alerts("paid", remaining_days, is_trial),
            "notifications": SubscriptionManager._get_pending_notifications(sub_doc.get("user_email"))
        }
        
        # ✅ ADDED: Include all limits from benefits
        benefits = get_subscription_benefits(subscription_data)
        subscription_data["campaign_limits"] = benefits.get("limits", {})
        subscription_data["ai_limits"] = benefits.get("limits", {})
        subscription_data["image_limits"] = ImageGenerationManager.get_image_generation_limits(subscription_data)
        
        return subscription_data
    
    @staticmethod
    def _format_trial_subscription(sub_doc: Dict) -> Dict[str, Any]:
        """Format trial subscription data"""
        current_time = datetime.utcnow()
        period_end = sub_doc.get("current_period_end")
        
        if not period_end or current_time > period_end:
            return SubscriptionManager._get_trial_subscription_status()
        
        remaining_days = SubscriptionManager._calculate_remaining_days(period_end)
        
        subscription_data = {
            "type": "trial",
            "plan": "trial",
            "plan_name": "Free Trial",
            "billing_cycle": "trial",
            "status": "active",
            "is_active": True,
            "is_trial": True,
            "current_period_start": sub_doc.get("current_period_start"),
            "current_period_end": period_end,
            "stripe_subscription_id": None,
            "stripe_customer_id": None,
            "price_id": None,
            "remaining_days": remaining_days,
            "trial_remaining_days": remaining_days,
            "alerts": SubscriptionManager._generate_subscription_alerts("trial", remaining_days, True),
            "notifications": SubscriptionManager._get_pending_notifications(sub_doc.get("user_email"))
        }
        
        # ✅ ADDED: Include all limits from benefits
        benefits = get_subscription_benefits(subscription_data)
        subscription_data["campaign_limits"] = benefits.get("limits", {})
        subscription_data["ai_limits"] = benefits.get("limits", {})
        subscription_data["image_limits"] = ImageGenerationManager.get_image_generation_limits(subscription_data)
        
        return subscription_data
    
    @staticmethod
    def _format_subscription_from_user_data(user_data: Dict) -> Dict[str, Any]:
        """Format subscription from cached user data"""
        plan = user_data.get("current_plan", "trial")
        is_trial = user_data.get("is_trial_active", False)
        has_active_sub = user_data.get("has_active_subscription", False)
        
        current_period_end = user_data.get("current_period_end")
        remaining_days = SubscriptionManager._calculate_remaining_days(current_period_end)
        
        if is_trial:
            subscription_type = "trial"
        elif has_active_sub:
            subscription_type = "paid"
        else:
            subscription_type = "trial"
        
        subscription_data = {
            "type": subscription_type,
            "plan": plan,
            "plan_name": PLANS.get(plan, {}).get("name", "Free Trial"),
            "billing_cycle": user_data.get("billing_cycle"),
            "status": "active" if has_active_sub or is_trial else "inactive",
            "is_active": has_active_sub or is_trial,
            "is_trial": is_trial,
            "current_period_start": user_data.get("current_period_start"),
            "current_period_end": current_period_end,
            "stripe_subscription_id": user_data.get("stripe_subscription_id"),
            "stripe_customer_id": user_data.get("stripe_customer_id"),
            "remaining_days": remaining_days,
            "trial_remaining_days": remaining_days if is_trial else 0,
            "alerts": SubscriptionManager._generate_subscription_alerts(subscription_type, remaining_days, is_trial),
            "notifications": SubscriptionManager._get_pending_notifications(user_data.get("email"))
        }
        
        # ✅ ADDED: Include all limits from benefits
        benefits = get_subscription_benefits(subscription_data)
        subscription_data["campaign_limits"] = benefits.get("limits", {})
        subscription_data["ai_limits"] = benefits.get("limits", {})
        subscription_data["image_limits"] = ImageGenerationManager.get_image_generation_limits(subscription_data)
        
        return subscription_data
    
    @staticmethod
    def _get_trial_subscription_status() -> Dict[str, Any]:
        """Return trial subscription status for all new users"""
        trial_end = datetime.utcnow() + timedelta(days=FREE_TRIAL_DAYS)
        
        subscription_data = {
            "type": "trial",
            "plan": "trial",
            "plan_name": "Free Trial",
            "status": "active",
            "is_active": True,
            "is_trial": True,
            "current_period_start": datetime.utcnow(),
            "current_period_end": trial_end,
            "stripe_subscription_id": None,
            "billing_cycle": "trial",
            "remaining_days": FREE_TRIAL_DAYS,
            "trial_remaining_days": FREE_TRIAL_DAYS,
            "alerts": SubscriptionManager._generate_subscription_alerts("trial", FREE_TRIAL_DAYS, True),
            "notifications": SubscriptionManager._get_pending_notifications(None)
        }
        
        # ✅ ADDED: Include all limits from benefits
        benefits = get_subscription_benefits(subscription_data)
        subscription_data["campaign_limits"] = benefits.get("limits", {})
        subscription_data["ai_limits"] = benefits.get("limits", {})
        subscription_data["image_limits"] = ImageGenerationManager.get_image_generation_limits(subscription_data)
        
        return subscription_data
    
    @staticmethod
    def _calculate_remaining_days(end_date: Optional[datetime]) -> int:
        """Calculate remaining days until subscription end"""
        if not end_date:
            return 0
        time_remaining = end_date - datetime.utcnow()
        return max(0, time_remaining.days)
    
    @staticmethod
    def _generate_subscription_alerts(subscription_type: str, remaining_days: int, is_trial: bool) -> List[Dict[str, Any]]:
        """Generate subscription alerts based on status and remaining days"""
        alerts = []
        
        if subscription_type == "trial":
            if remaining_days == 0:
                alerts.append({
                    "type": "urgent",
                    "message": "🚨 Your free trial has ended! Upgrade now to continue premium access including image generation.",
                    "action": "upgrade",
                    "priority": "high"
                })
            elif remaining_days <= 1:
                alerts.append({
                    "type": "warning",
                    "message": "⏰ Your trial ends tomorrow! Upgrade to keep your image generation and premium features.",
                    "action": "upgrade",
                    "priority": "high"
                })
            elif remaining_days <= 3:
                alerts.append({
                    "type": "warning", 
                    "message": f"🔔 Only {remaining_days} days left in your trial. Upgrade to avoid interruption in image generation.",
                    "action": "upgrade",
                    "priority": "medium"
                })
            elif remaining_days <= 7:
                alerts.append({
                    "type": "info",
                    "message": f"📅 Your trial ends in {remaining_days} days. Explore premium image generation features!",
                    "action": "upgrade", 
                    "priority": "low"
                })
            else:
                alerts.append({
                    "type": "info",
                    "message": f"🎉 You have {remaining_days} days of free trial remaining. Try image generation!",
                    "action": "explore",
                    "priority": "low"
                })
                
        elif subscription_type == "paid":
            if remaining_days <= 7:
                alerts.append({
                    "type": "warning",
                    "message": f"📅 Your subscription renews in {remaining_days} days.",
                    "action": "review",
                    "priority": "medium"
                })
            else:
                alerts.append({
                    "type": "success", 
                    "message": f"✅ Your subscription is active. {remaining_days} days until renewal.",
                    "action": "manage",
                    "priority": "low"
                })
                
        return alerts
    
    @staticmethod
    def _get_pending_notifications(user_email: Optional[str]) -> List[Dict[str, Any]]:
        """Get pending notifications for user"""
        if not user_email:
            return []
        
        try:
            notifications = list(notifications_collection.find({
                "user_email": user_email,
                "status": "pending",
                "scheduled_at": {"$lte": datetime.utcnow()}
            }).sort("created_at", -1).limit(5))
            
            return [{
                "id": str(n["_id"]),
                "type": n.get("type", "info"),
                "title": n.get("title", ""),
                "message": n.get("message", ""),
                "action": n.get("action"),
                "created_at": n.get("created_at")
            } for n in notifications]
        except Exception as e:
            logger.error(f"Error fetching notifications: {str(e)}")
            return []
    
    @staticmethod
    async def _update_user_cache(user_email: str, subscription_data: Dict[str, Any]):
        """Update user cache with subscription data"""
        try:
            update_data = {
                "current_plan": subscription_data["plan"],
                "has_active_subscription": subscription_data["is_active"],
                "is_trial_active": subscription_data["is_trial"],
                "subscription_updated_at": datetime.utcnow()
            }
            
            if subscription_data.get("current_period_start"):
                update_data["current_period_start"] = subscription_data["current_period_start"]
            if subscription_data.get("current_period_end"):
                update_data["current_period_end"] = subscription_data["current_period_end"]
            if subscription_data.get("billing_cycle"):
                update_data["billing_cycle"] = subscription_data["billing_cycle"]
            if subscription_data.get("stripe_subscription_id"):
                update_data["stripe_subscription_id"] = subscription_data["stripe_subscription_id"]
            
            users_collection.update_one(
                {"email": user_email},
                {"$set": update_data}
            )
        except Exception as e:
            logger.error(f"Error updating user cache: {str(e)}")
    
    @staticmethod
    async def create_subscription_notification(
        user_email: str,
        notification_type: str,
        title: str,
        message: str,
        action: Optional[str] = None,
        scheduled_at: Optional[datetime] = None
    ):
        """Create a subscription notification"""
        try:
            notification = {
                "user_email": user_email,
                "type": notification_type,
                "title": title,
                "message": message,
                "action": action,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "scheduled_at": scheduled_at or datetime.utcnow()
            }
            
            notifications_collection.insert_one(notification)
            logger.info(f"Created notification for {user_email}: {title}")
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
    
    @staticmethod
    async def mark_notification_read(notification_id: str, user_email: str):
        """Mark notification as read"""
        try:
            notifications_collection.update_one(
                {"_id": ObjectId(notification_id), "user_email": user_email},
                {"$set": {"status": "read", "read_at": datetime.utcnow()}}
            )
        except Exception as e:
            logger.error(f"Error marking notification read: {str(e)}")

# ---------------- Subscription Benefits & Messages ----------------

def get_subscription_benefits(subscription_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get comprehensive benefits for current subscription plan - Trial is default"""
    plan_key = subscription_data.get("plan", "trial")
    plan_type = subscription_data.get("type", "trial")
    is_trial = subscription_data.get("is_trial", True)
    
    # Complete plan mapping
    plan_mapping = {
        "trial": "trial",
        "free_trial": "trial",
        "starter": "starter",
        "starter_monthly": "starter",
        "starter_yearly": "starter", 
        "pro": "pro",
        "pro_monthly": "pro",
        "pro_yearly": "pro",
        "enterprise": "enterprise",
        "enterprise_monthly": "enterprise",
        "enterprise_yearly": "enterprise"
    }
    
    benefit_key = plan_mapping.get(plan_key, "trial")
    
    # ✅ UPDATED: Benefits configuration with comprehensive limits
    benefits_config = {
        "trial": {
            "name": "Free Trial",
            "description": "Full premium access during trial period",
            "features": [
                "✓ All Pro features unlocked",
                "✓ Priority email support", 
                "✓ Unlimited storage access",
                "✓ Advanced analytics dashboard",
                "✓ API access included",
                "✓ Custom branding options",
                "✓ Team collaboration tools (up to 5 members)",
                "✓ Create up to 3 campaigns total during trial",
                "✓ 10 AI product analyses per day",
                "✓ 10 image generations per day",
                "✓ 1 active chat conversation",
                "✓ Text messages only",
                "✓ 50 messages per day"
            ],
            "limits": {
                "projects": "Unlimited",
                "storage_gb": "Unlimited", 
                "team_members": 5,
                "api_calls": 10000,
                "export_limit": "Full access",
                "max_campaigns_total": 3,
                "max_campaigns_per_day": None,
                "can_create_campaigns": True,
                "campaigns_created": 0,
                # AI Features
                "can_use_ai_features": True,
                "max_ai_usage_per_day": 10,
                # Image Generation
                "can_generate_images": True,
                "max_images_per_day": 10,
                "max_images_per_request": 2,
                # Chat limits
                "max_conversations": 1,
                "max_media_uploads": 0,
                "allowed_message_types": ["text"],
                "daily_message_limit": 50
            },
            "upgrade_recommended": True,
            "is_trial": True,
            "trial_days_remaining": subscription_data.get("trial_remaining_days", 15)
        },
        "starter": {
            "name": "Starter Plan",
            "description": "Perfect for individuals and small businesses",
            "features": [
                "✓ All trial features included",
                "✓ Advanced analytics and insights",
                "✓ Priority email support",
                "✓ 50GB storage space",
                "✓ Up to 10 projects", 
                "✓ Basic API access",
                "✓ Custom reporting",
                "✓ 10 campaigns total",
                "✓ 50 AI product analyses per day",
                "✓ 50 image generations per day",
                "✓ 10 active chat conversations",
                "✓ Text, image, and document messages",
                "✓ 200 messages per day",
                "✓ 50 media uploads"
            ],
            "limits": {
                "projects": 10,
                "storage_gb": 50,
                "team_members": 3,
                "api_calls": 5000,
                "export_limit": "Standard",
                "max_campaigns_total": None,
                "max_campaigns_per_day": 1,
                "can_create_campaigns": True,
                "campaigns_created": 0,
                # AI Features
                "can_use_ai_features": True,
                "max_ai_usage_per_day": 50,
                # Image Generation
                "can_generate_images": True,
                "max_images_per_day": 50,
                "max_images_per_request": 4,
                # Chat limits
                "max_conversations": 10,
                "max_media_uploads": 50,
                "allowed_message_types": ["text", "image", "document"],
                "daily_message_limit": 200
            },
            "upgrade_recommended": False,
            "is_trial": False
        },
        "pro": {
            "name": "Pro Plan", 
            "description": "Advanced features for growing businesses and teams",
            "features": [
                "✓ All Starter features included",
                "✓ Advanced AI-powered analytics",
                "✓ Phone & email support",
                "✓ 200GB storage space",
                "✓ Up to 50 projects",
                "✓ Full API access",
                "✓ Custom integrations",
                "✓ White-label options",
                "✓ 50 campaigns total",
                "✓ 200 AI product analyses per day",
                "✓ 200 image generations per day",
                "✓ 25 active chat conversations",
                "✓ All message types (text, image, video, audio, document)",
                "✓ 1000 messages per day",
                "✓ 200 media uploads"
            ],
            "limits": {
                "projects": 50,
                "storage_gb": 200,
                "team_members": 10,
                "api_calls": 25000,
                "export_limit": "Advanced",
                "max_campaigns_total": None,
                "max_campaigns_per_day": 3,
                "can_create_campaigns": True,
                "campaigns_created": 0,
                # AI Features
                "can_use_ai_features": True,
                "max_ai_usage_per_day": 200,
                # Image Generation
                "can_generate_images": True,
                "max_images_per_day": 200,
                "max_images_per_request": 8,
                # Chat limits
                "max_conversations": 25,
                "max_media_uploads": 200,
                "allowed_message_types": ["text", "image", "video", "audio", "document"],
                "daily_message_limit": 1000
            },
            "upgrade_recommended": False,
            "is_trial": False
        },
        "enterprise": {
            "name": "Enterprise Plan",
            "description": "Complete solution for large organizations with custom needs",
            "features": [
                "✓ All Pro features included",
                "✓ 24/7 dedicated support",
                "✓ Unlimited storage and projects",
                "✓ Custom SLA agreements", 
                "✓ On-premise deployment options",
                "✓ Advanced security features",
                "✓ Custom development services",
                "✓ Training and onboarding",
                "✓ Unlimited campaign creation",
                "✓ Unlimited AI product analyses",
                "✓ Unlimited image generations",
                "✓ Unlimited chat conversations",
                "✓ All message types including archives",
                "✓ Unlimited messages",
                "✓ Unlimited media uploads"
            ],
            "limits": {
                "projects": "Unlimited",
                "storage_gb": "Unlimited",
                "team_members": "Unlimited",
                "api_calls": "Unlimited",
                "export_limit": "Enterprise",
                "max_campaigns_total": None,
                "max_campaigns_per_day": None,
                "can_create_campaigns": True,
                "campaigns_created": 0,
                # AI Features
                "can_use_ai_features": True,
                "max_ai_usage_per_day": None,
                # Image Generation
                "can_generate_images": True,
                "max_images_per_day": 1000,
                "max_images_per_request": 20,
                # Chat limits
                "max_conversations": None,
                "max_media_uploads": None,
                "allowed_message_types": ["text", "image", "video", "audio", "document", "archive"],
                "daily_message_limit": None
            },
            "upgrade_recommended": False,
            "is_trial": False
        }
    }
    
    return benefits_config[benefit_key]

def get_plan_upgrade_message(subscription_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate comprehensive upgrade message with actions"""
    plan_type = subscription_data.get("type", "trial")
    remaining_days = subscription_data.get("remaining_days", 0)
    trial_remaining_days = subscription_data.get("trial_remaining_days", 0)
    plan_name = subscription_data.get("plan_name", "Free Trial")
    
    base_message = {
        "message": "",
        "type": "info",
        "actions": [],
        "urgency": "low"
    }
    
    if plan_type == "trial":
        if trial_remaining_days == 0:
            base_message.update({
                "message": "🚨 Your free trial has ended! Upgrade now to continue using image generation and AI analysis.",
                "type": "error",
                "urgency": "critical",
                "actions": ["upgrade", "view_plans", "contact_support"]
            })
        elif trial_remaining_days <= 1:
            base_message.update({
                "message": "⏰ Your trial ends tomorrow! Upgrade to keep image generation and AI analysis active.",
                "type": "warning", 
                "urgency": "high",
                "actions": ["upgrade", "view_plans", "extend_trial"]
            })
        elif trial_remaining_days <= 3:
            base_message.update({
                "message": f"🔔 Only {trial_remaining_days} days left in your trial. Don't lose access to image generation!",
                "type": "warning",
                "urgency": "medium", 
                "actions": ["upgrade", "view_plans", "remind_later"]
            })
        elif trial_remaining_days <= 7:
            base_message.update({
                "message": f"📅 Your trial ends in {trial_remaining_days} days. Consider upgrading for more image generations.",
                "type": "info",
                "urgency": "low",
                "actions": ["view_plans", "upgrade", "remind_later"]
            })
        else:
            base_message.update({
                "message": f"🎉 You have {trial_remaining_days} days of free trial remaining. Try image generation!",
                "type": "success",
                "urgency": "low",
                "actions": ["explore_features", "view_plans", "remind_later"]
            })
            
    elif plan_type == "paid":
        if remaining_days <= 3:
            base_message.update({
                "message": f"📅 Your {plan_name} renews in {remaining_days} days. Ensure your payment method is up to date.",
                "type": "warning",
                "urgency": "medium",
                "actions": ["manage_billing", "update_payment", "view_invoice"]
            })
        elif remaining_days <= 7:
            base_message.update({
                "message": f"✅ Your {plan_name} is active. Renewal in {remaining_days} days.",
                "type": "info",
                "urgency": "low", 
                "actions": ["manage_subscription", "view_usage", "upgrade_plan"]
            })
        else:
            base_message.update({
                "message": f"👍 Your {plan_name} is working great! {remaining_days} days until automatic renewal.",
                "type": "success",
                "urgency": "low",
                "actions": ["manage_subscription", "view_analytics", "upgrade_plan"]
            })
            
    else:
        base_message.update({
            "message": "🎉 Start your free trial to unlock powerful image generation and AI analysis!",
            "type": "info",
            "urgency": "medium",
            "actions": ["start_trial", "view_plans", "compare_features"]
        })
    
    return base_message

# ---------------- Password Utilities ----------------
def hash_password(password: str) -> str:
    """Hash a plaintext password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

# ---------------- JWT Utilities ----------------
def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token with optional expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode a JWT token, return payload or None if invalid"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# ---------------- FastAPI Dependency ----------------
async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    FastAPI dependency to extract current user from token.
    Returns user with comprehensive subscription data, alerts, and notifications.
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get comprehensive subscription data with alerts
    subscription_data = await SubscriptionManager.get_user_subscription_status(user["email"])
    benefits_data = get_subscription_benefits(subscription_data)
    upgrade_message = get_plan_upgrade_message(subscription_data)
    
    # Check if we should create any new notifications
    await _check_and_create_subscription_notifications(user["email"], subscription_data)
    
    # Enhance user data with comprehensive subscription info
    user["subscription"] = subscription_data
    user["plan_benefits"] = benefits_data
    user["plan_upgrade_message"] = upgrade_message
    
    # ✅ FIXED: Upgrade eligibility
    current_plan_type = subscription_data.get("type", "trial")
    user["can_upgrade"] = current_plan_type in ["trial"] or subscription_data.get("plan") in ["starter", "starter_monthly", "pro", "pro_monthly"]
    user["can_start_trial"] = False
    
    # Plan details for frontend
    user["current_plan_display"] = benefits_data["name"]
    user["is_premium"] = current_plan_type in ["paid", "trial"] and subscription_data.get("is_active", False)
    
    # Comprehensive plan details including image generation limits
    user["plan_details"] = {
        "key": subscription_data.get("plan", "trial"),
        "type": current_plan_type,
        "billing_cycle": subscription_data.get("billing_cycle"),
        "is_active": subscription_data.get("is_active", False),
        "remaining_days": subscription_data.get("remaining_days", 0),
        "trial_remaining_days": subscription_data.get("trial_remaining_days", 0),
        "has_alerts": len(subscription_data.get("alerts", [])) > 0,
        "alert_count": len([a for a in subscription_data.get("alerts", []) if a.get("priority") in ["high", "medium"]]),
        "notification_count": len(subscription_data.get("notifications", [])),
        "campaign_limits": subscription_data.get("campaign_limits", {}),
        "ai_limits": benefits_data.get("limits", {}),
        "image_limits": subscription_data.get("image_limits", {})  # ✅ ADDED: Image generation limits
    }
    
    return user

def admin_only(current_user: dict = Depends(get_current_user)):
    """Ensure user is admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def _check_and_create_subscription_notifications(user_email: str, subscription_data: Dict[str, Any]):
    """Check and create subscription notifications if needed"""
    try:
        plan_type = subscription_data.get("type", "trial")
        remaining_days = subscription_data.get("remaining_days", 0)
        trial_remaining_days = subscription_data.get("trial_remaining_days", 0)
        
        # Check for trial expiry notifications
        if plan_type == "trial" and trial_remaining_days in [1, 3, 7]:
            await SubscriptionManager.create_subscription_notification(
                user_email=user_email,
                notification_type="warning",
                title=f"Trial Ending in {trial_remaining_days} Days",
                message=f"Your free trial ends in {trial_remaining_days} days. Upgrade to continue image generation and AI analysis.",
                action="upgrade"
            )
        
        # Check for subscription renewal notifications
        elif plan_type == "paid" and remaining_days in [1, 7]:
            await SubscriptionManager.create_subscription_notification(
                user_email=user_email,
                notification_type="info", 
                title=f"Subscription Renewal in {remaining_days} Days",
                message=f"Your subscription will automatically renew in {remaining_days} days.",
                action="manage_billing"
            )
            
    except Exception as e:
        logger.error(f"Error creating subscription notifications: {str(e)}")

# ---------------- Email Utilities ----------------
def send_email(recipient_email: str, subject: str, html_content: str) -> bool:
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = recipient_email

        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)

        logger.info(f"✅ Email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Error sending email: {e}")
        return False

def send_otp_email(recipient_email: str, username: str, otp: str):
    """Send OTP for password reset"""
    subject = "Password Reset OTP"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2196F3; text-align: center;">Password Reset Request</h2>
          <p>Hello {username},</p>
          <p>You requested to reset your password. Use the OTP below:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 10px; font-weight: bold; margin: 20px 0; border-radius: 8px;">
            {otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">
            <em>If you didn't request this, please ignore this email and ensure your account is secure.</em>
          </p>
        </div>
      </body>
    </html>
    """
    return send_email(recipient_email, subject, html_content)

def send_welcome_email(recipient_email: str, username: str, subscription_data: Dict[str, Any] = None):
    """Send welcome email with comprehensive plan details"""
    subject = "Welcome to Our Platform! 🎉"
    
    if subscription_data:
        plan_type = subscription_data.get("type", "trial")
        remaining_days = subscription_data.get("trial_remaining_days", 15)
        plan_name = subscription_data.get("plan_name", "Free Trial")
        
        if plan_type == "trial":
            plan_info = f"<strong>{plan_name}</strong> with <strong>{remaining_days} days</strong> of premium access including image generation!"
            features_note = "You have full access to all premium features including AI product analysis and image generation during your trial period."
            upgrade_cta = f"<p>Make the most of your {remaining_days} days - explore AI analysis and image generation!</p>"
        else:
            plan_info = f"<strong>{plan_name}</strong>"
            features_note = "Enjoy all the benefits of your chosen plan including AI analysis and image generation!"
            upgrade_cta = ""
    else:
        plan_info = "<strong>Free Trial</strong> with <strong>15 days</strong> of premium access including image generation!"
        features_note = "You have full access to all premium features including AI product analysis and image generation during your trial."
        upgrade_cta = "<p>Make the most of your 15 days - explore AI analysis and image generation!</p>"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">Welcome aboard, {username}! 🎉</h2>
          
          <p>Thank you for registering with us. Your account has been successfully created and is ready to use.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #4CAF50; margin-top: 0;">📋 Your Plan Details</h3>
            <p style="font-size: 18px; margin: 10px 0;">{plan_info}</p>
            <p>{features_note}</p>
            {upgrade_cta}
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1976D2; margin-top: 0;">🚀 Getting Started</h4>
            <ul>
              <li>Try our AI product analysis feature</li>
              <li>Generate images with our AI tools</li>
              <li>Explore all platform features and capabilities</li>
              <li>Set up your profile and preferences</li>
              <li>Invite team members (if available in your plan)</li>
              <li>Check out our tutorials and documentation</li>
            </ul>
          </div>
          
          <p>If you have any questions or need help getting started, feel free to reach out to our support team.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0;">Best regards,<br><strong>The Team</strong></p>
          </div>
        </div>
      </body>
    </html>
    """
    return send_email(recipient_email, subject, html_content)

def send_login_notification_email(recipient_email: str, username: str, subscription_data: Dict[str, Any] = None):
    """Send login notification email with current plan details and alerts"""
    subject = "Login Notification - Account Access"
    
    # Generate comprehensive plan information
    if subscription_data:
        plan_type = subscription_data.get("type", "trial")
        plan_name = subscription_data.get("plan_name", "Free Trial")
        remaining_days = subscription_data.get("remaining_days", 0)
        trial_remaining_days = subscription_data.get("trial_remaining_days", 0)
        alerts = subscription_data.get("alerts", [])
        
        if plan_type == "trial":
            plan_info = f"Free Trial Plan ({trial_remaining_days} days remaining)"
            plan_message = f"Your free trial ends in {trial_remaining_days} days. Upgrade to continue image generation and AI analysis."
            plan_icon = "🆓"
        elif plan_type == "paid":
            plan_info = f"{plan_name} ({remaining_days} days until renewal)"
            plan_message = f"Your {plan_name.lower()} is active and will renew in {remaining_days} days."
            plan_icon = "✅"
        else:
            plan_info = "Free Trial"
            plan_message = "You have full premium access including image generation during your trial period."
            plan_icon = "🎉"
    else:
        plan_info = "Free Trial"
        plan_message = "You have full premium access including image generation during your trial period."
        plan_icon = "🎉"
        alerts = []
    
    # Generate alerts section if any
    alerts_section = ""
    if alerts:
        alerts_section = """
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ Important Alerts</h4>
        """
        for alert in alerts[:3]:
            alerts_section += f'<p style="margin: 5px 0;">{alert.get("message", "")}</p>'
        alerts_section += "</div>"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2196F3; text-align: center;">Login Successful</h2>
          
          <p>Hello <strong>{username}</strong>,</p>
          
          <p>You have successfully logged into your account at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}.</p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
            <h3 style="color: #2196F3; margin-top: 0;">{plan_icon} Account Details</h3>
            <p><strong>Current Plan:</strong> {plan_info}</p>
            <p><strong>Status:</strong> {plan_message}</p>
          </div>
          
          {alerts_section}
          
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #ff9800; margin-top: 0;">💡 Quick Tip</h4>
            <p>Make the most of your current plan! Try our image generation feature and explore all available capabilities.</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <em>If this wasn't you, please contact support immediately to secure your account.</em>
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0;">Best regards,<br><strong>The Team</strong></p>
          </div>
        </div>
      </body>
    </html>
    """
    return send_email(recipient_email, subject, html_content)

# Export the managers for use in other modules
__all__ = [
    'hash_password', 'verify_password', 'create_access_token', 'decode_access_token',
    'get_current_user', 'send_otp_email', 'send_welcome_email', 'send_login_notification_email',
    'SubscriptionManager', 'ImageGenerationManager', 'get_subscription_benefits', 'get_plan_upgrade_message'
]