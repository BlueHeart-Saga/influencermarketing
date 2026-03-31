from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Request
from database import db
from .models import AdminRegister, AdminLogin

from .utils import hash_password, verify_password, create_admin_token, decode_admin_token
from bson import ObjectId
from datetime import datetime
import logging
import re

logger = logging.getLogger(__name__)

router = APIRouter()
admin_users_collection = db["admin_users"]
users_collection = db["users"]  # Regular users collection

# Password strength validation
PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')

# Security constants
MAX_LOGIN_ATTEMPTS = 5
LOGIN_TIMEOUT_MINUTES = 15

def validate_email_format(email: str) -> bool:
    """Validate email format"""
    email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    return bool(email_regex.match(email))

# async def check_login_attempts(email: str) -> bool:
#     """Check if admin has exceeded login attempts"""
#     admin = admin_users_collection.find_one({"email": email})
#     if not admin:
#         return True
    
#     login_attempts = admin.get("login_attempts", 0)
#     last_attempt = admin.get("last_login_attempt")
    
#     if login_attempts >= MAX_LOGIN_ATTEMPTS and last_attempt:
#         time_since_attempt = datetime.utcnow() - last_attempt
#         if time_since_attempt.total_seconds() < LOGIN_TIMEOUT_MINUTES * 60:
#             return False
    
#     return True

async def increment_login_attempts(email: str):
    """Increment login attempts counter"""
    admin_users_collection.update_one(
        {"email": email},
        {
            "$inc": {"login_attempts": 1},
            "$set": {"last_login_attempt": datetime.utcnow()}
        }
    )

async def reset_login_attempts(email: str):
    """Reset login attempts on successful login"""
    admin_users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "login_attempts": 0,
                "last_login_attempt": None
            }
        }
    )

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def admin_register(admin: AdminRegister, request: Request):
    """Register new admin user"""
    try:
        # Validate email format
        if not validate_email_format(admin.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        # Validate password strength
        if not PASSWORD_REGEX.match(admin.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters with uppercase, lowercase, number and special character"
            )

        # Check if email already exists in admin collection
        if admin_users_collection.find_one({"email": admin.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered as admin"
            )

        # Also check in regular users collection to prevent duplicate
        if users_collection.find_one({"email": admin.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered as regular user"
            )

        hashed_pw = hash_password(admin.password)
        
        new_admin = {
            "username": admin.username,
            "email": admin.email,
            "password": hashed_pw,
            "role": "admin",  # Fixed role as admin
            "full_name": admin.full_name,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "email_verified": False,
            "is_active": True,
            "login_attempts": 0,
            "last_login_attempt": None,
            "permissions": admin.permissions if hasattr(admin, 'permissions') else []
        }

        result = admin_users_collection.insert_one(new_admin)
        admin_id = str(result.inserted_id)

        # Generate admin JWT token
        token_data = {
            "sub": admin_id,
            "role": "admin",
            "username": new_admin["username"],
            "email": new_admin["email"]
        }
        token = create_admin_token(token_data)

        logger.info(f"✅ New admin registration: {admin.email}")

        return {
            "message": "🎉 Admin account created successfully!",
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "username": new_admin["username"],
            "admin_id": admin_id,
            "email": new_admin["email"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Admin registration error for {admin.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin registration failed. Please try again."
        )

@router.post("/login")
async def admin_login(admin: AdminLogin, request: Request):
    """Admin login with security checks"""
    try:
        # Check login attempts
        if not await check_login_attempts(admin.email):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many login attempts. Please try again in {LOGIN_TIMEOUT_MINUTES} minutes."
            )

        db_admin = admin_users_collection.find_one({"email": admin.email})
        if not db_admin:
            await increment_login_attempts(admin.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Check if admin account is active
        if not db_admin.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is deactivated. Please contact super admin."
            )

        # Verify password
        if not verify_password(admin.password, db_admin["password"]):
            await increment_login_attempts(admin.email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Reset login attempts on successful login
        await reset_login_attempts(admin.email)

        # Update last login
        admin_users_collection.update_one(
            {"_id": db_admin["_id"]}, 
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Generate admin JWT token
        token_data = {
            "sub": str(db_admin["_id"]), 
            "role": "admin", 
            "username": db_admin["username"],
            "email": db_admin["email"]
        }
        token = create_admin_token(token_data)

        logger.info(f"✅ Successful admin login: {db_admin['email']}")

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin",
            "username": db_admin["username"],
            "admin_id": str(db_admin["_id"]),
            "email": db_admin["email"],
            "message": f"🔐 Admin login successful! Welcome back, {db_admin['username']}."
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Admin login error for {admin.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin login failed. Please try again."
        )