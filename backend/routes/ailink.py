from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks
from pydantic import BaseModel
import os
import cohere
from dotenv import load_dotenv
import re
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from auth.utils import get_subscription_benefits, get_current_user
from database import users_collection
from bson import ObjectId
import logging
from typing import Optional, List
from fastapi.responses import JSONResponse

from routes.ImageGenerate import MultipleImagePrompt, generate_multiple_images


load_dotenv()

router = APIRouter()

# Get API key from .env file
API_KEY = os.getenv("COHERE_API_KEY")
if not API_KEY:
    raise Exception("❌ COHERE_API_KEY not found in .env file")

# Initialize Cohere client
client = cohere.ClientV2(api_key=API_KEY)

class ProductAnalysisRequest(BaseModel):
    product_link: str

class ProductAnalysisResponse(BaseModel):
    title: str
    description: str
    requirements: str
    category: str
    budget: str
  
# -------------------- CONFIGURATION --------------------
SMTP_CONFIG = {
    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.getenv("SMTP_PORT", 587)),
    "username": os.getenv("SMTP_USERNAME", ""),
    "password": os.getenv("SMTP_PASSWORD", ""),
    "from_email": os.getenv("FROM_EMAIL", "noreply@influencerplatform.com")
}
logger = logging.getLogger("ai_email_service")  

# -------------------- ENHANCED EMAIL SERVICE --------------------
class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str, attachments: List[dict] = None):
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_CONFIG["from_email"]
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(body, 'html'))

            if attachments:
                for attachment in attachments:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment['content'])
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename={attachment["filename"]}'
                    )
                    msg.attach(part)

            server = smtplib.SMTP(SMTP_CONFIG["host"], SMTP_CONFIG["port"])
            server.starttls()
            server.login(SMTP_CONFIG["username"], SMTP_CONFIG["password"])
            server.send_message(msg)
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False

    @staticmethod
    def send_ai_limit_notification(user_email: str, username: str, plan_name: str, limit_reason: str, usage: dict):
        """Send notification when user reaches AI usage limits"""
        subject = f"AI Usage Limit Reached - {plan_name}"
        
        body = f"""
        <html>
            <body>
                <h2>AI Usage Limit Reached</h2>
                <p>Hello {username},</p>
                
                <p>You've reached the AI analysis limit for your <strong>{plan_name}</strong> plan.</p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-top: 0;">Usage Details</h4>
                    <p><strong>Reason:</strong> {limit_reason}</p>
                    <p><strong>Today's AI Usage:</strong> {usage.get('today_ai_usage', 0)} analyses</p>
                    <p><strong>Daily Limit:</strong> {usage.get('ai_limit', 0)} analyses</p>
                </div>
                
                <h3>Upgrade Your Plan</h3>
                <p>To get more AI analyses and access advanced features, consider upgrading your plan:</p>
                <ul>
                    <li><strong>Starter:</strong> 50 AI analyses per day</li>
                    <li><strong>Professional:</strong> 200 AI analyses per day</li>
                    <li><strong>Enterprise:</strong> Unlimited AI analyses</li>
                </ul>
                
                <p>Upgrade now to continue using our AI-powered campaign generation!</p>
                
                <br>
                <p>Best regards,<br>Influencer Platform Team</p>
            </body>
        </html>
        """
        
        return EmailService.send_email(user_email, subject, body)

    @staticmethod
    def send_ai_analysis_success(user_email: str, username: str, product_link: str, quota_info: dict):
        """Send notification for successful AI analysis"""
        subject = "AI Analysis Completed Successfully"
        
        # Build quota information
        quota_html = f"""
        <p><strong>AI Analyses Used Today:</strong> {quota_info['usage']['today_used']} / {quota_info['limits']['max_ai_usage_per_day']}</p>
        <p><strong>Remaining Today:</strong> {quota_info['remaining']['daily']}</p>
        <div style="background: linear-gradient(90deg, #4CAF50 {quota_info['usage']['daily_usage_percent']}%, #f0f0f0 {quota_info['usage']['daily_usage_percent']}%); 
                    height: 10px; border-radius: 5px; margin: 5px 0;"></div>
        """
        
        body = f"""
        <html>
            <body>
                <h2>✅ AI Analysis Complete!</h2>
                <p>Hello {username},</p>
                
                <p>Your AI analysis for <strong>{product_link}</strong> has been completed successfully.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3 style="color: #4CAF50; margin-top: 0;">📊 Your AI Usage</h3>
                    <p><strong>Plan:</strong> {quota_info['plan']['name']}</p>
                    {quota_html}
                </div>
                
                <p>The generated campaign details are now available in your dashboard.</p>
                
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4 style="color: #1976D2; margin-top: 0;">💡 Next Steps</h4>
                    <ul>
                        <li>Review the generated campaign details</li>
                        <li>Customize the campaign as needed</li>
                        <li>Publish the campaign to attract influencers</li>
                    </ul>
                </div>
                
                <br>
                <p>Best regards,<br>Influencer Platform Team</p>
            </body>
        </html>
        """
        
        return EmailService.send_email(user_email, subject, body)


# -------------------- AI USAGE HELPER FUNCTIONS --------------------
def get_user_ai_usage(user_id: str) -> dict:
    """Get user's AI usage statistics"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user.get("ai_usage", {
        "total_used": 0,
        "today_used": 0,
        "last_used": None,
        "usage_history": [],
        "last_reset_date": None
    })

def update_user_ai_usage(user_id: str, count: int = 1) -> bool:
    """Update user's AI usage count"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    user_ai_usage = get_user_ai_usage(user_id)
    
    # Reset daily count if it's a new day
    if user_ai_usage.get("last_reset_date") != today_start.date().isoformat():
        user_ai_usage["today_used"] = 0
        user_ai_usage["last_reset_date"] = today_start.date().isoformat()
    
    update_data = {
        "ai_usage.total_used": user_ai_usage.get("total_used", 0) + count,
        "ai_usage.today_used": user_ai_usage.get("today_used", 0) + count,
        "ai_usage.last_used": datetime.utcnow(),
        "ai_usage.last_reset_date": today_start.date().isoformat()
    }
    
    # Add to usage history
    usage_record = {
        "timestamp": datetime.utcnow(),
        "action": "product_analysis",
        "count": count
    }
    
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": update_data,
            "$push": {"ai_usage.usage_history": {"$each": [usage_record], "$slice": -100}}  # Keep last 100 records
        }
    )
    
    return result.modified_count > 0

def can_use_ai_feature(user_id: str, user_subscription: dict) -> dict:
    """Check if user can use AI features based on subscription"""
    plan_benefits = get_subscription_benefits(user_subscription)
    limits = plan_benefits.get("limits", {})

    # Check if AI features are allowed on this plan
    if not limits.get("can_use_ai_features", False):
        return {
            "can_use": False,
            "reason": "ai_features_not_allowed",
            "message": "Your current plan does not include AI features.",
            "error_code": "AI_FEATURES_NOT_ALLOWED"
        }

    # AI usage limit for the plan (None = unlimited)
    max_daily_ai = limits.get("max_ai_usage_per_day")

    # Unlimited AI usage
    if max_daily_ai is None:
        return {
            "can_use": True,
            "current_usage": get_user_ai_usage(user_id).get("today_used", 0),
            "limit": "Unlimited",
            "remaining": "Unlimited"
        }

    # If plan sets the limit to zero (no AI allowed)
    if max_daily_ai == 0:
        return {
            "can_use": False,
            "reason": "no_ai_usage_allowed",
            "message": "AI features are not available in your plan.",
            "error_code": "NO_AI_USAGE_ALLOWED"
        }

    # For limited plans, validate usage
    user_ai_usage = get_user_ai_usage(user_id)
    today_used = user_ai_usage.get("today_used", 0)

    if today_used >= max_daily_ai:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        reset_time = today_start + timedelta(days=1)

        return {
            "can_use": False,
            "reason": "daily_ai_limit_reached",
            "message": (
                f"You have reached your daily AI usage limit of {max_daily_ai}. "
                f"You can use AI features again after {reset_time.strftime('%Y-%m-%d %H:%M UTC')}."
            ),
            "error_code": "DAILY_AI_LIMIT_REACHED",
            "current_usage": today_used,
            "limit": max_daily_ai,
            "reset_time": reset_time
        }

    # Allowed
    return {
        "can_use": True,
        "current_usage": today_used,
        "limit": max_daily_ai,
        "remaining": max_daily_ai - today_used
    }


def get_ai_usage_quota(user_id: str, user_subscription: dict) -> dict:
    """Get detailed AI usage quota information"""
    plan_benefits = get_subscription_benefits(user_subscription)
    limits = plan_benefits.get("limits", {})

    user_ai_usage = get_user_ai_usage(user_id)
    today_used = user_ai_usage.get("today_used", 0)
    max_daily_ai = limits.get("max_ai_usage_per_day")  # can be int or None

    # Handle unlimited case
    if max_daily_ai is None:
        daily_usage_percent = 0  # no limits, so percentage not needed
        remaining_daily = "Unlimited"
        can_use = True
    else:
        # Limited plan
        daily_usage_percent = (
            min(100, round((today_used / max_daily_ai) * 100, 1)) 
            if max_daily_ai > 0 else 0
        )
        remaining_daily = max(max_daily_ai - today_used, 0)
        can_use = today_used < max_daily_ai

    return {
        "plan": {
            "name": plan_benefits["name"],
            "type": user_subscription.get("type", "trial")
        },
        "limits": {
            "max_ai_usage_per_day": max_daily_ai,
            "can_use_ai_features": limits.get("can_use_ai_features", False)
        },
        "usage": {
            "today_used": today_used,
            "total_used": user_ai_usage.get("total_used", 0),
            "daily_usage_percent": daily_usage_percent,
            "last_used": user_ai_usage.get("last_used")
        },
        "remaining": {
            "daily": remaining_daily
        },
        "can_use_ai": (
            user_subscription.get("is_active", False) and
            limits.get("can_use_ai_features", False) and
            can_use
        )
    }


def check_user_permission(current_user: dict, required_roles: List[str] = None) -> bool:
    """Check if user has permission to perform an action"""
    if required_roles and current_user["role"] not in required_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return True

# -------------------- AI ANALYSIS ENDPOINTS --------------------
@router.post("/analyze-product-link", response_model=ProductAnalysisResponse)
async def analyze_product_link(
    request: ProductAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze product link and generate campaign details with AI
    Includes subscription-based usage limits
    """
    try:
        # Check user permissions
        check_user_permission(current_user, ["brand"])
        
        # Check AI usage limits
        subscription_data = current_user.get("subscription", {})
        ai_usage_check = can_use_ai_feature(str(current_user["_id"]), subscription_data)
        
        if not ai_usage_check["can_use"]:
            # Send notification email for AI limit reached
            if current_user.get("email"):
                background_tasks.add_task(
                    EmailService.send_ai_limit_notification,
                    current_user["email"],
                    current_user["username"],
                    get_subscription_benefits(subscription_data)["name"],
                    ai_usage_check["reason"],
                    {
                        "today_ai_usage": ai_usage_check.get("current_usage", 0),
                        "ai_limit": ai_usage_check.get("limit", 0),
                        "limit_type": "daily_ai"
                    }
                )
            
            raise HTTPException(
                status_code=402,
                detail=ai_usage_check["message"],
                headers={
                    "X-AI-Limit-Reason": ai_usage_check["reason"],
                    "X-Error-Code": ai_usage_check.get("error_code", "AI_LIMIT_REACHED"),
                    "X-Current-Usage": str(ai_usage_check.get("current_usage", 0)),
                    "X-Daily-Limit": str(ai_usage_check.get("limit", 0)),
                    "X-Plan-Name": get_subscription_benefits(subscription_data)["name"]
                }
            )
        
        # Get current usage for response
        ai_quota = get_ai_usage_quota(str(current_user["_id"]), subscription_data)
        
        # Proceed with AI analysis
        prompt = f"""
        Analyze this product link and generate a comprehensive influencer marketing campaign:
        {request.product_link}
        
        Please provide the following information in EXACTLY this structured format:
        
        Title: [Creative campaign title]
        Description: [Detailed campaign description including target audience and goals with points]
        Requirements: [Clear requirements for influencers including deliverables and guidelines with bullet points to minumum 5 points]
        Category: [One category from: Fashion, Beauty, Lifestyle, Food, Travel, Fitness, Technology, Gaming, Other]
        Budget: [Recommended budget range for this campaign based on product type and market rates]
        
        Make sure each field is on its own line and starts with the field name followed by a colon.
        Make the response realistic and suitable for an influencer marketing platform.
        """

        # Cohere API call using ClientV2
        response = client.chat(
            model="command-r-plus-08-2024",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        response_text = response.message.content[0].text
        
        print("Raw AI Response:", response_text)  # Debugging

        # Improved parsing logic
        result = {}
        
        # Extract Title
        title_match = re.search(r'Title:\s*(.+?)(?=\n|$)', response_text, re.IGNORECASE)
        if title_match:
            result['Title'] = title_match.group(1).strip()
        
        # Extract Description
        desc_match = re.search(r'Description:\s*(.+?)(?=\n\w+:|$)', response_text, re.IGNORECASE | re.DOTALL)
        if desc_match:
            result['Description'] = desc_match.group(1).strip()
        
        # Extract Requirements
        req_match = re.search(r'Requirements:\s*(.+?)(?=\n\w+:|$)', response_text, re.IGNORECASE | re.DOTALL)
        if req_match:
            result['Requirements'] = req_match.group(1).strip()
        
        # Extract Category
        cat_match = re.search(r'Category:\s*(.+?)(?=\n|$)', response_text, re.IGNORECASE)
        if cat_match:
            result['Category'] = cat_match.group(1).strip()
        
        # Extract Budget
        budget_match = re.search(r'Budget:\s*(.+?)(?=\n|$)', response_text, re.IGNORECASE)
        if budget_match:
            result['Budget'] = budget_match.group(1).strip()

        print("Parsed Result:", result)  # Debugging

        # Update AI usage count
        update_user_ai_usage(str(current_user["_id"]), 1)
        
        # Get updated quota
        updated_quota = get_ai_usage_quota(str(current_user["_id"]), subscription_data)
        
        # Send success notification
        if current_user.get("email"):
            background_tasks.add_task(
                EmailService.send_ai_analysis_success,
                current_user["email"],
                current_user["username"],
                request.product_link,
                updated_quota
            )
        
        # Return response with usage information
        response_data = ProductAnalysisResponse(
            title=result.get('Title', 'Product Promotion Campaign'),
            description=result.get('Description', 'Promote this amazing product to your audience'),
            requirements=result.get('Requirements', 'Create engaging content showcasing the product'),
            category=result.get('Category', 'Other'),
            budget=result.get('Budget', '500-1000')
        )
        
        # Add usage information to response headers
        response_headers = {
            "X-AI-Usage-Count": str(updated_quota["usage"]["today_used"]),
            "X-AI-Daily-Limit": str(updated_quota["limits"]["max_ai_usage_per_day"]),
            "X-AI-Remaining": str(updated_quota["remaining"]["daily"]),
            "X-AI-Usage-Percent": str(updated_quota["usage"]["daily_usage_percent"])
        }
        
        return JSONResponse(
            content=response_data.dict(),
            headers=response_headers
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like permission/limit errors)
        raise
    except Exception as e:
        print("Error:", str(e))  # Debugging
        raise HTTPException(status_code=500, detail=f"Error analyzing product: {str(e)}")

@router.get("/ai/usage", response_model=dict)
async def get_ai_usage_endpoint(current_user: dict = Depends(get_current_user)):
    """Get current AI usage and limits"""
    check_user_permission(current_user, ["brand"])
    
    subscription_data = current_user.get("subscription", {})
    ai_quota = get_ai_usage_quota(str(current_user["_id"]), subscription_data)
    
    return ai_quota

@router.get("/ai/can-use", response_model=dict)
async def check_ai_usage_endpoint(current_user: dict = Depends(get_current_user)):
    """Check if user can use AI features right now"""
    check_user_permission(current_user, ["brand"])
    
    subscription_data = current_user.get("subscription", {})
    ai_usage_check = can_use_ai_feature(str(current_user["_id"]), subscription_data)
    
    return {
        "can_use": ai_usage_check["can_use"],
        "reason": ai_usage_check.get("reason", "within_limits"),
        "message": ai_usage_check.get("message", "You can use AI features."),
        "usage": {
            "current": ai_usage_check.get("current_usage", 0),
            "limit": ai_usage_check.get("limit", 0),
            "remaining": ai_usage_check.get("remaining", 0)
        },
        "plan": get_subscription_benefits(subscription_data)["name"]
    }

@router.get("/ai/usage-history", response_model=dict)
async def get_ai_usage_history_endpoint(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100)
):
    """Get AI usage history"""
    check_user_permission(current_user, ["brand"])
    
    user_ai_usage = get_user_ai_usage(str(current_user["_id"]))
    usage_history = user_ai_usage.get("usage_history", [])
    
    # Sort by timestamp descending and apply limit
    usage_history.sort(key=lambda x: x.get("timestamp", datetime.min), reverse=True)
    recent_history = usage_history[:limit]
    
    return {
        "total_records": len(usage_history),
        "recent_usage": recent_history,
        "summary": {
            "total_used": user_ai_usage.get("total_used", 0),
            "today_used": user_ai_usage.get("today_used", 0),
            "last_used": user_ai_usage.get("last_used")
        }
    }

@router.get("/admin/ai/usage-stats", response_model=dict)
async def get_admin_ai_usage_stats(current_user: dict = Depends(get_current_user)):
    """Get AI usage statistics for admin"""
    check_user_permission(current_user, ["admin"])
    
    # Get total AI usage across all users
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_ai_usage": {"$sum": "$ai_usage.total_used"},
                "active_users_count": {"$sum": 1},
                "users_with_ai_usage": {
                    "$sum": {
                        "$cond": [{"$gt": ["$ai_usage.total_used", 0]}, 1, 0]
                    }
                }
            }
        }
    ]
    
    stats = list(users_collection.aggregate(pipeline))
    total_stats = stats[0] if stats else {
        "total_ai_usage": 0,
        "active_users_count": 0,
        "users_with_ai_usage": 0
    }
    
    # Get today's AI usage
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_users = users_collection.find({
        "ai_usage.last_used": {"$gte": today_start}
    })
    
    today_usage = 0
    for user in today_users:
        today_usage += user.get("ai_usage", {}).get("today_used", 0)
    
    return {
        "total_ai_analyses": total_stats["total_ai_usage"],
        "today_ai_analyses": today_usage,
        "users_with_ai_usage": total_stats["users_with_ai_usage"],
        "total_users": total_stats["active_users_count"],
        "ai_usage_rate": round((total_stats["users_with_ai_usage"] / total_stats["active_users_count"]) * 100, 2) if total_stats["active_users_count"] > 0 else 0
    }
    
    
@router.post("/generate-image")
async def alias_generate_image(data: MultipleImagePrompt, current_user: dict = Depends(get_current_user)):
    return await generate_multiple_images(data, BackgroundTasks(), current_user)
