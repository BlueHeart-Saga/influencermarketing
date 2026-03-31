# chatapp.py - Enhanced Real-Time Chat Application
from fastapi import APIRouter, HTTPException, Depends, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Query, BackgroundTasks, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
from database import db, storage as storage_provider
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Union, Tuple
import json
import asyncio
import logging
from enum import Enum
import uuid
from dataclasses import dataclass, asdict
from contextlib import asynccontextmanager
from redis import asyncio as aioredis

from auth.utils import decode_access_token, get_subscription_benefits, get_current_user
# import gridfs
# from gridfs import GridFS
import urllib.parse
from bson.errors import InvalidId
import os
from PIL import Image
import io
from pydantic import BaseModel, Field, validator
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorCollection
import cachetools
from cachetools import TTLCache
import time
from typing_extensions import Literal
import secrets
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Collections
users_collection = db["users"]
conversations_collection = db["conversations"]
messages_collection = db["messages"]
message_reactions_collection = db["message_reactions"]
chat_media_collection = db["chat_media"]

# Initialize GridFS (Deprecated)
# fs = GridFS(db)
fs = storage_provider

# Redis connection
redis_client = None
try:
    redis_client = aioredis.from_url(
        "redis://localhost:6379",
        encoding="utf-8",
        decode_responses=True,
        max_connections=20
    )
    logger.info("Redis connection established")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}. Using in-memory fallback.")
    redis_client = None

# In-memory caches for fallback/performance
user_presence_cache = TTLCache(maxsize=1000, ttl=30)
conversation_cache = TTLCache(maxsize=500, ttl=60)
user_profile_cache = TTLCache(maxsize=1000, ttl=300)

# Message Types
class MessageType(str, Enum):
    TEXT = "text"
    MEDIA = "media"
    SYSTEM = "system"
    TYPING = "typing"
    READ_RECEIPT = "read_receipt"
    REACTION = "reaction"
    FORWARD = "forward"
    DELETE = "delete"
    CALL = "call"
    POLL = "poll"
    LOCATION = "location"
    CONTACT = "contact"

# Message Status
class MessageStatus(str, Enum):
    SENDING = "sending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    PENDING = "pending"

class ConversationType(str, Enum):
    DIRECT = "direct"
    GROUP = "group"
    BROADCAST = "broadcast"

# Pydantic Models for validation
class ConversationCreateRequest(BaseModel):
    brand_id: str
    influencer_id: str
    
    @validator('brand_id', 'influencer_id')
    def validate_object_id(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid ObjectId format')
        return v

class MessageCreateRequest(BaseModel):
    conversation_id: str
    content: str = Field(..., min_length=1, max_length=10000)
    message_type: MessageType = MessageType.TEXT
    media_info: Optional[Dict] = None
    reply_to: Optional[str] = None
    forward_from: Optional[str] = None
    
    @validator('conversation_id', 'reply_to', 'forward_from')
    def validate_object_id(cls, v):
        if v and not ObjectId.is_valid(v):
            raise ValueError('Invalid ObjectId format')
        return v

class MediaUploadRequest(BaseModel):
    caption: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = None

class ReactionRequest(BaseModel):
    reaction: str = Field(..., min_length=1, max_length=10)

class ConversationSettings(BaseModel):
    muted: bool = False
    archived: bool = False
    pinned: bool = False
    notification_sound: bool = True
    notification_preview: bool = True

# Enhanced Subscription Plan Chat Limits with tier-based pricing
CHAT_LIMITS = {
    "free": {
        "max_conversations": 1,
        "max_message_length": 500,
        "daily_message_limit": 50,
        "max_media_size": 2 * 1024 * 1024,
        "allowed_media_types": ["image/jpeg", "image/png"],
        "can_initiate_chat": True,
        "can_send_media": True,
        "max_media_per_day": 5,
        "can_edit_messages": False,
        "can_delete_messages": False,
        "message_history_days": 7,
        "max_participants": 2,
        "can_create_groups": False,
        "can_make_calls": False,
        "storage_limit": 50 * 1024 * 1024,
        "priority_support": False
    },
    "trial": {
        "max_conversations": 3,
        "max_message_length": 1000,
        "daily_message_limit": 100,
        "max_media_size": 5 * 1024 * 1024,
        "allowed_media_types": ["image/jpeg", "image/png", "image/gif"],
        "can_initiate_chat": True,
        "can_send_media": True,
        "max_media_per_day": 10,
        "can_edit_messages": True,
        "can_delete_messages": True,
        "message_history_days": 30,
        "max_participants": 2,
        "can_create_groups": False,
        "can_make_calls": False,
        "storage_limit": 100 * 1024 * 1024,
        "priority_support": False
    },
    "starter": {
        "max_conversations": 10,
        "max_message_length": 2000,
        "daily_message_limit": 500,
        "max_media_size": 10 * 1024 * 1024,
        "allowed_media_types": ["image/jpeg", "image/png", "image/gif", "video/mp4", "application/pdf"],
        "can_initiate_chat": True,
        "can_send_media": True,
        "max_media_per_day": 50,
        "can_edit_messages": True,
        "can_delete_messages": True,
        "message_history_days": 90,
        "max_participants": 5,
        "can_create_groups": True,
        "can_make_calls": True,
        "storage_limit": 1 * 1024 * 1024 * 1024,
        "priority_support": False
    },
    "pro": {
        "max_conversations": 50,
        "max_message_length": 5000,
        "daily_message_limit": 2000,
        "max_media_size": 50 * 1024 * 1024,
        "allowed_media_types": ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/ogg", "audio/mpeg", "application/pdf", "application/msword"],
        "can_initiate_chat": True,
        "can_send_media": True,
        "max_media_per_day": 200,
        "can_edit_messages": True,
        "can_delete_messages": True,
        "message_history_days": 365,
        "max_participants": 20,
        "can_create_groups": True,
        "can_make_calls": True,
        "storage_limit": 5 * 1024 * 1024 * 1024,
        "priority_support": True
    },
    "enterprise": {
        "max_conversations": None,
        "max_message_length": 10000,
        "daily_message_limit": None,
        "max_media_size": 100 * 1024 * 1024,
        "allowed_media_types": ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "video/mp4", "video/ogg", "video/webm", "audio/mpeg", "audio/wav", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"],
        "can_initiate_chat": True,
        "can_send_media": True,
        "max_media_per_day": None,
        "can_edit_messages": True,
        "can_delete_messages": True,
        "message_history_days": 365 * 2,
        "max_participants": 100,
        "can_create_groups": True,
        "can_make_calls": True,
        "storage_limit": 50 * 1024 * 1024 * 1024,
        "priority_support": True,
        "custom_branding": True,
        "api_access": True
    }
}

# Data Models
@dataclass
class UserPresence:
    user_id: str
    is_online: bool
    last_seen: datetime
    device_info: Optional[Dict] = None
    connection_id: Optional[str] = None
    status: str = "available"  # available, busy, away, invisible
    custom_status: Optional[str] = None
    
    def to_dict(self):
        return asdict(self)

@dataclass
class ConnectionInfo:
    websocket: WebSocket
    user_id: str
    connection_time: datetime
    last_activity: datetime
    device_info: Dict
    connection_id: str
    client_type: str = "web"  # web, mobile, desktop

# Enhanced JSON Encoder
class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, Enum):
            return obj.value
        if hasattr(obj, '__dataclass_fields__'):
            return asdict(obj)
        if hasattr(obj, 'dict'):
            return obj.dict()
        return super().default(obj)

# Connection Manager with Redis fallback
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, ConnectionInfo]] = {}
        self.redis_client = redis_client
        self.connection_expiry = 300  # 5 minutes
        
    async def add_connection(self, user_id: str, connection_id: str, device_info: Dict, websocket: WebSocket) -> str:
        """Add a new connection with enhanced tracking"""
        connection_info = ConnectionInfo(
            websocket=websocket,
            user_id=user_id,
            connection_time=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            device_info=device_info,
            connection_id=connection_id,
            client_type=device_info.get("client_type", "web")
        )
        
        # Store in memory
        if user_id not in self.active_connections:
            self.active_connections[user_id] = {}
        self.active_connections[user_id][connection_id] = connection_info
        
        # Store in Redis if available
        if self.redis_client:
            try:
                await self._store_in_redis(user_id, connection_id, device_info)
                # Update presence
                await self._update_presence_redis(user_id, True, device_info)
            except Exception as e:
                logger.error(f"Redis store error: {e}")
        
        logger.info(f"User {user_id} connected with connection {connection_id} from {device_info.get('client_type', 'web')}")
        return connection_id
    
    async def _store_in_redis(self, user_id: str, connection_id: str, device_info: Dict):
        """Store connection details in Redis"""
        connection_key = f"chat:connection:{user_id}:{connection_id}"
        data = {
            "user_id": user_id,
            "connection_id": connection_id,
            "device_info": json.dumps(device_info),
            "connected_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        await self.redis_client.hmset(connection_key, data)
        await self.redis_client.expire(connection_key, self.connection_expiry)
        
        # Add to online set
        await self.redis_client.sadd("chat:online_users", user_id)
    
    async def _update_presence_redis(self, user_id: str, is_online: bool, device_info: Dict):
        """Update presence in Redis"""
        presence_key = f"chat:presence:{user_id}"
        data = {
            "is_online": "true" if is_online else "false",
            "last_seen": datetime.utcnow().isoformat(),
            "device_info": json.dumps(device_info),
            "updated_at": datetime.utcnow().isoformat()
        }
        await self.redis_client.hmset(presence_key, data)
        await self.redis_client.expire(presence_key, self.connection_expiry + 60)  # Longer expiry
    
    async def disconnect(self, user_id: str, connection_id: str):
        """Disconnect user connection"""
        if user_id in self.active_connections and connection_id in self.active_connections[user_id]:
            del self.active_connections[user_id][connection_id]
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        # Remove from Redis if available
        if self.redis_client:
            try:
                await self._remove_from_redis(user_id, connection_id)
            except Exception as e:
                logger.error(f"Redis remove error: {e}")
        
        logger.info(f"User {user_id} disconnected connection {connection_id}")
    
    async def _remove_from_redis(self, user_id: str, connection_id: str):
        """Remove connection from Redis"""
        connection_key = f"chat:connection:{user_id}:{connection_id}"
        await self.redis_client.delete(connection_key)
        
        # Check if user has other connections
        connection_pattern = f"chat:connection:{user_id}:*"
        connections = await self.redis_client.keys(connection_pattern)
        
        if not connections:
            # No more connections, mark as offline
            await self.redis_client.srem("chat:online_users", user_id)
            presence_key = f"chat:presence:{user_id}"
            await self.redis_client.hset(presence_key, "is_online", "false")
    
    async def send_personal(self, user_id: str, message: Dict, exclude_connection: Optional[str] = None):
        """Send message to all connections of a user with delivery tracking"""
        if user_id in self.active_connections:
            for connection_id, connection_info in self.active_connections[user_id].items():
                if exclude_connection and connection_id == exclude_connection:
                    continue
                
                try:
                    await connection_info.websocket.send_json(message)
                    await self.update_activity(user_id, connection_id)
                except Exception as e:
                    logger.error(f"Failed to send to {user_id}:{connection_id}: {e}")
                    await self.disconnect(user_id, connection_id)
    
    async def broadcast_to_contacts(self, user_id: str, message: Dict, exclude_connection: Optional[str] = None):
        """Send message to all contacts of a user with batching"""
        try:
            # Get user's conversations
            conversations = conversations_collection.find({
                "$or": [
                    {"brand_id": ObjectId(user_id)},
                    {"influencer_id": ObjectId(user_id)},
                    {"participants.user_id": ObjectId(user_id)}
                ]
            })
            
            sent_to = set()
            async for conv in conversations:
                # Get other participants
                for participant in conv.get("participants", []):
                    participant_id = str(participant["user_id"])
                    if participant_id != user_id and participant_id not in sent_to:
                        await self.send_personal(participant_id, message)
                        sent_to.add(participant_id)
        
        except Exception as e:
            logger.error(f"Error broadcasting to contacts: {e}")
    
    async def update_activity(self, user_id: str, connection_id: str):
        """Update last activity timestamp"""
        if user_id in self.active_connections and connection_id in self.active_connections[user_id]:
            self.active_connections[user_id][connection_id].last_activity = datetime.utcnow()
        
        # Update in Redis if available
        if self.redis_client:
            try:
                connection_key = f"chat:connection:{user_id}:{connection_id}"
                await self.redis_client.hset(connection_key, "last_activity", datetime.utcnow().isoformat())
                await self.redis_client.expire(connection_key, self.connection_expiry)
                
                # Update presence last seen
                presence_key = f"chat:presence:{user_id}"
                await self.redis_client.hset(presence_key, "last_seen", datetime.utcnow().isoformat())
                await self.redis_client.expire(presence_key, self.connection_expiry + 60)
            except Exception as e:
                logger.error(f"Redis activity update error: {e}")
    
    async def get_user_presence(self, user_id: str) -> Optional[UserPresence]:
        """Get user presence information with caching"""
        # Check cache first
        cache_key = f"presence:{user_id}"
        if cache_key in user_presence_cache:
            return user_presence_cache[cache_key]
        
        # Check Redis
        presence = None
        if self.redis_client:
            try:
                presence_key = f"chat:presence:{user_id}"
                data = await self.redis_client.hgetall(presence_key)
                
                if data:
                    is_online = data.get("is_online", "false") == "true"
                    last_seen = datetime.fromisoformat(data.get("last_seen", datetime.utcnow().isoformat()))
                    
                    device_info = {}
                    if data.get("device_info"):
                        device_info = json.loads(data["device_info"])
                    
                    presence = UserPresence(
                        user_id=user_id,
                        is_online=is_online,
                        last_seen=last_seen,
                        device_info=device_info
                    )
            except Exception as e:
                logger.error(f"Redis presence fetch error: {e}")
        
        # Fallback to memory
        if not presence:
            is_online = user_id in self.active_connections
            last_seen = datetime.utcnow()
            presence = UserPresence(
                user_id=user_id,
                is_online=is_online,
                last_seen=last_seen,
                device_info={}
            )
        
        # Cache the result
        user_presence_cache[cache_key] = presence
        return presence
    
    async def get_online_users(self) -> List[str]:
        """Get list of online user IDs"""
        if self.redis_client:
            try:
                return list(await self.redis_client.smembers("chat:online_users"))
            except Exception as e:
                logger.error(f"Redis online users fetch error: {e}")
        
        # Fallback to memory
        return list(self.active_connections.keys())
    
    async def notify_presence_change(self, user_id: str, is_online: bool):
        """Notify user's contacts about presence change"""
        presence_info = await self.get_user_presence(user_id)
        
        message = {
            "type": "presence",
            "user_id": user_id,
            "is_online": is_online,
            "presence": presence_info.to_dict() if presence_info else None,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.broadcast_to_contacts(user_id, message)

# Initialize connection manager
connection_manager = ConnectionManager()

# Enhanced Subscription Validator with caching
class SubscriptionValidator:
    @staticmethod
    def get_user_chat_limits(current_user: dict) -> Dict:
        """Get chat limits based on user's subscription with caching"""
        try:
            user_id = str(current_user["_id"])
            cache_key = f"limits:{user_id}"
            
            # Check cache
            if cache_key in conversation_cache:
                return conversation_cache[cache_key]
            
            subscription_data = current_user.get("subscription", {})
            
            if not subscription_data:
                subscription_data = {
                    "type": "trial",
                    "is_active": True,
                    "is_trial": True,
                    "status": "active"
                }
            
            plan_type = subscription_data.get("type", "trial")
            if plan_type not in CHAT_LIMITS:
                plan_type = "trial"
            
            chat_limits = CHAT_LIMITS[plan_type].copy()
            
            # Add extra benefits for active paid subscriptions
            if plan_type not in ["free", "trial"] and subscription_data.get("is_active", False):
                chat_limits.update({
                    "priority_message_delivery": True,
                    "message_scheduling": True,
                    "message_analytics": True,
                    "custom_emoji": True
                })
            
            chat_limits.update({
                "plan_type": plan_type,
                "plan_name": plan_type.capitalize(),
                "is_active": subscription_data.get("is_active", True),
                "is_trial": subscription_data.get("is_trial", True),
                "trial_remaining_days": subscription_data.get("trial_remaining_days", 15)
            })
            
            # Cache the result
            conversation_cache[cache_key] = chat_limits
            return chat_limits
            
        except Exception as e:
            logger.error(f"Error getting chat limits: {e}")
            return CHAT_LIMITS["trial"].copy()
    
    @staticmethod
    async def can_send_message(current_user: dict) -> Tuple[bool, Optional[str]]:
        """Check if user can send messages with rate limiting"""
        limits = SubscriptionValidator.get_user_chat_limits(current_user)
        user_id = str(current_user["_id"])
        
        # Check daily message limit
        if limits["daily_message_limit"] is not None:
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_message_count = await messages_collection.count_documents({
                "sender_id": ObjectId(user_id),
                "timestamp": {"$gte": today_start},
                "status": {"$ne": MessageStatus.FAILED.value}
            })
            
            if today_message_count >= limits["daily_message_limit"]:
                return False, "Daily message limit reached"
        
        # Check rate limiting
        rate_limit_key = f"rate_limit:msg:{user_id}:{int(time.time() // 60)}"
        if redis_client:
            try:
                current_count = await redis_client.get(rate_limit_key)
                if current_count and int(current_count) > 60:  # Max 60 messages per minute
                    return False, "Rate limit exceeded. Please slow down."
                await redis_client.incr(rate_limit_key)
                await redis_client.expire(rate_limit_key, 60)
            except Exception as e:
                logger.error(f"Redis rate limit error: {e}")
        
        return True, None
    
    @staticmethod
    async def can_create_conversation(current_user: dict, conversation_type: str = "direct") -> Tuple[bool, Optional[str]]:
        """Check if user can create new conversations"""
        limits = SubscriptionValidator.get_user_chat_limits(current_user)
        user_id = str(current_user["_id"])
        
        # Check if user can create groups
        if conversation_type == "group" and not limits.get("can_create_groups", False):
            return False, "Group creation not allowed in your plan"
        
        if limits["max_conversations"] is None:
            return True, None
        
        conversation_count = await conversations_collection.count_documents({
            "$or": [
                {"brand_id": ObjectId(user_id)},
                {"influencer_id": ObjectId(user_id)},
                {"participants.user_id": ObjectId(user_id)}
            ]
        })
        
        if conversation_count >= limits["max_conversations"]:
            return False, f"Conversation limit reached ({limits['max_conversations']})"
        
        return True, None
    
    @staticmethod
    async def can_upload_media(current_user: dict, file_size: int, content_type: str) -> Tuple[bool, Optional[str]]:
        """Check if user can upload media"""
        limits = SubscriptionValidator.get_user_chat_limits(current_user)
        user_id = str(current_user["_id"])
        
        # Check file size
        if file_size > limits["max_media_size"]:
            return False, f"File too large. Maximum size: {limits['max_media_size'] // (1024*1024)}MB"
        
        # Check content type
        allowed_types = limits.get("allowed_media_types", [])
        if allowed_types and content_type not in allowed_types:
            return False, f"File type not allowed. Allowed types: {', '.join(allowed_types)}"
        
        # Check daily media limit
        if limits["max_media_per_day"] is not None:
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_media_count = await messages_collection.count_documents({
                "sender_id": ObjectId(user_id),
                "message_type": MessageType.MEDIA.value,
                "timestamp": {"$gte": today_start}
            })
            
            if today_media_count >= limits["max_media_per_day"]:
                return False, "Daily media upload limit reached"
        
        return True, None

# Enhanced Message Service with performance optimizations
class MessageService:
    
    @staticmethod
    async def create_message(
        conversation_id: str,
        sender_id: str,
        content: str,
        message_type: MessageType = MessageType.TEXT,
        media_info: Optional[Dict] = None,
        reply_to: Optional[str] = None,
        forward_from: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create and save a new message with transaction"""
        try:
            # Get conversation with caching
            conversation = await MessageService._get_conversation(conversation_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            
            # Validate participants
            participants = conversation.get("participants", [])
            if not any(str(p["user_id"]) == sender_id for p in participants):
                raise HTTPException(status_code=403, detail="Not a conversation participant")
            
            # Get receiver(s)
            receiver_ids = []
            for participant in participants:
                participant_id = str(participant["user_id"])
                if participant_id != sender_id:
                    receiver_ids.append(participant_id)
            
            if not receiver_ids:
                raise HTTPException(status_code=400, detail="No receivers found")
            
            # Create message document
            message_id = ObjectId()
            client_message_id = metadata.get("client_message_id") if metadata else str(uuid.uuid4())
            
            message_doc = {
                "_id": message_id,
                "conversation_id": ObjectId(conversation_id),
                "sender_id": ObjectId(sender_id),
                "receiver_ids": [ObjectId(rid) for rid in receiver_ids],
                "content": content,
                "message_type": message_type.value,
                "media_info": media_info,
                "status": MessageStatus.SENT.value,
                "timestamp": datetime.utcnow(),
                "read_by": [],
                "delivered_to": [ObjectId(sender_id)],  # Mark as delivered to sender immediately
                "reply_to": ObjectId(reply_to) if reply_to else None,
                "forward_from": ObjectId(forward_from) if forward_from else None,
                "metadata": {
                    "client_message_id": client_message_id,
                    "sent_at": datetime.utcnow(),
                    "version": "1.0",
                    "edited_count": 0,
                    **(metadata or {})
                }
            }
            
            # Insert message
            await messages_collection.insert_one(message_doc)
            
            # Update conversation with atomic operation
            update_data = {
                "last_message": content,
                "last_message_type": message_type.value,
                "last_message_sender": ObjectId(sender_id),
                "last_message_timestamp": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Increment unread count for other participants
            for receiver_id in receiver_ids:
                update_data[f"unread_counts.{receiver_id}"] = conversation.get("unread_counts", {}).get(receiver_id, 0) + 1
            
            await conversations_collection.update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": update_data}
            )
            
            # Clear conversation cache
            cache_key = f"conversation:{conversation_id}"
            if cache_key in conversation_cache:
                del conversation_cache[cache_key]
            
            return await MessageService.serialize_message(message_doc)
            
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            raise HTTPException(status_code=500, detail="Failed to create message")
    
    @staticmethod
    async def _get_conversation(conversation_id: str) -> Optional[Dict]:
        """Get conversation with caching"""
        cache_key = f"conversation:{conversation_id}"
        if cache_key in conversation_cache:
            return conversation_cache[cache_key]
        
        conversation = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
        if conversation:
            conversation_cache[cache_key] = conversation
        return conversation
    
    @staticmethod
    async def serialize_message(message_doc: Dict) -> Dict:
        """Serialize message document for response"""
        return {
            "id": str(message_doc["_id"]),
            "conversation_id": str(message_doc["conversation_id"]),
            "sender_id": str(message_doc["sender_id"]),
            "receiver_ids": [str(rid) for rid in message_doc.get("receiver_ids", [])],
            "content": message_doc["content"],
            "message_type": message_doc["message_type"],
            "media_info": message_doc.get("media_info"),
            "status": message_doc["status"],
            "timestamp": message_doc["timestamp"].isoformat(),
            "read_by": [str(user_id) for user_id in message_doc.get("read_by", [])],
            "delivered_to": [str(user_id) for user_id in message_doc.get("delivered_to", [])],
            "reply_to": str(message_doc.get("reply_to")) if message_doc.get("reply_to") else None,
            "forward_from": str(message_doc.get("forward_from")) if message_doc.get("forward_from") else None,
            "metadata": message_doc.get("metadata", {}),
            "is_edited": message_doc.get("is_edited", False),
            "edited_at": message_doc.get("edited_at").isoformat() if message_doc.get("edited_at") else None
        }
    
    @staticmethod
    async def mark_message_delivered(message_id: str, user_id: str):
        """Mark message as delivered to user with batch updates"""
        try:
            await messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                {
                    "$addToSet": {"delivered_to": ObjectId(user_id)},
                    "$set": {"status": MessageStatus.DELIVERED.value}
                }
            )
        except Exception as e:
            logger.error(f"Error marking message as delivered: {e}")
    
    @staticmethod
    async def mark_message_read(message_id: str, user_id: str):
        """Mark message as read by user with conversation update"""
        try:
            # Get message first
            message = await messages_collection.find_one({"_id": ObjectId(message_id)})
            if not message:
                return False
            
            # Update message
            result = await messages_collection.update_one(
                {
                    "_id": ObjectId(message_id),
                    "receiver_ids": ObjectId(user_id)
                },
                {
                    "$addToSet": {"read_by": ObjectId(user_id)},
                    "$set": {"status": MessageStatus.READ.value}
                }
            )
            
            if result.modified_count > 0:
                # Update conversation unread count
                conversation_id = message["conversation_id"]
                await conversations_collection.update_one(
                    {"_id": conversation_id},
                    {"$set": {f"unread_counts.{user_id}": 0}}
                )
                
                # Clear cache
                cache_key = f"conversation:{conversation_id}"
                if cache_key in conversation_cache:
                    del conversation_cache[cache_key]
                
                # Notify sender
                read_receipt = {
                    "type": "read_receipt",
                    "message_id": message_id,
                    "conversation_id": str(message["conversation_id"]),
                    "read_by": user_id,
                    "read_at": datetime.utcnow().isoformat()
                }
                
                await connection_manager.send_personal(
                    str(message["sender_id"]),
                    read_receipt
                )
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error marking message as read: {e}")
            return False
    
    @staticmethod
    async def edit_message(message_id: str, user_id: str, new_content: str, metadata: Optional[Dict] = None) -> bool:
        """Edit a message with versioning"""
        try:
            # Check if message exists and user is sender
            message = await messages_collection.find_one({"_id": ObjectId(message_id)})
            if not message:
                return False
            
            if str(message["sender_id"]) != user_id:
                return False
            
            # Check edit window (15 minutes for text, longer for others)
            edit_window = 15 * 60  # 15 minutes in seconds
            if message["message_type"] != MessageType.TEXT.value:
                edit_window = 60 * 60  # 1 hour for media messages
            
            time_since_sent = (datetime.utcnow() - message["timestamp"]).total_seconds()
            if time_since_sent > edit_window:
                return False
            
            # Update message
            update_data = {
                "$set": {
                    "content": new_content,
                    "edited_at": datetime.utcnow(),
                    "is_edited": True
                },
                "$inc": {"metadata.edited_count": 1}
            }
            
            if metadata:
                update_data["$set"]["metadata"] = {**message.get("metadata", {}), **metadata}
            
            result = await messages_collection.update_one(
                {"_id": ObjectId(message_id)},
                update_data
            )
            
            if result.modified_count > 0:
                # Update conversation if this was the last message
                if message.get("conversation_id"):
                    await conversations_collection.update_one(
                        {
                            "_id": message["conversation_id"],
                            "last_message_sender": ObjectId(user_id),
                            "last_message_timestamp": message["timestamp"]
                        },
                        {"$set": {"last_message": new_content}}
                    )
                
                # Clear cache
                cache_key = f"conversation:{message['conversation_id']}"
                if cache_key in conversation_cache:
                    del conversation_cache[cache_key]
                
                # Notify participants
                edit_notification = {
                    "type": "message_edit",
                    "message_id": message_id,
                    "conversation_id": str(message["conversation_id"]),
                    "new_content": new_content,
                    "edited_by": user_id,
                    "edited_at": datetime.utcnow().isoformat(),
                    "original_timestamp": message["timestamp"].isoformat()
                }
                
                await connection_manager.broadcast_to_contacts(user_id, edit_notification)
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error editing message: {e}")
            return False

# Enhanced Media Service with compression and security
class MediaService:
    
    # Allowed MIME types with max sizes
    ALLOWED_TYPES = {
        "image/jpeg": 20 * 1024 * 1024,  # 20MB
        "image/png": 20 * 1024 * 1024,
        "image/gif": 10 * 1024 * 1024,
        "image/webp": 20 * 1024 * 1024,
        "video/mp4": 100 * 1024 * 1024,  # 100MB
        "video/ogg": 50 * 1024 * 1024,
        "video/webm": 50 * 1024 * 1024,
        "audio/mpeg": 10 * 1024 * 1024,
        "audio/wav": 20 * 1024 * 1024,
        "application/pdf": 10 * 1024 * 1024,
        "application/msword": 10 * 1024 * 1024,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10 * 1024 * 1024,
    }
    
    @staticmethod
    async def save_chat_media(file: UploadFile, current_user: dict, optimize: bool = True) -> Dict:
        """Save media file with compression, validation, and security checks"""
        try:
            # Read file content
            content = await file.read()
            file_size = len(content)
            
            # Basic validation
            if file_size == 0:
                raise HTTPException(status_code=400, detail="Empty file")
            
            # Check subscription limits
            can_upload, reason = await SubscriptionValidator.can_upload_media(
                current_user, file_size, file.content_type
            )
            if not can_upload:
                raise HTTPException(status_code=402, detail=reason)
            
            # Validate file type
            max_size = MediaService.ALLOWED_TYPES.get(file.content_type)
            if not max_size:
                raise HTTPException(status_code=400, detail=f"File type not allowed: {file.content_type}")
            
            if file_size > max_size:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File too large. Maximum size: {max_size // (1024*1024)}MB"
                )
            
            # Generate secure filename
            file_hash = hashlib.sha256(content).hexdigest()[:16]
            file_ext = Path(file.filename).suffix.lower() or ".bin"
            secure_filename = f"{file_hash}{file_ext}"
            
            # Process image compression if enabled
            processed_content = content
            thumbnail_content = None
            
            if optimize and file.content_type.startswith('image/'):
                processed_content = await MediaService.optimize_image(content, file.content_type)
                thumbnail_content = await MediaService.generate_thumbnail(processed_content)
            
            # Save to storage with folder
            file_id = storage_provider.upload(
                processed_content,
                filename=secure_filename,
                folder="chat_media"
            )
            
            # Save thumbnail if generated
            thumbnail_id = None
            if thumbnail_content:
                thumbnail_id = storage_provider.upload(
                    thumbnail_content,
                    filename=f"thumb_{secure_filename}",
                    folder="chat_thumbnails"
                )
            
            # Store in media collection for faster queries
            media_doc = {
                "_id": file_id,
                "filename": secure_filename,
                "original_filename": file.filename,
                "content_type": file.content_type,
                "size": file_size,
                "optimized_size": len(processed_content),
                "uploaded_by": ObjectId(current_user["_id"]),
                "uploaded_at": datetime.utcnow(),
                "category": MediaService.get_file_category(file.content_type),
                "thumbnail_id": ObjectId(thumbnail_id) if thumbnail_id else None,
                "checksum": file_hash,
                "access_count": 0,
                "last_accessed": datetime.utcnow(),
                "is_public": False
            }
            
            await chat_media_collection.insert_one(media_doc)
            
            return {
                "file_id": str(file_id),
                "filename": file.filename,
                "secure_filename": secure_filename,
                "content_type": file.content_type,
                "size": file_size,
                "optimized_size": len(processed_content),
                "uploaded_at": datetime.utcnow().isoformat(),
                "category": MediaService.get_file_category(file.content_type),
                "thumbnail_id": str(thumbnail_id) if thumbnail_id else None,
                "checksum": file_hash,
                "download_url": f"/chat/media/{file_id}",
                "thumbnail_url": f"/chat/media/{thumbnail_id}/thumbnail" if thumbnail_id else None,
                "preview_url": f"/chat/media/{file_id}/preview" if file.content_type.startswith('image/') else None
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error saving chat media: {e}")
            raise HTTPException(status_code=500, detail="Failed to save media file")
    
    @staticmethod
    async def optimize_image(image_content: bytes, content_type: str, max_dimension: int = 1920) -> bytes:
        """Optimize image for web delivery"""
        try:
            image = Image.open(io.BytesIO(image_content))
            
            # Convert to RGB if necessary
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            
            # Resize if too large
            if max(image.size) > max_dimension:
                image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            # Save with optimization
            output = io.BytesIO()
            
            if content_type == "image/jpeg":
                image.save(output, format='JPEG', quality=85, optimize=True, progressive=True)
            elif content_type == "image/png":
                image.save(output, format='PNG', optimize=True)
            elif content_type == "image/webp":
                image.save(output, format='WEBP', quality=85, method=6)
            else:
                return image_content  # Return original if not optimizable
            
            output_bytes = output.getvalue()
            
            # Only return if optimization reduced size
            if len(output_bytes) < len(image_content) * 0.9:  # At least 10% reduction
                return output_bytes
            
            return image_content
            
        except Exception as e:
            logger.error(f"Error optimizing image: {e}")
            return image_content
    
    @staticmethod
    async def generate_thumbnail(image_content: bytes, size: Tuple[int, int] = (320, 320)) -> Optional[bytes]:
        """Generate thumbnail for image"""
        try:
            image = Image.open(io.BytesIO(image_content))
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Convert to RGB if necessary
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            
            # Save to bytes as JPEG
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=85, optimize=True)
            return output.getvalue()
        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
            return None
    
    @staticmethod
    def get_file_category(content_type: str) -> str:
        """Categorize file type"""
        if content_type.startswith('image/'):
            return 'image'
        elif content_type.startswith('video/'):
            return 'video'
        elif content_type.startswith('audio/'):
            return 'audio'
        elif content_type in ['application/pdf']:
            return 'document'
        elif 'word' in content_type or 'document' in content_type:
            return 'word'
        elif 'excel' in content_type or 'spreadsheet' in content_type:
            return 'excel'
        elif 'powerpoint' in content_type or 'presentation' in content_type:
            return 'powerpoint'
        elif content_type.startswith('text/'):
            return 'text'
        elif 'zip' in content_type or 'compressed' in content_type:
            return 'archive'
        else:
            return 'other'
    
    @staticmethod
    def get_file_preview_text(category: str, filename: str) -> str:
        """Get preview text for file type"""
        previews = {
            'image': '📷 Image',
            'video': '🎥 Video',
            'audio': '🎵 Audio',
            'document': '📄 Document',
            'word': '📝 Word Document',
            'excel': '📊 Excel File',
            'powerpoint': '📈 Presentation',
            'text': '📃 Text File',
            'archive': '📦 Archive',
            'other': '📎 File'
        }
        return f"{previews.get(category, '📎 File')}: {filename}"

# WebSocket Handler with improved error handling and reconnection support
@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    device_id: str = Query("web"),
    client_version: str = Query("1.0.0"),
    client_type: str = Query("web"),
    reconnect: bool = Query(False)
):
    """
    Enhanced WebSocket endpoint for real-time chat with reconnection support
    """
    await websocket.accept()
    
    user_id = None
    connection_id = None
    session_id = str(uuid.uuid4())
    
    try:
        # Verify token
        payload = decode_access_token(token)
        if not payload or not payload.get("sub"):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        user_id = payload["sub"]
        
        # Get user from database
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        # Check if user is active
        if not user.get("is_active", True):
            await websocket.close(code=status.WS_1013_TRY_AGAIN_LATER)
            return
        
        # Device information
        device_info = {
            "device_id": device_id,
            "client_version": client_version,
            "client_type": client_type,
            "user_agent": websocket.headers.get("user-agent", ""),
            "platform": websocket.headers.get("sec-ch-ua-platform", ""),
            "ip_address": websocket.client.host if websocket.client else "unknown",
            "connected_at": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "reconnect": reconnect
        }
        
        # Connect to manager
        connection_id = await connection_manager.add_connection(user_id, session_id, device_info, websocket)
        
        # Send connection success
        await websocket.send_json({
            "type": "connection_success",
            "connection_id": connection_id,
            "session_id": session_id,
            "user_id": user_id,
            "server_time": datetime.utcnow().isoformat(),
            "server_version": "2.0.0",
            "subscription": user.get("subscription", {}),
            "message": "Connected to real-time chat",
            "reconnect": reconnect,
            "features": ["typing", "read_receipts", "reactions", "calls"]
        })
        
        # Notify presence change
        await connection_manager.notify_presence_change(user_id, True)
        
        # Send queued messages if any
        await send_queued_messages(user_id)
        
        # Send initial presence status
        await connection_manager.send_personal(user_id, {
            "type": "presence_update",
            "user_id": user_id,
            "is_online": True,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Main message loop with heartbeat
        heartbeat_interval = 30  # seconds
        last_heartbeat = time.time()
        
        while True:
            try:
                # Set timeout for receiving messages
                data = await asyncio.wait_for(websocket.receive_text(), timeout=heartbeat_interval)
                
                try:
                    message_data = json.loads(data)
                    await handle_websocket_message(
                        message_data, 
                        user_id, 
                        connection_id,
                        user
                    )
                    
                    # Update activity
                    await connection_manager.update_activity(user_id, connection_id)
                    last_heartbeat = time.time()
                    
                except json.JSONDecodeError:
                    await websocket.send_json({
                        "type": "error",
                        "code": "INVALID_JSON",
                        "message": "Invalid JSON format"
                    })
                    
            except asyncio.TimeoutError:
                # Send heartbeat ping
                current_time = time.time()
                if current_time - last_heartbeat > heartbeat_interval:
                    try:
                        ping_id = str(uuid.uuid4())
                        await websocket.send_json({
                            "type": "ping",
                            "ping_id": ping_id,
                            "timestamp": datetime.utcnow().isoformat()
                        })
                        
                        # Wait for pong
                        pong_data = await asyncio.wait_for(websocket.receive_text(), timeout=10)
                        pong_msg = json.loads(pong_data)
                        
                        if pong_msg.get("type") == "pong" and pong_msg.get("ping_id") == ping_id:
                            last_heartbeat = time.time()
                            await connection_manager.update_activity(user_id, connection_id)
                            continue
                            
                    except (asyncio.TimeoutError, json.JSONDecodeError, KeyError):
                        logger.warning(f"Heartbeat failed for user {user_id}")
                        break  # Connection lost
                    
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {user_id}")
                break
                
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        
    finally:
        if user_id and connection_id:
            await connection_manager.disconnect(user_id, connection_id)
            await connection_manager.notify_presence_change(user_id, False)

async def handle_websocket_message(message_data: Dict, user_id: str, connection_id: str, current_user: dict):
    """Handle incoming WebSocket messages with improved error handling"""
    message_type = message_data.get("type")
    message_id = message_data.get("id", str(uuid.uuid4()))
    
    handlers = {
        "message": handle_chat_message,
        "typing": handle_typing_indicator,
        "read_receipt": handle_read_receipt,
        "reaction": handle_message_reaction,
        "edit": handle_message_edit,
        "delete": handle_message_delete,
        "presence": handle_presence_request,
        "call": handle_call_request,
        "pong": handle_pong,
        "typing": handle_typing_indicator,
        "seen": handle_seen_indicator,
        "typing": handle_typing_indicator
    }
    
    handler = handlers.get(message_type)
    if handler:
        try:
            await handler(message_data, user_id, connection_id, current_user)
            # Send acknowledgment for critical operations
            if message_type in ["message", "edit", "delete", "reaction"]:
                await connection_manager.send_personal(user_id, {
                    "type": "acknowledgment",
                    "message_id": message_id,
                    "original_type": message_type,
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "processed"
                }, exclude_connection=connection_id)
        except Exception as e:
            logger.error(f"Error handling {message_type}: {e}")
            await connection_manager.send_personal(user_id, {
                "type": "error",
                "message_id": message_id,
                "code": "HANDLER_ERROR",
                "message": f"Failed to process {message_type}"
            }, exclude_connection=connection_id)
    else:
        await connection_manager.send_personal(user_id, {
            "type": "error",
            "message_id": message_id,
            "code": "UNKNOWN_TYPE",
            "message": f"Unknown message type: {message_type}"
        }, exclude_connection=connection_id)

# Enhanced REST API Endpoints

@router.post("/conversations", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    request: ConversationCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new conversation or return existing one with validation"""
    try:
        user_id = str(current_user["_id"])
        user_role = current_user.get("role")
        
        # Check conversation limit
        can_create, reason = await SubscriptionValidator.can_create_conversation(current_user)
        if not can_create:
            raise HTTPException(
                status_code=402,
                detail=reason,
                headers={"X-Plan-Limit": "conversations"}
            )
        
        # Validate users based on role
        if user_role == "brand":
            brand_id = user_id
            influencer_id = request.influencer_id
            
            # Verify influencer exists and is active
            influencer = await users_collection.find_one({
                "_id": ObjectId(influencer_id), 
                "role": "influencer",
                "is_active": True
            })
            if not influencer:
                raise HTTPException(status_code=404, detail="Influencer not found or inactive")
            
        elif user_role == "influencer":
            brand_id = request.brand_id
            influencer_id = user_id
            
            # Verify brand exists and is active
            brand = await users_collection.find_one({
                "_id": ObjectId(brand_id), 
                "role": "brand",
                "is_active": True
            })
            if not brand:
                raise HTTPException(status_code=404, detail="Brand not found or inactive")
        else:
            raise HTTPException(status_code=400, detail="Invalid user role")
        
        # Check existing conversation
        existing = await conversations_collection.find_one({
            "$or": [
                {"brand_id": ObjectId(brand_id), "influencer_id": ObjectId(influencer_id)},
                {"brand_id": ObjectId(influencer_id), "influencer_id": ObjectId(brand_id)}
            ]
        })
        
        if existing:
            # Update last activity
            await conversations_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            return {
                "conversation_id": str(existing["_id"]),
                "already_exists": True,
                "created_at": existing["created_at"].isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        
        # Create new conversation
        conversation = {
            "brand_id": ObjectId(brand_id),
            "influencer_id": ObjectId(influencer_id),
            "participants": [
                {"user_id": ObjectId(brand_id), "role": "brand", "joined_at": datetime.utcnow()},
                {"user_id": ObjectId(influencer_id), "role": "influencer", "joined_at": datetime.utcnow()}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_message": "",
            "last_message_type": "text",
            "last_message_sender": None,
            "last_message_timestamp": datetime.utcnow(),
            "unread_counts": {
                brand_id: 0,
                influencer_id: 0
            },
            "settings": {
                "muted_by": [],
                "archived_by": [],
                "pinned_by": []
            },
            "metadata": {
                "initiator": user_id,
                "initiator_role": user_role,
                "created_via": "direct"
            }
        }
        
        result = await conversations_collection.insert_one(conversation)
        conversation_id = str(result.inserted_id)
        
        # Notify participants
        notification_data = {
            "type": "conversation_created",
            "conversation_id": conversation_id,
            "with_user": influencer_id if user_role == "brand" else brand_id,
            "initiator": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await connection_manager.send_personal(brand_id, notification_data)
        await connection_manager.send_personal(influencer_id, notification_data)
        
        return {
            "conversation_id": conversation_id,
            "already_exists": False,
            "created_at": conversation["created_at"].isoformat(),
            "participants": [
                {"user_id": brand_id, "role": "brand"},
                {"user_id": influencer_id, "role": "influencer"}
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/online")
async def get_online_users(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get online users with pagination"""
    try:
        online_user_ids = await connection_manager.get_online_users()
        
        # Filter out current user
        current_user_id = str(current_user["_id"])
        online_user_ids = [uid for uid in online_user_ids if uid != current_user_id]
        
        # Paginate
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_ids = online_user_ids[start_idx:end_idx]
        
        users_info = []
        for user_id in paginated_ids:
            # Try cache first
            cache_key = f"profile:{user_id}"
            if cache_key in user_profile_cache:
                user_data = user_profile_cache[cache_key]
            else:
                user = await users_collection.find_one(
                    {"_id": ObjectId(user_id)},
                    {"username": 1, "email": 1, "role": 1, "brand_profile": 1, "influencer_profile": 1}
                )
                
                if not user:
                    continue
                
                presence = await connection_manager.get_user_presence(user_id)
                
                # Build user data
                user_data = {
                    "user_id": user_id,
                    "username": user.get("username"),
                    "email": user.get("email"),
                    "role": user.get("role"),
                    "is_online": presence.is_online if presence else False,
                    "last_seen": presence.last_seen.isoformat() if presence else None,
                    "presence_status": presence.status if presence else "offline"
                }
                
                # Add profile data
                if user["role"] == "brand" and user.get("brand_profile"):
                    profile = user["brand_profile"]
                    user_data.update({
                        "name": profile.get("company_name"),
                        "profile_picture": profile.get("logo"),
                        "bio": profile.get("bio", "")[:100]
                    })
                elif user["role"] == "influencer" and user.get("influencer_profile"):
                    profile = user["influencer_profile"]
                    user_data.update({
                        "name": profile.get("full_name"),
                        "profile_picture": profile.get("profile_picture"),
                        "bio": profile.get("bio", "")[:100]
                    })
                
                # Cache the result
                user_profile_cache[cache_key] = user_data
            
            users_info.append(user_data)
        
        return {
            "online_users": users_info,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(online_user_ids),
                "pages": (len(online_user_ids) + limit - 1) // limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting online users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/search")
async def search_users(
    q: str = Query(..., min_length=1),
    role: Optional[str] = Query(None, regex="^(brand|influencer)$"),
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=50)
):
    """Search for users with improved relevance scoring"""
    try:
        current_user_id = str(current_user["_id"])
        current_user_role = current_user.get("role")
        
        # Build search query
        query = {"_id": {"$ne": ObjectId(current_user_id)}, "is_active": True}
        
        # Filter by opposite role by default
        if not role:
            if current_user_role == "brand":
                query["role"] = "influencer"
            elif current_user_role == "influencer":
                query["role"] = "brand"
        else:
            query["role"] = role
        
        # Create search conditions
        search_regex = {"$regex": q, "$options": "i"}
        search_conditions = [
            {"username": search_regex},
            {"email": search_regex}
        ]
        
        # Add profile-specific searches
        if query.get("role") == "brand":
            search_conditions.extend([
                {"brand_profile.company_name": search_regex},
                {"brand_profile.industry": search_regex},
                {"brand_profile.bio": search_regex},
                {"brand_profile.location": search_regex}
            ])
        elif query.get("role") == "influencer":
            search_conditions.extend([
                {"influencer_profile.full_name": search_regex},
                {"influencer_profile.niche": search_regex},
                {"influencer_profile.bio": search_regex},
                {"influencer_profile.location": search_regex}
            ])
        
        query["$or"] = search_conditions
        
        # Execute search with sorting
        users_cursor = users_collection.find(query).limit(limit * 2)  # Get more for filtering
        
        users = []
        async for user in users_cursor:
            user_id_str = str(user["_id"])
            
            # Check if there's already a conversation
            existing_conversation = await conversations_collection.find_one({
                "$or": [
                    {"brand_id": ObjectId(current_user_id), "influencer_id": ObjectId(user_id_str)},
                    {"brand_id": ObjectId(user_id_str), "influencer_id": ObjectId(current_user_id)}
                ]
            })
            
            # Get user presence
            presence = await connection_manager.get_user_presence(user_id_str)
            
            user_data = {
                "id": user_id_str,
                "username": user.get("username"),
                "email": user.get("email"),
                "role": user.get("role"),
                "is_online": presence.is_online if presence else False,
                "last_seen": presence.last_seen.isoformat() if presence else None,
                "has_existing_conversation": existing_conversation is not None,
                "existing_conversation_id": str(existing_conversation["_id"]) if existing_conversation else None,
                "relevance_score": 0  # Will be calculated
            }
            
            # Add profile data and calculate relevance score
            relevance_score = 0
            
            if user["role"] == "brand":
                profile = user.get("brand_profile", {})
                user_data.update({
                    "name": profile.get("company_name") or user.get("username"),
                    "profile_picture": profile.get("logo"),
                    "bio": profile.get("bio", "")[:150],
                    "industry": profile.get("industry"),
                    "location": profile.get("location"),
                    "website": profile.get("website")
                })
                
                # Calculate relevance score
                if q.lower() in (profile.get("company_name", "").lower() or ""):
                    relevance_score += 10
                if q.lower() in (profile.get("industry", "").lower() or ""):
                    relevance_score += 5
                if q.lower() in (profile.get("bio", "").lower() or ""):
                    relevance_score += 3
                
            elif user["role"] == "influencer":
                profile = user.get("influencer_profile", {})
                user_data.update({
                    "name": profile.get("full_name") or user.get("username"),
                    "profile_picture": profile.get("profile_picture"),
                    "bio": profile.get("bio", "")[:150],
                    "niche": profile.get("niche"),
                    "location": profile.get("location"),
                    "follower_count": profile.get("follower_count")
                })
                
                # Calculate relevance score
                if q.lower() in (profile.get("full_name", "").lower() or ""):
                    relevance_score += 10
                if q.lower() in (profile.get("niche", "").lower() or ""):
                    relevance_score += 5
                if q.lower() in (profile.get("bio", "").lower() or ""):
                    relevance_score += 3
            
            # Boost score for online users
            if user_data["is_online"]:
                relevance_score += 2
            
            # Boost score for users with existing conversations
            if user_data["has_existing_conversation"]:
                relevance_score += 1
            
            user_data["relevance_score"] = relevance_score
            users.append(user_data)
        
        # Sort by relevance score
        users.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Return top results
        top_users = users[:limit]
        
        return {
            "users": top_users,
            "search_query": q,
            "count": len(top_users),
            "total_found": len(users)
        }
        
    except Exception as e:
        logger.error(f"Error searching users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed user profile for chat"""
    try:
        current_user_id = str(current_user["_id"])
        
        # Get target user
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(status_code=404, detail="User account is inactive")
        
        # Check if there's an existing conversation
        existing_conversation = await conversations_collection.find_one({
            "$or": [
                {"brand_id": ObjectId(current_user_id), "influencer_id": ObjectId(user_id)},
                {"brand_id": ObjectId(user_id), "influencer_id": ObjectId(current_user_id)}
            ]
        })
        
        # Get user presence
        presence = await connection_manager.get_user_presence(user_id)
        
        # Build response
        response = {
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "role": user.get("role"),
            "auth_provider": user.get("auth_provider", "email"),
            "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
            "last_login": user.get("last_login").isoformat() if user.get("last_login") else None,
            "is_online": presence.is_online if presence else False,
            "last_seen": presence.last_seen.isoformat() if presence else None,
            "presence_status": presence.status if presence else "offline",
            "has_existing_conversation": existing_conversation is not None,
            "is_verified": user.get("is_verified", False),
            "is_active": user.get("is_active", True)
        }
        
        if existing_conversation:
            response["existing_conversation_id"] = str(existing_conversation["_id"])
            response["conversation_created_at"] = existing_conversation["created_at"].isoformat()
            
            # Get conversation stats
            message_count = await messages_collection.count_documents({
                "conversation_id": existing_conversation["_id"]
            })
            response["conversation_stats"] = {
                "message_count": message_count,
                "last_message": existing_conversation.get("last_message"),
                "last_message_time": existing_conversation.get("last_message_timestamp").isoformat() if existing_conversation.get("last_message_timestamp") else None
            }
        
        # Add role-specific profile data
        if user["role"] == "brand":
            profile = user.get("brand_profile", {})
            response.update({
                "company_name": profile.get("company_name"),
                "logo": profile.get("logo"),
                "bio": profile.get("bio"),
                "industry": profile.get("industry"),
                "location": profile.get("location"),
                "website": profile.get("website"),
                "company_size": profile.get("company_size"),
                "social_links": profile.get("social_links", {}),
                "verification_badge": profile.get("verification_badge", False)
            })
            
            # Calculate profile completion
            required_fields = ["company_name", "bio", "industry", "logo", "location"]
            completed = sum(1 for field in required_fields if profile.get(field))
            response["profile_completion"] = (completed / len(required_fields)) * 100
            
        elif user["role"] == "influencer":
            profile = user.get("influencer_profile", {})
            response.update({
                "full_name": profile.get("full_name"),
                "profile_picture": profile.get("profile_picture"),
                "bio": profile.get("bio"),
                "niche": profile.get("niche"),
                "location": profile.get("location"),
                "follower_count": profile.get("follower_count"),
                "engagement_rate": profile.get("engagement_rate"),
                "social_media_handles": profile.get("social_media_handles", {}),
                "content_types": profile.get("content_types", []),
                "audience_demographics": profile.get("audience_demographics", {}),
                "average_views": profile.get("average_views"),
                "collaboration_preferences": profile.get("collaboration_preferences", {}),
                "verification_badge": profile.get("verification_badge", False)
            })
            
            # Calculate profile completion
            required_fields = ["full_name", "bio", "niche", "profile_picture", "follower_count", "location"]
            completed = sum(1 for field in required_fields if profile.get(field))
            response["profile_completion"] = (completed / len(required_fields)) * 100
        
        # Add subscription info (limited visibility)
        subscription = user.get("subscription", {})
        response["subscription"] = {
            "plan": subscription.get("type", "free"),
            "is_active": subscription.get("is_active", False),
            "is_trial": subscription.get("is_trial", False)
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/chatted")
async def get_chatted_users(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get users you've chatted with recently"""
    try:
        user_id = str(current_user["_id"])
        
        # Get conversations
        conversations_cursor = conversations_collection.find({
            "$or": [
                {"brand_id": ObjectId(user_id)},
                {"influencer_id": ObjectId(user_id)}
            ]
        }).sort("last_message_timestamp", -1)
        
        # Paginate
        conversations = await conversations_cursor.skip((page - 1) * limit).limit(limit).to_list(None)
        
        total = await conversations_collection.count_documents({
            "$or": [
                {"brand_id": ObjectId(user_id)},
                {"influencer_id": ObjectId(user_id)}
            ]
        })
        
        chatted_users = []
        for conv in conversations:
            # Get other participant
            other_user_id = conv["influencer_id"] if str(conv["brand_id"]) == user_id else conv["brand_id"]
            other_user_id_str = str(other_user_id)
            
            # Get user info
            user = await users_collection.find_one(
                {"_id": other_user_id},
                {"username": 1, "email": 1, "role": 1, "brand_profile": 1, "influencer_profile": 1}
            )
            
            if not user:
                continue
            
            # Get presence
            presence = await connection_manager.get_user_presence(other_user_id_str)
            
            # Get unread count
            unread_count = conv.get("unread_counts", {}).get(user_id, 0)
            
            user_data = {
                "id": other_user_id_str,
                "username": user.get("username"),
                "role": user.get("role"),
                "is_online": presence.is_online if presence else False,
                "last_seen": presence.last_seen.isoformat() if presence else None,
                "conversation_id": str(conv["_id"]),
                "last_message": conv.get("last_message", ""),
                "last_message_time": conv.get("last_message_timestamp").isoformat() if conv.get("last_message_timestamp") else None,
                "unread_count": unread_count,
                "conversation_created": conv["created_at"].isoformat()
            }
            
            # Add profile data
            if user["role"] == "brand":
                profile = user.get("brand_profile", {})
                user_data.update({
                    "name": profile.get("company_name"),
                    "profile_picture": profile.get("logo")
                })
            elif user["role"] == "influencer":
                profile = user.get("influencer_profile", {})
                user_data.update({
                    "name": profile.get("full_name"),
                    "profile_picture": profile.get("profile_picture")
                })
            
            chatted_users.append(user_data)
        
        return {
            "chatted_users": chatted_users,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting chatted users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def send_queued_messages(user_id: str):
    """Send any queued messages for offline user"""
    try:
        if redis_client:
            # Get queued messages from Redis
            queue_key = f"chat:queue:{user_id}"
            queued_messages = await redis_client.lrange(queue_key, 0, -1)
            
            if queued_messages:
                for msg_json in queued_messages:
                    try:
                        msg = json.loads(msg_json)
                        await connection_manager.send_personal(user_id, msg)
                    except json.JSONDecodeError:
                        continue
                
                # Clear the queue
                await redis_client.delete(queue_key)
                logger.info(f"Sent {len(queued_messages)} queued messages to user {user_id}")
        
    except Exception as e:
        logger.error(f"Error sending queued messages: {e}")

# Background cleanup task
async def cleanup_old_data():
    """Clean up old messages and connections"""
    try:
        # Clean up old messages (older than 1 year)
        one_year_ago = datetime.utcnow() - timedelta(days=365)
        
        deleted_count = await messages_collection.delete_many({
            "timestamp": {"$lt": one_year_ago},
            "metadata.preserve": {"$ne": True}
        })
        
        if deleted_count.deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count.deleted_count} old messages")
        
        # Clean up old media metadata
        old_media = await chat_media_collection.delete_many({
            "last_accessed": {"$lt": one_year_ago},
            "is_public": False
        })
        
        if old_media.deleted_count > 0:
            logger.info(f"Cleaned up {old_media.deleted_count} old media records")
        
        # Clean Redis connections
        if redis_client:
            # Get old connection keys (older than connection_expiry)
            connection_keys = await redis_client.keys("chat:connection:*")
            for key in connection_keys:
                ttl = await redis_client.ttl(key)
                if ttl < 0:
                    await redis_client.delete(key)
            
            # Clean up old queues
            queue_keys = await redis_client.keys("chat:queue:*")
            for key in queue_keys:
                # Keep queues for 7 days max
                ttl = await redis_client.ttl(key)
                if ttl < 0 or ttl > 7 * 24 * 3600:  # More than 7 days
                    await redis_client.delete(key)
        
        # Clear expired caches
        global user_presence_cache, conversation_cache, user_profile_cache
        user_presence_cache.expire()
        conversation_cache.expire()
        user_profile_cache.expire()
        
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

# Periodic tasks
async def periodic_tasks():
    """Run periodic maintenance tasks"""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            await cleanup_old_data()
        except Exception as e:
            logger.error(f"Periodic task error: {e}")

# Startup event
@router.on_event("startup")
async def startup_event():
    """Startup event handler"""
    asyncio.create_task(periodic_tasks())
    logger.info("Enhanced chat application started")

# Health check endpoint
@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check endpoint"""
    try:
        # Check MongoDB
        db_start = time.time()
        await db.command("ping")
        db_time = time.time() - db_start
        
        # Check Redis
        redis_healthy = False
        redis_time = 0
        if redis_client:
            redis_start = time.time()
            await redis_client.ping()
            redis_time = time.time() - redis_start
            redis_healthy = True
        
        # Check Storage
        storage_healthy = False
        storage_time = 0
        try:
            storage_start = time.time()
            test_content = b"test"
            test_id = storage_provider.upload(test_content, filename="health_check.txt", folder="temp")
            storage_provider.delete(test_id)
            storage_time = time.time() - storage_start
            storage_healthy = True
        except Exception as e:
            logger.error(f"Storage health check failed: {e}")
        
        # Get system stats
        active_connections = sum(len(conns) for conns in connection_manager.active_connections.values())
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "mongodb": {"healthy": True, "response_time_ms": round(db_time * 1000, 2)},
                "redis": {"healthy": redis_healthy, "response_time_ms": round(redis_time * 1000, 2)},
                "storage": {"healthy": storage_healthy, "response_time_ms": round(storage_time * 1000, 2)}
            },
            "metrics": {
                "active_connections": active_connections,
                "active_users": len(connection_manager.active_connections),
                "cache_sizes": {
                    "user_presence": len(user_presence_cache),
                    "conversation": len(conversation_cache),
                    "user_profile": len(user_profile_cache)
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")