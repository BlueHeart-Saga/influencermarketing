# analytics.py - Fixed version with proper ObjectId serialization
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from database import (
    campaigns_collection, 
    users_collection, 
    payments_collection, 
    earnings_collection,
    posts_collection, 
    notifications_collection
)
from auth.utils import get_current_user
from bson import ObjectId
from pymongo import ReturnDocument
from enum import Enum
import json
import math
import csv
from io import StringIO

router = APIRouter()

# -------------------- ENUMS --------------------
class CampaignStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONTRACTED = "contracted"
    MEDIA_SUBMITTED = "media_submitted"
    COMPLETED = "completed"
    PAID = "paid"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class EarningStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"

# -------------------- IMPROVED HELPER FUNCTIONS --------------------
def serialize_objectid(obj):
    """Recursively convert ObjectId to string"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: serialize_objectid(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_objectid(item) for item in obj]
    elif hasattr(obj, '__dict__'):
        return serialize_objectid(obj.__dict__)
    else:
        return obj

def serialize_mongo_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    
    # Handle ObjectId and datetime objects
    if isinstance(doc, ObjectId):
        return str(doc)
    
    # Handle lists
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    
    # Handle dictionaries
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id' and isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_mongo_doc(value)
            elif isinstance(value, list):
                result[key] = serialize_mongo_doc(value)
            else:
                result[key] = value
        return result
    
    # Handle datetime objects
    if isinstance(doc, datetime):
        return doc.isoformat()
    
    return doc

def get_user_profile_details(user_id: str) -> Dict:
    """Get comprehensive user profile details"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {}
        
        user_data = serialize_mongo_doc(user)
        
        # Extract profile based on role
        profile_data = {}
        if user.get("role") == "influencer":
            profile_data = user.get("influencer_profile", {})
        elif user.get("role") == "brand":
            profile_data = user.get("brand_profile", {})
        
        # Get engagement metrics from posts
        posts = list(posts_collection.find({"user_id": ObjectId(user_id)}))
        
        # Calculate engagement metrics
        total_likes = sum([len(post.get("likes", [])) for post in posts])
        total_comments = sum([len(post.get("comments", [])) for post in posts])
        total_views = sum([len(post.get("views", [])) for post in posts])
        
        result = {
            "user_id": user_id,
            "username": user.get("username", ""),
            "email": user.get("email", ""),
            "role": user.get("role", ""),
            "profile": serialize_mongo_doc(profile_data),
            "engagement_metrics": {
                "total_posts": len(posts),
                "total_likes": total_likes,
                "total_comments": total_comments,
                "total_views": total_views,
                "average_engagement": round((total_likes + total_comments) / max(len(posts), 1), 2)
            },
            "follow_stats": {
                "followers": len(user.get("followers", [])),
                "following": len(user.get("following", []))
            },
            "account_created": serialize_mongo_doc(user.get("created_at")),
            "last_login": serialize_mongo_doc(user.get("last_login"))
        }
        
        return serialize_mongo_doc(result)
    except Exception as e:
        print(f"Error getting user profile: {e}")
        return {}
    
def ensure_datetime(value):
    """Ensure value is datetime for comparison operations"""
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            # Try ISO format first
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        except:
            try:
                # Try MongoDB date string format
                return datetime.strptime(value, "%Y-%m-%dT%H:%M:%S.%fZ")
            except:
                return datetime.min
    return datetime.min


def get_payment_details(payment_id: str) -> Dict:
    """Get detailed payment information"""
    try:
        payment = payments_collection.find_one({"_id": ObjectId(payment_id)})
        if not payment:
            return {}
        
        payment_data = serialize_mongo_doc(payment)
        
        # Get campaign details
        if payment.get("campaign_id"):
            campaign = campaigns_collection.find_one({"_id": ObjectId(payment["campaign_id"])})
            if campaign:
                payment_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
        
        # Get influencer details
        if payment.get("influencer_id"):
            influencer = users_collection.find_one({"_id": ObjectId(payment["influencer_id"])})
            if influencer:
                payment_data["influencer_name"] = influencer.get("username", "Unknown Influencer")
                payment_data["influencer_email"] = influencer.get("email", "")
        
        # Get brand details
        if payment.get("brand_id"):
            brand = users_collection.find_one({"_id": ObjectId(payment["brand_id"])})
            if brand:
                payment_data["brand_name"] = brand.get("username", "Unknown Brand")
        
        return serialize_mongo_doc(payment_data)
    except Exception as e:
        print(f"Error getting payment details: {e}")
        return {}

# -------------------- FIXED ANALYTICS SERVICE CLASS --------------------
class AnalyticsService:
    def __init__(self, brand_id: str):
        self.brand_id = brand_id
    
    def get_campaigns_summary(self) -> Dict:
        """Get summary statistics for all campaigns"""
        try:
            campaigns = list(campaigns_collection.find({"brand_id": self.brand_id}))
            campaigns = [serialize_mongo_doc(c) for c in campaigns]
            
            summary = {
                "total_campaigns": len(campaigns),
                "total_budget": sum([c.get("budget", 0) for c in campaigns]),
                "campaigns_by_status": {},
                "applications_by_status": {},
                "payment_summary": self._get_payment_summary(),
                "performance_metrics": self._calculate_performance_metrics(campaigns)
            }
            
            # Count campaigns by status
            for status in CampaignStatus:
                count = len([c for c in campaigns if c.get("status") == status.value])
                if count > 0:
                    summary["campaigns_by_status"][status.value] = count
            
            # Count applications by status
            all_applications = []
            for campaign in campaigns:
                apps = campaign.get("applications", [])
                all_applications.extend(apps)
            
            for status in ApplicationStatus:
                count = len([a for a in all_applications if a.get("status") == status.value])
                if count > 0:
                    summary["applications_by_status"][status.value] = count
            
            return serialize_mongo_doc(summary)
        except Exception as e:
            print(f"Error getting campaigns summary: {e}")
            return {}
    
    def _get_payment_summary(self) -> Dict:
        """Get payment summary for brand"""
        try:
            payments = list(payments_collection.find({"brand_id": self.brand_id}))
            payments = [serialize_mongo_doc(p) for p in payments]
            
            earnings = list(earnings_collection.find({"brand_id": self.brand_id}))
            earnings = [serialize_mongo_doc(e) for e in earnings]
            
            result = {
                "total_payments": len(payments),
                "total_amount_paid": sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value]),
                "pending_payments": len([p for p in payments if p.get("status") == PaymentStatus.PENDING.value]),
                "failed_payments": len([p for p in payments if p.get("status") == PaymentStatus.FAILED.value]),
                "total_earnings": sum([e.get("amount", 0) for e in earnings if e.get("status") == EarningStatus.PAID.value]),
                "payment_status_distribution": {
                    PaymentStatus.PENDING.value: len([p for p in payments if p.get("status") == PaymentStatus.PENDING.value]),
                    PaymentStatus.COMPLETED.value: len([p for p in payments if p.get("status") == PaymentStatus.COMPLETED.value]),
                    PaymentStatus.FAILED.value: len([p for p in payments if p.get("status") == PaymentStatus.FAILED.value]),
                    PaymentStatus.PROCESSING.value: len([p for p in payments if p.get("status") == PaymentStatus.PROCESSING.value]),
                }
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error getting payment summary: {e}")
            return {}
    
    def _calculate_performance_metrics(self, campaigns: List[Dict]) -> Dict:
        """Calculate performance metrics for campaigns"""
        try:
            total_views = sum([c.get("total_views", 0) for c in campaigns])
            total_likes = sum([c.get("likes_count", 0) for c in campaigns])
            total_applications = sum([len(c.get("applications", [])) for c in campaigns])
            total_completed = len([c for c in campaigns if c.get("status") == CampaignStatus.COMPLETED.value])
            
            # Calculate ROI metrics
            payments = list(payments_collection.find({"brand_id": self.brand_id}))
            payments = [serialize_mongo_doc(p) for p in payments]
            
            total_spent = sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value])
            total_budget = sum([c.get("budget", 0) for c in campaigns])
            
            # Engagement rate (likes per view)
            engagement_rate = (total_likes / total_views * 100) if total_views > 0 else 0
            
            # Application conversion rate
            conversion_rate = (total_applications / total_views * 100) if total_views > 0 else 0
            
            # Completion rate
            completion_rate = (total_completed / len(campaigns) * 100) if campaigns else 0
            
            # Budget utilization
            budget_utilization = (total_spent / total_budget * 100) if total_budget > 0 else 0
            
            # Average cost per application
            avg_cost_per_app = total_spent / total_applications if total_applications > 0 else 0
            
            result = {
                "engagement_rate": round(engagement_rate, 2),
                "conversion_rate": round(conversion_rate, 2),
                "completion_rate": round(completion_rate, 2),
                "budget_utilization": round(budget_utilization, 2),
                "avg_cost_per_application": round(avg_cost_per_app, 2),
                "total_views": total_views,
                "total_likes": total_likes,
                "total_applications": total_applications,
                "total_spent": total_spent,
                "total_budget": total_budget
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error calculating performance metrics: {e}")
            return {}
    
    def get_detailed_campaign_analytics(self, campaign_id: str) -> Dict:
        """Get detailed analytics for a specific campaign"""
        try:
            campaign = campaigns_collection.find_one({
                "_id": ObjectId(campaign_id),
                "brand_id": self.brand_id
            })
            
            if not campaign:
                return {}
            
            campaign_data = serialize_mongo_doc(campaign)
            
            # Get payment details for this campaign
            payments = list(payments_collection.find({
                "campaign_id": campaign_id,
                "brand_id": self.brand_id
            }))
            payments = [serialize_mongo_doc(p) for p in payments]
            
            # Get application statistics
            applications = campaign_data.get("applications", [])
            application_stats = {
                "total": len(applications),
                "by_status": {},
                "timeline": []
            }
            
            for status in ApplicationStatus:
                count = len([a for a in applications if a.get("status") == status.value])
                if count > 0:
                    application_stats["by_status"][status.value] = count
            
            # Create application timeline
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            for app in applications:
                applied_at = app.get("applied_at")
                if applied_at:
                    if isinstance(applied_at, str):
                        try:
                            applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                        except:
                            applied_at = datetime.utcnow()
                    
                    if applied_at >= thirty_days_ago:
                        application_stats["timeline"].append({
                            "date": applied_at.date().isoformat(),
                            "status": app.get("status"),
                            "influencer_id": app.get("influencer_id")
                        })
            
            # Get payment statistics
            payment_stats = {
                "total_payments": len(payments),
                "completed_payments": len([p for p in payments if p.get("status") == PaymentStatus.COMPLETED.value]),
                "pending_payments": len([p for p in payments if p.get("status") == PaymentStatus.PENDING.value]),
                "total_amount_paid": sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value]),
                "payment_timeline": []
            }
            
            # Create payment timeline
            for payment in payments:
                created_at = payment.get("created_at")
                if created_at:
                    if isinstance(created_at, str):
                        try:
                            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        except:
                            created_at = datetime.utcnow()
                    
                    payment_stats["payment_timeline"].append({
                        "date": created_at.date().isoformat(),
                        "amount": payment.get("amount", 0),
                        "status": payment.get("status"),
                        "influencer_id": payment.get("influencer_id")
                    })
            
            # Calculate campaign performance
            performance = self._calculate_campaign_performance(campaign_data, payments, applications)
            
            result = {
                "campaign": campaign_data,
                "application_stats": serialize_mongo_doc(application_stats),
                "payment_stats": serialize_mongo_doc(payment_stats),
                "performance": serialize_mongo_doc(performance),
                "influencer_insights": serialize_mongo_doc(self._get_influencer_insights(applications))
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error getting detailed campaign analytics: {e}")
            return {}
    
    def _calculate_campaign_performance(self, campaign: Dict, payments: List[Dict], applications: List[Dict]) -> Dict:
        """Calculate performance metrics for a campaign"""
        try:
            total_budget = campaign.get("budget", 0)
            total_spent = sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value])
            
            views = campaign.get("total_views", 0)
            likes = campaign.get("likes_count", 0)
            total_apps = len(applications)
            completed_apps = len([a for a in applications if a.get("status") == ApplicationStatus.COMPLETED.value])
            paid_apps = len([a for a in applications if a.get("status") == ApplicationStatus.PAID.value])
            
            # Engagement metrics
            engagement_rate = (likes / views * 100) if views > 0 else 0
            application_rate = (total_apps / views * 1000) if views > 0 else 0  # per 1000 views
            
            # Conversion metrics
            approval_rate = (len([a for a in applications if a.get("status") == ApplicationStatus.APPROVED.value]) / total_apps * 100) if total_apps > 0 else 0
            completion_rate = (completed_apps / total_apps * 100) if total_apps > 0 else 0
            payment_rate = (paid_apps / completed_apps * 100) if completed_apps > 0 else 0
            
            # ROI calculation
            estimated_value = total_spent * 2  # Simplified ROI calculation
            roi = ((estimated_value - total_spent) / total_spent * 100) if total_spent > 0 else 0
            
            # Performance score (0-100)
            performance_score = (
                engagement_rate * 0.2 +
                application_rate * 0.2 +
                completion_rate * 0.3 +
                payment_rate * 0.3
            )
            
            result = {
                "engagement_rate": round(engagement_rate, 2),
                "application_rate": round(application_rate, 2),
                "approval_rate": round(approval_rate, 2),
                "completion_rate": round(completion_rate, 2),
                "payment_rate": round(payment_rate, 2),
                "roi": round(roi, 2),
                "performance_score": round(performance_score, 2),
                "performance_grade": self._get_performance_grade(performance_score),
                "budget_utilization": round((total_spent / total_budget * 100), 2) if total_budget > 0 else 0,
                "cost_per_application": round(total_spent / total_apps, 2) if total_apps > 0 else 0,
                "cost_per_completion": round(total_spent / completed_apps, 2) if completed_apps > 0 else 0
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error calculating campaign performance: {e}")
            return {}
    
    def _get_performance_grade(self, score: float) -> str:
        """Get performance grade based on score"""
        if score >= 90:
            return "A+"
        elif score >= 80:
            return "A"
        elif score >= 70:
            return "B"
        elif score >= 60:
            return "C"
        elif score >= 50:
            return "D"
        else:
            return "F"
    
    def _get_influencer_insights(self, applications: List[Dict]) -> Dict:
        """Get insights about influencers who applied"""
        try:
            if not applications:
                return {}
            
            # Group by influencer
            influencer_data = {}
            for app in applications:
                influencer_id = app.get("influencer_id")
                if not influencer_id:
                    continue
                
                if influencer_id not in influencer_data:
                    influencer_data[influencer_id] = {
                        "applications": [],
                        "total_earnings": 0,
                        "completed_campaigns": 0
                    }
                
                influencer_data[influencer_id]["applications"].append(app)
            
            # Calculate statistics for each influencer
            for influencer_id, data in influencer_data.items():
                apps = data["applications"]
                data["total_applications"] = len(apps)
                data["approved_applications"] = len([a for a in apps if a.get("status") == ApplicationStatus.APPROVED.value])
                data["completed_applications"] = len([a for a in apps if a.get("status") == ApplicationStatus.COMPLETED.value])
                data["paid_applications"] = len([a for a in apps if a.get("status") == ApplicationStatus.PAID.value])
                
                # Calculate average match score
                match_scores = [a.get("match_score", 0) for a in apps if a.get("match_score")]
                data["average_match_score"] = round(sum(match_scores) / len(match_scores), 2) if match_scores else 0
            
            # Sort influencers by performance
            sorted_influencers = sorted(
                influencer_data.items(),
                key=lambda x: (
                    x[1].get("average_match_score", 0),
                    x[1].get("completed_applications", 0)
                ),
                reverse=True
            )
            
            # Get influencer profiles for top 10
            top_influencers = []
            for inf_id, data in sorted_influencers[:10]:
                influencer_profile = get_user_profile_details(inf_id)
                top_influencers.append({
                    "influencer_id": inf_id,
                    "profile": influencer_profile,
                    "stats": {
                        "total_applications": data.get("total_applications", 0),
                        "approved_applications": data.get("approved_applications", 0),
                        "completed_applications": data.get("completed_applications", 0),
                        "average_match_score": data.get("average_match_score", 0)
                    }
                })
            
            result = {
                "top_influencers": serialize_mongo_doc(top_influencers),
                "total_unique_influencers": len(influencer_data)
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error getting influencer insights: {e}")
            return {}
    
    def get_payment_analytics(self, filters: Dict = None) -> Dict:
        """Get detailed payment analytics"""
        try:
            query = {"brand_id": self.brand_id}
            
            # Apply filters
            if filters:
                if filters.get("status"):
                    query["status"] = filters["status"]
                if filters.get("start_date"):
                    query["created_at"] = {"$gte": datetime.fromisoformat(filters["start_date"])}
                if filters.get("end_date"):
                    if "created_at" in query:
                        query["created_at"]["$lte"] = datetime.fromisoformat(filters["end_date"])
                    else:
                        query["created_at"] = {"$lte": datetime.fromisoformat(filters["end_date"])}
                if filters.get("campaign_id"):
                    query["campaign_id"] = filters["campaign_id"]
                if filters.get("influencer_id"):
                    query["influencer_id"] = filters["influencer_id"]
            
            payments = list(payments_collection.find(query).sort("created_at", -1))
            payments = [serialize_mongo_doc(p) for p in payments]
            
            # Calculate statistics
            total_payments = len(payments)
            total_amount = sum([p.get("amount", 0) for p in payments])
            completed_payments = len([p for p in payments if p.get("status") == PaymentStatus.COMPLETED.value])
            pending_payments = len([p for p in payments if p.get("status") == PaymentStatus.PENDING.value])
            failed_payments = len([p for p in payments if p.get("status") == PaymentStatus.FAILED.value])
            
            # Get payment timeline
            payment_timeline = []
            for payment in payments:
                payment_data = payment.copy()
                
                # Get campaign details
                if payment.get("campaign_id"):
                    campaign = campaigns_collection.find_one({"_id": ObjectId(payment["campaign_id"])})
                    if campaign:
                        campaign_data = serialize_mongo_doc(campaign)
                        payment_data["campaign_title"] = campaign_data.get("title", "Unknown Campaign")
                
                # Get influencer details
                if payment.get("influencer_id"):
                    influencer = users_collection.find_one({"_id": ObjectId(payment["influencer_id"])})
                    if influencer:
                        influencer_data = serialize_mongo_doc(influencer)
                        payment_data["influencer_name"] = influencer_data.get("username", "Unknown Influencer")
                
                payment_timeline.append(payment_data)
            
            # Calculate payment trends
            trends = self._calculate_payment_trends(payments)
            
            result = {
                "summary": serialize_mongo_doc({
                    "total_payments": total_payments,
                    "total_amount": total_amount,
                    "completed_payments": completed_payments,
                    "pending_payments": pending_payments,
                    "failed_payments": failed_payments,
                    "completion_rate": (completed_payments / total_payments * 100) if total_payments > 0 else 0
                }),
                "timeline": serialize_mongo_doc(payment_timeline),
                "trends": serialize_mongo_doc(trends),
                "status_distribution": serialize_mongo_doc({
                    PaymentStatus.COMPLETED.value: completed_payments,
                    PaymentStatus.PENDING.value: pending_payments,
                    PaymentStatus.FAILED.value: failed_payments,
                    PaymentStatus.PROCESSING.value: len([p for p in payments if p.get("status") == PaymentStatus.PROCESSING.value])
                })
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error getting payment analytics: {e}")
            return {}
    
    def _calculate_payment_trends(self, payments: List[Dict]) -> Dict:
        """Calculate payment trends over time"""
        try:
            if not payments:
                return {}
            
            # Group by day for last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            daily_totals = {}
            
            for payment in payments:
                created_at = payment.get("created_at")
                if created_at:
                    # ✅ FIXED: Use ensure_datetime helper
                    created_at = ensure_datetime(created_at)
                    
                    if created_at >= thirty_days_ago:
                        date_str = created_at.date().isoformat()
                        amount = payment.get("amount", 0)
                        status = payment.get("status")
                        
                        if date_str not in daily_totals:
                            daily_totals[date_str] = {
                                "total_amount": 0,
                                "completed_amount": 0,
                                "count": 0,
                                "completed_count": 0
                            }
                        
                        daily_totals[date_str]["total_amount"] += amount
                        daily_totals[date_str]["count"] += 1
                        
                        if status == PaymentStatus.COMPLETED.value:
                            daily_totals[date_str]["completed_amount"] += amount
                            daily_totals[date_str]["completed_count"] += 1
            
            # Convert to sorted list
            trends = []
            for date_str in sorted(daily_totals.keys()):
                trends.append({
                    "date": date_str,
                    **daily_totals[date_str]
                })
            
            result = {
                "daily_trends": serialize_mongo_doc(trends),
                "average_daily_payment": sum([t["total_amount"] for t in trends]) / len(trends) if trends else 0,
                "total_last_30_days": sum([t["total_amount"] for t in trends]),
                "growth_rate": self._calculate_growth_rate(trends)
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error calculating payment trends: {e}")
            return {}
    
    def _calculate_growth_rate(self, trends: List[Dict]) -> float:
        """Calculate payment growth rate"""
        try:
            if len(trends) < 2:
                return 0
            
            # Calculate week-over-week growth
            if len(trends) >= 7:
                current_week = sum([t["total_amount"] for t in trends[-7:]])
                previous_week = sum([t["total_amount"] for t in trends[-14:-7]])
                
                if previous_week > 0:
                    return round(((current_week - previous_week) / previous_week * 100), 2)
            
            return 0
        except:
            return 0
    
    def get_application_analytics(self, filters: Dict = None) -> Dict:
        """Get detailed application analytics"""
        try:
            # Get all campaigns for brand
            campaigns = list(campaigns_collection.find({"brand_id": self.brand_id}))
            campaigns = [serialize_mongo_doc(c) for c in campaigns]
            
            # Collect all applications
            all_applications = []
            for campaign in campaigns:
                campaign_id = campaign.get("_id")
                if not campaign_id:
                    continue
                    
                applications = campaign.get("applications", [])
                
                for app in applications:
                    app_data = app.copy()
                    app_data["campaign_id"] = campaign_id
                    app_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
                    app_data["campaign_status"] = campaign.get("status", "active")
                    all_applications.append(app_data)
            
            # Apply filters
            filtered_applications = all_applications
            if filters:
                if filters.get("status"):
                    filtered_applications = [a for a in filtered_applications if a.get("status") == filters["status"]]
                if filters.get("campaign_id"):
                    filtered_applications = [a for a in filtered_applications if a.get("campaign_id") == filters["campaign_id"]]
                if filters.get("start_date"):
                    start_date = datetime.fromisoformat(filters["start_date"])
                    filtered_applications = [a for a in filtered_applications if 
                                           datetime.fromisoformat(a.get("applied_at", datetime.utcnow().isoformat()).replace('Z', '+00:00')) >= start_date]
                if filters.get("end_date"):
                    end_date = datetime.fromisoformat(filters["end_date"])
                    filtered_applications = [a for a in filtered_applications if 
                                           datetime.fromisoformat(a.get("applied_at", datetime.utcnow().isoformat()).replace('Z', '+00:00')) <= end_date]
            
            # Calculate statistics
            total_applications = len(filtered_applications)
            
            status_counts = {}
            for status in ApplicationStatus:
                count = len([a for a in filtered_applications if a.get("status") == status.value])
                if count > 0:
                    status_counts[status.value] = count
            
            # Get application timeline
            application_timeline = []
            for app in filtered_applications[:100]:  # Limit to 100 for performance
                timeline_entry = {
                    "application_id": f"{app.get('campaign_id', '')}_{app.get('influencer_id', '')}",
                    "campaign_title": app.get("campaign_title"),
                    "status": app.get("status"),
                    "applied_at": app.get("applied_at"),
                    "proposed_amount": app.get("proposed_amount", 0),
                    "match_score": app.get("match_score", 0)
                }
                
                # Get influencer details
                if app.get("influencer_id"):
                    influencer_profile = get_user_profile_details(app["influencer_id"])
                    if influencer_profile:
                        timeline_entry["influencer_name"] = influencer_profile.get("profile", {}).get("full_name") or influencer_profile.get("username", "Unknown")
                        timeline_entry["influencer_followers"] = influencer_profile.get("profile", {}).get("followers", {}).get("total", 0)
                
                application_timeline.append(timeline_entry)
            
            # Calculate conversion rates
            conversion_rates = {}
            if total_applications > 0:
                conversion_rates["approval_rate"] = (status_counts.get(ApplicationStatus.APPROVED.value, 0) / total_applications * 100)
                conversion_rates["completion_rate"] = (status_counts.get(ApplicationStatus.COMPLETED.value, 0) / total_applications * 100)
                conversion_rates["payment_rate"] = (status_counts.get(ApplicationStatus.PAID.value, 0) / total_applications * 100)
            
            result = {
                "summary": serialize_mongo_doc({
                    "total_applications": total_applications,
                    "conversion_rates": {k: round(v, 2) for k, v in conversion_rates.items()}
                }),
                "status_distribution": serialize_mongo_doc(status_counts),
                "timeline": serialize_mongo_doc(application_timeline),
                "filters_applied": serialize_mongo_doc(filters or {})
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error getting application analytics: {e}")
            return {}
    
    def get_financial_analytics(self) -> Dict:
        """Get comprehensive financial analytics"""
        try:
            # Get all payments
            payments = list(payments_collection.find({"brand_id": self.brand_id}))
            payments = [serialize_mongo_doc(p) for p in payments]
            
            # Get all campaigns
            campaigns = list(campaigns_collection.find({"brand_id": self.brand_id}))
            campaigns = [serialize_mongo_doc(c) for c in campaigns]
            
            # Calculate financial metrics
            total_budget = sum([c.get("budget", 0) for c in campaigns])
            total_spent = sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value])
            pending_payments = sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.PENDING.value])
            
            # Calculate ROI
            completed_campaigns = [c for c in campaigns if c.get("status") == CampaignStatus.COMPLETED.value]
            completed_campaigns_spent = 0
            
            for campaign in completed_campaigns:
                campaign_id = campaign.get("_id")
                if campaign_id:
                    campaign_payments = [p for p in payments if p.get("campaign_id") == campaign_id]
                    completed_campaigns_spent += sum([p.get("amount", 0) for p in campaign_payments if p.get("status") == PaymentStatus.COMPLETED.value])
            
            # Simplified ROI calculation
            average_roi = ((completed_campaigns_spent * 2 - completed_campaigns_spent) / completed_campaigns_spent * 100) if completed_campaigns_spent > 0 else 0
            
            # Get monthly spending
            monthly_spending = {}
            for payment in payments:
                if payment.get("status") == PaymentStatus.COMPLETED.value:
                    created_at = payment.get("created_at")
                    if created_at:
                        if isinstance(created_at, str):
                            try:
                                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                            except:
                                created_at = datetime.utcnow()
                        
                        month_key = created_at.strftime("%Y-%m")
                        if month_key not in monthly_spending:
                            monthly_spending[month_key] = 0
                        monthly_spending[month_key] += payment.get("amount", 0)
            
            # Get spending by campaign category
            category_spending = {}
            for campaign in campaigns:
                category = campaign.get("category", "Uncategorized")
                campaign_id = campaign.get("_id")
                if campaign_id:
                    campaign_payments = [p for p in payments if p.get("campaign_id") == campaign_id]
                    campaign_spent = sum([p.get("amount", 0) for p in campaign_payments if p.get("status") == PaymentStatus.COMPLETED.value])
                    
                    if category not in category_spending:
                        category_spending[category] = 0
                    category_spending[category] += campaign_spent
            
            # Get campaign performance metrics
            campaign_performance = self._get_campaign_performance_metrics(campaigns, payments)
            
            result = {
                "summary": serialize_mongo_doc({
                    "total_budget": total_budget,
                    "total_spent": total_spent,
                    "remaining_budget": total_budget - total_spent,
                    "pending_payments": pending_payments,
                    "budget_utilization": round((total_spent / total_budget * 100), 2) if total_budget > 0 else 0,
                    "average_roi": round(average_roi, 2)
                }),
                "monthly_spending": serialize_mongo_doc([
                    {"month": month, "amount": amount}
                    for month, amount in sorted(monthly_spending.items())
                ]),
                "category_spending": serialize_mongo_doc([
                    {"category": category, "amount": amount}
                    for category, amount in category_spending.items()
                ]),
                "campaign_performance": serialize_mongo_doc(campaign_performance)
            }
            
            return serialize_mongo_doc(result)
        except Exception as e:
            print(f"Error getting financial analytics: {e}")
            return {}
    
    def _get_campaign_performance_metrics(self, campaigns: List[Dict], payments: List[Dict]) -> List[Dict]:
        """Get performance metrics for each campaign"""
        campaign_metrics = []
        
        for campaign in campaigns:
            campaign_id = campaign.get("_id")
            if not campaign_id:
                continue
                
            campaign_payments = [p for p in payments if p.get("campaign_id") == campaign_id]
            
            campaign_spent = sum([p.get("amount", 0) for p in campaign_payments if p.get("status") == PaymentStatus.COMPLETED.value])
            campaign_budget = campaign.get("budget", 0)
            
            applications = campaign.get("applications", [])
            completed_apps = len([a for a in applications if a.get("status") == ApplicationStatus.COMPLETED.value])
            total_apps = len(applications)
            
            campaign_metrics.append({
                "campaign_id": campaign_id,
                "title": campaign.get("title", "Unknown Campaign"),
                "budget": campaign_budget,
                "spent": campaign_spent,
                "budget_utilization": round((campaign_spent / campaign_budget * 100), 2) if campaign_budget > 0 else 0,
                "total_applications": total_apps,
                "completed_applications": completed_apps,
                "completion_rate": round((completed_apps / total_apps * 100), 2) if total_apps > 0 else 0,
                "status": campaign.get("status", "active")
            })
        
        sorted_metrics = sorted(campaign_metrics, key=lambda x: x["spent"], reverse=True)
        return serialize_mongo_doc(sorted_metrics)

# -------------------- FIXED ANALYTICS ROUTES --------------------
@router.get("/brand/analytics/dashboard")
async def get_brand_dashboard_analytics(
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive dashboard analytics for brand"""
    try:
        if current_user["role"] != "brand":
            raise HTTPException(status_code=403, detail="Only brands can access analytics")
        
        brand_id = str(current_user["_id"])
        analytics_service = AnalyticsService(brand_id)
        
        # Get all analytics data
        campaigns_summary = analytics_service.get_campaigns_summary()
        payment_analytics = analytics_service.get_payment_analytics()
        application_analytics = analytics_service.get_application_analytics()
        financial_analytics = analytics_service.get_financial_analytics()
        
        # Get recent activity
        payments = list(payments_collection.find({"brand_id": brand_id}).sort("created_at", -1).limit(10))
        payments = [serialize_mongo_doc(p) for p in payments]
        
        # Format recent payments
        formatted_payments = []
        for payment in payments:
            payment_data = payment.copy()
            
            # Get campaign details
            if payment.get("campaign_id"):
                campaign = campaigns_collection.find_one({"_id": ObjectId(payment["campaign_id"])})
                if campaign:
                    campaign_data = serialize_mongo_doc(campaign)
                    payment_data["campaign_title"] = campaign_data.get("title", "Unknown Campaign")
            
            # Get influencer details
            if payment.get("influencer_id"):
                influencer = users_collection.find_one({"_id": ObjectId(payment["influencer_id"])})
                if influencer:
                    influencer_data = serialize_mongo_doc(influencer)
                    payment_data["influencer_name"] = influencer_data.get("username", "Unknown Influencer")
            
            formatted_payments.append(payment_data)
        
        # Get recent applications
        campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
        campaigns = [serialize_mongo_doc(c) for c in campaigns]
        
        recent_applications = []
        for campaign in campaigns:
            applications = campaign.get("applications", [])[:5]  # Get first 5 from each campaign
            for app in applications:
                app_data = app.copy()
                app_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
                app_data["campaign_id"] = campaign.get("_id")
                recent_applications.append(app_data)
        
        recent_applications = sorted(
            recent_applications,
            key=lambda x: x.get("applied_at", datetime.min),
            reverse=True
        )[:10]
        
        # Format recent applications
        formatted_applications = []
        for app in recent_applications:
            app_data = app.copy()
            
            # Get influencer details
            if app.get("influencer_id"):
                influencer_profile = get_user_profile_details(app["influencer_id"])
                if influencer_profile:
                    app_data["influencer_name"] = influencer_profile.get("profile", {}).get("full_name") or influencer_profile.get("username", "Unknown")
                    app_data["influencer_followers"] = influencer_profile.get("profile", {}).get("followers", {}).get("total", 0)
            
            formatted_applications.append(app_data)
        
        response = {
            "success": True,
            "data": serialize_mongo_doc({
                "campaigns_summary": campaigns_summary,
                "payment_summary": payment_analytics.get("summary", {}),
                "application_summary": application_analytics.get("summary", {}),
                "financial_summary": financial_analytics.get("summary", {}),
                "performance_metrics": campaigns_summary.get("performance_metrics", {}),
                "recent_activity": {
                    "payments": serialize_mongo_doc(formatted_payments),
                    "applications": serialize_mongo_doc(formatted_applications)
                },
                "charts": {
                    "campaign_status": campaigns_summary.get("campaigns_by_status", {}),
                    "application_status": campaigns_summary.get("applications_by_status", {}),
                    "payment_status": payment_analytics.get("status_distribution", {}),
                    "monthly_spending": financial_analytics.get("monthly_spending", [])
                }
            })
        }
        
        return serialize_mongo_doc(response)
        
    except Exception as e:
        print(f"Error getting dashboard analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics data: {str(e)}")

@router.get("/brand/analytics/campaigns")
async def get_campaigns_analytics(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by campaign status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc")
):
    """Get detailed campaign analytics with filtering options"""
    try:
        if current_user["role"] != "brand":
            raise HTTPException(status_code=403, detail="Only brands can access analytics")
        
        brand_id = str(current_user["_id"])
        
        # Build query
        query = {"brand_id": brand_id}
        
        if status:
            query["status"] = status
        if category:
            query["category"] = category
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query["created_at"] = {"$gte": start}
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            if "created_at" in query:
                query["created_at"]["$lte"] = end
            else:
                query["created_at"] = {"$lte": end}
                
        # In get_campaigns_analytics function
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                query["created_at"] = {"$gte": start}
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid start_date: {e}")

        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                end = end.replace(hour=23, minute=59, second=59)  # End of day
                if "created_at" in query:
                    query["created_at"]["$lte"] = end
                else:
                    query["created_at"] = {"$lte": end}
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid end_date: {e}")
            
        # Get campaigns
        campaigns = list(campaigns_collection.find(query))
        campaigns = [serialize_mongo_doc(c) for c in campaigns]
        
        # Calculate analytics for each campaign
        analytics_service = AnalyticsService(brand_id)
        campaigns_with_analytics = []
        
        for campaign in campaigns:
            campaign_id = campaign.get("_id")
            if not campaign_id:
                continue
                
            # Get detailed analytics
            campaign_analytics = analytics_service.get_detailed_campaign_analytics(campaign_id)
            
            # Get payment summary for this campaign
            payments = list(payments_collection.find({
                "campaign_id": campaign_id,
                "brand_id": brand_id
            }))
            payments = [serialize_mongo_doc(p) for p in payments]
            
            payment_summary = {
                "total_payments": len(payments),
                "completed_payments": len([p for p in payments if p.get("status") == PaymentStatus.COMPLETED.value]),
                "total_amount_paid": sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value])
            }
            
            campaigns_with_analytics.append({
                **campaign,
                "analytics": campaign_analytics.get("performance", {}),
                "payment_summary": serialize_mongo_doc(payment_summary),
                "application_stats": campaign_analytics.get("application_stats", {}),
                "influencer_insights": campaign_analytics.get("influencer_insights", {})
            })
        
        # Sort campaigns
        reverse = sort_order.lower() == "desc"
        
        sort_fields = {
            "created_at": lambda x: x.get("created_at", datetime.min),
            "title": lambda x: x.get("title", "").lower(),
            "budget": lambda x: x.get("budget", 0),
            "applications": lambda x: x.get("application_stats", {}).get("total", 0),
            "performance": lambda x: x.get("analytics", {}).get("performance_score", 0),
            "spent": lambda x: x.get("payment_summary", {}).get("total_amount_paid", 0)
        }
        
        sort_key = sort_fields.get(sort_by, sort_fields["created_at"])
        campaigns_with_analytics.sort(key=sort_key, reverse=reverse)
        
        # Calculate summary statistics
        total_campaigns = len(campaigns_with_analytics)
        total_budget = sum([c.get("budget", 0) for c in campaigns_with_analytics])
        total_spent = sum([c.get("payment_summary", {}).get("total_amount_paid", 0) for c in campaigns_with_analytics])
        total_applications = sum([c.get("application_stats", {}).get("total", 0) for c in campaigns_with_analytics])
        
        # Calculate average performance
        performance_scores = [c.get("analytics", {}).get("performance_score", 0) for c in campaigns_with_analytics]
        avg_performance = sum(performance_scores) / len(performance_scores) if performance_scores else 0
        
        response = {
            "success": True,
            "data": serialize_mongo_doc({
                "summary": {
                    "total_campaigns": total_campaigns,
                    "total_budget": total_budget,
                    "total_spent": total_spent,
                    "total_applications": total_applications,
                    "average_performance": round(avg_performance, 2),
                    "budget_utilization": round((total_spent / total_budget * 100), 2) if total_budget > 0 else 0
                },
                "campaigns": serialize_mongo_doc(campaigns_with_analytics),
                "filters_applied": {
                    "status": status,
                    "category": category,
                    "start_date": start_date,
                    "end_date": end_date,
                    "sort_by": sort_by,
                    "sort_order": sort_order
                }
            })
        }
        
        return serialize_mongo_doc(response)
        
    except Exception as e:
        print(f"Error getting campaigns analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch campaigns analytics: {str(e)}")

@router.get("/brand/analytics/campaign/{campaign_id}")
async def get_single_campaign_analytics(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed analytics for a single campaign"""
    try:
        if current_user["role"] != "brand":
            raise HTTPException(status_code=403, detail="Only brands can access analytics")
        
        brand_id = str(current_user["_id"])
        
        # Verify campaign ownership
        campaign = campaigns_collection.find_one({
            "_id": ObjectId(campaign_id),
            "brand_id": brand_id
        })
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign_data = serialize_mongo_doc(campaign)
        
        # Get analytics service
        analytics_service = AnalyticsService(brand_id)
        campaign_analytics = analytics_service.get_detailed_campaign_analytics(campaign_id)
        
        # Get influencer details for applications
        applications = campaign_data.get("applications", [])
        application_details = []
        
        for app in applications:
            app_data = app.copy()
            
            # Get influencer profile
            if app.get("influencer_id"):
                influencer_profile = get_user_profile_details(app["influencer_id"])
                if influencer_profile:
                    app_data["influencer_profile"] = influencer_profile
            
            # Get payment status for this application
            payment = payments_collection.find_one({
                "campaign_id": campaign_id,
                "influencer_id": app.get("influencer_id"),
                "brand_id": brand_id
            })
            
            if payment:
                payment_data = serialize_mongo_doc(payment)
                app_data["payment_status"] = payment_data.get("status")
                app_data["payment_amount"] = payment_data.get("amount")
                app_data["payment_id"] = payment_data.get("_id")
            
            application_details.append(app_data)
        
        # Get all payments for this campaign
        payments = list(payments_collection.find({
            "campaign_id": campaign_id,
            "brand_id": brand_id
        }).sort("created_at", -1))
        payments = [serialize_mongo_doc(p) for p in payments]
        
        payment_details = []
        for payment in payments:
            payment_data = payment.copy()
            
            # Get influencer details
            if payment.get("influencer_id"):
                influencer_profile = get_user_profile_details(payment["influencer_id"])
                if influencer_profile:
                    payment_data["influencer_name"] = influencer_profile.get("profile", {}).get("full_name") or influencer_profile.get("username", "Unknown")
            
            payment_details.append(payment_data)
        
        response = {
            "success": True,
            "data": serialize_mongo_doc({
                "campaign": campaign_data,
                "analytics": campaign_analytics,
                "applications": {
                    "total": len(applications),
                    "details": serialize_mongo_doc(application_details),
                    "status_distribution": campaign_analytics.get("application_stats", {}).get("by_status", {})
                },
                "payments": {
                    "total": len(payments),
                    "details": serialize_mongo_doc(payment_details),
                    "status_distribution": campaign_analytics.get("payment_stats", {}).get("payment_timeline", [])
                },
                "influencer_insights": campaign_analytics.get("influencer_insights", {})
            })
        }
        
        return serialize_mongo_doc(response)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting campaign analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch campaign analytics: {str(e)}")

@router.get("/brand/analytics/payments")
async def get_payment_analytics(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by payment status"),
    campaign_id: Optional[str] = Query(None, description="Filter by campaign"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc")
):
    """Get detailed payment analytics"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access analytics")
    
    brand_id = str(current_user["_id"])
    analytics_service = AnalyticsService(brand_id)
    
    try:
        # Build filters
        filters = {}
        if status:
            filters["status"] = status
        if campaign_id:
            filters["campaign_id"] = campaign_id
        if start_date:
            filters["start_date"] = start_date
        if end_date:
            filters["end_date"] = end_date
        
        # Get payment analytics
        payment_analytics = analytics_service.get_payment_analytics(filters)
        
        # Get detailed payment data for table
        query = {"brand_id": brand_id}
        
        if status:
            query["status"] = status
        if campaign_id:
            query["campaign_id"] = campaign_id
        
        # ✅ FIXED DATE COMPARISON: Convert string dates to datetime objects
        date_query = {}
        if start_date:
            try:
                # Parse start date string to datetime
                start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                date_query["$gte"] = start_dt
            except ValueError:
                # Handle invalid date format
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid start_date format. Use YYYY-MM-DD. Received: {start_date}"
                )
        
        if end_date:
            try:
                # Parse end date string to datetime, set to end of day
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                date_query["$lte"] = end_dt
            except ValueError:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid end_date format. Use YYYY-MM-DD. Received: {end_date}"
                )
        
        # Add date query if we have any date filters
        if date_query:
            query["created_at"] = date_query
        
        # Get payments with query
        payments = list(payments_collection.find(query).sort("created_at", -1))
        
        # Format payment data
        formatted_payments = []
        for payment in payments:
            payment_data = serialize_mongo_doc(payment)
            
            # Get campaign details
            if payment_data.get("campaign_id"):
                campaign = campaigns_collection.find_one({"_id": ObjectId(payment_data["campaign_id"])})
                if campaign:
                    campaign_data = serialize_mongo_doc(campaign)
                    payment_data["campaign_title"] = campaign_data.get("title", "Unknown Campaign")
            
            # Get influencer details
            if payment_data.get("influencer_id"):
                influencer = users_collection.find_one({"_id": ObjectId(payment_data["influencer_id"])})
                if influencer:
                    payment_data["influencer_name"] = influencer.get("username", "Unknown Influencer")
                    payment_data["influencer_email"] = influencer.get("email", "")
                    
                    # Get influencer profile for more details
                    influencer_profile = get_user_profile_details(payment_data["influencer_id"])
                    if influencer_profile:
                        payment_data["influencer_profile"] = influencer_profile
            
            formatted_payments.append(payment_data)
        
        # Sort payments
        reverse = sort_order.lower() == "desc"
        
        sort_fields = {
            "created_at": lambda x: ensure_datetime(x.get("created_at", datetime.min)),
            "amount": lambda x: x.get("amount", 0),
            "status": lambda x: x.get("status", ""),
            "campaign": lambda x: x.get("campaign_title", "").lower(),
            "influencer": lambda x: x.get("influencer_name", "").lower()
        }
        
        sort_key = sort_fields.get(sort_by, sort_fields["created_at"])
        formatted_payments.sort(key=sort_key, reverse=reverse)
        
        return {
            "success": True,
            "data": {
                "summary": payment_analytics.get("summary", {}),
                "trends": payment_analytics.get("trends", {}),
                "status_distribution": payment_analytics.get("status_distribution", {}),
                "payments": formatted_payments,
                "filters_applied": filters
            }
        }
        
    except Exception as e:
        print(f"Error getting payment analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment analytics")

@router.get("/brand/analytics/applications")
async def get_application_analytics(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by application status"),
    campaign_id: Optional[str] = Query(None, description="Filter by campaign"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: str = Query("applied_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc")
):
    """Get detailed application analytics"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access analytics")
    
    brand_id = str(current_user["_id"])
    analytics_service = AnalyticsService(brand_id)
    
    try:
        # Build filters
        filters = {}
        if status:
            filters["status"] = status
        if campaign_id:
            filters["campaign_id"] = campaign_id
        if start_date:
            filters["start_date"] = start_date
        if end_date:
            filters["end_date"] = end_date
        
        # Get application analytics
        application_analytics = analytics_service.get_application_analytics(filters)
        
        # Get detailed application data
        campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
        all_applications = []
        
        for campaign in campaigns:
            campaign_id_str = str(campaign["_id"])
            
            # Filter by campaign if specified
            if filters.get("campaign_id") and filters["campaign_id"] != campaign_id_str:
                continue
            
            applications = campaign.get("applications", [])
            
            for app in applications:
                app_data = serialize_mongo_doc(app)
                app_data["campaign_id"] = campaign_id_str
                app_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
                app_data["campaign_status"] = campaign.get("status", "active")
                
                # Filter by status if specified
                if filters.get("status") and app_data.get("status") != filters["status"]:
                    continue
                
                # Filter by date if specified
                applied_at = app_data.get("applied_at")
                if applied_at:
                    if isinstance(applied_at, str):
                        applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    
                    if filters.get("start_date"):
                        start = datetime.strptime(filters["start_date"], "%Y-%m-%d")
                        if applied_at < start:
                            continue
                    
                    if filters.get("end_date"):
                        end = datetime.strptime(filters["end_date"], "%Y-%m-%d")
                        if applied_at > end:
                            continue
                
                # Get influencer details
                influencer_profile = get_user_profile_details(app.get("influencer_id", ""))
                if influencer_profile:
                    app_data["influencer_profile"] = influencer_profile
                    app_data["influencer_name"] = influencer_profile.get("profile", {}).get("full_name") or influencer_profile.get("username", "Unknown")
                    app_data["influencer_followers"] = influencer_profile.get("profile", {}).get("followers", {}).get("total", 0)
                
                # Get payment status
                payment = payments_collection.find_one({
                    "campaign_id": campaign_id_str,
                    "influencer_id": app.get("influencer_id"),
                    "brand_id": brand_id
                })
                
                if payment:
                    app_data["payment_status"] = payment.get("status")
                    app_data["payment_amount"] = payment.get("amount")
                
                all_applications.append(app_data)
        
        # Sort applications
        reverse = sort_order.lower() == "desc"
        
        sort_fields = {
            "applied_at": lambda x: x.get("applied_at", datetime.min),
            "match_score": lambda x: x.get("match_score", 0),
            "proposed_amount": lambda x: x.get("proposed_amount", 0),
            "status": lambda x: x.get("status", ""),
            "influencer": lambda x: x.get("influencer_name", "").lower(),
            "campaign": lambda x: x.get("campaign_title", "").lower()
        }
        
        sort_key = sort_fields.get(sort_by, sort_fields["applied_at"])
        all_applications.sort(key=sort_key, reverse=reverse)
        
        return {
            "success": True,
            "data": {
                "summary": application_analytics.get("summary", {}),
                "status_distribution": application_analytics.get("status_distribution", {}),
                "applications": all_applications,
                "filters_applied": filters
            }
        }
        
    except Exception as e:
        print(f"Error getting application analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch application analytics")

@router.get("/brand/analytics/financial")
async def get_financial_analytics(
    current_user: dict = Depends(get_current_user),
    period: str = Query("monthly", description="Period: weekly, monthly, quarterly, yearly")
):
    """Get comprehensive financial analytics"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access analytics")
    
    brand_id = str(current_user["_id"])
    analytics_service = AnalyticsService(brand_id)
    
    try:
        # Get financial analytics
        financial_analytics = analytics_service.get_financial_analytics()
        
        # Get detailed financial data based on period
        payments = list(payments_collection.find({"brand_id": brand_id}))
        
        # Group by period
        period_data = {}
        for payment in payments:
            if payment.get("status") == PaymentStatus.COMPLETED:
                created_at = payment.get("created_at")
                if created_at:
                    if isinstance(created_at, str):
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    
                    if period == "weekly":
                        period_key = created_at.strftime("%Y-W%U")
                    elif period == "monthly":
                        period_key = created_at.strftime("%Y-%m")
                    elif period == "quarterly":
                        quarter = (created_at.month - 1) // 3 + 1
                        period_key = f"{created_at.year}-Q{quarter}"
                    else:  # yearly
                        period_key = str(created_at.year)
                    
                    if period_key not in period_data:
                        period_data[period_key] = {
                            "amount": 0,
                            "count": 0,
                            "campaigns": set()
                        }
                    
                    period_data[period_key]["amount"] += payment.get("amount", 0)
                    period_data[period_key]["count"] += 1
                    period_data[period_key]["campaigns"].add(payment.get("campaign_id"))
        
        # Format period data
        formatted_period_data = []
        for period_key, data in sorted(period_data.items()):
            formatted_period_data.append({
                "period": period_key,
                "amount": data["amount"],
                "count": data["count"],
                "campaigns": len(data["campaigns"]),
                "avg_amount_per_campaign": data["amount"] / len(data["campaigns"]) if data["campaigns"] else 0
            })
        
        # Get top campaigns by spending
        campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
        campaign_spending = []
        
        for campaign in campaigns:
            campaign_id = str(campaign["_id"])
            campaign_payments = [p for p in payments if p.get("campaign_id") == campaign_id and p.get("status") == PaymentStatus.COMPLETED]
            
            total_spent = sum([p.get("amount", 0) for p in campaign_payments])
            if total_spent > 0:
                campaign_spending.append({
                    "campaign_id": campaign_id,
                    "title": campaign.get("title", "Unknown Campaign"),
                    "category": campaign.get("category", "Uncategorized"),
                    "budget": campaign.get("budget", 0),
                    "spent": total_spent,
                    "budget_utilization": round((total_spent / campaign.get("budget", 1) * 100), 2),
                    "payments": len(campaign_payments)
                })
        
        # Sort by spending
        campaign_spending.sort(key=lambda x: x["spent"], reverse=True)
        
        # Get earnings summary (if applicable)
        earnings = list(earnings_collection.find({"brand_id": brand_id}))
        earnings_summary = {
            "total_earnings": sum([e.get("amount", 0) for e in earnings if e.get("status") == EarningStatus.PAID]),
            "pending_earnings": sum([e.get("amount", 0) for e in earnings if e.get("status") == EarningStatus.PENDING]),
            "total_transactions": len(earnings)
        }
        
        return {
            "success": True,
            "data": {
                "summary": financial_analytics.get("summary", {}),
                "period_analysis": {
                    "period": period,
                    "data": formatted_period_data,
                    "total_periods": len(formatted_period_data),
                    "total_amount": sum([p["amount"] for p in formatted_period_data]),
                    "average_per_period": sum([p["amount"] for p in formatted_period_data]) / len(formatted_period_data) if formatted_period_data else 0
                },
                "campaign_spending": {
                    "top_campaigns": campaign_spending[:10],
                    "total_campaigns": len(campaign_spending),
                    "total_spent": sum([c["spent"] for c in campaign_spending])
                },
                "earnings_summary": earnings_summary,
                "category_analysis": financial_analytics.get("category_spending", []),
                "campaign_performance": financial_analytics.get("campaign_performance", [])
            }
        }
        
    except Exception as e:
        print(f"Error getting financial analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch financial analytics")

@router.get("/brand/analytics/export")
async def export_analytics_data(
    current_user: dict = Depends(get_current_user),
    data_type: str = Query("summary", description="Type of data to export: summary, campaigns, payments, applications, financial"),
    format: str = Query("json", description="Export format: json or csv"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Export analytics data in JSON or CSV format"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access analytics")

    brand_id = str(current_user["_id"])
    service = AnalyticsService(brand_id)

    try:
        # Fetch data based on data_type
        if data_type == "summary":
            # Get dashboard data directly without calling the route
            campaigns_summary = service.get_campaigns_summary()
            payment_analytics = service.get_payment_analytics()
            application_analytics = service.get_application_analytics()
            financial_analytics = service.get_financial_analytics()
            
            export_data = {
                "campaigns_summary": campaigns_summary,
                "payment_summary": payment_analytics.get("summary", {}),
                "application_summary": application_analytics.get("summary", {}),
                "financial_summary": financial_analytics.get("summary", {}),
                "performance_metrics": campaigns_summary.get("performance_metrics", {}),
                "exported_at": datetime.utcnow().isoformat(),
                "brand_id": brand_id
            }

        elif data_type == "campaigns":
            # Build filters for campaigns
            filters = {}
            if start_date:
                filters["start_date"] = start_date
            if end_date:
                filters["end_date"] = end_date
            
            # Get campaigns directly
            query = {"brand_id": brand_id}
            if start_date:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                query["created_at"] = {"$gte": start}
            if end_date:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                if "created_at" in query:
                    query["created_at"]["$lte"] = end
                else:
                    query["created_at"] = {"$lte": end}
            
            campaigns = list(campaigns_collection.find(query))
            campaigns_data = []
            
            for campaign in campaigns:
                campaign_id = str(campaign["_id"])
                campaign_analytics = service.get_detailed_campaign_analytics(campaign_id)
                
                # Get payment summary for this campaign
                payments = list(payments_collection.find({
                    "campaign_id": campaign_id,
                    "brand_id": brand_id
                }))
                payments = [serialize_mongo_doc(p) for p in payments]
                
                payment_summary = {
                    "total_payments": len(payments),
                    "completed_payments": len([p for p in payments if p.get("status") == PaymentStatus.COMPLETED.value]),
                    "total_amount_paid": sum([p.get("amount", 0) for p in payments if p.get("status") == PaymentStatus.COMPLETED.value])
                }
                
                campaign_data = serialize_mongo_doc(campaign)
                campaigns_data.append({
                    **campaign_data,
                    "analytics": campaign_analytics.get("performance", {}),
                    "payment_summary": serialize_mongo_doc(payment_summary),
                    "application_stats": campaign_analytics.get("application_stats", {}),
                    "influencer_insights": campaign_analytics.get("influencer_insights", {})
                })
            
            export_data = {
                "campaigns": campaigns_data,
                "filters": filters,
                "exported_at": datetime.utcnow().isoformat(),
                "total_count": len(campaigns_data)
            }

        elif data_type == "payments":
            # Build filters for payments
            filters = {}
            if start_date:
                filters["start_date"] = start_date
            if end_date:
                filters["end_date"] = end_date
            
            query = {"brand_id": brand_id}
            
            # Add date filters
            date_query = {}
            if start_date:
                try:
                    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                    date_query["$gte"] = start_dt
                except ValueError:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid start_date format. Use YYYY-MM-DD. Received: {start_date}"
                    )
            
            if end_date:
                try:
                    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                    end_dt = end_dt.replace(hour=23, minute=59, second=59)
                    date_query["$lte"] = end_dt
                except ValueError:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid end_date format. Use YYYY-MM-DD. Received: {end_date}"
                    )
            
            # Add date query if we have any date filters
            if date_query:
                query["created_at"] = date_query
            
            # Get payments
            payments = list(payments_collection.find(query).sort("created_at", -1))
            payments_data = []
            
            for payment in payments:
                payment_data = serialize_mongo_doc(payment)
                
                # Get campaign details
                if payment_data.get("campaign_id"):
                    campaign = campaigns_collection.find_one({"_id": ObjectId(payment_data["campaign_id"])})
                    if campaign:
                        campaign_data = serialize_mongo_doc(campaign)
                        payment_data["campaign_title"] = campaign_data.get("title", "Unknown Campaign")
                
                # Get influencer details
                if payment_data.get("influencer_id"):
                    influencer = users_collection.find_one({"_id": ObjectId(payment_data["influencer_id"])})
                    if influencer:
                        payment_data["influencer_name"] = influencer.get("username", "Unknown Influencer")
                        payment_data["influencer_email"] = influencer.get("email", "")
                
                payments_data.append(payment_data)
            
            # Calculate summary
            total_payments = len(payments_data)
            total_amount = sum([p.get("amount", 0) for p in payments_data])
            completed_payments = len([p for p in payments_data if p.get("status") == PaymentStatus.COMPLETED.value])
            
            export_data = {
                "payments": payments_data,
                "summary": {
                    "total_payments": total_payments,
                    "total_amount": total_amount,
                    "completed_payments": completed_payments,
                    "completion_rate": (completed_payments / total_payments * 100) if total_payments > 0 else 0,
                    "average_amount": total_amount / total_payments if total_payments > 0 else 0
                },
                "filters": filters,
                "exported_at": datetime.utcnow().isoformat()
            }

        elif data_type == "applications":
            # Build filters
            filters = {}
            if start_date:
                filters["start_date"] = start_date
            if end_date:
                filters["end_date"] = end_date
            
            # Get applications
            campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
            all_applications = []
            
            for campaign in campaigns:
                campaign_id_str = str(campaign["_id"])
                applications = campaign.get("applications", [])
                
                for app in applications:
                    app_data = serialize_mongo_doc(app)
                    app_data["campaign_id"] = campaign_id_str
                    app_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
                    app_data["campaign_status"] = campaign.get("status", "active")
                    
                    # Date filtering
                    applied_at = app_data.get("applied_at")
                    if applied_at and start_date:
                        try:
                            if isinstance(applied_at, str):
                                applied_at_dt = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                            else:
                                applied_at_dt = applied_at
                            
                            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                            if applied_at_dt < start_dt:
                                continue
                        except:
                            pass
                    
                    if applied_at and end_date:
                        try:
                            if isinstance(applied_at, str):
                                applied_at_dt = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                            else:
                                applied_at_dt = applied_at
                            
                            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                            if applied_at_dt > end_dt:
                                continue
                        except:
                            pass
                    
                    # Get influencer details
                    if app_data.get("influencer_id"):
                        influencer_profile = get_user_profile_details(app_data["influencer_id"])
                        if influencer_profile:
                            app_data["influencer_name"] = influencer_profile.get("profile", {}).get("full_name") or influencer_profile.get("username", "Unknown")
                            app_data["influencer_followers"] = influencer_profile.get("profile", {}).get("followers", {}).get("total", 0)
                    
                    all_applications.append(app_data)
            
            # Calculate summary
            total_applications = len(all_applications)
            status_counts = {}
            for app in all_applications:
                status = app.get("status", "unknown")
                if status not in status_counts:
                    status_counts[status] = 0
                status_counts[status] += 1
            
            export_data = {
                "applications": all_applications,
                "summary": {
                    "total_applications": total_applications,
                    "status_distribution": status_counts,
                    "average_match_score": sum([a.get("match_score", 0) for a in all_applications]) / total_applications if total_applications > 0 else 0,
                    "average_proposed_amount": sum([a.get("proposed_amount", 0) for a in all_applications]) / total_applications if total_applications > 0 else 0
                },
                "filters": filters,
                "exported_at": datetime.utcnow().isoformat()
            }

        elif data_type == "financial":
            # Get financial data directly
            export_data = service.get_financial_analytics()
            if not isinstance(export_data, dict):
                export_data = serialize_mongo_doc(export_data)
            
            # Add export metadata
            export_data.update({
                "exported_at": datetime.utcnow().isoformat(),
                "period": financialPeriod if 'financialPeriod' in locals() else "custom",
                "brand_id": brand_id
            })

        else:
            raise HTTPException(status_code=400, detail=f"Invalid data_type: {data_type}. Must be one of: summary, campaigns, payments, applications, financial")

        # Handle JSON export
        if format == "json":
            return JSONResponse(
                content=serialize_mongo_doc(export_data),
                headers={
                    "Content-Disposition": f'attachment; filename="{data_type}_export_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.json"',
                    "Content-Type": "application/json"
                }
            )

        # Handle CSV export
        elif format == "csv":
            import csv
            from io import StringIO
            
            # Determine which data to export to CSV
            data_to_export = None
            if data_type == "summary":
                # Flatten summary data for CSV
                flattened_data = []
                for key, value in export_data.items():
                    if isinstance(value, dict):
                        for subkey, subvalue in value.items():
                            flattened_data.append({
                                "category": key,
                                "metric": subkey,
                                "value": subvalue
                            })
                    else:
                        flattened_data.append({
                            "category": "metadata",
                            "metric": key,
                            "value": value
                        })
                data_to_export = flattened_data
                
            elif data_type in ["campaigns", "payments", "applications"]:
                # Use the list data directly
                data_key = data_type
                if data_type == "campaigns":
                    data_key = "campaigns"
                elif data_type == "payments":
                    data_key = "payments"
                elif data_type == "applications":
                    data_key = "applications"
                
                data_to_export = export_data.get(data_key, [])
                
                # If empty, return empty CSV
                if not data_to_export:
                    # Create empty response
                    output = StringIO()
                    writer = csv.writer(output)
                    writer.writerow(["No data available"])
                    
                    return StreamingResponse(
                        iter([output.getvalue()]),
                        media_type="text/csv",
                        headers={
                            "Content-Disposition": f'attachment; filename="{data_type}_export_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv"'
                        }
                    )
            
            elif data_type == "financial":
                # For financial data, combine summary and breakdowns
                data_to_export = []
                
                # Add summary
                summary = export_data.get("summary", {})
                for key, value in summary.items():
                    data_to_export.append({
                        "type": "summary",
                        "metric": key,
                        "value": value
                    })
                
                # Add monthly spending
                monthly = export_data.get("monthly_spending", [])
                for item in monthly:
                    data_to_export.append({
                        "type": "monthly_spending",
                        "period": item.get("month"),
                        "amount": item.get("amount")
                    })
                
                # Add category spending
                category = export_data.get("category_spending", [])
                for item in category:
                    data_to_export.append({
                        "type": "category_spending",
                        "category": item.get("category"),
                        "amount": item.get("amount")
                    })
            
            if not data_to_export:
                raise HTTPException(status_code=404, detail="No data available for CSV export")
            
            # Flatten nested dictionaries for CSV
            def flatten_dict(d, parent_key='', sep='_'):
                items = []
                for k, v in d.items():
                    new_key = f"{parent_key}{sep}{k}" if parent_key else k
                    if isinstance(v, dict):
                        items.extend(flatten_dict(v, new_key, sep=sep).items())
                    elif isinstance(v, list):
                        # Convert lists to strings
                        items.append((new_key, json.dumps(v)))
                    else:
                        items.append((new_key, v))
                return dict(items)
            
            # Prepare data for CSV
            csv_data = []
            for item in data_to_export:
                if isinstance(item, dict):
                    csv_data.append(flatten_dict(item))
                else:
                    csv_data.append({"data": str(item)})
            
            # Get all unique headers
            headers = set()
            for row in csv_data:
                headers.update(row.keys())
            headers = sorted(headers)
            
            # Create CSV
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=headers)
            writer.writeheader()
            for row in csv_data:
                # Ensure all keys are present
                for header in headers:
                    if header not in row:
                        row[header] = ""
                writer.writerow(row)
            
            csv_content = output.getvalue()
            
            return StreamingResponse(
                iter([csv_content]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f'attachment; filename="{data_type}_export_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv"',
                    "Content-Type": "text/csv; charset=utf-8"
                }
            )

        else:
            raise HTTPException(status_code=400, detail="Invalid format. Must be 'json' or 'csv'")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error exporting data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

@router.get("/brand/analytics/health")
async def analytics_health_check():
    """Health check for analytics routes"""
    return {
        "status": "healthy",
        "service": "brand-analytics-api",
        "version": "3.0.0",
        "features": [
            "dashboard_analytics",
            "campaign_analytics",
            "payment_analytics",
            "application_analytics",
            "financial_analytics",
            "influencer_insights",
            "performance_metrics",
            "data_export"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

# -------------------- NOTIFICATION ANALYTICS --------------------
@router.get("/brand/analytics/notifications")
async def get_notification_analytics(
    current_user: dict = Depends(get_current_user),
    days: int = Query(30, description="Number of days to analyze")
):
    """Get notification analytics for brand"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access analytics")
    
    brand_id = str(current_user["_id"])
    
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get notifications for brand
        notifications = list(notifications_collection.find({
            "user_id": brand_id,
            "created_at": {"$gte": start_date}
        }).sort("created_at", -1))
        
        # Analyze notifications
        notification_types = {}
        notification_status = {"read": 0, "unread": 0}
        
        for notification in notifications:
            notif_type = notification.get("type", "unknown")
            if notif_type not in notification_types:
                notification_types[notif_type] = 0
            notification_types[notif_type] += 1
            
            if notification.get("read", False):
                notification_status["read"] += 1
            else:
                notification_status["unread"] += 1
        
        # Calculate engagement rate
        total_notifications = len(notifications)
        engagement_rate = (notification_status["read"] / total_notifications * 100) if total_notifications > 0 else 0
        
        # Get recent notifications
        recent_notifications = []
        for notification in notifications[:20]:  # Limit to 20
            notif_data = serialize_mongo_doc(notification)
            recent_notifications.append(notif_data)
        
        return {
            "success": True,
            "data": {
                "summary": {
                    "total_notifications": total_notifications,
                    "unread_notifications": notification_status["unread"],
                    "engagement_rate": round(engagement_rate, 2),
                    "period_days": days
                },
                "type_distribution": notification_types,
                "status_distribution": notification_status,
                "recent_notifications": recent_notifications,
                "trends": self._calculate_notification_trends(notifications, days)
            }
        }
        
    except Exception as e:
        print(f"Error getting notification analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notification analytics")
    
def _calculate_notification_trends(self, notifications: List[Dict], days: int) -> List[Dict]:
        """Calculate notification trends over time"""
        try:
            daily_counts = {}
            
            for notification in notifications:
                created_at = notification.get("created_at")
                if created_at:
                    if isinstance(created_at, str):
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    
                    date_str = created_at.date().isoformat()
                    if date_str not in daily_counts:
                        daily_counts[date_str] = 0
                    daily_counts[date_str] += 1
            
            # Create trend data
            trends = []
            for i in range(days):
                date = (datetime.utcnow() - timedelta(days=i)).date()
                date_str = date.isoformat()
                count = daily_counts.get(date_str, 0)
                
                trends.append({
                    "date": date_str,
                    "count": count
                })
            
            return sorted(trends, key=lambda x: x["date"])
        except:
            return []    

# -------------------- INFLUENCER PERFORMANCE ANALYTICS --------------------
@router.get("/brand/analytics/influencer-performance")
async def get_influencer_performance_analytics(
    current_user: dict = Depends(get_current_user),
    influencer_id: Optional[str] = Query(None, description="Specific influencer ID"),
    min_applications: int = Query(1, description="Minimum applications"),
    min_completed: int = Query(0, description="Minimum completed campaigns")
):
    """Get influencer performance analytics"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access analytics")
    
    brand_id = str(current_user["_id"])
    
    try:
        # Get all campaigns for brand
        campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
        
        # Collect influencer data
        influencer_data = {}
        
        for campaign in campaigns:
            applications = campaign.get("applications", [])
            
            for app in applications:
                inf_id = app.get("influencer_id")
                if not inf_id:
                    continue
                
                if inf_id not in influencer_data:
                    influencer_data[inf_id] = {
                        "applications": [],
                        "campaigns": set(),
                        "total_earnings": 0
                    }
                
                influencer_data[inf_id]["applications"].append({
                    "campaign_id": str(campaign["_id"]),
                    "campaign_title": campaign.get("title", "Unknown"),
                    "status": app.get("status"),
                    "applied_at": app.get("applied_at"),
                    "proposed_amount": app.get("proposed_amount", 0),
                    "agreed_amount": app.get("agreed_amount", 0)
                })
                
                influencer_data[inf_id]["campaigns"].add(str(campaign["_id"]))
        
        # Get payment data for earnings
        payments = list(payments_collection.find({"brand_id": brand_id}))
        for payment in payments:
            inf_id = payment.get("influencer_id")
            if inf_id in influencer_data and payment.get("status") == PaymentStatus.COMPLETED:
                influencer_data[inf_id]["total_earnings"] += payment.get("amount", 0)
        
        # Filter and format influencer data
        influencer_performance = []
        
        for inf_id, data in influencer_data.items():
            applications = data["applications"]
            total_apps = len(applications)
            
            # Filter by minimum applications
            if total_apps < min_applications:
                continue
            
            completed_apps = len([a for a in applications if a.get("status") == ApplicationStatus.COMPLETED])
            
            # Filter by minimum completed
            if completed_apps < min_completed:
                continue
            
            # Get influencer profile
            influencer_profile = get_user_profile_details(inf_id)
            
            # Calculate metrics
            approval_rate = len([a for a in applications if a.get("status") == ApplicationStatus.APPROVED]) / total_apps * 100 if total_apps > 0 else 0
            completion_rate = completed_apps / total_apps * 100 if total_apps > 0 else 0
            
            # Calculate average response time (simplified)
            avg_response_time = 24  # Placeholder
            
            influencer_performance.append({
                "influencer_id": inf_id,
                "profile": influencer_profile,
                "metrics": {
                    "total_applications": total_apps,
                    "total_campaigns": len(data["campaigns"]),
                    "completed_campaigns": completed_apps,
                    "total_earnings": data["total_earnings"],
                    "approval_rate": round(approval_rate, 2),
                    "completion_rate": round(completion_rate, 2),
                    "average_response_time": avg_response_time,
                    "earnings_per_campaign": round(data["total_earnings"] / completed_apps, 2) if completed_apps > 0 else 0
                },
                "recent_applications": applications[:5]  # Last 5 applications
            })
        
        # Sort by performance
        influencer_performance.sort(
            key=lambda x: (
                x["metrics"]["completion_rate"],
                x["metrics"]["total_earnings"]
            ),
            reverse=True
        )
        
        # Filter by specific influencer if provided
        if influencer_id:
            influencer_performance = [inf for inf in influencer_performance if inf["influencer_id"] == influencer_id]
        
        return {
            "success": True,
            "data": {
                "total_influencers": len(influencer_performance),
                "influencer_performance": influencer_performance,
                "filters": {
                    "min_applications": min_applications,
                    "min_completed": min_completed,
                    "specific_influencer": influencer_id if influencer_id else "all"
                }
            }
        }
        
    except Exception as e:
        print(f"Error getting influencer performance analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch influencer performance analytics")

@router.get("/brand/analytics/health")
async def analytics_health_check():
    """Health check for analytics routes"""
    return serialize_mongo_doc({
        "status": "healthy",
        "service": "brand-analytics-api",
        "version": "3.0.0",
        "features": [
            "dashboard_analytics",
            "campaign_analytics",
            "payment_analytics",
            "application_analytics",
            "financial_analytics",
            "influencer_insights",
            "performance_metrics",
            "data_export"
        ],
        "timestamp": datetime.utcnow().isoformat()
    })