from datetime import datetime, timedelta
from typing import Dict, List, Optional
from bson import ObjectId
from database import db
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from auth.utils import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Constants
PROFILE_COMPLETION_THRESHOLD = 70  # Minimum profile completion percentage

class InfluencerNotificationService:
    def __init__(self):
        self.notifications_collection = db["influencer_notifications"]
        self.users_collection = db["users"]
        self.campaigns_collection = db["campaigns"]
        self.applications_collection = db["campaign_applications"]
        self.subscriptions_collection = db["subscriptions"]

    async def create_notification(
        self,
        influencer_id: str,
        notification_type: str,
        title: str,
        message: str,
        priority: str = "medium",
        action_url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create a new notification for influencer"""
        try:
            notification_data = {
                "influencer_id": ObjectId(influencer_id),
                "type": notification_type,
                "title": title,
                "message": message,
                "priority": priority,
                "is_read": False,
                "action_url": action_url,
                "metadata": metadata or {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = self.notifications_collection.insert_one(notification_data)
            notification_data["_id"] = str(result.inserted_id)
            
            logger.info(f"✅ Created influencer notification for {influencer_id}: {title}")
            return notification_data
            
        except Exception as e:
            logger.error(f"❌ Error creating influencer notification: {str(e)}")
            raise

    async def get_influencer_notifications(
        self, 
        influencer_id: str, 
        limit: int = 50, 
        skip: int = 0,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications for an influencer"""
        try:
            query = {"influencer_id": ObjectId(influencer_id)}
            if unread_only:
                query["is_read"] = False

            cursor = self.notifications_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            notifications = list(cursor)
            
            for notification in notifications:
                notification["_id"] = str(notification["_id"])
                notification["influencer_id"] = str(notification["influencer_id"])
                
            return notifications
            
        except Exception as e:
            logger.error(f"❌ Error getting influencer notifications: {str(e)}")
            return []

    async def mark_as_read(self, notification_id: str, influencer_id: str) -> bool:
        """Mark a notification as read"""
        try:
            result = self.notifications_collection.update_one(
                {
                    "_id": ObjectId(notification_id),
                    "influencer_id": ObjectId(influencer_id)
                },
                {
                    "$set": {
                        "is_read": True,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"✅ Marked notification {notification_id} as read")
                return True
            return False
            
        except Exception as e:
            logger.error(f"❌ Error marking notification as read: {str(e)}")
            return False

    async def mark_all_as_read(self, influencer_id: str) -> bool:
        """Mark all notifications as read for an influencer"""
        try:
            result = self.notifications_collection.update_many(
                {
                    "influencer_id": ObjectId(influencer_id),
                    "is_read": False
                },
                {
                    "$set": {
                        "is_read": True,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"✅ Marked {result.modified_count} notifications as read for influencer {influencer_id}")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"❌ Error marking all notifications as read: {str(e)}")
            return False

    async def get_unread_count(self, influencer_id: str) -> int:
        """Get count of unread notifications"""
        try:
            count = self.notifications_collection.count_documents({
                "influencer_id": ObjectId(influencer_id),
                "is_read": False
            })
            return count
            
        except Exception as e:
            logger.error(f"❌ Error getting unread count: {str(e)}")
            return 0

    async def delete_notification(self, notification_id: str, influencer_id: str) -> bool:
        """Delete a notification"""
        try:
            result = self.notifications_collection.delete_one({
                "_id": ObjectId(notification_id),
                "influencer_id": ObjectId(influencer_id)
            })
            
            if result.deleted_count > 0:
                logger.info(f"✅ Deleted notification {notification_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"❌ Error deleting notification: {str(e)}")
            return False

    # ==================== AUTH & PROFILE NOTIFICATIONS ====================

    async def notify_registration_success(self, influencer_id: str, username: str, email: str):
        """Notify influencer about successful registration"""
        title = "🎉 Welcome to Our Platform!"
        message = f"Hello {username}, your influencer account has been created successfully. Complete your profile to start getting campaign opportunities!"
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="registration_success",
            title=title,
            message=message,
            priority="high",
            action_url="/influencer/profile",
            metadata={
                "username": username,
                "email": email,
                "registration_date": datetime.utcnow().isoformat(),
                "next_steps": ["Complete Profile", "Verify Email", "Add Social Accounts"]
            }
        )

    async def notify_login_alert(self, influencer_id: str, username: str, login_time: datetime):
        """Notify influencer about login activity"""
        title = "🔐 Login Alert"
        message = f"Your account was successfully logged in at {login_time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="login_alert",
            title=title,
            message=message,
            priority="medium",
            action_url="/influencer/security",
            metadata={
                "username": username,
                "login_time": login_time.isoformat(),
                "device_info": "Web Browser"
            }
        )

    async def notify_google_login_success(self, influencer_id: str, username: str, login_time: datetime):
        """Notify influencer about successful Google login"""
        title = "🔐 Google Login Successful"
        message = f"You've successfully logged in using Google at {login_time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="google_login",
            title=title,
            message=message,
            priority="medium",
            action_url="/influencer/profile",
            metadata={
                "username": username,
                "login_time": login_time.isoformat(),
                "auth_method": "Google OAuth"
            }
        )

    async def notify_profile_incomplete(self, influencer_id: str, username: str, completion_percentage: int, missing_fields: List[str]):
        """Notify influencer about incomplete profile"""
        title = "📝 Complete Your Profile"
        message = f"Your profile is {completion_percentage}% complete. Add {', '.join(missing_fields[:3])} to increase your chances of getting selected for campaigns."
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="profile_incomplete",
            title=title,
            message=message,
            priority="medium",
            action_url="/influencer/profile",
            metadata={
                "username": username,
                "completion_percentage": completion_percentage,
                "missing_fields": missing_fields,
                "recommended_threshold": PROFILE_COMPLETION_THRESHOLD
            }
        )

    async def notify_profile_approved(self, influencer_id: str, username: str):
        """Notify influencer about profile approval"""
        title = "✅ Profile Approved!"
        message = "Your influencer profile has been approved and is now visible to brands. You can start applying to campaigns!"
        action_url = "/influencer/campaigns"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="profile_approved",
            title=title,
            message=message,
            priority="high",
            action_url=action_url,
            metadata={
                "username": username,
                "approval_date": datetime.utcnow().isoformat(),
                "status": "active"
            }
        )

    async def notify_password_change(self, influencer_id: str, username: str, change_time: datetime):
        """Notify influencer about password change"""
        title = "🔒 Password Changed"
        message = f"Your password was successfully changed at {change_time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="password_change",
            title=title,
            message=message,
            priority="medium",
            action_url="/influencer/security",
            metadata={
                "username": username,
                "change_time": change_time.isoformat(),
                "security_level": "enhanced"
            }
        )

    # ==================== CAMPAIGN NOTIFICATIONS ====================

    async def notify_application_status(self, influencer_id: str, campaign_id: str, brand_name: str, status: str):
        """Notify influencer about application status update"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        if status == "approved":
            title = "🎉 Application Approved!"
            message = f"Congratulations! Your application for '{campaign.get('title', 'Unknown Campaign')}' by {brand_name} has been approved!"
            priority = "high"
        elif status == "rejected":
            title = "❌ Application Not Selected"
            message = f"Your application for '{campaign.get('title', 'Unknown Campaign')}' by {brand_name} was not selected this time."
            priority = "medium"
        elif status == "shortlisted":
            title = "⭐ Application Shortlisted"
            message = f"Great news! Your application for '{campaign.get('title', 'Unknown Campaign')}' has been shortlisted by {brand_name}."
            priority = "high"
        else:
            title = "📋 Application Update"
            message = f"Your application for '{campaign.get('title', 'Unknown Campaign')}' has been updated to {status}."
            priority = "medium"

        action_url = f"/influencer/campaigns/{campaign_id}"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="application_status",
            title=title,
            message=message,
            priority=priority,
            action_url=action_url,
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "brand_name": brand_name,
                "status": status,
                "update_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_new_campaign_match(self, influencer_id: str, campaign_id: str, brand_name: str, match_reason: str = "profile_match"):
        """Notify influencer about new campaign matching their profile"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "🎯 New Campaign Match!"
        message = f"New campaign '{campaign.get('title', 'Unknown Campaign')}' from {brand_name} matches your profile perfectly!"
        action_url = f"/influencer/campaigns/{campaign_id}"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="new_campaign_match",
            title=title,
            message=message,
            priority="medium",
            action_url=action_url,
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "brand_name": brand_name,
                "match_reason": match_reason,
                "notification_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_campaign_invitation(self, influencer_id: str, campaign_id: str, brand_name: str):
        """Notify influencer about direct campaign invitation"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "📨 Campaign Invitation"
        message = f"🎊 Exclusive Invitation! {brand_name} has personally invited you to join their campaign '{campaign.get('title', 'Unknown Campaign')}'"
        action_url = f"/influencer/campaigns/{campaign_id}"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="campaign_invitation",
            title=title,
            message=message,
            priority="high",
            action_url=action_url,
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "brand_name": brand_name,
                "invitation_date": datetime.utcnow().isoformat(),
                "is_personal_invite": True
            }
        )

    async def notify_campaign_reminder(self, influencer_id: str, campaign_id: str, days_remaining: int):
        """Notify influencer about upcoming campaign deadline"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "⏰ Campaign Deadline Approaching"
        message = f"Deadline for '{campaign.get('title', 'Unknown Campaign')}' is in {days_remaining} day(s). Don't forget to submit your content!"
        action_url = f"/influencer/campaigns/{campaign_id}"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="campaign_reminder",
            title=title,
            message=message,
            priority="urgent" if days_remaining <= 2 else "high",
            action_url=action_url,
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "days_remaining": days_remaining,
                "reminder_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_campaign_completion_required(self, influencer_id: str, campaign_id: str, hours_remaining: int):
        """Notify influencer about urgent campaign completion requirement"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "🚨 Campaign Submission Due Soon!"
        message = f"Urgent: Campaign '{campaign.get('title', 'Unknown Campaign')}' submission is due in {hours_remaining} hours!"
        action_url = f"/influencer/campaigns/{campaign_id}/submit"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="campaign_urgent",
            title=title,
            message=message,
            priority="urgent",
            action_url=action_url,
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "hours_remaining": hours_remaining,
                "is_urgent": True
            }
        )

    # ==================== PAYMENT & EARNINGS NOTIFICATIONS ====================

    async def notify_payment_received(self, influencer_id: str, amount: float, campaign_title: str, payment_method: str = "stripe"):
        """Notify influencer about payment received"""
        title = "💰 Payment Received!"
        message = f"Payment of ${amount:.2f} for campaign '{campaign_title}' has been processed successfully and is now in your account."
        action_url = "/influencer/earnings"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="payment_received",
            title=title,
            message=message,
            priority="high",
            action_url=action_url,
            metadata={
                "amount": amount,
                "campaign_title": campaign_title,
                "payment_method": payment_method,
                "payment_date": datetime.utcnow().isoformat(),
                "status": "completed"
            }
        )

    async def notify_payment_pending(self, influencer_id: str, amount: float, campaign_title: str, expected_date: datetime):
        """Notify influencer about pending payment"""
        title = "⏳ Payment Processing"
        message = f"Payment of ${amount:.2f} for '{campaign_title}' is being processed and will be available by {expected_date.strftime('%Y-%m-%d')}."
        action_url = "/influencer/earnings"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="payment_pending",
            title=title,
            message=message,
            priority="medium",
            action_url=action_url,
            metadata={
                "amount": amount,
                "campaign_title": campaign_title,
                "expected_date": expected_date.isoformat(),
                "status": "processing"
            }
        )

    async def notify_earning_milestone(self, influencer_id: str, milestone_amount: float, timeframe: str = "monthly"):
        """Notify influencer about earning milestone"""
        title = "🏆 Earning Milestone Reached!"
        message = f"Congratulations! You've earned ${milestone_amount:.2f} this {timeframe}. Keep up the great work!"
        action_url = "/influencer/analytics"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="earning_milestone",
            title=title,
            message=message,
            priority="medium",
            action_url=action_url,
            metadata={
                "milestone_amount": milestone_amount,
                "timeframe": timeframe,
                "achievement_date": datetime.utcnow().isoformat()
            }
        )

    # ==================== MESSAGE & COMMUNICATION NOTIFICATIONS ====================

    async def notify_new_message(self, influencer_id: str, brand_name: str, campaign_id: str = None, message_preview: str = None):
        """Notify influencer about new message"""
        title = "💬 New Message"
        if campaign_id:
            base_message = f"You have a new message from {brand_name} regarding a campaign"
        else:
            base_message = f"You have a new message from {brand_name}"
        
        if message_preview:
            message = f"{base_message}: '{message_preview[:50]}{'...' if len(message_preview) > 50 else ''}'"
        else:
            message = base_message

        action_url = "/influencer/messages"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="new_message",
            title=title,
            message=message,
            priority="medium",
            action_url=action_url,
            metadata={
                "brand_name": brand_name,
                "campaign_id": campaign_id,
                "message_preview": message_preview,
                "message_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_brand_response(self, influencer_id: str, brand_name: str, campaign_title: str, response_type: str = "general"):
        """Notify influencer about brand response to their application/message"""
        title = "📨 Brand Response"
        message = f"{brand_name} has responded to your {response_type} for campaign '{campaign_title}'"
        action_url = "/influencer/messages"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="brand_response",
            title=title,
            message=message,
            priority="medium",
            action_url=action_url,
            metadata={
                "brand_name": brand_name,
                "campaign_title": campaign_title,
                "response_type": response_type,
                "response_date": datetime.utcnow().isoformat()
            }
        )

    # ==================== PERFORMANCE & ANALYTICS NOTIFICATIONS ====================

    async def notify_performance_insight(self, influencer_id: str, insight_type: str, metric: str, value: float, comparison: str = "average"):
        """Notify influencer about performance insights"""
        title = "📊 Performance Insight"
        message = f"Your {metric} is {value:.1f}% higher than {comparison}. Great job on your recent campaigns!"
        action_url = "/influencer/analytics"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="performance_insight",
            title=title,
            message=message,
            priority="low",
            action_url=action_url,
            metadata={
                "insight_type": insight_type,
                "metric": metric,
                "value": value,
                "comparison": comparison,
                "insight_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_engagement_boost(self, influencer_id: str, platform: str, growth_percentage: float):
        """Notify influencer about engagement growth"""
        title = "🚀 Engagement Boost!"
        message = f"Your {platform} engagement has grown by {growth_percentage:.1f}% this week. Brands love high engagement!"
        action_url = "/influencer/analytics"

        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="engagement_boost",
            title=title,
            message=message,
            priority="medium",
            action_url=action_url,
            metadata={
                "platform": platform,
                "growth_percentage": growth_percentage,
                "measurement_period": "weekly",
                "notification_date": datetime.utcnow().isoformat()
            }
        )

    # ==================== SYSTEM & PLATFORM NOTIFICATIONS ====================

    async def notify_platform_update(self, influencer_id: str, update_details: str, new_features: List[str] = None):
        """Notify influencer about platform updates"""
        title = "🔄 Platform Update"
        if new_features:
            features_text = ", ".join(new_features[:3])
            message = f"New update: {update_details}. New features: {features_text}"
        else:
            message = f"Platform update: {update_details}"
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="platform_update",
            title=title,
            message=message,
            priority="low",
            action_url="/influencer/help",
            metadata={
                "update_details": update_details,
                "new_features": new_features or [],
                "update_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_tip_suggestion(self, influencer_id: str, tip_category: str, tip_content: str):
        """Notify influencer with helpful tips"""
        title = "💡 Pro Tip"
        message = f"{tip_content}"
        
        await self.create_notification(
            influencer_id=influencer_id,
            notification_type="tip_suggestion",
            title=title,
            message=message,
            priority="low",
            action_url="/influencer/learn",
            metadata={
                "tip_category": tip_category,
                "tip_content": tip_content,
                "tip_date": datetime.utcnow().isoformat()
            }
        )

    async def cleanup_old_notifications(self, days_old: int = 30):
        """Clean up notifications older than specified days"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            result = self.notifications_collection.delete_many({
                "created_at": {"$lt": cutoff_date}
            })
            
            logger.info(f"🧹 Cleaned up {result.deleted_count} influencer notifications older than {days_old} days")
            return result.deleted_count
            
        except Exception as e:
            logger.error(f"❌ Error cleaning up old influencer notifications: {str(e)}")
            return 0

# Global instance
influencer_notification_service = InfluencerNotificationService()

# ==================== UTILITY FUNCTIONS ====================

def get_influencer_id_from_user(current_user: Dict) -> str:
    """Extract influencer ID from current_user, handling different field names"""
    influencer_id = current_user.get("user_id") or current_user.get("id") or current_user.get("_id")
    
    if not influencer_id:
        logger.error(f"❌ No user ID found in current_user. Available keys: {list(current_user.keys())}")
        raise HTTPException(status_code=400, detail="User ID not found in authentication token")
    
    if isinstance(influencer_id, ObjectId):
        return str(influencer_id)
    
    return influencer_id

def validate_influencer_user(current_user: Dict):
    """Validate that the current user is an influencer"""
    if current_user.get("role") != "influencer":
        logger.warning(f"❌ Non-influencer user attempted to access influencer notifications: {current_user.get('role')}")
        raise HTTPException(status_code=403, detail="Only influencers can access influencer notifications")

# ==================== NOTIFICATION TRIGGER FUNCTIONS ====================

async def trigger_influencer_registration_notifications(influencer_id: str, username: str, email: str, background_tasks: BackgroundTasks):
    """Trigger all registration-related notifications for influencers"""
    background_tasks.add_task(
        influencer_notification_service.notify_registration_success,
        influencer_id, username, email
    )

async def trigger_influencer_login_notifications(influencer_id: str, username: str, auth_method: str = "email", background_tasks: BackgroundTasks = None):
    """Trigger login-related notifications for influencers"""
    login_time = datetime.utcnow()
    
    if auth_method == "google":
        if background_tasks:
            background_tasks.add_task(
                influencer_notification_service.notify_google_login_success,
                influencer_id, username, login_time
            )
        else:
            await influencer_notification_service.notify_google_login_success(influencer_id, username, login_time)
    else:
        if background_tasks:
            background_tasks.add_task(
                influencer_notification_service.notify_login_alert,
                influencer_id, username, login_time
            )
        else:
            await influencer_notification_service.notify_login_alert(influencer_id, username, login_time)

async def trigger_influencer_password_change_notification(influencer_id: str, username: str, background_tasks: BackgroundTasks = None):
    """Trigger password change notification for influencers"""
    change_time = datetime.utcnow()
    
    if background_tasks:
        background_tasks.add_task(
            influencer_notification_service.notify_password_change,
            influencer_id, username, change_time
        )
    else:
        await influencer_notification_service.notify_password_change(influencer_id, username, change_time)

async def trigger_application_status_notification(influencer_id: str, campaign_id: str, brand_name: str, status: str, background_tasks: BackgroundTasks = None):
    """Trigger application status notification"""
    if background_tasks:
        background_tasks.add_task(
            influencer_notification_service.notify_application_status,
            influencer_id, campaign_id, brand_name, status
        )
    else:
        await influencer_notification_service.notify_application_status(influencer_id, campaign_id, brand_name, status)
        
        
# Add to InfluencerNotificationService class

async def notify_profile_updated(self, influencer_id: str, username: str, updated_fields: List[str], completion_data: Dict):
    """Notify influencer about profile updates"""
    title = "✅ Profile Updated"
    
    if len(updated_fields) == 1:
        message = f"Your {updated_fields[0].replace('_', ' ')} has been updated. Profile is now {completion_data['completion_percentage']}% complete."
    else:
        message = f"Your profile has been updated with {len(updated_fields)} changes. Profile is now {completion_data['completion_percentage']}% complete."

    await self.create_notification(
        influencer_id=influencer_id,
        notification_type="profile_updated",
        title=title,
        message=message,
        priority="medium",
        action_url="/influencer/profile",
        metadata={
            "username": username,
            "updated_fields": updated_fields,
            "completion_data": completion_data,
            "update_date": datetime.utcnow().isoformat()
        }
    )

async def notify_profile_strength_improved(self, influencer_id: str, username: str, old_strength: str, new_strength: str, completion_percentage: int):
    """Notify influencer about profile strength improvement"""
    title = "🚀 Profile Strength Improved!"
    message = f"Your profile strength improved from {old_strength} to {new_strength} ({completion_percentage}% complete). This increases your chances of getting selected for campaigns!"

    await self.create_notification(
        influencer_id=influencer_id,
        notification_type="profile_strength",
        title=title,
        message=message,
        priority="medium",
        action_url="/influencer/profile",
        metadata={
            "username": username,
            "old_strength": old_strength,
            "new_strength": new_strength,
            "completion_percentage": completion_percentage,
            "improvement_date": datetime.utcnow().isoformat()
        }
    )

async def notify_profile_approved(self, influencer_id: str, username: str):
    """Notify influencer about profile approval"""
    title = "✅ Profile Approved!"
    message = "Your influencer profile has been approved and is now visible to brands. You can start applying to campaigns!"
    action_url = "/influencer/campaigns"

    await self.create_notification(
        influencer_id=influencer_id,
        notification_type="profile_approved",
        title=title,
        message=message,
        priority="high",
        action_url=action_url,
        metadata={
            "username": username,
            "approval_date": datetime.utcnow().isoformat(),
            "status": "active"
        }
    )

# ==================== FASTAPI ROUTES ====================

@router.get("/influencer/notifications")
async def get_influencer_notifications(
    skip: int = 0,
    limit: int = 10000000,
    unread_only: bool = False,
    current_user: Dict = Depends(get_current_user)
):
    """Get influencer notifications"""
    try:
        validate_influencer_user(current_user)
        influencer_id = get_influencer_id_from_user(current_user)
        
        logger.info(f"📨 Fetching notifications for influencer {influencer_id}, unread_only: {unread_only}")
        
        notifications = await influencer_notification_service.get_influencer_notifications(
            influencer_id=influencer_id,
            skip=skip,
            limit=limit,
            unread_only=unread_only
        )
        
        unread_count = await influencer_notification_service.get_unread_count(influencer_id)
        
        logger.info(f"✅ Found {len(notifications)} notifications, {unread_count} unread for influencer {influencer_id}")
        
        return {
            "notifications": notifications,
            "unread_count": unread_count,
            "total": len(notifications)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting influencer notifications: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")

@router.post("/influencer/notifications/{notification_id}/read")
async def mark_influencer_notification_read(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Mark influencer notification as read"""
    try:
        validate_influencer_user(current_user)
        influencer_id = get_influencer_id_from_user(current_user)
        
        logger.info(f"📖 Marking notification {notification_id} as read for influencer {influencer_id}")
        
        success = await influencer_notification_service.mark_as_read(
            notification_id=notification_id,
            influencer_id=influencer_id
        )
        
        if not success:
            logger.warning(f"⚠️ Notification {notification_id} not found for influencer {influencer_id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        logger.info(f"✅ Successfully marked notification {notification_id} as read")
        return {"message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error marking influencer notification as read: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.post("/influencer/notifications/read-all")
async def mark_all_influencer_notifications_read(current_user: Dict = Depends(get_current_user)):
    """Mark all influencer notifications as read"""
    try:
        validate_influencer_user(current_user)
        influencer_id = get_influencer_id_from_user(current_user)
        
        logger.info(f"📖 Marking all notifications as read for influencer {influencer_id}")
        
        success = await influencer_notification_service.mark_all_as_read(influencer_id)
        
        if success:
            logger.info(f"✅ Successfully marked all notifications as read for influencer {influencer_id}")
            return {"message": "All notifications marked as read"}
        else:
            logger.info(f"ℹ️ No unread notifications found for influencer {influencer_id}")
            return {"message": "No unread notifications found"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error marking all influencer notifications as read: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark all notifications as read")

@router.delete("/influencer/notifications/{notification_id}")
async def delete_influencer_notification(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete influencer notification"""
    try:
        validate_influencer_user(current_user)
        influencer_id = get_influencer_id_from_user(current_user)
        
        logger.info(f"🗑️ Deleting notification {notification_id} for influencer {influencer_id}")
        
        success = await influencer_notification_service.delete_notification(
            notification_id=notification_id,
            influencer_id=influencer_id
        )
        
        if not success:
            logger.warning(f"⚠️ Notification {notification_id} not found for influencer {influencer_id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        logger.info(f"✅ Successfully deleted notification {notification_id}")
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting influencer notification: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete notification")

@router.get("/influencer/notifications/stats")
async def get_influencer_notification_stats(current_user: Dict = Depends(get_current_user)):
    """Get influencer notification statistics"""
    try:
        validate_influencer_user(current_user)
        influencer_id = get_influencer_id_from_user(current_user)
        
        # Get total notifications count
        total_count = influencer_notification_service.notifications_collection.count_documents({
            "influencer_id": ObjectId(influencer_id)
        })
        
        # Get unread count
        unread_count = await influencer_notification_service.get_unread_count(influencer_id)
        
        # Get notifications by type
        application_notifications = influencer_notification_service.notifications_collection.count_documents({
            "influencer_id": ObjectId(influencer_id),
            "type": "application_status"
        })
        
        payment_notifications = influencer_notification_service.notifications_collection.count_documents({
            "influencer_id": ObjectId(influencer_id),
            "type": {"$in": ["payment_received", "payment_pending"]}
        })
        
        message_notifications = influencer_notification_service.notifications_collection.count_documents({
            "influencer_id": ObjectId(influencer_id),
            "type": {"$in": ["new_message", "brand_response"]}
        })
        
        return {
            "total_count": total_count,
            "unread_count": unread_count,
            "read_count": total_count - unread_count,
            "by_type": {
                "application_updates": application_notifications,
                "payment_updates": payment_notifications,
                "messages": message_notifications,
                "other": total_count - (application_notifications + payment_notifications + message_notifications)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting influencer notification stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch notification statistics")

@router.post("/influencer/notifications/test")
async def create_test_influencer_notification(current_user: Dict = Depends(get_current_user)):
    """Create a test notification for debugging"""
    try:
        validate_influencer_user(current_user)
        influencer_id = get_influencer_id_from_user(current_user)
        
        logger.info(f"🧪 Creating test notification for influencer {influencer_id}")
        
        # Create a test notification
        test_notification = await influencer_notification_service.create_notification(
            influencer_id=influencer_id,
            notification_type="application_status",
            title="🎉 Test Notification - Welcome!",
            message="This is a test notification to verify the influencer notification system is working properly. You're all set to receive campaign updates!",
            priority="medium",
            action_url="/influencer/dashboard",
            metadata={
                "test": True,
                "created_at": datetime.utcnow().isoformat(),
                "system_check": "passed"
            }
        )
        
        logger.info(f"✅ Successfully created test notification: {test_notification['_id']}")
        
        return {
            "message": "Test notification created successfully",
            "notification": test_notification
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating test influencer notification: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create test notification")

@router.post("/influencer/notifications/cleanup")
async def cleanup_influencer_notifications(days_old: int = 30, current_user: Dict = Depends(get_current_user)):
    """Clean up old influencer notifications"""
    try:
        validate_influencer_user(current_user)
        
        cleaned_count = await influencer_notification_service.cleanup_old_notifications(days_old)
        
        return {
            "message": f"Cleaned up {cleaned_count} influencer notifications older than {days_old} days",
            "cleaned_count": cleaned_count
        }
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up influencer notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clean up notifications")
    
# ==================== MESSAGE NOTIFICATION TRIGGERS ====================

async def trigger_influencer_new_message_notification(
    influencer_id: str,
    sender_name: str,
    message_preview: str = "",
    conversation_id: str = None
):
    """
    Triggered when influencer receives a new message in chat.
    """
    try:
        await influencer_notification_service.notify_new_message(
            influencer_id=influencer_id,
            brand_name=sender_name,
            campaign_id=None,
            message_preview=message_preview
        )
    except Exception as e:
        logger.error(f"❌ Failed to trigger influencer new message notification: {e}")


async def trigger_influencer_conversation_started_notification(
    influencer_id: str,
    sender_name: str
):
    """
    Triggered when a new chat conversation is started.
    """
    try:
        await influencer_notification_service.create_notification(
            influencer_id=influencer_id,
            notification_type="conversation_started",
            title="New Conversation Started",
            message=f"{sender_name} started a conversation with you.",
            priority="medium",
            action_url="/influencer/messages",
            metadata={
                "sender_name": sender_name
            }
        )
    except Exception as e:
        logger.error(f"❌ Failed to trigger influencer conversation start notification: {e}")
