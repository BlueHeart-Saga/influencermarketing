from pydantic import BaseModel, EmailStr, Field, HttpUrl, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# ---------------- AUTH MODELS ----------------
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="brand", description="User role: 'brand' or 'influencer'")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    token: str
    role: str = "brand"

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class SetPassword(BaseModel):
    new_password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    
class PasswordResetRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class PasswordResetConfirm(BaseModel):
    new_password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# ---------------- SOCIAL LINKS ----------------
class SocialLinks(BaseModel):
    instagram: Optional[HttpUrl] = None
    youtube: Optional[HttpUrl] = None
    linkedin: Optional[HttpUrl] = None
    facebook: Optional[HttpUrl] = None
    tiktok: Optional[HttpUrl] = None

# ---------------- BRAND PROFILE ----------------
class BrandProfileBase(BaseModel):
    company_name: Optional[str] = None
    contact_person_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    website: Optional[HttpUrl] = None
    location: Optional[str] = None
    categories: Optional[List[str]] = None
    social_links: Optional[SocialLinks] = None
    target_audience: Optional[Dict[str, Any]] = None
    logo: Optional[str] = None
    bg_image: Optional[str] = None
    bio: Optional[str] = None
    posts: Optional[List[str]] = []  # List of post_ids
    followers: Optional[List[str]] = []  # List of user_ids
    following: Optional[List[str]] = []  # List of user_ids
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class BrandProfileCreate(BrandProfileBase):
    company_name: str
    contact_person_name: str
    email: EmailStr

class BrandProfileUpdate(BrandProfileBase):
    pass  # All fields optional

# ---------------- INFLUENCER PROFILE ----------------
class InfluencerProfileBase(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    categories: Optional[List[str]] = None
    social_links: Optional[SocialLinks] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    bg_image: Optional[str] = None
    location: Optional[str] = None
    followers: Optional[List[str]] = []  # List of user_ids
    following: Optional[List[str]] = []  # List of user_ids
    posts: Optional[List[str]] = []  # List of post_ids
    target_audience: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class InfluencerProfileCreate(InfluencerProfileBase):
    full_name: str
    email: EmailStr

class InfluencerProfileUpdate(InfluencerProfileBase):
    pass  # All fields optional

# ---------------- POSTS ----------------
class Comment(BaseModel):
    user_id: str
    comment: str
    created_at: datetime

class PostBase(BaseModel):
    post_id: str
    caption: Optional[str] = None
    media: List[str]
    likes: Optional[List[str]] = []  # user_ids
    comments: Optional[List[Comment]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PostCreate(BaseModel):
    caption: Optional[str] = None
    media: List[str]

class PostUpdate(BaseModel):
    caption: Optional[str] = None

# ---------------- RESPONSE MODELS ----------------
class ProfileResponse(BaseModel):
    type: str  # "brand" or "influencer"
    profile: Union[BrandProfileBase, InfluencerProfileBase]

class MessageResponse(BaseModel):
    message: str
    profile: Optional[Union[BrandProfileBase, InfluencerProfileBase]] = None
    post: Optional[PostBase] = None

# Add to your models.py

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    profile_picture: Optional[str] = None
    # Brand specific fields
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    # Influencer specific fields
    niche: Optional[str] = None
    social_media_handles: Optional[Dict] = None
    follower_count: Optional[int] = None
    engagement_rate: Optional[float] = None

class ProfileCompletionStats(BaseModel):
    total_fields: int
    completed_fields: int
    completion_percentage: float
    missing_fields: List[str]
    profile_strength: str  # weak, average, strong, excellent