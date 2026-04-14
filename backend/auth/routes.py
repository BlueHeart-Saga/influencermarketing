from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordBearer
from database import db
from .models import UserRegister, UserLogin, PasswordChange, UserUpdate, GoogleAuth, PasswordResetRequest, OTPVerify, PasswordResetConfirm
from .utils import hash_password, verify_password, create_access_token, decode_access_token, send_otp_email, send_welcome_email, send_login_notification_email, get_current_user
from bson import ObjectId
from typing import Dict, Optional, List
from datetime import datetime
import requests
import random
from datetime import timedelta
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
users_collection = db["users"]
subscriptions_collection = db["subscriptions"]

# Import notification services
from routes.brandnotification import (
    brand_notification_service,
    trigger_registration_notifications,
    trigger_login_notifications,
    trigger_subscription_notifications,
    trigger_password_change_notification
)

from routes.influencernotification import (
    influencer_notification_service,
    trigger_influencer_registration_notifications,
    trigger_influencer_login_notifications,
    trigger_influencer_password_change_notification
)

# Configuration
OTP_EXPIRE_MINUTES = 10
OTP_LENGTH = 6
FREE_TRIAL_DAYS = 15
MAX_LOGIN_ATTEMPTS = 5
LOGIN_TIMEOUT_MINUTES = 15

# Password strength validation
PASSWORD_REGEX = re.compile(
    r'^(?=.*[a-z])'
    r'(?=.*[A-Z])'
    r'(?=.*\d)'
    r'(?=.*[@$!%*?&^_\-+=\[\]{}()|:;"\'<>,./~`])'
    r'[A-Za-z\d@$!%*?&^_\-+=\[\]{}()|:;"\'<>,./~`]{8,}$'
)


# ==================== ENHANCED SUBSCRIPTION SERVICE ====================

class SubscriptionService:
    
    @staticmethod
    async def create_free_trial(user_id: str, user_email: str, username: str, role: str):
        """Create free trial subscription for new users (brands only)"""
        try:
            # Only create trial for brand and influencer roles
            if role not in ["brand", "influencer"]:
                logger.info(f"ℹ️ No trial created for {role} user: {user_email}")
                return None

            current_time = datetime.utcnow()
            trial_end = current_time + timedelta(days=FREE_TRIAL_DAYS)
            
            # Create trial subscription document
            subscription_data = {
                "user_id": user_id,
                "user_email": user_email,
                "username": username,
                "plan": "free_trial",
                "billing_cycle": "trial",
                "status": "active",
                "is_trial": True,
                "current_period_start": current_time,
                "current_period_end": trial_end,
                "trial_start": current_time,
                "trial_end": trial_end,
                "created_at": current_time,
                "updated_at": current_time
            }
            
            result = subscriptions_collection.insert_one(subscription_data)
            subscription_data["_id"] = result.inserted_id

            # Update user document with subscription info
            await SubscriptionService._update_user_subscription_data(
                user_id=user_id,
                plan="free_trial",
                has_active_subscription=True,
                is_trial_active=True,
                period_start=current_time,
                period_end=trial_end,
                billing_cycle="trial",
                stripe_subscription_id=None
            )

            logger.info(f"✅ Created free trial subscription for {user_email} until {trial_end}")
            return subscription_data
            
        except Exception as e:
            logger.error(f"❌ Error creating free trial: {str(e)}")
            raise
        
    @staticmethod
    def _is_within_period(user: Dict) -> bool:
        end = user.get("current_period_end")
        if not end:
            return False
        return end > datetime.utcnow()


    @staticmethod
    async def _update_user_subscription_data(
        user_id: str = None,
        user_email: str = None,
        plan: str = None,
        has_active_subscription: bool = None,
        is_trial_active: bool = None,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        billing_cycle: Optional[str] = None,
        stripe_subscription_id: Optional[str] = None
    ):
        """Update user subscription data immediately"""
        try:
            if not user_id and not user_email:
                raise ValueError("Either user_id or user_email must be provided")
            
            update_data = {
                "current_plan": plan,
                "has_active_subscription": has_active_subscription,
                "is_trial_active": is_trial_active,
                "subscription_updated_at": datetime.utcnow()
            }
            
            # Add optional fields if provided
            if period_start is not None:
                update_data["current_period_start"] = period_start
            if period_end is not None:
                update_data["current_period_end"] = period_end
            if billing_cycle is not None:
                update_data["billing_cycle"] = billing_cycle
            if stripe_subscription_id is not None:
                update_data["stripe_subscription_id"] = stripe_subscription_id
            
            # Build query
            query = {}
            if user_id:
                query["_id"] = ObjectId(user_id)
            if user_email:
                query["email"] = user_email
            
            result = users_collection.update_one(query, {"$set": update_data})
            
            if result.modified_count > 0:
                logger.info(f"✅ Updated user subscription data: {plan}")
            else:
                logger.warning(f"⚠️ No user found to update subscription data")
                
        except Exception as e:
            logger.error(f"❌ Error updating user subscription data: {str(e)}")
            raise

    @staticmethod
    async def get_user_subscription_status(user_email: str):
        """Get user's current subscription status"""
        try:
            # First check user collection for cached data
            user = users_collection.find_one({"email": user_email})
            if not user:
                return SubscriptionService._get_free_subscription_status()
            
            
            
            # Check if cached data is recent (within 5 minutes)
            last_update = user.get("subscription_updated_at")
            if last_update and (datetime.utcnow() - last_update).total_seconds() < 300:
                return SubscriptionService._format_subscription_response(user)
            
            # If data is stale, get from subscriptions collection
            return await SubscriptionService._get_subscription_from_collection(user_email)
                
        except Exception as e:
            logger.error(f"❌ Error getting user subscription status: {str(e)}")
            return SubscriptionService._get_free_subscription_status()

    @staticmethod
    def _get_free_subscription_status():
        """Return free subscription status"""
        return {
            "type": "free",
            "plan": "free",
            "status": "active",
            "is_active": True,
            "is_trial": False,
            "current_period_start": None,
            "current_period_end": None,
            "stripe_subscription_id": None,
            "billing_cycle": None
        }

    @staticmethod
    def _format_subscription_response(user_data: Dict):
        plan = user_data.get("current_plan", "free")
        is_trial = user_data.get("is_trial_active", False)
        has_active_sub = user_data.get("has_active_subscription", False)

        is_valid_period = SubscriptionService._is_within_period(user_data)

        if plan == "free_trial" and is_trial and is_valid_period:
            subscription_type = "trial"
        elif has_active_sub and is_valid_period:
            subscription_type = "paid"
        else:
            subscription_type = "free"

        return {
            "type": subscription_type,
            "plan": plan if is_valid_period else "free",
            "billing_cycle": user_data.get("billing_cycle"),
            "status": "active" if is_valid_period else "expired",
            "is_active": is_valid_period,
            "is_trial": is_trial and is_valid_period,
            "current_period_start": user_data.get("current_period_start"),
            "current_period_end": user_data.get("current_period_end"),
            "stripe_subscription_id": user_data.get("stripe_subscription_id") if is_valid_period else None
        }


    @staticmethod
    async def _get_subscription_from_collection(user_email: str):
        """Get subscription status from subscriptions collection"""
        try:
            # Get active paid subscription first
            now = datetime.utcnow()
            active_paid_subscription = subscriptions_collection.find_one({
                "user_email": user_email,
                "stripe_subscription_id": {"$exists": True, "$ne": None},
                "status": {"$in": ["active", "trialing"]},
                "current_period_end": {"$gt": now}
            })


            if active_paid_subscription:
                current_period_start = active_paid_subscription.get("current_period_start")
                current_period_end = active_paid_subscription.get("current_period_end")
                
                # If dates are missing, calculate based on billing cycle
                if not current_period_start:
                    current_period_start = active_paid_subscription.get("created_at", datetime.utcnow())
                    
                if not current_period_end and current_period_start:
                    billing_cycle = active_paid_subscription.get("billing_cycle", "monthly")
                    if billing_cycle == "monthly":
                        current_period_end = current_period_start + timedelta(days=30)
                    elif billing_cycle == "yearly":
                        current_period_end = current_period_start + timedelta(days=365)
                    else:
                        current_period_end = current_period_start + timedelta(days=30)
                    
                    # Update the subscription with calculated dates
                    subscriptions_collection.update_one(
                        {"_id": active_paid_subscription["_id"]},
                        {"$set": {
                            "current_period_start": current_period_start,
                            "current_period_end": current_period_end
                        }}
                    )

                subscription_data = {
                    "type": "paid",
                    "plan": active_paid_subscription["plan"],
                    "billing_cycle": active_paid_subscription.get("billing_cycle", "monthly"),
                    "status": active_paid_subscription["status"],
                    "is_active": True,
                    "is_trial": active_paid_subscription.get("is_trial", False),
                    "current_period_start": current_period_start,
                    "current_period_end": current_period_end,
                    "stripe_subscription_id": active_paid_subscription.get("stripe_subscription_id")
                }
                
                # Update user data for faster future access
                await SubscriptionService._update_user_subscription_data(
                    user_email=user_email,
                    plan=active_paid_subscription["plan"],
                    has_active_subscription=True,
                    is_trial_active=active_paid_subscription.get("is_trial", False),
                    period_start=current_period_start,
                    period_end=current_period_end,
                    billing_cycle=active_paid_subscription.get("billing_cycle"),
                    stripe_subscription_id=active_paid_subscription.get("stripe_subscription_id")
                )
                
                return subscription_data

            # Check for active trial subscription
            trial_subscription = subscriptions_collection.find_one({
                "user_email": user_email,
                "plan": "free_trial",
                "status": "active"
            })

            if trial_subscription:
                current_time = datetime.utcnow()
                period_end = trial_subscription["current_period_end"]
                
                if current_time <= period_end:
                    # Trial is still active
                    subscription_data = {
                        "type": "trial",
                        "plan": "free_trial",
                        "billing_cycle": "trial",
                        "status": "active",
                        "is_active": True,
                        "is_trial": True,
                        "current_period_start": trial_subscription.get("current_period_start"),
                        "current_period_end": period_end,
                        "stripe_subscription_id": None
                    }
                    
                    # Update user data
                    await SubscriptionService._update_user_subscription_data(
                        user_email=user_email,
                        plan="free_trial",
                        has_active_subscription=True,
                        is_trial_active=True,
                        period_start=trial_subscription.get("current_period_start"),
                        period_end=period_end,
                        billing_cycle="trial",
                        stripe_subscription_id=None
                    )
                    
                    return subscription_data
                else:
                    # Trial expired - update status
                    subscriptions_collection.update_one(
                        {"_id": trial_subscription["_id"]},
                        {"$set": {"status": "expired", "updated_at": datetime.utcnow()}}
                    )

            # No active subscription found - update to free
            await SubscriptionService._update_user_subscription_data(
                user_email=user_email,
                plan="free",
                has_active_subscription=False,
                is_trial_active=False,
                period_start=None,
                period_end=None,
                billing_cycle=None,
                stripe_subscription_id=None
            )
            
            return SubscriptionService._get_free_subscription_status()
            
        except Exception as e:
            logger.error(f"❌ Error getting subscription from collection: {str(e)}")
            return SubscriptionService._get_free_subscription_status()

# ==================== SECURITY & VALIDATION FUNCTIONS ====================

def validate_password_strength(password: str) -> bool:
    """Validate password meets strength requirements"""
    if not PASSWORD_REGEX.match(password):
        return False
    return True

def validate_email_format(email: str) -> bool:
    """Validate email format"""
    email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    return bool(email_regex.match(email))

async def check_login_attempts(email: str) -> bool:
    """Check if user has exceeded login attempts"""
    user = users_collection.find_one({"email": email})
    if not user:
        return True
    
    login_attempts = user.get("login_attempts", 0)
    last_attempt = user.get("last_login_attempt")
    
    if login_attempts >= MAX_LOGIN_ATTEMPTS and last_attempt:
        time_since_attempt = datetime.utcnow() - last_attempt
        if time_since_attempt.total_seconds() < LOGIN_TIMEOUT_MINUTES * 60:
            return False
    
    return True

async def increment_login_attempts(email: str):
    """Increment login attempts counter"""
    users_collection.update_one(
        {"email": email},
        {
            "$inc": {"login_attempts": 1},
            "$set": {"last_login_attempt": datetime.utcnow()}
        }
    )

async def reset_login_attempts(email: str):
    """Reset login attempts on successful login"""
    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "login_attempts": 0,
                "last_login_attempt": None
            }
        }
    )

# ==================== ENHANCED AUTHENTICATION ROUTES ====================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister, background_tasks: BackgroundTasks, request: Request):
    """Register new user with enhanced validation and notifications"""
    try:
        # Validate email format
        if not validate_email_format(user.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        # Validate password strength
        if not validate_password_strength(user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters with uppercase, lowercase, number and special character"
            )

        # Check if email already exists
        if users_collection.find_one({"email": user.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if username already exists
        if users_collection.find_one({"username": user.username}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )

        # Validate role
        if user.role not in ["brand", "influencer"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'brand' or 'influencer'"
            )

        hashed_pw = hash_password(user.password)
        
        new_user = {
            "username": user.username,
            "email": user.email,
            "password": hashed_pw,
            "role": user.role,
            "auth_provider": "email",
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "email_verified": False,
            "is_active": True,
            "login_attempts": 0,
            "last_login_attempt": None
        }

        result = users_collection.insert_one(new_user)
        user_id = str(result.inserted_id)
        new_user["_id"] = result.inserted_id

        # Create free trial subscription only for brand and influencer users
        subscription_data = None
        if user.role in ["brand", "influencer"]:
            subscription_data = await SubscriptionService.create_free_trial(
                user_id, new_user["email"], new_user["username"], user.role
            )

        # JWT Token generation
        token_data = {
            "sub": user_id,
            "role": new_user["role"],
            "username": new_user["username"],
            "email": new_user["email"]
        }
        token = create_access_token(token_data)

        # Send welcome email asynchronously
        background_tasks.add_task(send_welcome_email, user.email, user.username)

        # Trigger role-specific registration notifications
        if user.role == "brand":
            background_tasks.add_task(
                trigger_registration_notifications,
                user_id, user.username, user.email, background_tasks
            )
            
            # Trigger subscription notification for trial
            if subscription_data:
                trial_end = subscription_data.get("trial_end", datetime.utcnow() + timedelta(days=FREE_TRIAL_DAYS))
                background_tasks.add_task(
                    trigger_subscription_notifications,
                    user_id, "free_trial", "active", True, trial_end
                )
        elif user.role == "influencer":
            background_tasks.add_task(
                trigger_influencer_registration_notifications,
                user_id, user.username, user.email, background_tasks
            )

            # OPTIONAL: notify influencer about free trial
            if subscription_data:
                trial_end = subscription_data.get("trial_end")
                background_tasks.add_task(
                    trigger_subscription_notifications,  # same function works
                    user_id, "free_trial", "active", True, trial_end
                )


        # Get subscription status for response (brands only)
        subscription_status = await SubscriptionService.get_user_subscription_status(new_user["email"])

        response_data = {
            "message": (
                f"🎉 {user.role.capitalize()} account created successfully! Enjoy your 15-day free trial!"
                if user.role in ["brand", "influencer"]
                else f"🎉 {user.role.capitalize()} account created successfully!"
            ),

            "access_token": token,
            "token_type": "bearer",
            "role": new_user["role"],
            "username": new_user["username"],
            "user_id": user_id,
            "email": new_user["email"],
            "is_new_user": True
        }

        # Add subscription data only for brand and influencer roles
        if user.role in ["brand", "influencer"]:
            response_data["subscription"] = subscription_status

        logger.info(f"✅ New {user.role} registration: {user.email}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@router.post("/login")
async def login(user: UserLogin, background_tasks: BackgroundTasks, request: Request):
    """Enhanced login with security checks and notifications"""
    try:
        # Check login attempts
        # if not await check_login_attempts(user.email):
        #     raise HTTPException(
        #         status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        #         detail=f"Too many login attempts. Please try again in {LOGIN_TIMEOUT_MINUTES} minutes."
        #     )

        db_user = users_collection.find_one({"email": user.email})
        if not db_user:
            await increment_login_attempts(user.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Check if account is active
        if not db_user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support."
            )
            
        # Block suspended or banned users
        user_status = db_user.get("status", "active")

        if user_status in ["suspended", "banned"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account {user_status}. Please contact support."
            )    

        # Verify password
        if not verify_password(user.password, db_user["password"]):
            await increment_login_attempts(user.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Reset login attempts on successful login
        await reset_login_attempts(user.email)

        # Update last login
        users_collection.update_one(
            {"_id": db_user["_id"]}, 
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Get current subscription status (brands and influencers only)
        subscription_status = None
        if db_user["role"] in ["brand", "influencer"]:
            subscription_status = await SubscriptionService.get_user_subscription_status(db_user["email"])

        # Generate JWT token
        token_data = {
            "sub": str(db_user["_id"]), 
            "role": db_user["role"], 
            "username": db_user["username"],
            "email": db_user["email"]
        }
        token = create_access_token(token_data)

        # Send login notification email in background
        background_tasks.add_task(send_login_notification_email, db_user["email"], db_user["username"])

        # Trigger role-specific login notifications
        if db_user["role"] == "brand":
            background_tasks.add_task(
                trigger_login_notifications,
                str(db_user["_id"]), db_user["username"], "email", background_tasks
            )
        elif db_user["role"] == "influencer":
            background_tasks.add_task(
                trigger_influencer_login_notifications,
                str(db_user["_id"]), db_user["username"], "email", background_tasks
            )

        response_data = {
            "access_token": token,
            "token_type": "bearer",
            "role": db_user["role"],
            "username": db_user["username"],
            "user_id": str(db_user["_id"]),
            "email": db_user["email"],
            "message": f"🔐 Login successful! Welcome back, {db_user['username']}."
        }

        # Add subscription data only for brand and influencer roles
        if db_user["role"] in ["brand", "influencer"]:
            response_data["subscription"] = subscription_status

        logger.info(f"✅ Successful login: {db_user['email']}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )
        
        
@router.get("/check-email")
async def check_email(email: str):
    """
    Lightweight email existence check
    Used for live typing validation (Register, Login, Forgot)
    """
    if not validate_email_format(email):
        return {"exists": False}

    normalized_email = email.strip().lower()

    user = users_collection.find_one(
        {"email": normalized_email},
        {"_id": 1}
    )

    return {
        "exists": user is not None
    }



@router.get("/me")
async def get_me(token: str = Depends(oauth2_scheme)):
    """Get current user profile with enhanced data"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        user = users_collection.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get current subscription status
        subscription_status = await SubscriptionService.get_user_subscription_status(user["email"])

        user_data = {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "username": user["username"],
            "created_at": user.get("created_at"),
            "last_login": user.get("last_login"),
            "auth_provider": user.get("auth_provider", "email"),
            "email_verified": user.get("email_verified", False),
            "is_active": user.get("is_active", True),
            "brand_id": user.get("brand_id"),
            "brand_profile": user.get("brand_profile"),
            "influencer_id": user.get("influencer_id"),
            "influencer_profile": user.get("influencer_profile"),
        }

        # Add subscription data only for brands
        if user["role"] in ["brand", "influencer"]:
            user_data["subscription"] = subscription_status

        return user_data

    except Exception as e:
        logger.error(f"❌ Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )

# Add these constants at the top of your auth routes
PROFILE_COMPLETION_THRESHOLD = 70
PROFILE_FIELDS = {
    "brand": [
        "username",
        "name",
        "company_name",
        "bio",
        "website",
        "location",
        "profile_picture",
        "industry"
    ],
    "influencer": [
        "username",
        "name",
        "bio",
        "profile_picture",
        "niche",
        "social_media_handles",
        "follower_count",
        "location"
    ]
}


# ==================== PROFILE TRACKING SERVICE ====================

class ProfileTrackingService:
    
    @staticmethod
    def calculate_profile_completion(user_data: Dict) -> Dict:
        """Calculate profile completion percentage and missing fields"""
        role = user_data.get("role", "brand")
        expected_fields = PROFILE_FIELDS.get(role, PROFILE_FIELDS["brand"])
        
        completed_fields = 0
        missing_fields = []
        
        for field in expected_fields:
            value = user_data.get(field)
            if value and str(value).strip():
                completed_fields += 1
            else:
                missing_fields.append(field)
        
        total_fields = len(expected_fields)
        completion_percentage = (completed_fields / total_fields) * 100
        
        # Determine profile strength
        if completion_percentage >= 90:
            profile_strength = "excellent"
        elif completion_percentage >= 70:
            profile_strength = "strong"
        elif completion_percentage >= 50:
            profile_strength = "average"
        else:
            profile_strength = "weak"
        
        return {
            "total_fields": total_fields,
            "completed_fields": completed_fields,
            "completion_percentage": round(completion_percentage, 1),
            "missing_fields": missing_fields,
            "profile_strength": profile_strength,
            "last_updated": user_data.get("profile_updated_at"),
            "created_at": user_data.get("created_at")
        }
    
    @staticmethod
    async def check_and_notify_incomplete_profile(user_id: str, user_data: Dict):
        """Check profile completion and send notification if incomplete"""
        completion_data = ProfileTrackingService.calculate_profile_completion(user_data)
        
        if completion_data["completion_percentage"] < PROFILE_COMPLETION_THRESHOLD:
            # Send notification based on user role
            if user_data.get("role") == "brand":
                await brand_notification_service.notify_profile_incomplete(
                    user_id, 
                    user_data.get("username", "User"),
                    completion_data["completion_percentage"],
                    completion_data["missing_fields"]
                )
            elif user_data.get("role") == "influencer":
                await influencer_notification_service.notify_profile_incomplete(
                    user_id,
                    user_data.get("username", "User"),
                    completion_data["completion_percentage"],
                    completion_data["missing_fields"]
                )
        
        return completion_data

# ==================== ENHANCED PROFILE ROUTES ====================

@router.put("/profile")
async def update_profile(update_data: UserUpdate, token: str = Depends(oauth2_scheme), background_tasks: BackgroundTasks = None):
    """Update user profile with enhanced tracking and notifications"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user_id = payload["sub"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        update_fields = {}
        profile_changes = []
        
        # Validate and update username
        if update_data.username and update_data.username != user.get("username"):
            existing_user = users_collection.find_one(
                {"username": update_data.username, "_id": {"$ne": ObjectId(user_id)}}
            )
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
            update_fields["username"] = update_data.username
            profile_changes.append("username")

        # Validate and update email
            # if update_data.email:
            #     raise HTTPException(
            #         status_code=400,
            #         detail="Email cannot be changed. Contact support."
            #     )
            # if not validate_email_format(update_data.email):
            #     raise HTTPException(
            #         status_code=status.HTTP_400_BAD_REQUEST,
            #         detail="Invalid email format"
            #     )
                
            # existing_user = users_collection.find_one(
            #     {"email": update_data.email, "_id": {"$ne": ObjectId(user_id)}}
            # )
            # if existing_user:
            #     raise HTTPException(
            #         status_code=status.HTTP_400_BAD_REQUEST,
            #         detail="Email already registered"
            #     )
            # update_fields["email"] = update_data.email
            # update_fields["email_verified"] = False  # Reset verification when email changes
            # profile_changes.append("email")

        # Update other profile fields
        if update_data.name and update_data.name != user.get("name"):
            update_fields["name"] = update_data.name
            profile_changes.append("name")
        
        if update_data.phone and update_data.phone != user.get("phone"):
            update_fields["phone"] = update_data.phone
            profile_changes.append("phone")
        
        if update_data.bio and update_data.bio != user.get("bio"):
            update_fields["bio"] = update_data.bio
            profile_changes.append("bio")
        
        if update_data.website and update_data.website != user.get("website"):
            update_fields["website"] = update_data.website
            profile_changes.append("website")
        
        if update_data.location and update_data.location != user.get("location"):
            update_fields["location"] = update_data.location
            profile_changes.append("location")
        
        if update_data.profile_picture and update_data.profile_picture != user.get("profile_picture"):
            update_fields["profile_picture"] = update_data.profile_picture
            profile_changes.append("profile_picture")

        # Role-specific fields
        if user.get("role") == "brand":
            if update_data.company_name and update_data.company_name != user.get("company_name"):
                update_fields["company_name"] = update_data.company_name
                profile_changes.append("company_name")
            
            if update_data.company_size and update_data.company_size != user.get("company_size"):
                update_fields["company_size"] = update_data.company_size
                profile_changes.append("company_size")
            
            if update_data.industry and update_data.industry != user.get("industry"):
                update_fields["industry"] = update_data.industry
                profile_changes.append("industry")
        
        elif user.get("role") == "influencer":
            if update_data.niche and update_data.niche != user.get("niche"):
                update_fields["niche"] = update_data.niche
                profile_changes.append("niche")
            
            if update_data.social_media_handles and update_data.social_media_handles != user.get("social_media_handles"):
                update_fields["social_media_handles"] = update_data.social_media_handles
                profile_changes.append("social_media_handles")
            
            if update_data.follower_count and update_data.follower_count != user.get("follower_count"):
                update_fields["follower_count"] = update_data.follower_count
                profile_changes.append("follower_count")
            
            if update_data.engagement_rate and update_data.engagement_rate != user.get("engagement_rate"):
                update_fields["engagement_rate"] = update_data.engagement_rate
                profile_changes.append("engagement_rate")

        # Add updated timestamp and track changes
        if update_fields:
            update_fields["profile_updated_at"] = datetime.utcnow()
            update_fields["last_profile_changes"] = profile_changes
            
            users_collection.update_one(
                {"_id": ObjectId(user_id)}, 
                {"$set": update_fields}
            )
            
            # Get updated user data
            updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
            
            # Calculate new completion status
            completion_data = ProfileTrackingService.calculate_profile_completion(updated_user)
            
            # Send profile update notification
            if user.get("role") == "brand":
                if background_tasks:
                    background_tasks.add_task(
                        brand_notification_service.notify_profile_updated,
                        user_id, user.get("username", "User"), profile_changes, completion_data
                    )
                else:
                    await brand_notification_service.notify_profile_updated(
                        user_id, user.get("username", "User"), profile_changes, completion_data
                    )
            elif user.get("role") == "influencer":
                if background_tasks:
                    background_tasks.add_task(
                        influencer_notification_service.notify_profile_updated,
                        user_id, user.get("username", "User"), profile_changes, completion_data
                    )
                else:
                    await influencer_notification_service.notify_profile_updated(
                        user_id, user.get("username", "User"), profile_changes, completion_data
                    )
            
            logger.info(f"✅ Profile updated for user {user_id}: {len(profile_changes)} fields changed")
            
            return {
                "message": "Profile updated successfully",
                "changes": profile_changes,
                "completion_stats": completion_data
            }
        else:
            return {
                "message": "No changes detected",
                "changes": [],
                "completion_stats": ProfileTrackingService.calculate_profile_completion(user)
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating profile for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.get("/profile/completion")
async def get_profile_completion(token: str = Depends(oauth2_scheme)):
    """Get profile completion statistics"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user_id = payload["sub"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        completion_data = ProfileTrackingService.calculate_profile_completion(user)
        
        return {
            "profile_completion": completion_data,
            "recommendations": get_profile_recommendations(completion_data, user.get("role"))
        }

    except Exception as e:
        logger.error(f"❌ Error getting profile completion for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get profile completion"
        )

def get_profile_recommendations(completion_data: Dict, role: str) -> List[str]:
    """Get personalized profile completion recommendations"""
    recommendations = []
    missing_fields = completion_data.get("missing_fields", [])
    
    if not missing_fields:
        recommendations.append("🎉 Your profile is complete! Keep it updated for best results.")
        return recommendations
    
    # Priority fields based on role
    priority_fields = {
        "brand": ["company_name", "bio", "industry", "profile_picture"],
        "influencer": ["bio", "niche", "profile_picture", "social_media_handles"]
    }
    
    role_priority = priority_fields.get(role, [])
    
    for field in role_priority:
        if field in missing_fields:
            field_display = field.replace('_', ' ').title()
            recommendations.append(f"Add your {field_display} to improve your profile visibility")
    
    # Add general recommendations
    if completion_data["completion_percentage"] < 50:
        recommendations.append("Complete basic profile information to get started")
    elif completion_data["completion_percentage"] < 80:
        recommendations.append("Add more details to increase your chances of matching")
    else:
        recommendations.append("You're almost there! Complete remaining fields for optimal results")
    
    return recommendations[:5]  # Return top 5 recommendations

@router.post("/profile/remind-completion")
async def remind_profile_completion(token: str = Depends(oauth2_scheme)):
    """Manually trigger profile completion reminder"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user_id = payload["sub"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        completion_data = await ProfileTrackingService.check_and_notify_incomplete_profile(user_id, user)
        
        return {
            "message": "Profile completion reminder sent",
            "completion_stats": completion_data
        }

    except Exception as e:
        logger.error(f"❌ Error sending profile reminder for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reminder"
        )

@router.put("/change-password")
async def change_password(
    password_data: PasswordChange, 
    token: str = Depends(oauth2_scheme), 
    background_tasks: BackgroundTasks = None
):
    """Change user password with enhanced security"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user_id = payload["sub"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if Google user trying to change password without setting one first
        if user.get("auth_provider") == "google" and not user.get("password"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google authenticated users must set a password first using /set-password"
            )

        # Verify current password
        if not verify_password(password_data.current_password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        # Validate new password strength
        if not validate_password_strength(password_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters with uppercase, lowercase, number and special character"
            )

        # Hash new password and update
        hashed_new_password = hash_password(password_data.new_password)
        users_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {
                "password": hashed_new_password,
                "password_changed_at": datetime.utcnow()
            }}
        )

        # Trigger password change notification based on role
        if user.get("role") == "brand":
            if background_tasks:
                background_tasks.add_task(
                    trigger_password_change_notification,
                    user_id, user["username"], background_tasks
                )
            else:
                await trigger_password_change_notification(user_id, user["username"])
        elif user.get("role") == "influencer":
            if background_tasks:
                background_tasks.add_task(
                    trigger_influencer_password_change_notification,
                    user_id, user["username"], background_tasks
                )
            else:
                await trigger_influencer_password_change_notification(user_id, user["username"])

        logger.info(f"✅ Password changed for user: {user_id}")
        return {
            "message": "🔒 Password changed successfully! Security notification sent.",
            "security_alert": True
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error changing password for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )

# ==================== PASSWORD RESET FLOW ====================

@router.post("/password-reset-request")
async def password_reset_request(request: PasswordResetRequest, background_tasks: BackgroundTasks):
    """Request password reset with enhanced security"""
    try:
        if not validate_email_format(request.email):
            return {"message": "If the email exists, a reset OTP has been sent"}

        user = users_collection.find_one({"email": request.email})
        if not user:
            # Don't reveal whether email exists for security
            return {"message": "If the email exists, a reset OTP has been sent"}

        # Generate OTP
        otp = generate_otp()
        otp_expires = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)

        # Store OTP in database
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_otp": otp,
                "reset_otp_expires": otp_expires,
                "reset_otp_used": False
            }}
        )

        # Send OTP email in background
        background_tasks.add_task(send_otp_email, request.email, user["username"], otp)

        logger.info(f"✅ Password reset OTP sent to: {request.email}")
        return {"message": "If the email exists, a reset OTP has been sent"}

    except Exception as e:
        logger.error(f"❌ Error in password reset request for {request.email}: {str(e)}")
        return {"message": "If the email exists, a reset OTP has been sent"}

@router.post("/verify-otp")
async def verify_otp(otp_data: OTPVerify):
    """Verify OTP for password reset"""
    try:
        user = users_collection.find_one({"email": otp_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if OTP exists, matches, and is not expired or used
        if (not user.get("reset_otp") or 
            user.get("reset_otp") != otp_data.otp or
            datetime.utcnow() > user.get("reset_otp_expires") or
            user.get("reset_otp_used")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )

        # Mark OTP as used
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_otp_used": True}}
        )

        # Create a temporary token for password reset
        reset_token_data = {
            "sub": str(user["_id"]), 
            "purpose": "password_reset",
            "exp": datetime.utcnow() + timedelta(minutes=15)
        }
        reset_token = create_access_token(reset_token_data)

        logger.info(f"✅ OTP verified for: {otp_data.email}")
        return {
            "message": "OTP verified successfully",
            "reset_token": reset_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error verifying OTP for {otp_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP"
        )

@router.post("/reset-password")
async def reset_password(reset_data: PasswordResetConfirm, token: str = Depends(oauth2_scheme)):
    """Reset password using the reset token"""
    try:
        payload = decode_access_token(token)
        if not payload or payload.get("purpose") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired reset token"
            )

        user_id = payload["sub"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Validate new password strength
        if not validate_password_strength(reset_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters with uppercase, lowercase, number and special character"
            )

        # Hash new password and update
        hashed_password = hash_password(reset_data.new_password)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "password": hashed_password,
                "password_changed_at": datetime.utcnow(),
                "reset_otp": None,  # Clear OTP after successful reset
                "reset_otp_expires": None,
                "reset_otp_used": None
            }}
        )

        logger.info(f"✅ Password reset successful for user: {user_id}")
        return {"message": "Password reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error resetting password for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )

# ==================== GOOGLE AUTHENTICATION ====================

async def verify_google_token(token: str):
    """Verify Google OAuth token"""
    try:
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
            timeout=10
        )
        if response.status_code != 200:
            return None
        return response.json()
    except Exception as e:
        logger.error(f"Google token verification error: {e}")
        return None

async def create_or_get_google_user(google_user_info, role="brand"):
    """Create or get Google OAuth user"""
    existing_user = users_collection.find_one({"email": google_user_info["email"]})
    if existing_user:
        # Update last login for existing user
        users_collection.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        return existing_user

    # Create new user
    new_user = {
        "username": google_user_info["email"].split('@')[0],
        "email": google_user_info["email"],
        "password": None,
        "role": role,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "auth_provider": "google",
        "email_verified": google_user_info.get("email_verified", False),
        "name": google_user_info.get("name", ""),
        "picture": google_user_info.get("picture", ""),
        "is_active": True,
        "login_attempts": 0,
        "status": "active",
    }

    # Prevent duplicate usernames
    counter = 1
    original_username = new_user["username"]
    while users_collection.find_one({"username": new_user["username"]}):
        new_user["username"] = f"{original_username}{counter}"
        counter += 1

    result = users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    
    # Create free trial subscription for new Google brand users
    if role in ["brand", "influencer"]:
        await SubscriptionService.create_free_trial(
            str(new_user["_id"]), 
            new_user["email"], 
            new_user["username"],
            role
        )
    
    return new_user

async def verify_google_access_token(token: str):
    """Verify Google OAuth access token"""
    try:
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        if response.status_code != 200:
            return None
        return response.json()
    except Exception as e:
        logger.error(f"Google access token verification error: {e}")
        return None

@router.post("/google")
async def google_auth(google_data: GoogleAuth, background_tasks: BackgroundTasks):
    """Google OAuth authentication with enhanced handling"""
    try:
        google_user_info = await verify_google_token(google_data.token)
        
        # If that fails, try as access token
        if not google_user_info:
            google_user_info = await verify_google_access_token(google_data.token)
            
        if not google_user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token"
            )

        user = await create_or_get_google_user(google_user_info, google_data.role)

        # Get subscription status 
        subscription_status = None
        if user["role"] in ["brand", "influencer"]:
            subscription_status = await SubscriptionService.get_user_subscription_status(user["email"])

        # Generate JWT token
        token_data = {
            "sub": str(user["_id"]), 
            "role": user["role"], 
            "username": user["username"],
            "email": user["email"]
        }
        token = create_access_token(token_data)

        # Check if this is a new user
        is_new_user = user.get("created_at") and (datetime.utcnow() - user["created_at"]).total_seconds() < 60
        
        # Send welcome email for new Google users and trigger notifications
        if is_new_user:
            background_tasks.add_task(send_welcome_email, user["email"], user["username"])
            
            if user["role"] == "brand":
                background_tasks.add_task(
                    trigger_registration_notifications,
                    str(user["_id"]), user["username"], user["email"], background_tasks
                )
            elif user["role"] == "influencer":
                background_tasks.add_task(
                    trigger_influencer_registration_notifications,
                    str(user["_id"]), user["username"], user["email"], background_tasks
                )

        # Trigger login notifications for all Google logins
        if user["role"] == "brand":
            background_tasks.add_task(
                trigger_login_notifications,
                str(user["_id"]), user["username"], "google", background_tasks
            )
        elif user["role"] == "influencer":
            background_tasks.add_task(
                trigger_influencer_login_notifications,
                str(user["_id"]), user["username"], "google", background_tasks
            )

        response_data = {
            "access_token": token,
            "token_type": "bearer",
            "role": user["role"],
            "username": user["username"],
            "user_id": str(user["_id"]),
            "email": user["email"],
            "is_new_user": is_new_user,
            "message": f"🔐 Google login successful! Welcome to the platform, {user['username']}."
        }

        # Add subscription data only for brand and influencer roles
        if user["role"] in ["brand", "influencer"]:
            response_data["subscription"] = subscription_status

        logger.info(f"✅ Google auth successful for: {user['email']}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Google auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )

# ==================== HELPER FUNCTIONS ====================

def generate_otp():
    """Generate a random 6-digit OTP"""
    return ''.join([str(random.randint(0, 9)) for _ in range(OTP_LENGTH)])

@router.get("/trial-status")
async def trial_status(user: Dict = Depends(get_current_user)):
    """Get trial status for authenticated brand user"""
    try:
        # Only brand and influencer have trials
        if user.get("role") not in ["brand", "influencer"]:
            return {
                "is_trial_active": False, 
                "remaining_days": 0,
                "message": "Trial only available for brands"
            }

        user_email = user["email"]
        
        # Get subscription status
        subscription_status = await SubscriptionService.get_user_subscription_status(user_email)
        
        if subscription_status["type"] == "trial":
            # Calculate remaining days
            remaining_days = 0
            if subscription_status["current_period_end"]:
                time_remaining = subscription_status["current_period_end"] - datetime.utcnow()
                remaining_days = max(0, time_remaining.days)
                
            return {
                "is_trial_active": subscription_status["is_active"],
                "remaining_days": remaining_days,
                "current_period_start": subscription_status["current_period_start"],
                "current_period_end": subscription_status["current_period_end"],
                "current_plan": subscription_status["plan"]
            }
        else:
            return {
                "is_trial_active": False, 
                "remaining_days": 0,
                "message": "No active trial found"
            }
            
    except Exception as e:
        logger.error(f"Error getting trial status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching trial status"
        )

@router.post("/set-password")
async def set_password(password_data: PasswordChange, token: str = Depends(oauth2_scheme)):
    """Set password for Google authenticated users"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user_id = payload["sub"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})

        if user.get("auth_provider") != "google" or user.get("password"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password already set or invalid operation"
            )

        # Validate password strength
        if not validate_password_strength(password_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters with uppercase, lowercase, number and special character"
            )

        hashed_password = hash_password(password_data.new_password)
        users_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {
                "password": hashed_password,
                "password_changed_at": datetime.utcnow()
            }}
        )

        logger.info(f"✅ Password set for Google user: {user_id}")
        return {"message": "Password set successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error setting password for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set password"
        )
        
        
@router.get("/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    """
    Get current logged-in user profile
    """
    return {
        "id": str(current_user["_id"]),
        "user_id": str(current_user["_id"]),  # Include both for compatibility
        "username": current_user.get("username"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "name": current_user.get("name") or current_user.get("full_name"),
        "profile_picture": current_user.get("profile_picture"),
        "subscription": await SubscriptionService.get_user_subscription_status(current_user["email"]) if current_user.get("role") in ["brand", "influencer"] else None
    }

@router.get("/users")
async def list_users(
    role: str,
    token: str = Depends(oauth2_scheme)
):
    """
    List users filtered by role (brand, influencer, or all)
    Used for chat user picker
    """
    try:
        if role not in ["brand", "influencer", "all"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid role filter"
            )

        # decode JWT
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )

        current_user_id = payload["sub"]

        # Build query
        query = {"_id": {"$ne": ObjectId(current_user_id)}}
        if role != "all":
            query["role"] = role
        else:
            # When role is "all", we typically only want participants who can chat
            query["role"] = {"$in": ["brand", "influencer"]}

        # query users with profile data
        cursor = users_collection.find(
            query,
            {
                "password": 0,
                "reset_otp": 0,
                "reset_otp_expires": 0
            }
        ).limit(100) # Added a sensible limit

        users = []
        for user in cursor:
            user_role = user.get("role")
            user_data = {
                "id": str(user["_id"]),
                "username": user.get("username"),
                "email": user.get("email"),
                "role": user_role,
                "name": user.get("name"),
            }
            
            # Add profile-specific data
            if user_role == "brand" and user.get("brand_profile"):
                profile = user["brand_profile"]
                user_data.update({
                    "display_name": profile.get("company_name") or user.get("username"),
                    "company_name": profile.get("company_name"),
                    "contact_person": profile.get("contact_person_name"),
                    "industry": profile.get("industry"),
                    "categories": profile.get("categories", []),
                    "location": profile.get("location"),
                    "profile_picture": profile.get("logo"),
                    "logo": profile.get("logo"),
                    "website": profile.get("website")
                })
            elif user_role == "influencer" and user.get("influencer_profile"):
                profile = user["influencer_profile"]
                user_data.update({
                    "display_name": profile.get("nickname") or profile.get("full_name") or user.get("username"),
                    "full_name": profile.get("full_name"),
                    "nickname": profile.get("nickname"),
                    "niche": profile.get("niche"),
                    "categories": profile.get("categories", []),
                    "location": profile.get("location"),
                    "profile_picture": profile.get("profile_picture"),
                    "bio": profile.get("bio")
                })
            
            # Ensure we have a profile_picture field for the frontend
            if not user_data.get("profile_picture"):
                user_data["profile_picture"] = user.get("profile_picture")
                
            users.append(user_data)

        return {
            "success": True,
            "count": len(users),
            "users": users
        }

    except HTTPException:
        raise
    except Exception as e:
        print("LIST USERS ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to load users"
        )