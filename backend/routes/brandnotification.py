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
FREE_TRIAL_DAYS = 15

class BrandNotificationService:
    def __init__(self):
        self.notifications_collection = db["brand_notifications"]
        self.users_collection = db["users"]
        self.campaigns_collection = db["campaigns"]
        self.subscriptions_collection = db["subscriptions"]
        self.payments_collection = db["payments"]
        self.applications_collection = db["applications"]

    async def create_notification(
        self,
        brand_id: str,
        notification_type: str,
        title: str,
        message: str,
        priority: str = "medium",
        action_url: Optional[str] = None,
        metadata: Optional[Dict] = None,
        real_time_alert: bool = False
    ) -> Dict:
        """Create a new notification for brand with real-time alert support"""
        try:
            notification_data = {
                "brand_id": ObjectId(brand_id),
                "type": notification_type,
                "title": title,
                "message": message,
                "priority": priority,
                "is_read": False,
                "action_url": action_url,
                "metadata": metadata or {},
                "real_time_alert": real_time_alert,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = self.notifications_collection.insert_one(notification_data)
            notification_data["_id"] = str(result.inserted_id)
            
            logger.info(f"✅ Created brand notification for {brand_id}: {title}")
            return notification_data
            
        except Exception as e:
            logger.error(f"❌ Error creating brand notification: {str(e)}")
            raise

    async def get_brand_notifications(
        self, 
        brand_id: str, 
        limit: int = 50, 
        skip: int = 0,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications for a brand"""
        try:
            query = {"brand_id": ObjectId(brand_id)}
            if unread_only:
                query["is_read"] = False

            cursor = self.notifications_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            notifications = list(cursor)
            
            # Convert ObjectId to string for JSON serialization
            for notification in notifications:
                notification["_id"] = str(notification["_id"])
                notification["brand_id"] = str(notification["brand_id"])
                
            return notifications
            
        except Exception as e:
            logger.error(f"❌ Error getting brand notifications: {str(e)}")
            return []

    async def mark_as_read(self, notification_id: str, brand_id: str) -> bool:
        """Mark a notification as read"""
        try:
            result = self.notifications_collection.update_one(
                {
                    "_id": ObjectId(notification_id),
                    "brand_id": ObjectId(brand_id)
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

    async def mark_all_as_read(self, brand_id: str) -> bool:
        """Mark all notifications as read for a brand"""
        try:
            result = self.notifications_collection.update_many(
                {
                    "brand_id": ObjectId(brand_id),
                    "is_read": False
                },
                {
                    "$set": {
                        "is_read": True,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"✅ Marked {result.modified_count} notifications as read for brand {brand_id}")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"❌ Error marking all notifications as read: {str(e)}")
            return False

    async def get_unread_count(self, brand_id: str) -> int:
        """Get count of unread notifications"""
        try:
            count = self.notifications_collection.count_documents({
                "brand_id": ObjectId(brand_id),
                "is_read": False
            })
            return count
            
        except Exception as e:
            logger.error(f"❌ Error getting unread count: {str(e)}")
            return 0

    async def delete_notification(self, notification_id: str, brand_id: str) -> bool:
        """Delete a notification"""
        try:
            result = self.notifications_collection.delete_one({
                "_id": ObjectId(notification_id),
                "brand_id": ObjectId(brand_id)
            })
            
            if result.deleted_count > 0:
                logger.info(f"✅ Deleted notification {notification_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"❌ Error deleting notification: {str(e)}")
            return False

    # ==================== AUTH & SUBSCRIPTION NOTIFICATIONS ====================

    async def notify_registration_success(self, brand_id: str, username: str, email: str):
        """Notify brand about successful registration"""
        title = "🎉 Welcome to Our Platform!"
        message = f"Hello {username}, your account has been created successfully. You can now start creating campaigns and connecting with influencers."
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="registration_success",
            title=title,
            message=message,
            priority="high",
            action_url="/brand/dashboard",
            metadata={
                "username": username,
                "email": email,
                "registration_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_login_alert(self, brand_id: str, username: str, login_time: datetime):
        """Notify brand about login activity"""
        title = "🔐 Login Alert"
        message = f"Your account was successfully logged in at {login_time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="login_alert",
            title=title,
            message=message,
            priority="medium",
            action_url="/brand/security",
            metadata={
                "username": username,
                "login_time": login_time.isoformat(),
                "device_info": "Web Browser"
            }
        )

    async def notify_google_login_success(self, brand_id: str, username: str, login_time: datetime):
        """Notify brand about successful Google login"""
        title = "🔐 Google Login Successful"
        message = f"You've successfully logged in using Google at {login_time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="google_login",
            title=title,
            message=message,
            priority="medium",
            action_url="/brand/profile",
            metadata={
                "username": username,
                "login_time": login_time.isoformat(),
                "auth_method": "Google OAuth"
            }
        )

    async def notify_subscription_status(self, brand_id: str, plan: str, status: str, is_trial: bool = False, trial_end: datetime = None):
        """Notify brand about subscription status"""
        if is_trial:
            title = "🚀 Free Trial Activated"
            message = f"Your {FREE_TRIAL_DAYS}-day free trial has started! Enjoy premium features until {trial_end.strftime('%Y-%m-%d')}."
        elif status == "active":
            title = "✅ Subscription Activated"
            message = f"Your {plan} subscription is now active. Thank you for upgrading!"
        elif status == "canceled":
            title = "❌ Subscription Canceled"
            message = f"Your {plan} subscription has been canceled. You'll lose access to premium features at the end of billing period."
        else:
            title = "📊 Subscription Update"
            message = f"Your subscription has been updated to {plan}."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="subscription_update",
            title=title,
            message=message,
            priority="high" if is_trial else "medium",
            action_url="/brand/subscription",
            metadata={
                "plan": plan,
                "status": status,
                "is_trial": is_trial,
                "trial_end": trial_end.isoformat() if trial_end else None,
                "update_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_trial_ending(self, brand_id: str, days_remaining: int, trial_end: datetime):
        """Notify brand about trial ending soon"""
        title = "⏰ Trial Ending Soon"
        message = f"Your free trial ends in {days_remaining} day(s) on {trial_end.strftime('%Y-%m-%d')}. Upgrade now to continue using premium features."
        
        priority = "urgent" if days_remaining <= 3 else "high"
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="trial_ending",
            title=title,
            message=message,
            priority=priority,
            action_url="/brand/subscription",
            metadata={
                "days_remaining": days_remaining,
                "trial_end": trial_end.isoformat(),
                "notification_date": datetime.utcnow().isoformat()
            }
        )

    async def notify_password_change(self, brand_id: str, username: str, change_time: datetime):
        """Notify brand about password change"""
        title = "🔒 Password Changed"
        message = f"Your password was successfully changed at {change_time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="password_change",
            title=title,
            message=message,
            priority="medium",
            action_url="/brand/security",
            metadata={
                "username": username,
                "change_time": change_time.isoformat(),
                "security_level": "enhanced"
            }
        )

    # ==================== CAMPAIGN CREATION & LIMIT NOTIFICATIONS ====================

    async def notify_campaign_created(self, brand_id: str, campaign_id: str, campaign_title: str, usage_stats: Dict):
        """Notify brand about successful campaign creation"""
        title = "🚀 Campaign Created Successfully!"
        message = f"Your campaign '{campaign_title}' has been created and is now live for influencers to apply."
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_created",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign_title,
                "usage_stats": usage_stats,
                "creation_date": datetime.utcnow().isoformat(),
                "campaign_status": "active"
            },
            real_time_alert=True
        )

    async def notify_campaign_limit_warning(self, brand_id: str, plan_name: str, usage: Dict, limit_type: str):
        """Notify brand about approaching campaign limits"""
        if limit_type == "daily":
            title = "📊 Daily Campaign Limit Warning"
            message = f"You've created {usage['today_campaigns']} campaigns today. You're approaching your daily limit."
        else:
            title = "📊 Total Campaign Limit Warning"
            message = f"You've created {usage['total_campaigns']} total campaigns. You're approaching your plan limit."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_limit_warning",
            title=title,
            message=message,
            priority="high",
            action_url="/brand/subscription",
            metadata={
                "plan_name": plan_name,
                "usage": usage,
                "limit_type": limit_type,
                "warning_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    async def notify_campaign_limit_reached(self, brand_id: str, plan_name: str, usage: Dict, limit_type: str):
        """Notify brand about reached campaign limits"""
        if limit_type == "daily":
            title = "⛔ Daily Campaign Limit Reached"
            message = f"You've reached your daily campaign limit of {usage.get('limit', 0)}. Upgrade to create more campaigns."
        else:
            title = "⛔ Total Campaign Limit Reached"
            message = f"You've reached your total campaign limit of {usage.get('limit', 0)}. Upgrade your plan for more capacity."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_limit_reached",
            title=title,
            message=message,
            priority="urgent",
            action_url="/brand/subscription",
            metadata={
                "plan_name": plan_name,
                "usage": usage,
                "limit_type": limit_type,
                "reached_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    # ==================== CAMPAIGN APPLICATION NOTIFICATIONS ====================

    async def notify_campaign_application(self, brand_id: str, campaign_id: str, influencer_username: str, application_id: str):
        """Notify brand about new campaign application"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "📥 New Campaign Application"
        message = f"{influencer_username} has applied to your campaign '{campaign.get('title', 'Unknown Campaign')}'"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_application",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}/applications",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "influencer_username": influencer_username,
                "application_id": application_id,
                "application_date": datetime.utcnow().isoformat(),
                "application_status": "pending"
            },
            real_time_alert=True
        )

    async def notify_application_status_update(self, brand_id: str, campaign_id: str, influencer_username: str, old_status: str, new_status: str):
        """Notify brand about application status change"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        status_messages = {
            "approved": "✅ Application Approved",
            "rejected": "❌ Application Rejected", 
            "contracted": "📝 Contract Sent",
            "media_submitted": "🎬 Media Submitted",
            "completed": "🎯 Campaign Completed"
        }

        title = status_messages.get(new_status, "📊 Application Updated")
        message = f"Application from {influencer_username} for '{campaign.get('title')}' has been {new_status}"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="application_status_update",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}/applications",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "influencer_username": influencer_username,
                "old_status": old_status,
                "new_status": new_status,
                "update_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    async def notify_pending_applications_reminder(self, brand_id: str, campaign_id: str, pending_count: int):
        """Notify brand about pending applications that need review"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "⏰ Pending Applications Need Review"
        message = f"You have {pending_count} pending application(s) for campaign '{campaign.get('title')}' that need your attention"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="pending_applications_reminder",
            title=title,
            message=message,
            priority="high",
            action_url=f"/brand/campaigns/{campaign_id}/applications",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "pending_count": pending_count,
                "reminder_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    # ==================== CAMPAIGN STATUS NOTIFICATIONS ====================

    async def notify_campaign_status_change(self, brand_id: str, campaign_id: str, old_status: str, new_status: str):
        """Notify brand about campaign status change"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        status_messages = {
            "active": "🟢 Campaign Activated",
            "paused": "⏸️ Campaign Paused", 
            "completed": "🎯 Campaign Completed",
            "cancelled": "❌ Campaign Cancelled"
        }

        title = status_messages.get(new_status, "📊 Campaign Status Updated")
        message = f"Campaign '{campaign.get('title')}' status changed from {old_status} to {new_status}"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_status_change",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "old_status": old_status,
                "new_status": new_status,
                "change_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    async def notify_campaign_deadline_approaching(self, brand_id: str, campaign_id: str, days_remaining: int):
        """Notify brand about approaching campaign deadline"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "⏰ Campaign Deadline Approaching"
        message = f"Campaign '{campaign.get('title')}' deadline is in {days_remaining} day(s)"

        priority = "urgent" if days_remaining <= 3 else "high"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_deadline",
            title=title,
            message=message,
            priority=priority,
            action_url=f"/brand/campaigns/{campaign_id}",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "days_remaining": days_remaining,
                "deadline_date": campaign.get('deadline'),
                "notification_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    async def notify_campaign_expired(self, brand_id: str, campaign_id: str):
        """Notify brand about expired campaign"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "📅 Campaign Expired"
        message = f"Campaign '{campaign.get('title')}' has reached its deadline and is now expired"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_expired",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "expiry_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    # ==================== PAYMENT & BILLING NOTIFICATIONS ====================

    async def notify_payment_success(self, brand_id: str, amount: float, plan: str, campaign_title: str = None):
        """Notify brand about successful payment"""
        if campaign_title:
            title = "💳 Campaign Payment Successful"
            message = f"Payment of ${amount} for campaign '{campaign_title}' has been processed successfully."
        else:
            title = "💳 Subscription Payment Successful"
            message = f"Payment of ${amount} for {plan} plan has been processed successfully."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="payment_success",
            title=title,
            message=message,
            priority="medium",
            action_url="/brand/billing",
            metadata={
                "amount": amount,
                "plan": plan,
                "campaign_title": campaign_title,
                "payment_date": datetime.utcnow().isoformat(),
                "payment_status": "completed"
            },
            real_time_alert=True
        )

    async def notify_payment_failed(self, brand_id: str, plan: str, campaign_title: str = None):
        """Notify brand about failed payment"""
        if campaign_title:
            title = "❌ Campaign Payment Failed"
            message = f"Payment for campaign '{campaign_title}' failed. Please update your payment method."
        else:
            title = "❌ Subscription Payment Failed"
            message = f"Payment for your {plan} subscription failed. Please update your payment method to avoid service interruption."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="payment_failed",
            title=title,
            message=message,
            priority="urgent",
            action_url="/brand/billing",
            metadata={
                "plan": plan,
                "campaign_title": campaign_title,
                "failure_date": datetime.utcnow().isoformat(),
                "payment_status": "failed"
            },
            real_time_alert=True
        )

    async def notify_payment_pending(self, brand_id: str, amount: float, campaign_title: str):
        """Notify brand about pending payment"""
        title = "⏳ Payment Pending"
        message = f"Payment of ${amount} for campaign '{campaign_title}' is pending confirmation."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="payment_pending",
            title=title,
            message=message,
            priority="high",
            action_url="/brand/billing",
            metadata={
                "amount": amount,
                "campaign_title": campaign_title,
                "pending_since": datetime.utcnow().isoformat(),
                "payment_status": "pending"
            },
            real_time_alert=True
        )

    async def notify_refund_processed(self, brand_id: str, amount: float, campaign_title: str):
        """Notify brand about refund processing"""
        title = "💸 Refund Processed"
        message = f"Refund of ${amount} for campaign '{campaign_title}' has been processed."

        await self.create_notification(
            brand_id=brand_id,
            notification_type="refund_processed",
            title=title,
            message=message,
            priority="medium",
            action_url="/brand/billing",
            metadata={
                "amount": amount,
                "campaign_title": campaign_title,
                "refund_date": datetime.utcnow().isoformat(),
                "refund_status": "processed"
            },
            real_time_alert=True
        )

    # ==================== CAMPAIGN ANALYTICS NOTIFICATIONS ====================

    async def notify_campaign_performance(self, brand_id: str, campaign_id: str, analytics: Dict):
        """Notify brand about campaign performance metrics"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "📊 Campaign Performance Update"
        message = f"Campaign '{campaign.get('title')}' has {analytics.get('views', 0)} views and {analytics.get('applications', 0)} applications"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="campaign_performance",
            title=title,
            message=message,
            priority="low",
            action_url=f"/brand/campaigns/{campaign_id}/analytics",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "analytics": analytics,
                "report_date": datetime.utcnow().isoformat()
            },
            real_time_alert=False
        )

    async def notify_application_summary(self, brand_id: str, summary: Dict):
        """Notify brand about daily/weekly application summary"""
        total_applications = summary.get('total_applications', 0)
        new_applications = summary.get('new_applications', 0)

        title = "📈 Application Summary"
        message = f"You received {new_applications} new applications today. Total: {total_applications}"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="application_summary",
            title=title,
            message=message,
            priority="low",
            action_url="/brand/applications",
            metadata={
                "summary": summary,
                "summary_date": datetime.utcnow().isoformat()
            },
            real_time_alert=False
        )

    # ==================== MEDIA & CONTENT NOTIFICATIONS ====================

    async def notify_media_submitted(self, brand_id: str, campaign_id: str, influencer_username: str, media_count: int):
        """Notify brand about media submission from influencer"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "🎬 Media Content Submitted"
        message = f"{influencer_username} submitted {media_count} media file(s) for campaign '{campaign.get('title')}'"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="media_submitted",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}/media",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "influencer_username": influencer_username,
                "media_count": media_count,
                "submission_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    async def notify_media_approved(self, brand_id: str, campaign_id: str, influencer_username: str):
        """Notify brand about media approval"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "✅ Media Approved"
        message = f"Media from {influencer_username} for campaign '{campaign.get('title')}' has been approved"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="media_approved",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}/media",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "influencer_username": influencer_username,
                "approval_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    async def notify_media_revision_requested(self, brand_id: str, campaign_id: str, influencer_username: str):
        """Notify brand about media revision request"""
        campaign = self.campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return

        title = "🔄 Media Revision Requested"
        message = f"Revision requested for media from {influencer_username} for campaign '{campaign.get('title')}'"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="media_revision",
            title=title,
            message=message,
            priority="medium",
            action_url=f"/brand/campaigns/{campaign_id}/media",
            metadata={
                "campaign_id": campaign_id,
                "campaign_title": campaign.get('title'),
                "influencer_username": influencer_username,
                "revision_date": datetime.utcnow().isoformat()
            },
            real_time_alert=True
    )

    # ==================== REAL-TIME DASHBOARD ALERTS ====================

    async def notify_dashboard_alert(self, brand_id: str, alert_type: str, data: Dict):
        """Send real-time dashboard alerts for important activities"""
        alert_templates = {
            "high_application_volume": {
                "title": "🚀 High Application Volume!",
                "message": f"You received {data.get('count', 0)} applications in the last hour",
                "priority": "high"
            },
            "campaign_trending": {
                "title": "🔥 Campaign Trending!",
                "message": f"Campaign '{data.get('campaign_title')}' is getting high engagement",
                "priority": "medium"
            },
            "influencer_engagement": {
                "title": "💫 Top Influencer Applied!",
                "message": f"A high-rated influencer applied to your campaign",
                "priority": "high"
            },
            "payment_reminder": {
                "title": "💳 Payment Action Required",
                "message": f"Pending payment for campaign '{data.get('campaign_title')}' needs attention",
                "priority": "urgent"
            }
        }

        template = alert_templates.get(alert_type, {
            "title": "📢 Dashboard Alert",
            "message": "New activity requires your attention",
            "priority": "medium"
        })

        await self.create_notification(
            brand_id=brand_id,
            notification_type="dashboard_alert",
            title=template["title"],
            message=template["message"],
            priority=template["priority"],
            action_url="/brand/dashboard",
            metadata={
                "alert_type": alert_type,
                "alert_data": data,
                "alert_time": datetime.utcnow().isoformat()
            },
            real_time_alert=True
        )

    # ==================== BULK NOTIFICATION METHODS ====================

    async def notify_campaign_creation_summary(self, brand_id: str, created_count: int, total_allowed: int, period: str = "day"):
        """Send summary of campaign creation activity"""
        title = "📊 Campaign Creation Summary"
        message = f"You created {created_count} campaign(s) this {period}. Remaining: {total_allowed - created_count}"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="creation_summary",
            title=title,
            message=message,
            priority="low",
            action_url="/brand/campaigns",
            metadata={
                "created_count": created_count,
                "total_allowed": total_allowed,
                "period": period,
                "summary_date": datetime.utcnow().isoformat()
            },
            real_time_alert=False
        )

    async def notify_weekly_analytics(self, brand_id: str, analytics: Dict):
        """Send weekly campaign analytics summary"""
        title = "📈 Weekly Campaign Report"
        message = f"Your campaigns received {analytics.get('total_applications', 0)} applications and {analytics.get('total_views', 0)} views this week"

        await self.create_notification(
            brand_id=brand_id,
            notification_type="weekly_analytics",
            title=title,
            message=message,
            priority="low",
            action_url="/brand/analytics",
            metadata={
                "analytics": analytics,
                "report_period": "weekly",
                "report_date": datetime.utcnow().isoformat()
            },
            real_time_alert=False
        )

    # ==================== SYSTEM & MAINTENANCE NOTIFICATIONS ====================

    async def notify_system_update(self, brand_id: str, update_details: str):
        """Notify brand about system updates"""
        title = "🔄 System Update"
        message = f"System update: {update_details}"
        
        await self.create_notification(
            brand_id=brand_id,
            notification_type="system_update",
            title=title,
            message=message,
            priority="low",
            action_url="/brand/help",
            metadata={
                "update_details": update_details,
                "notification_date": datetime.utcnow().isoformat()
            }
        )

    async def cleanup_old_notifications(self, days_old: int = 30):
        """Clean up notifications older than specified days"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            result = self.notifications_collection.delete_many({
                "created_at": {"$lt": cutoff_date}
            })
            
            logger.info(f"🧹 Cleaned up {result.deleted_count} notifications older than {days_old} days")
            return result.deleted_count
            
        except Exception as e:
            logger.error(f"❌ Error cleaning up old notifications: {str(e)}")
            return 0
        
        # Add to BrandNotificationService class

async def notify_profile_incomplete(self, brand_id: str, username: str, completion_percentage: int, missing_fields: List[str]):
    """Notify brand about incomplete profile"""
    title = "📝 Complete Your Profile"
    
    if completion_percentage < 30:
        message = f"Your profile is only {completion_percentage}% complete. Add basic information to get started with campaigns."
        priority = "high"
    elif completion_percentage < 70:
        message = f"Your profile is {completion_percentage}% complete. Add {', '.join(missing_fields[:3])} to attract more influencers."
        priority = "medium"
    else:
        message = f"Your profile is {completion_percentage}% complete. Just a few more details needed for optimal results."
        priority = "low"

    await self.create_notification(
        brand_id=brand_id,
        notification_type="profile_incomplete",
        title=title,
        message=message,
        priority=priority,
        action_url="/brand/profile",
        metadata={
            "username": username,
            "completion_percentage": completion_percentage,
            "missing_fields": missing_fields,
            "reminder_type": "profile_completion"
        }
    )

async def notify_profile_updated(self, brand_id: str, username: str, updated_fields: List[str], completion_data: Dict):
    """Notify brand about profile updates"""
    title = "✅ Profile Updated"
    
    if len(updated_fields) == 1:
        message = f"Your {updated_fields[0].replace('_', ' ')} has been updated. Profile is now {completion_data['completion_percentage']}% complete."
    else:
        message = f"Your profile has been updated with {len(updated_fields)} changes. Profile is now {completion_data['completion_percentage']}% complete."

    await self.create_notification(
        brand_id=brand_id,
        notification_type="profile_updated",
        title=title,
        message=message,
        priority="medium",
        action_url="/brand/profile",
        metadata={
            "username": username,
            "updated_fields": updated_fields,
            "completion_data": completion_data,
            "update_date": datetime.utcnow().isoformat()
        }
    )

async def notify_profile_strength_improved(self, brand_id: str, username: str, old_strength: str, new_strength: str, completion_percentage: int):
    """Notify brand about profile strength improvement"""
    title = "🚀 Profile Strength Improved!"
    message = f"Your profile strength improved from {old_strength} to {new_strength} ({completion_percentage}% complete). Great work!"

    await self.create_notification(
        brand_id=brand_id,
        notification_type="profile_strength",
        title=title,
        message=message,
        priority="medium",
        action_url="/brand/profile",
        metadata={
            "username": username,
            "old_strength": old_strength,
            "new_strength": new_strength,
            "completion_percentage": completion_percentage,
            "improvement_date": datetime.utcnow().isoformat()
        }
    )

# Global instance
brand_notification_service = BrandNotificationService()

# ==================== UTILITY FUNCTIONS ====================

def get_brand_id_from_user(current_user: Dict) -> str:
    """Extract brand ID from current_user, handling different field names"""
    # Try different possible field names for user ID
    brand_id = current_user.get("user_id") or current_user.get("id") or current_user.get("_id")
    
    if not brand_id:
        logger.error(f"❌ No user ID found in current_user. Available keys: {list(current_user.keys())}")
        raise HTTPException(status_code=400, detail="User ID not found in authentication token")
    
    # Convert ObjectId to string if needed
    if isinstance(brand_id, ObjectId):
        return str(brand_id)
    
    return brand_id

def validate_brand_user(current_user: Dict):
    """Validate that the current user is a brand"""
    if current_user.get("role") != "brand":
        logger.warning(f"❌ Non-brand user attempted to access brand notifications: {current_user.get('role')}")
        raise HTTPException(status_code=403, detail="Only brands can access brand notifications")

# ==================== NOTIFICATION TRIGGER FUNCTIONS ====================

async def trigger_registration_notifications(brand_id: str, username: str, email: str, background_tasks: BackgroundTasks):
    """Trigger all registration-related notifications"""
    background_tasks.add_task(
        brand_notification_service.notify_registration_success,
        brand_id, username, email
    )

async def trigger_login_notifications(brand_id: str, username: str, auth_method: str = "email", background_tasks: BackgroundTasks = None):
    """Trigger login-related notifications"""
    login_time = datetime.utcnow()
    
    if auth_method == "google":
        if background_tasks:
            background_tasks.add_task(
                brand_notification_service.notify_google_login_success,
                brand_id, username, login_time
            )
        else:
            await brand_notification_service.notify_google_login_success(brand_id, username, login_time)
    else:
        if background_tasks:
            background_tasks.add_task(
                brand_notification_service.notify_login_alert,
                brand_id, username, login_time
            )
        else:
            await brand_notification_service.notify_login_alert(brand_id, username, login_time)

async def trigger_subscription_notifications(
    brand_id: str, 
    plan: str, 
    status: str, 
    is_trial: bool = False, 
    trial_end: datetime = None,
    background_tasks: BackgroundTasks = None
):
    """Trigger subscription-related notifications"""
    if background_tasks:
        background_tasks.add_task(
            brand_notification_service.notify_subscription_status,
            brand_id, plan, status, is_trial, trial_end
        )
    else:
        await brand_notification_service.notify_subscription_status(
            brand_id, plan, status, is_trial, trial_end
        )

async def trigger_password_change_notification(brand_id: str, username: str, background_tasks: BackgroundTasks = None):
    """Trigger password change notification"""
    change_time = datetime.utcnow()
    
    if background_tasks:
        background_tasks.add_task(
            brand_notification_service.notify_password_change,
            brand_id, username, change_time
        )
    else:
        await brand_notification_service.notify_password_change(brand_id, username, change_time)
        
        


async def trigger_campaign_creation_notifications(
    brand_id: str, 
    campaign_id: str, 
    campaign_title: str, 
    usage_stats: Dict,
    background_tasks: BackgroundTasks = None
):
    """Trigger all campaign creation related notifications"""
    if background_tasks:
        background_tasks.add_task(
            brand_notification_service.notify_campaign_created,
            brand_id, campaign_id, campaign_title, usage_stats
        )
    else:
        await brand_notification_service.notify_campaign_created(
            brand_id, campaign_id, campaign_title, usage_stats
        )

async def trigger_application_notifications(
    brand_id: str,
    campaign_id: str,
    influencer_username: str,
    application_id: str,
    background_tasks: BackgroundTasks = None
):
    """Trigger application-related notifications"""
    if background_tasks:
        background_tasks.add_task(
            brand_notification_service.notify_campaign_application,
            brand_id, campaign_id, influencer_username, application_id
        )
    else:
        await brand_notification_service.notify_campaign_application(
            brand_id, campaign_id, influencer_username, application_id
        )

async def trigger_payment_notifications(
    brand_id: str,
    amount: float,
    plan: str,
    campaign_title: str = None,
    status: str = "success",  # success, failed, pending
    background_tasks: BackgroundTasks = None
):
    """Trigger payment-related notifications"""
    if status == "success":
        notification_func = brand_notification_service.notify_payment_success
    elif status == "failed":
        notification_func = brand_notification_service.notify_payment_failed
    else:
        notification_func = brand_notification_service.notify_payment_pending

    if background_tasks:
        background_tasks.add_task(
            notification_func,
            brand_id, amount, plan, campaign_title
        )
    else:
        await notification_func(brand_id, amount, plan, campaign_title)

async def trigger_campaign_status_notifications(
    brand_id: str,
    campaign_id: str,
    old_status: str,
    new_status: str,
    background_tasks: BackgroundTasks = None
):
    """Trigger campaign status change notifications"""
    if background_tasks:
        background_tasks.add_task(
            brand_notification_service.notify_campaign_status_change,
            brand_id, campaign_id, old_status, new_status
        )
    else:
        await brand_notification_service.notify_campaign_status_change(
            brand_id, campaign_id, old_status, new_status
        )



# ==================== FASTAPI ROUTES ====================

@router.get("/brand/notifications")
async def get_brand_notifications(
    skip: int = 0,
    limit: int = 10000000,
    unread_only: bool = False,
    current_user: Dict = Depends(get_current_user)
):
    """Get brand notifications"""
    try:
        # Validate user is a brand
        validate_brand_user(current_user)
        
        # Get brand ID from current_user
        brand_id = get_brand_id_from_user(current_user)
        
        logger.info(f"📨 Fetching notifications for brand {brand_id}, unread_only: {unread_only}")
        
        notifications = await brand_notification_service.get_brand_notifications(
            brand_id=brand_id,
            skip=skip,
            limit=limit,
            unread_only=unread_only
        )
        
        unread_count = await brand_notification_service.get_unread_count(brand_id)
        
        logger.info(f"✅ Found {len(notifications)} notifications, {unread_count} unread for brand {brand_id}")
        
        return {
            "notifications": notifications,
            "unread_count": unread_count,
            "total": len(notifications)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting brand notifications: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")

@router.post("/brand/notifications/{notification_id}/read")
async def mark_brand_notification_read(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Mark brand notification as read"""
    try:
        # Validate user is a brand
        validate_brand_user(current_user)
        
        # Get brand ID from current_user
        brand_id = get_brand_id_from_user(current_user)
        
        logger.info(f"📖 Marking notification {notification_id} as read for brand {brand_id}")
        
        success = await brand_notification_service.mark_as_read(
            notification_id=notification_id,
            brand_id=brand_id
        )
        
        if not success:
            logger.warning(f"⚠️ Notification {notification_id} not found for brand {brand_id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        logger.info(f"✅ Successfully marked notification {notification_id} as read")
        return {"message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error marking brand notification as read: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.post("/brand/notifications/read-all")
async def mark_all_brand_notifications_read(current_user: Dict = Depends(get_current_user)):
    """Mark all brand notifications as read"""
    try:
        # Validate user is a brand
        validate_brand_user(current_user)
        
        # Get brand ID from current_user
        brand_id = get_brand_id_from_user(current_user)
        
        logger.info(f"📖 Marking all notifications as read for brand {brand_id}")
        
        success = await brand_notification_service.mark_all_as_read(brand_id)
        
        if success:
            logger.info(f"✅ Successfully marked all notifications as read for brand {brand_id}")
            return {"message": "All notifications marked as read"}
        else:
            logger.info(f"ℹ️ No unread notifications found for brand {brand_id}")
            return {"message": "No unread notifications found"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error marking all brand notifications as read: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark all notifications as read")

@router.delete("/brand/notifications/{notification_id}")
async def delete_brand_notification(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete brand notification"""
    try:
        # Validate user is a brand
        validate_brand_user(current_user)
        
        # Get brand ID from current_user
        brand_id = get_brand_id_from_user(current_user)
        
        logger.info(f"🗑️ Deleting notification {notification_id} for brand {brand_id}")
        
        success = await brand_notification_service.delete_notification(
            notification_id=notification_id,
            brand_id=brand_id
        )
        
        if not success:
            logger.warning(f"⚠️ Notification {notification_id} not found for brand {brand_id}")
            raise HTTPException(status_code=404, detail="Notification not found")
        
        logger.info(f"✅ Successfully deleted notification {notification_id}")
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting brand notification: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete notification")

@router.get("/brand/notifications/stats")
async def get_brand_notification_stats(current_user: Dict = Depends(get_current_user)):
    """Get brand notification statistics"""
    try:
        # Validate user is a brand
        validate_brand_user(current_user)
        
        # Get brand ID from current_user
        brand_id = get_brand_id_from_user(current_user)
        
        # Get total notifications count
        total_count = brand_notification_service.notifications_collection.count_documents({
            "brand_id": ObjectId(brand_id)
        })
        
        # Get unread count
        unread_count = await brand_notification_service.get_unread_count(brand_id)
        
        # Get notifications by priority
        high_priority_count = brand_notification_service.notifications_collection.count_documents({
            "brand_id": ObjectId(brand_id),
            "priority": "high"
        })
        
        urgent_priority_count = brand_notification_service.notifications_collection.count_documents({
            "brand_id": ObjectId(brand_id),
            "priority": "urgent"
        })
        
        return {
            "total_count": total_count,
            "unread_count": unread_count,
            "high_priority_count": high_priority_count,
            "urgent_priority_count": urgent_priority_count,
            "read_count": total_count - unread_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting brand notification stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch notification statistics")

@router.post("/brand/notifications/cleanup")
async def cleanup_notifications(days_old: int = 30, current_user: Dict = Depends(get_current_user)):
    """Clean up old notifications (Admin/System function)"""
    try:
        # Validate user is a brand
        validate_brand_user(current_user)
        
        cleaned_count = await brand_notification_service.cleanup_old_notifications(days_old)
        
        return {
            "message": f"Cleaned up {cleaned_count} notifications older than {days_old} days",
            "cleaned_count": cleaned_count
        }
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clean up notifications")
    
    
# ==================== FASTAPI ROUTES ====================

@router.get("/brand/notifications/real-time")
async def get_real_time_notifications(
    current_user: Dict = Depends(get_current_user),
    limit: int = 20
):
    """Get real-time notifications for brand dashboard"""
    try:
        validate_brand_user(current_user)
        brand_id = get_brand_id_from_user(current_user)
        
        # Get real-time alerts (unread, high priority, recent)
        notifications = await brand_notification_service.get_brand_notifications(
            brand_id=brand_id,
            limit=limit,
            unread_only=True
        )
        
        # Filter for real-time alerts or recent high-priority notifications
        real_time_notifications = [
            n for n in notifications 
            if n.get('real_time_alert', False) or n.get('priority') in ['high', 'urgent']
        ]
        
        return {
            "real_time_alerts": real_time_notifications,
            "total_alerts": len(real_time_notifications),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting real-time notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch real-time notifications")

@router.get("/brand/notifications/campaigns/summary")
async def get_campaign_notifications_summary(
    current_user: Dict = Depends(get_current_user)
):
    """Get summary of campaign-related notifications"""
    try:
        validate_brand_user(current_user)
        brand_id = get_brand_id_from_user(current_user)
        
        # Get recent campaign notifications
        notifications = await brand_notification_service.get_brand_notifications(
            brand_id=brand_id,
            limit=10000000
        )
        
        campaign_notifications = [
            n for n in notifications 
            if n.get('type', '').startswith('campaign_') or 
               n.get('type', '').startswith('application_') or
               n.get('type', '').startswith('payment_')
        ]
        
        # Group by type
        summary = {}
        for notification in campaign_notifications:
            notification_type = notification.get('type')
            summary[notification_type] = summary.get(notification_type, 0) + 1
        
        return {
            "campaign_notifications_summary": summary,
            "total_campaign_notifications": len(campaign_notifications),
            "unread_campaign_notifications": len([n for n in campaign_notifications if not n.get('is_read', False)])
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting campaign notifications summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign notifications summary")

async def trigger_new_message_notification(
    brand_id: str,
    sender_username: str,
    preview_text: str,
    conversation_id: str,
):
    """
    Trigger notification when a new message is received by a brand user.
    """
    await brand_notification_service.create_notification(
        brand_id=brand_id,
        notification_type="new_message",
        title=f"New message from {sender_username}",
        message=preview_text,
        priority="high",
        action_url=f"/messages/{conversation_id}",
        metadata={
            "conversation_id": conversation_id,
            "sender_username": sender_username
        },
        real_time_alert=True
    )


async def trigger_conversation_started_notification(
    brand_id: str,
    sender_username: str,
):
    """
    Trigger notification when a new conversation is started.
    """
    await brand_notification_service.create_notification(
        brand_id=brand_id,
        notification_type="conversation_started",
        title="New Conversation Started",
        message=f"{sender_username} started a conversation with you.",
        priority="medium",
        action_url="/messages",
        metadata={
            "sender_username": sender_username
        },
        real_time_alert=True
    )