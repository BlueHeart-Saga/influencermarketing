# from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
# from pydantic import BaseModel, Field, ConfigDict
# from pydantic_core import core_schema
# from pydantic import GetCoreSchemaHandler
# from typing import Optional, List, Any, Dict
# from datetime import datetime
# from database import campaigns_collection, users_collection, payments_collection, earnings_collection, withdrawals_collection, messages_collection, fs
# from auth.utils import get_current_user
# from bson import ObjectId
# from bson.errors import InvalidId
# import os
# import uuid
# from fastapi.responses import StreamingResponse
# from gridfs import GridFS
# from io import BytesIO


# router = APIRouter()

# # -------------------- CUSTOM OBJECTID --------------------
# class PyObjectId(ObjectId):
#     """Custom ObjectId type for Pydantic v2 compatibility"""

#     @classmethod
#     def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: GetCoreSchemaHandler):
#         return core_schema.no_info_after_validator_function(
#             cls.validate,
#             core_schema.str_schema()
#         )

#     @classmethod
#     def validate(cls, v: Any) -> ObjectId:
#         if not ObjectId.is_valid(v):
#             raise ValueError("Invalid ObjectId")
#         return ObjectId(v)

#     @classmethod
#     def __get_pydantic_json_schema__(cls, core_schema: Any, handler: GetCoreSchemaHandler):
#         json_schema = handler(core_schema)
#         json_schema.update(type="string", examples=["64f8c2e9e9d1f9b1a0a7d2f3"])
#         return json_schema

# class CampaignBase(BaseModel):
#     title: str
#     description: str
#     requirements: str
#     budget: float
#     category: str
#     deadline: datetime
#     status: str = "active"  # active, paused, completed
#     currency: str = "USD"   # currency field

# class CampaignCreate(CampaignBase):
#     brand_id: str

# class CampaignUpdate(BaseModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     requirements: Optional[str] = None
#     budget: Optional[float] = None
#     category: Optional[str] = None
#     deadline: Optional[datetime] = None
#     status: Optional[str] = None
#     currency: Optional[str] = None
#     campaign_image_id: Optional[str] = None
#     campaign_video_id: Optional[str] = None

# class Campaign(CampaignBase):
#     id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
#     brand_id: str
#     created_at: datetime = Field(default_factory=datetime.utcnow)
#     applications: List[dict] = []
#     campaign_image_id: Optional[str] = None
#     campaign_video_id: Optional[str] = None

#     model_config = {
#         "populate_by_name": True,
#         "arbitrary_types_allowed": True,
#         "json_encoders": {ObjectId: str},
#     }

# # -------------------- APPLICATION SCHEMAS --------------------
# class ApplicationCreate(BaseModel):
#     message: Optional[str] = None

# class StatusUpdate(BaseModel):
#     status: str  # pending, approved, rejected

# # -------------------- MESSAGE SCHEMAS --------------------
# class MessageCreate(BaseModel):
#     content: str
#     message_type: str = "text"

# class MessageRequest(BaseModel):
#     message: str

# # -------------------- ADMIN STATS --------------------
# class CampaignStats(BaseModel):
#     total: int
#     active: int
#     paused: int
#     completed: int

# # -------------------- PAYMENT SCHEMAS --------------------
# class PaymentBase(BaseModel):
#     campaign_id: str
#     brand_id: str
#     influencer_id: str
#     amount: float
#     payment_method: str

# class PaymentCreate(PaymentBase):
#     pass

# # -------------------- EARNING SCHEMAS --------------------
# class EarningBase(BaseModel):
#     influencer_id: str
#     campaign_id: str
#     amount: float
#     status: str = "pending"

# class EarningCreate(EarningBase):
#     pass

# # -------------------- WITHDRAWAL SCHEMAS --------------------
# class WithdrawalBase(BaseModel):
#     influencer_id: str
#     amount: float
#     payment_method: str
#     account_details: dict

# class WithdrawalCreate(WithdrawalBase):
#     pass

# # -------------------- HELPER FUNCTIONS --------------------
# def validate_object_id(id_str: str) -> ObjectId:
#     """Validate and convert string to ObjectId"""
#     try:
#         return ObjectId(id_str)
#     except InvalidId:
#         raise HTTPException(status_code=400, detail="Invalid ID format")

# def get_user_by_id(user_id: str) -> dict:
#     """Get user by ID"""
#     user = users_collection.find_one({"_id": validate_object_id(user_id)})
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     user["_id"] = str(user["_id"])
#     return user

# def get_campaign_by_id(campaign_id: str) -> dict:
#     """Get a campaign by ID"""
#     campaign = campaigns_collection.find_one({"_id": validate_object_id(campaign_id)})
#     if not campaign:
#         raise HTTPException(status_code=404, detail="Campaign not found")
#     campaign["_id"] = str(campaign["_id"])
#     return campaign

# def check_user_permission(current_user: dict, required_roles: List[str] = None, 
#                          campaign_brand_id: str = None, influencer_id: str = None) -> bool:
#     """Check if user has permission to perform an action"""
#     if required_roles and current_user["role"] not in required_roles:
#         raise HTTPException(status_code=403, detail="Insufficient permissions")
    
#     if campaign_brand_id and current_user["role"] == "brand" and str(current_user["_id"]) != campaign_brand_id:
#         raise HTTPException(status_code=403, detail="Not authorized for this campaign")
    
#     if influencer_id and current_user["role"] == "influencer" and str(current_user["_id"]) != influencer_id:
#         raise HTTPException(status_code=403, detail="Not authorized for this influencer")
    
#     return True

# # -------------------- GRIDFS OPERATIONS --------------------
# async def save_file_to_storage(upload_file: UploadFile, file_type: str) -> str:
#     """Save uploaded file to GridFS and return file ID"""
#     try:
#         content = await upload_file.read()
#         filename = f"{file_type}_{uuid.uuid4()}_{upload_file.filename}"
        
#         file_id = fs.put(
#             content,
#             filename=filename,
#             content_type=upload_file.content_type,
#             metadata={
#                 "original_filename": upload_file.filename,
#                 "file_type": file_type,
#                 "uploaded_at": datetime.utcnow()
#             }
#         )
        
#         return str(file_id)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

# def get_file_from_storage(file_id: str):
#     """Get file from GridFS by ID"""
#     oid = validate_object_id(file_id)
#     try:
#         return fs.get(oid)
#     except Exception:
#         raise HTTPException(status_code=404, detail="File not found")


# def delete_file_from_storage(file_id: str) -> bool:
#     """Delete file from GridFS by ID"""
#     oid = validate_object_id(file_id)
#     try:
#         fs.delete(oid)
#         return True
#     except Exception as e:
#         # Log the error if needed
#         return False

# # -------------------- CAMPAIGN OPERATIONS --------------------
# def create_campaign(campaign_data: dict) -> str:
#     """Create a new campaign"""
#     result = campaigns_collection.insert_one(campaign_data)
#     return str(result.inserted_id)

# def get_campaigns_by_brand(brand_id: str) -> List[dict]:
#     """Get all campaigns for a specific brand"""
#     campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
#     return campaigns

# def get_available_campaigns_for_influencer(influencer_id: str) -> List[dict]:
#     """Get campaigns available for an influencer to apply to"""
#     campaigns = list(campaigns_collection.find({
#         "status": "active",
#         "applications.influencer_id": {"$ne": influencer_id}
#     }))
    
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
        
#         # Add brand info to each campaign
#         brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#         if brand:
#             campaign["brand_name"] = brand.get("username", "Unknown Brand")
#             campaign["brand_email"] = brand.get("email", "No email")
    
#     return campaigns

# def update_campaign(campaign_id: str, update_data: dict) -> bool:
#     try:
#         result = campaigns_collection.update_one(
#             {"_id": ObjectId(campaign_id)},
#             {"$set": update_data}
#         )
#         return result.matched_count > 0
#     except Exception as e:
#         print("Update error:", e)
#         return False

# def delete_campaign(campaign_id: str) -> bool:
#     """Delete a campaign"""
#     campaign = get_campaign_by_id(campaign_id)
    
#     # Delete associated media files from GridFS
#     if campaign.get("campaign_image_id"):
#         delete_file_from_storage(campaign["campaign_image_id"])
    
#     if campaign.get("campaign_video_id"):
#         delete_file_from_storage(campaign["campaign_video_id"])
    
#     result = campaigns_collection.delete_one({"_id": validate_object_id(campaign_id)})
#     return result.deleted_count > 0

# def add_application_to_campaign(campaign_id: str, application_data: dict) -> bool:
#     """Add an application to a campaign"""
#     result = campaigns_collection.update_one(
#         {"_id": validate_object_id(campaign_id)},
#         {"$push": {"applications": application_data}}
#     )
#     return result.modified_count > 0

# def update_application_status(campaign_id: str, influencer_id: str, status: str) -> bool:
#     """Update the status of an application"""
#     result = campaigns_collection.update_one(
#         {
#             "_id": validate_object_id(campaign_id),
#             "applications.influencer_id": influencer_id
#         },
#         {
#             "$set": {"applications.$.status": status}
#         }
#     )
#     return result.modified_count > 0

# def get_campaigns_with_applications(brand_id: str) -> List[dict]:
#     """Get all campaigns with applications for a brand"""
#     campaigns = list(campaigns_collection.find({
#         "brand_id": brand_id,
#         "applications": {"$exists": True, "$ne": []}
#     }))
    
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
#     return campaigns

# def get_influencer_applications(influencer_id: str) -> List[dict]:
#     """Get all applications for an influencer"""
#     campaigns = list(campaigns_collection.find({
#         "applications.influencer_id": influencer_id
#     }))
    
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
        
#         # Add brand info to each campaign
#         brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#         if brand:
#             campaign["brand_name"] = brand.get("username", "Unknown Brand")
#             campaign["brand_email"] = brand.get("email", "No email")
    
#     return campaigns

# def get_all_campaigns_admin() -> List[dict]:
#     """Get all campaigns for admin view"""
#     campaigns = list(campaigns_collection.find())
#     for campaign in campaigns:
#         campaign["_id"] = str(campaign["_id"])
        
#         # Add brand info to each campaign
#         brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#         if brand:
#             campaign["brand_name"] = brand.get("username", "Unknown Brand")
#             campaign["brand_email"] = brand.get("email", "No email")
    
#     return campaigns

# def get_campaign_stats() -> dict:
#     """Get campaign statistics"""
#     total = campaigns_collection.count_documents({})
#     active = campaigns_collection.count_documents({"status": "active"})
#     paused = campaigns_collection.count_documents({"status": "paused"})
#     completed = campaigns_collection.count_documents({"status": "completed"})
    
#     return {
#         "total": total,
#         "active": active,
#         "paused": paused,
#         "completed": completed
#     }

# # -------------------- MESSAGE OPERATIONS --------------------
# def create_message(message_data: dict) -> str:
#     """Create a new message"""
#     result = messages_collection.insert_one(message_data)
#     return str(result.inserted_id)

# def get_messages_between_users(user1_id: str, user2_id: str, campaign_id: str) -> List[dict]:
#     """Get messages between two users for a specific campaign"""
#     query = {
#         "campaign_id": campaign_id,
#         "$or": [
#             {"sender_id": user1_id, "receiver_id": user2_id},
#             {"sender_id": user2_id, "receiver_id": user1_id}
#         ]
#     }
    
#     messages = list(messages_collection.find(query).sort("created_at", 1))
#     for message in messages:
#         message["_id"] = str(message["_id"])
#     return messages

# def mark_messages_as_read(sender_id: str, receiver_id: str, campaign_id: str) -> int:
#     """Mark messages as read"""
#     result = messages_collection.update_many(
#         {
#             "sender_id": sender_id,
#             "receiver_id": receiver_id,
#             "campaign_id": campaign_id,
#             "read": False
#         },
#         {"$set": {"read": True}}
#     )
#     return result.modified_count

# def get_unread_message_count(receiver_id: str) -> int:
#     """Get count of unread messages for a user"""
#     return messages_collection.count_documents({
#         "receiver_id": receiver_id,
#         "read": False
#     })

# def get_user_conversations(user_id: str) -> List[dict]:
#     """Get all conversations for a user"""
#     pipeline = [
#         {
#             "$match": {
#                 "$or": [
#                     {"sender_id": user_id},
#                     {"receiver_id": user_id}
#                 ]
#             }
#         },
#         {
#             "$group": {
#                 "_id": {
#                     "campaign_id": "$campaign_id",
#                     "other_user_id": {
#                         "$cond": [
#                             {"$eq": ["$sender_id", user_id]},
#                             "$receiver_id",
#                             "$sender_id"
#                         ]
#                     }
#                 },
#                 "last_message": {"$last": "$$ROOT"},
#                 "unread_count": {
#                     "$sum": {
#                         "$cond": [
#                             {"$and": [
#                                 {"$eq": ["$receiver_id", user_id]},
#                                 {"$eq": ["$read", False]}
#                             ]},
#                             1,
#                             0
#                         ]
#                     }
#                 }
#             }
#         },
#         {
#             "$sort": {"last_message.created_at": -1}
#         }
#     ]
    
#     conversations = list(messages_collection.aggregate(pipeline))
    
#     for conv in conversations:
#         other_user_id = conv["_id"]["other_user_id"]
#         user = users_collection.find_one({"_id": ObjectId(other_user_id)})
#         if user:
#             conv["other_user_name"] = user.get("username", "Unknown User")
#             conv["other_user_email"] = user.get("email", "No email")
        
#         campaign = campaigns_collection.find_one({"_id": ObjectId(conv["_id"]["campaign_id"])})
#         if campaign:
#             conv["campaign_title"] = campaign.get("title", "Unknown Campaign")
    
#     return conversations

# # -------------------- PAYMENT OPERATIONS --------------------
# def create_payment(payment_data: dict) -> str:
#     """Create a new payment"""
#     result = payments_collection.insert_one(payment_data)
#     return str(result.inserted_id)

# def get_payments_by_brand(brand_id: str) -> List[dict]:
#     """Get all payments for a specific brand"""
#     payments = list(payments_collection.find({"brand_id": brand_id}))
#     for payment in payments:
#         payment["_id"] = str(payment["_id"])
#     return payments

# def get_payment_by_id(payment_id: str) -> dict:
#     """Get a payment by ID"""
#     payment = payments_collection.find_one({"_id": validate_object_id(payment_id)})
#     if not payment:
#         raise HTTPException(status_code=404, detail="Payment not found")
#     payment["_id"] = str(payment["_id"])
#     return payment

# def update_payment_status(payment_id: str, status: str, transaction_id: Optional[str] = None) -> bool:
#     """Update payment status"""
#     update_data = {"status": status}
#     if transaction_id:
#         update_data["transaction_id"] = transaction_id
        
#     result = payments_collection.update_one(
#         {"_id": validate_object_id(payment_id)},
#         {"$set": update_data}
#     )
#     return result.modified_count > 0

# # -------------------- EARNINGS OPERATIONS --------------------

# # -------------------- WITHDRAWAL OPERATIONS --------------------

# # -------------------- CAMPAIGN ROUTES --------------------
# @router.post("/campaigns", response_model=dict)
# async def create_campaign_endpoint(
#     title: str = Form(...),
#     description: str = Form(...),
#     requirements: str = Form(...),
#     budget: float = Form(...),
#     category: str = Form(...),
#     deadline: datetime = Form(...),
#     currency: str = Form("USD"),
#     status: str = Form("active"),
#     brand_id: str = Form(...),
#     campaign_image: Optional[UploadFile] = File(None),
#     campaign_video: Optional[UploadFile] = File(None),
#     current_user: dict = Depends(get_current_user)
# ):
#     check_user_permission(current_user, ["brand"])
    
#     if str(current_user["_id"]) != brand_id:
#         raise HTTPException(status_code=403, detail="You can only create campaigns for your own brand")
    
#     # Save uploaded files to GridFS
#     campaign_image_id = None
#     campaign_video_id = None
    
#     if campaign_image:
#         campaign_image_id = await save_file_to_storage(campaign_image, "image")
    
#     if campaign_video:
#         campaign_video_id = await save_file_to_storage(campaign_video, "video")
    
#     campaign_dict = {
#         "title": title,
#         "description": description,
#         "requirements": requirements,
#         "budget": budget,
#         "category": category,
#         "deadline": deadline,
#         "currency": currency,
#         "status": status,
#         "brand_id": brand_id,
#         "created_at": datetime.utcnow(),
#         "applications": [],
#         "campaign_image_id": campaign_image_id,
#         "campaign_video_id": campaign_video_id
#     }
    
#     campaign_id = create_campaign(campaign_dict)
#     return {"message": "Campaign created successfully", "campaign_id": campaign_id}

# @router.get("/brand/campaigns", response_model=List[dict])
# async def get_brand_campaigns_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["brand"])
    
#     campaigns = get_campaigns_by_brand(str(current_user["_id"]))
#     return campaigns

# @router.get("/influencer/campaigns", response_model=List[dict])
# async def get_available_campaigns_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["influencer"])
    
#     available_campaigns = get_available_campaigns_for_influencer(str(current_user["_id"]))
#     return available_campaigns

# @router.post("/campaigns/{campaign_id}/apply", response_model=dict)
# async def apply_to_campaign_endpoint(campaign_id: str, application: ApplicationCreate, current_user: dict = Depends(get_current_user)):
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
    
#     success = add_application_to_campaign(campaign_id, application_dict)
#     if not success:
#         raise HTTPException(status_code=500, detail="Failed to submit application")
    
#     return {"message": "Application submitted successfully"}

# @router.get("/brand/applications", response_model=List[dict])
# async def get_brand_applications_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["brand"])
    
#     campaigns = get_campaigns_with_applications(str(current_user["_id"]))
    
#     applications = []
#     for campaign in campaigns:
#         for app in campaign.get("applications", []):
#             app_data = app.copy()
#             app_data["campaign_id"] = campaign["_id"]
#             app_data["campaign_title"] = campaign["title"]
#             app_data["campaign_status"] = campaign["status"]
#             app_data["campaign_image_id"] = campaign.get("campaign_image_id")
#             app_data["currency"] = campaign.get("currency", "USD")
#             applications.append(app_data)
    
#     return applications

# @router.put("/applications/{campaign_id}/{influencer_id}", response_model=dict)
# async def update_application_status_endpoint(
#     campaign_id: str, 
#     influencer_id: str, 
#     status_update: StatusUpdate, 
#     current_user: dict = Depends(get_current_user)
# ):
#     check_user_permission(current_user, ["brand"])
    
#     campaign = get_campaign_by_id(campaign_id)
#     check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
#     success = update_application_status(campaign_id, influencer_id, status_update.status)
#     if not success:
#         raise HTTPException(status_code=404, detail="Application not found")
    
#     return {"message": f"Application {status_update.status} successfully"}

# @router.get("/influencer/applications", response_model=List[dict])
# async def get_influencer_applications_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["influencer"])
    
#     campaigns = get_influencer_applications(str(current_user["_id"]))
    
#     applications = []
#     for campaign in campaigns:
#         for app in campaign.get("applications", []):
#             if app["influencer_id"] == str(current_user["_id"]):
#                 app_data = app.copy()
#                 app_data["campaign_id"] = campaign["_id"]
#                 app_data["campaign_title"] = campaign["title"]
#                 app_data["brand_id"] = campaign["brand_id"]
#                 app_data["campaign_status"] = campaign["status"]
#                 app_data["campaign_image_id"] = campaign.get("campaign_image_id")
#                 app_data["campaign_video_id"] = campaign.get("campaign_video_id")
#                 app_data["currency"] = campaign.get("currency", "USD")
                
#                 brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#                 if brand:
#                     app_data["brand_name"] = brand.get("username", "Unknown Brand")
                
#                 applications.append(app_data)
    
#     return applications

# @router.put("/campaigns/{campaign_id}", response_model=dict)
# async def update_campaign_endpoint(
#     campaign_id: str,
#     title: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     requirements: Optional[str] = Form(None),
#     budget: Optional[float] = Form(None),
#     category: Optional[str] = Form(None),
#     deadline: Optional[datetime] = Form(None),
#     status: Optional[str] = Form(None),
#     currency: Optional[str] = Form(None),
#     campaign_image: Optional[UploadFile] = File(None),
#     campaign_video: Optional[UploadFile] = File(None),
#     current_user: dict = Depends(get_current_user),
# ):
#     if not ObjectId.is_valid(campaign_id):
#         raise HTTPException(status_code=400, detail="Invalid campaign ID")

#     campaign = get_campaign_by_id(campaign_id)
#     if not campaign:
#         raise HTTPException(status_code=404, detail="Campaign not found")

#     if current_user["role"] == "brand":
#         check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
#     elif current_user["role"] != "admin":
#         raise HTTPException(
#             status_code=403, detail="Only brands and admins can update campaigns"
#         )

#     update_data = {}

#     for field_name, field_value in {
#         "title": title,
#         "description": description,
#         "requirements": requirements,
#         "budget": budget,
#         "category": category,
#         "deadline": deadline,
#         "status": status,
#         "currency": currency,
#     }.items():
#         if field_value is not None:
#             update_data[field_name] = field_value

#     if campaign_image:
#         if campaign.get("campaign_image_id"):
#             delete_file_from_storage(campaign["campaign_image_id"])
        
#         campaign_image_id = await save_file_to_storage(campaign_image, "image")
#         update_data["campaign_image_id"] = campaign_image_id

#     if campaign_video:
#         if campaign.get("campaign_video_id"):
#             delete_file_from_storage(campaign["campaign_video_id"])
        
#         campaign_video_id = await save_file_to_storage(campaign_video, "video")
#         update_data["campaign_video_id"] = campaign_video_id

#     success = update_campaign(campaign_id, update_data)

#     if not success:
#         raise HTTPException(status_code=404, detail="Campaign not found")

#     return {"message": "Campaign updated successfully"}

# @router.delete("/campaigns/{campaign_id}", response_model=dict)
# async def delete_campaign_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
#     campaign = get_campaign_by_id(campaign_id)
    
#     if current_user["role"] == "brand":
#         check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
#     elif current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Only brands and admins can delete campaigns")
    
#     success = delete_campaign(campaign_id)
#     if not success:
#         raise HTTPException(status_code=500, detail="Failed to delete campaign")
    
#     return {"message": "Campaign deleted successfully"}

# @router.get("/campaigns/{campaign_id}", response_model=dict)
# async def get_campaign_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
#     campaign = get_campaign_by_id(campaign_id)
    
#     if current_user["role"] == "brand":
#         check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
#     brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#     if brand:
#         campaign["brand_name"] = brand.get("username", "Unknown Brand")
    
#     return campaign

# # -------------------- MEDIA ROUTES --------------------
# @router.get("/campaigns/{campaign_id}/image")
# async def get_campaign_image(campaign_id: str):
#     campaign = get_campaign_by_id(campaign_id)
    
#     if not campaign.get("campaign_image_id"):
#         raise HTTPException(status_code=404, detail="Campaign image not found")
    
#     file_obj = get_file_from_storage(campaign["campaign_image_id"])
    
#     return StreamingResponse(
#         BytesIO(file_obj),
#         media_type=file_obj.content_type,
#         headers={"Content-Disposition": f"inline; filename={file_obj.filename}"}
#     )

# @router.get("/campaigns/{campaign_id}/video")
# async def get_campaign_video(campaign_id: str):
#     campaign = get_campaign_by_id(campaign_id)
    
#     if not campaign.get("campaign_video_id"):
#         raise HTTPException(status_code=404, detail="Campaign video not found")
    
#     file_obj = get_file_from_storage(campaign["campaign_video_id"])
    
#     return StreamingResponse(
#         BytesIO(file_obj),
#         media_type=file_obj.content_type,
#         headers={"Content-Disposition": f"inline; filename={file_obj.filename}"}
#     )

# @router.get("/campaigns/image/{file_id}")
# async def get_campaign_image_by_id(file_id: str):
#     """Get campaign image by file ID"""
#     file_obj = get_file_from_storage(file_id)
    
#     return StreamingResponse(
#         BytesIO(file_obj),
#         media_type=file_obj.content_type,
#         headers={"Content-Disposition": f"inline; filename={file_obj.filename}"}
#     )

# @router.get("/campaigns/video/{file_id}")
# async def get_campaign_video_by_id(file_id: str):
#     """Get campaign video by file ID"""
#     file_obj = get_file_from_storage(file_id)
    
#     return StreamingResponse(
#         BytesIO(file_obj),
#         media_type=file_obj.content_type,
#         headers={"Content-Disposition": f"inline; filename={file_obj.filename}"}
#     )

# # -------------------- MESSAGE ROUTES --------------------
# @router.post("/applications/contact", response_model=dict)
# async def send_message_to_influencer(
#     campaign_id: str = Form(...),
#     influencer_id: str = Form(...),
#     message: str = Form(...),
#     attachments: List[UploadFile] = File([]),
#     current_user: dict = Depends(get_current_user)
# ):
#     campaign = get_campaign_by_id(campaign_id)
    
#     is_brand_owner = current_user["role"] == "brand" and campaign["brand_id"] == str(current_user["_id"])
#     is_influencer = current_user["role"] == "influencer" and influencer_id == str(current_user["_id"])
    
#     if not (is_brand_owner or is_influencer):
#         raise HTTPException(status_code=403, detail="You can only message participants of this campaign")
    
#     sender_id = str(current_user["_id"])
#     receiver_id = influencer_id if current_user["role"] == "brand" else campaign["brand_id"]
    
#     attachment_data = []
#     for attachment in attachments:
#         try:
#             attachment_id = await save_file_to_storage(attachment, "message_attachment")
            
#             attachment_data.append({
#                 "file_id": attachment_id,
#                 "filename": attachment.filename,
#                 "content_type": attachment.content_type,
#                 "size": attachment.size
#             })
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
#     message_data = {
#         "sender_id": sender_id,
#         "receiver_id": receiver_id,
#         "campaign_id": campaign_id,
#         "content": message,
#         "message_type": "text" if not attachment_data else "file",
#         "attachments": attachment_data,
#         "created_at": datetime.utcnow(),
#         "read": False
#     }
    
#     message_id = create_message(message_data)
#     return {"message": "Message sent successfully", "message_id": message_id}

# @router.get("/applications/{campaign_id}/messages/{other_user_id}", response_model=List[dict])
# async def get_messages(
#     campaign_id: str,
#     other_user_id: str,
#     current_user: dict = Depends(get_current_user)
# ):
#     campaign = get_campaign_by_id(campaign_id)
    
#     is_brand_owner = current_user["role"] == "brand" and campaign["brand_id"] == str(current_user["_id"])
#     is_influencer = current_user["role"] == "influencer" and other_user_id == str(current_user["_id"])
    
#     if not (is_brand_owner or is_influencer):
#         raise HTTPException(status_code=403, detail="You can only view messages for campaigns you're involved in")
    
#     if other_user_id != str(current_user["_id"]):
#         mark_messages_as_read(other_user_id, str(current_user["_id"]), campaign_id)
    
#     messages = get_messages_between_users(str(current_user["_id"]), other_user_id, campaign_id)
    
#     for msg in messages:
#         sender = users_collection.find_one({"_id": ObjectId(msg["sender_id"])})
#         if sender:
#             msg["sender_name"] = sender.get("username", "Unknown User")
        
#         receiver = users_collection.find_one({"_id": ObjectId(msg["receiver_id"])})
#         if receiver:
#             msg["receiver_name"] = receiver.get("username", "Unknown User")
    
#     return messages

# @router.get("/conversations", response_model=List[dict])
# async def get_conversations(current_user: dict = Depends(get_current_user)):
#     conversations = get_user_conversations(str(current_user["_id"]))
#     return conversations

# @router.get("/messages/unread/count", response_model=dict)
# async def get_unread_count(current_user: dict = Depends(get_current_user)):
#     count = get_unread_message_count(str(current_user["_id"]))
#     return {"unread_count": count}

# @router.get("/messages/{message_id}/attachment/{attachment_index}")
# async def download_attachment(
#     message_id: str,
#     attachment_index: int,
#     current_user: dict = Depends(get_current_user)
# ):
#     message = messages_collection.find_one({"_id": validate_object_id(message_id)})
#     if not message:
#         raise HTTPException(status_code=404, detail="Message not found")
    
#     if (str(current_user["_id"]) not in [message["sender_id"], message["receiver_id"]]):
#         raise HTTPException(status_code=403, detail="You don't have permission to access this attachment")
    
#     if not message.get("attachments") or attachment_index >= len(message["attachments"]):
#         raise HTTPException(status_code=404, detail="Attachment not found")
    
#     attachment = message["attachments"][attachment_index]
#     file_obj = get_file_from_storage(attachment["file_id"])
    
#     return StreamingResponse(
#         BytesIO(file_obj),
#         media_type=attachment["content_type"],
#         headers={"Content-Disposition": f"attachment; filename={attachment['filename']}"}
#     )

# # -------------------- ADMIN ROUTES --------------------
# @router.get("/admin/campaigns", response_model=List[dict])
# async def get_all_campaigns_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["admin"])
    
#     campaigns = get_all_campaigns_admin()
#     return campaigns

# @router.put("/admin/campaigns/{campaign_id}/status", response_model=dict)
# async def admin_update_campaign_status_endpoint(
#     campaign_id: str, 
#     status_update: StatusUpdate, 
#     current_user: dict = Depends(get_current_user)
# ):
#     check_user_permission(current_user, ["admin"])
    
#     valid_statuses = ["active", "paused", "completed"]
#     if status_update.status not in valid_statuses:
#         raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
#     success = update_campaign(campaign_id, {"status": status_update.status})
#     if not success:
#         raise HTTPException(status_code=404, detail="Campaign not found")
    
#     return {"message": f"Campaign status updated to {status_update.status}"}

# @router.delete("/admin/campaigns/{campaign_id}", response_model=dict)
# async def admin_delete_campaign_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["admin"])
    
#     success = delete_campaign(campaign_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="Campaign not found")
    
#     return {"message": "Campaign deleted successfully"}

# @router.get("/admin/campaigns/stats", response_model=CampaignStats)
# async def get_campaign_stats_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["admin"])
    
#     stats = get_campaign_stats()
#     return CampaignStats(**stats)

# @router.get("/admin/campaigns/{campaign_id}", response_model=dict)
# async def get_campaign_detail_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["admin"])
    
#     campaign = get_campaign_by_id(campaign_id)
    
#     try:
#         brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
#         if brand:
#             campaign["brand_name"] = brand.get("username", "Unknown Brand")
#             campaign["brand_email"] = brand.get("email", "No email")
#     except InvalidId:
#         campaign["brand_name"] = "Invalid Brand ID"
#         campaign["brand_email"] = "Invalid Brand ID"
    
#     for application in campaign.get("applications", []):
#         try:
#             influencer = users_collection.find_one({"_id": ObjectId(application["influencer_id"])})
#             if influencer:
#                 application["influencer_name"] = influencer.get("username", "Unknown Influencer")
#                 application["influencer_email"] = influencer.get("email", "No email")
#         except (InvalidId, KeyError):
#             application["influencer_name"] = "Invalid Influencer ID"
#             application["influencer_email"] = "Invalid Influencer ID"
    
#     return campaign

# # -------------------- PAYMENT ROUTES --------------------
# @router.post("/payments", response_model=dict)
# async def create_payment_endpoint(payment: PaymentCreate, current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["brand"])
    
#     if str(current_user["_id"]) != payment.brand_id:
#         raise HTTPException(status_code=403, detail="You can only create payments for your own brand")
    
#     campaign = get_campaign_by_id(payment.campaign_id)
#     if not campaign or campaign.get("brand_id") != payment.brand_id:
#         raise HTTPException(status_code=404, detail="Campaign not found or doesn't belong to your brand")
    
#     payment_dict = payment.model_dump()
#     payment_dict["status"] = "pending"
#     payment_dict["payment_date"] = datetime.utcnow()
    
#     payment_id = create_payment(payment_dict)
    
#     earning_dict = {
#         "influencer_id": payment.influencer_id,
#         "campaign_id": payment.campaign_id,
#         "amount": payment.amount,
#         "status": "pending",
#         "earned_at": datetime.utcnow()
#     }
    
#     create_earning(earning_dict)
    
#     return {"message": "Payment created successfully", "payment_id": payment_id}

# @router.get("/brand/payments", response_model=List[dict])
# async def get_brand_payments_endpoint(current_user: dict = Depends(get_current_user)):
#     check_user_permission(current_user, ["brand"])
    
#     payments = get_payments_by_brand(str(current_user["_id"]))
    
#     for payment in payments:
#         campaign = get_campaign_by_id(payment["campaign_id"])
#         if campaign:
#             payment["campaign_title"] = campaign.get("title", "Unknown Campaign")
        
#         brand = users_collection.find_one({"_id": ObjectId(payment["brand_id"])})
#         if brand:
#             payment["brand_name"] = brand.get("username", "Unknown Brand")
        
#         influencer = users_collection.find_one({"_id": ObjectId(payment["influencer_id"])})
#         if influencer:
#             payment["influencer_name"] = influencer.get("username", "Unknown Influencer")
    
#     return payments

# @router.put("/payments/{payment_id}/status", response_model=dict)
# async def update_payment_status_endpoint(
#     payment_id: str, 
#     status_update: StatusUpdate, 
#     current_user: dict = Depends(get_current_user)
# ):
#     payment = get_payment_by_id(payment_id)
    
#     if current_user["role"] == "brand":
#         check_user_permission(current_user, campaign_brand_id=payment["brand_id"])
#     elif current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Only admins and brands can update payment status")
    
#     success = update_payment_status(payment_id, status_update.status)
#     if not success:
#         raise HTTPException(status_code=500, detail="Failed to update payment status")
    
#     if status_update.status == "completed":
#         earnings = list(earnings_collection.find({
#             "campaign_id": payment["campaign_id"],
#             "influencer_id": payment["influencer_id"]
#         }))
        
#         for earning in earnings:
#             update_earning_status(str(earning["_id"]), "paid")
    
#     return {"message": f"Payment status updated to {status_update.status}"}

# # -------------------- EARNINGS ROUTES --------------------






from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form, BackgroundTasks, Query, Request
from pydantic import BaseModel, Field, ConfigDict, EmailStr, validator
from pydantic_core import core_schema
from pydantic import GetCoreSchemaHandler
from typing import Optional, List, Any, Dict, Union
from datetime import datetime, timedelta
from database import campaigns_collection, users_collection, payments_collection, earnings_collection, withdrawals_collection, messages_collection, storage as storage_provider, bookmarks_collection, likes_collection

from auth.utils import get_subscription_benefits, get_current_user
from bson import ObjectId
from bson.errors import InvalidId
import os
import uuid
from fastapi.responses import StreamingResponse, JSONResponse
from io import BytesIO
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import json
import requests
import requests
from enum import Enum
import logging
from typing import Annotated
import re 

from routes.accountdetails import BankAccountService


from routes.brandnotification import (
    brand_notification_service, 
    trigger_campaign_creation_notifications,
    trigger_application_notifications,
    trigger_payment_notifications,
    trigger_campaign_status_notifications,
    trigger_subscription_notifications,
    trigger_login_notifications,
    trigger_registration_notifications,
    trigger_password_change_notification
)

# Add this import at the top
from routes.influencernotification import (
    influencer_notification_service,
    trigger_influencer_registration_notifications,
    trigger_influencer_login_notifications,
    trigger_influencer_password_change_notification,
    trigger_application_status_notification
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# -------------------- CONFIGURATION --------------------
SMTP_CONFIG = {
    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.getenv("SMTP_PORT", 587)),
    "username": os.getenv("SMTP_USERNAME", ""),
    "password": os.getenv("SMTP_PASSWORD", ""),
    "from_email": os.getenv("FROM_EMAIL", "noreply@influencerplatform.com")
}




# -------------------- ENUMS --------------------
class ApplicationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONTRACTED = "contracted"
    MEDIA_SUBMITTED = "media_submitted"
    COMPLETED = "completed"


class CampaignStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"



class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    DOCUMENT = "document"
    AUDIO = "audio"
    OTHER = "other"

# -------------------- CUSTOM OBJECTID --------------------
class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic v2 compatibility"""

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: GetCoreSchemaHandler):
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema()
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: Any, handler: GetCoreSchemaHandler):
        json_schema = handler(core_schema)
        json_schema.update(type="string", examples=["64f8c2e9e9d1f9b1a0a7d2f3"])
        return json_schema

# -------------------- ENHANCED SCHEMAS --------------------
class CampaignBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    requirements: str = Field(..., min_length=1, max_length=1000)
    budget: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    deadline: datetime
    status: CampaignStatus = CampaignStatus.ACTIVE
    currency: str = "USD"

    @validator('deadline')
    def deadline_must_be_future(cls, v):
        if v <= datetime.utcnow():
            raise ValueError('Deadline must be in the future')
        return v

class CampaignCreate(CampaignBase):
    brand_id: str

class CampaignUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    requirements: Optional[str] = Field(None, min_length=1, max_length=1000)
    budget: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    deadline: Optional[datetime] = None
    status: Optional[CampaignStatus] = None
    currency: Optional[str] = None
    campaign_image_id: Optional[str] = None
    campaign_video_id: Optional[str] = None

    @validator('deadline')
    def deadline_must_be_future(cls, v):
        if v and v <= datetime.utcnow():
            raise ValueError('Deadline must be in the future')
        return v

class Campaign(CampaignBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    brand_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    applications: List[dict] = []
    campaign_image_id: Optional[str] = None
    campaign_video_id: Optional[str] = None
    
    total_views: int = Field(default=0)
    unique_views: int = Field(default=0)
    view_history: List[dict] = Field(default_factory=list)  # Track view details
    
    likes_count: int = Field(default=0)
    liked_by: List[str] = Field(default_factory=list)  # List of user IDs who liked
    bookmarked_by: List[str] = Field(default_factory=list)  # List of user IDs who bookmarked

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }
    
class CampaignResponse(BaseModel):
    id: str
    title: str
    description: str
    budget: float
    category: str
    status: CampaignStatus
    total_views: int = 0
    unique_views: int = 0
    brand_name: Optional[str] = None
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }
    
# Add these to your existing Pydantic schemas section
class LikeRequest(BaseModel):
    campaign_id: str
    like: bool = True  # True to like, False to unlike

class BookmarkRequest(BaseModel):
    campaign_id: str
    bookmark: bool = True  # True to bookmark, False to remove bookmark

class CampaignLikesResponse(BaseModel):
    campaign_id: str
    likes_count: int
    user_liked: bool

class CampaignBookmarksResponse(BaseModel):
    campaign_id: str
    user_bookmarked: bool

class UserLikesResponse(BaseModel):
    liked_campaigns: List[dict]
    total_likes: int

class UserBookmarksResponse(BaseModel):
    bookmarked_campaigns: List[dict]
    total_bookmarks: int

class ApplicationCreate(BaseModel):
    message: Optional[str] = Field(None, max_length=1000)

class ApplicationResponse(BaseModel):
    # Application fields
    influencer_id: str
    influencer_name: str
    status: ApplicationStatus
    message: Optional[str] = None
    applied_at: datetime
    contract_signed: Optional[bool] = None
    contract_signed_at: Optional[datetime] = None
    submitted_media: Optional[List[dict]] = None
    media_submitted_at: Optional[datetime] = None
    
    # Campaign fields
    campaign_id: str
    campaign_title: str
    campaign_description: str
    campaign_requirements: str
    campaign_budget: float
    campaign_category: str
    campaign_deadline: datetime
    campaign_status: CampaignStatus
    campaign_currency: str
    campaign_image_id: Optional[str] = None
    campaign_video_id: Optional[str] = None
    campaign_created_at: datetime
    
    # Brand/Influencer details
    brand_id: str
    brand_name: Optional[str] = None
    brand_email: Optional[str] = None
    influencer_email: Optional[str] = None
    influencer_phone: Optional[str] = None
    influencer_bio: Optional[str] = None
    influencer_social_media: Optional[dict] = None

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }
    
class StatusUpdate(BaseModel):
    status: ApplicationStatus

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    message_type: str = "text"

class CampaignStats(BaseModel):
    total: int
    active: int
    paused: int
    completed: int



class MediaSubmission(BaseModel):
    campaign_id: str
    description: Optional[str] = Field(None, max_length=500)
    media_type: MediaType = MediaType.IMAGE

class ContractAgreement(BaseModel):
    campaign_id: str
    influencer_id: str
    terms_accepted: bool = True
    signed_at: Optional[datetime] = None



class MediaFileResponse(BaseModel):
    file_id: str
    filename: str
    content_type: str
    media_type: MediaType
    size: int
    description: Optional[str] = None
    submitted_at: datetime
    download_url: str
    
    


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
    def send_campaign_limit_notification(user_email: str, username: str, plan_name: str, limit_reason: str, usage: dict):
        """Send notification when user reaches campaign creation limits"""
        subject = f"Campaign Creation Limit Reached - {plan_name}"
        
        body = f"""
        <html>
            <body>
                <h2>Campaign Creation Limit Reached</h2>
                <p>Hello {username},</p>
                
                <p>You've reached the campaign creation limit for your <strong>{plan_name}</strong>.</p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
                    <h4 style="color: #856404; margin-top: 0;">Limit Details</h4>
                    <p><strong>Reason:</strong> {limit_reason}</p>
                    <p><strong>Current Usage:</strong> {usage.get('today_campaigns', 0)} campaigns today</p>
                    <p><strong>Total Campaigns:</strong> {usage.get('total_campaigns', 0)}</p>
                </div>
                
                <h3>Upgrade Your Plan</h3>
                <p>To create more campaigns and access advanced features, consider upgrading your plan:</p>
                <ul>
                    <li><strong>Starter:</strong> 1 campaign per day</li>
                    <li><strong>Pro:</strong> 3 campaigns per day</li>
                    <li><strong>Enterprise:</strong> Unlimited campaigns</li>
                </ul>
                
                <p>Upgrade now to continue growing your influencer marketing campaigns!</p>
                
                <br>
                <p>Best regards,<br>Influencer Platform Team</p>
            </body>
        </html>
        """
        
        return EmailService.send_email(user_email, subject, body)

    @staticmethod
    def send_application_notification(brand_email: str, influencer_name: str, campaign_title: str):
        """Send notification to brand about new application"""
        subject = f"New Application for Campaign: {campaign_title}"
        body = f"""
        <html>
            <body>
                <h2>New Campaign Application</h2>
                <p>You have received a new application for your campaign <strong>{campaign_title}</strong>.</p>
                <p><strong>Influencer:</strong> {influencer_name}</p>
                <p>Please log in to your dashboard to review this application.</p>
                <br>
                <p>Best regards,<br>Influencer Platform Team</p>
            </body>
        </html>
        """
        return EmailService.send_email(brand_email, subject, body)

    @staticmethod
    def send_contract_agreement(influencer_email: str, influencer_name: str, campaign_title: str, brand_name: str, campaign_details: dict):
        """Send contract agreement to influencer"""
        subject = f"Contract Agreement - Campaign: {campaign_title}"
        body = f"""
        <html>
            <body>
                <h2>Contract Agreement</h2>
                <p>Dear {influencer_name},</p>
                <p>Congratulations! Your application for the campaign <strong>{campaign_title}</strong> has been approved by {brand_name}.</p>
                
                <h3>Campaign Details:</h3>
                <ul>
                    <li><strong>Campaign:</strong> {campaign_details.get('title')}</li>
                    <li><strong>Budget:</strong> {campaign_details.get('currency', 'USD')} {campaign_details.get('budget')}</li>
                    <li><strong>Requirements:</strong> {campaign_details.get('requirements')}</li>
                    <li><strong>Deadline:</strong> {campaign_details.get('deadline').strftime('%Y-%m-%d')}</li>
                </ul>
                
                <p>Please log in to the platform to review and accept the contract agreement.</p>
                <p>Once accepted, you can start working on the campaign and submit your media files.</p>
                
                <br>
                <p>Best regards,<br>Influencer Platform Team</p>
            </body>
        </html>
        """
        return EmailService.send_email(influencer_email, subject, body)

    @staticmethod
    def send_payment_receipt(influencer_email: str, influencer_name: str, campaign_title: str, amount: float, currency: str, transaction_id: str):
        """Send payment receipt to influencer"""
        subject = f"Payment Receipt - Campaign: {campaign_title}"
        body = f"""
        <html>
            <body>
                <h2>Payment Receipt</h2>
                <p>Dear {influencer_name},</p>
                <p>We are pleased to inform you that your payment for the campaign <strong>{campaign_title}</strong> has been processed successfully.</p>
                
                <h3>Payment Details:</h3>
                <ul>
                    <li><strong>Amount:</strong> {currency} {amount}</li>
                    <li><strong>Transaction ID:</strong> {transaction_id}</li>
                    <li><strong>Date:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</li>
                    <li><strong>Status:</strong> Completed</li>
                </ul>
                
                <p>Thank you for your excellent work!</p>
                
                <br>
                <p>Best regards,<br>Influencer Platform Team</p>
            </body>
        </html>
        """
        return EmailService.send_email(influencer_email, subject, body)

    @staticmethod
    def send_application_status_update(influencer_email: str, influencer_name: str, campaign_title: str, status: str, brand_name: str):
        """Send application status update to influencer"""
        subject = f"Application Update - Campaign: {campaign_title}"
        
        if status == ApplicationStatus.APPROVED:
            body = f"""
            <html>
                <body>
                    <h2>Application Approved! 🎉</h2>
                    <p>Dear {influencer_name},</p>
                    <p>Great news! Your application for the campaign <strong>{campaign_title}</strong> has been approved by {brand_name}.</p>
                    <p>You will receive a contract agreement shortly. Please review and accept it to proceed with the campaign.</p>
                    <br>
                    <p>Best regards,<br>Influencer Platform Team</p>
                </body>
            </html>
            """
        else:
            body = f"""
            <html>
                <body>
                    <h2>Application Update</h2>
                    <p>Dear {influencer_name},</p>
                    <p>Your application for the campaign <strong>{campaign_title}</strong> has been reviewed by {brand_name}.</p>
                    <p><strong>Status:</strong> {status.capitalize()}</p>
                    <p>We encourage you to apply for other campaigns that match your profile.</p>
                    <br>
                    <p>Best regards,<br>Influencer Platform Team</p>
                </body>
            </html>
            """
        
        return EmailService.send_email(influencer_email, subject, body)


# -------------------- HELPER FUNCTIONS --------------------
def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

def get_user_by_id(user_id: str) -> dict:
    """Get user by ID"""
    user = users_collection.find_one({"_id": validate_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

def get_campaign_by_id(campaign_id: str) -> dict:
    """Get a campaign by ID"""
    campaign = campaigns_collection.find_one({"_id": validate_object_id(campaign_id)})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign["_id"] = str(campaign["_id"])
    return campaign

def check_user_permission(current_user: dict, required_roles: List[str] = None, 
                         campaign_brand_id: str = None, influencer_id: str = None) -> bool:
    """Check if user has permission to perform an action"""
    if required_roles and current_user["role"] not in required_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    if campaign_brand_id and current_user["role"] == "brand" and str(current_user["_id"]) != campaign_brand_id:
        raise HTTPException(status_code=403, detail="Not authorized for this campaign")
    
    if influencer_id and current_user["role"] == "influencer" and str(current_user["_id"]) != influencer_id:
        raise HTTPException(status_code=403, detail="Not authorized for this influencer")
    
    return True





# -------------------- ENHANCED GRIDFS OPERATIONS --------------------
def get_media_type_from_content_type(content_type: str) -> MediaType:
    """Determine media type from content type"""
    if content_type.startswith('image/'):
        return MediaType.IMAGE
    elif content_type.startswith('video/'):
        return MediaType.VIDEO
    elif content_type.startswith('audio/'):
        return MediaType.AUDIO
    elif content_type in ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
        return MediaType.DOCUMENT
    else:
        return MediaType.OTHER

async def save_file_to_storage(upload_file: UploadFile, file_type: str) -> str:
    """Save uploaded file to Storage and return file ID/path"""
    try:
        content = await upload_file.read()
        filename = f"{file_type}_{uuid.uuid4()}_{upload_file.filename}"
        
        file_id = storage_provider.upload(
            content,
            filename=filename,
            folder="campaigns"
        )
        
        return file_id
    except Exception as e:
        logger.error(f"Failed to upload file to Storage: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

def get_file_from_storage(file_id: str) -> bytes:
    """Get file from Storage by ID/path"""
    try:
        return storage_provider.download(file_id)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")

def delete_file_from_storage(file_id: str) -> bool:
    """Delete file from Storage by ID/path"""
    try:
        return storage_provider.delete(file_id)
    except Exception as e:
        return False
        logger.error(f"Failed to delete file from GridFS: {str(e)}")
        return False

# -------------------- ENHANCED MEDIA OPERATIONS --------------------
def get_media_files_by_campaign(campaign_id: str, influencer_id: str) -> List[dict]:
    """Get all media files submitted for a campaign by an influencer"""
    campaign = get_campaign_by_id(campaign_id)
    
    application = next(
        (app for app in campaign.get("applications", []) 
         if app["influencer_id"] == influencer_id), 
        None
    )
    
    if not application or not application.get("submitted_media"):
        return []
    
    media_files = []
    for media in application["submitted_media"]:
        try:
            file_obj = get_file_from_storage(media["file_id"])
            media_files.append({
                "file_id": media["file_id"],
                "filename": media["filename"],
                "content_type": media["content_type"],
                "media_type": media.get("media_type", MediaType.OTHER),
                "size": media.get("size", 0),
                "description": media.get("description"),
                "submitted_at": media.get("submitted_at"),
                "download_url": f"/api/media/{media['file_id']}/download"
            })
        except Exception as e:
            logger.error(f"Failed to get media file {media['file_id']}: {str(e)}")
            continue
    
    return media_files

def get_all_influencer_media(influencer_id: str) -> List[dict]:
    """Get all media files submitted by an influencer across all campaigns"""
    campaigns = get_influencer_applications(influencer_id)
    
    all_media = []
    for campaign in campaigns:
        application = next(
            (app for app in campaign.get("applications", []) 
             if app["influencer_id"] == influencer_id), 
            None
        )
        
        if application and application.get("submitted_media"):
            for media in application["submitted_media"]:
                try:
                    file_obj = get_file_from_storage(media["file_id"])
                    all_media.append({
                        "file_id": media["file_id"],
                        "filename": media["filename"],
                        "content_type": media["content_type"],
                        "media_type": media.get("media_type", MediaType.OTHER),
                        "size": media.get("size", 0),
                        "description": media.get("description"),
                        "submitted_at": media.get("submitted_at"),
                        "campaign_id": campaign["_id"],
                        "campaign_title": campaign["title"],
                        "brand_name": campaign.get("brand_name", "Unknown Brand"),
                        "download_url": f"/api/media/{media['file_id']}/download"
                    })
                except Exception as e:
                    logger.error(f"Failed to get media file {media['file_id']}: {str(e)}")
                    continue
    
    return all_media

# -------------------- CAMPAIGN OPERATIONS (Keep existing) --------------------
def create_campaign(campaign_data: dict) -> str:
    """Create a new campaign"""
    result = campaigns_collection.insert_one(campaign_data)
    return str(result.inserted_id)

def get_campaigns_by_brand(brand_id: str) -> List[dict]:
    """Get all campaigns for a specific brand"""
    campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
    return campaigns

def get_available_campaigns_for_influencer(influencer_id: str) -> List[dict]:
    """Get campaigns available for an influencer to apply to"""
    campaigns = list(campaigns_collection.find({
        "status": "active",
        "applications.influencer_id": {"$ne": influencer_id}
    }))
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
            campaign["brand_email"] = brand.get("email", "No email")
    
    return campaigns

def update_campaign(campaign_id: str, update_data: dict) -> bool:
    try:
        result = campaigns_collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": update_data}
        )
        return result.matched_count > 0
    except Exception as e:
        logger.error(f"Update campaign error: {str(e)}")
        return False

def delete_campaign(campaign_id: str) -> bool:
    """Delete a campaign"""
    campaign = get_campaign_by_id(campaign_id)
    
    if campaign.get("campaign_image_id"):
        delete_file_from_storage(campaign["campaign_image_id"])
    
    if campaign.get("campaign_video_id"):
        delete_file_from_storage(campaign["campaign_video_id"])
    
    result = campaigns_collection.delete_one({"_id": validate_object_id(campaign_id)})
    return result.deleted_count > 0

def add_application_to_campaign(campaign_id: str, application_data: dict) -> bool:
    """Add an application to a campaign"""
    result = campaigns_collection.update_one(
        {"_id": validate_object_id(campaign_id)},
        {"$push": {"applications": application_data}}
    )
    return result.modified_count > 0

def update_application_status(campaign_id: str, influencer_id: str, status: str) -> bool:
    """Update the status of an application"""
    result = campaigns_collection.update_one(
        {
            "_id": validate_object_id(campaign_id),
            "applications.influencer_id": influencer_id
        },
        {
            "$set": {"applications.$.status": status}
        }
    )
    return result.modified_count > 0

def get_campaigns_with_applications(brand_id: str) -> List[dict]:
    """Get all campaigns with applications for a brand"""
    campaigns = list(campaigns_collection.find({
        "brand_id": brand_id,
        "applications": {"$exists": True, "$ne": []}
    }))
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
    return campaigns

def get_influencer_applications(influencer_id: str) -> List[dict]:
    """Get all applications for an influencer"""
    campaigns = list(campaigns_collection.find({
        "applications.influencer_id": influencer_id
    }))
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
            campaign["brand_email"] = brand.get("email", "No email")
    
    return campaigns

def get_all_campaigns_admin() -> List[dict]:
    """Get all campaigns for admin view"""
    campaigns = list(campaigns_collection.find())
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
            campaign["brand_email"] = brand.get("email", "No email")
    
    return campaigns

def get_campaign_stats() -> dict:
    """Get campaign statistics including views"""
    total = campaigns_collection.count_documents({})
    active = campaigns_collection.count_documents({"status": "active"})
    paused = campaigns_collection.count_documents({"status": "paused"})
    completed = campaigns_collection.count_documents({"status": "completed"})
    
    # Get total views across all campaigns
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_views": {"$sum": "$total_views"},
                "unique_views": {"$sum": "$unique_views"},
                "average_views": {"$avg": "$total_views"}
            }
        }
    ]
    
    view_stats = list(campaigns_collection.aggregate(pipeline))
    view_data = view_stats[0] if view_stats else {"total_views": 0, "unique_views": 0, "average_views": 0}
    
    return {
        "total": total,
        "active": active,
        "paused": paused,
        "completed": completed,
        "total_views": view_data["total_views"],
        "unique_views": view_data["unique_views"],
        "average_views_per_campaign": round(view_data["average_views"], 2)
    }
    
    
    
# Add these helper functions to your existing helper functions section

def track_campaign_view(campaign_id: str, user_id: Optional[str] = None, ip_address: Optional[str] = None):
    """Track a campaign view"""
    try:
        campaign_oid = validate_object_id(campaign_id)
        current_time = datetime.utcnow()
        
        # First, check if this is a unique view
        is_unique_view = False
        
        if user_id:
            # Check if user has viewed this campaign before in the last 24 hours
            existing_user_view = campaigns_collection.find_one({
                "_id": campaign_oid,
                "view_history": {
                    "$elemMatch": {
                        "user_id": user_id,
                        "viewed_at": {"$gte": current_time - timedelta(hours=24)}
                    }
                }
            })
            
            if not existing_user_view:
                is_unique_view = True
                
        elif ip_address:
            # Check if IP has viewed this campaign before in the last 24 hours
            existing_ip_view = campaigns_collection.find_one({
                "_id": campaign_oid,
                "view_history": {
                    "$elemMatch": {
                        "ip_address": ip_address,
                        "viewed_at": {"$gte": current_time - timedelta(hours=24)}
                    }
                }
            })
            
            if not existing_ip_view:
                is_unique_view = True
        
        # Create the new view entry
        new_view = {
            "viewed_at": current_time,
            "user_id": user_id,
            "ip_address": ip_address,
            "is_unique": is_unique_view
        }
        
        # Prepare the update operation
        update_data = {
            "$inc": {"total_views": 1},
            "$push": {"view_history": new_view}
        }
        
        # If it's a unique view, also increment unique_views
        if is_unique_view:
            update_data["$inc"]["unique_views"] = 1
        
        # Perform the update
        result = campaigns_collection.update_one(
            {"_id": campaign_oid},
            update_data
        )
        
        return result.modified_count > 0
        
    except Exception as e:
        logger.error(f"Error tracking campaign view: {str(e)}")
        return False

def get_campaign_views(campaign_id: str) -> dict:
    """Get view statistics for a campaign"""
    campaign = get_campaign_by_id(campaign_id)
    
    # Calculate unique views from view_history if unique_views field doesn't exist
    if "unique_views" not in campaign:
        unique_views = len(set(
            view.get("user_id") or view.get("ip_address") 
            for view in campaign.get("view_history", [])
        ))
        campaign["unique_views"] = unique_views
    
    # Calculate daily views for the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_views = [view for view in campaign.get("view_history", []) 
                   if view.get("viewed_at", datetime.min) >= seven_days_ago]
    
    # Group by date
    daily_views = {}
    for view in recent_views:
        date_str = view["viewed_at"].strftime("%Y-%m-%d")
        if date_str not in daily_views:
            daily_views[date_str] = {"total": 0, "unique": 0}
        
        daily_views[date_str]["total"] += 1
        if view.get("is_unique"):
            daily_views[date_str]["unique"] += 1
    
    return {
        "total_views": campaign.get("total_views", 0),
        "unique_views": campaign.get("unique_views", 0),
        "daily_views": daily_views,
        "view_history_count": len(campaign.get("view_history", []))
    }

def get_popular_campaigns(limit: int = 10, days: int = 30) -> List[dict]:
    """Get most popular campaigns based on views"""
    since_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            "$match": {
                "view_history.viewed_at": {"$gte": since_date}
            }
        },
        {
            "$addFields": {
                "recent_views": {
                    "$filter": {
                        "input": "$view_history",
                        "as": "view",
                        "cond": {"$gte": ["$$view.viewed_at", since_date]}
                    }
                }
            }
        },
        {
            "$addFields": {
                "recent_total_views": {"$size": "$recent_views"},
                "recent_unique_views": {
                    "$size": {
                        "$filter": {
                            "input": "$recent_views",
                            "as": "view",
                            "cond": "$$view.is_unique"
                        }
                    }
                }
            }
        },
        {
            "$sort": {"recent_total_views": -1}
        },
        {
            "$limit": limit
        },
        {
            "$project": {
                "title": 1,
                "category": 1,
                "budget": 1,
                "status": 1,
                "brand_id": 1,
                "total_views": 1,
                "unique_views": 1,
                "recent_total_views": 1,
                "recent_unique_views": 1,
                "campaign_image_id": 1
            }
        }
    ]
    
    campaigns = list(campaigns_collection.aggregate(pipeline))
    
    # Convert ObjectIds to strings and add brand info
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        
        # Add brand information
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
    
    return campaigns

# Add these to your helper functions section

def toggle_campaign_like(campaign_id: str, user_id: str, like: bool = True) -> dict:
    """Like or unlike a campaign"""
    campaign_oid = validate_object_id(campaign_id)
    
    campaign = campaigns_collection.find_one({"_id": campaign_oid})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    user_liked = user_id in campaign.get("liked_by", [])
    
    if like and not user_liked:
        # Add like
        result = campaigns_collection.update_one(
            {"_id": campaign_oid},
            {
                "$inc": {"likes_count": 1},
                "$push": {"liked_by": user_id}
            }
        )
        return {
            "campaign_id": campaign_id,
            "likes_count": campaign.get("likes_count", 0) + 1,
            "user_liked": True,
            "action": "liked"
        }
    elif not like and user_liked:
        # Remove like
        result = campaigns_collection.update_one(
            {"_id": campaign_oid},
            {
                "$inc": {"likes_count": -1},
                "$pull": {"liked_by": user_id}
            }
        )
        return {
            "campaign_id": campaign_id,
            "likes_count": max(0, campaign.get("likes_count", 0) - 1),
            "user_liked": False,
            "action": "unliked"
        }
    
    return {
        "campaign_id": campaign_id,
        "likes_count": campaign.get("likes_count", 0),
        "user_liked": user_liked,
        "action": "no_change"
    }

def toggle_campaign_bookmark(campaign_id: str, user_id: str, bookmark: bool = True) -> dict:
    """Bookmark or remove bookmark from a campaign"""
    campaign_oid = validate_object_id(campaign_id)
    
    campaign = campaigns_collection.find_one({"_id": campaign_oid})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    user_bookmarked = user_id in campaign.get("bookmarked_by", [])
    
    if bookmark and not user_bookmarked:
        # Add bookmark
        result = campaigns_collection.update_one(
            {"_id": campaign_oid},
            {"$push": {"bookmarked_by": user_id}}
        )
        return {
            "campaign_id": campaign_id,
            "user_bookmarked": True,
            "action": "bookmarked"
        }
    elif not bookmark and user_bookmarked:
        # Remove bookmark
        result = campaigns_collection.update_one(
            {"_id": campaign_oid},
            {"$pull": {"bookmarked_by": user_id}}
        )
        return {
            "campaign_id": campaign_id,
            "user_bookmarked": False,
            "action": "unbookmarked"
        }
    
    return {
        "campaign_id": campaign_id,
        "user_bookmarked": user_bookmarked,
        "action": "no_change"
    }

def get_user_liked_campaigns(user_id: str) -> List[dict]:
    """Get all campaigns liked by a user"""
    campaigns = list(campaigns_collection.find({
        "liked_by": user_id
    }))
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        # Add brand info
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
    
    return campaigns

def get_user_bookmarked_campaigns(user_id: str) -> List[dict]:
    """Get all campaigns bookmarked by a user"""
    campaigns = list(campaigns_collection.find({
        "bookmarked_by": user_id
    }))
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        # Add brand info
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
    
    return campaigns

def get_campaign_like_status(campaign_id: str, user_id: str) -> dict:
    """Get like status of a campaign for a specific user"""
    campaign = get_campaign_by_id(campaign_id)
    
    user_liked = user_id in campaign.get("liked_by", [])
    user_bookmarked = user_id in campaign.get("bookmarked_by", [])
    
    return {
        "campaign_id": campaign_id,
        "likes_count": campaign.get("likes_count", 0),
        "user_liked": user_liked,
        "user_bookmarked": user_bookmarked
    }

def get_popular_campaigns_by_likes(limit: int = 10) -> List[dict]:
    """Get most popular campaigns based on likes"""
    campaigns = list(campaigns_collection.find({
        "likes_count": {"$gt": 0}
    }).sort("likes_count", -1).limit(limit))
    
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])
        # Add brand info
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
    
    return campaigns

# -------------------- CAMPAIGN LIMIT HELPERS --------------------
def get_user_campaign_limits(user_subscription: Dict[str, Any]) -> Dict[str, Any]:
    """Get campaign creation limits based on user subscription"""
    plan_benefits = get_subscription_benefits(user_subscription)
    limits = plan_benefits.get("limits", {})
    
    return {
        "max_campaigns_total": limits.get("max_campaigns_total"),
        "max_campaigns_per_day": limits.get("max_campaigns_per_day"),
        "can_create_campaigns": limits.get("can_create_campaigns", True),
        "plan_name": plan_benefits["name"]
    }

def check_campaign_creation_limits(user_id: str, user_subscription: Dict[str, Any]) -> Dict[str, Any]:
    """Check if user can create more campaigns based on their subscription limits"""
    limits = get_user_campaign_limits(user_subscription)
    
    if not limits["can_create_campaigns"]:
        return {
            "can_create": False,
            "reason": "Your current plan does not allow campaign creation",
            "limits": limits
        }
    
    # Get user's existing campaigns
    user_campaigns_count = campaigns_collection.count_documents({
        "brand_id": user_id
    })
    
    # Check total campaign limit
    if limits["max_campaigns_total"] and user_campaigns_count >= limits["max_campaigns_total"]:
        return {
            "can_create": False,
            "reason": f"You have reached your total campaign limit of {limits['max_campaigns_total']} campaigns",
            "current_count": user_campaigns_count,
            "limit": limits["max_campaigns_total"],
            "limits": limits
        }
    
    # Check daily campaign limit
    if limits["max_campaigns_per_day"] is not None:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_campaigns_count = campaigns_collection.count_documents({
            "brand_id": user_id,
            "created_at": {"$gte": today_start}
        })
        
        if today_campaigns_count >= limits["max_campaigns_per_day"]:
            return {
                "can_create": False,
                "reason": f"You have reached your daily campaign creation limit of {limits['max_campaigns_per_day']} campaigns",
                "current_count": today_campaigns_count,
                "limit": limits["max_campaigns_per_day"],
                "limits": limits,
                "reset_time": today_start + timedelta(days=1)
            }
    
    return {
        "can_create": True,
        "current_total": user_campaigns_count,
        "limits": limits
    }

def get_user_campaign_usage(user_id: str, user_subscription: Dict[str, Any]) -> Dict[str, Any]:
    """Get detailed campaign usage statistics for a user"""
    limits = get_user_campaign_limits(user_subscription)
    
    # Total campaigns
    total_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id
    })
    
    # Today's campaigns
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "created_at": {"$gte": today_start}
    })
    
    # Campaigns by status
    active_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "status": "active"
    })
    
    paused_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "status": "paused"
    })
    
    completed_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "status": "completed"
    })
    
    return {
        "limits": limits,
        "usage": {
            "total_campaigns": total_campaigns,
            "today_campaigns": today_campaigns,
            "active_campaigns": active_campaigns,
            "paused_campaigns": paused_campaigns,
            "completed_campaigns": completed_campaigns
        },
        "can_create_more": check_campaign_creation_limits(user_id, user_subscription)["can_create"]
    }


# -------------------- MESSAGE OPERATIONS (Keep existing) --------------------
def create_message(message_data: dict) -> str:
    """Create a new message"""
    result = messages_collection.insert_one(message_data)
    return str(result.inserted_id)

def get_messages_between_users(user1_id: str, user2_id: str, campaign_id: str) -> List[dict]:
    """Get messages between two users for a specific campaign"""
    query = {
        "campaign_id": campaign_id,
        "$or": [
            {"sender_id": user1_id, "receiver_id": user2_id},
            {"sender_id": user2_id, "receiver_id": user1_id}
        ]
    }
    
    messages = list(messages_collection.find(query).sort("created_at", 1))
    for message in messages:
        message["_id"] = str(message["_id"])
    return messages

def mark_messages_as_read(sender_id: str, receiver_id: str, campaign_id: str) -> int:
    """Mark messages as read"""
    result = messages_collection.update_many(
        {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "campaign_id": campaign_id,
            "read": False
        },
        {"$set": {"read": True}}
    )
    return result.modified_count

def get_unread_message_count(receiver_id: str) -> int:
    """Get count of unread messages for a user"""
    return messages_collection.count_documents({
        "receiver_id": receiver_id,
        "read": False
    })

def get_user_conversations(user_id: str) -> List[dict]:
    """Get all conversations for a user"""
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender_id": user_id},
                    {"receiver_id": user_id}
                ]
            }
        },
        {
            "$group": {
                "_id": {
                    "campaign_id": "$campaign_id",
                    "other_user_id": {
                        "$cond": [
                            {"$eq": ["$sender_id", user_id]},
                            "$receiver_id",
                            "$sender_id"
                        ]
                    }
                },
                "last_message": {"$last": "$$ROOT"},
                "unread_count": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$eq": ["$receiver_id", user_id]},
                                {"$eq": ["$read", False]}
                            ]},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            "$sort": {"last_message.created_at": -1}
        }
    ]
    
    conversations = list(messages_collection.aggregate(pipeline))
    
    for conv in conversations:
        other_user_id = conv["_id"]["other_user_id"]
        user = users_collection.find_one({"_id": ObjectId(other_user_id)})
        if user:
            conv["other_user_name"] = user.get("username", "Unknown User")
            conv["other_user_email"] = user.get("email", "No email")
        
        campaign = campaigns_collection.find_one({"_id": ObjectId(conv["_id"]["campaign_id"])})
        if campaign:
            conv["campaign_title"] = campaign.get("title", "Unknown Campaign")
    
    return conversations

# -------------------- PAYMENT OPERATIONS (Keep existing) --------------------
def create_payment(payment_data: dict) -> str:
    """Create a new payment"""
    result = payments_collection.insert_one(payment_data)
    return str(result.inserted_id)

def get_payments_by_brand(brand_id: str) -> List[dict]:
    """Get all payments for a specific brand"""
    payments = list(payments_collection.find({"brand_id": brand_id}))
    for payment in payments:
        payment["_id"] = str(payment["_id"])
    return payments

def get_payment_by_id(payment_id: str) -> dict:
    """Get a payment by ID"""
    payment = payments_collection.find_one({"_id": validate_object_id(payment_id)})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment["_id"] = str(payment["_id"])
    return payment

def update_payment_status(payment_id: str, status: str, transaction_id: Optional[str] = None) -> bool:
    """Update payment status"""
    update_data = {"status": status}
    if transaction_id:
        update_data["transaction_id"] = transaction_id
        
    result = payments_collection.update_one(
        {"_id": validate_object_id(payment_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

def create_payment_with_notifications(payment_data: dict, background_tasks: BackgroundTasks = None) -> str:
    """Create a new payment with real-time notifications"""
    payment_id = create_payment(payment_data)
    
    # Send payment notification
    if background_tasks and payment_data.get("brand_id"):
        background_tasks.add_task(
            trigger_payment_notifications,
            payment_data["brand_id"],
            payment_data.get("amount", 0),
            payment_data.get("plan", "campaign"),
            payment_data.get("campaign_title"),
            payment_data.get("status", "pending"),
            None
        )
    
    return payment_id

def update_payment_status_with_notifications(
    payment_id: str, 
    status: str, 
    transaction_id: Optional[str] = None,
    background_tasks: BackgroundTasks = None
) -> bool:
    """Update payment status with real-time notifications"""
    payment = get_payment_by_id(payment_id)
    
    success = update_payment_status(payment_id, status, transaction_id)
    
    if success and background_tasks and payment.get("brand_id"):
        background_tasks.add_task(
            trigger_payment_notifications,
            payment["brand_id"],
            payment.get("amount", 0),
            payment.get("plan", "campaign"),
            payment.get("campaign_title"),
            status,
            None
        )
    
    return success

# -------------------- ENHANCED VIEW TRACKING WITH NOTIFICATIONS --------------------
def track_campaign_view_with_notifications(
    campaign_id: str, 
    user_id: Optional[str] = None, 
    ip_address: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """Track campaign view with performance notifications"""
    success = track_campaign_view(campaign_id, user_id, ip_address)
    
    if success and background_tasks:
        campaign = get_campaign_by_id(campaign_id)
        
        # Send performance notification for high views
        views_data = get_campaign_views(campaign_id)
        if views_data["total_views"] % 100 == 0:  # Every 100 views
            background_tasks.add_task(
                brand_notification_service.notify_campaign_performance,
                campaign["brand_id"],
                campaign_id,
                views_data
            )
        
        # Send dashboard alert for trending campaigns
        if views_data["total_views"] >= 500:
            background_tasks.add_task(
                brand_notification_service.notify_dashboard_alert,
                campaign["brand_id"],
                "campaign_trending",
                {
                    "campaign_title": campaign["title"],
                    "total_views": views_data["total_views"],
                    "unique_views": views_data["unique_views"]
                }
            )
    
    return success


# -------------------- CONTRACT OPERATIONS (Keep existing) --------------------
def create_contract(contract_data: dict) -> str:
    """Create a contract agreement"""
    # Store contract in campaigns collection under applications
    campaign_id = contract_data["campaign_id"]
    influencer_id = contract_data["influencer_id"]
    
    result = campaigns_collection.update_one(
        {
            "_id": validate_object_id(campaign_id),
            "applications.influencer_id": influencer_id
        },
        {
            "$set": {
                "applications.$.contract_signed": contract_data["terms_accepted"],
                "applications.$.contract_signed_at": contract_data["signed_at"],
                "applications.$.status": "contracted" if contract_data["terms_accepted"] else "approved"
            }
        }
    )
    
    return str(result.modified_count)

# -------------------- MEDIA SUBMISSION OPERATIONS (Keep existing) --------------------
def submit_media_files(campaign_id: str, influencer_id: str, media_files: List[dict]) -> bool:
    """Submit media files for a campaign"""
    result = campaigns_collection.update_one(
        {
            "_id": validate_object_id(campaign_id),
            "applications.influencer_id": influencer_id
        },
        {
            "$set": {
                "applications.$.submitted_media": media_files,
                "applications.$.media_submitted_at": datetime.utcnow(),
                "applications.$.status": "media_submitted"
            }
        }
    )
    return result.modified_count > 0


# -------------------- ENHANCED CAMPAIGN CREATION WITH SUBSCRIPTION LIMITS --------------------
@router.post("/campaigns", response_model=dict)
async def create_campaign_endpoint(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(...),
    requirements: str = Form(...),
    budget: float = Form(...),
    category: str = Form(...),
    deadline: datetime = Form(...),
    currency: str = Form("USD"),
    status: CampaignStatus = Form(CampaignStatus.ACTIVE),
    brand_id: str = Form(...),
    campaign_image: Optional[UploadFile] = File(None),
    campaign_video: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Create a new campaign with subscription-based limits and real-time notifications"""
    check_user_permission(current_user, ["brand"])
    
    if str(current_user["_id"]) != brand_id:
        raise HTTPException(status_code=403, detail="You can only create campaigns for your own brand")
    
    # ✅ ENHANCED: Get comprehensive subscription data
    subscription_data = current_user.get("subscription", {})
    plan_benefits = get_subscription_benefits(subscription_data)
    limits = plan_benefits.get("limits", {})
    
    # ✅ CHECK SUBSCRIPTION STATUS
    if not subscription_data.get("is_active", False):
        raise HTTPException(
            status_code=402,
            detail="Your subscription is not active. Please upgrade to create campaigns.",
            headers={
                "X-Subscription-Required": "true",
                "X-Plan-Status": "inactive"
            }
        )
    
    # ✅ CHECK CAMPAIGN CREATION PERMISSION
    if not limits.get("can_create_campaigns", True):
        raise HTTPException(
            status_code=402,
            detail="Your current plan does not allow campaign creation. Please upgrade.",
            headers={
                "X-Plan-Limits": json.dumps(limits),
                "X-Plan-Name": plan_benefits["name"]
            }
        )
    
    # ✅ CHECK TOTAL CAMPAIGN LIMIT
    user_id = str(current_user["_id"])
    total_campaigns = campaigns_collection.count_documents({"brand_id": user_id})
    
    max_total = limits.get("max_campaigns_total")
    if max_total is not None and total_campaigns >= max_total:
        # Send notification about limit reached
        background_tasks.add_task(
            brand_notification_service.notify_campaign_limit_reached,
            user_id,
            plan_benefits["name"],
            {
                "total_campaigns": total_campaigns,
                "today_campaigns": 0,
                "limit": max_total
            },
            "total"
        )
        
        raise HTTPException(
            status_code=402,
            detail=f"You have reached your total campaign limit of {max_total}. Please upgrade your plan to create more campaigns.",
            headers={
                "X-Campaign-Limit-Reason": "total_limit_reached",
                "X-Current-Count": str(total_campaigns),
                "X-Max-Limit": str(max_total),
                "X-Plan-Name": plan_benefits["name"]
            }
        )
    
    # ✅ CHECK DAILY CAMPAIGN LIMIT
    max_daily = limits.get("max_campaigns_per_day")
    if max_daily is not None:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_campaigns = campaigns_collection.count_documents({
            "brand_id": user_id,
            "created_at": {"$gte": today_start}
        })
        
        if today_campaigns >= max_daily:
            # Send notification about daily limit reached
            background_tasks.add_task(
                brand_notification_service.notify_campaign_limit_reached,
                user_id,
                plan_benefits["name"],
                {
                    "total_campaigns": total_campaigns,
                    "today_campaigns": today_campaigns,
                    "limit": max_daily
                },
                "daily"
            )
            
            reset_time = today_start + timedelta(days=1)
            raise HTTPException(
                status_code=402,
                detail=f"You have reached your daily campaign creation limit of {max_daily}. You can create more campaigns after {reset_time.strftime('%Y-%m-%d %H:%M UTC')}.",
                headers={
                    "X-Campaign-Limit-Reason": "daily_limit_reached",
                    "X-Today-Count": str(today_campaigns),
                    "X-Daily-Limit": str(max_daily),
                    "X-Reset-Time": reset_time.isoformat(),
                    "X-Plan-Name": plan_benefits["name"]
                }
            )
    
    # ✅ VALIDATE CAMPAIGN DATA
    if deadline <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Deadline must be in the future")
    
    if budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be greater than 0")
    
    # Minimum budget per currency (MAJOR units)
    MIN_BUDGET_BY_CURRENCY = {
        "USD": 0.50,
        "EUR": 0.50,
        "GBP": 0.30,
        "INR": 50.00,
        "AUD": 0.50,
        "CAD": 0.50,
        "SGD": 0.50,
        "NZD": 0.50,
        "CHF": 0.50,
        "JPY": 50.00,
        "KRW": 500.00,
        "HKD": 4.00,
        "SEK": 5.00,
        "NOK": 5.00,
        "DKK": 5.00,
        "PLN": 2.00,
        "CZK": 15.00,
        "HUF": 175.00,
        "THB": 20.00,
        "PHP": 25.00,
        "MYR": 2.00,
        "IDR": 5000.00,
        "ZAR": 7.00,
        "BRL": 2.00,
        "MXN": 10.00
    }


        # Check if the budget meets the global minimum
    currency_code = currency.upper()

    minimum_budget = MIN_BUDGET_BY_CURRENCY.get(currency_code)

    if minimum_budget and budget < minimum_budget:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Minimum campaign budget for {currency_code} "
                f"is {minimum_budget}. Your budget is {budget}."
            )
        )

    
    # ✅ HANDLE MEDIA UPLOADS
    campaign_image_id = None
    campaign_video_id = None
    
    try:
        if campaign_image:
            campaign_image_id = await save_file_to_storage(campaign_image, "campaign_image")
        
        if campaign_video:
            campaign_video_id = await save_file_to_storage(campaign_video, "campaign_video")
    except Exception as e:
        # Clean up any uploaded files if there's an error
        if campaign_image_id:
            delete_file_from_storage(campaign_image_id)
        if campaign_video_id:
            delete_file_from_storage(campaign_video_id)
        raise HTTPException(status_code=500, detail=f"Failed to upload media files: {str(e)}")
    
    # ✅ CREATE CAMPAIGN DOCUMENT
    campaign_dict = {
        "title": title,
        "description": description,
        "requirements": requirements,
        "budget": budget,
        "category": category,
        "deadline": deadline,
        "currency": currency,
        "status": status,
        "brand_id": brand_id,
        "created_at": datetime.utcnow(),
        "applications": [],
        "campaign_image_id": campaign_image_id,
        "campaign_video_id": campaign_video_id,
        
        # Analytics and engagement fields
        "total_views": 0,
        "unique_views": 0,
        "view_history": [],
        "likes_count": 0,
        "liked_by": [],
        "bookmarked_by": [],
        
        # Subscription tracking
        "created_under_plan": subscription_data.get("plan", "trial"),
        "subscription_type": subscription_data.get("type", "trial")
    }
    
    try:
        campaign_id = create_campaign(campaign_dict)
    except Exception as e:
        # Clean up uploaded files if campaign creation fails
        if campaign_image_id:
            delete_file_from_storage(campaign_image_id)
        if campaign_video_id:
            delete_file_from_storage(campaign_video_id)
        raise HTTPException(status_code=500, detail=f"Failed to create campaign: {str(e)}")
    
    # ✅ GET UPDATED USAGE STATISTICS
    updated_total = total_campaigns + 1
    updated_today = today_campaigns + 1 if max_daily is not None else None
    
    # ✅ SEND REAL-TIME NOTIFICATIONS
    usage_stats = {
        "total_campaigns": updated_total,
        "today_campaigns": updated_today,
        "plan_limits": limits
    }
    
    # Trigger campaign creation notification
    background_tasks.add_task(
        trigger_campaign_creation_notifications,
        user_id,
        campaign_id,
        title,
        usage_stats,
        None  # No background_tasks needed here as it's already in background
    )
    
    # Send limit warning if approaching limits
    if max_total and updated_total >= max_total * 0.8:
        background_tasks.add_task(
            brand_notification_service.notify_campaign_limit_warning,
            user_id,
            plan_benefits["name"],
            usage_stats,
            "total"
        )
    
    if max_daily and updated_today and updated_today >= max_daily * 0.8:
        background_tasks.add_task(
            brand_notification_service.notify_campaign_limit_warning,
            user_id,
            plan_benefits["name"],
            usage_stats,
            "daily"
        )
    
    # ✅ SEND CONFIRMATION EMAIL
    if current_user.get("email"):
        background_tasks.add_task(
            EmailService.send_email,
            current_user["email"],
            f"Campaign Created: {title}",
            f"""
            <html>
                <body>
                    <h2>Campaign Created Successfully! 🎉</h2>
                    <p>Hello {current_user['username']},</p>
                    
                    <p>Your campaign <strong>"{title}"</strong> has been created successfully.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #4CAF50; margin-top: 0;">📊 Campaign Usage</h3>
                        <p><strong>Plan:</strong> {plan_benefits['name']}</p>
                        <p><strong>Total Campaigns:</strong> {updated_total}{f' / {max_total}' if max_total else ' (unlimited)'}</p>
                        {f'<p><strong>Campaigns Today:</strong> {updated_today} / {max_daily}</p>' if max_daily else ''}
                    </div>
                    
                    <p>You will receive notifications when influencers apply to your campaign.</p>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h4 style="color: #1976D2; margin-top: 0;">💡 Tips for Success</h4>
                        <ul>
                            <li>Share your campaign on social media to attract more influencers</li>
                            <li>Respond quickly to influencer applications</li>
                            <li>Review influencer profiles carefully before approving</li>
                        </ul>
                    </div>
                    
                    <p>Need help? Check out our <a href="#">campaign management guide</a>.</p>
                    
                    <br>
                    <p>Best regards,<br>Influencer Platform Team</p>
                </body>
            </html>
            """
        )
    
    # ✅ PREPARE RESPONSE WITH USAGE DATA
    response_data = {
        "message": "Campaign created successfully", 
        "campaign_id": campaign_id,
        "usage": usage_stats,
        "remaining": {
            "total": max_total - updated_total if max_total else "unlimited",
            "daily": max_daily - updated_today if max_daily else "unlimited"
        },
        "plan_info": {
            "name": plan_benefits["name"],
            "type": subscription_data.get("type", "trial"),
            "is_trial": subscription_data.get("is_trial", False),
            "trial_remaining_days": subscription_data.get("trial_remaining_days", 0)
        }
    }
    
    # ✅ ADD UPGRADE SUGGESTION IF APPROACHING LIMITS
    if max_total and updated_total >= max_total * 0.8:
        response_data["upgrade_suggestion"] = {
            "reason": "approaching_total_limit",
            "message": f"You've used {updated_total} of {max_total} campaigns. Consider upgrading for more capacity.",
            "current_usage_percent": round((updated_total / max_total) * 100, 1)
        }
    
    if max_daily and updated_today and updated_today >= max_daily * 0.8:
        response_data["upgrade_suggestion"] = {
            "reason": "approaching_daily_limit", 
            "message": f"You've created {updated_today} of {max_daily} campaigns today. Consider upgrading for higher daily limits.",
            "current_usage_percent": round((updated_today / max_daily) * 100, 1)
        }
    
    return response_data

# -------------------- ENHANCED CAMPAIGN USAGE ENDPOINTS --------------------
@router.get("/campaigns/usage", response_model=dict)
async def get_campaign_usage_endpoint(current_user: dict = Depends(get_current_user)):
    """Get comprehensive campaign usage and limits for the authenticated user"""
    check_user_permission(current_user, ["brand"])
    
    subscription_data = current_user.get("subscription", {})
    plan_benefits = get_subscription_benefits(subscription_data)
    limits = plan_benefits.get("limits", {})
    
    user_id = str(current_user["_id"])
    
    # Total campaigns
    total_campaigns = campaigns_collection.count_documents({"brand_id": user_id})
    
    # Today's campaigns
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "created_at": {"$gte": today_start}
    })
    
    # Campaigns by status
    active_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "status": "active"
    })
    
    paused_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "status": "paused"
    })
    
    completed_campaigns = campaigns_collection.count_documents({
        "brand_id": user_id,
        "status": "completed"
    })
    
    # Calculate usage percentages
    total_usage_percent = 0
    daily_usage_percent = 0
    
    max_total = limits.get("max_campaigns_total")
    max_daily = limits.get("max_campaigns_per_day")
    
    if max_total and max_total > 0:
        total_usage_percent = min(100, round((total_campaigns / max_total) * 100, 1))
    
    if max_daily and max_daily > 0:
        daily_usage_percent = min(100, round((today_campaigns / max_daily) * 100, 1))
    
    return {
        "plan": {
            "name": plan_benefits["name"],
            "type": subscription_data.get("type", "trial"),
            "is_trial": subscription_data.get("is_trial", False),
            "trial_remaining_days": subscription_data.get("trial_remaining_days", 0),
            "limits": limits
        },
        "usage": {
            "total_campaigns": total_campaigns,
            "today_campaigns": today_campaigns,
            "active_campaigns": active_campaigns,
            "paused_campaigns": paused_campaigns,
            "completed_campaigns": completed_campaigns,
            "usage_percentages": {
                "total": total_usage_percent,
                "daily": daily_usage_percent
            }
        },
        "remaining": {
            "total": max_total - total_campaigns if max_total else None,
            "daily": max_daily - today_campaigns if max_daily else None
        },
        "can_create_more": (
            (max_total is None or total_campaigns < max_total) and
            (max_daily is None or today_campaigns < max_daily) and
            limits.get("can_create_campaigns", True)
        )
    }

@router.get("/campaigns/limits", response_model=dict)
async def get_campaign_limits_endpoint(current_user: dict = Depends(get_current_user)):
    """Get detailed campaign creation limits for the current user's subscription"""
    check_user_permission(current_user, ["brand"])
    
    subscription_data = current_user.get("subscription", {})
    plan_benefits = get_subscription_benefits(subscription_data)
    limits = plan_benefits.get("limits", {})
    
    return {
        "plan": {
            "name": plan_benefits["name"],
            "description": plan_benefits["description"],
            "type": subscription_data.get("type", "trial"),
            "is_trial": subscription_data.get("is_trial", False),
            "trial_remaining_days": subscription_data.get("trial_remaining_days", 0)
        },
        "limits": limits,
        "features": plan_benefits.get("features", []),
        "subscription_status": {
            "is_active": subscription_data.get("is_active", False),
            "status": subscription_data.get("status", "unknown"),
            "billing_cycle": subscription_data.get("billing_cycle"),
            "current_period_end": subscription_data.get("current_period_end")
        }
    }

@router.get("/campaigns/can-create", response_model=dict)
async def check_can_create_campaign_endpoint(current_user: dict = Depends(get_current_user)):
    """Check if user can create a new campaign with detailed reasons"""
    check_user_permission(current_user, ["brand"])
    
    subscription_data = current_user.get("subscription", {})
    plan_benefits = get_subscription_benefits(subscription_data)
    limits = plan_benefits.get("limits", {})
    
    user_id = str(current_user["_id"])
    
    # Check subscription status
    if not subscription_data.get("is_active", False):
        return {
            "can_create": False,
            "reason": "subscription_inactive",
            "message": "Your subscription is not active. Please upgrade to create campaigns.",
            "plan_name": plan_benefits["name"]
        }
    
    # Check creation permission
    if not limits.get("can_create_campaigns", True):
        return {
            "can_create": False,
            "reason": "creation_not_allowed",
            "message": "Your current plan does not allow campaign creation.",
            "plan_name": plan_benefits["name"]
        }
    
    # Check total limit
    total_campaigns = campaigns_collection.count_documents({"brand_id": user_id})
    max_total = limits.get("max_campaigns_total")
    
    if max_total is not None and total_campaigns >= max_total:
        return {
            "can_create": False,
            "reason": "total_limit_reached",
            "message": f"You have reached your total campaign limit of {max_total}.",
            "current_count": total_campaigns,
            "limit": max_total,
            "plan_name": plan_benefits["name"]
        }
    
    # Check daily limit
    max_daily = limits.get("max_campaigns_per_day")
    if max_daily is not None:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_campaigns = campaigns_collection.count_documents({
            "brand_id": user_id,
            "created_at": {"$gte": today_start}
        })
        
        if today_campaigns >= max_daily:
            reset_time = today_start + timedelta(days=1)
            return {
                "can_create": False,
                "reason": "daily_limit_reached",
                "message": f"You have reached your daily campaign creation limit of {max_daily}.",
                "current_count": today_campaigns,
                "limit": max_daily,
                "reset_time": reset_time,
                "plan_name": plan_benefits["name"]
            }
    
    # User can create campaign
    return {
        "can_create": True,
        "reason": "within_limits",
        "message": "You can create a new campaign.",
        "current_usage": {
            "total_campaigns": total_campaigns,
            "today_campaigns": today_campaigns if max_daily is not None else None
        },
        "remaining": {
            "total": max_total - total_campaigns if max_total else "unlimited",
            "daily": max_daily - today_campaigns if max_daily else "unlimited"
        },
        "plan_name": plan_benefits["name"]
    }

@router.post("/campaigns/{campaign_id}/view")
async def track_campaign_view_endpoint(
    campaign_id: str,
    request: Request,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Track a campaign view (can be called by authenticated or anonymous users)"""
    campaign = get_campaign_by_id(campaign_id)
    
    # Get user IP address
    ip_address = request.client.host if request.client else "unknown"
    
    # Track the view
    user_id = str(current_user["_id"]) if current_user else None
    success = track_campaign_view(campaign_id, user_id, ip_address)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to track view")
    
    return {"message": "View tracked successfully", "campaign_id": campaign_id}

@router.get("/campaigns/{campaign_id}/views")
async def get_campaign_views_endpoint(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get view statistics for a campaign (requires authentication)"""
    campaign = get_campaign_by_id(campaign_id)
    
    # Check permissions - brand can only see their own campaign stats
    if current_user["role"] == "brand" and campaign["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view these statistics")
    
    view_stats = get_campaign_views(campaign_id)
    return view_stats

@router.get("/campaigns/popular")
async def get_popular_campaigns_endpoint(
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(30, ge=1, le=365),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Get most popular campaigns"""
    popular_campaigns = get_popular_campaigns(limit, days)
    return popular_campaigns

@router.get("/brand/campaigns/views")
async def get_brand_campaign_views_endpoint(
    current_user: dict = Depends(get_current_user)
):
    """Get view statistics for all campaigns of a brand"""
    check_user_permission(current_user, ["brand"])
    
    brand_id = str(current_user["_id"])
    campaigns = get_campaigns_by_brand(brand_id)
    
    campaign_views = []
    for campaign in campaigns:
        views_data = get_campaign_views(campaign["_id"])
        campaign_views.append({
            "campaign_id": campaign["_id"],
            "title": campaign["title"],
            "status": campaign["status"],
            **views_data
        })
    
    # Sort by total views (descending)
    campaign_views.sort(key=lambda x: x["total_views"], reverse=True)
    
    return campaign_views


# Add these routes to your existing router

# -------------------- LIKE & BOOKMARK ROUTES --------------------

@router.post("/campaigns/like", response_model=CampaignLikesResponse)
async def like_campaign_endpoint(
    like_request: LikeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Like or Unlike a campaign with plan-based restrictions"""
    
    check_user_permission(current_user, ["influencer", "brand"])

    user_id = str(current_user["_id"])
    role = current_user.get("role")

    # --------------------------------------------------------------------
    # 1. APPLY LIKE RESTRICTIONS FOR INFLUENCERS ONLY
    # --------------------------------------------------------------------
    if role == "influencer":
        subscription = current_user.get("subscription", {})
        plan = subscription.get("plan", "free_trial")

        LIKE_LIMITS = {
            "free_trial": 20,
            "starter_monthly": 100,
            "starter_yearly": 100,
            "pro_monthly": 500,
            "pro_yearly": 500,
            "enterprise_monthly": 999999,
            "enterprise_yearly": 999999,
        }

        max_likes = LIKE_LIMITS.get(plan, 20)

        # Count total likes by influencer
        total_likes = likes_collection.count_documents({
            "user_id": user_id
        })

        # If trying to LIKE (not unlike)
        if like_request.like and total_likes >= max_likes:
            raise HTTPException(
                status_code=403,
                detail=f"You reached your plan limit ({total_likes}/{max_likes}) likes. Upgrade your plan to like more campaigns."
            )

    # --------------------------------------------------------------------
    # 2. PROCESS LIKE TOGGLE
    # --------------------------------------------------------------------
    result = toggle_campaign_like(
        like_request.campaign_id,
        user_id,
        like_request.like
    )

    return CampaignLikesResponse(
        campaign_id=result["campaign_id"],
        likes_count=result["likes_count"],
        user_liked=result["user_liked"]
    )


# ---------------------- BOOKMARK ROUTE ----------------------

@router.post("/campaigns/bookmark", response_model=CampaignBookmarksResponse)
async def bookmark_campaign_endpoint(
    bookmark_request: BookmarkRequest,
    current_user: dict = Depends(get_current_user)
):
    """Bookmark or remove bookmark from a campaign with plan-based limits"""

    check_user_permission(current_user, ["influencer", "brand"])

    user_id = str(current_user["_id"])
    role = current_user.get("role")

    # --------------------------------------------------------------------
    # 1. APPLY BOOKMARK RESTRICTION FOR INFLUENCERS ONLY
    # --------------------------------------------------------------------
    if role == "influencer":
        subscription = current_user.get("subscription", {})
        plan = subscription.get("plan", "free_trial")

        BOOKMARK_LIMITS = {
            "free_trial": 10,
            "starter_monthly": 50,
            "starter_yearly": 50,
            "pro_monthly": 200,
            "pro_yearly": 200,
            "enterprise_monthly": 999999,
            "enterprise_yearly": 999999,
        }

        max_bookmarks = BOOKMARK_LIMITS.get(plan, 10)

        # Count total bookmarks
        total_bookmarks = bookmarks_collection.count_documents({
            "user_id": user_id
        })

        # Only enforce limit when adding bookmark, not removing
        if bookmark_request.bookmark and total_bookmarks >= max_bookmarks:
            raise HTTPException(
                status_code=403,
                detail=f"You reached your Bookmark limit ({total_bookmarks}/{max_bookmarks}). Upgrade your plan to bookmark more campaigns."
            )

    # --------------------------------------------------------------------
    # 2. PROCESS BOOKMARK TOGGLE
    # --------------------------------------------------------------------
    result = toggle_campaign_bookmark(
        bookmark_request.campaign_id,
        user_id,
        bookmark_request.bookmark
    )

    return CampaignBookmarksResponse(
        campaign_id=result["campaign_id"],
        user_bookmarked=result["user_bookmarked"]
    )


@router.get("/campaigns/{campaign_id}/like-status", response_model=dict)
async def get_campaign_like_status_endpoint(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get like and bookmark status for a specific campaign"""
    status = get_campaign_like_status(campaign_id, str(current_user["_id"]))
    return status

@router.get("/user/likes", response_model=UserLikesResponse)
async def get_user_liked_campaigns_endpoint(
    current_user: dict = Depends(get_current_user)
):
    """Get all campaigns liked by the current user"""
    liked_campaigns = get_user_liked_campaigns(str(current_user["_id"]))
    
    return UserLikesResponse(
        liked_campaigns=liked_campaigns,
        total_likes=len(liked_campaigns)
    )

@router.get("/user/bookmarks", response_model=UserBookmarksResponse)
async def get_user_bookmarked_campaigns_endpoint(
    current_user: dict = Depends(get_current_user)
):
    """Get all campaigns bookmarked by the current user"""
    bookmarked_campaigns = get_user_bookmarked_campaigns(str(current_user["_id"]))
    
    return UserBookmarksResponse(
        bookmarked_campaigns=bookmarked_campaigns,
        total_bookmarks=len(bookmarked_campaigns)
    )

@router.get("/campaigns/popular/likes", response_model=List[dict])
async def get_popular_campaigns_by_likes_endpoint(
    limit: int = Query(10, ge=1, le=50),
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Get most popular campaigns based on likes"""
    popular_campaigns = get_popular_campaigns_by_likes(limit)
    
    # Add user-specific like status if user is authenticated
    if current_user:
        user_id = str(current_user["_id"])
        for campaign in popular_campaigns:
            campaign["user_liked"] = user_id in campaign.get("liked_by", [])
            campaign["user_bookmarked"] = user_id in campaign.get("bookmarked_by", [])
    
    return popular_campaigns

@router.get("/campaigns/{campaign_id}/likers", response_model=List[dict])
async def get_campaign_likers_endpoint(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get users who liked a campaign (for brand owners and admins)"""
    campaign = get_campaign_by_id(campaign_id)
    
    # Only brand owner or admin can see likers
    if current_user["role"] == "brand" and campaign["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view likers")
    
    liker_ids = campaign.get("liked_by", [])
    likers = []
    
    for user_id in liker_ids:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                likers.append({
                    "user_id": user_id,
                    "username": user.get("username", "Unknown User"),
                    "email": user.get("email", "No email"),
                    "role": user.get("role", "unknown")
                })
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            continue
    
    return likers


@router.put("/campaigns/{campaign_id}", response_model=dict)
async def update_campaign_endpoint(
    background_tasks: BackgroundTasks,
    campaign_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    requirements: Optional[str] = Form(None),
    budget: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    deadline: Optional[datetime] = Form(None),
    status: Optional[str] = Form(None),
    currency: Optional[str] = Form(None),
    campaign_image: Optional[UploadFile] = File(None),
    campaign_video: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user),
):
    """Update campaign with real-time status change notifications"""
    if not ObjectId.is_valid(campaign_id):
        raise HTTPException(status_code=400, detail="Invalid campaign ID")

    campaign = get_campaign_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if current_user["role"] == "brand":
        check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    elif current_user["role"] != "admin":
        raise HTTPException(
            status_code=403, detail="Only brands and admins can update campaigns"
        )

    # Store old status for notification
    old_status = campaign.get("status")
    
    update_data = {}

    for field_name, field_value in {
        "title": title,
        "description": description,
        "requirements": requirements,
        "budget": budget,
        "category": category,
        "deadline": deadline,
        "status": status,
        "currency": currency,
    }.items():
        if field_value is not None:
            update_data[field_name] = field_value

    if campaign_image:
        if campaign.get("campaign_image_id"):
            delete_file_from_storage(campaign["campaign_image_id"])
        
        campaign_image_id = await save_file_to_storage(campaign_image, "image")
        update_data["campaign_image_id"] = campaign_image_id

    if campaign_video:
        if campaign.get("campaign_video_id"):
            delete_file_from_storage(campaign["campaign_video_id"])
        
        campaign_video_id = await save_file_to_storage(campaign_video, "video")
        update_data["campaign_video_id"] = campaign_video_id

    success = update_campaign(campaign_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # ✅ SEND REAL-TIME NOTIFICATIONS FOR STATUS CHANGE
    if status and status != old_status:
        background_tasks.add_task(
            trigger_campaign_status_notifications,
            campaign["brand_id"],
            campaign_id,
            old_status,
            status,
            None
        )
        
        # Send dashboard alert for important status changes
        if status in ["paused", "completed"]:
            background_tasks.add_task(
                brand_notification_service.notify_dashboard_alert,
                campaign["brand_id"],
                "campaign_status_change",
                {
                    "campaign_title": campaign["title"],
                    "old_status": old_status,
                    "new_status": status,
                    "change_date": datetime.utcnow().isoformat()
                }
            )

    return {"message": "Campaign updated successfully"}

@router.delete("/campaigns/{campaign_id}", response_model=dict)
async def delete_campaign_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
    campaign = get_campaign_by_id(campaign_id)
    
    if current_user["role"] == "brand":
        check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    elif current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only brands and admins can delete campaigns")
    
    success = delete_campaign(campaign_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete campaign")
    
    return {"message": "Campaign deleted successfully"}

# In your get_campaign_endpoint and other campaign retrieval endpoints,
# add the user's like/bookmark status when user is authenticated

@router.get("/campaigns/{campaign_id}", response_model=dict)
async def get_campaign_endpoint(
    campaign_id: str, 
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    campaign = get_campaign_by_id(campaign_id)
    
    if current_user["role"] == "brand":
        check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
    brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
    if brand:
        campaign["brand_name"] = brand.get("username", "Unknown Brand")
    
    # Add user-specific like and bookmark status
    if current_user:
        user_id = str(current_user["_id"])
        campaign["user_liked"] = user_id in campaign.get("liked_by", [])
        campaign["user_bookmarked"] = user_id in campaign.get("bookmarked_by", [])
    
    # Auto-track view when campaign is retrieved (for influencers and anonymous users)
    if current_user["role"] in ["influencer", None]:
        ip_address = request.client.host if request.client else "unknown"
        user_id = str(current_user["_id"]) if current_user else None
        track_campaign_view(campaign_id, user_id, ip_address)
    
    return campaign




@router.get("/brand/campaigns", response_model=List[dict])
async def get_brand_campaigns_endpoint(current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["brand"])
    campaigns = get_campaigns_by_brand(str(current_user["_id"]))
    return campaigns

@router.get("/influencer/campaigns", response_model=List[dict])
async def get_available_campaigns_endpoint(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    check_user_permission(current_user, ["influencer"])
    available_campaigns = get_available_campaigns_for_influencer(str(current_user["_id"]))
    
    # Add user-specific like and bookmark status
    user_id = str(current_user["_id"])
    for campaign in available_campaigns:
        campaign["user_liked"] = user_id in campaign.get("liked_by", [])
        campaign["user_bookmarked"] = user_id in campaign.get("bookmarked_by", [])
    
    # Track views for each campaign
    for campaign in available_campaigns:
        track_campaign_view(campaign["_id"], user_id, request.client.host)
    
    return available_campaigns

@router.post("/campaigns/{campaign_id}/apply", response_model=dict)
async def apply_to_campaign_endpoint(
    background_tasks: BackgroundTasks,
    campaign_id: str,
    application: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Influencer applies to a campaign (bank account required)"""

    # --------------------------------------------------------------------
    # 1. ROLE CHECK (Influencer Only)
    # --------------------------------------------------------------------
    check_user_permission(current_user, ["influencer"])

    influencer_id = str(current_user["_id"])

    # --------------------------------------------------------------------
    # 2. BANK ACCOUNT CHECK (SIMPLE & REQUIRED)
    # --------------------------------------------------------------------
    bank_service = BankAccountService()
    bank_summary = await bank_service.get_influencer_account_summary(influencer_id)

    if not bank_summary:
        raise HTTPException(
            status_code=400,
            detail="Please add your bank account before applying to campaigns."
        )

    # --------------------------------------------------------------------
    # 3. SUBSCRIPTION-BASED LIMIT ENFORCEMENT
    # --------------------------------------------------------------------
    subscription = current_user.get("subscription", {})
    plan = subscription.get("plan", "free_trial")

    CAMPAIGN_LIMITS = {
        "trial": 3,
        "free_trial": 3,
        "starter_monthly": 10,
        "starter_yearly": 10,
        "pro_monthly": 50,
        "pro_yearly": 50,
        "enterprise_monthly": 999999,
        "enterprise_yearly": 999999
    }

    DAILY_LIMITS = {
        "trial": 1,
        "free_trial": 1,
        "starter_monthly": 3,
        "starter_yearly": 3,
        "pro_monthly": 10,
        "pro_yearly": 10,
        "enterprise_monthly": 999999,
        "enterprise_yearly": 999999,
    }

    max_allowed_total = CAMPAIGN_LIMITS.get(plan, 3)
    max_allowed_daily = DAILY_LIMITS.get(plan, 1)

    total_applied = campaigns_collection.count_documents({
        "applications.influencer_id": influencer_id
    })

    if total_applied >= max_allowed_total:
        raise HTTPException(
            status_code=403,
            detail=f"You reached your plan limit ({total_applied}/{max_allowed_total}). Upgrade to apply for more campaigns."
        )

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    daily_applied = campaigns_collection.count_documents({
        "applications.influencer_id": influencer_id,
        "applications.applied_at": {"$gte": today_start}
    })

    if daily_applied >= max_allowed_daily:
        raise HTTPException(
            status_code=403,
            detail=f"You reached today's limit ({daily_applied}/{max_allowed_daily}). Try again tomorrow."
        )

    # --------------------------------------------------------------------
    # 4. FETCH CAMPAIGN & VALIDATE STATUS
    # --------------------------------------------------------------------
    campaign = get_campaign_by_id(campaign_id)

    if campaign.get("status") != CampaignStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Campaign is not active")

    # --------------------------------------------------------------------
    # 5. CHECK EXISTING APPLICATION
    # --------------------------------------------------------------------
    existing_application = next(
        (app for app in campaign.get("applications", [])
         if app["influencer_id"] == influencer_id),
        None
    )

    if existing_application:
        if existing_application.get("status") == ApplicationStatus.REJECTED:
            campaigns_collection.update_one(
                {"_id": ObjectId(campaign_id)},
                {"$pull": {"applications": {"influencer_id": influencer_id}}}
            )
        else:
            raise HTTPException(status_code=400, detail="You have already applied to this campaign")

    # --------------------------------------------------------------------
    # 6. CREATE APPLICATION (BANK STORED HERE)
    # --------------------------------------------------------------------
    application_dict = {
        "application_id": str(ObjectId()),
        "influencer_id": influencer_id,
        "influencer_name": current_user["username"],
        "status": ApplicationStatus.PENDING,
        "message": application.message,
        "applied_at": datetime.utcnow(),

        # ✅ BANK DETAILS STORED PER APPLICATION
        "bank_snapshot": bank_summary,
        "bank_captured_at": datetime.utcnow()
    }

    success = add_application_to_campaign(campaign_id, application_dict)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to submit application")

    # --------------------------------------------------------------------
    # 7. NOTIFICATIONS
    # --------------------------------------------------------------------
    background_tasks.add_task(
        trigger_application_notifications,
        campaign["brand_id"],
        campaign_id,
        current_user["username"],
        application_dict["application_id"],
        None
    )

    brand = get_user_by_id(campaign["brand_id"])
    brand_name = brand.get("username", "Unknown Brand") if brand else "Unknown Brand"

    background_tasks.add_task(
        influencer_notification_service.create_notification,
        influencer_id,
        "application_submitted",
        "📨 Application Submitted!",
        f"Your application for '{campaign['title']}' by {brand_name} has been submitted successfully.",
        "medium",
        f"/influencer/campaigns/{campaign_id}",
        {
            "campaign_id": campaign_id,
            "campaign_title": campaign["title"],
            "brand_name": brand_name,
            "application_id": application_dict["application_id"]
        }
    )

    if brand and brand.get("email"):
        background_tasks.add_task(
            EmailService.send_application_notification,
            brand["email"],
            current_user["username"],
            campaign["title"]
        )

    # --------------------------------------------------------------------
    # 8. RESPONSE
    # --------------------------------------------------------------------
    return {
        "message": "Application submitted successfully",
        "application_id": application_dict["application_id"],
        "limits": {
            "plan": plan,
            "used_total": total_applied + 1,
            "max_total": max_allowed_total,
            "remaining_total": max_allowed_total - (total_applied + 1),
            "used_today": daily_applied + 1,
            "max_today": max_allowed_daily,
            "remaining_today": max_allowed_daily - (daily_applied + 1)
        }
    }



@router.get("/brand/applications", response_model=List[dict])
async def get_brand_applications_endpoint(current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["brand"])
    
    campaigns = list(campaigns_collection.find({
        "brand_id": str(current_user["_id"]),
        "applications": {"$exists": True, "$ne": []}
    }))
    
    applications = []
    for campaign in campaigns:
        campaign_id = str(campaign["_id"])
        
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        brand_name = brand.get("username", "Unknown Brand") if brand else "Unknown Brand"
        brand_email = brand.get("email", "No email") if brand else "No email"
        
        for app in campaign.get("applications", []):
            application_data = {
                # Application-specific fields
                "application_id": f"{campaign_id}_{app['influencer_id']}",
                "influencer_id": app["influencer_id"],
                "influencer_name": app.get("influencer_name", "Unknown Influencer"),
                "status": app.get("status", "pending"),
                "message": app.get("message", ""),
                "applied_at": app.get("applied_at", datetime.utcnow()),
                "contract_signed": app.get("contract_signed", False),
                "contract_signed_at": app.get("contract_signed_at"),
                "submitted_media": app.get("submitted_media", []),
                "media_submitted_at": app.get("media_submitted_at"),
                
                # Campaign details WITHOUT campaign_ prefix
                "campaign_id": campaign_id,
                "title": campaign.get("title", "Untitled Campaign"),
                "description": campaign.get("description", ""),
                "requirements": campaign.get("requirements", ""),
                "budget": campaign.get("budget", 0),
                "category": campaign.get("category", "Uncategorized"),
                "deadline": campaign.get("deadline", datetime.utcnow()),
                "campaign_status": campaign.get("status", "active"),  # Keep this with prefix to avoid conflict
                "currency": campaign.get("currency", "USD"),
                "campaign_image_id": campaign.get("campaign_image_id"),
                "campaign_video_id": campaign.get("campaign_video_id"),
                "created_at": campaign.get("created_at", datetime.utcnow()),
                
                # Brand details
                "brand_id": campaign.get("brand_id"),
                "brand_name": brand_name,
                "brand_email": brand_email,
            }
            
            # Get influencer details
            try:
                influencer = users_collection.find_one({"_id": ObjectId(app["influencer_id"])})
                if influencer:
                    application_data["influencer_email"] = influencer.get("email", "No email")
                    application_data["influencer_phone"] = influencer.get("phone", "No phone")
                    application_data["influencer_bio"] = influencer.get("bio", "No bio")
            except Exception as e:
                logger.error(f"Error fetching influencer details: {e}")
                application_data["influencer_email"] = "Error fetching details"
            
            applications.append(application_data)
    
    applications.sort(key=lambda x: x.get("applied_at", datetime.min), reverse=True)
    return applications

@router.get("/influencer/applications", response_model=List[dict])
async def get_influencer_applications_endpoint(current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["influencer"])
    
    # Get all campaigns where this influencer has applied
    campaigns = list(campaigns_collection.find({
        "applications.influencer_id": str(current_user["_id"])
    }))
    
    applications = []
    for campaign in campaigns:
        campaign_id = str(campaign["_id"])
        
        # Find the specific application for this influencer
        application = None
        for app in campaign.get("applications", []):
            if app["influencer_id"] == str(current_user["_id"]):
                application = app
                break
        
        if not application:
            continue
            
        # Get brand details
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        brand_name = brand.get("username", "Unknown Brand") if brand else "Unknown Brand"
        brand_email = brand.get("email", "No email") if brand else "No email"
        
        # Create application data with ALL campaign details
        application_data = {
            # Application-specific fields
            "application_id": f"{campaign_id}_{application['influencer_id']}",
            "influencer_id": application["influencer_id"],
            "influencer_name": application.get("influencer_name", current_user.get("username", "Unknown")),
            "status": application.get("status", "pending"),
            "message": application.get("message", ""),
            "applied_at": application.get("applied_at", datetime.utcnow()),
            "contract_signed": application.get("contract_signed", False),
            "contract_signed_at": application.get("contract_signed_at"),
            "submitted_media": application.get("submitted_media", []),
            "media_submitted_at": application.get("media_submitted_at"),
            
            # Complete campaign details
            "campaign_id": campaign_id,
            "campaign_title": campaign.get("title", "Untitled Campaign"),
            "campaign_description": campaign.get("description", ""),
            "campaign_requirements": campaign.get("requirements", ""),
            "campaign_budget": campaign.get("budget", 0),
            "campaign_category": campaign.get("category", "Uncategorized"),
            "campaign_deadline": campaign.get("deadline", datetime.utcnow()),
            "campaign_status": campaign.get("status", "active"),
            "campaign_currency": campaign.get("currency", "USD"),
            "campaign_image_id": campaign.get("campaign_image_id"),
            "campaign_video_id": campaign.get("campaign_video_id"),
            "campaign_created_at": campaign.get("created_at", datetime.utcnow()),
            
            # Brand details
            "brand_id": campaign.get("brand_id"),
            "brand_name": brand_name,
            "brand_email": brand_email,
            
            # Influencer details (for consistency)
            "influencer_email": current_user.get("email", "No email"),
            "influencer_phone": current_user.get("phone", "No phone"),
            "influencer_bio": current_user.get("bio", "No bio"),
        }
        
        applications.append(application_data)
    
    # Sort by application date (newest first)
    applications.sort(key=lambda x: x.get("applied_at", datetime.min), reverse=True)
    
    return applications


@router.put("/applications/{campaign_id}/{influencer_id}", response_model=dict)
async def update_application_status_endpoint(
    background_tasks: BackgroundTasks,
    campaign_id: str, 
    influencer_id: str, 
    status_update: StatusUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update application status with notifications for both brand and influencer"""
    check_user_permission(current_user, ["brand"])
    
    campaign = get_campaign_by_id(campaign_id)
    check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
    # Get current application status before update
    current_application = next(
        (app for app in campaign.get("applications", []) 
         if app["influencer_id"] == influencer_id), 
        None
    )
    
    if not current_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    old_status = current_application.get("status", "pending")
    
    success = update_application_status(campaign_id, influencer_id, status_update.status)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # ✅ SEND REAL-TIME NOTIFICATIONS TO BRAND
    background_tasks.add_task(
        brand_notification_service.notify_application_status_update,
        str(current_user["_id"]),
        campaign_id,
        current_application.get("influencer_name", "Unknown Influencer"),
        old_status,
        status_update.status
    )
    
    # ✅ SEND REAL-TIME NOTIFICATIONS TO INFLUENCER
    brand_name = current_user.get("username", "Unknown Brand")
    background_tasks.add_task(
        trigger_application_status_notification,
        influencer_id,
        campaign_id,
        brand_name,
        status_update.status,
        None
    )
    
    # Send additional influencer notifications based on status
    if status_update.status == ApplicationStatus.APPROVED:
        # Notify about contract opportunity
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "contract_opportunity",
            "🎉 Campaign Approved - Contract Ready!",
            f"Great news! {brand_name} has approved your application for '{campaign['title']}'. A contract is ready for your review.",
            "high",
            f"/influencer/contracts/{campaign_id}",
            {
                "campaign_id": campaign_id,
                "campaign_title": campaign["title"],
                "brand_name": brand_name,
                "budget": campaign.get("budget", 0),
                "deadline": campaign.get("deadline").isoformat() if campaign.get("deadline") else None,
                "approval_date": datetime.utcnow().isoformat()
            }
        )
    
    elif status_update.status == ApplicationStatus.REJECTED:
        # Send encouraging notification for rejection
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "application_encouragement",
            "💪 Keep Applying!",
            f"While you weren't selected for '{campaign['title']}' this time, don't be discouraged! Check out other campaigns that match your profile.",
            "medium",
            "/influencer/campaigns",
            {
                "campaign_id": campaign_id,
                "campaign_title": campaign["title"],
                "brand_name": brand_name,
                "encouragement": True,
                "suggestion": "Explore other campaigns"
            }
        )
    
    # Send email notification to influencer
    influencer = get_user_by_id(influencer_id)
    if influencer and influencer.get("email"):
        background_tasks.add_task(
            EmailService.send_application_status_update,
            influencer["email"],
            influencer["username"],
            campaign["title"],
            status_update.status,
            current_user["username"]
        )
    
    # If approved, send additional brand notification
    if status_update.status == ApplicationStatus.APPROVED:
        background_tasks.add_task(
            brand_notification_service.notify_dashboard_alert,
            str(current_user["_id"]),
            "application_approved",
            {
                "campaign_title": campaign["title"],
                "influencer_name": current_application.get("influencer_name"),
                "approval_date": datetime.utcnow().isoformat()
            }
        )
    
    return {
        "message": f"Application {status_update.status} successfully",
        "requires_contract": status_update.status == ApplicationStatus.APPROVED
    }
    
    
@router.post("/applications/{campaign_id}/{influencer_id}/send-contract", response_model=dict)
async def send_contract_agreement(
    background_tasks: BackgroundTasks,
    campaign_id: str,
    influencer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Send contract agreement to approved influencer with comprehensive notifications"""
    check_user_permission(current_user, ["brand"])
    
    campaign = get_campaign_by_id(campaign_id)
    check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
    # Check if application is approved
    application = next(
        (app for app in campaign.get("applications", []) 
         if app["influencer_id"] == influencer_id and app["status"] == ApplicationStatus.APPROVED), 
        None
    )
    
    if not application:
        raise HTTPException(status_code=400, detail="Application not found or not approved")
    
    influencer = get_user_by_id(influencer_id)
    
    # ✅ UPDATE: Add contract tracking in database
    result = campaigns_collection.update_one(
        {
            "_id": validate_object_id(campaign_id),
            "applications.influencer_id": influencer_id
        },
        {
            "$set": {
                "applications.$.contract_sent": True,
                "applications.$.contract_sent_at": datetime.utcnow(),
                "applications.$.contract_sent_by": str(current_user["_id"]),
                "applications.$.status": ApplicationStatus.CONTRACTED
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update contract status")
    
    # ✅ SEND REAL-TIME NOTIFICATIONS TO BRAND
    background_tasks.add_task(
        brand_notification_service.notify_application_status_update,
        str(current_user["_id"]),
        campaign_id,
        application.get("influencer_name", "Unknown Influencer"),
        ApplicationStatus.APPROVED,
        ApplicationStatus.CONTRACTED
    )
    
    # ✅ SEND REAL-TIME NOTIFICATIONS TO INFLUENCER
    brand_name = current_user.get("username", "Unknown Brand")
    background_tasks.add_task(
        influencer_notification_service.notify_application_status,
        influencer_id,
        campaign_id,
        brand_name,
        "contracted"
    )
    
    # Send detailed contract notification to influencer
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        influencer_id,
        "contract_received",
        "📝 Contract Received!",
        f"🎊 Exciting news! {brand_name} has sent you a contract for '{campaign['title']}'. Review the terms and accept to get started.",
        "high",
        f"/influencer/contracts/{campaign_id}/review",
        {
            "campaign_id": campaign_id,
            "campaign_title": campaign["title"],
            "brand_name": brand_name,
            "budget": campaign.get("budget", 0),
            "deadline": campaign.get("deadline").isoformat() if campaign.get("deadline") else None,
            "contract_sent_date": datetime.utcnow().isoformat(),
            "action_required": True
        }
    )
    
    # Send contract email
    if influencer and influencer.get("email"):
        background_tasks.add_task(
            EmailService.send_contract_agreement,
            influencer["email"],
            influencer["username"],
            campaign["title"],
            current_user["username"],
            campaign
        )
    
    return {"message": "Contract agreement sent successfully to influencer"}

@router.post("/contracts/accept", response_model=dict)
async def accept_contract(
    background_tasks: BackgroundTasks,
    contract: ContractAgreement,
    current_user: dict = Depends(get_current_user)
):
    """Influencer accepts contract agreement with comprehensive notifications"""
    check_user_permission(current_user, ["influencer"])
    
    if str(current_user["_id"]) != contract.influencer_id:
        raise HTTPException(status_code=403, detail="You can only accept your own contracts")
    
    campaign = get_campaign_by_id(contract.campaign_id)
    
    # Verify application exists and is approved/contracted
    application = next(
        (app for app in campaign.get("applications", []) 
         if app["influencer_id"] == contract.influencer_id and 
         app["status"] in [ApplicationStatus.APPROVED, ApplicationStatus.CONTRACTED]), 
        None
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Approved application not found")
    
    # Create contract record
    contract_data = contract.model_dump()
    contract_data["signed_at"] = datetime.utcnow()
    contract_id = create_contract(contract_data)
    
    # ✅ SEND REAL-TIME NOTIFICATIONS TO BRAND
    background_tasks.add_task(
        brand_notification_service.notify_application_status_update,
        campaign["brand_id"],
        contract.campaign_id,
        current_user["username"],
        application.get("status", "approved"),
        "contracted_accepted"
    )
    
    background_tasks.add_task(
        brand_notification_service.notify_dashboard_alert,
        campaign["brand_id"],
        "contract_accepted",
        {
            "campaign_title": campaign["title"],
            "influencer_name": current_user["username"],
            "acceptance_date": datetime.utcnow().isoformat()
        }
    )
    
    # ✅ SEND REAL-TIME NOTIFICATIONS TO INFLUENCER
    brand = get_user_by_id(campaign["brand_id"])
    brand_name = brand.get("username", "Unknown Brand") if brand else "Unknown Brand"
    
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        str(current_user["_id"]),
        "contract_accepted",
        "✅ Contract Accepted!",
        f"Awesome! You've accepted the contract for '{campaign['title']}'. You can now start working on the campaign content.",
        "high",
        f"/influencer/campaigns/{contract.campaign_id}/work",
        {
            "campaign_id": contract.campaign_id,
            "campaign_title": campaign["title"],
            "brand_name": brand_name,
            "acceptance_date": datetime.utcnow().isoformat(),
            "next_steps": ["Review requirements", "Plan content", "Submit media"]
        }
    )
    
    # Send campaign start guidance
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        str(current_user["_id"]),
        "campaign_guidance",
        "💡 Campaign Kickoff Tips",
        f"Ready to start '{campaign['title']}'? Review the requirements carefully and plan your content strategy for best results.",
        "medium",
        f"/influencer/campaigns/{contract.campaign_id}/requirements",
        {
            "campaign_id": contract.campaign_id,
            "campaign_title": campaign["title"],
            "requirements": campaign.get("requirements", ""),
            "deadline": campaign.get("deadline").isoformat() if campaign.get("deadline") else None,
            "guidance_type": "kickoff_tips"
        }
    )
    
    return {"message": "Contract accepted successfully", "contract_id": contract_id}

# -------------------- ENHANCED MEDIA SUBMISSION ROUTES --------------------
@router.post("/media/submit", response_model=dict)
async def submit_media_files_endpoint(
    background_tasks: BackgroundTasks,
    request: Request,
    campaign_id: str = Form(...),
    description: Optional[str] = Form(None),
    media_files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Influencer submits media files for a campaign with comprehensive error handling"""
    
    logger.info(f"🎬 Media submission request received from {current_user['username']}")
    
    try:
        # 1. Authentication & Permission Check
        check_user_permission(current_user, ["influencer"])
        influencer_id = str(current_user["_id"])
        
        logger.info(f"📤 Processing media submission for campaign: {campaign_id}")

        # 2. Validate campaign ID format
        if not ObjectId.is_valid(campaign_id):
            logger.error(f"❌ Invalid campaign ID format: {campaign_id}")
            raise HTTPException(
                status_code=400, 
                detail="Invalid campaign ID format"
            )

        # 3. Get campaign and validate existence
        campaign = get_campaign_by_id(campaign_id)
        if not campaign:
            logger.error(f"❌ Campaign not found: {campaign_id}")
            raise HTTPException(
                status_code=404, 
                detail="Campaign not found"
            )

        logger.info(f"✅ Campaign found: {campaign.get('title', 'Unknown')}")

        # 4. Check application and contract status with detailed logging
        application = None
        for app in campaign.get("applications", []):
            if app.get("influencer_id") == influencer_id:
                application = app
                break

        if not application:
            logger.error(f"❌ No application found for influencer {influencer_id} in campaign {campaign_id}")
            logger.info(f"📋 Available applications: {[app.get('influencer_id') for app in campaign.get('applications', [])]}")
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "no_application",
                    "message": "You haven't applied to this campaign",
                    "campaign_id": campaign_id,
                    "action_required": "apply_first"
                }
            )

        logger.info(f"✅ Application found. Status: {application.get('status')}, Contract signed: {application.get('contract_signed')}")

        # Check contract status
        if not application.get("contract_signed"):
            logger.error(f"❌ Contract not signed for campaign {campaign_id}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "contract_not_signed",
                    "message": "Contract must be accepted before submitting media",
                    "campaign_id": campaign_id,
                    "current_status": application.get("status"),
                    "action_required": "accept_contract",
                    "contract_url": f"/influencer/contracts/{campaign_id}"
                }
            )

        # Check if media already submitted
        if application.get("submitted_media"):
            logger.warning(f"⚠️ Media already submitted for campaign {campaign_id}")
            raise HTTPException(
                status_code=400,
                detail="Media already submitted for this campaign. Contact support for modifications."
            )

        # 5. Validate media files
        if not media_files:
            logger.error("❌ No media files provided in request")
            raise HTTPException(
                status_code=400, 
                detail="No media files provided"
            )

        logger.info(f"📁 Received {len(media_files)} file(s) for processing")

        MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
        ALLOWED_CONTENT_TYPES = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm',
            'audio/mpeg', 'audio/wav', 'audio/ogg',
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        submitted_media = []
        upload_errors = []

        for media_file in media_files:
            file_info = {
                "filename": media_file.filename,
                "content_type": media_file.content_type,
                "size": 0
            }
            
            try:
                logger.info(f"📄 Processing file: {media_file.filename} (type: {media_file.content_type})")
                
                # Read file content
                content = await media_file.read()
                file_size = len(content)
                file_info["size"] = file_size
                
                # Check file size
                if file_size > MAX_FILE_SIZE:
                    error_msg = f"File {media_file.filename} exceeds maximum size of 100MB (actual: {file_size/1024/1024:.1f}MB)"
                    logger.error(f"❌ {error_msg}")
                    upload_errors.append({
                        "filename": media_file.filename,
                        "error": error_msg,
                        "max_size_mb": 100,
                        "actual_size_mb": round(file_size/1024/1024, 1)
                    })
                    continue
                
                # Check content type
                if media_file.content_type not in ALLOWED_CONTENT_TYPES:
                    error_msg = f"File type {media_file.content_type} is not supported"
                    logger.error(f"❌ {error_msg}")
                    upload_errors.append({
                        "filename": media_file.filename,
                        "error": error_msg,
                        "allowed_types": ALLOWED_CONTENT_TYPES
                    })
                    continue
                
                # Reset file pointer for upload
                media_file.file.seek(0)
                
                # Upload to GridFS
                file_id = await save_file_to_storage(media_file, "submitted_media")
                media_type = get_media_type_from_content_type(media_file.content_type)
                
                submitted_media.append({
                    "file_id": file_id,
                    "filename": media_file.filename,
                    "content_type": media_file.content_type,
                    "media_type": media_type,
                    "size": file_size,
                    "description": description,
                    "submitted_at": datetime.utcnow()
                })
                
                logger.info(f"✅ Successfully uploaded: {media_file.filename} ({file_size/1024/1024:.1f}MB)")
                
            except Exception as e:
                error_msg = f"Failed to process file {media_file.filename}: {str(e)}"
                logger.error(f"❌ {error_msg}")
                upload_errors.append({
                    "filename": media_file.filename,
                    "error": error_msg
                })
        
        # 6. Check if any files were successfully uploaded
        if not submitted_media:
            logger.error("❌ No files could be uploaded successfully")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "no_valid_files",
                    "message": "No files could be uploaded successfully",
                    "upload_errors": upload_errors
                }
            )

        # 7. Update campaign with submitted media
        logger.info(f"💾 Updating campaign with {len(submitted_media)} media files")
        success = submit_media_files(campaign_id, influencer_id, submitted_media)
        
        if not success:
            # Clean up uploaded files if update fails
            logger.error("❌ Failed to update campaign with media files - cleaning up uploaded files")
            for media in submitted_media:
                try:
                    delete_file_from_storage(media["file_id"])
                except Exception as e:
                    logger.error(f"❌ Failed to clean up file {media['file_id']}: {str(e)}")
            
            raise HTTPException(
                status_code=500, 
                detail="Failed to submit media files to campaign"
            )

        logger.info(f"✅ Successfully updated campaign with media files")

        # 8. Send notifications
        brand = get_user_by_id(campaign["brand_id"])
        brand_name = brand.get("username", "Unknown Brand") if brand else "Unknown Brand"
        
        # Notify brand
        background_tasks.add_task(
            brand_notification_service.notify_media_submitted,
            campaign["brand_id"],
            campaign_id,
            current_user["username"],
            len(submitted_media)
        )
        
        background_tasks.add_task(
            brand_notification_service.notify_application_status_update,
            campaign["brand_id"],
            campaign_id,
            current_user["username"],
            "contracted",
            "media_submitted"
        )
        
        # Notify influencer
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "media_submitted",
            "🎬 Media Submitted Successfully!",
            f"Great work! You've submitted {len(submitted_media)} file(s) for '{campaign['title']}'. {brand_name} will review your content soon.",
            "medium",
            f"/influencer/campaigns/{campaign_id}/submissions",
            {
                "campaign_id": campaign_id,
                "campaign_title": campaign["title"],
                "brand_name": brand_name,
                "file_count": len(submitted_media),
                "submission_date": datetime.utcnow().isoformat(),
                "status": "under_review"
            }
        )
        
        # Send next steps notification
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "submission_next_steps",
            "⏳ What's Next?",
            f"Your content for '{campaign['title']}' is under review. You'll be notified when {brand_name} provides feedback or approves your submission.",
            "low",
            f"/influencer/campaigns/{campaign_id}",
            {
                "campaign_id": campaign_id,
                "campaign_title": campaign["title"],
                "expected_timeline": "1-3 business days",
                "next_steps": ["Wait for review", "Check for feedback", "Make revisions if needed"]
            }
        )
        
        # Notify brand via email
        if brand and brand.get("email"):
            background_tasks.add_task(
                EmailService.send_email,
                brand["email"],
                f"Media Submitted for Campaign: {campaign['title']}",
                f"Influencer {current_user['username']} has submitted {len(submitted_media)} media file(s) for your campaign '{campaign['title']}'. Please review them in your dashboard."
            )

        # 9. Prepare success response
        response_data = {
            "message": "Media files submitted successfully",
            "submitted_files": len(submitted_media),
            "files": submitted_media,
            "campaign_title": campaign["title"],
            "brand_name": brand_name
        }
        
        # Add upload errors to response if any files failed
        if upload_errors:
            response_data["upload_errors"] = upload_errors
            response_data["partial_success"] = True
            logger.warning(f"⚠️ Media submission completed with {len(upload_errors)} error(s)")

        logger.info(f"✅ Media submission completed successfully for campaign {campaign_id}")
        
        return response_data

    except HTTPException as he:
        logger.error(f"❌ HTTPException in media submission: {he.detail}")
        raise he
        
    except Exception as e:
        logger.error(f"❌ Unexpected error in media submission: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred during media submission"
        )
    
@router.put("/campaigns/{campaign_id}/complete", response_model=dict)
async def complete_campaign_endpoint(
    background_tasks: BackgroundTasks,
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark campaign as completed with automatic payment creation"""
    check_user_permission(current_user, ["brand"])
    
    campaign = get_campaign_by_id(campaign_id)
    check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
    # Update campaign status
    success = update_campaign(campaign_id, {"status": CampaignStatus.COMPLETED})
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # ✅ AUTOMATICALLY CREATE ADMIN PAYMENTS FOR EACH INFLUENCER
    for application in campaign.get("applications", []):
        if application.get("status") == ApplicationStatus.MEDIA_SUBMITTED:
            
            # Create admin payment record
            payment_data = {
                "campaign_id": campaign_id,
                "influencer_id": application["influencer_id"],
                "brand_id": campaign["brand_id"],
                "amount": campaign["budget"],  # Or calculate based on agreement
                "currency": campaign.get("currency", "USD"),
                "payment_method": "manual_transfer",  # Default method
                "status": "pending_approval",
                "created_by": str(current_user["_id"]),
                "created_by_name": current_user.get("username", "Brand"),
                "notes": f"Auto-generated from campaign completion: {campaign['title']}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {
                    "campaign_title": campaign["title"],
                    "influencer_name": application.get("influencer_name"),
                    "auto_generated": True
                }
            }
            
            # Create the admin payment
            payment_id = PaymentModel.create_payment(payment_data)
            
            # Notify influencer about payment creation
            background_tasks.add_task(
                influencer_notification_service.create_notification,
                application["influencer_id"],
                "payment_initiated",
                "💰 Payment Initiated",
                f"Your payment of {campaign['currency']} {campaign['budget']} for '{campaign['title']}' has been initiated and is pending admin approval.",
                "medium",
                "/influencer/earnings",
                {
                    "campaign_id": campaign_id,
                    "campaign_title": campaign["title"],
                    "amount": campaign["budget"],
                    "currency": campaign.get("currency", "USD"),
                    "status": "pending_approval"
                }
            )
    
    # ✅ Send notifications
    for application in campaign.get("applications", []):
        if application.get("status") in [ApplicationStatus.MEDIA_SUBMITTED, ApplicationStatus.CONTRACTED]:
            
            # Notify influencer about campaign completion
            background_tasks.add_task(
                influencer_notification_service.create_notification,
                application["influencer_id"],
                "campaign_completed",
                "🏆 Campaign Completed!",
                f"The campaign '{campaign['title']}' has been marked as completed. Thank you for your great work!",
                "medium",
                f"/influencer/campaigns/{campaign_id}",
                {
                    "campaign_id": campaign_id,
                    "campaign_title": campaign["title"],
                    "brand_name": current_user.get("username", "Unknown Brand"),
                    "completion_date": datetime.utcnow().isoformat(),
                    "thank_you": True
                }
            )
    
    # ✅ Send notification to brand
    background_tasks.add_task(
        brand_notification_service.notify_campaign_status_change,
        str(current_user["_id"]),
        campaign_id,
        "active",
        "completed"
    )
    
    return {
        "message": "Campaign marked as completed successfully",
        "auto_payments_created": len([app for app in campaign.get("applications", []) 
                                    if app.get("status") == ApplicationStatus.MEDIA_SUBMITTED])
    }

@router.get("/media/campaign/{campaign_id}", response_model=List[MediaFileResponse])
async def get_campaign_media_files(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all media files submitted for a specific campaign"""
    campaign = get_campaign_by_id(campaign_id)
    
    # Check permissions
    is_brand_owner = current_user["role"] == "brand" and campaign["brand_id"] == str(current_user["_id"])
    is_influencer = current_user["role"] == "influencer"
    
    if not (is_brand_owner or is_influencer):
        raise HTTPException(status_code=403, detail="Not authorized to view these media files")
    
    if is_influencer:
        media_files = get_media_files_by_campaign(campaign_id, str(current_user["_id"]))
    else:  # brand owner
        # Get all media files from all influencers for this campaign
        media_files = []
        for application in campaign.get("applications", []):
            if application.get("submitted_media"):
                for media in application["submitted_media"]:
                    try:
                        file_obj = get_file_from_storage(media["file_id"])
                        media_files.append({
                            "file_id": media["file_id"],
                            "filename": media["filename"],
                            "content_type": media["content_type"],
                            "media_type": media.get("media_type", MediaType.OTHER),
                            "size": media.get("size", 0),
                            "description": media.get("description"),
                            "submitted_at": media.get("submitted_at"),
                            "download_url": f"/api/media/{media['file_id']}/download",
                            "influencer_id": application["influencer_id"],
                            "influencer_name": application.get("influencer_name", "Unknown Influencer")
                        })
                    except Exception as e:
                        logger.error(f"Failed to get media file {media['file_id']}: {str(e)}")
                        continue
    
    return media_files

@router.get("/media/influencer", response_model=List[dict])
async def get_influencer_all_media_files(
    current_user: dict = Depends(get_current_user)
):
    """Get all media files submitted by the influencer across all campaigns"""
    check_user_permission(current_user, ["influencer"])
    
    media_files = get_all_influencer_media(str(current_user["_id"]))
    return media_files

@router.get("/media/{file_id}/download")
async def download_media_file(file_id: str):
    """Download a media file - ASCII filename only"""
    try:
        file_obj = get_file_from_storage(file_id)
        
        if not file_obj:
            raise HTTPException(status_code=404, detail="File not found")

        # Guess extension from file_id
        file_extension = ""
        content_type = 'application/octet-stream'
        
        if file_id.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            file_extension = ".jpg" if '.jpg' in file_id.lower() or '.jpeg' in file_id.lower() else ".png" # simplified
            content_type = 'image/jpeg' if '.jp' in file_id.lower() else 'image/png'
        elif file_id.lower().endswith(('.mp4', '.mov', '.avi')):
            file_extension = ".mp4"
            content_type = 'video/mp4'
        elif file_id.lower().endswith('.pdf'):
            file_extension = ".pdf"
            content_type = 'application/pdf'
        
        safe_filename = f"media_file_{uuid.uuid4().hex[:8]}{file_extension}"
        
        return StreamingResponse(
            BytesIO(file_obj),
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"',
                "Content-Length": str(len(file_obj)),
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to download media file {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

@router.get("/media/{file_id}/view")
async def view_media_file(file_id: str):
    """View a media file in browser with proper encoding"""
    try:
        file_obj = get_file_from_storage(file_id)
        
        if not file_obj:
            raise HTTPException(status_code=404, detail="File not found")

        # Determine content type from extension
        content_type = 'application/octet-stream'
        if file_id.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif file_id.lower().endswith('.png'):
            content_type = 'image/png'
        elif file_id.lower().endswith('.webp'):
            content_type = 'image/webp'
        elif file_id.lower().endswith('.gif'):
            content_type = 'image/gif'
        elif file_id.lower().endswith('.mp4'):
            content_type = 'video/mp4'
        elif file_id.lower().endswith('.pdf'):
            content_type = 'application/pdf'
            
        disposition = "inline"
        if not content_type.startswith(('image/', 'video/', 'audio/', 'application/pdf')):
            disposition = "attachment"

        headers = {
            "Content-Length": str(len(file_obj)),
            "Cache-Control": "no-cache",
            "Content-Disposition": f'{disposition}; filename="file_{file_id.split("/")[-1]}"'
        }
        
        return StreamingResponse(
            BytesIO(file_obj),
            media_type=content_type,
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Failed to view media file {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to view file")



# -------------------- MEDIA ROUTES (Keep existing) --------------------
@router.get("/campaigns/{campaign_id}/image")
async def get_campaign_image(campaign_id: str):
    campaign = get_campaign_by_id(campaign_id)
    
    if not campaign.get("campaign_image_id"):
        raise HTTPException(status_code=404, detail="Campaign image not found")
    
    file_obj = get_file_from_storage(campaign["campaign_image_id"])
    
    return StreamingResponse(
        BytesIO(file_obj),
        media_type="image/jpeg",
        headers={"Content-Disposition": f"inline; filename={campaign_id}.jpg"}
    )

@router.get("/campaigns/{campaign_id}/video")
async def get_campaign_video(campaign_id: str):
    campaign = get_campaign_by_id(campaign_id)
    
    if not campaign.get("campaign_video_id"):
        raise HTTPException(status_code=404, detail="Campaign video not found")
    
    file_obj = get_file_from_storage(campaign["campaign_video_id"])
    
    return StreamingResponse(
        BytesIO(file_obj),
        media_type="video/mp4",
        headers={"Content-Disposition": f"inline; filename={campaign_id}.mp4"}
    )

@router.get("/campaigns/image/{file_id}")
async def get_campaign_image_by_id(file_id: str):
    """Get campaign image by file ID"""
    try:
        content = get_file_from_storage(file_id)
        return StreamingResponse(
            BytesIO(content),
            media_type="image/jpeg",  # Simplified detect if needed
            headers={"Content-Disposition": f"inline; filename={file_id}"}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="Image not found")

@router.get("/campaigns/video/{file_id}")
async def get_campaign_video_by_id(file_id: str):
    """Get campaign video by file ID"""
    try:
        content = get_file_from_storage(file_id)
        return StreamingResponse(
            BytesIO(content),
            media_type="video/mp4",
            headers={"Content-Disposition": f"inline; filename={file_id}"}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="Video not found")

# -------------------- MESSAGE ROUTES (Keep existing) --------------------
@router.post("/applications/contact", response_model=dict)
async def send_message_to_influencer(
    campaign_id: str = Form(...),
    influencer_id: str = Form(...),
    message: str = Form(...),
    attachments: List[UploadFile] = File([]),
    current_user: dict = Depends(get_current_user)
):
    campaign = get_campaign_by_id(campaign_id)
    
    is_brand_owner = current_user["role"] == "brand" and campaign["brand_id"] == str(current_user["_id"])
    is_influencer = current_user["role"] == "influencer" and influencer_id == str(current_user["_id"])
    
    if not (is_brand_owner or is_influencer):
        raise HTTPException(status_code=403, detail="You can only message participants of this campaign")
    
    sender_id = str(current_user["_id"])
    receiver_id = influencer_id if current_user["role"] == "brand" else campaign["brand_id"]
    
    attachment_data = []
    for attachment in attachments:
        try:
            attachment_id = await save_file_to_storage(attachment, "message_attachment")
            
            attachment_data.append({
                "file_id": attachment_id,
                "filename": attachment.filename,
                "content_type": attachment.content_type,
                "size": attachment.size
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
    message_data = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "campaign_id": campaign_id,
        "content": message,
        "message_type": "text" if not attachment_data else "file",
        "attachments": attachment_data,
        "created_at": datetime.utcnow(),
        "read": False
    }
    
    message_id = create_message(message_data)
    return {"message": "Message sent successfully", "message_id": message_id}

@router.get("/campaigns/{campaign_id}/messages/{other_user_id}", response_model=List[dict])
async def get_messages(
    campaign_id: str,
    other_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    campaign = get_campaign_by_id(campaign_id)
    
    is_brand_owner = current_user["role"] == "brand" and campaign["brand_id"] == str(current_user["_id"])
    is_influencer = current_user["role"] == "influencer" and other_user_id == str(current_user["_id"])
    
    if not (is_brand_owner or is_influencer):
        raise HTTPException(status_code=403, detail="You can only view messages for campaigns you're involved in")
    
    if other_user_id != str(current_user["_id"]):
        mark_messages_as_read(other_user_id, str(current_user["_id"]), campaign_id)
    
    messages = get_messages_between_users(str(current_user["_id"]), other_user_id, campaign_id)
    
    for msg in messages:
        sender = users_collection.find_one({"_id": ObjectId(msg["sender_id"])})
        if sender:
            msg["sender_name"] = sender.get("username", "Unknown User")
        
        receiver = users_collection.find_one({"_id": ObjectId(msg["receiver_id"])})
        if receiver:
            msg["receiver_name"] = receiver.get("username", "Unknown User")
    
    return messages

@router.get("/conversations", response_model=List[dict])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    conversations = get_user_conversations(str(current_user["_id"]))
    return conversations

@router.get("/messages/unread/count", response_model=dict)
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = get_unread_message_count(str(current_user["_id"]))
    return {"unread_count": count}

@router.get("/messages/{message_id}/attachment/{attachment_index}")
async def download_attachment(
    message_id: str,
    attachment_index: int,
    current_user: dict = Depends(get_current_user)
):
    message = messages_collection.find_one({"_id": validate_object_id(message_id)})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if (str(current_user["_id"]) not in [message["sender_id"], message["receiver_id"]]):
        raise HTTPException(status_code=403, detail="You don't have permission to access this attachment")
    
    if not message.get("attachments") or attachment_index >= len(message["attachments"]):
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    attachment = message["attachments"][attachment_index]
    file_obj = get_file_from_storage(attachment["file_id"])
    
    return StreamingResponse(
        BytesIO(file_obj),
        media_type=attachment["content_type"],
        headers={"Content-Disposition": f"attachment; filename={attachment['filename']}"}
    )

# -------------------- ADMIN ROUTES (Keep existing) --------------------
@router.get("/admin/campaigns", response_model=List[dict])
async def get_all_campaigns_endpoint(current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["admin"])
    
    campaigns = get_all_campaigns_admin()
    return campaigns

@router.put("/admin/campaigns/{campaign_id}/status", response_model=dict)
async def admin_update_campaign_status_endpoint(
    campaign_id: str, 
    status_update: StatusUpdate, 
    current_user: dict = Depends(get_current_user)
):
    check_user_permission(current_user, ["admin"])
    
    valid_statuses = ["active", "paused", "completed"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    success = update_campaign(campaign_id, {"status": status_update.status})
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return {"message": f"Campaign status updated to {status_update.status}"}

@router.delete("/admin/campaigns/{campaign_id}", response_model=dict)
async def admin_delete_campaign_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["admin"])
    
    success = delete_campaign(campaign_id)
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return {"message": "Campaign deleted successfully"}

@router.get("/admin/campaigns/stats", response_model=CampaignStats)
async def get_campaign_stats_endpoint(current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["admin"])
    
    stats = get_campaign_stats()
    return CampaignStats(**stats)

@router.get("/admin/campaigns/{campaign_id}", response_model=dict)
async def get_campaign_detail_endpoint(campaign_id: str, current_user: dict = Depends(get_current_user)):
    check_user_permission(current_user, ["admin"])
    
    campaign = get_campaign_by_id(campaign_id)
    
    try:
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        if brand:
            campaign["brand_name"] = brand.get("username", "Unknown Brand")
            campaign["brand_email"] = brand.get("email", "No email")
    except InvalidId:
        campaign["brand_name"] = "Invalid Brand ID"
        campaign["brand_email"] = "Invalid Brand ID"
    
    for application in campaign.get("applications", []):
        try:
            influencer = users_collection.find_one({"_id": ObjectId(application["influencer_id"])})
            if influencer:
                application["influencer_name"] = influencer.get("username", "Unknown Influencer")
                application["influencer_email"] = influencer.get("email", "No email")
        except (InvalidId, KeyError):
            application["influencer_name"] = "Invalid Influencer ID"
            application["influencer_email"] = "Invalid Influencer ID"
    
    return campaign

# -------------------- NEW NOTIFICATION ENDPOINTS --------------------

@router.get("/campaigns/{campaign_id}/notifications")
async def get_campaign_notifications(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get notifications specific to a campaign"""
    check_user_permission(current_user, ["brand"])
    
    campaign = get_campaign_by_id(campaign_id)
    check_user_permission(current_user, campaign_brand_id=campaign.get("brand_id"))
    
    # Get campaign-specific notifications
    notifications = await brand_notification_service.get_brand_notifications(
        brand_id=str(current_user["_id"]),
        limit=50
    )
    
    campaign_notifications = [
        n for n in notifications 
        if n.get('metadata', {}).get('campaign_id') == campaign_id
    ]
    
    return {
        "campaign_id": campaign_id,
        "campaign_title": campaign["title"],
        "notifications": campaign_notifications,
        "total": len(campaign_notifications)
    }

@router.get("/brand/notifications/summary")
async def get_brand_notifications_summary(
    current_user: dict = Depends(get_current_user)
):
    """Get summary of brand notifications"""
    check_user_permission(current_user, ["brand"])
    
    brand_id = str(current_user["_id"])
    
    # Get all notifications
    notifications = await brand_notification_service.get_brand_notifications(
        brand_id=brand_id,
        limit=100
    )
    
    # Categorize notifications
    campaign_notifications = [n for n in notifications if n.get('type', '').startswith('campaign_')]
    application_notifications = [n for n in notifications if n.get('type', '').startswith('application_')]
    payment_notifications = [n for n in notifications if n.get('type', '').startswith('payment_')]
    system_notifications = [n for n in notifications if n.get('type', '').startswith('system_')]
    
    # Get unread counts
    unread_count = await brand_notification_service.get_unread_count(brand_id)
    
    return {
        "summary": {
            "total": len(notifications),
            "unread": unread_count,
            "campaigns": len(campaign_notifications),
            "applications": len(application_notifications),
            "payments": len(payment_notifications),
            "system": len(system_notifications)
        },
        "recent_alerts": [n for n in notifications if n.get('real_time_alert', False)][:10]
    }
    
# -------------------- NEW INFLUENCER NOTIFICATION ENDPOINTS --------------------
@router.get("/influencer/notifications/real-time")
async def get_influencer_real_time_notifications(
    current_user: dict = Depends(get_current_user),
    limit: int = 20
):
    """Get real-time notifications for influencer dashboard"""
    check_user_permission(current_user, ["influencer"])
    
    try:
        influencer_id = str(current_user["_id"])
        
        # Get real-time alerts (unread, high priority, recent)
        notifications = await influencer_notification_service.get_influencer_notifications(
            influencer_id=influencer_id,
            limit=limit,
            unread_only=True
        )
        
        # Filter for important notification types
        important_types = [
            "application_status", "contract_received", "contract_accepted", 
            "payment_received", "campaign_invitation", "campaign_urgent"
        ]
        
        real_time_notifications = [
            n for n in notifications 
            if n.get('type') in important_types or n.get('priority') in ['high', 'urgent']
        ]
        
        return {
            "real_time_alerts": real_time_notifications,
            "total_alerts": len(real_time_notifications),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting real-time influencer notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch real-time notifications")

@router.get("/influencer/notifications/campaigns/{campaign_id}")
async def get_campaign_specific_notifications(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get notifications specific to a campaign for influencer"""
    check_user_permission(current_user, ["influencer"])
    
    campaign = get_campaign_by_id(campaign_id)
    
    try:
        influencer_id = str(current_user["_id"])
        
        # Get all notifications
        notifications = await influencer_notification_service.get_influencer_notifications(
            influencer_id=influencer_id,
            limit=100
        )
        
        # Filter for campaign-specific notifications
        campaign_notifications = [
            n for n in notifications 
            if n.get('metadata', {}).get('campaign_id') == campaign_id
        ]
        
        return {
            "campaign_id": campaign_id,
            "campaign_title": campaign["title"],
            "notifications": campaign_notifications,
            "total": len(campaign_notifications)
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting campaign notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign notifications")

# -------------------- ENHANCED PAYMENT COMPLETION WITH INFLUENCER NOTIFICATIONS --------------------
@router.put("/payments/{payment_id}/complete", response_model=dict)
async def complete_influencer_payment(
    background_tasks: BackgroundTasks,
    payment_id: str,
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Complete payment processing with comprehensive notifications"""
    check_user_permission(current_user, ["brand", "admin"])
    
    payment = get_payment_by_id(payment_id)
    campaign = get_campaign_by_id(payment["campaign_id"])
    
    # Update payment status
    success = update_payment_status(payment_id, "completed", transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # ✅ SEND PAYMENT SUCCESS NOTIFICATION TO INFLUENCER
    background_tasks.add_task(
        influencer_notification_service.notify_payment_received,
        payment["influencer_id"],
        payment["amount"],
        campaign["title"],
        "stripe"  # or other payment method
    )
    
    # Send earning milestone check
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        payment["influencer_id"],
        "payment_success",
        "✅ Payment Received!",
        f"Great news! ${payment['amount']:.2f} for '{campaign['title']}' has been deposited to your account.",
        "high",
        "/influencer/earnings",
        {
            "campaign_id": payment["campaign_id"],
            "campaign_title": campaign["title"],
            "amount": payment["amount"],
            "currency": payment.get("currency", "USD"),
            "transaction_id": transaction_id,
            "completion_date": datetime.utcnow().isoformat(),
            "available_for_withdrawal": True
        }
    )
    
    # Check for earning milestone
    # This would typically query the database for total earnings
    total_earnings = 1000.00  # Example - would be calculated from DB
    
    if total_earnings >= 1000:
        background_tasks.add_task(
            influencer_notification_service.notify_earning_milestone,
            payment["influencer_id"],
            total_earnings,
            "all_time"
        )
    
    return {"message": "Payment completed successfully"}

# -------------------- HEALTH CHECK --------------------
@router.get("/health")
async def health_check():
    """Health check endpoint with notification system status"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "influencer-platform-api",
        "version": "2.0.0",
        "notifications": {
            "brand_system": "active",
            "influencer_system": "active",
            "real_time_alerts": True,
            "email_integration": True
        }
    }
    
    
