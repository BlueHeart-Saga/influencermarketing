from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
from typing import Optional, Literal

from database import feedback_collection

router = APIRouter()

# Allowed Statuses
ALLOWED_STATUSES = ["new", "reviewed", "in_progress", "resolved"]


# ---------------------------
# Pydantic Model
# ---------------------------
class Feedback(BaseModel):
    message: str
    type: Optional[Literal["general", "bug", "feature", "help"]] = "general"
    page_url: Optional[str] = None
    email: Optional[str] = None   # You may store email if user enters


# ---------------------------
# Submit Feedback (OPEN, PUBLIC)
# ---------------------------
@router.post("/feedback")
async def submit_feedback(feedback: Feedback):

    feedback_data = {
        "message": feedback.message.strip(),
        "type": feedback.type,
        "page_url": feedback.page_url,
        "email": feedback.email,
        "created_at": datetime.utcnow(),
        "status": "new",
    }

    result = feedback_collection.insert_one(feedback_data)

    return {
        "message": "Feedback submitted successfully",
        "id": str(result.inserted_id),
    }


# ---------------------------
# Get All Feedback (OPEN VIEW — YOU CAN LOCK LATER)
# ---------------------------
@router.get("/feedback")
async def get_feedback():

    feedback_list = list(
        feedback_collection.find().sort("created_at", -1)
    )

    for item in feedback_list:
        item["_id"] = str(item["_id"])

    return feedback_list


# ---------------------------
# Update Feedback Status (OPEN — BUT SHOULD BE PROTECTED LATER)
# ---------------------------
@router.put("/feedback/{feedback_id}/status")
async def update_feedback_status(
    feedback_id: str,
    status: str
):

    if status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed: {', '.join(ALLOWED_STATUSES)}",
        )

    try:
        object_id = ObjectId(feedback_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid feedback ID")

    result = feedback_collection.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {"message": "Feedback status updated successfully"}
