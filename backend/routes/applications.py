# from fastapi import APIRouter, HTTPException, Depends, status
# from pydantic import BaseModel
# from typing import Optional, List
# from datetime import datetime
# from database import campaigns_collection, users_collection
# from auth.utils import get_current_user
# from bson import ObjectId

# router = APIRouter(prefix="/applications", tags=["applications"])

# class ApplicationCreate(BaseModel):
#     message: Optional[str] = None

# class StatusUpdate(BaseModel):
#     status: str  # pending, approved, rejected

# # Helper functions
# def validate_object_id(id_str: str) -> ObjectId:
#     try:
#         return ObjectId(id_str)
#     except:
#         raise HTTPException(status_code=400, detail="Invalid ID format")

# def get_campaign_by_id(campaign_id: str) -> dict:
#     campaign = campaigns_collection.find_one({"_id": validate_object_id(campaign_id)})
#     if not campaign:
#         raise HTTPException(status_code=404, detail="Campaign not found")
#     campaign["_id"] = str(campaign["_id"])
#     return campaign

# def check_user_permission(current_user: dict, required_roles: list = None, campaign_brand_id: str = None):
#     if required_roles and current_user["role"] not in required_roles:
#         raise HTTPException(status_code=403, detail="Insufficient permissions")
#     if campaign_brand_id and current_user["role"] == "brand" and str(current_user["_id"]) != campaign_brand_id:
#         raise HTTPException(status_code=403, detail="Not authorized for this campaign")
#     return True

# # Routes
# @router.post("/{campaign_id}/apply", response_model=dict)
# async def apply_to_campaign_endpoint(
#     campaign_id: str, 
#     application: ApplicationCreate, 
#     current_user: dict = Depends(get_current_user)
# ):
#     check_user_permission(current_user, ["influencer"])
    
#     campaign = get_campaign_by_id(campaign_id)
#     if campaign.get("status") != "active":
#         raise HTTPException(status_code=400, detail="Campaign is not active")
    
#     existing_application = next(
#         (app for app in campaign.get("applications", []) 
#          if app["influencer_id"] == str(current_user["_id"])), 
#         None
#     )
    
#     if existing_application:
#         if existing_application.get("status") == "rejected":
#             campaigns_collection.update_one(
#                 {"_id": ObjectId(campaign_id)},
#                 {"$pull": {"applications": {"influencer_id": str(current_user["_id"])}}}
#             )
#         else:
#             raise HTTPException(status_code=400, detail="You have already applied to this campaign")
    
#     application_dict = {
#         "influencer_id": str(current_user["_id"]),
#         "influencer_name": current_user["username"],
#         "status": "pending",
#         "message": application.message,
#         "applied_at": datetime.utcnow()
#     }
    
#     result = campaigns_collection.update_one(
#         {"_id": ObjectId(campaign_id)},
#         {"$push": {"applications": application_dict}}
#     )
    
#     if not result.modified_count:
#         raise HTTPException(status_code=500, detail="Failed to submit application")
    
#     return {"message": "Application submitted successfully"}

# @router.get("/brand", response_model=List[dict])
# async def get_brand_applications_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["brand"])
    
#     campaigns = list(campaigns_collection.find({
#         "brand_id": str(current_user["_id"]),
#         "applications": {"$exists": True, "$ne": []}
#     }))
    
#     applications = []
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
#         for app in campaign.get("applications", []):
#             app_data = app.copy()
#             app_data["campaign_id"] = campaign["_id"]
#             app_data["campaign_title"] = campaign["title"]
#             app_data["campaign_status"] = campaign["status"]
#             app_data["campaign_image"] = campaign.get("campaign_image")
#             app_data["currency"] = campaign.get("currency", "USD")
#             applications.append(app_data)
    
#     return applications

# @router.put("/{campaign_id}/{influencer_id}", response_model=dict)
# async def update_application_status_endpoint(
#     campaign_id: str, 
#     influencer_id: str, 
#     status_update: StatusUpdate, 
#     current_user: dict = Depends(get_current_user)
# ):
#     check_user_permission(current_user, ["brand"])
    
#     campaign = get_campaign_by_id(campaign_id)
#     check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
#     result = campaigns_collection.update_one(
#         {
#             "_id": ObjectId(campaign_id),
#             "applications.influencer_id": influencer_id
#         },
#         {
#             "$set": {"applications.$.status": status_update.status}
#         }
#     )
    
#     if not result.modified_count:
#         raise HTTPException(status_code=404, detail="Application not found")
    
#     return {"message": f"Application {status_update.status} successfully"}

# @router.get("/influencer", response_model=List[dict])
# async def get_influencer_applications_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["influencer"])
    
#     campaigns = list(campaigns_collection.find({
#         "applications.influencer_id": str(current_user["_id"])
#     }))
    
#     applications = []
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
#         for app in campaign.get("applications", []):
#             if app["influencer_id"] == str(current_user["_id"]):
#                 app_data = app.copy()
#                 app_data["campaign_id"] = campaign["_id"]
#                 app_data["campaign_title"] = campaign["title"]
#                 app_data["brand_id"] = campaign["brand_id"]
#                 app_data["campaign_status"] = campaign["status"]
#                 app_data["campaign_image"] = campaign.get("campaign_image")
#                 app_data["campaign_video"] = campaign.get("campaign_video")
#                 app_data["currency"] = campaign.get("currency", "USD")
                
#                 brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#                 if brand:
#                     app_data["brand_name"] = brand.get("username", "Unknown Brand")
                
#                 applications.append(app_data)
    
#     return applications