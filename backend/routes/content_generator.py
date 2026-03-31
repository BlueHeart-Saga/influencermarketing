# # content_generator.py
# import os
# from fastapi import FastAPI, APIRouter, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv
# import cohere

# # Load environment variables
# load_dotenv()
# API_KEY = os.getenv("COHERE_API_KEY")
# if not API_KEY:
#     raise ValueError("Missing COHERE_API_KEY in environment variables.")

# # Use ClientV2 for the new API
# client = cohere.ClientV2(api_key=API_KEY)

# # Setup router
# router = APIRouter(prefix="/content", tags=["AI Content Generator"])

# def generate_content(prompt: str) -> str:
#     try:
#         # Use the Chat API v2 format: messages list
#         response = client.chat(
#             model="command-a-03-2025",  # example model — change to one you have access to
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.7,
#             max_tokens=150
#         )
#         # Response structure: response.message.content is a list of text items
#         return response.message.content[0].text.strip()
#     except Exception as e:
#         # Provide details for debugging
#         raise HTTPException(status_code=500, detail=f"Cohere chat error: {e}")

# @router.get("/")
# def status():
#     return {"message": "Content generator router active"}

# @router.post("/generate")
# async def generate_endpoint(data: dict):
#     prompt = data.get("prompt")
#     if not prompt:
#         raise HTTPException(status_code=400, detail="Prompt is required.")
#     generated = generate_content(prompt)
#     return {"generated_text": generated}



# content_generator.py
import os
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import cohere
from typing import Dict, Any, Optional
from bson import ObjectId

# Import your auth utilities
from auth.utils import get_current_user, SubscriptionManager

# Load environment variables
load_dotenv()
API_KEY = os.getenv("COHERE_API_KEY")
if not API_KEY:
    raise ValueError("Missing COHERE_API_KEY in environment variables.")

# Initialize Cohere client
client = cohere.ClientV2(api_key=API_KEY)

# Setup router
router = APIRouter(prefix="/api/content", tags=["AI Content Generator"])

# Configure logging
logger = logging.getLogger(__name__)

# Database import (assuming you have a db setup)
from database import db

# Database collections
content_usage_collection = db["content_usage"]

# Plan-wise content generation limits
CONTENT_GENERATION_LIMITS = {
    "trial": {
        "max_generations_per_day": 10,
        "max_tokens": 500,
        "allowed_models": ["command-a-03-2025"],
        "can_generate_content": True,
        "features": [
            "✓ Generate up to 10 content pieces per day",
            "✓ Basic content generation",
            "✓ Standard quality output"
        ]
    },
    "starter": {
        "max_generations_per_day": 50,
        "max_tokens": 1000,
        "allowed_models": ["command-a-03-2025", "command-r-plus"],
        "can_generate_content": True,
        "features": [
            "✓ Generate up to 50 content pieces per day",
            "✓ Enhanced content quality",
            "✓ Multiple model options"
        ]
    },
    "pro": {
        "max_generations_per_day": 200,
        "max_tokens": 2000,
        "allowed_models": ["command-a-03-2025", "command-r-plus", "command-light"],
        "can_generate_content": True,
        "features": [
            "✓ Generate up to 200 content pieces per day",
            "✓ High-quality content generation",
            "✓ All available models",
            "✓ Longer content output"
        ]
    },
    "enterprise": {
        "max_generations_per_day": 1000,
        "max_tokens": 5000,
        "allowed_models": ["command-a-03-2025", "command-r-plus", "command-light", "command-xlarge"],
        "can_generate_content": True,
        "features": [
            "✓ Generate up to 1000 content pieces per day",
            "✓ Ultra-long content generation",
            "✓ All models including premium",
            "✓ Custom model training options"
        ]
    }
}

class ContentGenerationManager:
    
    @staticmethod
    def get_content_generation_limits(subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get content generation limits based on subscription plan"""
        plan_key = subscription_data.get("plan", "trial")
        
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
        return CONTENT_GENERATION_LIMITS.get(benefit_key, CONTENT_GENERATION_LIMITS["trial"])
    
    @staticmethod
    async def can_generate_content(user_email: str, requested_tokens: int = 500) -> Dict[str, Any]:
        """Check if user can generate content based on their plan and usage"""
        try:
            # Get user's subscription data
            subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
            content_limits = ContentGenerationManager.get_content_generation_limits(subscription_data)
            
            # Check if content generation is allowed
            if not content_limits["can_generate_content"]:
                return {
                    "can_generate": False,
                    "reason": "Content generation not available for your plan",
                    "upgrade_required": True,
                    "upgrade_url": "/plans"
                }
            
            # Check daily usage
            today = datetime.utcnow().date()
            daily_usage = await ContentGenerationManager.get_today_content_usage(user_email, today)
            
            remaining_today = content_limits["max_generations_per_day"] - daily_usage
            
            if remaining_today <= 0:
                return {
                    "can_generate": False,
                    "reason": f"Daily content generation limit ({content_limits['max_generations_per_day']}) reached",
                    "reset_time": datetime.combine(today + timedelta(days=1), datetime.min.time()),
                    "upgrade_required": True,
                    "upgrade_url": "/plans"
                }
            
            # Check token limit
            if requested_tokens > content_limits["max_tokens"]:
                return {
                    "can_generate": False,
                    "reason": f"Max {content_limits['max_tokens']} tokens allowed for your plan",
                    "requested_tokens": requested_tokens,
                    "allowed_tokens": content_limits["max_tokens"],
                    "upgrade_required": True,
                    "upgrade_url": "/plans"
                }
            
            # Check if user has reached today's limit
            if remaining_today < 1:
                return {
                    "can_generate": False,
                    "reason": "Daily limit reached",
                    "remaining_today": 0,
                    "max_per_day": content_limits["max_generations_per_day"]
                }
            
            return {
                "can_generate": True,
                "remaining_today": remaining_today,
                "max_per_day": content_limits["max_generations_per_day"],
                "max_tokens": content_limits["max_tokens"],
                "allowed_models": content_limits["allowed_models"]
            }
            
        except Exception as e:
            logger.error(f"Error checking content generation permissions: {str(e)}")
            return {
                "can_generate": False,
                "reason": "Error checking permissions",
                "error": str(e)
            }
    
    @staticmethod
    async def get_today_content_usage(user_email: str, date: datetime.date) -> int:
        """Get today's content generation usage count"""
        try:
            # Get usage for the specific date
            usage = content_usage_collection.find_one({
                "user_email": user_email,
                "date": date.isoformat()
            })
            
            if usage:
                return usage.get("count", 0)
            else:
                # Check if we have aggregated data in user collection
                user = db["users"].find_one({"email": user_email})
                if user and "content_generation_usage" in user:
                    for usage_entry in user["content_generation_usage"]:
                        if usage_entry.get("date") == date.isoformat():
                            return usage_entry.get("count", 0)
            
            return 0
        except Exception as e:
            logger.error(f"Error getting content usage: {str(e)}")
            return 0
    
    @staticmethod
    async def record_content_generation(user_email: str, prompt: str, tokens_used: int, model_used: str):
        """Record content generation usage"""
        try:
            today = datetime.utcnow().date()
            today_str = today.isoformat()
            
            # Create or update daily usage
            usage_doc = {
                "user_email": user_email,
                "date": today_str,
                "timestamp": datetime.utcnow(),
                "prompt": prompt[:500],  # Store first 500 chars
                "tokens_used": tokens_used,
                "model_used": model_used
            }
            
            # Store detailed usage
            db["content_generation_logs"].insert_one(usage_doc)
            
            # Update daily count using atomic operation
            result = content_usage_collection.update_one(
                {
                    "user_email": user_email,
                    "date": today_str
                },
                {
                    "$inc": {"count": 1, "total_tokens": tokens_used},
                    "$setOnInsert": {
                        "created_at": datetime.utcnow(),
                        "last_updated": datetime.utcnow()
                    },
                    "$set": {
                        "last_used": datetime.utcnow(),
                        "last_model": model_used
                    }
                },
                upsert=True
            )
            
            # Also update user's aggregated data
            db["users"].update_one(
                {"email": user_email},
                {
                    "$push": {
                        "content_generation_usage": {
                            "date": today_str,
                            "count": 1,
                            "tokens": tokens_used,
                            "timestamp": datetime.utcnow()
                        }
                    },
                    "$set": {
                        "last_content_generation": datetime.utcnow(),
                        "total_content_generations": db["users"].find_one({"email": user_email}).get("total_content_generations", 0) + 1
                    }
                }
            )
            
            logger.info(f"Recorded content generation for {user_email}: {tokens_used} tokens")
            
        except Exception as e:
            logger.error(f"Error recording content generation: {str(e)}")
    
    @staticmethod
    async def get_user_content_stats(user_email: str) -> Dict[str, Any]:
        """Get user's content generation statistics"""
        try:
            # Get today's usage
            today = datetime.utcnow().date()
            today_usage = await ContentGenerationManager.get_today_content_usage(user_email, today)
            
            # Get last 7 days usage
            seven_days_ago = (datetime.utcnow() - timedelta(days=7)).date()
            
            # FIXED: Remove async for, use list comprehension
            weekly_usage_cursor = content_usage_collection.find({
                "user_email": user_email,
                "date": {"$gte": seven_days_ago.isoformat()}
            }).sort("date", -1)
            
            weekly_usage = list(weekly_usage_cursor)
            
            # Get subscription limits
            subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
            content_limits = ContentGenerationManager.get_content_generation_limits(subscription_data)
            
            # FIXED: Aggregate total usage without async for
            pipeline = [
                {"$match": {"user_email": user_email}},
                {"$group": {"_id": None, "total": {"$sum": "$count"}}}
            ]
            
            total_usage_result = list(content_usage_collection.aggregate(pipeline))
            total_count = total_usage_result[0]["total"] if total_usage_result else 0
            
            return {
                "today_usage": today_usage,
                "daily_limit": content_limits["max_generations_per_day"],
                "remaining_today": max(0, content_limits["max_generations_per_day"] - today_usage),
                "weekly_usage": [
                    {
                        "date": entry["date"],
                        "count": entry["count"],
                        "tokens": entry.get("total_tokens", 0)
                    }
                    for entry in weekly_usage
                ],
                "total_generations": total_count,
                "max_tokens": content_limits["max_tokens"],
                "allowed_models": content_limits["allowed_models"],
                "plan_name": subscription_data.get("plan_name", "Free Trial")
            }
            
        except Exception as e:
            logger.error(f"Error getting content stats: {str(e)}")
            return {
                "today_usage": 0,
                "daily_limit": 10,
                "remaining_today": 10,
                "weekly_usage": [],
                "total_generations": 0,
                "max_tokens": 500,
                "allowed_models": ["command-a-03-2025"],
                "plan_name": "Free Trial"
            }

def generate_content(prompt: str, model: str = "command-a-03-2025", max_tokens: int = 800) -> str:
    """
    Improved content generator for long, structured, professional outputs.
    Automatically formats content with headings, paragraphs, and bullet points.
    """

    system_msg = {
        "role": "system",
        "content": """
You are a professional content writer.

Your output MUST follow these rules:
- Write in a clear, polished, executive-level tone.
- Produce long-form content with proper structure.
- Include headings (H2/H3 style), paragraphs, and bullet points.
- Ensure readability, clarity, and value.
- Avoid filler and repetition.
""".strip()
    }

    user_msg = {
        "role": "user",
        "content": f"Write a detailed and professional content for the following request:\n\n{prompt}"
    }

    try:
        response = client.chat(
            model=model,
            messages=[system_msg, user_msg],
            temperature=0.7,
            max_tokens=max_tokens
        )

        text = response.message.content[0].text.strip()

        # Auto-enhance: If response is too short, retry with more tokens
        if len(text) < 80:
            retry = client.chat(
                model=model,
                messages=[system_msg, user_msg],
                temperature=0.6,
                max_tokens=max_tokens + 300
            )
            text = retry.message.content[0].text.strip()

        return text

    except Exception as e:
        logger.error(f"Cohere API error: {e}")
        raise HTTPException(status_code=500, detail=f"Content generation error: {e}")


@router.get("/")
def status():
    return {"message": "Content generator router active"}

@router.get("/limits")
async def get_content_limits(user: Dict = Depends(get_current_user)):
    """Get user's content generation limits and current usage"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="User email not found")
        
        stats = await ContentGenerationManager.get_user_content_stats(user_email)
        
        # Get subscription data for limits
        subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
        content_limits = ContentGenerationManager.get_content_generation_limits(subscription_data)
        
        # Check if user can generate content
        can_generate = content_limits["can_generate_content"] and subscription_data.get("is_active", False)
        
        # Check if upgrade is required
        upgrade_required = (
            not subscription_data.get("is_active", False) or
            (subscription_data.get("type") == "trial" and subscription_data.get("trial_remaining_days", 0) <= 0) or
            (stats.get("today_usage", 0) >= content_limits["max_generations_per_day"])
        )
        
        return {
            "success": True,
            "user_email": user_email,
            "plan": subscription_data.get("plan_name", "Free Trial"),
            "plan_key": subscription_data.get("plan", "trial"),
            "plan_type": subscription_data.get("type", "trial"),
            "limits": content_limits,
            "usage_stats": stats,
            "can_generate": can_generate,
            "upgrade_required": upgrade_required,
            "subscription_data": {
                "is_active": subscription_data.get("is_active", False),
                "is_trial": subscription_data.get("is_trial", True),
                "remaining_days": subscription_data.get("remaining_days", 0),
                "trial_remaining_days": subscription_data.get("trial_remaining_days", 15)
            }
        }
    except Exception as e:
        logger.error(f"Error getting content limits: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting content limits: {str(e)}")

@router.post("/generate")
async def generate_endpoint(request: Request, data: dict, user: Dict = Depends(get_current_user)):
    """Generate content with plan-based limits"""
    try:
        prompt = data.get("prompt")
        model = data.get("model", "command-a-03-2025")
        max_tokens = int(data.get("max_tokens", 500))
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")
        
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="User email not found")
        
        # Check if user can generate content
        permission_check = await ContentGenerationManager.can_generate_content(user_email, max_tokens)
        
        if not permission_check.get("can_generate", False):
            raise HTTPException(
                status_code=403,
                detail={
                    "message": permission_check.get("reason", "Content generation not allowed"),
                    "upgrade_required": permission_check.get("upgrade_required", False),
                    "upgrade_url": permission_check.get("upgrade_url", "/plans"),
                    "remaining_today": permission_check.get("remaining_today", 0),
                    "max_per_day": permission_check.get("max_per_day", 10)
                }
            )
        
        # Check if model is allowed for user's plan
        subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
        content_limits = ContentGenerationManager.get_content_generation_limits(subscription_data)
        
        if model not in content_limits["allowed_models"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": f"Model '{model}' not available for your plan",
                    "allowed_models": content_limits["allowed_models"],
                    "upgrade_required": True
                }
            )
        
        # Check token limit
        if max_tokens > content_limits["max_tokens"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": f"Max {content_limits['max_tokens']} tokens allowed for your plan",
                    "requested_tokens": max_tokens,
                    "allowed_tokens": content_limits["max_tokens"],
                    "upgrade_required": True
                }
            )
        
        # Generate content
        generated = generate_content(prompt, model, max_tokens)
        
        # Record usage
        await ContentGenerationManager.record_content_generation(
            user_email=user_email,
            prompt=prompt,
            tokens_used=max_tokens,
            model_used=model
        )
        
        # Get updated usage stats
        updated_stats = await ContentGenerationManager.get_user_content_stats(user_email)
        
        return {
            "success": True,
            "generated_text": generated,
            "usage": {
                "tokens_used": max_tokens,
                "model_used": model,
                "remaining_today": updated_stats["remaining_today"],
                "daily_limit": updated_stats["daily_limit"]
            },
            "plan_info": {
                "plan_name": subscription_data.get("plan_name", "Free Trial"),
                "type": subscription_data.get("type", "trial"),
                "remaining_days": subscription_data.get("remaining_days", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Content generation error: {str(e)}")

# In your FastAPI routes for content generator

@router.get("/stats")
async def get_user_stats(user: Dict = Depends(get_current_user)):
    """Get user's content generation statistics"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="User email not found")
        
        stats = await ContentGenerationManager.get_user_content_stats(user_email)
        
        # Get subscription info
        subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
        
        return {
            "success": True,
            "user_email": user_email,
            "stats": stats,
            "subscription": {
                "plan": subscription_data.get("plan_name", "Free Trial"),
                "type": subscription_data.get("type", "trial"),
                "is_active": subscription_data.get("is_active", False),
                "remaining_days": subscription_data.get("remaining_days", 0),
                "trial_remaining_days": subscription_data.get("trial_remaining_days", 0),
                "current_period_end": subscription_data.get("current_period_end")
            }
        }
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting user stats: {str(e)}")

@router.post("/reset-usage")
async def reset_usage(user: Dict = Depends(get_current_user)):
    """Reset user's content usage (admin only or for testing)"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="User email not found")
        
        # Check if user is admin (you should implement proper admin check)
        # For now, this is just a placeholder
        if not user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Reset today's usage
        today = datetime.utcnow().date()
        today_str = today.isoformat()
        
        content_usage_collection.delete_one({
            "user_email": user_email,
            "date": today_str
        })
        
        logger.info(f"Reset content usage for {user_email}")
        
        return {
            "success": True,
            "message": "Content usage reset successfully",
            "user_email": user_email,
            "date": today_str
        }
    except Exception as e:
        logger.error(f"Error resetting usage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error resetting usage: {str(e)}")



@router.get("/limits")
async def get_content_limits(user: Dict = Depends(get_current_user)):
    """Get user's content generation limits and current usage"""
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="User email not found")
        
        # Get today's usage
        stats = await ContentGenerationManager.get_user_content_stats(user_email)
        
        # Get subscription data
        subscription_data = await SubscriptionManager.get_user_subscription_status(user_email)
        content_limits = ContentGenerationManager.get_content_generation_limits(subscription_data)
        
        # Check if user can generate content
        can_generate = content_limits["can_generate_content"] and subscription_data.get("is_active", False)
        
        return {
            "success": True,
            "user_email": user_email,
            "plan": subscription_data.get("plan_name", "Free Trial"),
            "plan_key": subscription_data.get("plan", "trial"),
            "plan_type": subscription_data.get("type", "trial"),
            "limits": content_limits,
            "usage_stats": {
                "today_usage": stats.get("today_usage", 0),
                "remaining_today": stats.get("remaining_today", 10),
                "daily_limit": stats.get("daily_limit", 10),
                "max_analyses_per_day": content_limits.get("max_generations_per_day", 10)
            },
            "can_analyze": can_generate,
            "subscription_data": {
                "is_active": subscription_data.get("is_active", False),
                "is_trial": subscription_data.get("is_trial", True),
                "remaining_days": subscription_data.get("remaining_days", 0),
                "trial_remaining_days": subscription_data.get("trial_remaining_days", 15)
            }
        }
    except Exception as e:
        logger.error(f"Error getting content limits: {str(e)}")
        # Return default values for trial users
        return {
            "success": True,
            "plan": "Free Trial",
            "plan_key": "trial",
            "plan_type": "trial",
            "limits": {
                "max_generations_per_day": 10,
                "max_tokens": 500,
                "can_generate_content": True
            },
            "usage_stats": {
                "today_usage": 0,
                "remaining_today": 10,
                "daily_limit": 10,
                "max_analyses_per_day": 10
            },
            "can_analyze": True,
            "subscription_data": {
                "is_active": True,
                "is_trial": True,
                "trial_remaining_days": 15
            }
        }
        
# Export for use in other modules
__all__ = [
    'ContentGenerationManager',
    'generate_content',
    'router'
]