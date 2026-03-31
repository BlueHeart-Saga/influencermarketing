# from fastapi import APIRouter, Depends, HTTPException
# from database import settings_collection
# from auth.utils import get_current_user
# from pydantic import BaseModel
# from typing import Optional, Dict, Any

# router = APIRouter()

# class PlatformSettings(BaseModel):
#     allow_registrations: bool = True
#     auto_approve_influencers: bool = False
#     max_campaigns_per_brand: int = 5
#     min_followers_for_verification: int = 10000
#     enable_email_notifications: bool = True

# @router.get("/platform-settings", response_model=PlatformSettings)
# async def get_platform_settings(admin=Depends(get_current_user)):
#     settings = settings_collection.find_one({"name": "platform_settings"})
#     if not settings:
#         # Return default settings if none exist
#         default_settings = PlatformSettings().dict()
#         settings_collection.insert_one({
#             "name": "platform_settings",
#             **default_settings
#         })
#         return default_settings
#     return settings

# @router.put("/platform-settings")
# async def update_platform_settings(
#     settings: PlatformSettings, 
#     admin=Depends(get_current_user)
# ):
#     settings_collection.update_one(
#         {"name": "platform_settings"},
#         {"$set": settings.dict()},
#         upsert=True
#     )
#     return {"message": "Platform settings updated successfully"}