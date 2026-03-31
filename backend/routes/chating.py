# routes/chatting.py
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Query
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Union, Any
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING, TEXT
import logging
import json
import math
from database import db
from typing import Optional, Literal

from auth.utils import get_current_user
from routes.brandnotification import brand_notification_service
from routes.influencernotification import influencer_notification_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# MongoDB collections
messages_collection = db["chat_messages"]
conversations_collection = db["conversations"]
users_collection = db["users"]
profiles_collection = db["profiles"]
campaigns_collection = db["campaigns"]

# Create text index for message search
messages_collection.create_index([("content", TEXT)], background=True)

# ==================== MODELS ====================

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List

class ChatMessageCreate(BaseModel):
    conversation_id: str
    content: str = Field(..., min_length=1, max_length=5000)
    message_type: Literal[
        "text",
        "image",
        "file",
        "offer",
        "contract"
    ] = "text"

    parent_message_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    recipient_id: str
    sender_name: str
    sender_avatar: Optional[str]
    content: str
    message_type: str
    status: str
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    parent_message: Optional[Dict[str, Any]] = None

class ConversationCreate(BaseModel):
    influencer_id: str
    campaign_id: Optional[str] = None
    message: Optional[str] = None  # Optional initial message

class ConversationResponse(BaseModel):
    id: str
    brand_id: str
    influencer_id: str
    brand_name: str
    influencer_name: str
    brand_avatar: Optional[str]
    influencer_avatar: Optional[str]
    campaign_id: Optional[str]
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int
    is_archived: bool
    is_blocked: bool
    match_score: Optional[float]
    created_at: datetime

class MessageStatusUpdate(BaseModel):
    status: Literal["read", "delivered"]

class ConversationSearch(BaseModel):
    query: str = Field(..., min_length=1)
    role_filter: Optional[str] = None
    page: int = 1
    limit: int = 20

class BlockRequest(BaseModel):
    conversation_id: str
    reason: Optional[str] = None

class TypingIndicator(BaseModel):
    conversation_id: str
    is_typing: bool

# ==================== PROFILE SERVICE ====================

def get_user_id(user: Dict) -> str:
    return str(
        user.get("id")
        or user.get("_id")
        or user.get("sub")
    )


class ProfileService:
    
    @staticmethod
    async def get_profile(user_id: str, role: str) -> Optional[Dict]:
        """Get user profile by ID and role"""
        try:
            profile = profiles_collection.find_one({
                "user_id": user_id,
                "role": role
            })
            
            if not profile:
                # Try to get from users collection as fallback
                user = users_collection.find_one({"_id": ObjectId(user_id)})
                if user:
                    # Create basic profile from user data
                    profile = {
                        "user_id": user_id,
                        "role": role,
                        "username": user.get("username"),
                        "email": user.get("email"),
                        "profile_picture": user.get("profile_picture"),
                        "bio": user.get("bio"),
                        "location": user.get("location"),
                        "created_at": user.get("created_at", datetime.now(timezone.utc)),
                        "updated_at": datetime.now(timezone.utc)
                    }
                    
                    # Add role-specific fields
                    if role == "brand":
                        profile.update({
                            "company_name": user.get("company_name"),
                            "industry": user.get("industry"),
                            "website": user.get("website"),
                            "company_size": user.get("company_size"),
                            "brand_data": user.get("brand_profile", {})
                        })
                    elif role == "influencer":
                        profile.update({
                            "niche": user.get("niche"),
                            "social_media_handles": user.get("social_media_handles", {}),
                            "follower_count": user.get("follower_count"),
                            "engagement_rate": user.get("engagement_rate"),
                            "influencer_data": user.get("influencer_profile", {})
                        })
            
            return profile
            
        except Exception as e:
            logger.error(f"Error getting profile for user {user_id}: {str(e)}")
            return None
    
    @staticmethod
    async def get_profile_completion(user_id: str, role: str) -> Dict:
        """Calculate profile completion percentage"""
        try:
            profile = await ProfileService.get_profile(user_id, role)
            if not profile:
                return {
                    "completion_percentage": 0,
                    "completed_fields": 0,
                    "total_fields": 0,
                    "missing_fields": []
                }
            
            # Define required fields for each role
            required_fields = {
                "brand": [
                    "username",
                    "company_name",
                    "bio",
                    "profile_picture",
                    "industry",
                    "location"
                ],
                "influencer": [
                    "username",
                    "bio",
                    "profile_picture",
                    "niche",
                    "location",
                    "social_media_handles"
                ]
            }
            
            fields = required_fields.get(role, [])
            completed = 0
            missing = []
            
            for field in fields:
                value = profile.get(field)
                if value and str(value).strip():
                    completed += 1
                else:
                    missing.append(field)
            
            total = len(fields)
            percentage = (completed / total) * 100 if total > 0 else 0
            
            return {
                "completion_percentage": round(percentage, 1),
                "completed_fields": completed,
                "total_fields": total,
                "missing_fields": missing
            }
            
        except Exception as e:
            logger.error(f"Error calculating profile completion: {str(e)}")
            return {
                "completion_percentage": 0,
                "completed_fields": 0,
                "total_fields": 0,
                "missing_fields": []
            }
    
    @staticmethod
    async def block_influencer(brand_id: str, influencer_id: str, reason: Optional[str] = None):
        """Block an influencer from brand's perspective"""
        try:
            # Update brand profile
            profiles_collection.update_one(
                {"user_id": brand_id, "role": "brand"},
                {
                    "$addToSet": {"blocked_influencers": influencer_id},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                },
                upsert=True
            )
            
            # Update influencer profile (record who blocked them)
            profiles_collection.update_one(
                {"user_id": influencer_id, "role": "influencer"},
                {
                    "$addToSet": {"blocked_by_brands": {"brand_id": brand_id, "reason": reason, "blocked_at": datetime.now(timezone.utc)}},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                },
                upsert=True
            )
            
            logger.info(f"Brand {brand_id} blocked influencer {influencer_id}")
            
        except Exception as e:
            logger.error(f"Error blocking influencer: {str(e)}")
            raise
    
    @staticmethod
    async def block_brand(influencer_id: str, brand_id: str, reason: Optional[str] = None):
        """Block a brand from influencer's perspective"""
        try:
            # Update influencer profile
            profiles_collection.update_one(
                {"user_id": influencer_id, "role": "influencer"},
                {
                    "$addToSet": {"blocked_brands": brand_id},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                },
                upsert=True
            )
            
            # Update brand profile (record who blocked them)
            profiles_collection.update_one(
                {"user_id": brand_id, "role": "brand"},
                {
                    "$addToSet": {"blocked_by_influencers": {"influencer_id": influencer_id, "reason": reason, "blocked_at": datetime.now(timezone.utc)}},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                },
                upsert=True
            )
            
            logger.info(f"Influencer {influencer_id} blocked brand {brand_id}")
            
        except Exception as e:
            logger.error(f"Error blocking brand: {str(e)}")
            raise
    
    @staticmethod
    async def unblock_influencer(brand_id: str, influencer_id: str):
        """Unblock an influencer"""
        try:
            # Update brand profile
            profiles_collection.update_one(
                {"user_id": brand_id, "role": "brand"},
                {
                    "$pull": {"blocked_influencers": influencer_id},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
            
            # Update influencer profile
            profiles_collection.update_one(
                {"user_id": influencer_id, "role": "influencer"},
                {
                    "$pull": {"blocked_by_brands": {"brand_id": brand_id}},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
            
            logger.info(f"Brand {brand_id} unblocked influencer {influencer_id}")
            
        except Exception as e:
            logger.error(f"Error unblocking influencer: {str(e)}")
            raise
    
    @staticmethod
    async def unblock_brand(influencer_id: str, brand_id: str):
        """Unblock a brand"""
        try:
            # Update influencer profile
            profiles_collection.update_one(
                {"user_id": influencer_id, "role": "influencer"},
                {
                    "$pull": {"blocked_brands": brand_id},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
            
            # Update brand profile
            profiles_collection.update_one(
                {"user_id": brand_id, "role": "brand"},
                {
                    "$pull": {"blocked_by_influencers": {"influencer_id": influencer_id}},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
            
            logger.info(f"Influencer {influencer_id} unblocked brand {brand_id}")
            
        except Exception as e:
            logger.error(f"Error unblocking brand: {str(e)}")
            raise
    
    @staticmethod
    async def get_shared_interests(brand_id: str, influencer_id: str) -> Dict:
        """Get shared interests between brand and influencer"""
        try:
            brand_profile = await ProfileService.get_profile(brand_id, "brand")
            influencer_profile = await ProfileService.get_profile(influencer_id, "influencer")
            
            if not brand_profile or not influencer_profile:
                return {"shared_interests": [], "score": 0}
            
            # Extract interests
            brand_interests = set()
            influencer_interests = set()
            
            # Brand interests from industry and bio
            if brand_profile.get("industry"):
                brand_interests.add(brand_profile["industry"].lower())
            if brand_profile.get("bio"):
                # Simple keyword extraction from bio
                bio_keywords = ["marketing", "advertising", "product", "brand", "campaign", "social media"]
                for keyword in bio_keywords:
                    if keyword in brand_profile["bio"].lower():
                        brand_interests.add(keyword)
            
            # Influencer interests from niche and bio
            if influencer_profile.get("niche"):
                influencer_interests.add(influencer_profile["niche"].lower())
            if influencer_profile.get("bio"):
                bio = influencer_profile["bio"].lower()
                niche_keywords = ["fashion", "beauty", "lifestyle", "travel", "food", "fitness", "gaming", "tech"]
                for keyword in niche_keywords:
                    if keyword in bio:
                        influencer_interests.add(keyword)
            
            # Calculate shared interests
            shared = list(brand_interests.intersection(influencer_interests))
            score = len(shared) / max(len(brand_interests), len(influencer_interests), 1) * 100
            
            return {
                "shared_interests": shared,
                "brand_interests": list(brand_interests),
                "influencer_interests": list(influencer_interests),
                "score": round(score, 1)
            }
            
        except Exception as e:
            logger.error(f"Error getting shared interests: {str(e)}")
            return {"shared_interests": [], "score": 0}

# ==================== MATCHING SERVICE ====================

async def match_brand_influencer(brand_data: Dict, influencer_data: Dict) -> Dict:
    """
    Calculate match score between brand and influencer
    Returns detailed matching analysis
    """
    try:
        match_categories = []
        total_weight = 0
        weighted_score = 0
        
        # 1. Industry/Niche Match (Weight: 30%)
        industry_score = calculate_industry_match(
            brand_data.get("industry", ""),
            influencer_data.get("niche", "")
        )
        match_categories.append({
            "category": "industry_niche",
            "score": industry_score,
            "weight": 0.30,
            "details": {
                "brand_industry": brand_data.get("industry"),
                "influencer_niche": influencer_data.get("niche")
            }
        })
        weighted_score += industry_score * 0.30
        total_weight += 0.30
        
        # 2. Location Match (Weight: 15%)
        location_score = calculate_location_match(
            brand_data.get("location", ""),
            influencer_data.get("location", "")
        )
        match_categories.append({
            "category": "location",
            "score": location_score,
            "weight": 0.15,
            "details": {
                "brand_location": brand_data.get("location"),
                "influencer_location": influencer_data.get("location")
            }
        })
        weighted_score += location_score * 0.15
        total_weight += 0.15
        
        # 3. Follower Range Match (Weight: 20%)
        follower_score = calculate_follower_match(
            brand_data.get("target_follower_range"),
            influencer_data.get("follower_count", 0)
        )
        match_categories.append({
            "category": "follower_range",
            "score": follower_score,
            "weight": 0.20,
            "details": {
                "brand_target_range": brand_data.get("target_follower_range"),
                "influencer_followers": influencer_data.get("follower_count")
            }
        })
        weighted_score += follower_score * 0.20
        total_weight += 0.20
        
        # 4. Content Style Match (Weight: 25%)
        content_score = calculate_content_match(
            brand_data.get("content_preferences", {}),
            influencer_data.get("content_style", {})
        )
        match_categories.append({
            "category": "content_style",
            "score": content_score,
            "weight": 0.25,
            "details": {
                "brand_preferences": brand_data.get("content_preferences"),
                "influencer_style": influencer_data.get("content_style")
            }
        })
        weighted_score += content_score * 0.25
        total_weight += 0.25
        
        # 5. Engagement Rate (Weight: 10%)
        engagement_score = calculate_engagement_score(
            influencer_data.get("engagement_rate", 0)
        )
        match_categories.append({
            "category": "engagement",
            "score": engagement_score,
            "weight": 0.10,
            "details": {
                "influencer_engagement": influencer_data.get("engagement_rate")
            }
        })
        weighted_score += engagement_score * 0.10
        total_weight += 0.10
        
        # Calculate final score (normalize by total weight)
        final_score = (weighted_score / total_weight) * 100 if total_weight > 0 else 0
        
        # Determine match level
        match_level = get_match_level(final_score)
        
        # Get shared interests
        shared_interests = await ProfileService.get_shared_interests(
            brand_data.get("user_id", ""),
            influencer_data.get("user_id", "")
        )
        
        return {
            "match_score": round(final_score, 1),
            "match_level": match_level,
            "categories": match_categories,
            "shared_interests": shared_interests.get("shared_interests", []),
            "compatibility_notes": get_compatibility_notes(match_categories, final_score),
            "recommendations": get_match_recommendations(match_categories, final_score)
        }
        
    except Exception as e:
        logger.error(f"Error in brand-influencer matching: {str(e)}")
        return {
            "match_score": 0,
            "match_level": "poor",
            "categories": [],
            "shared_interests": [],
            "compatibility_notes": ["Error calculating match score"],
            "recommendations": []
        }

def calculate_industry_match(brand_industry: str, influencer_niche: str) -> float:
    """Calculate industry-niche compatibility score (0-1)"""
    if not brand_industry or not influencer_niche:
        return 0.3  # Default low score if missing data
    
    brand_industry = brand_industry.lower()
    influencer_niche = influencer_niche.lower()
    
    # Industry-niche mapping for compatibility
    industry_mapping = {
        "fashion": ["fashion", "beauty", "lifestyle"],
        "beauty": ["beauty", "fashion", "lifestyle", "skincare"],
        "technology": ["tech", "gaming", "review", "electronics"],
        "food": ["food", "cooking", "restaurant", "recipe"],
        "travel": ["travel", "lifestyle", "adventure"],
        "fitness": ["fitness", "health", "wellness", "sports"],
        "gaming": ["gaming", "esports", "entertainment"],
        "education": ["education", "learning", "tutorial"],
        "home": ["home", "decor", "diy", "interior"],
        "automotive": ["automotive", "cars", "vehicles"]
    }
    
    # Check direct match
    if brand_industry == influencer_niche:
        return 1.0
    
    # Check mapped compatibility
    for industry, compatible_niches in industry_mapping.items():
        if industry in brand_industry:
            if any(niche in influencer_niche for niche in compatible_niches):
                return 0.8
            # Partial match based on keywords
            for niche in compatible_niches:
                if niche in influencer_niche or influencer_niche in niche:
                    return 0.6
    
    # Check for any common keywords
    brand_words = set(brand_industry.split())
    niche_words = set(influencer_niche.split())
    common_words = brand_words.intersection(niche_words)
    
    if common_words:
        return 0.4
    
    return 0.2

def calculate_location_match(brand_location: str, influencer_location: str) -> float:
    """Calculate location compatibility score (0-1)"""
    if not brand_location or not influencer_location:
        return 0.5  # Neutral score if location not specified
    
    brand_location = brand_location.lower().strip()
    influencer_location = influencer_location.lower().strip()
    
    # Exact match
    if brand_location == influencer_location:
        return 1.0
    
    # Check if same city/region
    brand_parts = set(brand_location.split(','))
    influencer_parts = set(influencer_location.split(','))
    
    # Check for common city or country
    if brand_parts.intersection(influencer_parts):
        return 0.8
    
    # Check if same country (simple check - in real app, use geocoding)
    brand_country = brand_location.split(',')[-1].strip()
    influencer_country = influencer_location.split(',')[-1].strip()
    
    if brand_country == influencer_country:
        return 0.6
    
    # Same continent/region (simplified)
    regions = {
        "north america": ["usa", "united states", "canada", "mexico"],
        "europe": ["uk", "united kingdom", "germany", "france", "spain", "italy"],
        "asia": ["india", "china", "japan", "korea", "singapore"],
        "australia": ["australia", "new zealand"]
    }
    
    brand_region = None
    influencer_region = None
    
    for region, countries in regions.items():
        if any(country in brand_location for country in countries):
            brand_region = region
        if any(country in influencer_location for country in countries):
            influencer_region = region
    
    if brand_region and influencer_region and brand_region == influencer_region:
        return 0.4
    
    return 0.2

def calculate_follower_match(target_range: Optional[Dict], influencer_followers: int) -> float:
    """Calculate follower count compatibility (0-1)"""
    if not target_range or not influencer_followers:
        return 0.5  # Neutral score if data missing
    
    min_followers = target_range.get("min", 0)
    max_followers = target_range.get("max", float('inf'))
    
    # Exact match within range
    if min_followers <= influencer_followers <= max_followers:
        return 1.0
    
    # Close to range (within 20%)
    range_mid = (min_followers + max_followers) / 2
    if range_mid > 0:
        deviation = abs(influencer_followers - range_mid) / range_mid
        if deviation <= 0.2:  # Within 20% of target
            return 0.8
        elif deviation <= 0.5:  # Within 50% of target
            return 0.5
    
    # Very far from target
    return 0.2

def calculate_content_match(brand_prefs: Dict, influencer_style: Dict) -> float:
    """Calculate content style compatibility (0-1)"""
    if not brand_prefs or not influencer_style:
        return 0.5
    
    score = 0
    matches = 0
    total = 0
    
    # Content type matching
    brand_content_types = set(brand_prefs.get("content_types", []))
    influencer_content_types = set(influencer_style.get("content_types", []))
    
    if brand_content_types and influencer_content_types:
        total += 1
        if brand_content_types.intersection(influencer_content_types):
            matches += 1
            score += 0.4
        elif len(brand_content_types) > 0 and len(influencer_content_types) > 0:
            score += 0.2
    
    # Tone matching
    brand_tone = brand_prefs.get("tone", "").lower()
    influencer_tone = influencer_style.get("tone", "").lower()
    
    if brand_tone and influencer_tone:
        total += 1
        if brand_tone == influencer_tone:
            matches += 1
            score += 0.3
        elif any(word in brand_tone for word in influencer_tone.split()) or any(word in influencer_tone for word in brand_tone.split()):
            score += 0.15
    
    # Frequency matching
    brand_frequency = brand_prefs.get("post_frequency", "")
    influencer_frequency = influencer_style.get("post_frequency", "")
    
    if brand_frequency and influencer_frequency:
        total += 1
        if brand_frequency == influencer_frequency:
            matches += 1
            score += 0.3
        # Convert to numerical for comparison
        freq_map = {"daily": 7, "weekly": 1, "monthly": 0.25}
        brand_freq_num = freq_map.get(brand_frequency, 0)
        influencer_freq_num = freq_map.get(influencer_frequency, 0)
        
        if brand_freq_num > 0 and influencer_freq_num > 0:
            ratio = min(brand_freq_num, influencer_freq_num) / max(brand_freq_num, influencer_freq_num)
            score += ratio * 0.3
    
    # Normalize score
    if total > 0:
        return score
    return 0.5

def calculate_engagement_score(engagement_rate: float) -> float:
    """Calculate score based on engagement rate (0-1)"""
    if not engagement_rate:
        return 0.5
    
    # Engagement rate scoring tiers
    if engagement_rate >= 10:  # Excellent
        return 1.0
    elif engagement_rate >= 5:  # Good
        return 0.8
    elif engagement_rate >= 3:  # Average
        return 0.6
    elif engagement_rate >= 1:  # Below average
        return 0.4
    else:  # Poor
        return 0.2

def get_match_level(score: float) -> str:
    """Get match level based on score"""
    if score >= 90:
        return "excellent"
    elif score >= 80:
        return "very_good"
    elif score >= 70:
        return "good"
    elif score >= 60:
        return "fair"
    elif score >= 50:
        return "average"
    elif score >= 40:
        return "below_average"
    else:
        return "poor"

def get_compatibility_notes(categories: List[Dict], overall_score: float) -> List[str]:
    """Generate compatibility notes based on matching categories"""
    notes = []
    
    if overall_score >= 80:
        notes.append("Excellent compatibility for successful collaboration")
    elif overall_score >= 60:
        notes.append("Good potential for partnership with some alignment")
    elif overall_score >= 40:
        notes.append("Moderate compatibility - consider specific campaign goals")
    else:
        notes.append("Limited compatibility - may require creative alignment")
    
    # Add category-specific notes
    for category in categories:
        cat_score = category["score"]
        cat_name = category["category"]
        
        if cat_score >= 0.8:
            if cat_name == "industry_niche":
                notes.append("Perfect industry-niche alignment")
            elif cat_name == "location":
                notes.append("Ideal geographic alignment")
            elif cat_name == "follower_range":
                notes.append("Excellent audience size match")
            elif cat_name == "content_style":
                notes.append("Great content style compatibility")
            elif cat_name == "engagement":
                notes.append("High engagement rate - great for campaign impact")
        elif cat_score <= 0.3:
            if cat_name == "industry_niche":
                notes.append("Industry-niche mismatch - may require creative approach")
            elif cat_name == "location":
                notes.append("Geographic differences may affect local campaigns")
            elif cat_name == "follower_range":
                notes.append("Audience size differs significantly from target")
            elif cat_name == "content_style":
                notes.append("Content style differences may require adaptation")
            elif cat_name == "engagement":
                notes.append("Lower engagement rate may affect campaign performance")
    
    return notes[:5]  # Return top 5 notes

def get_match_recommendations(categories: List[Dict], overall_score: float) -> List[str]:
    """Generate recommendations based on match analysis"""
    recommendations = []
    
    if overall_score >= 80:
        recommendations.append("Proceed with campaign collaboration")
        recommendations.append("Consider long-term partnership opportunities")
    elif overall_score >= 60:
        recommendations.append("Proceed with focused campaign")
        recommendations.append("Define clear campaign objectives")
    elif overall_score >= 40:
        recommendations.append("Consider trial campaign first")
        recommendations.append("Clearly define expectations and deliverables")
    else:
        recommendations.append("Consider alternative influencers")
        recommendations.append("Re-evaluate campaign goals and target audience")
    
    # Category-specific recommendations
    for category in categories:
        cat_score = category["score"]
        cat_name = category["category"]
        
        if cat_score <= 0.5:
            if cat_name == "industry_niche":
                recommendations.append("Consider influencer's secondary niches or content themes")
            elif cat_name == "location":
                recommendations.append("Focus on digital/remote collaboration opportunities")
            elif cat_name == "follower_range":
                recommendations.append("Consider micro-influencer strategy if follower count is lower")
            elif cat_name == "content_style":
                recommendations.append("Provide clear content guidelines and examples")
            elif cat_name == "engagement":
                recommendations.append("Monitor engagement closely and adjust strategy if needed")
    
    return recommendations[:5]  # Return top 5 recommendations

# ==================== CONVERSATION SERVICE ====================

class ConversationService:
    
    @staticmethod
    async def get_or_create_conversation(
        brand_id: str, 
        influencer_id: str,
        campaign_id: Optional[str] = None,
        initial_message: Optional[str] = None,
        user: Dict = None
    ) -> Dict:
        """Get existing conversation or create new one with profile integration"""
        try:
            # Validate participants
            brand = users_collection.find_one({"_id": ObjectId(brand_id)})
            influencer = users_collection.find_one({"_id": ObjectId(influencer_id)})
            
            if not brand or brand.get("role") != "brand":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid brand ID"
                )
            
            if not influencer or influencer.get("role") != "influencer":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid influencer ID"
                )
            
            # Check if conversation already exists
            conversation = conversations_collection.find_one({
                "$and": [
                    {"brand_id": brand_id},
                    {"influencer_id": influencer_id},
                    {"campaign_id": campaign_id if campaign_id else None},
                    {"is_blocked": False}
                ]
            })
            
            if conversation:
                # Update last activity
                conversations_collection.update_one(
                    {"_id": conversation["_id"]},
                    {"$set": {"last_activity": datetime.now(timezone.utc)}}
                )
                return conversation
            
            # Get profile information for both users
            brand_profile = await ProfileService.get_profile(brand_id, "brand")
            influencer_profile = await ProfileService.get_profile(influencer_id, "influencer")
            
            # Calculate match score if profiles exist
            match_score = None
            if brand_profile and influencer_profile:
                try:
                    match_result = await match_brand_influencer(
                        brand_profile,
                        influencer_profile
                    )
                    match_score = match_result.get("match_score")
                except Exception as e:
                    logger.warning(f"Could not calculate match score: {str(e)}")
            
            # Check if influencer has blocked this brand
            if influencer_profile and influencer_profile.get("blocked_brands"):
                if brand_id in influencer_profile.get("blocked_brands", []):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You have been blocked by this influencer"
                    )
            
            # Check if brand has blocked this influencer
            if brand_profile and brand_profile.get("blocked_influencers"):
                if influencer_id in brand_profile.get("blocked_influencers", []):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You have blocked this influencer"
                    )
            
            # Create new conversation
            conversation_data = {
                "brand_id": brand_id,
                "influencer_id": influencer_id,
                "brand_name": brand.get("username", "Brand"),
                "influencer_name": influencer.get("username", "Influencer"),
                "brand_avatar": brand_profile.get("profile_picture") if brand_profile else None,
                "influencer_avatar": influencer_profile.get("profile_picture") if influencer_profile else None,
                "campaign_id": campaign_id,
                "match_score": match_score,
                "last_message": None,
                "last_activity": datetime.now(timezone.utc),
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "is_archived": False,
                "is_blocked": False,
                "blocked_by": None,
                "blocked_at": None,
                "block_reason": None,
                "unread_count": {
                    brand_id: 0,
                    influencer_id: 0
                },
                "participants": {
                    "brand": {
                        "id": brand_id,
                        "username": brand.get("username"),
                        "profile_completion": await ProfileService.get_profile_completion(brand_id, "brand"),
                        "is_online": False,
                        "last_seen": None
                    },
                    "influencer": {
                        "id": influencer_id,
                        "username": influencer.get("username"),
                        "profile_completion": await ProfileService.get_profile_completion(influencer_id, "influencer"),
                        "is_online": False,
                        "last_seen": None
                    }
                },
                "metadata": {
                    "brand_industry": brand_profile.get("industry") if brand_profile else None,
                    "influencer_niche": influencer_profile.get("niche") if influencer_profile else None,
                    "influencer_followers": influencer_profile.get("follower_count") if influencer_profile else None
                }
            }
            
            result = conversations_collection.insert_one(conversation_data)
            conversation_data["_id"] = result.inserted_id
            
            # Log conversation creation with match info
            logger.info(f"New conversation created: {brand_id} -> {influencer_id} | Match Score: {match_score}")
            
            return conversation_data
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create conversation"
            )
    
    @staticmethod
    async def get_conversation_by_id(conversation_id: str, user_id: str) -> Dict:
        """Get conversation by ID with authorization and profile enrichment"""
        try:
            conversation = conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "$or": [
                    {"brand_id": user_id},
                    {"influencer_id": user_id}
                ]
            })
            
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            
            # Enrich with latest profile data
            conversation = await ConversationService._enrich_conversation_data(conversation)
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error getting conversation: {str(e)}")
            raise
    
    @staticmethod
    async def _enrich_conversation_data(conversation: Dict) -> Dict:
        """Enrich conversation data with latest profile information"""
        try:
            # Get updated brand profile
            brand_profile = await ProfileService.get_profile(conversation["brand_id"], "brand")
            if brand_profile:
                conversation["brand_avatar"] = brand_profile.get("profile_picture")
                conversation["participants"]["brand"]["profile_completion"] = await ProfileService.get_profile_completion(
                    conversation["brand_id"], "brand"
                )
                conversation["metadata"]["brand_industry"] = brand_profile.get("industry")
            
            # Get updated influencer profile
            influencer_profile = await ProfileService.get_profile(conversation["influencer_id"], "influencer")
            if influencer_profile:
                conversation["influencer_avatar"] = influencer_profile.get("profile_picture")
                conversation["participants"]["influencer"]["profile_completion"] = await ProfileService.get_profile_completion(
                    conversation["influencer_id"], "influencer"
                )
                conversation["metadata"]["influencer_niche"] = influencer_profile.get("niche")
                conversation["metadata"]["influencer_followers"] = influencer_profile.get("follower_count")
            
            # Update match score if profiles have changed
            if brand_profile and influencer_profile:
                try:
                    match_result = await match_brand_influencer(brand_profile, influencer_profile)
                    conversation["match_score"] = match_result.get("match_score")
                except Exception as e:
                    logger.warning(f"Could not update match score: {str(e)}")
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error enriching conversation data: {str(e)}")
            return conversation
    
    @staticmethod
    async def get_user_conversations(user_id: str, user_role: str, 
                                   page: int = 1, limit: int = 20,
                                   archived: bool = False) -> Dict:
        """Get all conversations for a user with profile-based filtering"""
        try:
            # Build query based on user role and archive status
            if user_role == "brand":
                query = {"brand_id": user_id, "is_archived": archived, "is_blocked": False}
            elif user_role == "influencer":
                query = {"influencer_id": user_id, "is_archived": archived, "is_blocked": False}
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid user role"
                )
            
            # Calculate skip for pagination
            skip = (page - 1) * limit
            
            # Get total count
            total = conversations_collection.count_documents(query)
            
            # Get conversations sorted by last activity
            conversations = conversations_collection.find(query).sort(
                "last_activity", DESCENDING
            ).skip(skip).limit(limit)
            
            conversations_list = []
            for conv in conversations:
                # Get last message
                last_message = messages_collection.find_one(
                    {"conversation_id": str(conv["_id"])},
                    sort=[("created_at", DESCENDING)]
                )
                
                # Enrich conversation data
                enriched_conv = await ConversationService._enrich_conversation_data(conv)
                
                conversation_data = {
                    "id": str(conv["_id"]),
                    "brand_id": conv["brand_id"],
                    "influencer_id": conv["influencer_id"],
                    "brand_name": conv.get("brand_name"),
                    "influencer_name": conv.get("influencer_name"),
                    "brand_avatar": enriched_conv.get("brand_avatar"),
                    "influencer_avatar": enriched_conv.get("influencer_avatar"),
                    "campaign_id": conv.get("campaign_id"),
                    "last_message": last_message.get("content") if last_message else None,
                    "last_message_time": last_message.get("created_at") if last_message else conv["last_activity"],
                    "unread_count": conv.get("unread_count", {}).get(user_id, 0),
                    "is_archived": conv.get("is_archived", False),
                    "is_blocked": conv.get("is_blocked", False),
                    "match_score": enriched_conv.get("match_score"),
                    "created_at": conv["created_at"]
                }
                conversations_list.append(conversation_data)
            
            return {
                "conversations": conversations_list,
                "total": total,
                "page": page,
                "limit": limit,
                "has_more": total > (skip + limit)
            }
            
        except Exception as e:
            logger.error(f"Error getting conversations: {str(e)}")
            raise
    
    @staticmethod
    async def search_conversations(user_id: str, user_role: str, 
                                 search_query: str, page: int = 1, 
                                 limit: int = 20) -> Dict:
        """Search conversations by participant name or message content"""
        try:
            # Build search pipeline
            pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"brand_id": user_id},
                            {"influencer_id": user_id}
                        ],
                        "is_blocked": False
                    }
                },
                {
                    "$lookup": {
                        "from": "chat_messages",
                        "localField": "_id",
                        "foreignField": "conversation_id",
                        "as": "messages"
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {"brand_name": {"$regex": search_query, "$options": "i"}},
                            {"influencer_name": {"$regex": search_query, "$options": "i"}},
                            {"messages.content": {"$regex": search_query, "$options": "i"}}
                        ]
                    }
                },
                {
                    "$sort": {"last_activity": DESCENDING}
                },
                {
                    "$skip": (page - 1) * limit
                },
                {
                    "$limit": limit
                }
            ]
            
            conversations = list(conversations_collection.aggregate(pipeline))
            
            # Count total matches
            count_pipeline = [
                {
                    "$match": {
                        "$or": [
                            {"brand_id": user_id},
                            {"influencer_id": user_id}
                        ],
                        "is_blocked": False
                    }
                },
                {
                    "$lookup": {
                        "from": "chat_messages",
                        "localField": "_id",
                        "foreignField": "conversation_id",
                        "as": "messages"
                    }
                },
                {
                    "$match": {
                        "$or": [
                            {"brand_name": {"$regex": search_query, "$options": "i"}},
                            {"influencer_name": {"$regex": search_query, "$options": "i"}},
                            {"messages.content": {"$regex": search_query, "$options": "i"}}
                        ]
                    }
                },
                {
                    "$count": "total"
                }
            ]
            
            count_result = list(conversations_collection.aggregate(count_pipeline))
            total = count_result[0]["total"] if count_result else 0
            
            # Format response
            conversations_list = []
            for conv in conversations:
                # Get last message
                last_message = conv.get("messages", [])[-1] if conv.get("messages") else None
                
                conversation_data = {
                    "id": str(conv["_id"]),
                    "brand_name": conv.get("brand_name"),
                    "influencer_name": conv.get("influencer_name"),
                    "brand_avatar": conv.get("brand_avatar"),
                    "influencer_avatar": conv.get("influencer_avatar"),
                    "last_message": last_message.get("content") if last_message else None,
                    "last_message_time": last_message.get("created_at") if last_message else conv["last_activity"],
                    "unread_count": conv.get("unread_count", {}).get(user_id, 0),
                    "match_score": conv.get("match_score")
                }
                conversations_list.append(conversation_data)
            
            return {
                "conversations": conversations_list,
                "total": total,
                "page": page,
                "limit": limit,
                "has_more": total > (page * limit)
            }
            
        except Exception as e:
            logger.error(f"Error searching conversations: {str(e)}")
            raise
    
    @staticmethod
    async def block_conversation(conversation_id: str, user_id: str, reason: Optional[str] = None):
        """Block a conversation"""
        try:
            conversation = await ConversationService.get_conversation_by_id(conversation_id, user_id)
            
            # Determine who is blocking
            blocker_role = "brand" if conversation["brand_id"] == user_id else "influencer"
            
            # Update conversation
            conversations_collection.update_one(
                {"_id": conversation["_id"]},
                {"$set": {
                    "is_blocked": True,
                    "blocked_by": blocker_role,
                    "blocked_at": datetime.now(timezone.utc),
                    "block_reason": reason,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Also block user in profiles
            if blocker_role == "brand":
                await ProfileService.block_influencer(user_id, conversation["influencer_id"], reason)
            else:
                await ProfileService.block_brand(conversation["brand_id"], user_id, reason)
            
            logger.info(f"Conversation {conversation_id} blocked by {user_id}")
            
            return {"message": "Conversation blocked successfully"}
            
        except Exception as e:
            logger.error(f"Error blocking conversation: {str(e)}")
            raise
    
    @staticmethod
    async def unblock_conversation(conversation_id: str, user_id: str):
        """Unblock a conversation"""
        try:
            conversation = await ConversationService.get_conversation_by_id(conversation_id, user_id)
            
            if not conversation.get("is_blocked"):
                return {"message": "Conversation is not blocked"}
            
            # Check if user is the one who blocked it
            if conversation.get("blocked_by") == ("brand" if conversation["brand_id"] == user_id else "influencer"):
                # Unblock conversation
                conversations_collection.update_one(
                    {"_id": conversation["_id"]},
                    {"$set": {
                        "is_blocked": False,
                        "blocked_by": None,
                        "blocked_at": None,
                        "block_reason": None,
                        "updated_at": datetime.now(timezone.utc)
                    }}
                )
                
                # Unblock user in profiles
                if conversation["brand_id"] == user_id:
                    await ProfileService.unblock_influencer(user_id, conversation["influencer_id"])
                else:
                    await ProfileService.unblock_brand(conversation["brand_id"], user_id)
                
                return {"message": "Conversation unblocked successfully"}
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the user who blocked the conversation can unblock it"
                )
            
        except Exception as e:
            logger.error(f"Error unblocking conversation: {str(e)}")
            raise

# ==================== PROFILE-AWARE MESSAGE SERVICE ====================

class MessageService:
    
    @staticmethod
    async def send_message(message_data: ChatMessageCreate, sender_id: str, 
                         background_tasks: BackgroundTasks) -> Dict:
        """Send a new message with profile awareness"""
        try:
            # Validate conversation exists and user is participant
            conversation = conversations_collection.find_one({
                "_id": ObjectId(message_data.conversation_id),
                "$or": [
                    {"brand_id": sender_id},
                    {"influencer_id": sender_id}
                ],
                "is_blocked": False
            })
            
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            
            # Check if user is blocked
            sender_role = "brand" if conversation["brand_id"] == sender_id else "influencer"
            if sender_role == "brand":
                brand_profile = await ProfileService.get_profile(sender_id, "brand")
                if brand_profile and conversation["influencer_id"] in brand_profile.get("blocked_influencers", []):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You have blocked this influencer"
                    )
            else:
                influencer_profile = await ProfileService.get_profile(sender_id, "influencer")
                if influencer_profile and conversation["brand_id"] in influencer_profile.get("blocked_brands", []):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You have blocked this brand"
                    )
            
            # Determine recipient
            if conversation["brand_id"] == sender_id:
                recipient_id = conversation["influencer_id"]
                recipient_role = "influencer"
            else:
                recipient_id = conversation["brand_id"]
                recipient_role = "brand"
            
            # Get sender profile info
            sender_profile = await ProfileService.get_profile(sender_id, sender_role)
            
            # Create message document
            message_doc = {
                "conversation_id": message_data.conversation_id,
                "sender_id": sender_id,
                "recipient_id": recipient_id,
                "sender_name": conversation[f"{sender_role}_name"],
                "sender_avatar": sender_profile.get("profile_picture") if sender_profile else None,
                "content": message_data.content,
                "message_type": message_data.message_type,
                "status": "sent",
                "metadata": message_data.metadata or {},
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "read_at": None,
                "delivered_at": None,
                "parent_message_id": message_data.parent_message_id
            }
            
            # If there's a parent message, validate it exists
            if message_data.parent_message_id:
                parent_message = messages_collection.find_one({
                    "_id": ObjectId(message_data.parent_message_id),
                    "conversation_id": message_data.conversation_id
                })
                if not parent_message:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Parent message not found"
                    )
                message_doc["parent_message_id"] = message_data.parent_message_id
            
            # Insert message
            result = messages_collection.insert_one(message_doc)
            message_id = str(result.inserted_id)
            
            # Update conversation
            conversations_collection.update_one(
                {"_id": ObjectId(message_data.conversation_id)},
                {
                    "$set": {
                        "last_message": message_data.content,
                        "last_activity": datetime.now(timezone.utc),
                        "updated_at": datetime.now(timezone.utc)
                    },
                    "$inc": {
                        f"unread_count.{recipient_id}": 1
                    }
                }
            )
            
            # Send notifications in background
            background_tasks.add_task(
                MessageService._send_message_notification,
                conversation, sender_id, recipient_id, sender_role, message_data, message_id
            )
            
            # Get parent message if exists
            parent_message_data = None
            if message_data.parent_message_id:
                parent = messages_collection.find_one({"_id": ObjectId(message_data.parent_message_id)})
                if parent:
                    parent_message_data = {
                        "id": str(parent["_id"]),
                        "content": parent.get("content"),
                        "sender_id": parent.get("sender_id"),
                        "created_at": parent.get("created_at")
                    }
            
            # Prepare response
            message_response = {
                "id": message_id,
                "conversation_id": message_data.conversation_id,
                "sender_id": sender_id,
                "recipient_id": recipient_id,
                "sender_name": message_doc["sender_name"],
                "sender_avatar": message_doc["sender_avatar"],
                "content": message_data.content,
                "message_type": message_data.message_type,
                "status": "sent",
                "metadata": message_doc["metadata"],
                "created_at": message_doc["created_at"],
                "parent_message": parent_message_data
            }
            
            # Log message sent
            logger.info(f"Message sent: {sender_id} -> {recipient_id} | Type: {message_data.message_type}")
            
            return message_response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send message"
            )
    
    @staticmethod
    async def _send_message_notification(conversation: Dict, sender_id: str, 
                                       recipient_id: str, sender_role: str, 
                                       message_data: ChatMessageCreate, message_id: str):
        """Send notification for new message with profile context"""
        try:
            # Get recipient details
            recipient = users_collection.find_one({"_id": ObjectId(recipient_id)})
            sender = users_collection.find_one({"_id": ObjectId(sender_id)})
            
            if not recipient or not sender:
                return
            
            sender_name = sender.get("username", "User")
            preview = message_data.content[:100] + "..." if len(message_data.content) > 100 else message_data.content
            
            # Get sender profile for richer notification
            sender_profile = await ProfileService.get_profile(sender_id, sender_role)
            
            notification_data = {
                "conversation_id": str(conversation["_id"]),
                "message_id": message_id,
                "sender_id": sender_id,
                "sender_name": sender_name,
                "sender_avatar": sender_profile.get("profile_picture") if sender_profile else None,
                "message_preview": preview,
                "message_type": message_data.message_type,
                "campaign_id": conversation.get("campaign_id"),
                "timestamp": datetime.now(timezone.utc)
            }
            
            if recipient.get("role") == "brand":
                # Send notification to brand
                await brand_notification_service.notify_new_message(
                    recipient_id,
                    sender_name,
                    preview,
                    conversation["brand_name"],
                    message_id,
                    conversation["_id"],
                    notification_data
                )
            elif recipient.get("role") == "influencer":
                # Send notification to influencer
                await influencer_notification_service.notify_new_message(
                    recipient_id,
                    sender_name,
                    preview,
                    conversation["influencer_name"],
                    message_id,
                    conversation["_id"],
                    notification_data
                )
            
            logger.info(f"Message notification sent to {recipient_id}")
            
        except Exception as e:
            logger.error(f"Error sending message notification: {str(e)}")
    
    @staticmethod
    async def get_conversation_messages(conversation_id: str, user_id: str,
                                      page: int = 1, limit: int = 50,
                                      before_date: Optional[datetime] = None) -> Dict:
        """Get messages for a conversation with profile enrichment"""
        try:
            # Verify user has access to conversation
            conversation = conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "$or": [
                    {"brand_id": user_id},
                    {"influencer_id": user_id}
                ]
            })
            
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found or access denied"
                )
            
            # Build query
            query = {"conversation_id": conversation_id, "is_deleted": {"$ne": True}}
            if before_date:
                query["created_at"] = {"$lt": before_date}
            
            # Calculate skip for pagination
            skip = (page - 1) * limit
            
            # Get total count
            total = messages_collection.count_documents(query)
            
            # Get messages sorted by creation date
            messages = messages_collection.find(query).sort(
                "created_at", DESCENDING
            ).skip(skip).limit(limit)
            
            messages_list = []
            for msg in messages:
                # Get parent message if exists
                parent_message_data = None
                if msg.get("parent_message_id"):
                    parent = messages_collection.find_one({
                        "_id": ObjectId(msg["parent_message_id"]),
                        "is_deleted": {"$ne": True}
                    })
                    if parent:
                        # Get parent sender info
                        parent_sender_role = "brand" if conversation["brand_id"] == parent["sender_id"] else "influencer"
                        parent_sender_profile = await ProfileService.get_profile(parent["sender_id"], parent_sender_role)
                        
                        parent_message_data = {
                            "id": str(parent["_id"]),
                            "content": parent.get("content"),
                            "sender_id": parent.get("sender_id"),
                            "sender_name": parent.get("sender_name"),
                            "sender_avatar": parent_sender_profile.get("profile_picture") if parent_sender_profile else None,
                            "created_at": parent.get("created_at")
                        }
                
                message_data = {
                    "id": str(msg["_id"]),
                    "conversation_id": msg["conversation_id"],
                    "sender_id": msg["sender_id"],
                    "recipient_id": msg["recipient_id"],
                    "sender_name": msg.get("sender_name"),
                    "sender_avatar": msg.get("sender_avatar"),
                    "content": msg["content"],
                    "message_type": msg.get("message_type", "text"),
                    "status": msg.get("status", "sent"),
                    "metadata": msg.get("metadata", {}),
                    "created_at": msg["created_at"],
                    "read_at": msg.get("read_at"),
                    "delivered_at": msg.get("delivered_at"),
                    "parent_message": parent_message_data
                }
                messages_list.append(message_data)
            
            # Mark messages as read if user is recipient
            await MessageService.mark_messages_as_read(conversation_id, user_id)
            
            # Enrich conversation data
            enriched_conversation = await ConversationService._enrich_conversation_data(conversation)
            
            return {
                "messages": list(reversed(messages_list)),  # Return in chronological order
                "total": total,
                "page": page,
                "limit": limit,
                "has_more": total > (skip + limit),
                "conversation_info": {
                    "brand_name": enriched_conversation.get("brand_name"),
                    "influencer_name": enriched_conversation.get("influencer_name"),
                    "brand_avatar": enriched_conversation.get("brand_avatar"),
                    "influencer_avatar": enriched_conversation.get("influencer_avatar"),
                    "campaign_id": enriched_conversation.get("campaign_id"),
                    "match_score": enriched_conversation.get("match_score"),
                    "is_blocked": enriched_conversation.get("is_blocked")
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting messages: {str(e)}")
            raise
    
    @staticmethod
    async def mark_messages_as_read(conversation_id: str, user_id: str):
        """Mark all messages as read for a user in a conversation"""
        try:
            # Find unread messages where user is recipient
            unread_messages = messages_collection.find({
                "conversation_id": conversation_id,
                "recipient_id": user_id,
                "read_at": None
            })
            
            message_ids = []
            for msg in unread_messages:
                message_ids.append(msg["_id"])
            
            if message_ids:
                # Update read_at timestamp
                current_time = datetime.now(timezone.utc)
                messages_collection.update_many(
                    {"_id": {"$in": message_ids}},
                    {"$set": {"read_at": current_time, "status": "read"}}
                )
                
                # Reset unread count in conversation
                conversations_collection.update_one(
                    {"_id": ObjectId(conversation_id)},
                    {"$set": {f"unread_count.{user_id}": 0}}
                )
                
                logger.info(f"Marked {len(message_ids)} messages as read in conversation {conversation_id}")
            
        except Exception as e:
            logger.error(f"Error marking messages as read: {str(e)}")
    
    @staticmethod
    async def send_typing_indicator(conversation_id: str, user_id: str, is_typing: bool):
        """Send typing indicator for a conversation"""
        try:
            conversation = conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "$or": [
                    {"brand_id": user_id},
                    {"influencer_id": user_id}
                ]
            })
            
            if not conversation:
                return
            
            # In a real-time system, you would emit this via WebSocket
            # For now, we'll log it
            logger.info(f"User {user_id} is {'typing' if is_typing else 'not typing'} in conversation {conversation_id}")
            
            return {"is_typing": is_typing}
            
        except Exception as e:
            logger.error(f"Error sending typing indicator: {str(e)}")

# ==================== ROUTES ====================

# (All the route functions remain exactly the same as in the previous version)
# ... [All route functions from the previous version]

@router.post("/conversations", response_model=Dict, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    background_tasks: BackgroundTasks,
    user: Dict = Depends(get_current_user)
):
    """Create a new conversation between brand and influencer"""
    try:
        # Validate user role
        if user["role"] != "brand":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only brands can initiate conversations"
            )
        
        conversation = await ConversationService.get_or_create_conversation(
            brand_id=user["id"],
            influencer_id=conversation_data.influencer_id,
            campaign_id=conversation_data.campaign_id,
            user=user
        )
        
        # If initial message provided, send it
        if conversation_data.message:
            message_data = ChatMessageCreate(
                conversation_id=str(conversation["_id"]),
                content=conversation_data.message,
                message_type="text"
            )
            
            await MessageService.send_message(
                message_data=message_data,
                sender_id=get_user_id(user),
                background_tasks=background_tasks
            )
        
        return {
            "message": "Conversation created successfully",
            "conversation_id": str(conversation["_id"]),
            "influencer_name": conversation.get("influencer_name"),
            "brand_name": conversation.get("brand_name"),
            "match_score": conversation.get("match_score")
        }
        
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise

@router.get("/conversations", response_model=Dict)
async def get_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    archived: bool = Query(False),
    user: Dict = Depends(get_current_user)
):
    """Get all conversations for current user"""
    try:
        user_id = get_user_id(user)
        conversations_data = await ConversationService.get_user_conversations(
            user_id=user_id,
            user_role=user["role"],
            page=page,
            limit=limit,
            archived=archived
        )
        
        return conversations_data
        
    except Exception as e:
        logger.error(f"Error getting conversations: {str(e)}")
        raise

# ... [Continue with all other routes from the previous version]

@router.get("/match-analysis/{influencer_id}")
async def get_match_analysis(
    influencer_id: str,
    user: Dict = Depends(get_current_user)
):
    """Get detailed match analysis between current brand and an influencer"""
    try:
        if user["role"] != "brand":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only brands can view match analysis"
            )
        
        user_id = get_user_id(user)
        brand_profile = await ProfileService.get_profile(user_id, "brand")

        influencer_profile = await ProfileService.get_profile(influencer_id, "influencer")
        
        if not brand_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brand profile not found"
            )
        
        if not influencer_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Influencer profile not found"
            )
        
        match_analysis = await match_brand_influencer(brand_profile, influencer_profile)
        
        # Get shared interests
        shared_interests = await ProfileService.get_shared_interests(user["id"], influencer_id)
        
        return {
            "match_analysis": match_analysis,
            "shared_interests": shared_interests,
            "brand_profile_summary": {
                "industry": brand_profile.get("industry"),
                "company_name": brand_profile.get("company_name"),
                "profile_completion": await ProfileService.get_profile_completion(user["id"], "brand")
            },
            "influencer_profile_summary": {
                "niche": influencer_profile.get("niche"),
                "follower_count": influencer_profile.get("follower_count"),
                "engagement_rate": influencer_profile.get("engagement_rate"),
                "profile_completion": await ProfileService.get_profile_completion(influencer_id, "influencer")
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting match analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get match analysis"
        )

@router.get("/compatible-influencers")
async def get_compatible_influencers(
    min_score: float = Query(70, ge=0, le=100),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    user: Dict = Depends(get_current_user)
):
    """Get influencers compatible with current brand based on profile matching"""
    try:
        if user["role"] != "brand":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only brands can view compatible influencers"
            )
        
        brand_profile = await ProfileService.get_profile(user["id"], "brand")
        if not brand_profile:
            return {
                "compatible_influencers": [],
                "total": 0,
                "page": page,
                "limit": limit,
                "has_more": False
            }
        
        # Get all influencer profiles
        influencer_profiles = profiles_collection.find(
            {"role": "influencer"}
        ).skip((page - 1) * limit).limit(limit)
        
        compatible_influencers = []
        
        for influencer in influencer_profiles:
            try:
                match_result = await match_brand_influencer(brand_profile, influencer)
                match_score = match_result.get("match_score", 0)
                
                if match_score >= min_score:
                    compatible_influencers.append({
                        "influencer_id": influencer["user_id"],
                        "username": influencer.get("username"),
                        "profile_picture": influencer.get("profile_picture"),
                        "niche": influencer.get("niche"),
                        "follower_count": influencer.get("follower_count"),
                        "location": influencer.get("location"),
                        "match_score": match_score,
                        "match_level": match_result.get("match_level"),
                        "shared_interests": match_result.get("shared_interests", [])[:3]
                    })
            except Exception as e:
                logger.warning(f"Error calculating match for influencer {influencer.get('user_id')}: {str(e)}")
                continue
        
        # Sort by match score
        compatible_influencers.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Get total count
        total_influencers = profiles_collection.count_documents({"role": "influencer"})
        
        return {
            "compatible_influencers": compatible_influencers,
            "total": total_influencers,
            "page": page,
            "limit": limit,
            "has_more": total_influencers > (page * limit)
        }
        
    except Exception as e:
        logger.error(f"Error getting compatible influencers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get compatible influencers"
        )