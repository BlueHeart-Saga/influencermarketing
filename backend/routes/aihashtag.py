# import os
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from dotenv import load_dotenv
# import cohere
# import requests
# from bs4 import BeautifulSoup

# load_dotenv()
# COHERE_API_KEY = os.getenv("COHERE_API_KEY")
# if not COHERE_API_KEY:
#     raise ValueError("Missing COHERE_API_KEY in environment variables.")

# # Initialize Cohere client with the latest API
# client = cohere.ClientV2(COHERE_API_KEY)

# router = APIRouter()

# class GenerateRequest(BaseModel):
#     prompt: str
#     mode: str = "caption"

# class AnalyzeRequest(BaseModel):
#     link: str

# @router.post("/generate")
# async def generate_content(req: GenerateRequest):
#     prompt = req.prompt.strip()
#     if not prompt:
#         raise HTTPException(status_code=400, detail="Prompt is required")

#     mode_prompts = {
#         "caption": f"Write a short catchy social media caption: {prompt}",
#         "description": f"Write a professional product description: {prompt}",
#         "idea": f"Suggest a creative influencer campaign for: {prompt}",
#     }
#     final_prompt = mode_prompts.get(req.mode, prompt)

#     try:
#         # Using Cohere's V2 Chat API with correct parameters
#         response = client.chat(
#             model='command-r-08-2024',
#             messages=[{"role": "user", "content": final_prompt}],
#             max_tokens=300,
#             temperature=0.7
#         )
        
#         text = response.message.content[0].text
#         return {"mode": req.mode, "result": text.strip()}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"AI error: {e}")

# @router.post("/analyze-product")
# async def analyze_product_link(payload: AnalyzeRequest):
#     link = payload.link.strip()
#     if not link or not link.startswith("http"):
#         raise HTTPException(status_code=400, detail="Invalid link")

#     try:
#         resp = requests.get(link, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
#         soup = BeautifulSoup(resp.text, "html.parser")
#         title = soup.title.string.strip() if soup.title else ""
#         meta_desc = (
#             (soup.find("meta", attrs={"name": "description"}) or
#              soup.find("meta", attrs={"property": "og:description"}))
#         )
#         description = meta_desc.get("content", "").strip() if meta_desc else ""

#         # Use Cohere V2 Chat API to generate campaign suggestions
#         prompt = (
#             f"Product Title: {title}\n"
#             f"Description: {description}\n"
#             "Generate campaign title, description, requirements, category, and a suggested budget."
#         )

#         response = client.chat(
#             model='command-r-08-2024',
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=400,
#             temperature=0.7
#         )
        
#         ai_text = response.message.content[0].text

#         return {
#             "data": {
#                 "title": title,
#                 "description": description,
#                 "ai_suggestions": ai_text.strip(),
#             }
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Analyze error: {e}")


# routes/ai_hashtag.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from database import db
from auth.utils import get_current_user, SubscriptionManager

import os
from dotenv import load_dotenv
from cohere import ClientV2

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter( tags=["AI Hashtag"])

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("Missing COHERE_API_KEY")

co = ClientV2(api_key=COHERE_API_KEY)

# MongoDB collection for usage
usage_collection = db["hashtag_usage"]

# -----------------------------
# Usage Helpers
# -----------------------------
async def get_today_usage(user_email: str):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    doc = usage_collection.find_one({"email": user_email, "date": today})
    return doc["count"] if doc else 0


async def increment_usage(user_email: str):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    usage_collection.update_one(
        {"email": user_email, "date": today},
        {"$inc": {"count": 1}, "$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True,
    )


# -----------------------------
# Request Schema
# -----------------------------
class HashtagRequest(BaseModel):
    text: str


# -----------------------------
# GET /usage  (Frontend calls this first)
# -----------------------------
@router.get("/hashtags/usage")
async def get_usage(user=Depends(get_current_user)):
    user_email = user.get("email")

    # Fetch subscription from your Subscription Manager
    sub = await SubscriptionManager.get_user_subscription_status(user_email)
    plan = sub.get("plan", "trial")
    trial_expired = not sub.get("is_active", True) and sub.get("trial_remaining_days", 1) <= 0

    # Plan limits
    plan_limits = {
        "trial": {"daily": 10, "type": "total during trial"},
        "starter": {"daily": 10, "type": "daily"},
        "pro": {"daily": 30, "type": "daily"},
        "enterprise": {"daily": None, "type": "unlimited"},
    }

    limits = plan_limits.get(plan, plan_limits["trial"])

    # Count today's usage
    used_today = await get_today_usage(user_email)

    if limits["daily"] is None:
        remaining = None
    else:
        remaining = max(limits["daily"] - used_today, 0)

    return {
        "daily_limit": limits["daily"],
        "requests_used": used_today,
        "remaining_requests": remaining,
        "limit_type": limits["type"],
        "trial_expired": trial_expired,
        "plan": plan,
    }


# -----------------------------
# POST / (Generate hashtags)
# -----------------------------
@router.post("/hashtags")
async def generate_hashtags(req: HashtagRequest, user=Depends(get_current_user)):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    user_email = user.get("email")

    # Fetch subscription status
    sub = await SubscriptionManager.get_user_subscription_status(user_email)
    plan = sub.get("plan", "trial")
    trial_expired = (
        not sub.get("is_active", True)
        and sub.get("trial_remaining_days", 1) <= 0
    )

    if trial_expired:
        raise HTTPException(
            status_code=403,
            detail="Your trial has expired. Upgrade to continue generating hashtags.",
        )

    # Plan limits
    plan_limits = {
        "trial": 10,
        "starter": 10,
        "pro": 30,
        "enterprise": None,
    }

    daily_limit = plan_limits.get(plan, 10)
    used_today = await get_today_usage(user_email)

    if daily_limit is not None and used_today >= daily_limit:
        raise HTTPException(
            status_code=403,
            detail=f"Daily request limit reached ({daily_limit}).",
        )

    # Generate hashtags using Cohere
    prompt = f"""
Generate 15 highly relevant, trending hashtags based on the text below. 
Return only raw hashtags separated by spaces.

Text:
\"\"\"{text}\"\"\"
"""

    try:
        response = co.chat(
            model="command-r-08-2024",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.4,
        )

        raw = response.message.content[0].text.strip()

        # Clean split hashtags
        hashtags = [
            tag.strip()
            for tag in raw.replace("\n", " ").split(" ")
            if tag.strip().startswith("#")
        ]

        if not hashtags:
            raise ValueError("No valid hashtags found.")

        # Record usage
        await increment_usage(user_email)

        return {"hashtags": hashtags}

    except Exception as e:
        logger.error(f"Hashtag generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI hashtag generation failed: {str(e)}",
        )
