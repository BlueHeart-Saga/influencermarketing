# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from database import db  # adjust to your setup

# router = APIRouter()

# class ContactRequest(BaseModel):
#     campaign_id: str
#     influencer_id: str
#     brand_id: str
#     message: str | None = None

# @router.post("/applications/contact")
# async def contact_brand(req: ContactRequest):
#     try:
#         # Save request to DB (or trigger email)
#         db["contact_requests"].insert_one(req.dict())
#         return {"success": True, "message": "Contact request sent successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
