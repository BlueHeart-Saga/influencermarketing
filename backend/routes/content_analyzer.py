# content_analysis.py (rewritten with proper plan handling)
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

import cohere

from auth.utils import get_current_user, SubscriptionManager, get_subscription_benefits
from database import db

# Load environment variables
load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("Missing COHERE_API_KEY in environment variables.")

# Logger
logger = logging.getLogger(__name__)

# Initialize Cohere client (safe)
client = None
try:
    client = cohere.ClientV2(api_key=COHERE_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Cohere client: {e}")
    client = None

router = APIRouter(tags=["Content Analysis"])

# DB collections
content_analysis_usage = db["content_analysis_usage"]

# Request models
class GenerateRequest(BaseModel):
    prompt: str
    mode: str = "caption"

class AnalyzeRequest(BaseModel):
    link: str

# Content Analysis Limits Configuration
CONTENT_ANALYSIS_LIMITS = {
    "trial": {
        "name": "Free Trial",
        "can_generate_content": True,
        "max_analyses_per_day": 10,
        "max_character_limit": 2000,
        "available_modes": ["caption", "description"],
        "features": [
            "✓ Up to 10 analyses per day",
            "✓ Basic content generation",
            "✓ Product link analysis",
            "✓ Standard suggestions"
        ]
    },
    "starter": {
        "name": "Starter Plan",
        "can_generate_content": True,
        "max_analyses_per_day": 50,
        "max_character_limit": 5000,
        "available_modes": ["caption", "description", "idea"],
        "features": [
            "✓ Up to 50 analyses per day",
            "✓ Advanced content generation",
            "✓ Product link analysis",
            "✓ Campaign ideas",
            "✓ Extended suggestions"
        ]
    },
    "pro": {
        "name": "Pro Plan",
        "can_generate_content": True,
        "max_analyses_per_day": 200,
        "max_character_limit": 10000,
        "available_modes": ["caption", "description", "idea", "strategy"],
        "features": [
            "✓ Up to 200 analyses per day",
            "✓ Premium content generation",
            "✓ Advanced link analysis",
            "✓ Full campaign strategy",
            "✓ Priority processing"
        ]
    },
    "enterprise": {
        "name": "Enterprise Plan",
        "can_generate_content": True,
        "max_analyses_per_day": 1000,
        "max_character_limit": 25000,
        "available_modes": ["caption", "description", "idea", "strategy", "custom"],
        "features": [
            "✓ Up to 1000 analyses per day",
            "✓ Unlimited content generation",
            "✓ Deep link analysis",
            "✓ Custom strategies",
            "✓ API access",
            "✓ Custom model training"
        ]
    }
}

# Plan mapping to normalize subscription plan keys
PLAN_MAPPING = {
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

class ContentAnalysisManager:
    """Manager for content analysis operations with plan-based limits"""
    
    @staticmethod
    def get_normalized_plan_key(subscription_data: Dict[str, Any]) -> str:
        """Extract and normalize plan key from subscription data"""
        # First try to get plan from subscription data
        plan_key = subscription_data.get("plan", "trial")
        
        # If we have a plan mapping, use it
        if plan_key in PLAN_MAPPING:
            return PLAN_MAPPING[plan_key]
        
        # If we have a plan_name, try to map it
        plan_name = subscription_data.get("plan_name", "").lower()
        for key, value in PLAN_MAPPING.items():
            if key in plan_name:
                return value
        
        # Default to trial
        return "trial"
    
    @staticmethod
    def get_content_analysis_limits(subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get content analysis limits based on subscription plan"""
        plan_key = ContentAnalysisManager.get_normalized_plan_key(subscription_data)
        return CONTENT_ANALYSIS_LIMITS.get(plan_key, CONTENT_ANALYSIS_LIMITS["trial"])
    
    @staticmethod
    async def get_today_analysis_usage(user_email: str, date: datetime.date = None) -> int:
        """Get today's content analysis usage count"""
        try:
            if date is None:
                date = datetime.utcnow().date()
            
            doc = content_analysis_usage.find_one({
                "user_email": user_email,
                "date": date.isoformat()
            })
            
            return doc.get("count", 0) if doc else 0
        except Exception as e:
            logger.error(f"Error getting content analysis usage: {str(e)}")
            return 0
    
    @staticmethod
    async def get_total_analysis_usage(user_email: str) -> int:
        """Get total content analysis usage"""
        try:
            pipeline = [
                {"$match": {"user_email": user_email}},
                {"$group": {"_id": None, "total": {"$sum": "$count"}}}
            ]
            result = list(content_analysis_usage.aggregate(pipeline))
            return result[0]["total"] if result else 0
        except Exception as e:
            logger.error(f"Error getting total analysis usage: {str(e)}")
            return 0
    
    @staticmethod
    async def record_content_analysis(
        user_email: str, 
        mode: str, 
        prompt_length: int, 
        link_analysis: bool = False
    ):
        """Record content analysis usage"""
        try:
            today = datetime.utcnow().date()
            today_str = today.isoformat()
            
            content_analysis_usage.update_one(
                {
                    "user_email": user_email,
                    "date": today_str
                },
                {
                    "$inc": {"count": 1},
                    "$set": {
                        "last_analysis": datetime.utcnow(),
                        "last_mode": mode,
                        "has_link_analysis": link_analysis,
                        "updated_at": datetime.utcnow()
                    },
                    "$setOnInsert": {
                        "created_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            logger.info(f"Recorded content analysis for {user_email} (mode={mode})")
        except Exception as e:
            logger.error(f"Error recording content analysis: {str(e)}")
    
    @staticmethod
    async def can_analyze_content(user_email: str, mode: str = "caption") -> Dict[str, Any]:
        """Check if user can perform content analysis based on plan limits"""
        try:
            # Get subscription data from SubscriptionManager
            subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
            
            # Get content analysis limits for the plan
            limits = ContentAnalysisManager.get_content_analysis_limits(subscription_data)
            
            # Check if content generation is allowed
            if not limits.get("can_generate_content", True):
                return {
                    "can_analyze": False,
                    "reason": "Content analysis not available for your plan",
                    "upgrade_required": True
                }
            
            # Check if mode is available for the plan
            available_modes = limits.get("available_modes", [])
            if mode not in available_modes:
                return {
                    "can_analyze": False,
                    "reason": f"Mode '{mode}' not available for your plan",
                    "available_modes": available_modes,
                    "upgrade_required": True
                }
            
            # Check daily usage
            today = datetime.utcnow().date()
            daily_usage = await ContentAnalysisManager.get_today_analysis_usage(user_email, today)
            max_per_day = limits.get("max_analyses_per_day", 10)
            
            remaining_today = max_per_day - daily_usage
            
            if remaining_today <= 0:
                return {
                    "can_analyze": False,
                    "reason": f"Daily content analysis limit ({max_per_day}) reached",
                    "reset_time": datetime.combine(today + timedelta(days=1), datetime.min.time()),
                    "upgrade_required": True
                }
            
            return {
                "can_analyze": True,
                "remaining_today": remaining_today,
                "max_per_day": max_per_day,
                "max_character_limit": limits.get("max_character_limit", 2000),
                "available_modes": available_modes,
                "subscription": subscription_data
            }
            
        except Exception as e:
            logger.error(f"Error checking content analysis permissions: {str(e)}")
            return {
                "can_analyze": False,
                "reason": "Error checking permissions",
                "error": str(e)
            }
    
    @staticmethod
    async def get_user_analysis_stats(user_email: str) -> Dict[str, Any]:
        """Get comprehensive analysis stats for user"""
        try:
            # Get subscription data
            subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
            limits = ContentAnalysisManager.get_content_analysis_limits(subscription_data)
            
            # Get usage stats
            today = datetime.utcnow().date()
            today_usage = await ContentAnalysisManager.get_today_analysis_usage(user_email, today)
            total_usage = await ContentAnalysisManager.get_total_analysis_usage(user_email)
            
            max_per_day = limits.get("max_analyses_per_day", 10)
            remaining_today = max(0, max_per_day - today_usage)
            
            return {
                "today_usage": today_usage,
                "daily_limit": max_per_day,
                "remaining_today": remaining_today,
                "total_analyses": total_usage,
                "max_character_limit": limits.get("max_character_limit", 2000),
                "available_modes": limits.get("available_modes", []),
                "plan_name": subscription_data.get("plan_name", "Free Trial"),
                "plan_type": subscription_data.get("type", "trial"),
                "is_active": subscription_data.get("is_active", True),
                "is_trial": subscription_data.get("is_trial", True),
                "remaining_days": subscription_data.get("remaining_days", 0),
                "trial_remaining_days": subscription_data.get("trial_remaining_days", 0),
                "subscription_data": subscription_data
            }
        except Exception as e:
            logger.error(f"Error getting analysis stats: {str(e)}")
            return {
                "today_usage": 0,
                "daily_limit": 10,
                "remaining_today": 10,
                "total_analyses": 0,
                "max_character_limit": 2000,
                "available_modes": ["caption", "description"],
                "plan_name": "Free Trial",
                "plan_type": "trial",
                "is_active": True,
                "is_trial": True,
                "remaining_days": 15,
                "trial_remaining_days": 15
            }

# ---------- API Endpoints ----------

@router.get("/limits")
async def get_content_analysis_limits_endpoint(user: Dict = Depends(get_current_user)):
    """Get content analysis limits for current user"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email not found"
            )
        
        # Get subscription and limits
        subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
        limits = ContentAnalysisManager.get_content_analysis_limits(subscription_data)
        stats = await ContentAnalysisManager.get_user_analysis_stats(user_email)
        
        # Check if user can analyze
        permission_check = await ContentAnalysisManager.can_analyze_content(user_email)
        
        return {
            "success": True,
            "user_email": user_email,
            "plan": subscription_data.get("plan_name", "Free Trial"),
            "plan_key": subscription_data.get("plan", "trial"),
            "plan_type": subscription_data.get("type", "trial"),
            "limits": limits,
            "usage_stats": stats,
            "can_analyze": permission_check.get("can_analyze", False),
            "upgrade_required": not permission_check.get("can_analyze", False),
            "subscription_data": {
                "is_active": subscription_data.get("is_active", False),
                "is_trial": subscription_data.get("is_trial", True),
                "remaining_days": subscription_data.get("remaining_days", 0),
                "trial_remaining_days": subscription_data.get("trial_remaining_days", 0),
                "current_period_end": subscription_data.get("current_period_end")
            }
        }
        
    except Exception as e:
        logger.error(f"Error in /limits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch content limits: {str(e)}"
        )

@router.get("/stats")
async def get_user_analysis_stats_endpoint(user: Dict = Depends(get_current_user)):
    """Get analysis stats for current user"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email not found"
            )
        
        stats = await ContentAnalysisManager.get_user_analysis_stats(user_email)
        
        return {
            "success": True,
            "user_email": user_email,
            "stats": stats,
            "subscription": {
                "plan": stats.get("plan_name", "Free Trial"),
                "type": stats.get("plan_type", "trial"),
                "is_active": stats.get("is_active", False),
                "remaining_days": stats.get("remaining_days", 0),
                "trial_remaining_days": stats.get("trial_remaining_days", 0),
                "current_period_end": stats.get("subscription_data", {}).get("current_period_end")
            }
        }
        
    except Exception as e:
        logger.error(f"Error in /stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user stats: {str(e)}"
        )

@router.post("/generate")
async def generate_content(req: GenerateRequest, user: Dict = Depends(get_current_user)):
    """Generate content with AI"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email not found"
            )
        
        prompt = (req.prompt or "").strip()
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt is required"
            )
        
        # Check permissions
        permission = await ContentAnalysisManager.can_analyze_content(user_email, req.mode)
        if not permission.get("can_analyze"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": permission.get("reason", "Content analysis not allowed"),
                    "upgrade_required": permission.get("upgrade_required", False),
                    "remaining_today": permission.get("remaining_today", 0),
                    "max_per_day": permission.get("max_per_day", 0)
                }
            )
        
        # Check character limit
        max_chars = permission.get("max_character_limit", 2000)
        if len(prompt) > max_chars:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": f"Prompt exceeds character limit ({max_chars})",
                    "current_length": len(prompt),
                    "max_length": max_chars,
                    "upgrade_required": True
                }
            )
        
        # Prepare prompt based on mode
        mode_prompts = {
            "caption": f"Write an engaging social media caption for: {prompt}\nInclude relevant hashtags and keep it concise.",
            "description": f"Write a compelling product description for: {prompt}\nInclude key features and benefits.",
            "idea": f"Generate creative marketing ideas for: {prompt}\nInclude campaign concepts and strategies.",
            "strategy": f"Create a comprehensive marketing strategy for: {prompt}\nInclude target audience, channels, and tactics.",
            "custom": prompt
        }
        
        final_prompt = mode_prompts.get(req.mode, prompt)
        
        # Check Cohere client
        if not client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable"
            )
        
        try:
            # Call Cohere API
            response = client.chat(
                model='command-r-08-2024',
                messages=[{"role": "user", "content": final_prompt}],
                max_tokens=500,
                temperature=0.7
            )
            
            # Extract response text
            text = ""
            try:
                if hasattr(response, "message") and hasattr(response.message, "content"):
                    content = response.message.content
                    if isinstance(content, list) and content:
                        text = getattr(content[0], "text", "") or str(content[0])
                    else:
                        text = str(content)
                elif hasattr(response, "text"):
                    text = response.text
                else:
                    text = str(response)
            except Exception:
                text = str(response)
            
            text = (text or "").strip()
            
            # Record usage
            await ContentAnalysisManager.record_content_analysis(
                user_email, req.mode, len(prompt)
            )
            
            # Get updated stats
            updated_stats = await ContentAnalysisManager.get_user_analysis_stats(user_email)
            
            return {
                "success": True,
                "mode": req.mode,
                "result": text,
                "usage": {
                    "remaining_today": updated_stats.get("remaining_today"),
                    "daily_limit": updated_stats.get("daily_limit"),
                    "today_usage": updated_stats.get("today_usage")
                }
            }
            
        except Exception as e:
            logger.error(f"Cohere generation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI generation error: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /generate: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during generation"
        )

@router.post("/analyze-product")
async def analyze_product_link(payload: AnalyzeRequest, user: Dict = Depends(get_current_user)):
    """Analyze a product link with AI"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User email not found"
            )
        
        link = (payload.link or "").strip()
        if not link or not link.startswith("http"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valid URL is required"
            )
        
        # Check permissions
        permission = await ContentAnalysisManager.can_analyze_content(user_email, "caption")
        if not permission.get("can_analyze"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": permission.get("reason", "Link analysis not allowed"),
                    "upgrade_required": permission.get("upgrade_required", False)
                }
            )
        
        # Fetch webpage
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = requests.get(link, headers=headers, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"Failed to fetch URL {link}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch URL: {str(e)}"
            )
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract title
        title_tag = soup.find('title')
        title = title_tag.text.strip() if title_tag else ""
        
        # Extract description
        description = ""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            description = meta_desc['content'].strip()
        else:
            og_desc = soup.find('meta', attrs={'property': 'og:description'})
            if og_desc and og_desc.get('content'):
                description = og_desc['content'].strip()
        
        # Extract main content as fallback
        if not description:
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
            if main_content:
                description = main_content.get_text()[:300].strip()
        
        # Prepare analysis prompt
        analysis_prompt = f"""Analyze this product/website for marketing purposes:

URL: {link}
Title: {title}
Description: {description}

Please provide a comprehensive marketing analysis including:
1. Product/Service Overview
2. Target Audience
3. Key Selling Points
4. Marketing Campaign Ideas
5. Influencer Collaboration Opportunities
6. Content Strategy Recommendations
7. Hashtag Suggestions
"""
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable"
            )
        
        try:
            # Call Cohere API
            response = client.chat(
                model='command-r-08-2024',
                messages=[{"role": "user", "content": analysis_prompt}],
                max_tokens=800,
                temperature=0.7
            )
            
            # Extract response text
            ai_text = ""
            try:
                if hasattr(response, "message") and hasattr(response.message, "content"):
                    content = response.message.content
                    if isinstance(content, list) and content:
                        ai_text = getattr(content[0], "text", "") or str(content[0])
                    else:
                        ai_text = str(content)
                elif hasattr(response, "text"):
                    ai_text = response.text
                else:
                    ai_text = str(response)
            except Exception:
                ai_text = str(response)
            
            ai_text = (ai_text or "").strip()
            
            # Record usage
            await ContentAnalysisManager.record_content_analysis(
                user_email, "link_analysis", len(analysis_prompt), link_analysis=True
            )
            
            # Get updated stats
            updated_stats = await ContentAnalysisManager.get_user_analysis_stats(user_email)
            
            return {
                "success": True,
                "data": {
                    "title": title,
                    "description": description,
                    "ai_suggestions": ai_text,
                    "url": link
                },
                "usage": {
                    "remaining_today": updated_stats.get("remaining_today"),
                    "daily_limit": updated_stats.get("daily_limit"),
                    "today_usage": updated_stats.get("today_usage")
                }
            }
            
        except Exception as e:
            logger.error(f"AI link analysis failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI analysis error: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /analyze-product: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during link analysis"
        )

@router.post("/reset-usage")
async def reset_analysis_usage(user: Dict = Depends(get_current_user)):
    """Reset today's usage (admin only)"""
    try:
        # Check admin role
        if user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        user_email = user.get("email")
        today = datetime.utcnow().date()
        today_str = today.isoformat()
        
        # Delete today's usage record
        content_analysis_usage.delete_one({
            "user_email": user_email,
            "date": today_str
        })
        
        logger.info(f"Reset analysis usage for {user_email}")
        
        return {
            "success": True,
            "message": "Usage reset successfully",
            "user_email": user_email,
            "date": today_str
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /reset-usage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset usage"
        )

# Export for use in other modules
__all__ = ["router", "ContentAnalysisManager"]