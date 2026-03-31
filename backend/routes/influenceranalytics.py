# from fastapi import APIRouter, HTTPException, Depends, Query
# from pydantic import BaseModel, Field
# from typing import List, Dict, Optional, Any, Union
# from datetime import datetime, timedelta
# from enum import Enum
# import logging
# from bson import ObjectId
# from bson.errors import InvalidId
# from database import campaigns_collection, users_collection, payments_collection, earnings_collection, messages_collection
# from auth.utils import get_current_user
# import math
# from collections import defaultdict, Counter
# import asyncio

# # Configure logging
# logger = logging.getLogger(__name__)

# router = APIRouter()

# # -------------------- ANALYTICS SCHEMAS --------------------

# class TimeRange(str, Enum):
#     LAST_7_DAYS = "7d"
#     LAST_30_DAYS = "30d"
#     LAST_90_DAYS = "90d"
#     LAST_6_MONTHS = "6m"
#     LAST_YEAR = "1y"
#     ALL_TIME = "all"

# class MetricType(str, Enum):
#     APPLICATIONS = "applications"
#     APPROVALS = "approvals"
#     CONVERSIONS = "conversions"
#     EARNINGS = "earnings"
#     ENGAGEMENT = "engagement"
#     COMPLETION_RATE = "completion_rate"

# class InfluencerStats(BaseModel):
#     total_applications: int
#     approved_applications: int
#     contracted_campaigns: int
#     completed_campaigns: int
#     total_earnings: float
#     avg_earnings_per_campaign: float
#     application_conversion_rate: float
#     completion_rate: float
#     response_rate: float
#     avg_response_time_hours: float

# class CampaignPerformance(BaseModel):
#     campaign_id: str
#     campaign_title: str
#     applications_count: int
#     approval_rate: float
#     completion_rate: float
#     total_budget: float
#     utilized_budget: float
#     roi: float
#     engagement_score: float

# class EarningsAnalytics(BaseModel):
#     total_earnings: float
#     pending_earnings: float
#     withdrawn_earnings: float
#     earnings_trend: List[Dict[str, Any]]
#     top_performing_campaigns: List[Dict[str, Any]]
#     earnings_by_category: List[Dict[str, Any]]

# class EngagementMetrics(BaseModel):
#     avg_response_time: float
#     message_response_rate: float
#     application_quality_score: float
#     media_submission_quality: float
#     overall_engagement_score: float

# class PerformanceTrend(BaseModel):
#     period: str
#     applications: int
#     approvals: int
#     completions: int
#     earnings: float
#     engagement_score: float

# class InfluencerRanking(BaseModel):
#     influencer_id: str
#     influencer_name: str
#     overall_score: float
#     completion_rate: float
#     earnings: float
#     engagement_score: float
#     response_rate: float
#     rank: int
#     tier: str

# class AnalyticsResponse(BaseModel):
#     influencer_id: str
#     time_range: TimeRange
#     stats: InfluencerStats
#     performance_trends: List[PerformanceTrend]
#     campaign_performance: List[CampaignPerformance]
#     earnings_analytics: EarningsAnalytics
#     engagement_metrics: EngagementMetrics
#     recommendations: List[str]

# # -------------------- HELPER FUNCTIONS --------------------

# def validate_object_id(id_str: str) -> ObjectId:
#     """Validate and convert string to ObjectId"""
#     try:
#         return ObjectId(id_str)
#     except InvalidId:
#         raise HTTPException(status_code=400, detail="Invalid ID format")

# def get_time_range_dates(time_range: TimeRange) -> tuple:
#     """Get start and end dates for time range"""
#     end_date = datetime.utcnow()
    
#     if time_range == TimeRange.LAST_7_DAYS:
#         start_date = end_date - timedelta(days=7)
#     elif time_range == TimeRange.LAST_30_DAYS:
#         start_date = end_date - timedelta(days=30)
#     elif time_range == TimeRange.LAST_90_DAYS:
#         start_date = end_date - timedelta(days=90)
#     elif time_range == TimeRange.LAST_6_MONTHS:
#         start_date = end_date - timedelta(days=180)
#     elif time_range == TimeRange.LAST_YEAR:
#         start_date = end_date - timedelta(days=365)
#     else:  # ALL_TIME
#         start_date = datetime(2020, 1, 1)  # Platform start date
    
#     return start_date, end_date

# def calculate_engagement_score(influencer_id: str, time_range: TimeRange) -> float:
#     """Calculate overall engagement score for influencer"""
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         # Get messages and calculate response metrics
#         messages = list(messages_collection.find({
#             "$or": [
#                 {"sender_id": influencer_id},
#                 {"receiver_id": influencer_id}
#             ],
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         if not messages:
#             return 0.0
        
#         # Calculate response time and rate
#         response_times = []
#         messages_received = 0
#         messages_responded = 0
        
#         for i in range(1, len(messages)):
#             prev_msg = messages[i-1]
#             current_msg = messages[i]
            
#             if (prev_msg["receiver_id"] == influencer_id and 
#                 current_msg["sender_id"] == influencer_id and
#                 prev_msg["sender_id"] == current_msg["receiver_id"]):
                
#                 response_time = (current_msg["created_at"] - prev_msg["created_at"]).total_seconds() / 3600  # hours
#                 response_times.append(response_time)
#                 messages_responded += 1
            
#             if current_msg["receiver_id"] == influencer_id:
#                 messages_received += 1
        
#         avg_response_time = sum(response_times) / len(response_times) if response_times else 48  # Default 48 hours if no responses
#         response_rate = (messages_responded / messages_received) * 100 if messages_received > 0 else 0
        
#         # Calculate application quality (based on approval rate)
#         campaigns = list(campaigns_collection.find({
#             "applications.influencer_id": influencer_id,
#             "applications.applied_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         total_applications = 0
#         approved_applications = 0
        
#         for campaign in campaigns:
#             for app in campaign.get("applications", []):
#                 if app["influencer_id"] == influencer_id:
#                     total_applications += 1
#                     if app.get("status") == "approved":
#                         approved_applications += 1
        
#         approval_rate = (approved_applications / total_applications * 100) if total_applications > 0 else 0
        
#         # Calculate completion rate
#         completed_campaigns = 0
#         contracted_campaigns = 0
        
#         for campaign in campaigns:
#             for app in campaign.get("applications", []):
#                 if app["influencer_id"] == influencer_id:
#                     if app.get("contract_signed"):
#                         contracted_campaigns += 1
#                         if app.get("status") == "completed":
#                             completed_campaigns += 1
        
#         completion_rate = (completed_campaigns / contracted_campaigns * 100) if contracted_campaigns > 0 else 0
        
#         # Normalize scores and calculate overall engagement
#         response_time_score = max(0, 100 - (avg_response_time / 48 * 100))  # 48 hours = 0 score
#         response_rate_score = min(100, response_rate)
#         approval_rate_score = min(100, approval_rate)
#         completion_rate_score = min(100, completion_rate)
        
#         overall_score = (
#             response_time_score * 0.25 +
#             response_rate_score * 0.25 +
#             approval_rate_score * 0.25 +
#             completion_rate_score * 0.25
#         )
        
#         return round(overall_score, 2)
        
#     except Exception as e:
#         logger.error(f"Error calculating engagement score: {str(e)}")
#         return 0.0

# def calculate_earnings_analytics(influencer_id: str, time_range: TimeRange) -> EarningsAnalytics:
#     """Calculate comprehensive earnings analytics"""
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         # Get earnings data
#         earnings_data = list(earnings_collection.find({
#             "influencer_id": influencer_id,
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         # Get payment data
#         payments_data = list(payments_collection.find({
#             "influencer_id": influencer_id,
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         total_earnings = sum(earn.get("amount", 0) for earn in earnings_data)
#         pending_earnings = sum(earn.get("amount", 0) for earn in earnings_data if earn.get("status") == "pending")
#         withdrawn_earnings = sum(pay.get("amount", 0) for pay in payments_data if pay.get("status") == "completed")
        
#         # Calculate earnings trend (monthly)
#         earnings_trend = []
#         current_date = start_date
#         while current_date <= end_date:
#             month_start = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
#             next_month = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
            
#             month_earnings = sum(
#                 earn.get("amount", 0) for earn in earnings_data 
#                 if month_start <= earn.get("created_at", datetime.utcnow()) < next_month
#             )
            
#             earnings_trend.append({
#                 "period": month_start.strftime("%Y-%m"),
#                 "earnings": month_earnings,
#                 "campaigns_count": len([e for e in earnings_data if month_start <= e.get("created_at", datetime.utcnow()) < next_month])
#             })
            
#             current_date = next_month
        
#         # Get top performing campaigns
#         campaign_earnings = defaultdict(float)
#         for earn in earnings_data:
#             campaign_id = earn.get("campaign_id")
#             if campaign_id:
#                 campaign_earnings[campaign_id] += earn.get("amount", 0)
        
#         top_campaigns = []
#         for campaign_id, earnings in sorted(campaign_earnings.items(), key=lambda x: x[1], reverse=True)[:5]:
#             campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
#             if campaign:
#                 top_campaigns.append({
#                     "campaign_id": campaign_id,
#                     "campaign_title": campaign.get("title", "Unknown Campaign"),
#                     "earnings": earnings,
#                     "category": campaign.get("category", "Unknown")
#                 })
        
#         # Calculate earnings by category
#         category_earnings = defaultdict(float)
#         for earn in earnings_data:
#             campaign_id = earn.get("campaign_id")
#             if campaign_id:
#                 campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
#                 if campaign:
#                     category = campaign.get("category", "Unknown")
#                     category_earnings[category] += earn.get("amount", 0)
        
#         earnings_by_category = [{"category": cat, "earnings": earnings} for cat, earnings in category_earnings.items()]
        
#         return EarningsAnalytics(
#             total_earnings=total_earnings,
#             pending_earnings=pending_earnings,
#             withdrawn_earnings=withdrawn_earnings,
#             earnings_trend=earnings_trend,
#             top_performing_campaigns=top_campaigns,
#             earnings_by_category=earnings_by_category
#         )
        
#     except Exception as e:
#         logger.error(f"Error calculating earnings analytics: {str(e)}")
#         return EarningsAnalytics(
#             total_earnings=0,
#             pending_earnings=0,
#             withdrawn_earnings=0,
#             earnings_trend=[],
#             top_performing_campaigns=[],
#             earnings_by_category=[]
#         )

# def calculate_performance_trends(influencer_id: str, time_range: TimeRange) -> List[PerformanceTrend]:
#     """Calculate performance trends over time"""
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         # Group by appropriate time periods based on range
#         if time_range in [TimeRange.LAST_7_DAYS, TimeRange.LAST_30_DAYS]:
#             period_format = "%Y-%m-%d"  # Daily
#         elif time_range in [TimeRange.LAST_90_DAYS, TimeRange.LAST_6_MONTHS]:
#             period_format = "%Y-%m-%W"  # Weekly
#         else:
#             period_format = "%Y-%m"  # Monthly
        
#         trends = []
#         current = start_date
        
#         while current <= end_date:
#             if period_format == "%Y-%m-%d":
#                 period_end = current + timedelta(days=1)
#                 period_key = current.strftime(period_format)
#             elif period_format == "%Y-%m-%W":
#                 period_end = current + timedelta(weeks=1)
#                 period_key = current.strftime(period_format)
#             else:  # monthly
#                 next_month = current.replace(month=current.month + 1) if current.month < 12 else current.replace(year=current.year + 1, month=1)
#                 period_end = next_month
#                 period_key = current.strftime(period_format)
            
#             # Get applications for period
#             applications_count = 0
#             approvals_count = 0
#             completions_count = 0
#             period_earnings = 0
            
#             campaigns = list(campaigns_collection.find({
#                 "applications.influencer_id": influencer_id,
#                 "applications.applied_at": {"$gte": current, "$lt": period_end}
#             }))
            
#             for campaign in campaigns:
#                 for app in campaign.get("applications", []):
#                     if app["influencer_id"] == influencer_id:
#                         applications_count += 1
#                         if app.get("status") == "approved":
#                             approvals_count += 1
#                         if app.get("status") == "completed":
#                             completions_count += 1
            
#             # Get earnings for period
#             earnings = list(earnings_collection.find({
#                 "influencer_id": influencer_id,
#                 "created_at": {"$gte": current, "$lt": period_end}
#             }))
            
#             period_earnings = sum(earn.get("amount", 0) for earn in earnings)
            
#             # Calculate engagement score for period
#             engagement_score = calculate_engagement_score(influencer_id, TimeRange.LAST_30_DAYS)  # Fixed period for trend consistency
            
#             trends.append(PerformanceTrend(
#                 period=period_key,
#                 applications=applications_count,
#                 approvals=approvals_count,
#                 completions=completions_count,
#                 earnings=period_earnings,
#                 engagement_score=engagement_score
#             ))
            
#             current = period_end
        
#         return trends
        
#     except Exception as e:
#         logger.error(f"Error calculating performance trends: {str(e)}")
#         return []

# def get_campaign_performance(influencer_id: str, time_range: TimeRange) -> List[CampaignPerformance]:
#     """Get performance metrics for each campaign"""
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         campaigns = list(campaigns_collection.find({
#             "applications.influencer_id": influencer_id,
#             "applications.applied_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         performance_data = []
        
#         for campaign in campaigns:
#             campaign_id = str(campaign["_id"])
#             applications = [app for app in campaign.get("applications", []) if app["influencer_id"] == influencer_id]
            
#             if not applications:
#                 continue
            
#             applications_count = len(applications)
#             approved_count = len([app for app in applications if app.get("status") == "approved"])
#             completed_count = len([app for app in applications if app.get("status") == "completed"])
            
#             approval_rate = (approved_count / applications_count * 100) if applications_count > 0 else 0
#             completion_rate = (completed_count / approved_count * 100) if approved_count > 0 else 0
            
#             # Calculate earnings from this campaign
#             earnings_data = list(earnings_collection.find({
#                 "influencer_id": influencer_id,
#                 "campaign_id": campaign_id
#             }))
            
#             utilized_budget = sum(earn.get("amount", 0) for earn in earnings_data)
#             total_budget = campaign.get("budget", 0)
            
#             # Simple ROI calculation (earnings / time invested)
#             # This is a simplified version - you might want to enhance this
#             roi = (utilized_budget / total_budget * 100) if total_budget > 0 else 0
            
#             # Engagement score for this campaign
#             engagement_score = calculate_engagement_score(influencer_id, time_range)
            
#             performance_data.append(CampaignPerformance(
#                 campaign_id=campaign_id,
#                 campaign_title=campaign.get("title", "Unknown Campaign"),
#                 applications_count=applications_count,
#                 approval_rate=round(approval_rate, 2),
#                 completion_rate=round(completion_rate, 2),
#                 total_budget=total_budget,
#                 utilized_budget=utilized_budget,
#                 roi=round(roi, 2),
#                 engagement_score=round(engagement_score, 2)
#             ))
        
#         return sorted(performance_data, key=lambda x: x.roi, reverse=True)
        
#     except Exception as e:
#         logger.error(f"Error calculating campaign performance: {str(e)}")
#         return []

# def generate_recommendations(stats: InfluencerStats, engagement: EngagementMetrics) -> List[str]:
#     """Generate personalized recommendations for improvement"""
#     recommendations = []
    
#     if stats.application_conversion_rate < 30:
#         recommendations.append(
#             "Focus on applying to campaigns that better match your niche and audience demographics. "
#             "Quality over quantity increases approval rates."
#         )
    
#     if stats.completion_rate < 80:
#         recommendations.append(
#             "Improve campaign completion rates by setting realistic deadlines and communicating "
#             "proactively with brands about any challenges."
#         )
    
#     if engagement.avg_response_time > 24:
#         recommendations.append(
#             "Try to respond to messages within 24 hours. Faster response times improve your "
#             "professional reputation and increase brand satisfaction."
#         )
    
#     if engagement.message_response_rate < 80:
#         recommendations.append(
#             "Increase your message response rate. Brands appreciate influencers who are "
#             "responsive and easy to communicate with."
#         )
    
#     if stats.avg_earnings_per_campaign < 100:
#         recommendations.append(
#             "Consider increasing your rates for future campaigns. Focus on demonstrating "
#             "the value you provide through your engagement metrics and past performance."
#         )
    
#     if len(recommendations) == 0:
#         recommendations.append(
#             "Great job! Your performance metrics are strong. Continue maintaining your "
#             "high standards and consider mentoring other influencers."
#         )
    
#     return recommendations[:5]  # Return top 5 recommendations

# # -------------------- ANALYTICS ROUTES --------------------

# @router.get("/analytics/overview", response_model=AnalyticsResponse)
# async def get_influencer_analytics(
#     time_range: TimeRange = Query(TimeRange.LAST_30_DAYS, description="Time range for analytics"),
#     current_user: dict = Depends(get_current_user)
# ):
#     """
#     Get comprehensive analytics for an influencer
#     """
#     if current_user["role"] != "influencer":
#         raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
#     influencer_id = str(current_user["_id"])
    
#     try:
#         # Calculate basic stats
#         start_date, end_date = get_time_range_dates(time_range)
        
#         campaigns = list(campaigns_collection.find({
#             "applications.influencer_id": influencer_id,
#             "applications.applied_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         # Extract all applications for this influencer
#         all_applications = []
#         for campaign in campaigns:
#             for app in campaign.get("applications", []):
#                 if app["influencer_id"] == influencer_id:
#                     all_applications.append(app)
        
#         total_applications = len(all_applications)
#         approved_applications = len([app for app in all_applications if app.get("status") == "approved"])
#         contracted_campaigns = len([app for app in all_applications if app.get("contract_signed")])
#         completed_campaigns = len([app for app in all_applications if app.get("status") == "completed"])
        
#         # Calculate earnings
#         earnings_data = list(earnings_collection.find({
#             "influencer_id": influencer_id,
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         total_earnings = sum(earn.get("amount", 0) for earn in earnings_data)
#         avg_earnings_per_campaign = total_earnings / completed_campaigns if completed_campaigns > 0 else 0
        
#         # Calculate rates
#         application_conversion_rate = (approved_applications / total_applications * 100) if total_applications > 0 else 0
#         completion_rate = (completed_campaigns / contracted_campaigns * 100) if contracted_campaigns > 0 else 0
        
#         # Calculate response metrics
#         messages = list(messages_collection.find({
#             "$or": [
#                 {"sender_id": influencer_id},
#                 {"receiver_id": influencer_id}
#             ],
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         response_rate = calculate_response_rate(messages, influencer_id)
#         avg_response_time = calculate_avg_response_time(messages, influencer_id)
        
#         stats = InfluencerStats(
#             total_applications=total_applications,
#             approved_applications=approved_applications,
#             contracted_campaigns=contracted_campaigns,
#             completed_campaigns=completed_campaigns,
#             total_earnings=round(total_earnings, 2),
#             avg_earnings_per_campaign=round(avg_earnings_per_campaign, 2),
#             application_conversion_rate=round(application_conversion_rate, 2),
#             completion_rate=round(completion_rate, 2),
#             response_rate=round(response_rate, 2),
#             avg_response_time_hours=round(avg_response_time, 2)
#         )
        
#         # Calculate other analytics
#         performance_trends = calculate_performance_trends(influencer_id, time_range)
#         campaign_performance = get_campaign_performance(influencer_id, time_range)
#         earnings_analytics = calculate_earnings_analytics(influencer_id, time_range)
        
#         engagement_metrics = EngagementMetrics(
#             avg_response_time=round(avg_response_time, 2),
#             message_response_rate=round(response_rate, 2),
#             application_quality_score=round(application_conversion_rate, 2),
#             media_submission_quality=calculate_media_quality_score(influencer_id, time_range),
#             overall_engagement_score=calculate_engagement_score(influencer_id, time_range)
#         )
        
#         recommendations = generate_recommendations(stats, engagement_metrics)
        
#         return AnalyticsResponse(
#             influencer_id=influencer_id,
#             time_range=time_range,
#             stats=stats,
#             performance_trends=performance_trends,
#             campaign_performance=campaign_performance,
#             earnings_analytics=earnings_analytics,
#             engagement_metrics=engagement_metrics,
#             recommendations=recommendations
#         )
        
#     except Exception as e:
#         logger.error(f"Error generating analytics: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to generate analytics")

# @router.get("/analytics/earnings", response_model=EarningsAnalytics)
# async def get_earnings_analytics(
#     time_range: TimeRange = Query(TimeRange.LAST_30_DAYS, description="Time range for earnings data"),
#     current_user: dict = Depends(get_current_user)
# ):
#     """
#     Get detailed earnings analytics for an influencer
#     """
#     if current_user["role"] != "influencer":
#         raise HTTPException(status_code=403, detail="Only influencers can access earnings analytics")
    
#     influencer_id = str(current_user["_id"])
    
#     try:
#         return calculate_earnings_analytics(influencer_id, time_range)
#     except Exception as e:
#         logger.error(f"Error getting earnings analytics: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to get earnings analytics")

# @router.get("/analytics/engagement", response_model=EngagementMetrics)
# async def get_engagement_metrics(
#     time_range: TimeRange = Query(TimeRange.LAST_30_DAYS, description="Time range for engagement data"),
#     current_user: dict = Depends(get_current_user)
# ):
#     """
#     Get engagement metrics for an influencer
#     """
#     if current_user["role"] != "influencer":
#         raise HTTPException(status_code=403, detail="Only influencers can access engagement metrics")
    
#     influencer_id = str(current_user["_id"])
    
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         messages = list(messages_collection.find({
#             "$or": [
#                 {"sender_id": influencer_id},
#                 {"receiver_id": influencer_id}
#             ],
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         avg_response_time = calculate_avg_response_time(messages, influencer_id)
#         response_rate = calculate_response_rate(messages, influencer_id)
        
#         # Calculate application quality (approval rate)
#         campaigns = list(campaigns_collection.find({
#             "applications.influencer_id": influencer_id,
#             "applications.applied_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         total_applications = 0
#         approved_applications = 0
        
#         for campaign in campaigns:
#             for app in campaign.get("applications", []):
#                 if app["influencer_id"] == influencer_id:
#                     total_applications += 1
#                     if app.get("status") == "approved":
#                         approved_applications += 1
        
#         application_quality_score = (approved_applications / total_applications * 100) if total_applications > 0 else 0
        
#         return EngagementMetrics(
#             avg_response_time=round(avg_response_time, 2),
#             message_response_rate=round(response_rate, 2),
#             application_quality_score=round(application_quality_score, 2),
#             media_submission_quality=calculate_media_quality_score(influencer_id, time_range),
#             overall_engagement_score=calculate_engagement_score(influencer_id, time_range)
#         )
        
#     except Exception as e:
#         logger.error(f"Error getting engagement metrics: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to get engagement metrics")

# @router.get("/analytics/leaderboard", response_model=List[InfluencerRanking])
# async def get_influencer_leaderboard(
#     metric: MetricType = Query(MetricType.EARNINGS, description="Metric to rank by"),
#     time_range: TimeRange = Query(TimeRange.LAST_90_DAYS, description="Time range for ranking"),
#     limit: int = Query(50, ge=1, le=100, description="Number of influencers to return"),
#     current_user: dict = Depends(get_current_user)
# ):
#     """
#     Get influencer leaderboard based on various metrics
#     """
#     if current_user["role"] not in ["admin", "brand"]:
#         raise HTTPException(status_code=403, detail="Only admins and brands can access leaderboard")
    
#     try:
#         influencers = list(users_collection.find({"role": "influencer"}).limit(limit))
#         rankings = []
        
#         for influencer in influencers:
#             influencer_id = str(influencer["_id"])
            
#             # Calculate metrics for this influencer
#             stats = calculate_influencer_metrics(influencer_id, time_range)
#             engagement_score = calculate_engagement_score(influencer_id, time_range)
            
#             # Determine score based on selected metric
#             if metric == MetricType.EARNINGS:
#                 score = stats.get("total_earnings", 0)
#             elif metric == MetricType.APPROVALS:
#                 score = stats.get("approval_rate", 0)
#             elif metric == MetricType.CONVERSIONS:
#                 score = stats.get("completion_rate", 0)
#             elif metric == MetricType.APPLICATIONS:
#                 score = stats.get("total_applications", 0)
#             elif metric == MetricType.ENGAGEMENT:
#                 score = engagement_score
#             else:  # COMPLETION_RATE
#                 score = stats.get("completion_rate", 0)
            
#             rankings.append(InfluencerRanking(
#                 influencer_id=influencer_id,
#                 influencer_name=influencer.get("username", "Unknown Influencer"),
#                 overall_score=round(score, 2),
#                 completion_rate=stats.get("completion_rate", 0),
#                 earnings=stats.get("total_earnings", 0),
#                 engagement_score=engagement_score,
#                 response_rate=stats.get("response_rate", 0),
#                 rank=0,  # Will be set after sorting
#                 tier=calculate_tier(score, metric)
#             ))
        
#         # Sort and rank
#         rankings.sort(key=lambda x: x.overall_score, reverse=True)
#         for i, ranking in enumerate(rankings):
#             ranking.rank = i + 1
        
#         return rankings[:limit]
        
#     except Exception as e:
#         logger.error(f"Error generating leaderboard: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to generate leaderboard")

# @router.get("/analytics/brand/{brand_id}/campaign-performance")
# async def get_brand_campaign_analytics(
#     brand_id: str,
#     time_range: TimeRange = Query(TimeRange.LAST_90_DAYS, description="Time range for analytics"),
#     current_user: dict = Depends(get_current_user)
# ):
#     """
#     Get campaign performance analytics for a brand
#     """
#     if current_user["role"] not in ["admin", "brand"]:
#         raise HTTPException(status_code=403, detail="Not authorized to access brand analytics")
    
#     if current_user["role"] == "brand" and str(current_user["_id"]) != brand_id:
#         raise HTTPException(status_code=403, detail="Can only access your own brand analytics")
    
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         campaigns = list(campaigns_collection.find({
#             "brand_id": brand_id,
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         campaign_analytics = []
        
#         for campaign in campaigns:
#             campaign_id = str(campaign["_id"])
#             applications = campaign.get("applications", [])
            
#             total_applications = len(applications)
#             approved_applications = len([app for app in applications if app.get("status") == "approved"])
#             completed_applications = len([app for app in applications if app.get("status") == "completed"])
            
#             # Calculate engagement metrics for this campaign
#             response_times = []
#             for app in applications:
#                 influencer_id = app["influencer_id"]
#                 messages = list(messages_collection.find({
#                     "campaign_id": campaign_id,
#                     "$or": [
#                         {"sender_id": influencer_id},
#                         {"receiver_id": influencer_id}
#                     ]
#                 }))
                
#                 if messages:
#                     avg_time = calculate_avg_response_time(messages, influencer_id)
#                     response_times.append(avg_time)
            
#             avg_campaign_response_time = sum(response_times) / len(response_times) if response_times else 0
            
#             campaign_analytics.append({
#                 "campaign_id": campaign_id,
#                 "campaign_title": campaign.get("title", "Unknown Campaign"),
#                 "total_applications": total_applications,
#                 "approved_applications": approved_applications,
#                 "completed_applications": completed_applications,
#                 "approval_rate": (approved_applications / total_applications * 100) if total_applications > 0 else 0,
#                 "completion_rate": (completed_applications / approved_applications * 100) if approved_applications > 0 else 0,
#                 "avg_response_time_hours": round(avg_campaign_response_time, 2),
#                 "total_budget": campaign.get("budget", 0),
#                 "status": campaign.get("status", "active")
#             })
        
#         return campaign_analytics
        
#     except Exception as e:
#         logger.error(f"Error getting brand campaign analytics: {str(e)}")
#         raise HTTPException(status_code=500, detail="Failed to get campaign analytics")

# # -------------------- UTILITY FUNCTIONS --------------------

# def calculate_response_rate(messages: List[dict], influencer_id: str) -> float:
#     """Calculate message response rate for influencer"""
#     if not messages:
#         return 0.0
    
#     messages_received = 0
#     messages_responded = 0
    
#     for i in range(1, len(messages)):
#         prev_msg = messages[i-1]
#         current_msg = messages[i]
        
#         if (prev_msg["receiver_id"] == influencer_id and 
#             current_msg["sender_id"] == influencer_id and
#             prev_msg["sender_id"] == current_msg["receiver_id"]):
#             messages_responded += 1
        
#         if current_msg["receiver_id"] == influencer_id:
#             messages_received += 1
    
#     return (messages_responded / messages_received * 100) if messages_received > 0 else 0

# def calculate_avg_response_time(messages: List[dict], influencer_id: str) -> float:
#     """Calculate average response time in hours"""
#     if not messages:
#         return 48.0  # Default value
    
#     response_times = []
    
#     for i in range(1, len(messages)):
#         prev_msg = messages[i-1]
#         current_msg = messages[i]
        
#         if (prev_msg["receiver_id"] == influencer_id and 
#             current_msg["sender_id"] == influencer_id and
#             prev_msg["sender_id"] == current_msg["receiver_id"]):
            
#             response_time = (current_msg["created_at"] - prev_msg["created_at"]).total_seconds() / 3600
#             response_times.append(response_time)
    
#     return sum(response_times) / len(response_times) if response_times else 48.0

# def calculate_media_quality_score(influencer_id: str, time_range: TimeRange) -> float:
#     """Calculate media submission quality score"""
#     # This is a simplified implementation
#     # In a real system, you might analyze actual media content or brand ratings
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         campaigns = list(campaigns_collection.find({
#             "applications.influencer_id": influencer_id,
#             "applications.media_submitted_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         total_submissions = 0
#         approved_submissions = 0
        
#         for campaign in campaigns:
#             for app in campaign.get("applications", []):
#                 if (app["influencer_id"] == influencer_id and 
#                     app.get("submitted_media") and 
#                     app.get("status") in ["media_submitted", "completed"]):
                    
#                     total_submissions += 1
#                     if app.get("status") == "completed":
#                         approved_submissions += 1
        
#         return (approved_submissions / total_submissions * 100) if total_submissions > 0 else 0
        
#     except Exception:
#         return 0.0

# def calculate_influencer_metrics(influencer_id: str, time_range: TimeRange) -> dict:
#     """Calculate comprehensive metrics for an influencer"""
#     try:
#         start_date, end_date = get_time_range_dates(time_range)
        
#         campaigns = list(campaigns_collection.find({
#             "applications.influencer_id": influencer_id,
#             "applications.applied_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         all_applications = []
#         for campaign in campaigns:
#             for app in campaign.get("applications", []):
#                 if app["influencer_id"] == influencer_id:
#                     all_applications.append(app)
        
#         total_applications = len(all_applications)
#         approved_applications = len([app for app in all_applications if app.get("status") == "approved"])
#         contracted_campaigns = len([app for app in all_applications if app.get("contract_signed")])
#         completed_campaigns = len([app for app in all_applications if app.get("status") == "completed"])
        
#         # Calculate earnings
#         earnings_data = list(earnings_collection.find({
#             "influencer_id": influencer_id,
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         total_earnings = sum(earn.get("amount", 0) for earn in earnings_data)
        
#         # Calculate rates
#         approval_rate = (approved_applications / total_applications * 100) if total_applications > 0 else 0
#         completion_rate = (completed_campaigns / contracted_campaigns * 100) if contracted_campaigns > 0 else 0
        
#         # Calculate response metrics
#         messages = list(messages_collection.find({
#             "$or": [
#                 {"sender_id": influencer_id},
#                 {"receiver_id": influencer_id}
#             ],
#             "created_at": {"$gte": start_date, "$lte": end_date}
#         }))
        
#         response_rate = calculate_response_rate(messages, influencer_id)
        
#         return {
#             "total_applications": total_applications,
#             "approved_applications": approved_applications,
#             "contracted_campaigns": contracted_campaigns,
#             "completed_campaigns": completed_campaigns,
#             "total_earnings": total_earnings,
#             "approval_rate": approval_rate,
#             "completion_rate": completion_rate,
#             "response_rate": response_rate
#         }
        
#     except Exception as e:
#         logger.error(f"Error calculating influencer metrics: {str(e)}")
#         return {}

# def calculate_tier(score: float, metric: MetricType) -> str:
#     """Calculate influencer tier based on score and metric"""
#     if metric == MetricType.EARNINGS:
#         if score >= 10000:
#             return "Elite"
#         elif score >= 5000:
#             return "Premium"
#         elif score >= 1000:
#             return "Professional"
#         else:
#             return "Rising"
#     else:  # For rate-based metrics
#         if score >= 90:
#             return "Elite"
#         elif score >= 75:
#             return "Premium"
#         elif score >= 60:
#             return "Professional"
#         else:
#             return "Rising"

# # -------------------- HEALTH CHECK --------------------

# @router.get("/health")
# async def analytics_health_check():
#     """Health check for analytics module"""
#     return {
#         "status": "healthy",
#         "module": "influencer-analytics",
#         "timestamp": datetime.utcnow().isoformat()
#     }





"""
Influencer Analytics Backend
Comprehensive analytics and reporting system for influencers
"""

"""
Influencer Analytics Backend - Fixed Version
Comprehensive analytics and reporting system for influencers
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Response
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional, Union, Literal
from datetime import datetime, timedelta, date
from enum import Enum
import logging
import json
import asyncio
import csv
import io
from decimal import Decimal
from bson import ObjectId, Decimal128
from bson.errors import InvalidId
import redis
import pandas as pd
from collections import defaultdict
from statistics import mean, median
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from io import BytesIO
import base64
from dataclasses import dataclass
from typing import TypedDict
import math

# Database imports
from database import (
    campaigns_collection, 
    users_collection, 
    earnings_collection,
    withdrawals_collection,
    payments_collection,
    likes_collection,
    bookmarks_collection,
    notifications_collection
)
from auth.utils import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/influencer/analytics", tags=["influencer-analytics"])

# -------------------- ENUMS & CONSTANTS --------------------
class TimeRange(str, Enum):
    TODAY = "today"
    YESTERDAY = "yesterday"
    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    LAST_90_DAYS = "last_90_days"
    THIS_MONTH = "this_month"
    LAST_MONTH = "last_month"
    THIS_QUARTER = "this_quarter"
    LAST_QUARTER = "last_quarter"
    THIS_YEAR = "this_year"
    LAST_YEAR = "last_year"
    ALL_TIME = "all_time"
    CUSTOM = "custom"

class ReportType(str, Enum):
    DASHBOARD = "dashboard"
    PERFORMANCE = "performance"
    EARNINGS = "earnings"
    APPLICATIONS = "applications"
    ENGAGEMENT = "engagement"
    MEDIA = "media"
    COMPREHENSIVE = "comprehensive"

class ExportFormat(str, Enum):
    JSON = "json"
    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"

class ChartType(str, Enum):
    BAR = "bar"
    LINE = "line"
    PIE = "pie"
    DONUT = "donut"
    AREA = "area"
    SCATTER = "scatter"
    HEATMAP = "heatmap"

class PerformanceTier(str, Enum):
    NOVICE = "novice"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    ELITE = "elite"

# Performance thresholds
PERFORMANCE_THRESHOLDS = {
    "novice": {"min": 0, "max": 30},
    "intermediate": {"min": 30, "max": 60},
    "advanced": {"min": 60, "max": 80},
    "expert": {"min": 80, "max": 95},
    "elite": {"min": 95, "max": 100}
}

# -------------------- CACHE MANAGER --------------------
class AnalyticsCacheManager:
    """Advanced cache manager with TTL and invalidation strategies"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        try:
            self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
            self.redis.ping()
            self.available = True
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.warning(f"Redis not available: {e}. Using in-memory cache.")
            self.redis = None
            self.available = False
            self.memory_cache = {}
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if self.available:
                value = await asyncio.to_thread(self.redis.get, key)
                return json.loads(value) if value else None
            else:
                return self.memory_cache.get(key)
        except Exception as e:
            logger.debug(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 300):
        """Set value in cache with TTL"""
        try:
            if self.available:
                await asyncio.to_thread(
                    self.redis.setex, 
                    key, 
                    ttl, 
                    json.dumps(value, default=str)
                )
            else:
                self.memory_cache[key] = value
        except Exception as e:
            logger.debug(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        """Delete key from cache"""
        try:
            if self.available:
                await asyncio.to_thread(self.redis.delete, key)
            elif key in self.memory_cache:
                del self.memory_cache[key]
        except Exception as e:
            logger.debug(f"Cache delete error: {e}")
    
    async def delete_pattern(self, pattern: str):
        """Delete keys matching pattern"""
        try:
            if self.available:
                keys = await asyncio.to_thread(self.redis.keys, pattern)
                if keys:
                    await asyncio.to_thread(self.redis.delete, *keys)
            else:
                # Simple pattern matching for memory cache
                keys_to_delete = [k for k in self.memory_cache.keys() if pattern.replace('*', '') in k]
                for key in keys_to_delete:
                    del self.memory_cache[key]
        except Exception as e:
            logger.debug(f"Cache delete pattern error: {e}")
    
    async def clear_user_cache(self, user_id: str):
        """Clear all cache for a specific user"""
        await self.delete_pattern(f"analytics:{user_id}:*")
    
    def generate_key(self, user_id: str, endpoint: str, **kwargs) -> str:
        """Generate consistent cache key"""
        params = "_".join([f"{k}={v}" for k, v in sorted(kwargs.items())])
        return f"analytics:{user_id}:{endpoint}:{params}"

# Initialize cache manager
cache_manager = AnalyticsCacheManager()

# -------------------- DATA MODELS --------------------
class DateRange(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        if v and values.get('start_date') and v < values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class TimeRangeFilter(BaseModel):
    time_range: TimeRange = TimeRange.LAST_30_DAYS
    custom_range: Optional[DateRange] = None

class Metric(BaseModel):
    name: str
    value: Union[float, int, str]
    unit: str = ""
    change_percentage: Optional[float] = None
    trend: Optional[Literal["up", "down", "stable"]] = None
    target: Optional[Union[float, int]] = None
    is_positive: Optional[bool] = None

class PerformanceScore(BaseModel):
    overall: float = Field(..., ge=0, le=100)
    application_quality: float = Field(..., ge=0, le=100)
    engagement: float = Field(..., ge=0, le=100)
    consistency: float = Field(..., ge=0, le=100)
    earnings_efficiency: float = Field(..., ge=0, le=100)
    tier: PerformanceTier
    percentile: float = Field(..., ge=0, le=100)

class EarningsSummary(BaseModel):
    total: float = Field(..., ge=0)
    available: float = Field(..., ge=0)
    pending: float = Field(..., ge=0)
    withdrawn: float = Field(..., ge=0)
    projected_monthly: float = Field(..., ge=0)
    currency: str = "USD"

class ApplicationStats(BaseModel):
    total: int = Field(..., ge=0)
    pending: int = Field(..., ge=0)
    approved: int = Field(..., ge=0)
    rejected: int = Field(..., ge=0)
    contracted: int = Field(..., ge=0)
    media_submitted: int = Field(..., ge=0)
    completed: int = Field(..., ge=0)
    success_rate: float = Field(..., ge=0, le=100)
    approval_rate: float = Field(..., ge=0, le=100)

class CampaignPerformance(BaseModel):
    campaign_id: str
    title: str
    brand_name: str
    status: str
    budget: float
    earnings: float
    roi: float
    duration_days: Optional[int]
    satisfaction_score: Optional[float]
    next_action: Optional[str]
    timeline: List[Dict[str, Any]]

class TrendDataPoint(BaseModel):
    date: date
    value: float
    label: str

class TrendAnalysis(BaseModel):
    metric: str
    data_points: List[TrendDataPoint]
    trend: Literal["increasing", "decreasing", "stable"]
    slope: float
    confidence: float
    forecast_next: Optional[float]

class Insight(BaseModel):
    id: str
    title: str
    description: str
    type: Literal["positive", "warning", "opportunity", "suggestion"]
    priority: Literal["low", "medium", "high", "critical"]
    action_items: List[str]
    impact_score: float = Field(..., ge=0, le=10)

class DashboardSummary(BaseModel):
    influencer_id: str
    influencer_name: str
    period: str
    generated_at: datetime
    performance_score: PerformanceScore
    earnings_summary: EarningsSummary
    application_stats: ApplicationStats
    key_metrics: List[Metric]
    top_campaigns: List[CampaignPerformance]
    insights: List[Insight]
    trends: List[TrendAnalysis]
    quick_stats: Dict[str, Any]

class MediaAnalytics(BaseModel):
    total_submissions: int
    total_files: int
    avg_files_per_submission: float
    avg_file_size_mb: float
    media_types_distribution: Dict[str, float]
    media_by_status: Dict[str, int]
    submission_frequency: Dict[str, float]
    top_performing_media: List[Dict[str, Any]]

class EngagementMetrics(BaseModel):
    likes_received: int
    comments_received: int
    shares_received: int
    engagement_rate: float
    audience_growth: float
    content_reach: int
    top_engaging_content: List[Dict[str, Any]]

class ComprehensiveReport(BaseModel):
    executive_summary: str
    dashboard: DashboardSummary
    performance_breakdown: Dict[str, Any]
    earnings_analysis: Dict[str, Any]
    application_analysis: Dict[str, Any]
    media_analysis: MediaAnalytics
    engagement_analysis: EngagementMetrics
    competitive_analysis: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    raw_data_summary: Dict[str, Any]

# -------------------- UTILITY FUNCTIONS --------------------
def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

def decimal_to_float(value) -> float:
    """Convert Decimal128 or Decimal to float"""
    if isinstance(value, Decimal128):
        return float(str(value))
    elif isinstance(value, Decimal):
        return float(value)
    return value

def calculate_percentage_change(current: float, previous: float) -> Optional[float]:
    """Calculate percentage change"""
    if previous == 0:
        return None
    return ((current - previous) / previous) * 100

def determine_trend(change: Optional[float]) -> Optional[Literal["up", "down", "stable"]]:
    """Determine trend based on percentage change"""
    if change is None:
        return None
    if change > 5:
        return "up"
    elif change < -5:
        return "down"
    return "stable"

def get_date_range(time_range: TimeRange, custom_range: Optional[DateRange] = None) -> tuple[datetime, datetime]:
    """Get date range based on time range enum"""
    now = datetime.utcnow()
    
    if time_range == TimeRange.TODAY:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif time_range == TimeRange.YESTERDAY:
        start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1) - timedelta(microseconds=1)
    elif time_range == TimeRange.LAST_7_DAYS:
        start = now - timedelta(days=7)
        end = now
    elif time_range == TimeRange.LAST_30_DAYS:
        start = now - timedelta(days=30)
        end = now
    elif time_range == TimeRange.LAST_90_DAYS:
        start = now - timedelta(days=90)
        end = now
    elif time_range == TimeRange.THIS_MONTH:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif time_range == TimeRange.LAST_MONTH:
        first_day_this_month = now.replace(day=1)
        start = (first_day_this_month - timedelta(days=1)).replace(day=1)
        end = first_day_this_month - timedelta(microseconds=1)
    elif time_range == TimeRange.THIS_QUARTER:
        quarter_month = ((now.month - 1) // 3) * 3 + 1
        start = now.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif time_range == TimeRange.LAST_QUARTER:
        quarter_month = ((now.month - 1) // 3) * 3 + 1
        start = (now.replace(month=quarter_month, day=1) - timedelta(days=1)).replace(day=1)
        start = start - timedelta(days=90)
        end = now.replace(month=quarter_month, day=1) - timedelta(microseconds=1)
    elif time_range == TimeRange.THIS_YEAR:
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif time_range == TimeRange.LAST_YEAR:
        start = now.replace(year=now.year-1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(year=now.year-1, month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    elif time_range == TimeRange.ALL_TIME:
        start = datetime.min
        end = now
    elif time_range == TimeRange.CUSTOM and custom_range:
        start = datetime.combine(custom_range.start_date, datetime.min.time())
        end = datetime.combine(custom_range.end_date, datetime.max.time())
    else:
        # Default to last 30 days
        start = now - timedelta(days=30)
        end = now
    
    return start, end

def calculate_performance_tier(score: float) -> PerformanceTier:
    """Calculate performance tier based on score"""
    for tier, thresholds in PERFORMANCE_THRESHOLDS.items():
        if thresholds["min"] <= score < thresholds["max"]:
            return PerformanceTier(tier)
    return PerformanceTier.NOVICE

def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency amount"""
    if currency == "USD":
        return f"${amount:,.2f}"
    elif currency == "EUR":
        return f"€{amount:,.2f}"
    elif currency == "GBP":
        return f"£{amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"

def generate_chart_base64(data: Dict[str, Any], chart_type: ChartType = ChartType.BAR) -> str:
    """Generate base64 encoded chart image"""
    plt.figure(figsize=(10, 6))
    
    if chart_type == ChartType.BAR:
        labels = list(data.keys())
        values = list(data.values())
        
        plt.bar(labels, values)
        plt.xticks(rotation=45)
        plt.tight_layout()
    
    elif chart_type == ChartType.LINE:
        dates = sorted(data.keys())
        values = [data[d] for d in dates]
        
        plt.plot(dates, values, marker='o')
        plt.xticks(rotation=45)
        plt.tight_layout()
    
    elif chart_type == ChartType.PIE:
        labels = list(data.keys())
        values = list(data.values())
        
        plt.pie(values, labels=labels, autopct='%1.1f%%')
    
    # Save to buffer
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
    plt.close()
    
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')

# -------------------- DATA SERVICE LAYER --------------------
class InfluencerDataService:
    """Service layer for influencer data operations"""
    
    def __init__(self, influencer_id: str):
        self.influencer_id = influencer_id
    
    async def get_applications(self, filters: Optional[Dict] = None) -> List[Dict]:
        """Get applications with caching - FIXED to include brand info"""
        cache_key = cache_manager.generate_key(
            self.influencer_id, 
            "applications", 
            filters=str(filters) if filters else "all"
        )
        
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached
        
        # Build query
        query = {"applications.influencer_id": self.influencer_id}
        if filters and "date_range" in filters:
            start_date, end_date = filters["date_range"]
            query["applications.applied_at"] = {
                "$gte": start_date,
                "$lte": end_date
            }
        
        # Execute optimized query
        pipeline = [
            {"$match": query},
            {"$unwind": "$applications"},
            {"$match": {"applications.influencer_id": self.influencer_id}},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "campaign_title": 1,
                "budget": 1,
                "status": 1,
                "deadline": 1,
                "category": 1,
                "created_at": 1,
                "brand_id": 1,
                "brand_name": 1,  # Include if exists
                "application": "$applications"
            }}
        ]
        
        cursor = campaigns_collection.aggregate(pipeline)
        results = list(cursor)
        
        # Enrich with brand info
        applications = []
        for result in results:
            app_data = result["application"].copy()
            
            # FIXED: Properly get brand name from various sources
            brand_name = "Unknown Brand"
            brand_info = {}
            
            try:
                if result.get("brand_id"):
                    brand = users_collection.find_one({"_id": ObjectId(result["brand_id"])})
                    if brand:
                        brand_profile = brand.get("brand_profile", {})
                        brand_name = (
                            brand_profile.get("company_name") or
                            result.get("brand_name") or
                            brand.get("username") or
                            "Unknown Brand"
                        )
                        
                        brand_info = {
                            "id": str(brand["_id"]),
                            "company_name": brand_profile.get("company_name"),
                            "logo": brand_profile.get("logo"),
                            "email": brand.get("email"),
                            "website": brand_profile.get("website"),
                            "location": brand_profile.get("location")
                        }
                else:
                    # Try to get brand_name from result
                    brand_name = result.get("brand_name", "Unknown Brand")
                    
            except Exception as e:
                logger.warning(f"Error fetching brand info: {str(e)}")
                brand_name = result.get("brand_name", "Unknown Brand")
            
            app_data.update({
                "campaign_id": result["_id"],
                "campaign_title": result.get("campaign_title", "Unknown"),
                "campaign_budget": decimal_to_float(result.get("budget", 0)),
                "campaign_status": result.get("status", "active"),
                "campaign_deadline": result.get("deadline"),
                "campaign_category": result.get("category", "Uncategorized"),
                "campaign_created_at": result.get("created_at"),
                "brand_id": result.get("brand_id"),
                "brand_name": brand_name,  # FIXED: Now properly populated
                "brand": brand_info,  # ADDED: Full brand object
                "brand_profile": brand_info  # ADDED: For backward compatibility
            })
            
            applications.append(app_data)
        
        # Cache results
        await cache_manager.set(cache_key, applications, ttl=300)
        return applications
    
    async def get_earnings(self, filters: Optional[Dict] = None) -> List[Dict]:
        """Get earnings with caching"""
        cache_key = cache_manager.generate_key(
            self.influencer_id, 
            "earnings", 
            filters=str(filters) if filters else "all"
        )
        
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached
        
        query = {"influencer_id": self.influencer_id}
        if filters:
            query.update(filters)
        
        # Fix: Remove await from find() as it's synchronous
        cursor = earnings_collection.find(query).sort("earned_at", -1)
        earnings = list(cursor)
        
        for earning in earnings:
            earning["_id"] = str(earning["_id"])
            earning["amount"] = decimal_to_float(earning.get("amount", 0))
        
        await cache_manager.set(cache_key, earnings, ttl=300)
        return earnings
    
    async def get_withdrawals(self, filters: Optional[Dict] = None) -> List[Dict]:
        """Get withdrawals"""
        query = {"influencer_id": self.influencer_id}
        if filters:
            query.update(filters)
        
        # Fix: Remove await from find() as it's synchronous
        cursor = withdrawals_collection.find(query).sort("requested_at", -1)
        withdrawals = list(cursor)
        
        for withdrawal in withdrawals:
            withdrawal["_id"] = str(withdrawal["_id"])
            withdrawal["amount"] = decimal_to_float(withdrawal.get("amount", 0))
        
        return withdrawals
    
    async def get_campaigns(self, status: Optional[str] = None, limit: int = 10) -> List[Dict]:
        """Get campaigns applied by influencer"""
        cache_key = cache_manager.generate_key(
            self.influencer_id, 
            "campaigns", 
            status=status if status else "all"
        )
        
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached
        
        pipeline = [
            {"$match": {"applications.influencer_id": self.influencer_id}},
            {"$unwind": "$applications"},
            {"$match": {"applications.influencer_id": self.influencer_id}},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "title": 1,
                "description": 1,
                "budget": 1,
                "status": 1,
                "category": 1,
                "created_at": 1,
                "deadline": 1,
                "brand_id": 1,
                "application_status": "$applications.status",
                "application_date": "$applications.applied_at",
                "application_id": "$applications._id",
                "campaign_earnings": "$applications.earnings"
            }},
            {"$limit": limit}
        ]
        
        if status:
            pipeline.insert(2, {"$match": {"applications.status": status}})
        
        cursor = campaigns_collection.aggregate(pipeline)
        campaigns = list(cursor)
        
        # Add brand info
        for campaign in campaigns:
            try:
                brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
                if brand:
                    campaign["brand_name"] = brand.get("username", "Unknown")
                else:
                    campaign["brand_name"] = "Unknown"
            except:
                campaign["brand_name"] = "Unknown"
            
            campaign["budget"] = decimal_to_float(campaign.get("budget", 0))
            campaign["campaign_earnings"] = decimal_to_float(campaign.get("campaign_earnings", 0))
        
        await cache_manager.set(cache_key, campaigns, ttl=300)
        return campaigns
    
    async def get_media_submissions(self) -> List[Dict]:
        """Get media submissions by influencer"""
        cache_key = cache_manager.generate_key(self.influencer_id, "media_submissions")
        
        cached = await cache_manager.get(cache_key)
        if cached:
            return cached
        
        # Query for campaigns where influencer has submitted media
        pipeline = [
            {"$match": {"applications.influencer_id": self.influencer_id}},
            {"$unwind": "$applications"},
            {"$match": {
                "applications.influencer_id": self.influencer_id,
                "applications.submitted_media": {"$exists": True, "$ne": []}
            }},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "title": 1,
                "campaign_title": 1,
                "application_id": "$applications._id",
                "submitted_media": "$applications.submitted_media",
                "submission_date": "$applications.submitted_at",
                "status": "$applications.status",
                "media_approval_status": "$applications.media_approval_status"
            }}
        ]
        
        cursor = campaigns_collection.aggregate(pipeline)
        submissions = list(cursor)
        
        await cache_manager.set(cache_key, submissions, ttl=300)
        return submissions
    
    async def get_campaign_views(self, campaign_ids: List[str]) -> Dict[str, int]:
        """Get view counts for campaigns"""
        campaigns = campaigns_collection.find(
            {"_id": {"$in": [ObjectId(cid) for cid in campaign_ids]}},
            {"_id": 1, "total_views": 1}
        )
        
        return {str(c["_id"]): c.get("total_views", 0) for c in campaigns}
    
    async def get_engagement_data(self, campaign_ids: List[str]) -> Dict[str, Any]:
        """Get engagement data (likes, bookmarks) for campaigns"""
        # Get likes
        likes = likes_collection.count_documents({
            "campaign_id": {"$in": campaign_ids}
        })
        
        # Get bookmarks
        bookmarks = bookmarks_collection.count_documents({
            "campaign_id": {"$in": campaign_ids},
            "user_id": self.influencer_id
        })
        
        return {
            "total_likes": likes,
            "total_bookmarks": bookmarks
        }

# -------------------- ANALYTICS ENGINE --------------------
class AnalyticsEngine:
    """Core analytics engine for calculating metrics and insights"""
    
    @staticmethod
    async def calculate_performance_score(
        data_service: InfluencerDataService,
        time_range: TimeRangeFilter
    ) -> PerformanceScore:
        """Calculate comprehensive performance score"""
        start_date, end_date = get_date_range(time_range.time_range, time_range.custom_range)
        
        # Get data
        applications = await data_service.get_applications({
            "date_range": (start_date, end_date)
        })
        
        earnings = await data_service.get_earnings({
            "earned_at": {"$gte": start_date, "$lte": end_date}
        })
        
        # Calculate sub-scores
        app_quality_score = await AnalyticsEngine._calculate_application_quality_score(applications)
        engagement_score = await AnalyticsEngine._calculate_engagement_score(applications, earnings)
        consistency_score = await AnalyticsEngine._calculate_consistency_score(applications)
        earnings_efficiency = await AnalyticsEngine._calculate_earnings_efficiency_score(earnings, applications)
        
        # Calculate overall score (weighted average)
        overall_score = (
            app_quality_score * 0.3 +
            engagement_score * 0.25 +
            consistency_score * 0.2 +
            earnings_efficiency * 0.25
        )
        
        # Ensure score is within 0-100 range
        overall_score = max(0, min(100, overall_score))
        
        # Determine tier
        tier = calculate_performance_tier(overall_score)
        
        # Calculate percentile (placeholder - would need benchmark data)
        percentile = min(overall_score + 10, 100)  # Simplified
        
        return PerformanceScore(
            overall=round(overall_score, 1),
            application_quality=round(app_quality_score, 1),
            engagement=round(engagement_score, 1),
            consistency=round(consistency_score, 1),
            earnings_efficiency=round(earnings_efficiency, 1),
            tier=tier,
            percentile=round(percentile, 1)
        )
    
    @staticmethod
    async def _calculate_application_quality_score(applications: List[Dict]) -> float:
        """Calculate application quality score (0-100)"""
        if not applications:
            return 50  # Default score for no applications
        
        total_apps = len(applications)
        approved_apps = len([a for a in applications if a.get("status") in ["approved", "contracted", "completed"]])
        completed_apps = len([a for a in applications if a.get("status") == "completed"])
        
        # Calculate approval rate score (max 40 points)
        approval_rate = (approved_apps / total_apps) * 100 if total_apps > 0 else 0
        approval_score = min(approval_rate * 0.4, 40)
        
        # Calculate completion rate score (max 30 points)
        completion_rate = (completed_apps / total_apps) * 100 if total_apps > 0 else 0
        completion_score = min(completion_rate * 0.3, 30)
        
        # Calculate response time score (max 30 points)
        response_times = []
        for app in applications:
            applied_at = app.get("applied_at")
            if isinstance(applied_at, str):
                try:
                    applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                except:
                    continue
            
            responded_at = app.get("approved_at") or app.get("rejected_at")
            if isinstance(responded_at, str):
                try:
                    responded_at = datetime.fromisoformat(responded_at.replace('Z', '+00:00'))
                except:
                    responded_at = None
            
            if applied_at and responded_at:
                try:
                    response_hours = (responded_at - applied_at).total_seconds() / 3600
                    response_times.append(response_hours)
                except:
                    continue
        
        if response_times:
            avg_response_time = mean(response_times)
            response_score = max(0, 30 - (avg_response_time / 24))  # Faster = better
        else:
            response_score = 15  # Default if no responses
        
        total_score = approval_score + completion_score + response_score
        return min(total_score, 100)
    
    @staticmethod
    async def _calculate_engagement_score(applications: List[Dict], earnings: List[Dict]) -> float:
        """Calculate engagement score (0-100)"""
        if not applications:
            return 50  # Default score
        
        # Activity frequency (max 40 points)
        app_dates = []
        for a in applications:
            applied_at = a.get("applied_at")
            if isinstance(applied_at, str):
                try:
                    applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    app_dates.append(applied_at.date())
                except:
                    continue
            elif isinstance(applied_at, datetime):
                app_dates.append(applied_at.date())
        
        if not app_dates:
            return 50
        
        unique_days = len(set(app_dates))
        total_days = (max(app_dates) - min(app_dates)).days + 1 if len(app_dates) > 1 else 1
        activity_score = min((unique_days / total_days) * 40, 40) if total_days > 0 else 0
        
        # Campaign diversity (max 30 points)
        categories = set([a.get("campaign_category", "Unknown") for a in applications])
        diversity_score = min(len(categories) * 5, 30)
        
        # Earnings growth (max 30 points)
        if len(earnings) >= 2:
            earnings_by_month = defaultdict(float)
            for earning in earnings:
                earned_at = earning.get("earned_at")
                if isinstance(earned_at, str):
                    try:
                        earned_at = datetime.fromisoformat(earned_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                month_key = earned_at.strftime("%Y-%m")
                earnings_by_month[month_key] += earning.get("amount", 0)
            
            monthly_values = list(earnings_by_month.values())
            if len(monthly_values) >= 2:
                growth_rate = ((monthly_values[-1] - monthly_values[0]) / monthly_values[0]) * 100 if monthly_values[0] > 0 else 0
                growth_score = min(max(growth_rate, 0), 30)
            else:
                growth_score = 15
        else:
            growth_score = 15
        
        total_score = activity_score + diversity_score + growth_score
        return min(total_score, 100)
    
    @staticmethod
    async def _calculate_consistency_score(applications: List[Dict]) -> float:
        """Calculate consistency score (0-100)"""
        if not applications:
            return 50
        
        # Weekly consistency
        app_dates = []
        for a in applications:
            applied_at = a.get("applied_at")
            if isinstance(applied_at, str):
                try:
                    applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    app_dates.append(applied_at)
                except:
                    continue
            elif isinstance(applied_at, datetime):
                app_dates.append(applied_at)
        
        if len(app_dates) < 2:
            return 50
        
        app_dates.sort()
        
        # Calculate intervals between applications
        intervals = []
        for i in range(1, len(app_dates)):
            interval = (app_dates[i] - app_dates[i-1]).days
            intervals.append(interval)
        
        if intervals:
            # Lower standard deviation = more consistent
            avg_interval = mean(intervals)
            if avg_interval > 0:
                try:
                    std_dev = math.sqrt(sum((i - avg_interval) ** 2 for i in intervals) / len(intervals))
                    consistency = max(0, 100 - (std_dev * 10))  # Penalize high variance
                    return min(consistency, 100)
                except:
                    return 50
        
        return 50
    
    @staticmethod
    async def _calculate_earnings_efficiency_score(earnings: List[Dict], applications: List[Dict]) -> float:
        """Calculate earnings efficiency score (0-100)"""
        if not earnings or not applications:
            return 50
        
        total_earnings = sum(e.get("amount", 0) for e in earnings)
        completed_apps = len([a for a in applications if a.get("status") == "completed"])
        
        if completed_apps == 0:
            return 50
        
        # Average earnings per completed campaign (max 50 points)
        avg_earnings = total_earnings / completed_apps
        avg_earnings_score = min(avg_earnings / 100 * 50, 50)  # $100 per campaign = 50 points
        
        # ROI score (max 30 points)
        total_budget = sum(a.get("campaign_budget", 0) for a in applications if a.get("status") == "completed")
        if total_budget > 0:
            roi = (total_earnings / total_budget) * 100
            roi_score = min(roi * 0.3, 30)
        else:
            roi_score = 15
        
        # Payment timeliness (max 20 points)
        payment_delays = []
        for earning in earnings:
            completed_at = None
            for a in applications:
                if a.get("campaign_id") == earning.get("campaign_id") and a.get("status") == "completed":
                    completed_at = a.get("completed_at")
                    break
            
            if completed_at and earning.get("earned_at"):
                if isinstance(completed_at, str):
                    try:
                        completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                if isinstance(earning.get("earned_at"), str):
                    try:
                        earned_at = datetime.fromisoformat(earning["earned_at"].replace('Z', '+00:00'))
                    except:
                        continue
                else:
                    earned_at = earning.get("earned_at")
                
                if completed_at and earned_at:
                    try:
                        delay = (earned_at - completed_at).days
                        payment_delays.append(delay)
                    except:
                        continue
        
        if payment_delays:
            avg_delay = mean(payment_delays)
            timeliness_score = max(0, 20 - (avg_delay * 2))
        else:
            timeliness_score = 10
        
        total_score = avg_earnings_score + roi_score + timeliness_score
        return min(total_score, 100)
    
    @staticmethod
    async def generate_insights(
        data_service: InfluencerDataService,
        performance_score: PerformanceScore,
        time_range: TimeRangeFilter
    ) -> List[Insight]:
        """Generate actionable insights"""
        insights = []
        
        # Insight 1: Performance tier
        if performance_score.tier == PerformanceTier.NOVICE:
            insights.append(Insight(
                id="insight_001",
                title="Getting Started",
                description="You're just beginning your influencer journey. Focus on building a strong portfolio.",
                type="suggestion",
                priority="medium",
                action_items=["Apply to 5 more campaigns", "Complete your profile", "Add portfolio samples"],
                impact_score=8.0
            ))
        elif performance_score.tier == PerformanceTier.EXPERT:
            insights.append(Insight(
                id="insight_002",
                title="Expert Level Achieved",
                description="You're performing at an expert level! Consider mentoring others or increasing your rates.",
                type="positive",
                priority="low",
                action_items=["Increase campaign rates by 20%", "Create case studies", "Offer coaching"],
                impact_score=6.0
            ))
        
        # Insight 2: Application quality
        if performance_score.application_quality < 50:
            insights.append(Insight(
                id="insight_003",
                title="Improve Application Quality",
                description="Your application approval rate could be higher. Consider improving your proposals.",
                type="warning",
                priority="high",
                action_items=[
                    "Review successful applications",
                    "Personalize each application",
                    "Highlight relevant experience"
                ],
                impact_score=9.0
            ))
        
        # Insight 3: Earnings efficiency
        if performance_score.earnings_efficiency < 60:
            insights.append(Insight(
                id="insight_004",
                title="Increase Average Earnings",
                description="Your average earnings per campaign could be higher. Focus on higher-value campaigns.",
                type="opportunity",
                priority="medium",
                action_items=[
                    "Apply to higher-budget campaigns",
                    "Negotiate better rates",
                    "Offer premium packages"
                ],
                impact_score=7.5
            ))
        
        # Insight 4: Consistency
        if performance_score.consistency < 40:
            insights.append(Insight(
                id="insight_005",
                title="Improve Consistency",
                description="Your application frequency varies significantly. Consistent activity improves visibility.",
                type="warning",
                priority="medium",
                action_items=[
                    "Set daily application goals",
                    "Schedule dedicated work time",
                    "Use calendar reminders"
                ],
                impact_score=6.5
            ))
        
        # Limit to 5 insights
        return insights[:5]
    
    @staticmethod
    async def analyze_trends(
        data_service: InfluencerDataService,
        metric: str,
        time_range: TimeRangeFilter
    ) -> TrendAnalysis:
        """Analyze trends for a specific metric"""
        start_date, end_date = get_date_range(time_range.time_range, time_range.custom_range)
        
        # Get data points
        if metric == "earnings":
            earnings = await data_service.get_earnings({
                "earned_at": {"$gte": start_date, "$lte": end_date}
            })
            
            # Group by week
            weekly_data = defaultdict(float)
            for earning in earnings:
                earned_at = earning.get("earned_at")
                if isinstance(earned_at, str):
                    try:
                        earned_at = datetime.fromisoformat(earned_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                week_key = earned_at.strftime("%Y-%U")
                weekly_data[week_key] += earning.get("amount", 0)
            
            data_points = [
                TrendDataPoint(
                    date=datetime.strptime(f"{week}-1", "%Y-%U-%w").date(),
                    value=amount,
                    label=f"Week {week.split('-')[1]}"
                )
                for week, amount in sorted(weekly_data.items())
            ]
        
        elif metric == "applications":
            applications = await data_service.get_applications({
                "date_range": (start_date, end_date)
            })
            
            # Group by day
            daily_data = defaultdict(int)
            for app in applications:
                applied_at = app.get("applied_at")
                if isinstance(applied_at, str):
                    try:
                        applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                        day_key = applied_at.date().isoformat()
                        daily_data[day_key] += 1
                    except:
                        continue
                elif isinstance(applied_at, datetime):
                    day_key = applied_at.date().isoformat()
                    daily_data[day_key] += 1
            
            data_points = [
                TrendDataPoint(
                    date=datetime.strptime(day, "%Y-%m-%d").date(),
                    value=count,
                    label=day
                )
                for day, count in sorted(daily_data.items())
            ]
        
        else:
            data_points = []
        
        # Calculate trend
        if len(data_points) >= 2:
            values = [dp.value for dp in data_points]
            
            # Linear regression for slope
            x = np.arange(len(values))
            slope, intercept = np.polyfit(x, values, 1)
            
            # Determine trend direction
            if slope > 0.1:
                trend = "increasing"
            elif slope < -0.1:
                trend = "decreasing"
            else:
                trend = "stable"
            
            # Calculate confidence (R-squared)
            y_pred = slope * x + intercept
            ss_res = np.sum((values - y_pred) ** 2)
            ss_tot = np.sum((values - np.mean(values)) ** 2)
            confidence = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
            
            # Forecast next value
            forecast_next = slope * len(values) + intercept if len(values) > 0 else None
            
        else:
            slope = 0
            trend = "stable"
            confidence = 0
            forecast_next = None
        
        return TrendAnalysis(
            metric=metric,
            data_points=data_points,
            trend=trend,
            slope=float(slope),
            confidence=float(confidence),
            forecast_next=float(forecast_next) if forecast_next else None
        )

# -------------------- REPORT GENERATOR --------------------
class ReportGenerator:
    """Generate various types of reports"""
    
    @staticmethod
    async def generate_dashboard_report(
        data_service: InfluencerDataService,
        time_range: TimeRangeFilter,
        influencer_info: Dict
    ) -> DashboardSummary:
        """Generate comprehensive dashboard report"""
        # Calculate performance score
        performance_score = await AnalyticsEngine.calculate_performance_score(data_service, time_range)
        
        # Get applications and earnings
        applications = await data_service.get_applications()
        earnings = await data_service.get_earnings()
        withdrawals = await data_service.get_withdrawals()
        
        # Calculate earnings summary
        total_earnings = sum(e.get("amount", 0) for e in earnings if e.get("status") in ["completed", "approved"])
        pending_earnings = sum(e.get("amount", 0) for e in earnings if e.get("status") == "pending")
        total_withdrawn = sum(w.get("amount", 0) for w in withdrawals if w.get("status") == "completed")
        available_balance = total_earnings - total_withdrawn
        
        # Calculate application stats
        total_apps = len(applications)
        pending_apps = len([a for a in applications if a.get("status") == "pending"])
        approved_apps = len([a for a in applications if a.get("status") in ["approved", "contracted", "completed"]])
        completed_apps = len([a for a in applications if a.get("status") == "completed"])
        
        success_rate = (completed_apps / total_apps * 100) if total_apps > 0 else 0
        approval_rate = (approved_apps / total_apps * 100) if total_apps > 0 else 0
        
        # Calculate key metrics
        key_metrics = [
            Metric(
                name="Daily Applications",
                value=len([a for a in applications 
                          if isinstance(a.get("applied_at"), datetime) and 
                          a.get("applied_at").date() == datetime.utcnow().date()]),
                unit="apps",
                change_percentage=10.5,
                trend="up",
                is_positive=True
            ),
            Metric(
                name="Approval Rate",
                value=round(approval_rate, 1),
                unit="%",
                change_percentage=2.3,
                trend="up",
                is_positive=True
            ),
            Metric(
                name="Avg. Earnings/Campaign",
                value=round(total_earnings / completed_apps, 2) if completed_apps > 0 else 0,
                unit="USD",
                change_percentage=5.7,
                trend="up",
                is_positive=True
            ),
            Metric(
                name="Active Campaigns",
                value=len([a for a in applications if a.get("status") in ["approved", "contracted"]]),
                unit="campaigns",
                change_percentage=-1.2,
                trend="down",
                is_positive=False
            )
        ]
        
        # Get top campaigns
        completed_campaigns = [a for a in applications if a.get("status") == "completed"]
        top_campaigns = []
        
        for app in completed_campaigns[:5]:  # Top 5
            campaign_earnings = sum(
                e.get("amount", 0) for e in earnings 
                if e.get("campaign_id") == app.get("campaign_id") and e.get("status") in ["completed", "approved"]
            )
            
            budget = app.get("campaign_budget", 0)
            roi = ((campaign_earnings - budget) / budget * 100) if budget > 0 else 0
            
            # Calculate duration
            duration = None
            applied_at = app.get("applied_at")
            completed_at = app.get("completed_at")
            
            if applied_at and completed_at:
                if isinstance(applied_at, str):
                    try:
                        applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    except:
                        applied_at = None
                
                if isinstance(completed_at, str):
                    try:
                        completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
                    except:
                        completed_at = None
                
                if applied_at and completed_at:
                    duration = (completed_at - applied_at).days
            
            top_campaigns.append(CampaignPerformance(
                campaign_id=app.get("campaign_id", ""),
                title=app.get("campaign_title", "Unknown"),
                brand_name=app.get("brand_name", "Unknown"),
                status=app.get("status", "completed"),
                budget=budget,
                earnings=campaign_earnings,
                roi=round(roi, 1),
                duration_days=duration,
                satisfaction_score=None,
                next_action=None,
                timeline=[]
            ))
        
        # Generate insights
        insights = await AnalyticsEngine.generate_insights(data_service, performance_score, time_range)
        
        # Analyze trends
        earnings_trend = await AnalyticsEngine.analyze_trends(data_service, "earnings", time_range)
        applications_trend = await AnalyticsEngine.analyze_trends(data_service, "applications", time_range)
        
        # Quick stats
        today = datetime.utcnow().date()
        week_ago = datetime.utcnow() - timedelta(days=7)
        month_ago = datetime.utcnow() - timedelta(days=30)
        
        today_apps = [a for a in applications 
                     if isinstance(a.get("applied_at"), datetime) and 
                     a.get("applied_at").date() == today]
        
        today_earnings = [e for e in earnings 
                         if isinstance(e.get("earned_at"), datetime) and 
                         e.get("earned_at").date() == today and 
                         e.get("status") in ["completed", "approved"]]
        
        week_apps = [a for a in applications 
                    if isinstance(a.get("applied_at"), datetime) and 
                    a.get("applied_at") >= week_ago]
        
        week_earnings = [e for e in earnings 
                        if isinstance(e.get("earned_at"), datetime) and 
                        e.get("earned_at") >= week_ago and 
                        e.get("status") in ["completed", "approved"]]
        
        month_apps = [a for a in applications 
                     if isinstance(a.get("applied_at"), datetime) and 
                     a.get("applied_at") >= month_ago]
        
        month_earnings = [e for e in earnings 
                         if isinstance(e.get("earned_at"), datetime) and 
                         e.get("earned_at") >= month_ago and 
                         e.get("status") in ["completed", "approved"]]
        
        quick_stats = {
            "today_applications": len(today_apps),
            "today_earnings": round(sum(e.get("amount", 0) for e in today_earnings), 2),
            "week_applications": len(week_apps),
            "week_earnings": round(sum(e.get("amount", 0) for e in week_earnings), 2),
            "month_applications": len(month_apps),
            "month_earnings": round(sum(e.get("amount", 0) for e in month_earnings), 2)
        }
        
        return DashboardSummary(
            influencer_id=data_service.influencer_id,
            influencer_name=influencer_info.get("username", "Unknown"),
            period=time_range.time_range.value,
            generated_at=datetime.utcnow(),
            performance_score=performance_score,
            earnings_summary=EarningsSummary(
                total=round(total_earnings, 2),
                available=round(available_balance, 2),
                pending=round(pending_earnings, 2),
                withdrawn=round(total_withdrawn, 2),
                projected_monthly=round(total_earnings / 12, 2) if total_earnings > 0 else 0
            ),
            application_stats=ApplicationStats(
                total=total_apps,
                pending=pending_apps,
                approved=approved_apps,
                rejected=len([a for a in applications if a.get("status") == "rejected"]),
                contracted=len([a for a in applications if a.get("status") == "contracted"]),
                media_submitted=len([a for a in applications if a.get("submitted_media")]),
                completed=completed_apps,
                success_rate=round(success_rate, 1),
                approval_rate=round(approval_rate, 1)
            ),
            key_metrics=key_metrics,
            top_campaigns=top_campaigns,
            insights=insights,
            trends=[earnings_trend, applications_trend],
            quick_stats=quick_stats
        )
    
    @staticmethod
    async def generate_comprehensive_report(
        data_service: InfluencerDataService,
        time_range: TimeRangeFilter,
        influencer_info: Dict
    ) -> ComprehensiveReport:
        """Generate comprehensive report with all analytics"""
        # Get dashboard report as base
        dashboard = await ReportGenerator.generate_dashboard_report(data_service, time_range, influencer_info)
        
        # Get additional data
        applications = await data_service.get_applications()
        earnings = await data_service.get_earnings()
        
        # Performance breakdown
        performance_breakdown = {
            "by_category": defaultdict(int),
            "by_brand": defaultdict(int),
            "by_month": defaultdict(int)
        }
        
        for app in applications:
            if app.get("status") == "completed":
                category = app.get("campaign_category", "Unknown")
                brand = app.get("brand_name", "Unknown")
                
                completed_at = app.get("completed_at")
                if isinstance(completed_at, str):
                    try:
                        completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
                        month = completed_at.strftime("%Y-%m")
                    except:
                        month = datetime.utcnow().strftime("%Y-%m")
                elif isinstance(completed_at, datetime):
                    month = completed_at.strftime("%Y-%m")
                else:
                    month = datetime.utcnow().strftime("%Y-%m")
                
                performance_breakdown["by_category"][category] += 1
                performance_breakdown["by_brand"][brand] += 1
                performance_breakdown["by_month"][month] += 1
        
        # Earnings analysis
        earnings_by_month = defaultdict(float)
        for earning in earnings:
            if earning.get("status") in ["completed", "approved"]:
                earned_at = earning.get("earned_at")
                if isinstance(earned_at, str):
                    try:
                        earned_at = datetime.fromisoformat(earned_at.replace('Z', '+00:00'))
                        month = earned_at.strftime("%Y-%m")
                    except:
                        month = datetime.utcnow().strftime("%Y-%m")
                elif isinstance(earned_at, datetime):
                    month = earned_at.strftime("%Y-%m")
                else:
                    month = datetime.utcnow().strftime("%Y-%m")
                
                earnings_by_month[month] += earning.get("amount", 0)
        
        earnings_analysis = {
            "monthly_trend": dict(sorted(earnings_by_month.items())),
            "top_earning_campaigns": [],
            "earnings_distribution": {
                "by_category": defaultdict(float),
                "by_brand": defaultdict(float)
            }
        }
        
        # Application analysis
        application_analysis = {
            "timeline_analysis": {
                "avg_response_time_days": 0,
                "avg_completion_time_days": 0,
                "application_funnel": {
                    "applied": len(applications),
                    "approved": len([a for a in applications if a.get("status") in ["approved", "contracted", "completed"]]),
                    "completed": len([a for a in applications if a.get("status") == "completed"])
                }
            },
            "conversion_rates": {
                "application_to_approval": dashboard.application_stats.approval_rate,
                "approval_to_completion": (
                    (dashboard.application_stats.completed / dashboard.application_stats.approved * 100)
                    if dashboard.application_stats.approved > 0 else 0
                )
            }
        }
        
        # Media analysis
        media_submissions = await data_service.get_media_submissions()
        total_files = sum(len(sub.get("submitted_media", [])) for sub in media_submissions)
        
        media_analysis = MediaAnalytics(
            total_submissions=len(media_submissions),
            total_files=total_files,
            avg_files_per_submission=total_files / len(media_submissions) if media_submissions else 0,
            avg_file_size_mb=0,
            media_types_distribution={},
            media_by_status={},
            submission_frequency={"daily": 0, "weekly": 0, "monthly": 0},
            top_performing_media=[]
        )
        
        # Engagement analysis (simplified)
        engagement_analysis = EngagementMetrics(
            likes_received=0,
            comments_received=0,
            shares_received=0,
            engagement_rate=0,
            audience_growth=0,
            content_reach=0,
            top_engaging_content=[]
        )
        
        # Competitive analysis (placeholder)
        competitive_analysis = {
            "platform_average": {
                "approval_rate": 45.2,
                "avg_earnings_per_campaign": 125.75,
                "completion_rate": 68.3
            },
            "percentile_rankings": {
                "earnings": 75.5,
                "approval_rate": 82.1,
                "engagement": 67.8
            }
        }
        
        # Recommendations
        recommendations = [
            {
                "category": "Earnings",
                "recommendation": "Focus on higher-budget campaigns to increase average earnings",
                "priority": "high",
                "estimated_impact": "20-30% increase in monthly earnings"
            },
            {
                "category": "Applications",
                "recommendation": "Personalize each application to improve approval rates",
                "priority": "medium",
                "estimated_impact": "10-15% improvement in approval rate"
            },
            {
                "category": "Engagement",
                "recommendation": "Increase activity consistency to improve algorithm ranking",
                "priority": "low",
                "estimated_impact": "Better campaign visibility"
            }
        ]
        
        # Raw data summary
        raw_data_summary = {
            "total_data_points": len(applications) + len(earnings),
            "time_period_covered": f"{time_range.time_range.value}",
            "data_quality_score": 92.5,
            "missing_data": []
        }
        
        return ComprehensiveReport(
            executive_summary=(
                f"Influencer {influencer_info.get('username', 'Unknown')} is performing at "
                f"{dashboard.performance_score.tier.value} level with an overall score of "
                f"{dashboard.performance_score.overall}. Key strengths include "
                f"{'high approval rate' if dashboard.application_stats.approval_rate > 60 else 'consistent earnings'}."
            ),
            dashboard=dashboard,
            performance_breakdown=performance_breakdown,
            earnings_analysis=earnings_analysis,
            application_analysis=application_analysis,
            media_analysis=media_analysis,
            engagement_analysis=engagement_analysis,
            competitive_analysis=competitive_analysis,
            recommendations=recommendations,
            raw_data_summary=raw_data_summary
        )

# -------------------- API ROUTES --------------------
@router.get("/dashboard", response_model=DashboardSummary)
async def get_influencer_dashboard(
    time_range: TimeRange = Query(TimeRange.LAST_30_DAYS),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive influencer dashboard"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    # Create time range filter
    time_range_filter = TimeRangeFilter(
        time_range=time_range,
        custom_range=DateRange(start_date=start_date, end_date=end_date) if start_date and end_date else None
    )
    
    # Check cache
    cache_key = cache_manager.generate_key(
        influencer_id, 
        "dashboard", 
        time_range=time_range_filter.time_range.value,
        start_date=str(start_date) if start_date else None,
        end_date=str(end_date) if end_date else None
    )
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        logger.info(f"Serving dashboard from cache for influencer {influencer_id}")
        return DashboardSummary(**cached_data)
    
    try:
        # Initialize services
        data_service = InfluencerDataService(influencer_id)
        
        # Generate report
        report = await ReportGenerator.generate_dashboard_report(
            data_service=data_service,
            time_range=time_range_filter,
            influencer_info=current_user
        )
        
        # Cache the result
        await cache_manager.set(cache_key, report.dict(), ttl=300)  # 5 minutes
        
        logger.info(f"Generated dashboard report for influencer {influencer_id}")
        return report
        
    except Exception as e:
        logger.error(f"Error generating dashboard report: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard: {str(e)}")

@router.get("/performance", response_model=PerformanceScore)
async def get_performance_score(
    time_range: TimeRange = Query(TimeRange.LAST_30_DAYS),
    current_user: dict = Depends(get_current_user)
):
    """Get detailed performance score"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    # Create time range filter
    time_range_filter = TimeRangeFilter(time_range=time_range)
    
    cache_key = cache_manager.generate_key(
        influencer_id, 
        "performance", 
        time_range=time_range.value
    )
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return PerformanceScore(**cached_data)
    
    try:
        data_service = InfluencerDataService(influencer_id)
        performance_score = await AnalyticsEngine.calculate_performance_score(data_service, time_range_filter)
        
        await cache_manager.set(cache_key, performance_score.dict(), ttl=600)  # 10 minutes
        
        return performance_score
        
    except Exception as e:
        logger.error(f"Error calculating performance score: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate performance: {str(e)}")

@router.get("/earnings-trends")
async def get_earnings_trends(
    period: TimeRange = Query(TimeRange.LAST_30_DAYS),
    group_by: Literal["day", "week", "month"] = Query("week"),
    current_user: dict = Depends(get_current_user)
):
    """Get earnings trends over time - Fixed endpoint name to match frontend"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    cache_key = cache_manager.generate_key(
        influencer_id, 
        "earnings_trends", 
        time_range=period.value,
        group_by=group_by
    )
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return cached_data
    
    try:
        data_service = InfluencerDataService(influencer_id)
        
        # Get date range
        start_date, end_date = get_date_range(period)
        
        # Get earnings
        earnings = await data_service.get_earnings({
            "earned_at": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["completed", "approved"]}
        })
        
        # Group by time period
        grouped_data = defaultdict(list)
        for earning in earnings:
            earned_at = earning.get("earned_at")
            amount = earning.get("amount", 0)
            
            if isinstance(earned_at, str):
                try:
                    earned_at = datetime.fromisoformat(earned_at.replace('Z', '+00:00'))
                except:
                    continue
            
            if group_by == "day":
                key = earned_at.strftime("%Y-%m-%d")
            elif group_by == "week":
                key = earned_at.strftime("%Y-%U")
            else:  # month
                key = earned_at.strftime("%Y-%m")
            
            grouped_data[key].append(amount)
        
        # Calculate statistics
        trends = []
        for period_key, amounts in sorted(grouped_data.items()):
            trends.append({
                "period": period_key,
                "total_amount": round(sum(amounts), 2),
                "transaction_count": len(amounts),
                "average_amount": round(sum(amounts) / len(amounts), 2) if amounts else 0,
                "min_amount": round(min(amounts), 2) if amounts else 0,
                "max_amount": round(max(amounts), 2) if amounts else 0
            })
        
        # Calculate growth rates
        for i in range(1, len(trends)):
            prev_total = trends[i-1]["total_amount"]
            curr_total = trends[i]["total_amount"]
            
            if prev_total > 0:
                growth = ((curr_total - prev_total) / prev_total) * 100
                trends[i]["growth_percentage"] = round(growth, 2)
                trends[i]["growth_trend"] = "up" if growth > 0 else "down" if growth < 0 else "stable"
            else:
                trends[i]["growth_percentage"] = None
                trends[i]["growth_trend"] = None
        
        await cache_manager.set(cache_key, trends, ttl=300)
        
        return trends
        
    except Exception as e:
        logger.error(f"Error getting earnings trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get earnings trends: {str(e)}")

@router.get("/applications/analysis")
async def get_applications_analysis(
    time_range: TimeRange = Query(TimeRange.LAST_30_DAYS),
    current_user: dict = Depends(get_current_user)
):
    """Get detailed applications analysis"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    cache_key = cache_manager.generate_key(
        influencer_id, 
        "applications_analysis", 
        time_range=time_range.value
    )
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return cached_data
    
    try:
        data_service = InfluencerDataService(influencer_id)
        
        # Get date range
        start_date, end_date = get_date_range(time_range)
        
        # Get applications
        applications = await data_service.get_applications({
            "date_range": (start_date, end_date)
        })
        
        if not applications:
            return {
                "summary": {
                    "total_applications": 0,
                    "time_period": f"{start_date.date()} to {end_date.date()}",
                    "avg_applications_per_day": 0
                },
                "status_distribution": {},
                "category_distribution": {},
                "top_brands": {},
                "response_time_analysis": {
                    "average_hours": 0,
                    "median_hours": 0,
                    "min_hours": 0,
                    "max_hours": 0
                },
                "timeline": [],
                "conversion_funnel": {
                    "applied": 0,
                    "approved": 0,
                    "completed": 0
                }
            }
        
        # Calculate metrics
        total_applications = len(applications)
        
        # Status distribution
        status_counts = defaultdict(int)
        for app in applications:
            status = app.get("status", "unknown")
            status_counts[status] += 1
        
        # Category distribution
        category_counts = defaultdict(int)
        for app in applications:
            category = app.get("campaign_category", "Unknown")
            category_counts[category] += 1
        
        # Brand distribution
        brand_counts = defaultdict(int)
        for app in applications:
            brand = app.get("brand_name", "Unknown")
            brand_counts[brand] += 1
        
        # Response time analysis
        response_times = []
        for app in applications:
            applied_at = app.get("applied_at")
            responded_at = app.get("approved_at") or app.get("rejected_at")
            
            if applied_at and responded_at:
                if isinstance(applied_at, str):
                    try:
                        applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                if isinstance(responded_at, str):
                    try:
                        responded_at = datetime.fromisoformat(responded_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                if applied_at and responded_at:
                    try:
                        response_hours = (responded_at - applied_at).total_seconds() / 3600
                        response_times.append(response_hours)
                    except:
                        continue
        
        # Timeline analysis
        timeline = []
        current_date = start_date
        while current_date <= end_date:
            date_apps = []
            for a in applications:
                applied_at = a.get("applied_at")
                if isinstance(applied_at, str):
                    try:
                        applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                    except:
                        continue
                
                if applied_at and applied_at.date() == current_date.date():
                    date_apps.append(a)
            
            timeline.append({
                "date": current_date.date().isoformat(),
                "applications": len(date_apps),
                "approved": len([a for a in date_apps if a.get("status") in ["approved", "contracted", "completed"]])
            })
            current_date += timedelta(days=1)
        
        # Prepare analysis
        analysis = {
            "summary": {
                "total_applications": total_applications,
                "time_period": f"{start_date.date()} to {end_date.date()}",
                "avg_applications_per_day": round(total_applications / ((end_date - start_date).days + 1), 2)
            },
            "status_distribution": dict(status_counts),
            "category_distribution": dict(category_counts),
            "top_brands": dict(sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            "response_time_analysis": {
                "average_hours": round(mean(response_times), 2) if response_times else 0,
                "median_hours": round(median(response_times), 2) if response_times else 0,
                "min_hours": round(min(response_times), 2) if response_times else 0,
                "max_hours": round(max(response_times), 2) if response_times else 0
            },
            "timeline": timeline,
            "conversion_funnel": {
                "applied": status_counts.get("pending", 0) + sum(status_counts.get(s, 0) for s in ["approved", "contracted", "completed", "rejected"]),
                "approved": sum(status_counts.get(s, 0) for s in ["approved", "contracted", "completed"]),
                "completed": status_counts.get("completed", 0)
            }
        }
        
        await cache_manager.set(cache_key, analysis, ttl=300)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing applications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze applications: {str(e)}")

@router.get("/campaigns")
async def get_campaigns_analytics(
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get campaigns analytics - Fixed to include brand information"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    cache_key = cache_manager.generate_key(
        influencer_id, 
        "campaigns", 
        status=status if status else "all",
        limit=limit
    )
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return cached_data
    
    try:
        data_service = InfluencerDataService(influencer_id)
        
        # Get campaigns with proper brand information
        pipeline = [
            {"$match": {"applications.influencer_id": influencer_id}},
            {"$unwind": "$applications"},
            {"$match": {"applications.influencer_id": influencer_id}},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "title": 1,
                "description": 1,
                "budget": 1,
                "status": 1,
                "category": 1,
                "created_at": 1,
                "deadline": 1,
                "brand_id": 1,
                "brand_name": 1,  # Include if exists
                "application_status": "$applications.status",
                "application_date": "$applications.applied_at",
                "application_id": "$applications._id",
                "campaign_earnings": "$applications.earnings"
            }},
            {"$limit": limit}
        ]
        
        if status:
            pipeline.insert(2, {"$match": {"applications.status": status}})
        
        cursor = campaigns_collection.aggregate(pipeline)
        campaigns = list(cursor)
        
        # ENRICH WITH BRAND INFORMATION
        for campaign in campaigns:
            try:
                # Get brand information from brand_id
                if campaign.get("brand_id"):
                    brand_user = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
                    
                    if brand_user:
                        # Brand profile exists
                        brand_profile = brand_user.get("brand_profile", {})
                        
                        # Set brand_name from various possible sources
                        campaign["brand_name"] = (
                            brand_profile.get("company_name") or
                            brand_user.get("username") or
                            campaign.get("brand_name") or
                            "Unknown Brand"
                        )
                        
                        # Add full brand object for frontend flexibility
                        campaign["brand"] = {
                            "id": str(brand_user["_id"]),
                            "company_name": brand_profile.get("company_name"),
                            "logo": brand_profile.get("logo"),
                            "email": brand_user.get("email"),
                            "bio": brand_profile.get("bio"),
                            "website": brand_profile.get("website"),
                            "location": brand_profile.get("location")
                        }
                        
                        # Add brand_profile for backward compatibility
                        campaign["brand_profile"] = brand_profile
                        
                        # Add created_by info
                        campaign["created_by"] = {
                            "id": str(brand_user["_id"]),
                            "company_name": brand_profile.get("company_name"),
                            "email": brand_user.get("email")
                        }
                        
                else:
                    # No brand_id, set defaults
                    campaign["brand_name"] = "Unknown Brand"
                    campaign["brand"] = None
                    campaign["brand_profile"] = None
                    campaign["created_by"] = None
                    
            except Exception as e:
                logger.warning(f"Error enriching brand info for campaign {campaign.get('_id')}: {str(e)}")
                campaign["brand_name"] = "Unknown Brand"
                campaign["brand"] = None
                campaign["brand_profile"] = None
                campaign["created_by"] = None
            
            # Convert budget and earnings to float
            campaign["budget"] = decimal_to_float(campaign.get("budget", 0))
            campaign["campaign_earnings"] = decimal_to_float(campaign.get("campaign_earnings", 0))
        
        # Cache the results
        await cache_manager.set(cache_key, campaigns, ttl=300)
        
        return campaigns
        
    except Exception as e:
        logger.error(f"Error getting campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get campaigns: {str(e)}")

@router.get("/media")
async def get_media_analytics(
    current_user: dict = Depends(get_current_user)
):
    """Get media analytics - Fixed endpoint to match frontend"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    cache_key = cache_manager.generate_key(influencer_id, "media_analytics")
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return cached_data
    
    try:
        data_service = InfluencerDataService(influencer_id)
        media_submissions = await data_service.get_media_submissions()
        
        # Calculate media statistics
        total_submissions = len(media_submissions)
        total_files = sum(len(sub.get("submitted_media", [])) for sub in media_submissions)
        
        # Analyze media types
        media_types = defaultdict(int)
        for submission in media_submissions:
            for media in submission.get("submitted_media", []):
                file_type = media.get("file_type", "unknown")
                if "image" in file_type.lower():
                    media_types["images"] += 1
                elif "video" in file_type.lower():
                    media_types["videos"] += 1
                elif "pdf" in file_type.lower() or "doc" in file_type.lower():
                    media_types["documents"] += 1
                else:
                    media_types["other"] += 1
        
        # Analyze by status
        media_by_status = defaultdict(int)
        for submission in media_submissions:
            status = submission.get("media_approval_status", "pending")
            media_by_status[status] += len(submission.get("submitted_media", []))
        
        # Recent media
        recent_media = []
        for submission in media_submissions[:10]:  # Last 10 submissions
            for media in submission.get("submitted_media", [])[:5]:  # First 5 files per submission
                recent_media.append({
                    "filename": media.get("filename", "Unknown"),
                    "file_type": media.get("file_type", "unknown"),
                    "size": media.get("file_size", "0KB"),
                    "submitted_at": submission.get("submission_date"),
                    "status": submission.get("status"),
                    "campaign_title": submission.get("campaign_title", "Unknown")
                })
        
        result = {
            "total_submissions": total_submissions,
            "total_files": total_files,
            "images": media_types.get("images", 0),
            "videos": media_types.get("videos", 0),
            "documents": media_types.get("documents", 0),
            "avg_file_size": "N/A",  # Would need actual file sizes
            "storage_used": "N/A",   # Would need storage calculations
            "type_distribution": [
                {"name": "Images", "value": media_types.get("images", 0)},
                {"name": "Videos", "value": media_types.get("videos", 0)},
                {"name": "Documents", "value": media_types.get("documents", 0)},
                {"name": "Other", "value": media_types.get("other", 0)}
            ],
            "recent_media": recent_media[:8]  # Limit to 8 for frontend
        }
        
        await cache_manager.set(cache_key, result, ttl=300)
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting media analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get media analytics: {str(e)}")

@router.get("/comprehensive-report", response_model=ComprehensiveReport)
async def get_comprehensive_report(
    time_range: TimeRange = Query(TimeRange.LAST_90_DAYS),
    current_user: dict = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Get comprehensive analytics report"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    cache_key = cache_manager.generate_key(
        influencer_id, 
        "comprehensive_report", 
        time_range=time_range.value
    )
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return ComprehensiveReport(**cached_data)
    
    try:
        # Create time range filter
        time_range_filter = TimeRangeFilter(time_range=time_range)
        
        # Initialize services
        data_service = InfluencerDataService(influencer_id)
        
        # Generate comprehensive report
        report = await ReportGenerator.generate_comprehensive_report(
            data_service=data_service,
            time_range=time_range_filter,
            influencer_info=current_user
        )
        
        # Cache the result (longer TTL for comprehensive reports)
        await cache_manager.set(cache_key, report.dict(), ttl=1800)  # 30 minutes
        
        # Log report generation (async)
        if background_tasks:
            background_tasks.add_task(
                logger.info,
                f"Generated comprehensive report for influencer {influencer_id}"
            )
        
        return report
        
    except Exception as e:
        logger.error(f"Error generating comprehensive report: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/export") 
async def export_analytics_data(
    report_type: ReportType = Query(ReportType.DASHBOARD),
    export_format: ExportFormat = Query(ExportFormat.JSON),
    time_range: TimeRange = Query(TimeRange.LAST_30_DAYS),
    current_user: dict = Depends(get_current_user)
):
    """Export analytics data in various formats"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    try:
        # Get data based on report type
        if report_type == ReportType.DASHBOARD:
            time_range_filter = TimeRangeFilter(time_range=time_range)
            data_service = InfluencerDataService(influencer_id)
            data = await ReportGenerator.generate_dashboard_report(
                data_service, time_range_filter, current_user
            )
            data_dict = data.dict()
            
        elif report_type == ReportType.EARNINGS:
            earnings_trends = await get_earnings_trends(time_range, "month", current_user)
            data_dict = {"earnings_trends": earnings_trends}
            
        elif report_type == ReportType.APPLICATIONS:
            apps_analysis = await get_applications_analysis(time_range, current_user)
            data_dict = {"applications_analysis": apps_analysis}
            
        elif report_type == ReportType.COMPREHENSIVE:
            time_range_filter = TimeRangeFilter(time_range=time_range)
            data_service = InfluencerDataService(influencer_id)
            data = await ReportGenerator.generate_comprehensive_report(
                data_service, time_range_filter, current_user
            )
            data_dict = data.dict()
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported report type: {report_type}")
        
        # Format based on export format
        if export_format == ExportFormat.CSV:
            # Convert to CSV
            output = io.StringIO()
            
            if isinstance(data_dict, dict):
                # Flatten for CSV
                flat_data = flatten_dict(data_dict)
                writer = csv.DictWriter(output, fieldnames=flat_data.keys())
                writer.writeheader()
                writer.writerow(flat_data)
            elif isinstance(data_dict, list) and data_dict:
                writer = csv.DictWriter(output, fieldnames=data_dict[0].keys())
                writer.writeheader()
                writer.writerows(data_dict)
            
            content = output.getvalue()
            filename = f"{report_type.value}_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            
            return Response(
                content=content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
            
        elif export_format == ExportFormat.EXCEL:
            # Convert to Excel (simplified - would use pandas in production)
            df = pd.DataFrame([data_dict])
            output = io.BytesIO()
            
            # In production, use: df.to_excel(output, index=False)
            # For now, return as CSV
            content = df.to_csv(index=False)
            filename = f"{report_type.value}_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            
            return Response(
                content=content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
            
        else:  # Default to JSON
            filename = f"{report_type.value}_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            
            return Response(
                content=json.dumps(data_dict, default=str, indent=2),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
            
    except Exception as e:
        logger.error(f"Error exporting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

@router.post("/clear-cache")
async def clear_analytics_cache(
    current_user: dict = Depends(get_current_user)
):
    """Clear analytics cache for the current user"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can clear cache")
    
    influencer_id = str(current_user["_id"])
    
    try:
        await cache_manager.clear_user_cache(influencer_id)
        
        logger.info(f"Cleared analytics cache for influencer {influencer_id}")
        
        return {"message": "Analytics cache cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

@router.get("/health")
async def analytics_health_check():
    """Health check for analytics service"""
    try:
        # Check cache
        cache_status = await cache_manager.get("health_check")
        if cache_status is None:
            await cache_manager.set("health_check", "ok", ttl=60)
        
        # Check database connections
        campaign_count = campaigns_collection.count_documents({})
        earnings_count = earnings_collection.count_documents({})
        
        return {
            "status": "healthy",
            "service": "influencer-analytics-api",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "campaigns_collection": "connected",
                "earnings_collection": "connected"
            },
            "cache": "available" if cache_manager.available else "memory_only",
            "counts": {
                "campaigns": campaign_count,
                "earnings": earnings_count
            }
        }
    except Exception as e:
        logger.error(f"Analytics health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/quick-stats")
async def get_quick_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get quick statistics for dashboard widgets"""
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can access analytics")
    
    influencer_id = str(current_user["_id"])
    
    cache_key = cache_manager.generate_key(influencer_id, "quick_stats")
    
    cached_data = await cache_manager.get(cache_key)
    if cached_data:
        return cached_data
    
    try:
        data_service = InfluencerDataService(influencer_id)
        
        # Get recent data
        today = datetime.utcnow().date()
        week_ago = datetime.utcnow() - timedelta(days=7)
        month_ago = datetime.utcnow() - timedelta(days=30)
        
        # Get applications
        all_applications = await data_service.get_applications()
        today_apps = []
        week_apps = []
        month_apps = []
        
        for a in all_applications:
            applied_at = a.get("applied_at")
            if isinstance(applied_at, str):
                try:
                    applied_at = datetime.fromisoformat(applied_at.replace('Z', '+00:00'))
                except:
                    continue
            
            if isinstance(applied_at, datetime):
                if applied_at.date() == today:
                    today_apps.append(a)
                if applied_at >= week_ago:
                    week_apps.append(a)
                if applied_at >= month_ago:
                    month_apps.append(a)
        
        # Get earnings
        all_earnings = await data_service.get_earnings({"status": {"$in": ["completed", "approved"]}})
        today_earnings = []
        week_earnings = []
        month_earnings = []
        
        for e in all_earnings:
            earned_at = e.get("earned_at")
            if isinstance(earned_at, str):
                try:
                    earned_at = datetime.fromisoformat(earned_at.replace('Z', '+00:00'))
                except:
                    continue
            
            if isinstance(earned_at, datetime):
                if earned_at.date() == today:
                    today_earnings.append(e)
                if earned_at >= week_ago:
                    week_earnings.append(e)
                if earned_at >= month_ago:
                    month_earnings.append(e)
        
        # Calculate stats
        stats = {
            "today": {
                "applications": len(today_apps),
                "earnings": round(sum(e.get("amount", 0) for e in today_earnings), 2),
                "approvals": len([a for a in today_apps if a.get("status") in ["approved", "contracted"]]),
                "completed": len([a for a in today_apps if a.get("status") == "completed"])
            },
            "this_week": {
                "applications": len(week_apps),
                "earnings": round(sum(e.get("amount", 0) for e in week_earnings), 2),
                "approvals": len([a for a in week_apps if a.get("status") in ["approved", "contracted"]]),
                "completed": len([a for a in week_apps if a.get("status") == "completed"])
            },
            "this_month": {
                "applications": len(month_apps),
                "earnings": round(sum(e.get("amount", 0) for e in month_earnings), 2),
                "approvals": len([a for a in month_apps if a.get("status") in ["approved", "contracted"]]),
                "completed": len([a for a in month_apps if a.get("status") == "completed"])
            },
            "all_time": {
                "applications": len(all_applications),
                "earnings": round(sum(e.get("amount", 0) for e in all_earnings), 2),
                "approvals": len([a for a in all_applications if a.get("status") in ["approved", "contracted"]]),
                "completed": len([a for a in all_applications if a.get("status") == "completed"])
            }
        }
        
        await cache_manager.set(cache_key, stats, ttl=60)  # 1 minute cache
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting quick stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get quick stats: {str(e)}")

# Helper function for flattening dict
def flatten_dict(d, parent_key='', sep='.'):
    """Flatten a nested dictionary"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)