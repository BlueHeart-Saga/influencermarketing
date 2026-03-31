# backend/routes/contentcreator.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Dict, Any
from datetime import datetime, timedelta
import os
import logging
import json
import time
from bson import ObjectId

from database import db
from auth.utils import get_current_user
from auth.routes import SubscriptionService  # Import your subscription service

# Import the notification services if needed for usage alerts
# from routes.brandnotification import brand_notification_service
# from routes.influencernotification import influencer_notification_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI Content Creator"])

# ------------------------------------------------
# Configuration
# ------------------------------------------------
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize API clients
cohere_client = None
openai_client = None

if COHERE_API_KEY:
    try:
        import cohere
        cohere_client = cohere.Client(COHERE_API_KEY)
        logger.info("Cohere client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Cohere client: {str(e)}")

if OPENAI_API_KEY:
    try:
        import openai
        openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
        logger.info("OpenAI client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {str(e)}")

# Database collections
ai_usage_collection = db["ai_content_usage"]
users_collection = db["users"]

# Plan configuration with AI limits
PLAN_CONFIG = {
    "free": {
        "name": "Free",
        "daily_limit": 0,  # No AI access
        "monthly_limit": 0,
        "features": ["Basic account features"],
        "can_use_ai": False,
        "providers": [],
        "priority": "low"
    },
    "free_trial": {
        "name": "Free Trial",
        "daily_limit": 10,
        "monthly_limit": 100,
        "features": [
            "✓ 10 AI generations per day",
            "✓ 100 generations per month",
            "✓ Text analysis",
            "✓ Basic content types",
            "✓ Cohere AI"
        ],
        "can_use_ai": True,
        "providers": ["cohere"],
        "priority": "medium"
    },
    "starter": {
        "name": "Starter",
        "daily_limit": 50,
        "monthly_limit": 500,
        "features": [
            "✓ 50 AI generations per day",
            "✓ 500 generations per month",
            "✓ Advanced text analysis",
            "✓ All content types",
            "✓ Cohere & OpenAI",
            "✓ Priority processing"
        ],
        "can_use_ai": True,
        "providers": ["cohere", "openai"],
        "priority": "medium"
    },
    "pro": {
        "name": "Pro",
        "daily_limit": 200,
        "monthly_limit": 2000,
        "features": [
            "✓ 200 AI generations per day",
            "✓ 2000 generations per month",
            "✓ Premium text analysis",
            "✓ All content types",
            "✓ Cohere & OpenAI",
            "✓ Priority processing",
            "✓ API access"
        ],
        "can_use_ai": True,
        "providers": ["cohere", "openai"],
        "priority": "high"
    },
    "enterprise": {
        "name": "Enterprise",
        "daily_limit": 1000,
        "monthly_limit": 10000,
        "features": [
            "✓ 1000 AI generations per day",
            "✓ 10,000 generations per month",
            "✓ Enterprise text analysis",
            "✓ All content types + custom",
            "✓ All AI providers",
            "✓ Highest priority",
            "✓ Full API access",
            "✓ Dedicated support"
        ],
        "can_use_ai": True,
        "providers": ["cohere", "openai"],
        "priority": "highest"
    }
}

# ------------------------------------------------
# Request Models
# ------------------------------------------------
class ContentRequest(BaseModel):
    text: str
    mode: Literal["caption", "adcopy", "hashtag", "blog", "email", "product", "seo", "social", "summary"] = "caption"
    provider: Optional[Literal["cohere", "openai"]] = "cohere"
    tone: Optional[str] = "professional"
    language: Optional[str] = "english"
    options: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AnalyzeTextRequest(BaseModel):
    text: str
    provider: Optional[Literal["cohere", "openai"]] = "cohere"

class BatchGenerateRequest(BaseModel):
    prompts: List[str]
    mode: str = "caption"
    provider: Optional[Literal["cohere", "openai"]] = "cohere"

class CustomPromptRequest(BaseModel):
    prompt: str
    provider: Optional[Literal["cohere", "openai"]] = "cohere"
    max_tokens: Optional[int] = Field(500, ge=50, le=4000)
    temperature: Optional[float] = Field(0.7, ge=0.0, le=1.0)

# ------------------------------------------------
# Subscription & Usage Management
# ------------------------------------------------
class SubscriptionManager:
    
    @staticmethod
    async def get_user_subscription_plan(user_email: str) -> Dict[str, Any]:
        """Get user's subscription plan details"""
        try:
            # Get subscription status from your SubscriptionService
            subscription_status = await SubscriptionService.get_user_subscription_status(user_email)
            
            # Map subscription type to plan configuration
            subscription_type = subscription_status.get("type", "free")
            plan_name = subscription_status.get("plan", "free")
            
            # Get base plan config
            if subscription_type == "trial":
                plan_key = "free_trial"
            elif subscription_type == "paid":
                plan_key = plan_name.lower().split("_")[0]  # Extract base plan name
            else:
                plan_key = "free"
            
            # Get plan config
            plan_config = PLAN_CONFIG.get(plan_key, PLAN_CONFIG["free"])
            
            return {
                "subscription_status": subscription_status,
                "plan_key": plan_key,
                "plan_config": plan_config,
                "can_use_ai": plan_config["can_use_ai"],
                "daily_limit": plan_config["daily_limit"],
                "monthly_limit": plan_config["monthly_limit"],
                "providers": plan_config["providers"]
            }
            
        except Exception as e:
            logger.error(f"Error getting user subscription plan: {str(e)}")
            return {
                "subscription_status": {"type": "free", "plan": "free"},
                "plan_key": "free",
                "plan_config": PLAN_CONFIG["free"],
                "can_use_ai": False,
                "daily_limit": 0,
                "monthly_limit": 0,
                "providers": []
            }

class UsageTracker:
    
    @staticmethod
    async def check_usage_limits(user_email: str, plan_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check if user can generate content based on usage limits"""
        try:
            user_id = await UsageTracker.get_user_id_by_email(user_email)
            today = datetime.utcnow().date()
            current_month = today.strftime("%Y-%m")
            
            # Get today's usage
            today_usage = await UsageTracker.get_usage_period(user_email, "daily", today.isoformat())
            
            # Get monthly usage
            monthly_usage = await UsageTracker.get_usage_period(user_email, "monthly", current_month)
            
            daily_limit = plan_config.get("daily_limit", 0)
            monthly_limit = plan_config.get("monthly_limit", 0)
            
            remaining_daily = max(0, daily_limit - today_usage)
            remaining_monthly = max(0, monthly_limit - monthly_usage)
            
            can_generate = (
                plan_config["can_use_ai"] and 
                today_usage < daily_limit and 
                monthly_usage < monthly_limit
            )
            
            return {
                "can_generate": can_generate,
                "today_usage": today_usage,
                "monthly_usage": monthly_usage,
                "daily_limit": daily_limit,
                "monthly_limit": monthly_limit,
                "remaining_daily": remaining_daily,
                "remaining_monthly": remaining_monthly,
                "user_id": user_id
            }
            
        except Exception as e:
            logger.error(f"Error checking usage limits: {str(e)}")
            return {
                "can_generate": False,
                "today_usage": 0,
                "monthly_usage": 0,
                "daily_limit": 0,
                "monthly_limit": 0,
                "remaining_daily": 0,
                "remaining_monthly": 0,
                "user_id": None
            }
    
    @staticmethod
    async def get_user_id_by_email(user_email: str) -> Optional[str]:
        """Get user ID from email"""
        try:
            user = users_collection.find_one({"email": user_email}, {"_id": 1})
            return str(user["_id"]) if user else None
        except Exception as e:
            logger.error(f"Error getting user ID: {str(e)}")
            return None
    
    @staticmethod
    async def get_usage_period(user_email: str, period_type: str, period_key: str) -> int:
        """Get usage for a specific period"""
        try:
            usage_record = ai_usage_collection.find_one({
                "user_email": user_email,
                "period_type": period_type,
                "period_key": period_key
            })
            
            if usage_record:
                return usage_record.get("count", 0)
            return 0
        except Exception as e:
            logger.error(f"Error getting usage: {str(e)}")
            return 0
    
    @staticmethod
    async def record_usage(
        user_email: str, 
        user_id: str,
        content_type: str,
        provider: str,
        tokens_used: int = 0,
        character_count: int = 0
    ):
        """Record content generation usage"""
        try:
            today = datetime.utcnow().date().isoformat()
            current_month = datetime.utcnow().strftime("%Y-%m")
            now = datetime.utcnow()
            
            # Update daily usage
            ai_usage_collection.update_one(
                {
                    "user_email": user_email,
                    "period_type": "daily",
                    "period_key": today
                },
                {
                    "$inc": {
                        "count": 1,
                        "tokens_used": tokens_used,
                        "characters_generated": character_count
                    },
                    "$push": {
                        "generations": {
                            "type": content_type,
                            "provider": provider,
                            "tokens": tokens_used,
                            "characters": character_count,
                            "timestamp": now,
                            "user_id": user_id
                        }
                    },
                    "$setOnInsert": {
                        "created_at": now,
                        "period_type": "daily",
                        "period_key": today
                    },
                    "$set": {
                        "updated_at": now,
                        "last_generation": now
                    }
                },
                upsert=True
            )
            
            # Update monthly usage
            ai_usage_collection.update_one(
                {
                    "user_email": user_email,
                    "period_type": "monthly",
                    "period_key": current_month
                },
                {
                    "$inc": {"count": 1},
                    "$setOnInsert": {
                        "created_at": now,
                        "period_type": "monthly",
                        "period_key": current_month
                    },
                    "$set": {"updated_at": now}
                },
                upsert=True
            )
            
            logger.info(f"Recorded AI usage for {user_email}: {content_type} via {provider}")
            
        except Exception as e:
            logger.error(f"Error recording usage: {str(e)}")
    
    @staticmethod
    async def check_provider_access(provider: str, allowed_providers: List[str]) -> bool:
        """Check if user can use the requested AI provider"""
        return provider in allowed_providers

# ------------------------------------------------
# AI Provider Handlers
# ------------------------------------------------
class AIProvider:
    
    @staticmethod
    async def generate_with_cohere(prompt: str, max_tokens: int = 500, temperature: float = 0.7, model: str = None) -> str:
        """Generate text using Cohere API"""
        if not cohere_client:
            raise HTTPException(status_code=503, detail="Cohere service unavailable")
        
        try:
            model_to_use = model or "command"
            
            response = cohere_client.generate(
                model=model_to_use,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                k=0,
                stop_sequences=[],
                return_likelihoods='NONE'
            )
            
            return response.generations[0].text.strip()
            
        except Exception as e:
            logger.error(f"Cohere generation error: {str(e)}")
            
            # Fallback to OpenAI if available and allowed
            if openai_client:
                logger.info("Falling back to OpenAI")
                try:
                    return await AIProvider.generate_with_openai(prompt, max_tokens, temperature)
                except Exception:
                    pass
            
            raise HTTPException(
                status_code=500, 
                detail=f"Content generation failed: {str(e)}"
            )
    
    @staticmethod
    async def generate_with_openai(prompt: str, max_tokens: int = 500, temperature: float = 0.7, model: str = "gpt-3.5-turbo") -> str:
        """Generate text using OpenAI API"""
        if not openai_client:
            raise HTTPException(status_code=503, detail="OpenAI service unavailable")
        
        try:
            response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI content creator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                n=1
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI generation error: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"OpenAI generation failed: {str(e)}"
            )
    
    @staticmethod
    async def analyze_with_cohere(text: str) -> dict:
        """Analyze text using Cohere"""
        if not cohere_client:
            raise HTTPException(status_code=503, detail="Cohere service unavailable")
        
        try:
            # Use generate for analysis with a specific prompt
            analysis_prompt = f"""
            Analyze this text and provide the following information in JSON format:
            
            Text: {text}
            
            Provide analysis with these keys:
            - language: detected language
            - sentiment: positive, negative, or neutral
            - keywords: list of 5-7 important keywords
            - tone: formal, informal, professional, casual, etc.
            - readability_score: easy, medium, difficult
            - word_count: number of words
            - character_count: number of characters
            
            Return only valid JSON, no other text.
            """
            
            response = cohere_client.generate(
                model="command",
                prompt=analysis_prompt,
                max_tokens=300,
                temperature=0.3,
                k=0,
                stop_sequences=[]
            )
            
            result_text = response.generations[0].text.strip()
            
            # Parse JSON from response
            try:
                # Find JSON in the response
                json_start = result_text.find('{')
                json_end = result_text.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = result_text[json_start:json_end]
                    result = json.loads(json_str)
                else:
                    # If no JSON found, try to parse the whole text
                    result = json.loads(result_text)
                
                # Calculate word and character counts if not provided
                if 'word_count' not in result:
                    result['word_count'] = len(text.split())
                if 'character_count' not in result:
                    result['character_count'] = len(text)
                
                return result
                
            except json.JSONDecodeError as json_err:
                logger.error(f"JSON parsing failed: {json_err}, Response: {result_text[:200]}")
                # Fallback to basic analysis
                return {
                    "language": "english",
                    "sentiment": "neutral",
                    "keywords": text.split()[:5],
                    "tone": "neutral",
                    "readability_score": "medium",
                    "word_count": len(text.split()),
                    "character_count": len(text)
                }
                
        except Exception as e:
            logger.error(f"Cohere analysis error: {str(e)}")
            # Fallback to basic analysis
            return {
                "language": "english",
                "sentiment": "neutral",
                "keywords": [],
                "tone": "neutral",
                "readability_score": "medium",
                "word_count": len(text.split()),
                "character_count": len(text)
            }
    
    @staticmethod
    async def analyze_with_openai(text: str) -> dict:
        """Analyze text using OpenAI"""
        if not openai_client:
            raise HTTPException(status_code=503, detail="OpenAI service unavailable")
        
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a text analysis assistant. Return only valid JSON."
                    },
                    {
                        "role": "user", 
                        "content": f"""
                        Analyze this text and return structured JSON:
                        
                        Text: {text}
                        
                        Return JSON with these exact keys:
                        - language (detected language)
                        - sentiment (positive, negative, or neutral)
                        - keywords (list of 5-7 important keywords)
                        - tone (formal, informal, professional, casual, etc.)
                        - readability_score (easy, medium, difficult)
                        - word_count (number of words)
                        - character_count (number of characters)
                        
                        JSON only, no other text.
                        """
                    }
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            result_text = response.choices[0].message.content.strip()
            
            try:
                result = json.loads(result_text)
                return result
            except json.JSONDecodeError:
                logger.error(f"OpenAI JSON parsing failed: {result_text[:200]}")
                return {
                    "language": "english",
                    "sentiment": "neutral",
                    "keywords": [],
                    "tone": "neutral",
                    "readability_score": "medium",
                    "word_count": len(text.split()),
                    "character_count": len(text)
                }
                
        except Exception as e:
            logger.error(f"OpenAI analysis error: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Text analysis failed: {str(e)}"
            )

# ------------------------------------------------
# Content Generation Templates
# ------------------------------------------------
class ContentTemplates:
    
    @staticmethod
    def get_prompt_template(mode: str, text: str, tone: str = "professional", language: str = "english", options: dict = None) -> str:
        """Get prompt template based on content mode"""
        templates = {
            "caption": f"Create an engaging social media caption about: {text}. Make it catchy, include relevant emojis and hashtags. Tone: {tone}. Language: {language}.",
            
            "adcopy": f"Write persuasive advertising copy for: {text}. Create a compelling headline, persuasive body copy, and strong call-to-action. Tone: {tone}. Language: {language}.",
            
            "hashtag": f"Generate 15-20 relevant hashtags for: {text}. Include a mix of popular and niche hashtags. Tone: {tone}. Language: {language}.",
            
            "blog": f"Create a comprehensive blog post outline about: {text}. Include 5 creative titles and a detailed outline with main points. Tone: {tone}. Language: {language}.",
            
            "email": f"Write a professional email about: {text}. Include subject line, greeting, body, and closing. Tone: {tone}. Language: {language}.",
            
            "product": f"Create product description for: {text}. Write compelling title, feature list, and benefit-focused description. Tone: {tone}. Language: {language}.",
            
            "seo": f"Create SEO-optimized content for: {text}. Generate title options, meta description, and relevant keywords. Tone: {tone}. Language: {language}.",
            
            "social": f"Create social media content for: {text}. Generate 3 different post variations for different platforms. Tone: {tone}. Language: {language}.",
            
            "summary": f"Summarize the following text: {text}. Create a concise 3-5 sentence summary. Tone: {tone}. Language: {language}."
        }
        
        base_prompt = templates.get(mode, f"Generate content about: {text} in {tone} tone in {language} language.")
        
        # Add custom options if provided
        if options:
            custom_instructions = ""
            if options.get("target_audience"):
                custom_instructions += f" Target audience: {options['target_audience']}."
            if options.get("platform"):
                custom_instructions += f" For platform: {options['platform']}."
            if options.get("length"):
                custom_instructions += f" Length: {options['length']}."
            
            if custom_instructions:
                base_prompt += custom_instructions
        
        return base_prompt

# ------------------------------------------------
# Main Routes
# ------------------------------------------------
@router.post("/generate")
async def generate_content(
    data: ContentRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Generate AI content with subscription and usage restrictions
    """
    user_email = user["email"]
    user_role = user["role"]
    
    # Only brand and influencer roles can use AI content generation
    if user_role not in ["brand", "influencer"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "AI content generation is only available for brand and influencer accounts",
                "code": "ROLE_NOT_ALLOWED"
            }
        )
    
    # Get subscription plan
    subscription_info = await SubscriptionManager.get_user_subscription_plan(user_email)
    plan_config = subscription_info["plan_config"]
    
    # Check if AI features are allowed for this plan
    if not plan_config["can_use_ai"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": f"AI content generation is not available for {plan_config['name']} plan",
                "upgrade_required": True,
                "current_plan": plan_config["name"],
                "code": "PLAN_NOT_ALLOWED"
            }
        )
    
    # Check provider access
    if not await UsageTracker.check_provider_access(data.provider, plan_config["providers"]):
        raise HTTPException(
            status_code=403,
            detail={
                "message": f"{data.provider.upper()} provider is not available for your plan",
                "available_providers": plan_config["providers"],
                "code": "PROVIDER_NOT_ALLOWED"
            }
        )
    
    # Check usage limits
    usage_check = await UsageTracker.check_usage_limits(user_email, plan_config)
    
    if not usage_check["can_generate"]:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Daily or monthly usage limit reached",
                "today_usage": usage_check["today_usage"],
                "daily_limit": usage_check["daily_limit"],
                "monthly_usage": usage_check["monthly_usage"],
                "monthly_limit": usage_check["monthly_limit"],
                "reset_time": {
                    "daily": datetime.combine(
                        datetime.utcnow().date() + timedelta(days=1), 
                        datetime.min.time()
                    ).isoformat(),
                    "monthly": (
                        datetime.utcnow().replace(day=1) + timedelta(days=32)
                    ).replace(day=1).isoformat()
                },
                "upgrade_required": True,
                "code": "USAGE_LIMIT_EXCEEDED"
            }
        )
    
    try:
        # Generate enhanced prompt
        prompt = ContentTemplates.get_prompt_template(
            data.mode,
            data.text,
            tone=data.tone,
            language=data.language,
            options=data.options
        )
        
        # Generate content based on provider
        start_time = time.time()
        
        if data.provider == "openai":
            content = await AIProvider.generate_with_openai(prompt)
        else:
            content = await AIProvider.generate_with_cohere(prompt)
        
        generation_time = time.time() - start_time
        
        # Record usage
        await UsageTracker.record_usage(
            user_email=user_email,
            user_id=usage_check["user_id"],
            content_type=data.mode,
            provider=data.provider,
            tokens_used=len(prompt.split()) + len(content.split()),  # Estimate
            character_count=len(content)
        )
        
        # Get updated usage
        updated_usage = await UsageTracker.check_usage_limits(user_email, plan_config)
        
        # Get subscription status
        subscription_status = subscription_info["subscription_status"]
        
        return {
            "success": True,
            "content": content,
            "metadata": {
                "mode": data.mode,
                "provider": data.provider,
                "tone": data.tone,
                "language": data.language,
                "generation_time_seconds": round(generation_time, 2),
                "character_count": len(content),
                "word_count": len(content.split())
            },
            "usage": {
                "today": {
                    "used": updated_usage["today_usage"],
                    "limit": updated_usage["daily_limit"],
                    "remaining": updated_usage["remaining_daily"]
                },
                "monthly": {
                    "used": updated_usage["monthly_usage"],
                    "limit": updated_usage["monthly_limit"],
                    "remaining": updated_usage["remaining_monthly"]
                }
            },
            "subscription": {
                "plan": plan_config["name"],
                "type": subscription_status.get("type", "free"),
                "is_trial": subscription_status.get("is_trial", False),
                "is_active": subscription_status.get("is_active", False),
                "remaining_days": subscription_status.get("remaining_days", 0),
                "current_period_end": subscription_status.get("current_period_end")
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Content generation error for {user_email}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Content generation failed",
                "error": str(e),
                "code": "GENERATION_ERROR"
            }
        )

@router.post("/analyze")
async def analyze_text(
    data: AnalyzeTextRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Analyze text with subscription restrictions
    """
    user_email = user["email"]
    user_role = user["role"]
    
    # Only brand and influencer roles can use AI features
    if user_role not in ["brand", "influencer"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Text analysis is only available for brand and influencer accounts",
                "code": "ROLE_NOT_ALLOWED"
            }
        )
    
    # Get subscription plan
    subscription_info = await SubscriptionManager.get_user_subscription_plan(user_email)
    plan_config = subscription_info["plan_config"]
    
    # Check if AI features are allowed for this plan
    if not plan_config["can_use_ai"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": f"Text analysis is not available for {plan_config['name']} plan",
                "upgrade_required": True,
                "current_plan": plan_config["name"],
                "code": "PLAN_NOT_ALLOWED"
            }
        )
    
    try:
        # Analyze text based on provider
        if data.provider == "openai":
            analysis = await AIProvider.analyze_with_openai(data.text)
        else:
            analysis = await AIProvider.analyze_with_cohere(data.text)
        
        # Get subscription status
        subscription_status = subscription_info["subscription_status"]
        
        return {
            "success": True,
            "analysis": analysis,
            "subscription": {
                "plan": plan_config["name"],
                "type": subscription_status.get("type", "free"),
                "is_trial": subscription_status.get("is_trial", False)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Text analysis error for {user_email}: {str(e)}")
        # Return basic analysis even if API fails
        return {
            "success": True,
            "analysis": {
                "language": "english",
                "sentiment": "neutral",
                "keywords": data.text.split()[:5],
                "tone": "neutral",
                "readability_score": "medium",
                "word_count": len(data.text.split()),
                "character_count": len(data.text)
            },
            "subscription": {
                "plan": plan_config["name"],
                "type": subscription_status.get("type", "free"),
                "is_trial": subscription_status.get("is_trial", False)
            },
            "note": "Basic analysis due to API error",
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/usage")
async def get_usage_stats(
    user: Dict = Depends(get_current_user)
):
    """
    Get current usage statistics
    """
    user_email = user["email"]
    
    try:
        # Get subscription plan
        subscription_info = await SubscriptionManager.get_user_subscription_plan(user_email)
        plan_config = subscription_info["plan_config"]
        
        # Get usage data
        usage_check = await UsageTracker.check_usage_limits(user_email, plan_config)
        
        # Get historical data for last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        historical = list(ai_usage_collection.find({
            "user_email": user_email,
            "period_type": "daily",
            "period_key": {"$gte": seven_days_ago.date().isoformat()}
        }).sort("period_key", 1))
        
        historical_data = []
        for record in historical:
            historical_data.append({
                "date": record["period_key"],
                "count": record.get("count", 0),
                "tokens_used": record.get("tokens_used", 0),
                "characters_generated": record.get("characters_generated", 0)
            })
        
        # Get subscription status
        subscription_status = subscription_info["subscription_status"]
        
        return {
            "usage": {
                "today": {
                    "used": usage_check["today_usage"],
                    "limit": usage_check["daily_limit"],
                    "remaining": usage_check["remaining_daily"]
                },
                "monthly": {
                    "used": usage_check["monthly_usage"],
                    "limit": usage_check["monthly_limit"],
                    "remaining": usage_check["remaining_monthly"]
                }
            },
            "subscription": {
                "plan": plan_config["name"],
                "type": subscription_status.get("type", "free"),
                "is_trial": subscription_status.get("is_trial", False),
                "is_active": subscription_status.get("is_active", False),
                "remaining_days": subscription_status.get("remaining_days", 0),
                "features": plan_config["features"],
                "providers": plan_config["providers"],
                "can_use_ai": plan_config["can_use_ai"]
            },
            "historical": historical_data,
            "limits": {
                "daily": usage_check["daily_limit"],
                "monthly": usage_check["monthly_limit"]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting usage stats for {user_email}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to get usage statistics",
                "error": str(e)
            }
        )

@router.get("/plans")
async def get_plans_info():
    """
    Get information about all available plans
    """
    try:
        plans = []
        for plan_key, config in PLAN_CONFIG.items():
            if plan_key != "free":  # Don't show free plan as an option
                plans.append({
                    "key": plan_key,
                    "name": config["name"],
                    "daily_limit": config["daily_limit"],
                    "monthly_limit": config["monthly_limit"],
                    "features": config["features"],
                    "providers": config["providers"],
                    "priority": config["priority"]
                })
        
        return {
            "plans": plans,
            "note": "Free plan users cannot access AI features"
        }
        
    except Exception as e:
        logger.error(f"Error getting plans info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to get plans information",
                "error": str(e)
            }
        )

@router.post("/custom-prompt")
async def custom_prompt(
    data: CustomPromptRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Generate content from a custom prompt with subscription restrictions
    """
    user_email = user["email"]
    user_role = user["role"]
    
    # Only brand and influencer roles can use AI features
    if user_role not in ["brand", "influencer"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Custom prompt generation is only available for brand and influencer accounts",
                "code": "ROLE_NOT_ALLOWED"
            }
        )
    
    # Get subscription plan
    subscription_info = await SubscriptionManager.get_user_subscription_plan(user_email)
    plan_config = subscription_info["plan_config"]
    
    # Check if AI features are allowed for this plan
    if not plan_config["can_use_ai"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": f"Custom prompt generation is not available for {plan_config['name']} plan",
                "upgrade_required": True,
                "current_plan": plan_config["name"],
                "code": "PLAN_NOT_ALLOWED"
            }
        )
    
    # Check provider access
    if not await UsageTracker.check_provider_access(data.provider, plan_config["providers"]):
        raise HTTPException(
            status_code=403,
            detail={
                "message": f"{data.provider.upper()} provider is not available for your plan",
                "available_providers": plan_config["providers"],
                "code": "PROVIDER_NOT_ALLOWED"
            }
        )
    
    # Check usage limits
    usage_check = await UsageTracker.check_usage_limits(user_email, plan_config)
    
    if not usage_check["can_generate"]:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Daily or monthly usage limit reached",
                "today_usage": usage_check["today_usage"],
                "daily_limit": usage_check["daily_limit"],
                "monthly_usage": usage_check["monthly_usage"],
                "monthly_limit": usage_check["monthly_limit"],
                "upgrade_required": True,
                "code": "USAGE_LIMIT_EXCEEDED"
            }
        )
    
    try:
        # Generate content based on provider
        start_time = time.time()
        
        if data.provider == "openai":
            content = await AIProvider.generate_with_openai(
                data.prompt, 
                data.max_tokens, 
                data.temperature
            )
        else:
            content = await AIProvider.generate_with_cohere(
                data.prompt, 
                data.max_tokens, 
                data.temperature
            )
        
        generation_time = time.time() - start_time
        
        # Record usage
        await UsageTracker.record_usage(
            user_email=user_email,
            user_id=usage_check["user_id"],
            content_type="custom_prompt",
            provider=data.provider,
            tokens_used=data.max_tokens,
            character_count=len(content)
        )
        
        # Get updated usage
        updated_usage = await UsageTracker.check_usage_limits(user_email, plan_config)
        
        return {
            "success": True,
            "content": content,
            "metadata": {
                "provider": data.provider,
                "max_tokens": data.max_tokens,
                "temperature": data.temperature,
                "generation_time_seconds": round(generation_time, 2),
                "character_count": len(content)
            },
            "usage": {
                "today": {
                    "used": updated_usage["today_usage"],
                    "limit": updated_usage["daily_limit"],
                    "remaining": updated_usage["remaining_daily"]
                },
                "monthly": {
                    "used": updated_usage["monthly_usage"],
                    "limit": updated_usage["monthly_limit"],
                    "remaining": updated_usage["remaining_monthly"]
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Custom prompt error for {user_email}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Custom prompt generation failed",
                "error": str(e),
                "code": "GENERATION_ERROR"
            }
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    providers_status = {
        "cohere": cohere_client is not None,
        "openai": openai_client is not None
    }
    
    return {
        "status": "healthy" if any(providers_status.values()) else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "providers": providers_status,
        "plans_configured": len(PLAN_CONFIG)
    }

# Admin endpoint for resetting usage (for testing/demo purposes)
@router.post("/admin/reset-usage")
async def admin_reset_usage(
    user_email: str,
    admin_user: Dict = Depends(get_current_user)
):
    """
    Reset usage for a user (admin only)
    """
    # Check if admin (you can add admin role check here)
    if admin_user["role"] not in ["admin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    
    try:
        # Delete all usage records for the user
        result = ai_usage_collection.delete_many({"user_email": user_email})
        
        return {
            "success": True,
            "message": f"Reset usage for {user_email}",
            "deleted_count": result.deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error resetting usage for {user_email}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset usage: {str(e)}"
        )