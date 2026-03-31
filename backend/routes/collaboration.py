from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field
from database import db

router = APIRouter()

# Collections
collabs_col = db["collaborations"]
messages_col = db["messages"]
users_col = db["users"]

# Pydantic Models
class UserSimple(BaseModel):
    id: str
    username: str
    email: str
    role: str

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    collaboration_id: str
    sender_id: str

class MessageResponse(BaseModel):
    id: str
    collaboration_id: str
    sender_id: str
    sender_name: str
    content: str
    timestamp: datetime

class CollaborationCreate(BaseModel):
    brand_id: str
    influencer_id: str
    initial_message: Optional[str] = None

class CollaborationResponse(BaseModel):
    id: str
    brand_id: str
    influencer_id: str
    brand_name: str
    influencer_name: str
    status: str
    created_at: datetime
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0

# Helper Functions
def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

def get_user_safe(user_id: str) -> dict:
    """Get user safely"""
    user = users_col.find_one({"_id": validate_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_username(user_id: str) -> str:
    """Get username from user ID"""
    user = get_user_safe(user_id)
    return user.get("username", "Unknown")

# Collaboration Endpoints
@router.post("/collaborations", response_model=CollaborationResponse)
async def create_collaboration(collab_data: CollaborationCreate):
    """Create a new collaboration between brand and influencer"""
    # Validate users exist and have correct roles
    brand = get_user_safe(collab_data.brand_id)
    influencer = get_user_safe(collab_data.influencer_id)
    
    if brand.get("role") != "brand":
        raise HTTPException(status_code=400, detail="User must be a brand")
    
    if influencer.get("role") != "influencer":
        raise HTTPException(status_code=400, detail="Target user must be an influencer")
    
    # Check if collaboration already exists
    existing_collab = collabs_col.find_one({
        "brand_id": validate_object_id(collab_data.brand_id),
        "influencer_id": validate_object_id(collab_data.influencer_id),
        "status": "active"
    })
    
    if existing_collab:
        raise HTTPException(status_code=400, detail="Collaboration already exists")
    
    # Create new collaboration
    new_collab = {
        "brand_id": validate_object_id(collab_data.brand_id),
        "influencer_id": validate_object_id(collab_data.influencer_id),
        "brand_name": brand.get("username", "Unknown Brand"),
        "influencer_name": influencer.get("username", "Unknown Influencer"),
        "status": "active",
        "created_at": datetime.utcnow(),
        "last_read": {
            collab_data.brand_id: datetime.utcnow(),
            collab_data.influencer_id: datetime.utcnow()
        }
    }
    
    result = collabs_col.insert_one(new_collab)
    collab_id = str(result.inserted_id)
    
    # Create initial message if provided
    if collab_data.initial_message:
        message_data = {
            "collaboration_id": collab_id,
            "sender_id": validate_object_id(collab_data.brand_id),
            "sender_name": brand.get("username", "Unknown Brand"),
            "content": collab_data.initial_message,
            "timestamp": datetime.utcnow()
        }
        messages_col.insert_one(message_data)
    
    # Return the created collaboration
    created_collab = collabs_col.find_one({"_id": result.inserted_id})
    
    return CollaborationResponse(
        id=str(created_collab["_id"]),
        brand_id=collab_data.brand_id,
        influencer_id=collab_data.influencer_id,
        brand_name=created_collab["brand_name"],
        influencer_name=created_collab["influencer_name"],
        status=created_collab["status"],
        created_at=created_collab["created_at"]
    )

@router.get("/collaborations", response_model=List[CollaborationResponse])
async def get_user_collaborations(user_id: str):
    """Get all collaborations for a user"""
    user = get_user_safe(user_id)
    
    # Find collaborations where user is either brand or influencer
    collaborations = list(collabs_col.find({
        "$or": [
            {"brand_id": validate_object_id(user_id)},
            {"influencer_id": validate_object_id(user_id)}
        ],
        "status": "active"
    }).sort("created_at", -1))
    
    result = []
    for collab in collaborations:
        # Get last message
        last_msg = messages_col.find_one(
            {"collaboration_id": str(collab["_id"])},
            sort=[("timestamp", -1)]
        )
        
        # Calculate unread count
        last_read = collab.get("last_read", {}).get(user_id)
        unread_query = {"collaboration_id": str(collab["_id"])}
        if last_read:
            unread_query["timestamp"] = {"$gt": last_read}
            unread_query["sender_id"] = {"$ne": validate_object_id(user_id)}
        
        unread_count = messages_col.count_documents(unread_query)
        
        # Format last message
        last_message = None
        if last_msg:
            last_message = MessageResponse(
                id=str(last_msg["_id"]),
                collaboration_id=last_msg["collaboration_id"],
                sender_id=str(last_msg["sender_id"]),
                sender_name=last_msg["sender_name"],
                content=last_msg["content"],
                timestamp=last_msg["timestamp"]
            )
        
        result.append(CollaborationResponse(
            id=str(collab["_id"]),
            brand_id=str(collab["brand_id"]),
            influencer_id=str(collab["influencer_id"]),
            brand_name=collab["brand_name"],
            influencer_name=collab["influencer_name"],
            status=collab["status"],
            created_at=collab["created_at"],
            last_message=last_message,
            unread_count=unread_count
        ))
    
    return result

@router.get("/collaborations/{collab_id}", response_model=CollaborationResponse)
async def get_collaboration(collab_id: str, user_id: str):
    """Get specific collaboration and mark as read"""
    collab = collabs_col.find_one({"_id": validate_object_id(collab_id)})
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    
    # Verify user has access to this collaboration
    user_ids = [str(collab["brand_id"]), str(collab["influencer_id"])]
    if user_id not in user_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update last read timestamp
    collabs_col.update_one(
        {"_id": validate_object_id(collab_id)},
        {"$set": {f"last_read.{user_id}": datetime.utcnow()}}
    )
    
    # Get last message
    last_msg = messages_col.find_one(
        {"collaboration_id": collab_id},
        sort=[("timestamp", -1)]
    )
    
    last_message = None
    if last_msg:
        last_message = MessageResponse(
            id=str(last_msg["_id"]),
            collaboration_id=last_msg["collaboration_id"],
            sender_id=str(last_msg["sender_id"]),
            sender_name=last_msg["sender_name"],
            content=last_msg["content"],
            timestamp=last_msg["timestamp"]
        )
    
    return CollaborationResponse(
        id=str(collab["_id"]),
        brand_id=str(collab["brand_id"]),
        influencer_id=str(collab["influencer_id"]),
        brand_name=collab["brand_name"],
        influencer_name=collab["influencer_name"],
        status=collab["status"],
        created_at=collab["created_at"],
        last_message=last_message,
        unread_count=0  # Will be marked as read
    )

# Message Endpoints
@router.post("/messages", response_model=MessageResponse)
async def send_message(message_data: MessageCreate):
    """Send a message in a collaboration"""
    # Validate collaboration exists and user has access
    collab = collabs_col.find_one({"_id": validate_object_id(message_data.collaboration_id)})
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    
    user_ids = [str(collab["brand_id"]), str(collab["influencer_id"])]
    if message_data.sender_id not in user_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create message
    sender_name = get_username(message_data.sender_id)
    
    new_message = {
        "collaboration_id": message_data.collaboration_id,
        "sender_id": validate_object_id(message_data.sender_id),
        "sender_name": sender_name,
        "content": message_data.content,
        "timestamp": datetime.utcnow()
    }
    
    result = messages_col.insert_one(new_message)
    new_message["_id"] = result.inserted_id
    
    return MessageResponse(
        id=str(new_message["_id"]),
        collaboration_id=new_message["collaboration_id"],
        sender_id=message_data.sender_id,
        sender_name=new_message["sender_name"],
        content=new_message["content"],
        timestamp=new_message["timestamp"]
    )

@router.get("/collaborations/{collab_id}/messages", response_model=List[MessageResponse])
async def get_messages(collab_id: str, user_id: str, limit: int = 50, skip: int = 0):
    """Get messages for a collaboration"""
    collab = collabs_col.find_one({"_id": validate_object_id(collab_id)})
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    
    # Verify access
    user_ids = [str(collab["brand_id"]), str(collab["influencer_id"])]
    if user_id not in user_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = list(
        messages_col.find({"collaboration_id": collab_id})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    
    # Reverse to get chronological order
    messages.reverse()
    
    return [
        MessageResponse(
            id=str(msg["_id"]),
            collaboration_id=msg["collaboration_id"],
            sender_id=str(msg["sender_id"]),
            sender_name=msg["sender_name"],
            content=msg["content"],
            timestamp=msg["timestamp"]
        )
        for msg in messages
    ]

# User Endpoints
@router.get("/users/influencers", response_model=List[UserSimple])
async def get_influencers(exclude_user: Optional[str] = None):
    """Get all influencers"""
    query = {"role": "influencer"}
    if exclude_user:
        query["_id"] = {"$ne": validate_object_id(exclude_user)}
    
    users = list(users_col.find(query))
    
    return [
        UserSimple(
            id=str(user["_id"]),
            username=user.get("username", "Unknown"),
            email=user.get("email", ""),
            role=user.get("role", "influencer")
        )
        for user in users
    ]

@router.get("/users/brands", response_model=List[UserSimple])
async def get_brands(exclude_user: Optional[str] = None):
    """Get all brands"""
    query = {"role": "brand"}
    if exclude_user:
        query["_id"] = {"$ne": validate_object_id(exclude_user)}
    
    users = list(users_col.find(query))
    
    return [
        UserSimple(
            id=str(user["_id"]),
            username=user.get("username", "Unknown"),
            email=user.get("email", ""),
            role=user.get("role", "brand")
        )
        for user in users
    ]