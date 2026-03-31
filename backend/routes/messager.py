from fastapi import APIRouter, HTTPException, Depends, status,Query, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from database import db
from pydantic import BaseModel, Field, validator
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Database collections
messages_collection = db["messages"]
conversations_collection = db["conversations"]
users_collection = db["users"]

# Import notification services
from routes.brandnotification import (
    # brand_notification_service,
    trigger_new_message_notification,
    trigger_conversation_started_notification
)

from routes.influencernotification import (
    # influencer_notification_service,
    trigger_influencer_new_message_notification,
    trigger_influencer_conversation_started_notification
)

# ==================== MODELS ====================

# In your messager.py, update the MessageCreate model:
from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional, Dict, Any, List, Union

class MessageCreate(BaseModel):
    """Model for creating a new message"""
    conversation_id: Optional[str] = Field(None, description="ID of the conversation")
    receiver_id: str = Field(..., description="ID of the message receiver")
    content: str = Field("", min_length=0, max_length=5000, description="Message content")
    message_type: str = Field(default="text", description="Type of message (text, image, file)")
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None  # Add this field
    attachment_name: Optional[str] = None  # Add this field
    attachment_size: Optional[int] = None  # Add this field
    metadata: Optional[Dict[str, Any]] = None

    @validator('message_type')
    def validate_message_type(cls, v):
        allowed_types = ['text', 'image', 'file', 'video', 'audio']
        if v not in allowed_types:
            raise ValueError(f'Message type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('attachment_url')
    def validate_attachment_url(cls, v):
        if v is not None and v.strip() == "":
            return None
        return v
    
    # @validator('content')
    # def validate_content(cls, v, values):
    #     # Content can be empty if there's an attachment
    #     if not v and not values.get('attachment_url'):
    #         raise ValueError('Message must have either content or attachment')
    #     return v
    
    class Config:
        # This makes the model more flexible with extra fields
        extra = 'allow'

class MessageUpdate(BaseModel):
    """Model for updating a message"""
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    is_read: Optional[bool] = None

class ConversationFilter(BaseModel):
    """Model for filtering conversations"""
    status: Optional[str] = None
    has_unread: Optional[bool] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    
# ==================== GROUP MODELS ====================

class GroupCreate(BaseModel):
    """Model for creating a new group"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    participant_ids: List[str] = Field(..., min_items=2, description="List of user IDs to add to group")
    avatar_url: Optional[str] = None
    is_public: bool = Field(default=False)
    metadata: Optional[Dict[str, Any]] = None

class GroupUpdate(BaseModel):
    """Model for updating a group"""
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    is_public: Optional[bool] = None

class GroupMessageCreate(BaseModel):
    """Model for creating a group message"""
    group_id: str = Field(..., description="ID of the group")
    content: str = Field("", min_length=0, max_length=5000)
    message_type: str = Field(default="text")
    attachment_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# ==================== DEPENDENCY INJECTIONS ====================

async def get_current_user_from_token(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    from auth.utils import decode_access_token  # Import from your existing utils
    
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
    
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "profile_picture": user.get("profile_picture")
    }

async def validate_user_access(user_id: str, current_user: Dict):
    """Validate if user has access to the resource"""
    if user_id != current_user["id"]:
        # Check if it's an admin or has special permissions
        if current_user["role"] not in ["admin", "moderator"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this resource"
            )

# ==================== MESSAGE SERVICE ====================

class MessageService:
    
    @staticmethod
    async def create_message(
        sender_id: str,
        receiver_id: str,
        content: str,
        message_type: str = "text",
        conversation_id: Optional[str] = None,
        attachment_url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create a new message"""
        try:
            # Validate users exist
            sender = users_collection.find_one({"_id": ObjectId(sender_id)})
            receiver = users_collection.find_one({"_id": ObjectId(receiver_id)})
            
            if not sender or not receiver:
                raise ValueError("Sender or receiver not found")
            
            current_time = datetime.utcnow()
            
            # Get or create conversation
            if conversation_id:
                # Validate conversation exists and user is part of it
                conversation = conversations_collection.find_one({
                    "_id": ObjectId(conversation_id),
                    "participants": {"$all": [sender_id, receiver_id]}
                })
                if not conversation:
                    raise ValueError("Invalid conversation or not authorized")
            else:
                # Create new conversation
                conversation = await MessageService._create_conversation(sender_id, receiver_id)
                conversation_id = str(conversation["_id"])
            
            # Prepare metadata
            message_metadata = metadata or {}
            if attachment_url:
                # Ensure attachment_url is properly stored
                message_metadata.update({
                    "attachment_url": attachment_url,
                    "has_attachment": True
                })
            
            # Create message document
            message_data = {
                "conversation_id": ObjectId(conversation_id),
                "sender_id": ObjectId(sender_id),
                "receiver_id": ObjectId(receiver_id),
                "content": content or "",  # Allow empty content for attachments
                "message_type": message_type,
                "attachment_url": attachment_url,
                "metadata": message_metadata,
                "is_read": False,
                "is_delivered": False,
                "is_edited": False,
                "created_at": current_time,
                "updated_at": current_time
            }
            
            # Insert message
            result = messages_collection.insert_one(message_data)
            message_id = str(result.inserted_id)
            message_data["_id"] = result.inserted_id
            
            # Update conversation last message and timestamp
            conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {
                    "$set": {
                        "last_message": {
                            "message_id": message_id,
                            "content": content[:100] if content else "[Attachment]",
                            "sender_id": sender_id,
                            "timestamp": current_time,
                            "has_attachment": bool(attachment_url)
                        },
                        "updated_at": current_time,
                        "has_unread": True
                    },
                    "$inc": {"message_count": 1}
                }
            )
            
            # Mark sender's copy as delivered
            await MessageService._mark_message_delivered(message_id, sender_id)
            # await MessageService._mark_message_delivered(message_id, receiver_id)
            
            logger.info(f"✅ Message created: {message_id} in conversation: {conversation_id}")
            
            # Prepare response
            response_message = {
                "id": message_id,
                "conversation_id": conversation_id,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "content": content,
                "message_type": message_type,
                "attachment_url": attachment_url,
                "metadata": message_metadata,
                "is_read": False,
                "is_delivered": True,
                "is_edited": False,
                "created_at": current_time,
                "updated_at": current_time,
                "sender": {
                    "id": sender_id,
                    "username": sender["username"],
                    "profile_picture": sender.get("profile_picture")
                },
                "receiver": {
                    "id": receiver_id,
                    "username": receiver["username"],
                    "profile_picture": receiver.get("profile_picture")
                }
            }
            
            return response_message
            
        except InvalidId:
            raise ValueError("Invalid user ID format")
        except Exception as e:
            logger.error(f"❌ Error creating message: {str(e)}")
            raise
    
    @staticmethod
    async def _create_conversation(sender_id: str, receiver_id: str) -> Dict:
        """Create a new conversation between two users"""
        try:
            # Check if conversation already exists
            existing_conversation = conversations_collection.find_one({
                "participants": {"$all": [sender_id, receiver_id]},
                "type": "direct"
            })
            
            if existing_conversation:
                return existing_conversation
            
            # Get user details for conversation title
            sender = users_collection.find_one({"_id": ObjectId(sender_id)})
            receiver = users_collection.find_one({"_id": ObjectId(receiver_id)})
            
            current_time = datetime.utcnow()
            conversation_data = {
                "type": "direct",
                "participants": [sender_id, receiver_id],
                "participant_details": {
                    sender_id: {
                        "username": sender["username"],
                        "profile_picture": sender.get("profile_picture"),
                        "last_read": None,
                        "is_muted": False,
                        "is_archived": False
                    },
                    receiver_id: {
                        "username": receiver["username"],
                        "profile_picture": receiver.get("profile_picture"),
                        "last_read": None,
                        "is_muted": False,
                        "is_archived": False
                    }
                },
                "title": f"{sender['username']} & {receiver['username']}",
                "message_count": 0,
                "has_unread": False,
                "last_message": None,
                "created_at": current_time,
                "updated_at": current_time,
                "status": "active"
            }
            
            result = conversations_collection.insert_one(conversation_data)
            conversation_data["_id"] = result.inserted_id
            
            logger.info(f"✅ Conversation created: {result.inserted_id}")
            return conversation_data
            
        except Exception as e:
            logger.error(f"❌ Error creating conversation: {str(e)}")
            raise
    
    @staticmethod
    async def get_conversation_messages(
        conversation_id: str,
        current_user_id: str,
        limit: int = 50,
        offset: int = 0,
        before: Optional[datetime] = None
    ) -> Dict:
        """Get messages from a conversation"""
        try:
            # Validate conversation access
            conversation = conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "participants": current_user_id
            })
            
            if not conversation:
                raise ValueError("Conversation not found or access denied")
            
            # Build query
            query = {"conversation_id": ObjectId(conversation_id)}
            if before:
                query["created_at"] = {"$lt": before}
            
            # Get messages with pagination
            messages = list(messages_collection.find(query)
                .sort("created_at", -1)
                .skip(offset)
                .limit(limit))
            
            # Mark messages as read for current user
            await MessageService._mark_conversation_read(conversation_id, current_user_id)
            
            # Format response
            formatted_messages = []
            for msg in messages:
                sender = users_collection.find_one({"_id": msg["sender_id"]})
                receiver = users_collection.find_one({"_id": msg["receiver_id"]})
                
                formatted_messages.append({
                    "id": str(msg["_id"]),
                    "content": msg["content"],
                    "message_type": msg["message_type"],
                    "attachment_url": msg.get("attachment_url"),
                    "sender": {
                        "id": str(msg["sender_id"]),
                        "username": sender["username"] if sender else "Unknown",
                        "profile_picture": sender.get("profile_picture") if sender else None
                    },
                    "receiver": {
                        "id": str(msg["receiver_id"]),
                        "username": receiver["username"] if receiver else "Unknown",
                        "profile_picture": receiver.get("profile_picture") if receiver else None
                    },
                    "is_read": msg.get("is_read", False),
                    "is_delivered": msg.get("is_delivered", False),
                    "is_edited": msg.get("is_edited", False),
                    "created_at": msg["created_at"],
                    "updated_at": msg.get("updated_at")
                })
            
            # Get total count for pagination
            total_messages = messages_collection.count_documents(
                {"conversation_id": ObjectId(conversation_id)}
            )
            
            return {
                "conversation_id": conversation_id,
                "messages": formatted_messages,
                "pagination": {
                    "total": total_messages,
                    "limit": limit,
                    "offset": offset,
                    "has_more": total_messages > (offset + limit)
                }
            }
            
        except InvalidId:
            raise ValueError("Invalid conversation ID")
        except Exception as e:
            logger.error(f"❌ Error getting messages: {str(e)}")
            raise
    
    @staticmethod
    async def get_user_conversations(
        user_id: str,
        status: Optional[str] = None,
        has_unread: Optional[bool] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """Get all conversations for a user"""
        try:
            # Build query
            query = {"participants": user_id}
            
            if status:
                query["status"] = status
            
            if has_unread is not None:
                query["has_unread"] = has_unread
            
            # Get conversations
            conversations = list(conversations_collection.find(query)
                .sort("updated_at", -1)
                .skip(offset)
                .limit(limit))
            
            # Format response
            formatted_conversations = []
            for conv in conversations:
                # Get other participant details
                other_participant_id = next(
                    pid for pid in conv["participants"] if pid != user_id
                )
                
                other_user = users_collection.find_one(
                    {"_id": ObjectId(other_participant_id)}
                )
                
                # Get unread count
                unread_count = messages_collection.count_documents({
                    "conversation_id": conv["_id"],
                    "receiver_id": ObjectId(user_id),
                    "is_read": False
                })
                
                formatted_conversations.append({
                    "id": str(conv["_id"]),
                    "title": conv.get("title"),
                    "type": conv.get("type", "direct"),
                    "other_participant": {
                        "id": other_participant_id,
                        "username": other_user["username"] if other_user else "Unknown",
                        "profile_picture": other_user.get("profile_picture") if other_user else None,
                        "role": other_user.get("role") if other_user else None
                    },
                    "last_message": conv.get("last_message"),
                    "unread_count": unread_count,
                    "message_count": conv.get("message_count", 0),
                    "updated_at": conv["updated_at"],
                    "status": conv.get("status", "active"),
                    "is_muted": conv["participant_details"].get(user_id, {}).get("is_muted", False),
                    "is_archived": conv["participant_details"].get(user_id, {}).get("is_archived", False)
                })
            
            # Get total count
            total_conversations = conversations_collection.count_documents(query)
            
            return {
                "conversations": formatted_conversations,
                "pagination": {
                    "total": total_conversations,
                    "limit": limit,
                    "offset": offset,
                    "has_more": total_conversations > (offset + limit)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting conversations: {str(e)}")
            raise
    
    @staticmethod
    async def update_message(
        message_id: str,
        user_id: str,
        content: Optional[str] = None,
        is_read: Optional[bool] = None
    ) -> Dict:
        """Update a message"""
        try:
            # Find message and validate ownership
            message = messages_collection.find_one({"_id": ObjectId(message_id)})
            if not message:
                raise ValueError("Message not found")
            
            # Check permissions
            if str(message["sender_id"]) != user_id:
                raise ValueError("Not authorized to update this message")
            
            update_data = {"updated_at": datetime.utcnow()}
            if content is not None:
                update_data["content"] = content
                update_data["is_edited"] = True
            
            if is_read is not None:
                update_data["is_read"] = is_read
            
            # Update message
            messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": update_data}
            )
            
            # Get updated message
            updated_message = messages_collection.find_one({"_id": ObjectId(message_id)})
            
            logger.info(f"✅ Message updated: {message_id}")
            
            return {
                "id": str(updated_message["_id"]),
                "content": updated_message["content"],
                "is_read": updated_message.get("is_read", False),
                "is_edited": updated_message.get("is_edited", False),
                "updated_at": updated_message.get("updated_at")
            }
            
        except InvalidId:
            raise ValueError("Invalid message ID")
        except Exception as e:
            logger.error(f"❌ Error updating message: {str(e)}")
            raise
    
    @staticmethod
    async def delete_message(message_id: str, user_id: str) -> bool:
        """Delete a message (soft delete)"""
        try:
            message = messages_collection.find_one({"_id": ObjectId(message_id)})
            if not message:
                raise ValueError("Message not found")
            
            # Check permissions
            if str(message["sender_id"]) != user_id:
                raise ValueError("Not authorized to delete this message")
            
            # Soft delete by marking as deleted
            messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {
                    "is_deleted": True,
                    "deleted_at": datetime.utcnow(),
                    "deleted_by": user_id,
                    "content": "[Message deleted]",
                    "updated_at": datetime.utcnow()
                }}
            )
            
            logger.info(f"✅ Message deleted: {message_id}")
            return True
            
        except InvalidId:
            raise ValueError("Invalid message ID")
        except Exception as e:
            logger.error(f"❌ Error deleting message: {str(e)}")
            raise
    
    @staticmethod
    async def _mark_message_delivered(message_id: str, user_id: str):
        """Mark message as delivered to user"""
        try:
            messages_collection.update_one(
                {
                    "_id": ObjectId(message_id),
                    "receiver_id": ObjectId(user_id)
                },
                {"$set": {"is_delivered": True}}
            )
        except Exception as e:
            logger.error(f"❌ Error marking message delivered: {str(e)}")
    
    @staticmethod
    async def _mark_conversation_read(conversation_id: str, user_id: str):
        """Mark all messages in conversation as read for user"""
        try:
            # Mark messages as read
            messages_collection.update_many(
                {
                    "conversation_id": ObjectId(conversation_id),
                    "receiver_id": ObjectId(user_id),
                    "is_read": False
                },
                {"$set": {"is_read": True}}
            )
            
            # Update conversation unread status
            conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"has_unread": False}}
            )
            
        except Exception as e:
            logger.error(f"❌ Error marking conversation read: {str(e)}")
    
    @staticmethod
    async def update_conversation_settings(
        conversation_id: str,
        user_id: str,
        is_muted: Optional[bool] = None,
        is_archived: Optional[bool] = None
    ) -> bool:
        """Update user's conversation settings"""
        try:
            update_fields = {}
            if is_muted is not None:
                update_fields[f"participant_details.{user_id}.is_muted"] = is_muted
            
            if is_archived is not None:
                update_fields[f"participant_details.{user_id}.is_archived"] = is_archived
            
            if update_fields:
                conversations_collection.update_one(
                    {"_id": ObjectId(conversation_id)},
                    {"$set": update_fields}
                )
                
                logger.info(f"✅ Conversation settings updated for {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error updating conversation settings: {str(e)}")
            raise
        
# ==================== GROUP SERVICE ====================

class GroupService:
    
    @staticmethod
    async def create_group(
        creator_id: str,
        name: str,
        participant_ids: List[str],
        description: Optional[str] = None,
        avatar_url: Optional[str] = None,
        is_public: bool = False
    ) -> Dict:
        """Create a new group"""
        try:
            # Ensure creator is included in participants
            all_participants = list(set([creator_id] + participant_ids))
            
            # Validate all participants exist
            participants = []
            for user_id in all_participants:
                user = users_collection.find_one({"_id": ObjectId(user_id)})
                if not user:
                    raise ValueError(f"User {user_id} not found")
                participants.append({
                    "user_id": user_id,
                    "username": user["username"],
                    "role": user.get("role"),
                    "profile_picture": user.get("profile_picture"),
                    "joined_at": datetime.utcnow(),
                    "is_admin": user_id == creator_id,
                    "is_muted": False
                })
            
            current_time = datetime.utcnow()
            
            # Create group document
            group_data = {
                "type": "group",
                "name": name,
                "description": description,
                "avatar_url": avatar_url,
                "creator_id": ObjectId(creator_id),
                "participants": all_participants,
                "participant_details": {p["user_id"]: p for p in participants},
                "admins": [creator_id],
                "is_public": is_public,
                "message_count": 0,
                "last_message": None,
                "has_unread": False,
                "created_at": current_time,
                "updated_at": current_time,
                "status": "active"
            }
            
            result = conversations_collection.insert_one(group_data)
            group_id = str(result.inserted_id)
            
            logger.info(f"✅ Group created: {group_id} by {creator_id}")
            
            # Format response
            return {
                "id": group_id,
                "name": name,
                "description": description,
                "avatar_url": avatar_url,
                "creator_id": creator_id,
                "participants": all_participants,
                "participant_count": len(all_participants),
                "is_public": is_public,
                "created_at": current_time,
                "updated_at": current_time
            }
            
        except Exception as e:
            logger.error(f"❌ Error creating group: {str(e)}")
            raise
    
    @staticmethod
    async def send_group_message(
        sender_id: str,
        group_id: str,
        content: str,
        message_type: str = "text",
        attachment_url: Optional[str] = None
    ) -> Dict:
        """Send a message to a group"""
        try:
            # Validate group exists and user is a member
            group = conversations_collection.find_one({
                "_id": ObjectId(group_id),
                "type": "group",
                "participants": sender_id
            })
            
            if not group:
                raise ValueError("Group not found or user not a member")
            
            sender = users_collection.find_one({"_id": ObjectId(sender_id)})
            if not sender:
                raise ValueError("Sender not found")
            
            current_time = datetime.utcnow()
            
            # Create message document (separate from direct messages)
            # You might want to create a separate collection for group messages
            # or add a type field to differentiate
            message_data = {
                "group_id": ObjectId(group_id),
                "sender_id": ObjectId(sender_id),
                "content": content,
                "message_type": message_type,
                "attachment_url": attachment_url,
                "is_read_by": [],  # Track who has read the message
                "is_delivered_to": [],  # Track delivery status
                "created_at": current_time,
                "updated_at": current_time
            }
            
            result = messages_collection.insert_one(message_data)
            message_id = str(result.inserted_id)
            
            # Update group last message
            conversations_collection.update_one(
                {"_id": ObjectId(group_id)},
                {
                    "$set": {
                        "last_message": {
                            "message_id": message_id,
                            "content": content[:100],
                            "sender_id": sender_id,
                            "timestamp": current_time
                        },
                        "updated_at": current_time,
                        "has_unread": True
                    },
                    "$inc": {"message_count": 1}
                }
            )
            
            # Mark as delivered to sender
            await GroupService._mark_group_message_delivered(message_id, sender_id)
            
            logger.info(f"✅ Group message sent: {message_id} to group: {group_id}")
            
            return {
                "id": message_id,
                "group_id": group_id,
                "sender_id": sender_id,
                "content": content,
                "message_type": message_type,
                "attachment_url": attachment_url,
                "created_at": current_time,
                "sender": {
                    "id": sender_id,
                    "username": sender["username"],
                    "profile_picture": sender.get("profile_picture")
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error sending group message: {str(e)}")
            raise
    
    @staticmethod
    async def get_user_groups(
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """Get all groups for a user"""
        try:
            query = {
                "type": "group",
                "participants": user_id
            }
            
            groups = list(conversations_collection.find(query)
                .sort("updated_at", -1)
                .skip(offset)
                .limit(limit))
            
            formatted_groups = []
            for group in groups:
                # Get unread count for this user
                unread_count = messages_collection.count_documents({
                    "group_id": group["_id"],
                    "sender_id": {"$ne": ObjectId(user_id)},
                    "is_read_by": {"$nin": [user_id]}
                })
                
                formatted_groups.append({
                    "id": str(group["_id"]),
                    "name": group["name"],
                    "description": group.get("description"),
                    "avatar_url": group.get("avatar_url"),
                    "type": "group",
                    "creator_id": str(group["creator_id"]),
                    "participant_count": len(group["participants"]),
                    "last_message": group.get("last_message"),
                    "unread_count": unread_count,
                    "message_count": group.get("message_count", 0),
                    "is_admin": group.get("admins", []).count(user_id) > 0,
                    "is_public": group.get("is_public", False),
                    "updated_at": group["updated_at"],
                    "created_at": group["created_at"]
                })
            
            total_groups = conversations_collection.count_documents(query)
            
            return {
                "groups": formatted_groups,
                "pagination": {
                    "total": total_groups,
                    "limit": limit,
                    "offset": offset,
                    "has_more": total_groups > (offset + limit)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting user groups: {str(e)}")
            raise
    
    @staticmethod
    async def _mark_group_message_delivered(message_id: str, user_id: str):
        """Mark group message as delivered to user"""
        try:
            messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {"$addToSet": {"is_delivered_to": user_id}}
            )
        except Exception as e:
            logger.error(f"❌ Error marking group message delivered: {str(e)}")
            
    
    @staticmethod
    async def _mark_group_messages_read(group_id: str, user_id: str):
        """Mark all group messages as read for user"""
        try:
            messages_collection.update_many(
                {
                    "group_id": ObjectId(group_id),
                    "sender_id": {"$ne": ObjectId(user_id)},
                    "is_read_by": {"$nin": [user_id]}
                },
                {"$addToSet": {"is_read_by": user_id}}
            )
            
            # Update group unread status
            conversations_collection.update_one(
                {"_id": ObjectId(group_id)},
                {"$set": {"has_unread": False}}
            )
            
        except Exception as e:
            logger.error(f"❌ Error marking group messages read: {str(e)}")
    
    @staticmethod
    async def get_group_details(group_id: str, user_id: str):
        """Get detailed group information"""
        try:
            group = conversations_collection.find_one({
                "_id": ObjectId(group_id),
                "type": "group",
                "participants": user_id
            })
            
            if not group:
                raise ValueError("Group not found or not a member")
            
            # Get participants details
            participants_details = []
            for participant_id in group.get("participants", []):
                user = users_collection.find_one({"_id": ObjectId(participant_id)})
                if user:
                    participants_details.append({
                        "id": participant_id,
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture"),
                        "role": user.get("role"),
                        "is_admin": participant_id in group.get("admins", []),
                        "joined_at": group.get("participant_details", {}).get(participant_id, {}).get("joined_at")
                    })
            
            # Get unread count for this user
            unread_count = messages_collection.count_documents({
                "group_id": ObjectId(group_id),
                "sender_id": {"$ne": ObjectId(user_id)},
                "is_read_by": {"$nin": [user_id]}
            })
            
            return {
                "id": str(group["_id"]),
                "name": group["name"],
                "description": group.get("description"),
                "avatar_url": group.get("avatar_url"),
                "creator_id": str(group["creator_id"]),
                "participants": participants_details,
                "participant_count": len(group.get("participants", [])),
                "admins": group.get("admins", []),
                "is_public": group.get("is_public", False),
                "last_message": group.get("last_message"),
                "unread_count": unread_count,
                "message_count": group.get("message_count", 0),
                "created_at": group["created_at"],
                "updated_at": group["updated_at"],
                "is_admin": user_id in group.get("admins", [])
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting group details: {str(e)}")
            raise
        

from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def send_to_group(self, group_id: str, message: dict, exclude_user: str = None):
        """Send message to all members of a group except excluded user"""
        # Get group members
        group = conversations_collection.find_one({"_id": ObjectId(group_id)})
        if not group:
            return
        
        for member_id in group.get("participants", []):
            if exclude_user and member_id == exclude_user:
                continue
            await self.send_personal_message(message, member_id)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "group_message":
                # Handle group message
                group_id = data.get("group_id")
                content = data.get("content")
                
                # Save to database
                message = await GroupService.send_group_message(
                    sender_id=user_id,
                    group_id=group_id,
                    content=content,
                    message_type=data.get("message_type", "text"),
                    attachment_url=data.get("attachment_url")
                )
                
                # Broadcast to group members
                await manager.send_to_group(
                    group_id,
                    {
                        "type": "new_group_message",
                        "group_id": group_id,
                        "message": message,
                        "sender_id": user_id
                    },
                    exclude_user=user_id
                )
                
            elif message_type == "direct_message":
                # Handle direct message (your existing logic)
                pass
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)

# ==================== NOTIFICATION SERVICE ====================

async def trigger_message_notifications(
    message_data: Dict,
    background_tasks: BackgroundTasks
):
    """Trigger notifications for new messages based on user roles"""
    try:
        sender_id = message_data["sender_id"]
        receiver_id = message_data["receiver_id"]
        
        # Get receiver details
        receiver = users_collection.find_one({"_id": ObjectId(receiver_id)})
        if not receiver:
            return
        
        # Get sender details
        sender = users_collection.find_one({"_id": ObjectId(sender_id)})
        
        
        
        # Trigger notifications based on receiver's role
        if receiver.get("role") == "brand":
            background_tasks.add_task(
                trigger_new_message_notification,
                receiver_id,
                sender["username"] if sender else "User",
                message_data["content"][:100],
                str(message_data.get("conversation_id")),
                # background_tasks
            )
        elif receiver.get("role") == "influencer":
            background_tasks.add_task(
                trigger_influencer_new_message_notification,
                receiver_id,
                sender["username"] if sender else "User",
                message_data["content"][:100],
                str(message_data.get("conversation_id")),
                # background_tasks
            )
        
        # Also trigger conversation started notification if first message
        conversation = conversations_collection.find_one({
            "_id": ObjectId(message_data.get("conversation_id"))
        })
        
        if conversation and conversation.get("message_count", 0) <= 1:
            if receiver.get("role") == "brand":
                background_tasks.add_task(
                    trigger_conversation_started_notification,
                    receiver_id,
                    sender["username"] if sender else "User",
                    # background_tasks
                )
            elif receiver.get("role") == "influencer":
                background_tasks.add_task(
                    trigger_influencer_conversation_started_notification,
                    receiver_id,
                    sender["username"] if sender else "User",
                    # background_tasks
                )
                
    except Exception as e:
        logger.error(f"❌ Error triggering message notifications: {str(e)}")

# ==================== API ROUTES ====================

@router.post("/send", status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: Dict = Depends(get_current_user_from_token),
    background_tasks: BackgroundTasks = None
):
    """Send a new message"""
    try:
        user_id = current_user["id"]
        
        # Validate receiver exists
        receiver = users_collection.find_one({"_id": ObjectId(message_data.receiver_id)})
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receiver not found"
            )
        
        # Prevent self-messaging
        if user_id == message_data.receiver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send message to yourself"
            )
        
        # Create message with proper attachment handling
        message = await MessageService.create_message(
            sender_id=user_id,
            receiver_id=message_data.receiver_id,
            content=message_data.content,
            message_type=message_data.message_type,
            conversation_id=message_data.conversation_id,
            attachment_url=message_data.attachment_url,
            metadata={
                **(message_data.metadata or {}),
                "attachment_type": message_data.attachment_type,
                "attachment_name": message_data.attachment_name,
                "attachment_size": message_data.attachment_size
            }
        )
        
        # Trigger notifications
        if background_tasks:
            background_tasks.add_task(
                trigger_message_notifications,
                message,
                background_tasks
            )
        
        logger.info(f"✅ Message sent from {user_id} to {message_data.receiver_id}")
        
        return {
            "message": "Message sent successfully",
            "data": message,
            "conversation_id": message["conversation_id"]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error sending message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message"
        )

@router.get("/conversations")
async def get_conversations(
    status: Optional[str] = None,
    has_unread: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get user's conversations"""
    try:
        user_id = current_user["id"]
        
        conversations = await MessageService.get_user_conversations(
            user_id=user_id,
            status=status,
            has_unread=has_unread,
            limit=limit,
            offset=offset
        )
        
        return {
            "message": "Conversations retrieved successfully",
            "data": conversations
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get conversations"
        )

@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get messages from a conversation with pagination"""
    try:
        user_id = current_user["id"]
        offset = (page - 1) * limit
        
        messages = await MessageService.get_conversation_messages(
            conversation_id=conversation_id,
            current_user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        return {
            "message": "Messages retrieved successfully",
            "data": {
                "messages": messages.get("messages", []),
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": messages.get("total", 0),
                    "has_more": len(messages.get("messages", [])) == limit
                }
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error getting messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get messages"
        )

@router.put("/messages/{message_id}")
async def update_message(
    message_id: str,
    message_update: MessageUpdate,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Update a message"""
    try:
        user_id = current_user["id"]
        
        updated_message = await MessageService.update_message(
            message_id=message_id,
            user_id=user_id,
            content=message_update.content,
            is_read=message_update.is_read
        )
        
        return {
            "message": "Message updated successfully",
            "data": updated_message
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error updating message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update message"
        )

@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Delete a message"""
    try:
        user_id = current_user["id"]
        
        success = await MessageService.delete_message(message_id, user_id)
        
        if success:
            return {"message": "Message deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete message"
            )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error deleting message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete message"
        )

@router.put("/conversations/{conversation_id}/settings")
async def update_conversation_settings(
    conversation_id: str,
    is_muted: Optional[bool] = None,
    is_archived: Optional[bool] = None,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Update conversation settings for current user"""
    try:
        user_id = current_user["id"]
        
        # Validate conversation exists and user is participant
        conversation = conversations_collection.find_one({
            "_id": ObjectId(conversation_id),
            "participants": user_id
        })
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        success = await MessageService.update_conversation_settings(
            conversation_id=conversation_id,
            user_id=user_id,
            is_muted=is_muted,
            is_archived=is_archived
        )
        
        if success:
            return {"message": "Conversation settings updated successfully"}
        else:
            return {"message": "No changes made"}
        
    except Exception as e:
        logger.error(f"❌ Error updating conversation settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update conversation settings"
        )

@router.get("/unread-count")
async def get_unread_count(
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get total unread message count"""
    try:
        user_id = current_user["id"]
        
        # Count unread messages
        unread_count = messages_collection.count_documents({
            "receiver_id": ObjectId(user_id),
            "is_read": False
        })
        
        # Count conversations with unread messages
        conversations_with_unread = conversations_collection.count_documents({
            "participants": user_id,
            "has_unread": True
        })
        
        return {
            "total_unread_messages": unread_count,
            "conversations_with_unread": conversations_with_unread,
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting unread count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get unread count"
        )

@router.get("/search")
async def search_messages(
    query: str,
    conversation_id: Optional[str] = None,
    limit: int = 20,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Search messages by content"""
    try:
        user_id = current_user["id"]
        
        # Build search query
        search_query = {
            "$or": [
                {"content": {"$regex": query, "$options": "i"}},
                {"metadata.tags": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if conversation_id:
            # Search within specific conversation
            search_query["conversation_id"] = ObjectId(conversation_id)
            
            # Verify user has access to this conversation
            conversation = conversations_collection.find_one({
                "_id": ObjectId(conversation_id),
                "participants": user_id
            })
            
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this conversation"
                )
        else:
            # Search across all user's conversations
            user_conversations = conversations_collection.find({
                "participants": user_id
            })
            conversation_ids = [conv["_id"] for conv in user_conversations]
            
            search_query["conversation_id"] = {"$in": conversation_ids}
        
        # Execute search
        messages = list(messages_collection.find(search_query)
            .sort("created_at", -1)
            .limit(limit))
        
        # Format results
        results = []
        for msg in messages:
            sender = users_collection.find_one({"_id": msg["sender_id"]})
            
            results.append({
                "id": str(msg["_id"]),
                "content": msg["content"],
                "conversation_id": str(msg["conversation_id"]),
                "sender": {
                    "id": str(msg["sender_id"]),
                    "username": sender["username"] if sender else "Unknown"
                },
                "created_at": msg["created_at"],
                "relevance_score": 1.0  # Could implement actual scoring
            })
        
        return {
            "query": query,
            "results": results,
            "total_results": len(results)
        }
        
    except Exception as e:
        logger.error(f"❌ Error searching messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search messages"
        )

@router.post("/typing-indicator")
async def send_typing_indicator(
    conversation_id: str,
    is_typing: bool,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Send typing indicator to conversation"""
    try:
        user_id = current_user["id"]
        
        # In a real implementation, you'd use WebSockets or similar
        # This is a simplified version
        return {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "username": current_user["username"],
            "is_typing": is_typing,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"❌ Error sending typing indicator: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send typing indicator"
        )
        
        
@router.put("/conversations/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: str,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """
    Mark all messages in a conversation as read for current user
    """
    try:
        user_id = current_user["id"]

        await MessageService._mark_conversation_read(
            conversation_id=conversation_id,
            user_id=user_id
        )

        return {
            "message": "Conversation marked as read",
            "conversation_id": conversation_id
        }

    except Exception as e:
        logger.error(f"❌ Error marking conversation read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark conversation as read"
        )

@router.get("/unread-count")
async def get_unread_count(
    current_user: Dict = Depends(get_current_user_from_token)
):
    """
    Get total unread messages count for current user
    """
    try:
        user_id = current_user["id"]

        count = messages_collection.count_documents({
            "receiver_id": ObjectId(user_id),
            "is_read": False
        })

        return {
            "total_unread_messages": count
        }

    except Exception as e:
        logger.error(f"❌ Error getting unread count: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get unread messages count"
        )

@router.get("/user/{user_id}/details")
async def get_user_details(
    user_id: str,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get user details with profile information"""
    try:
        uid = ObjectId(user_id)
        user = users_collection.find_one({"_id": uid})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Extract profile information based on role
        profile_info = {}
        if user.get("role") == "brand" and user.get("brand_profile"):
            profile = user["brand_profile"]
            profile_info = {
                "name": profile.get("company_name") or user.get("username"),
                "profile_picture": profile.get("logo"),
                "display_name": profile.get("company_name"),
                "contact_person": profile.get("contact_person_name"),
                "industry": profile.get("industry"),
                "categories": profile.get("categories", []),
                "location": profile.get("location"),
                "role": "brand"
            }
        elif user.get("role") == "influencer" and user.get("influencer_profile"):
            profile = user["influencer_profile"]
            profile_info = {
                "name": profile.get("full_name") or profile.get("nickname") or user.get("username"),
                "profile_picture": profile.get("profile_picture"),
                "display_name": profile.get("nickname") or profile.get("full_name"),
                "niche": profile.get("niche"),
                "categories": profile.get("categories", []),
                "location": profile.get("location"),
                "role": "influencer"
            }
        else:
            # Fallback for users without profile
            profile_info = {
                "name": user.get("username"),
                "profile_picture": user.get("profile_picture"),
                "display_name": user.get("username"),
                "role": user.get("role", "user")
            }
        
        return {
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "role": user.get("role"),
            "profile": profile_info,
            "is_online": False  # You can implement online status tracking
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting user details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user details"
        )
        
# ==================== GROUP API ROUTES ====================

@router.post("/groups/create", status_code=status.HTTP_201_CREATED)
async def create_group(
    group_data: GroupCreate,
    current_user: Dict = Depends(get_current_user_from_token),
    background_tasks: BackgroundTasks = None
):
    """Create a new group"""
    try:
        user_id = current_user["id"]
        
        group = await GroupService.create_group(
            creator_id=user_id,
            name=group_data.name,
            participant_ids=group_data.participant_ids,
            description=group_data.description,
            avatar_url=group_data.avatar_url,
            is_public=group_data.is_public
        )
        
        logger.info(f"✅ Group created: {group['id']}")
        
        return {
            "message": "Group created successfully",
            "data": group
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error creating group: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create group"
        )

@router.post("/groups/{group_id}/message")
async def send_group_message(
    group_id: str,
    message_data: GroupMessageCreate,
    current_user: Dict = Depends(get_current_user_from_token),
    background_tasks: BackgroundTasks = None
):
    """Send a message to a group"""
    try:
        user_id = current_user["id"]
        
        message = await GroupService.send_group_message(
            sender_id=user_id,
            group_id=group_id,
            content=message_data.content,
            message_type=message_data.message_type,
            attachment_url=message_data.attachment_url
        )
        
        # Trigger notifications for group members (except sender)
        if background_tasks:
            background_tasks.add_task(
                trigger_group_message_notifications,
                message,
                background_tasks
            )
        
        logger.info(f"✅ Group message sent to {group_id}")
        
        return {
            "message": "Group message sent successfully",
            "data": message
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error sending group message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send group message"
        )

@router.get("/groups")
async def get_groups(
    limit: int = 20,
    offset: int = 0,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get user's groups"""
    try:
        user_id = current_user["id"]
        
        groups = await GroupService.get_user_groups(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        return {
            "message": "Groups retrieved successfully",
            "data": groups
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting groups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get groups"
        )

@router.get("/groups/{group_id}/messages")
async def get_group_messages(
    group_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get messages from a group"""
    try:
        user_id = current_user["id"]
        offset = (page - 1) * limit
        
        # Verify user is a member of the group
        group = conversations_collection.find_one({
            "_id": ObjectId(group_id),
            "type": "group",
            "participants": user_id
        })
        
        if not group:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this group"
            )
        
        # Get messages
        query = {"group_id": ObjectId(group_id)}
        messages = list(messages_collection.find(query)
            .sort("created_at", -1)
            .skip(offset)
            .limit(limit))
        
        # Mark messages as read for current user
        await GroupService._mark_group_messages_read(group_id, user_id)
        
        formatted_messages = []
        for msg in messages:
            sender = users_collection.find_one({"_id": msg["sender_id"]})
            
            formatted_messages.append({
                "id": str(msg["_id"]),
                "content": msg["content"],
                "message_type": msg["message_type"],
                "attachment_url": msg.get("attachment_url"),
                "sender": {
                    "id": str(msg["sender_id"]),
                    "username": sender["username"] if sender else "Unknown",
                    "profile_picture": sender.get("profile_picture") if sender else None
                },
                "is_read": user_id in msg.get("is_read_by", []),
                "is_delivered": user_id in msg.get("is_delivered_to", []),
                "created_at": msg["created_at"],
                "updated_at": msg.get("updated_at")
            })
        
        total_messages = messages_collection.count_documents(query)
        
        return {
            "message": "Group messages retrieved successfully",
            "data": {
                "group_id": group_id,
                "messages": formatted_messages,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total_messages,
                    "has_more": len(formatted_messages) == limit
                }
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting group messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get group messages"
        )

async def trigger_group_message_notifications(
    message_data: Dict,
    background_tasks: BackgroundTasks
):
    """Trigger notifications for group messages"""
    try:
        group_id = message_data["group_id"]
        sender_id = message_data["sender_id"]
        
        # Get group members (excluding sender)
        group = conversations_collection.find_one({"_id": ObjectId(group_id)})
        if not group:
            return
        
        sender = users_collection.find_one({"_id": ObjectId(sender_id)})
        if not sender:
            return
        
        # Trigger notifications for each group member (except sender)
        for member_id in group["participants"]:
            if member_id != sender_id:
                receiver = users_collection.find_one({"_id": ObjectId(member_id)})
                if not receiver:
                    continue
                
                if receiver.get("role") == "brand":
                    background_tasks.add_task(
                        trigger_new_message_notification,
                        member_id,
                        sender["username"],
                        f"[Group: {group['name']}] {message_data['content'][:50]}...",
                        group_id,
                    )
                elif receiver.get("role") == "influencer":
                    background_tasks.add_task(
                        trigger_influencer_new_message_notification,
                        member_id,
                        sender["username"],
                        f"[Group: {group['name']}] {message_data['content'][:50]}...",
                        group_id,
                    )
                    
    except Exception as e:
        logger.error(f"❌ Error triggering group notifications: {str(e)}")
        
@router.get("/groups/{group_id}")
async def get_group_details(
    group_id: str,
    current_user: Dict = Depends(get_current_user_from_token)
):
    """Get detailed group information"""
    try:
        user_id = current_user["id"]
        
        group_details = await GroupService.get_group_details(group_id, user_id)
        
        return {
            "message": "Group details retrieved successfully",
            "data": group_details
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error getting group details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get group details"
        )