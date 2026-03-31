# from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
# from bson import ObjectId
# from datetime import datetime, timedelta
# from typing import Dict, Any, List, Optional
# import logging
# from database import db, users_collection, posts_collection, collaborations_collection, subscriptions_collection
# from auth.utils import decode_access_token, oauth2_scheme
# from auth.routes import SubscriptionService

# # Setup logging
# logger = logging.getLogger(__name__)

# router = APIRouter(tags=["Admin"])

# # Constants
# ALLOWED_ROLES = ["brand", "influencer", "admin"]
# ALLOWED_STATUSES = ["active", "suspended", "banned"]
# SUBSCRIPTION_PLANS = ["free", "free_trial", "starter_monthly", "starter_yearly", "pro_monthly", "pro_yearly", "enterprise_monthly", "enterprise_yearly"]
# SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due", "canceled", "incomplete", "incomplete_expired"]

# # ==================== DEPENDENCIES & UTILITIES ====================

# async def verify_admin(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
#     """Verify if the user is an admin"""
#     try:
#         payload = decode_access_token(token)
#         if not payload:
#             raise HTTPException(status_code=401, detail="Invalid token")
        
#         user_id = ObjectId(payload["sub"])
#         user = users_collection.find_one({"_id": user_id})
        
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         if user.get("role") != "admin":
#             raise HTTPException(status_code=403, detail="Admin access required")
        
#         return user
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Admin verification error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# def to_str_oid(obj: Any) -> Any:
#     """Convert ObjectId to string in dict/list"""
#     if isinstance(obj, list):
#         return [to_str_oid(x) for x in obj]
#     if isinstance(obj, dict):
#         return {k: to_str_oid(v) for k, v in obj.items()}
#     if isinstance(obj, ObjectId):
#         return str(obj)
#     return obj

# def safe_objectid(id_str: str) -> ObjectId:
#     """Safely convert string to ObjectId"""
#     if not ObjectId.is_valid(id_str):
#         raise HTTPException(status_code=400, detail="Invalid ID format")
#     return ObjectId(id_str)

# def get_user_display_info(user: Dict[str, Any]) -> tuple[str, Optional[str]]:
#     """Extract display name and picture from user"""
#     if user.get("role") == "brand" and user.get("brand_profile"):
#         profile = user["brand_profile"]
#         name = profile.get("company_name", "Unknown Brand")
#         picture = profile.get("logo")
#     elif user.get("role") == "influencer" and user.get("influencer_profile"):
#         profile = user["influencer_profile"]
#         name = profile.get("nickname") or profile.get("full_name", "Unknown Influencer")
#         picture = profile.get("profile_picture")
#     else:
#         name = user.get("username", "Unknown User")
#         picture = None
    
#     return name, picture

# async def enrich_user_with_subscription(user: Dict[str, Any]) -> Dict[str, Any]:
#     """Enrich user data with subscription information and proper counts"""
#     try:
#         user_data = to_str_oid(user)
        
#         # Get subscription status
#         subscription_status = {}
#         try:
#             subscription_status = await SubscriptionService.get_user_subscription_status(user["email"])
#         except Exception as e:
#             logger.error(f"Error getting subscription status: {str(e)}")
#             subscription_status = {
#                 "has_active_subscription": False,
#                 "current_plan": "free",
#                 "is_trial_active": False,
#                 "error": "Failed to load subscription"
#             }
        
#         # Get subscription details
#         subscription_details = None
#         try:
#             subscription_details = subscriptions_collection.find_one({
#                 "user_email": user["email"],
#                 "status": {"$in": ["active", "trialing", "past_due"]}
#             }, sort=[("created_at", -1)])
#         except Exception as e:
#             logger.error(f"Error getting subscription details: {str(e)}")
        
#         # FIXED: Simple and reliable activity metrics calculation
#         activity_metrics = {}
#         try:
#             # Count posts for this specific user - simple and direct
#             post_count = posts_collection.count_documents({"user_id": user["_id"]})
            
#             # Count followers and following - handle all possible cases
#             followers = user.get("followers") or []
#             following = user.get("following") or []
            
#             # Ensure we're working with lists
#             if not isinstance(followers, list):
#                 followers = []
#             if not isinstance(following, list):
#                 following = []
            
#             followers_count = len(followers)
#             following_count = len(following)
            
#             # Calculate days metrics
#             created_at = user.get("created_at", datetime.utcnow())
#             last_login = user.get("last_login", created_at)
            
#             days_since_registration = (datetime.utcnow() - created_at).days
#             days_since_last_login = (datetime.utcnow() - last_login).days if user.get("last_login") else None
            
#             activity_metrics = {
#                 "post_count": post_count,
#                 "followers_count": followers_count,
#                 "following_count": following_count,
#                 "days_since_registration": days_since_registration,
#                 "days_since_last_login": days_since_last_login
#             }
            
#         except Exception as e:
#             logger.error(f"Error calculating metrics for user {user.get('_id')}: {str(e)}")
#             activity_metrics = {
#                 "post_count": 0,
#                 "followers_count": 0,
#                 "following_count": 0,
#                 "days_since_registration": 0,
#                 "days_since_last_login": None,
#                 "error": str(e)
#             }
        
#         user_data["subscription"] = {
#             **subscription_status,
#             "details": to_str_oid(subscription_details) if subscription_details else None
#         }
        
#         user_data["activity_metrics"] = activity_metrics
#         user_data["profile_completed"] = bool(
#             user.get("brand_profile") if user.get("role") == "brand" 
#             else user.get("influencer_profile") if user.get("role") == "influencer" 
#             else False
#         )
        
#         return user_data
        
#     except Exception as e:
#         logger.error(f"Error enriching user {user.get('_id')}: {str(e)}")
#         # Return basic user data with safe defaults
#         basic_data = to_str_oid(user)
#         basic_data["subscription"] = {"error": "Failed to load subscription data"}
#         basic_data["activity_metrics"] = {
#             "post_count": 0,
#             "followers_count": 0,
#             "following_count": 0,
#             "days_since_registration": 0,
#             "days_since_last_login": None
#         }
#         basic_data["profile_completed"] = False
#         return basic_data

# # ==================== USER MANAGEMENT ROUTES ====================

# @router.get("/users", response_model=Dict[str, Any])
# async def get_all_users(
#     admin: Dict[str, Any] = Depends(verify_admin),
#     role: Optional[str] = Query(None),
#     search: Optional[str] = Query(None),
#     status_filter: Optional[str] = Query(None, alias="status")
# ):
#     """Get all users with filtering (NO PAGINATION)"""
#     try:
#         # Build query
#         query = {}
#         if role and role in ALLOWED_ROLES:
#             query["role"] = role
#         if status_filter and status_filter in ALLOWED_STATUSES:
#             query["status"] = status_filter
#         if search:
#             query["$or"] = [
#                 {"email": {"$regex": search, "$options": "i"}},
#                 {"username": {"$regex": search, "$options": "i"}},
#                 {"brand_profile.company_name": {"$regex": search, "$options": "i"}},
#                 {"influencer_profile.full_name": {"$regex": search, "$options": "i"}},
#                 {"influencer_profile.nickname": {"$regex": search, "$options": "i"}}
#             ]
        
#         # Get all users without pagination
#         users = list(users_collection.find(query).sort("created_at", -1))
        
#         # Enrich users with subscription data
#         enriched_users = []
#         for user in users:
#             enriched_users.append(await enrich_user_with_subscription(user))
        
#         return {
#             "users": enriched_users,
#             "total": len(enriched_users)
#         }
        
#     except Exception as e:
#         logger.error(f"Get users error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving users")

# @router.get("/users/advanced", response_model=Dict[str, Any])
# async def get_all_users_advanced(
#     admin: Dict[str, Any] = Depends(verify_admin),
#     role: Optional[str] = Query(None),
#     search: Optional[str] = Query(None),
#     subscription_plan: Optional[str] = Query(None),
#     has_active_subscription: Optional[bool] = Query(None)
# ):
#     """Get all users with enhanced subscription information (NO PAGINATION)"""
#     try:
#         # Build base query for role and search
#         query = {}
        
#         if role and role in ALLOWED_ROLES:
#             query["role"] = role
        
#         if search:
#             query["$or"] = [
#                 {"email": {"$regex": search, "$options": "i"}},
#                 {"username": {"$regex": search, "$options": "i"}},
#                 {"brand_profile.company_name": {"$regex": search, "$options": "i"}},
#                 {"influencer_profile.full_name": {"$regex": search, "$options": "i"}},
#                 {"influencer_profile.nickname": {"$regex": search, "$options": "i"}}
#             ]
        
#         # Add subscription filters
#         if subscription_plan and subscription_plan != "all":
#             query["current_plan"] = subscription_plan
        
#         if has_active_subscription is not None:
#             query["has_active_subscription"] = has_active_subscription
        
#         # Get all users without pagination
#         users = list(users_collection.find(query).sort("created_at", -1))
        
#         # Enrich users with subscription data
#         enriched_users = []
#         for user in users:
#             try:
#                 user_data = await enrich_user_with_subscription(user)
#                 enriched_users.append(user_data)
#             except Exception as e:
#                 logger.error(f"Error enriching user {user.get('_id')}: {str(e)}")
#                 # Add basic user data if enrichment fails
#                 basic_user = to_str_oid(user)
#                 basic_user["subscription"] = {
#                     "has_active_subscription": False,
#                     "current_plan": "free",
#                     "is_trial_active": False,
#                     "error": "Failed to load subscription data"
#                 }
#                 basic_user["activity_metrics"] = {
#                     "post_count": 0,
#                     "followers_count": 0,
#                     "following_count": 0,
#                     "days_since_registration": 0,
#                     "days_since_last_login": None
#                 }
#                 basic_user["profile_completed"] = False
#                 enriched_users.append(basic_user)
        
#         # Subscription statistics for the current filter
#         subscription_stats = []
#         try:
#             subscription_stats = list(users_collection.aggregate([
#                 {"$match": query},
#                 {"$group": {
#                     "_id": "$current_plan",
#                     "count": {"$sum": 1},
#                     "active_subscriptions": {"$sum": {"$cond": [{"$eq": ["$has_active_subscription", True]}, 1, 0]}},
#                     "trial_users": {"$sum": {"$cond": [{"$eq": ["$is_trial_active", True]}, 1, 0]}}
#                 }}
#             ]))
#         except Exception as e:
#             logger.error(f"Error calculating subscription stats: {str(e)}")
        
#         return {
#             "users": enriched_users,
#             "total": len(enriched_users),
#             "subscription_stats": to_str_oid(subscription_stats),
#             "filters": {
#                 "role": role,
#                 "search": search,
#                 "subscription_plan": subscription_plan,
#                 "has_active_subscription": has_active_subscription
#             }
#         }
        
#     except Exception as e:
#         logger.error(f"Get users advanced error: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

# @router.get("/users/{user_id}", response_model=Dict[str, Any])
# async def get_user_details(user_id: str, admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get detailed user information"""
#     try:
#         uid = safe_objectid(user_id)
#         user = users_collection.find_one({"_id": uid})
        
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Get user's posts for engagement metrics
#         user_posts = list(posts_collection.find({"user_id": uid}))
        
#         total_likes = sum(len(post.get("likes", [])) for post in user_posts)
#         total_comments = sum(len(post.get("comments", [])) for post in user_posts)
#         total_views = sum(len(post.get("views", [])) for post in user_posts)
        
#         # Get subscription history
#         subscription_history = list(subscriptions_collection.find({
#             "user_email": user["email"]
#         }).sort("created_at", -1))
        
#         # Enrich user data
#         user_data = await enrich_user_with_subscription(user)
#         user_data["engagement_metrics"] = {
#             "total_posts": len(user_posts),
#             "total_likes": total_likes,
#             "total_comments": total_comments,
#             "total_views": total_views,
#             "average_engagement": round((total_likes + total_comments + total_views) / max(len(user_posts), 1), 2)
#         }
#         user_data["subscription_history"] = to_str_oid(subscription_history)
        
#         return user_data
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Get user details error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving user details")

# @router.get("/users/{user_id}/complete", response_model=Dict[str, Any])
# async def get_user_complete_details(user_id: str, admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get complete user information including posts and detailed analytics"""
#     try:
#         uid = safe_objectid(user_id)
#         user = users_collection.find_one({"_id": uid})
        
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Get user's posts with full details
#         user_posts = list(posts_collection.find({"user_id": uid}).sort("created_at", -1).limit(50))
        
#         # Calculate detailed engagement metrics with proper error handling
#         total_likes = 0
#         total_comments = 0
#         total_views = 0
        
#         for post in user_posts:
#             # Handle likes count - check both formats (list of user_ids or list of dicts)
#             likes = post.get("likes", [])
#             if likes and isinstance(likes, list):
#                 if isinstance(likes[0], dict):
#                     total_likes += len(likes)
#                 else:
#                     total_likes += len(likes)
            
#             # Handle comments count
#             comments = post.get("comments", [])
#             if comments and isinstance(comments, list):
#                 total_comments += len(comments)
            
#             # Handle views count
#             views = post.get("views", [])
#             if views and isinstance(views, list):
#                 total_views += len(views)
        
#         # Get subscription history
#         subscription_history = list(subscriptions_collection.find({
#             "user_email": user["email"]
#         }).sort("created_at", -1))
        
#         # Get current subscription status
#         current_subscription = await SubscriptionService.get_user_subscription_status(user["email"])
        
#         # Enrich user data
#         user_data = await enrich_user_with_subscription(user)
        
#         # Add detailed posts information
#         user_data["posts"] = {
#             "recent_posts": to_str_oid(user_posts),
#             "engagement_metrics": {
#                 "total_posts": len(user_posts),
#                 "total_likes": total_likes,
#                 "total_comments": total_comments,
#                 "total_views": total_views,
#                 "average_engagement_per_post": round(
#                     (total_likes + total_comments + total_views) / max(len(user_posts), 1), 2
#                 )
#             }
#         }
        
#         user_data["subscription_history"] = to_str_oid(subscription_history)
#         user_data["current_subscription"] = current_subscription
        
#         return user_data
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Get user complete details error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving user complete details")

# @router.post("/users", response_model=Dict[str, Any])
# async def create_user(
#     user_data: Dict[str, Any],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Create a new user (admin only)"""
#     try:
#         # Validate required fields
#         required_fields = ["email", "username", "role"]
#         for field in required_fields:
#             if field not in user_data:
#                 raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
#         if user_data["role"] not in ALLOWED_ROLES:
#             raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(ALLOWED_ROLES)}")
        
#         # Check if user already exists
#         existing_user = users_collection.find_one({"email": user_data["email"]})
#         if existing_user:
#             raise HTTPException(status_code=400, detail="User with this email already exists")
        
#         # Create user document
#         new_user = {
#             "email": user_data["email"],
#             "username": user_data["username"],
#             "role": user_data["role"],
#             "status": user_data.get("status", "active"),
#             "created_at": datetime.utcnow(),
#             "updated_at": datetime.utcnow(),
#             "created_by_admin": str(admin["_id"])
#         }
        
#         # Add profile data based on role
#         if user_data["role"] == "brand" and "brand_profile" in user_data:
#             new_user["brand_profile"] = user_data["brand_profile"]
#         elif user_data["role"] == "influencer" and "influencer_profile" in user_data:
#             new_user["influencer_profile"] = user_data["influencer_profile"]
        
#         result = users_collection.insert_one(new_user)
        
#         logger.info(f"Admin {admin['email']} created user {user_data['email']}")
#         return {
#             "message": "User created successfully",
#             "user_id": str(result.inserted_id)
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Create user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error creating user")

# @router.put("/users/{user_id}", response_model=Dict[str, Any])
# async def update_user(
#     user_id: str,
#     update_data: Dict[str, Any],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Update user information"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Remove protected fields
#         protected_fields = ["_id", "email", "password", "created_at"]
#         for field in protected_fields:
#             update_data.pop(field, None)
        
#         # Validate role if provided
#         if "role" in update_data and update_data["role"] not in ALLOWED_ROLES:
#             raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(ALLOWED_ROLES)}")
        
#         # Validate status if provided
#         if "status" in update_data and update_data["status"] not in ALLOWED_STATUSES:
#             raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(ALLOWED_STATUSES)}")
        
#         update_data["updated_at"] = datetime.utcnow()
        
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": update_data}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} updated user {user_id}")
#         return {"message": "User updated successfully"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Update user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error updating user")

# @router.put("/users/{user_id}/role", response_model=Dict[str, Any])
# async def update_user_role(
#     user_id: str,
#     role_data: Dict[str, str],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Update user role"""
#     try:
#         new_role = role_data.get("role")
#         if not new_role:
#             raise HTTPException(status_code=400, detail="Role is required")
        
#         if new_role not in ALLOWED_ROLES:
#             raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(ALLOWED_ROLES)}")
        
#         uid = safe_objectid(user_id)
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "role": new_role,
#                 "updated_at": datetime.utcnow(),
#                 "role_updated_by": str(admin["_id"]),
#                 "role_updated_at": datetime.utcnow()
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} updated user {user_id} role to {new_role}")
#         return {"message": f"User role updated to {new_role}"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Update user role error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error updating user role")

# @router.put("/users/{user_id}/status", response_model=Dict[str, Any])
# async def update_user_status(
#     user_id: str,
#     status_data: Dict[str, str],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Update user status"""
#     try:
#         new_status = status_data.get("status")
#         if not new_status:
#             raise HTTPException(status_code=400, detail="Status is required")
        
#         if new_status not in ALLOWED_STATUSES:
#             raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(ALLOWED_STATUSES)}")
        
#         uid = safe_objectid(user_id)
        
#         # Prevent admin from modifying their own status
#         if str(uid) == str(admin["_id"]):
#             raise HTTPException(status_code=400, detail="Cannot modify your own status")
        
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "status": new_status,
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow()
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} updated user {user_id} status to {new_status}")
#         return {"message": f"User status updated to {new_status}"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Update user status error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error updating user status")

# @router.delete("/users/{user_id}", response_model=Dict[str, Any])
# async def delete_user(
#     user_id: str,
#     background_tasks: BackgroundTasks,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Delete user and associated data"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Prevent admin from deleting themselves
#         if str(uid) == str(admin["_id"]):
#             raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
#         async def cleanup_user_data(user_oid: ObjectId, user_email: str):
#             """Background task to clean up user data"""
#             try:
#                 # Delete user's posts
#                 posts_collection.delete_many({"user_id": user_oid})
                
#                 # Delete user's subscriptions
#                 subscriptions_collection.delete_many({"user_email": user_email})
                
#                 # Remove user from followers/following
#                 users_collection.update_many(
#                     {"followers": user_oid},
#                     {"$pull": {"followers": user_oid}}
#                 )
#                 users_collection.update_many(
#                     {"following": user_oid},
#                     {"$pull": {"following": user_oid}}
#                 )
                
#                 # Remove user interactions from posts
#                 posts_collection.update_many(
#                     {},
#                     {
#                         "$pull": {
#                             "likes": {"user_id": user_oid},
#                             "comments": {"user_id": user_oid},
#                             "views": {"user_id": user_oid}
#                         }
#                     }
#                 )
                
#                 logger.info(f"Cleaned up data for user {user_email}")
                
#             except Exception as e:
#                 logger.error(f"Error cleaning up user data: {str(e)}")
        
#         # Add background cleanup task
#         background_tasks.add_task(cleanup_user_data, uid, user.get("email", "unknown"))
        
#         # Delete user
#         result = users_collection.delete_one({"_id": uid})
        
#         logger.info(f"Admin {admin['email']} deleted user {user.get('email')}")
#         return {"message": "User and associated data scheduled for deletion"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Delete user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error deleting user")

# @router.get("/users/{user_id}/subscriptions", response_model=Dict[str, Any])
# async def get_user_subscriptions(
#     user_id: str,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Get user's subscription history"""
#     try:
#         uid = safe_objectid(user_id)
#         user = users_collection.find_one({"_id": uid})
        
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         subscriptions = list(subscriptions_collection.find({
#             "user_email": user["email"]
#         }).sort("created_at", -1))
        
#         current_status = await SubscriptionService.get_user_subscription_status(user["email"])
        
#         return {
#             "user": {
#                 "id": str(user["_id"]),
#                 "email": user["email"],
#                 "username": user.get("username"),
#                 "role": user.get("role")
#             },
#             "current_subscription": current_status,
#             "subscription_history": to_str_oid(subscriptions),
#             "total_subscriptions": len(subscriptions)
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Get user subscriptions error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving user subscriptions")

# # ==================== SUBSCRIPTION MANAGEMENT ROUTES ====================

# @router.get("/subscriptions", response_model=Dict[str, Any])
# async def get_all_subscriptions(
#     admin: Dict[str, Any] = Depends(verify_admin),
#     plan: Optional[str] = Query(None),
#     status: Optional[str] = Query(None)
# ):
#     """Get all subscriptions with filtering (NO PAGINATION)"""
#     try:
#         query = {}
#         if plan and plan in SUBSCRIPTION_PLANS:
#             query["plan"] = plan
#         if status and status in SUBSCRIPTION_STATUSES:
#             query["status"] = status
        
#         # Get all subscriptions without pagination
#         subscriptions = list(subscriptions_collection.find(query).sort("created_at", -1))
        
#         # Enrich with user info
#         enriched_subscriptions = []
#         for subscription in subscriptions:
#             sub_data = to_str_oid(subscription)
            
#             user = users_collection.find_one({"email": subscription["user_email"]})
#             if user:
#                 name, picture = get_user_display_info(user)
#                 sub_data["user"] = {
#                     "id": str(user["_id"]),
#                     "name": name,
#                     "email": user["email"],
#                     "role": user.get("role"),
#                     "profile_picture": picture
#                 }
            
#             enriched_subscriptions.append(sub_data)
        
#         return {
#             "subscriptions": enriched_subscriptions,
#             "total": len(enriched_subscriptions)
#         }
        
#     except Exception as e:
#         logger.error(f"Get subscriptions error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving subscriptions")

# @router.get("/subscriptions/overview", response_model=Dict[str, Any])
# async def get_subscriptions_overview(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get comprehensive subscription overview"""
#     try:
#         # Subscription counts by plan
#         plan_counts = list(subscriptions_collection.aggregate([
#             {"$match": {"status": {"$in": ["active", "trialing"]}}},
#             {"$group": {
#                 "_id": "$plan",
#                 "count": {"$sum": 1},
#                 "trialing": {"$sum": {"$cond": [{"$eq": ["$status", "trialing"]}, 1, 0]}},
#                 "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}}
#             }},
#             {"$sort": {"count": -1}}
#         ]))
        
#         # Total subscription metrics
#         total_metrics = list(subscriptions_collection.aggregate([
#             {"$group": {
#                 "_id": None,
#                 "total_subscriptions": {"$sum": 1},
#                 "active_subscriptions": {"$sum": {"$cond": [{"$in": ["$status", ["active", "trialing"]]}, 1, 0]}},
#                 "trial_subscriptions": {"$sum": {"$cond": [{"$eq": ["$is_trial", True]}, 1, 0]}},
#                 "paid_subscriptions": {"$sum": {"$cond": [
#                     {"$and": [
#                         {"$in": ["$status", ["active", "trialing"]]},
#                         {"$ne": ["$plan", "free_trial"]},
#                         {"$ne": ["$plan", "free"]}
#                     ]}, 1, 0]
#                 }}
#             }}
#         ]))
        
#         # Recent subscription activity (last 10)
#         recent_subscriptions = list(subscriptions_collection.find()
#                                    .sort("created_at", -1)
#                                    .limit(10))
        
#         # Expiring trials and subscriptions
#         expiring_soon = list(subscriptions_collection.find({
#             "$or": [
#                 {"trial_end": {"$lte": datetime.utcnow() + timedelta(days=7), "$gte": datetime.utcnow()}},
#                 {"current_period_end": {"$lte": datetime.utcnow() + timedelta(days=7), "$gte": datetime.utcnow()}}
#             ],
#             "status": {"$in": ["active", "trialing"]}
#         }))
        
#         return {
#             "plan_distribution": to_str_oid(plan_counts),
#             "total_metrics": total_metrics[0] if total_metrics else {},
#             "recent_subscriptions": to_str_oid(recent_subscriptions),
#             "expiring_soon": {
#                 "count": len(expiring_soon),
#                 "subscriptions": to_str_oid(expiring_soon)
#             },
#             "summary": {
#                 "total_users": users_collection.count_documents({}),
#                 "users_with_subscriptions": users_collection.count_documents({
#                     "has_active_subscription": True
#                 }),
#                 "free_users": users_collection.count_documents({
#                     "current_plan": "free"
#                 })
#             }
#         }
        
#     except Exception as e:
#         logger.error(f"Subscription overview error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error generating subscription overview")

# @router.put("/subscriptions/{subscription_id}/status", response_model=Dict[str, Any])
# async def update_subscription_status(
#     subscription_id: str,
#     status_data: Dict[str, str],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Update subscription status"""
#     try:
#         new_status = status_data.get("status")
#         if not new_status:
#             raise HTTPException(status_code=400, detail="Status is required")
        
#         if new_status not in SUBSCRIPTION_STATUSES:
#             raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(SUBSCRIPTION_STATUSES)}")
        
#         sid = safe_objectid(subscription_id)
        
#         update_data = {
#             "status": new_status,
#             "updated_at": datetime.utcnow(),
#             "admin_updated_by": str(admin["_id"])
#         }
        
#         if new_status == "canceled":
#             update_data["canceled_at"] = datetime.utcnow()
        
#         result = subscriptions_collection.update_one(
#             {"_id": sid},
#             {"$set": update_data}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="Subscription not found")
        
#         # Sync user subscription cache
#         subscription = subscriptions_collection.find_one({"_id": sid})
#         if subscription:
#             await SubscriptionService.sync_user_subscription(subscription["user_email"])
        
#         logger.info(f"Admin {admin['email']} updated subscription {subscription_id} to {new_status}")
#         return {"message": f"Subscription status updated to {new_status}"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Update subscription status error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error updating subscription status")

# @router.post("/users/{user_id}/trial", response_model=Dict[str, Any])
# async def grant_trial_subscription(
#     user_id: str,
#     trial_data: Dict[str, Any],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Grant trial subscription to user"""
#     try:
#         days = trial_data.get("days", 15)
#         if not isinstance(days, int) or days <= 0:
#             raise HTTPException(status_code=400, detail="Days must be a positive integer")
        
#         uid = safe_objectid(user_id)
#         user = users_collection.find_one({"_id": uid})
        
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         now = datetime.utcnow()
#         trial_end = now + timedelta(days=days)
        
#         # Cancel any existing trials
#         subscriptions_collection.update_many(
#             {
#                 "user_email": user["email"],
#                 "plan": "free_trial"
#             },
#             {"$set": {"status": "canceled", "updated_at": now}}
#         )
        
#         # Create new trial
#         trial_subscription = {
#             "user_id": str(user["_id"]),
#             "user_email": user["email"],
#             "plan": "free_trial",
#             "status": "active",
#             "is_trial": True,
#             "current_period_start": now,
#             "current_period_end": trial_end,
#             "trial_start": now,
#             "trial_end": trial_end,
#             "admin_granted_by": str(admin["_id"]),
#             "created_at": now,
#             "updated_at": now
#         }
        
#         result = subscriptions_collection.insert_one(trial_subscription)
        
#         # Update user subscription data
#         await SubscriptionService._update_user_subscription_data(
#             user_id=str(user["_id"]),
#             plan="free_trial",
#             has_active_subscription=True,
#             is_trial_active=True,
#             period_start=now,
#             period_end=trial_end
#         )
        
#         logger.info(f"Admin {admin['email']} granted {days}-day trial to {user['email']}")
#         return {
#             "message": f"{days}-day trial granted successfully",
#             "trial_end": trial_end,
#             "subscription_id": str(result.inserted_id)
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Grant trial error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error granting trial subscription")

# # ==================== POST MANAGEMENT ====================

# @router.get("/posts", response_model=Dict[str, Any])
# async def get_all_posts(
#     admin: Dict[str, Any] = Depends(verify_admin),
#     user_id: Optional[str] = Query(None)
# ):
#     """Get all posts with filtering (NO PAGINATION)"""
#     try:
#         query = {}
#         if user_id:
#             query["user_id"] = safe_objectid(user_id)
        
#         # Get all posts without pagination
#         posts = list(posts_collection.find(query).sort("created_at", -1))
        
#         # Enrich with user info
#         enriched_posts = []
#         for post in posts:
#             post_data = to_str_oid(post)
#             user = users_collection.find_one({"_id": post["user_id"]})
#             if user:
#                 name, picture = get_user_display_info(user)
#                 post_data["author"] = {
#                     "id": str(user["_id"]),
#                     "name": name,
#                     "email": user.get("email"),
#                     "profile_picture": picture
#                 }
            
#             post_data["engagement"] = {
#                 "likes": len(post.get("likes", [])),
#                 "comments": len(post.get("comments", [])),
#                 "views": len(post.get("views", []))
#             }
            
#             enriched_posts.append(post_data)
        
#         return {
#             "posts": enriched_posts,
#             "total": len(enriched_posts)
#         }
        
#     except Exception as e:
#         logger.error(f"Get posts error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving posts")

# @router.delete("/posts/{post_id}", response_model=Dict[str, Any])
# async def delete_post(post_id: str, admin: Dict[str, Any] = Depends(verify_admin)):
#     """Delete a post"""
#     try:
#         pid = safe_objectid(post_id)
#         result = posts_collection.delete_one({"_id": pid})
        
#         if result.deleted_count == 0:
#             raise HTTPException(status_code=404, detail="Post not found")
        
#         logger.info(f"Admin {admin['email']} deleted post {post_id}")
#         return {"message": "Post deleted successfully"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Delete post error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error deleting post")

# # ==================== DASHBOARD & ANALYTICS ====================

# @router.get("/dashboard", response_model=Dict[str, Any])
# async def get_admin_dashboard(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get admin dashboard overview"""
#     try:
#         # User statistics
#         total_users = users_collection.count_documents({})
#         brand_users = users_collection.count_documents({"role": "brand"})
#         influencer_users = users_collection.count_documents({"role": "influencer"})
#         admin_users = users_collection.count_documents({"role": "admin"})
        
#         # Subscription statistics
#         subscription_stats = list(users_collection.aggregate([
#             {"$group": {
#                 "_id": None,
#                 "active_subscriptions": {"$sum": {"$cond": [{"$eq": ["$has_active_subscription", True]}, 1, 0]}},
#                 "trial_users": {"$sum": {"$cond": [{"$eq": ["$is_trial_active", True]}, 1, 0]}},
#                 "free_users": {"$sum": {"$cond": [{"$eq": ["$current_plan", "free"]}, 1, 0]}}
#             }}
#         ]))
        
#         # Post statistics
#         total_posts = posts_collection.count_documents({})
#         posts_last_24h = posts_collection.count_documents({
#             "created_at": {"$gte": datetime.utcnow() - timedelta(hours=24)}
#         })
        
#         # Collaboration statistics
#         total_collaborations = collaborations_collection.count_documents({})
#         active_collaborations = collaborations_collection.count_documents({"status": "active"})
        
#         # Engagement statistics
#         engagement_result = list(posts_collection.aggregate([
#             {"$group": {
#                 "_id": None,
#                 "total_likes": {"$sum": {"$size": {"$ifNull": ["$likes", []]}}},
#                 "total_comments": {"$sum": {"$size": {"$ifNull": ["$comments", []]}}},
#                 "total_views": {"$sum": {"$size": {"$ifNull": ["$views", []]}}}
#             }}
#         ]))
        
#         engagement_data = engagement_result[0] if engagement_result else {
#             "total_likes": 0, "total_comments": 0, "total_views": 0
#         }
        
#         # Recent activity
#         week_ago = datetime.utcnow() - timedelta(days=7)
#         new_users_week = users_collection.count_documents({"created_at": {"$gte": week_ago}})
#         new_posts_week = posts_collection.count_documents({"created_at": {"$gte": week_ago}})
        
#         sub_stats = subscription_stats[0] if subscription_stats else {}
        
#         return {
#             "platform_overview": {
#                 "total_users": total_users,
#                 "brands": brand_users,
#                 "influencers": influencer_users,
#                 "admins": admin_users,
#                 "total_posts": total_posts,
#                 "total_collaborations": total_collaborations,
#                 "active_collaborations": active_collaborations
#             },
#             "subscription_analytics": {
#                 "active_subscriptions": sub_stats.get("active_subscriptions", 0),
#                 "trial_users": sub_stats.get("trial_users", 0),
#                 "free_users": sub_stats.get("free_users", 0)
#             },
#             "engagement_metrics": {
#                 "total_likes": engagement_data["total_likes"],
#                 "total_comments": engagement_data["total_comments"],
#                 "total_views": engagement_data["total_views"]
#             },
#             "recent_activity": {
#                 "last_24h_posts": posts_last_24h,
#                 "last_7d_users": new_users_week,
#                 "last_7d_posts": new_posts_week
#             }
#         }
        
#     except Exception as e:
#         logger.error(f"Dashboard error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error generating dashboard")

# # ==================== SYSTEM MAINTENANCE ====================

# @router.post("/maintenance/cleanup", response_model=Dict[str, Any])
# async def run_system_cleanup(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Run system cleanup tasks"""
#     try:
#         cleanup_report = {}
        
#         # Clean up orphaned posts
#         all_users = users_collection.distinct("_id")
#         orphaned_posts = posts_collection.delete_many({"user_id": {"$nin": all_users}})
#         cleanup_report["orphaned_posts"] = orphaned_posts.deleted_count
        
#         # Clean up old posts (1 year+)
#         one_year_ago = datetime.utcnow() - timedelta(days=365)
#         old_posts = posts_collection.delete_many({"created_at": {"$lt": one_year_ago}})
#         cleanup_report["old_posts"] = old_posts.deleted_count
        
#         # Clean up inactive users (never logged in, 30+ days old)
#         inactive_users = users_collection.delete_many({
#             "last_login": {"$exists": False},
#             "created_at": {"$lt": datetime.utcnow() - timedelta(days=30)}
#         })
#         cleanup_report["inactive_users"] = inactive_users.deleted_count
        
#         logger.info(f"Admin {admin['email']} ran cleanup: {cleanup_report}")
#         return {
#             "message": "System cleanup completed",
#             "report": cleanup_report
#         }
        
#     except Exception as e:
#         logger.error(f"Cleanup error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error running cleanup")

# @router.post("/subscriptions/maintenance/sync", response_model=Dict[str, Any])
# async def sync_all_subscriptions(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Sync all subscriptions with Stripe"""
#     try:
#         users = users_collection.find({"email": {"$exists": True}})
#         sync_report = {
#             "total_users": 0,
#             "successful": 0,
#             "failed": 0,
#             "errors": []
#         }
        
#         for user in users:
#             try:
#                 await SubscriptionService.sync_user_subscription(user["email"])
#                 sync_report["successful"] += 1
#             except Exception as e:
#                 sync_report["failed"] += 1
#                 sync_report["errors"].append({
#                     "user_email": user["email"],
#                     "error": str(e)
#                 })
#             finally:
#                 sync_report["total_users"] += 1
        
#         logger.info(f"Admin {admin['email']} synced subscriptions: {sync_report}")
#         return {
#             "message": "Subscription sync completed",
#             "report": sync_report
#         }
        
#     except Exception as e:
#         logger.error(f"Subscription sync error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error syncing subscriptions")

# # ==================== ADMIN MANAGEMENT ====================

# @router.post("/admins", response_model=Dict[str, Any])
# async def create_admin_user(
#     admin_data: Dict[str, str],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Promote user to admin"""
#     try:
#         user_email = admin_data.get("email")
#         if not user_email:
#             raise HTTPException(status_code=400, detail="Email is required")
        
#         result = users_collection.update_one(
#             {"email": user_email},
#             {"$set": {
#                 "role": "admin",
#                 "updated_at": datetime.utcnow(),
#                 "admin_promoted_by": str(admin["_id"])
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} promoted {user_email} to admin")
#         return {"message": f"User {user_email} promoted to admin"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Create admin error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error creating admin")

# @router.get("/admins", response_model=List[Dict[str, Any]])
# async def get_all_admins(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get all admin users"""
#     try:
#         admins = list(users_collection.find(
#             {"role": "admin"},
#             {"password": 0, "reset_otp": 0}
#         ))
#         return to_str_oid(admins)
        
#     except Exception as e:
#         logger.error(f"Get admins error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving admins")
    
    
# # ==================== USER STATUS MANAGEMENT ROUTES ====================

# @router.put("/users/{user_id}/suspend", response_model=Dict[str, Any])
# async def suspend_user(
#     user_id: str,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Suspend a user account"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Prevent admin from suspending themselves
#         if str(uid) == str(admin["_id"]):
#             raise HTTPException(status_code=400, detail="Cannot suspend your own account")
        
#         # Update user status to suspended
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "status": "suspended",
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow(),
#                 "suspended_at": datetime.utcnow()
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} suspended user {user['email']} (ID: {user_id})")
#         return {
#             "message": "User suspended successfully",
#             "user_id": user_id,
#             "email": user["email"],
#             "status": "suspended"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Suspend user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error suspending user")

# @router.put("/users/{user_id}/activate", response_model=Dict[str, Any])
# async def activate_user(
#     user_id: str,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Activate a suspended user account"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Update user status to active
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "status": "active",
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow(),
#                 "activated_at": datetime.utcnow()
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} activated user {user['email']} (ID: {user_id})")
#         return {
#             "message": "User activated successfully",
#             "user_id": user_id,
#             "email": user["email"],
#             "status": "active"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Activate user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error activating user")

# @router.put("/users/{user_id}/ban", response_model=Dict[str, Any])
# async def ban_user(
#     user_id: str,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Ban a user account (permanent suspension)"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Prevent admin from banning themselves
#         if str(uid) == str(admin["_id"]):
#             raise HTTPException(status_code=400, detail="Cannot ban your own account")
        
#         # Update user status to banned
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "status": "banned",
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow(),
#                 "banned_at": datetime.utcnow(),
#                 "banned_by": str(admin["_id"])
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} banned user {user['email']} (ID: {user_id})")
#         return {
#             "message": "User banned successfully",
#             "user_id": user_id,
#             "email": user["email"],
#             "status": "banned"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Ban user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error banning user")

# @router.put("/users/{user_id}/unban", response_model=Dict[str, Any])
# async def unban_user(
#     user_id: str,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Unban a user account"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Update user status to active
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "status": "active",
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow(),
#                 "unbanned_at": datetime.utcnow(),
#                 "unbanned_by": str(admin["_id"])
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} unbanned user {user['email']} (ID: {user_id})")
#         return {
#             "message": "User unbanned successfully",
#             "user_id": user_id,
#             "email": user["email"],
#             "status": "active"
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Unban user error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error unbanning user")

# @router.post("/users/{user_id}/force-logout", response_model=Dict[str, Any])
# async def force_user_logout(
#     user_id: str,
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Force logout a user by invalidating their tokens"""
#     try:
#         uid = safe_objectid(user_id)
        
#         # Check if user exists
#         user = users_collection.find_one({"_id": uid})
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Update token version to invalidate all existing tokens
#         current_token_version = user.get("token_version", 0)
#         result = users_collection.update_one(
#             {"_id": uid},
#             {"$set": {
#                 "token_version": current_token_version + 1,
#                 "updated_at": datetime.utcnow(),
#                 "force_logged_out_at": datetime.utcnow(),
#                 "force_logged_out_by": str(admin["_id"])
#             }}
#         )
        
#         if result.matched_count == 0:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         logger.info(f"Admin {admin['email']} forced logout for user {user['email']} (ID: {user_id})")
#         return {
#             "message": "User forced logout successfully",
#             "user_id": user_id,
#             "email": user["email"],
#             "token_version": current_token_version + 1
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Force logout error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error forcing user logout")

# # ==================== BULK USER MANAGEMENT ROUTES ====================

# @router.post("/users/bulk/suspend", response_model=Dict[str, Any])
# async def bulk_suspend_users(
#     user_ids: List[str],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Suspend multiple users at once"""
#     try:
#         # Convert string IDs to ObjectIds
#         user_object_ids = []
#         invalid_ids = []
        
#         for user_id in user_ids:
#             if ObjectId.is_valid(user_id):
#                 user_object_ids.append(ObjectId(user_id))
#             else:
#                 invalid_ids.append(user_id)
        
#         if invalid_ids:
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Invalid user IDs: {invalid_ids}"
#             )
        
#         # Remove admin's own ID from the list
#         user_object_ids = [uid for uid in user_object_ids if str(uid) != str(admin["_id"])]
        
#         if not user_object_ids:
#             raise HTTPException(
#                 status_code=400, 
#                 detail="No valid users to suspend (excluding your own account)"
#             )
        
#         # Bulk update users
#         result = users_collection.update_many(
#             {"_id": {"$in": user_object_ids}},
#             {"$set": {
#                 "status": "suspended",
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow(),
#                 "suspended_at": datetime.utcnow()
#             }}
#         )
        
#         # Get affected users for logging
#         affected_users = list(users_collection.find(
#             {"_id": {"$in": user_object_ids}},
#             {"email": 1}
#         ))
        
#         affected_emails = [user["email"] for user in affected_users]
        
#         logger.info(f"Admin {admin['email']} bulk suspended {result.modified_count} users: {affected_emails}")
        
#         return {
#             "message": f"Successfully suspended {result.modified_count} users",
#             "suspended_count": result.modified_count,
#             "affected_users": affected_emails
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Bulk suspend users error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error bulk suspending users")

# @router.post("/users/bulk/activate", response_model=Dict[str, Any])
# async def bulk_activate_users(
#     user_ids: List[str],
#     admin: Dict[str, Any] = Depends(verify_admin)
# ):
#     """Activate multiple users at once"""
#     try:
#         # Convert string IDs to ObjectIds
#         user_object_ids = []
#         invalid_ids = []
        
#         for user_id in user_ids:
#             if ObjectId.is_valid(user_id):
#                 user_object_ids.append(ObjectId(user_id))
#             else:
#                 invalid_ids.append(user_id)
        
#         if invalid_ids:
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Invalid user IDs: {invalid_ids}"
#             )
        
#         # Bulk update users
#         result = users_collection.update_many(
#             {"_id": {"$in": user_object_ids}},
#             {"$set": {
#                 "status": "active",
#                 "updated_at": datetime.utcnow(),
#                 "status_updated_by": str(admin["_id"]),
#                 "status_updated_at": datetime.utcnow(),
#                 "activated_at": datetime.utcnow()
#             }}
#         )
        
#         # Get affected users for logging
#         affected_users = list(users_collection.find(
#             {"_id": {"$in": user_object_ids}},
#             {"email": 1}
#         ))
        
#         affected_emails = [user["email"] for user in affected_users]
        
#         logger.info(f"Admin {admin['email']} bulk activated {result.modified_count} users: {affected_emails}")
        
#         return {
#             "message": f"Successfully activated {result.modified_count} users",
#             "activated_count": result.modified_count,
#             "affected_users": affected_emails
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Bulk activate users error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error bulk activating users")

# # ==================== USER STATUS ANALYTICS ====================

# @router.get("/users/status/stats", response_model=Dict[str, Any])
# async def get_user_status_statistics(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get statistics about user statuses"""
#     try:
#         # Aggregate user counts by status
#         status_stats = list(users_collection.aggregate([
#             {
#                 "$group": {
#                     "_id": "$status",
#                     "count": {"$sum": 1},
#                     "roles": {
#                         "$push": {
#                             "role": "$role",
#                             "email": "$email"
#                         }
#                     }
#                 }
#             },
#             {
#                 "$project": {
#                     "status": "$_id",
#                     "count": 1,
#                     "role_breakdown": {
#                         "$arrayToObject": {
#                             "$map": {
#                                 "input": "$roles",
#                                 "as": "role",
#                                 "in": {
#                                     "k": "$$role.role",
#                                     "v": "$$role.email"
#                                 }
#                             }
#                         }
#                     },
#                     "_id": 0
#                 }
#             }
#         ]))
        
#         # Calculate total users
#         total_users = users_collection.count_documents({})
        
#         # Get recently suspended users (last 7 days)
#         recent_suspended = list(users_collection.find(
#             {
#                 "status": "suspended",
#                 "suspended_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
#             },
#             {"email": 1, "suspended_at": 1, "status_updated_by": 1}
#         ).sort("suspended_at", -1).limit(10))
        
#         # Get recently activated users (last 7 days)
#         recent_activated = list(users_collection.find(
#             {
#                 "status": "active",
#                 "activated_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
#             },
#             {"email": 1, "activated_at": 1, "status_updated_by": 1}
#         ).sort("activated_at", -1).limit(10))
        
#         return {
#             "total_users": total_users,
#             "status_distribution": to_str_oid(status_stats),
#             "recent_activity": {
#                 "suspended_last_7_days": to_str_oid(recent_suspended),
#                 "activated_last_7_days": to_str_oid(recent_activated)
#             },
#             "summary": {
#                 "active_count": next((stat["count"] for stat in status_stats if stat["status"] == "active"), 0),
#                 "suspended_count": next((stat["count"] for stat in status_stats if stat["status"] == "suspended"), 0),
#                 "banned_count": next((stat["count"] for stat in status_stats if stat["status"] == "banned"), 0)
#             }
#         }
        
#     except Exception as e:
#         logger.error(f"Get user status statistics error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving user status statistics")
    
# @router.get("/users/brands", response_model=List[Dict[str, Any]])
# async def list_brands(admin: Dict[str, Any] = Depends(verify_admin)):
#     """Get all brand users"""
#     try:
#         brands = list(users_collection.find({"role": "brand"}).sort("created_at", -1))
        
#         result = []
#         for u in brands:
#             result.append({
#                 "id": str(u["_id"]),
#                 "email": u.get("email"),
#                 "username": u.get("username"),
#                 "company_name": u.get("brand_profile", {}).get("company_name"),
#                 "logo": u.get("brand_profile", {}).get("logo"),
#                 "status": u.get("status", "active"),
#                 "created_at": u.get("created_at"),
#             })
        
#         return result

#     except Exception as e:
#         logger.error(f"List brands error: {str(e)}")
#         raise HTTPException(status_code=500, detail="Error retrieving brand users")


from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging
from database import db, users_collection, posts_collection, collaborations_collection, subscriptions_collection
from auth.utils import decode_access_token, oauth2_scheme
from auth.routes import SubscriptionService
from functools import lru_cache
import asyncio

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Admin"])

# Constants
ALLOWED_ROLES = ["brand", "influencer", "admin"]
ALLOWED_STATUSES = ["active", "suspended", "banned"]
SUBSCRIPTION_PLANS = ["free", "free_trial", "starter_monthly", "starter_yearly", "pro_monthly", "pro_yearly", "enterprise_monthly", "enterprise_yearly"]
SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due", "canceled", "incomplete", "incomplete_expired"]

# ==================== CACHE & OPTIMIZATION ====================

# In-memory cache for dashboard stats (you can replace with Redis in production)
dashboard_cache = {"data": None, "timestamp": None, "ttl": 300}  # 5 minute TTL

def get_cached_dashboard():
    """Get cached dashboard data if still valid"""
    if dashboard_cache["data"] and dashboard_cache["timestamp"]:
        if (datetime.utcnow() - dashboard_cache["timestamp"]).total_seconds() < dashboard_cache["ttl"]:
            return dashboard_cache["data"]
    return None

def set_cached_dashboard(data):
    """Set dashboard data in cache"""
    dashboard_cache["data"] = data
    dashboard_cache["timestamp"] = datetime.utcnow()

# ==================== DEPENDENCIES & UTILITIES ====================

async def verify_admin(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Verify if the user is an admin"""
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = ObjectId(payload["sub"])
        user = users_collection.find_one({"_id": user_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

def to_str_oid(obj: Any) -> Any:
    """Convert ObjectId to string in dict/list"""
    if isinstance(obj, list):
        return [to_str_oid(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_str_oid(v) for k, v in obj.items()}
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

def safe_objectid(id_str: str) -> ObjectId:
    """Safely convert string to ObjectId"""
    if not ObjectId.is_valid(id_str):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    return ObjectId(id_str)

def get_user_display_info(user: Dict[str, Any]) -> tuple[str, Optional[str]]:
    """Extract display name and picture from user"""
    if user.get("role") == "brand" and user.get("brand_profile"):
        profile = user["brand_profile"]
        name = profile.get("company_name", "Unknown Brand")
        picture = profile.get("logo")
    elif user.get("role") == "influencer" and user.get("influencer_profile"):
        profile = user["influencer_profile"]
        name = profile.get("nickname") or profile.get("full_name", "Unknown Influencer")
        picture = profile.get("profile_picture")
    else:
        name = user.get("username", "Unknown User")
        picture = None
    
    return name, picture

async def batch_enrich_users(user_ids: List[ObjectId]) -> Dict[ObjectId, Dict[str, Any]]:
    """Batch enrich multiple users with post counts and subscription data"""
    try:
        if not user_ids:
            return {}
        
        # Batch get post counts for all users
        pipeline = [
            {"$match": {"user_id": {"$in": user_ids}}},
            {"$group": {"_id": "$user_id", "post_count": {"$sum": 1}}}
        ]
        post_counts_result = posts_collection.aggregate(pipeline)
        post_counts = {pc["_id"]: pc["post_count"] for pc in post_counts_result}
        
        # Batch get latest subscriptions for all users
        user_emails = users_collection.find(
            {"_id": {"$in": user_ids}}, 
            {"email": 1, "_id": 1}
        )
        email_map = {str(u["_id"]): u["email"] for u in user_emails}
        
        subscription_map = {}
        if email_map:
            pipeline = [
                {"$match": {"user_email": {"$in": list(email_map.values())}}},
                {"$sort": {"created_at": -1}},
                {"$group": {
                    "_id": "$user_email",
                    "latest_subscription": {"$first": "$$ROOT"}
                }}
            ]
            subscriptions_result = subscriptions_collection.aggregate(pipeline)
            for sub in subscriptions_result:
                for user_id, email in email_map.items():
                    if email == sub["_id"]:
                        subscription_map[ObjectId(user_id)] = sub["latest_subscription"]
        
        result = {}
        for user_id in user_ids:
            result[user_id] = {
                "post_count": post_counts.get(user_id, 0),
                "latest_subscription": to_str_oid(subscription_map.get(user_id))
            }
        
        return result
        
    except Exception as e:
        logger.error(f"Batch enrich users error: {str(e)}")
        return {}

# ==================== DASHBOARD & REPORTS ====================

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_admin_dashboard(admin: Dict[str, Any] = Depends(verify_admin)):
    """Get admin dashboard overview with caching"""
    try:
        # Check cache first
        cached_data = get_cached_dashboard()
        if cached_data:
            logger.info("Returning cached dashboard data")
            return cached_data
        
        # Calculate fresh data
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        day_ago = now - timedelta(hours=24)
        
        # Run all queries in parallel
        tasks = [
            # Total counts
            asyncio.to_thread(users_collection.count_documents, {}),
            asyncio.to_thread(users_collection.count_documents, {"role": "brand"}),
            asyncio.to_thread(users_collection.count_documents, {"role": "influencer"}),
            asyncio.to_thread(users_collection.count_documents, {"role": "admin"}),
            asyncio.to_thread(posts_collection.count_documents, {}),
            asyncio.to_thread(collaborations_collection.count_documents, {}),
            asyncio.to_thread(collaborations_collection.count_documents, {"status": "active"}),
            
            # Recent activity
            asyncio.to_thread(users_collection.count_documents, {"created_at": {"$gte": week_ago}}),
            asyncio.to_thread(posts_collection.count_documents, {"created_at": {"$gte": day_ago}}),
            asyncio.to_thread(posts_collection.count_documents, {"created_at": {"$gte": week_ago}}),
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Get subscription stats in parallel
        subscription_task = asyncio.to_thread(users_collection.aggregate, [
            {"$group": {
                "_id": None,
                "active_subscriptions": {"$sum": {"$cond": [{"$eq": ["$has_active_subscription", True]}, 1, 0]}},
                "trial_users": {"$sum": {"$cond": [{"$eq": ["$is_trial_active", True]}, 1, 0]}},
                "free_users": {"$sum": {"$cond": [{"$eq": ["$current_plan", "free"]}, 1, 0]}}
            }}
        ])
        
        engagement_task = asyncio.to_thread(posts_collection.aggregate, [
            {"$group": {
                "_id": None,
                "total_likes": {"$sum": {"$size": {"$ifNull": ["$likes", []]}}},
                "total_comments": {"$sum": {"$size": {"$ifNull": ["$comments", []]}}},
                "total_views": {"$sum": {"$size": {"$ifNull": ["$views", []]}}}
            }}
        ])
        
        subscription_result = await subscription_task
        engagement_result = await engagement_task
        
        sub_stats = list(subscription_result)[0] if subscription_result else {}
        engagement_data = list(engagement_result)[0] if engagement_result else {}
        
        # Compile results
        dashboard_data = {
            "platform_overview": {
                "total_users": results[0],
                "brands": results[1],
                "influencers": results[2],
                "admins": results[3],
                "total_posts": results[4],
                "total_collaborations": results[5],
                "active_collaborations": results[6]
            },
            "subscription_analytics": {
                "active_subscriptions": sub_stats.get("active_subscriptions", 0),
                "trial_users": sub_stats.get("trial_users", 0),
                "free_users": sub_stats.get("free_users", 0)
            },
            "engagement_metrics": {
                "total_likes": engagement_data.get("total_likes", 0),
                "total_comments": engagement_data.get("total_comments", 0),
                "total_views": engagement_data.get("total_views", 0)
            },
            "recent_activity": {
                "last_24h_posts": results[8],
                "last_7d_users": results[7],
                "last_7d_posts": results[9]
            }
        }
        
        # Cache the result
        set_cached_dashboard(dashboard_data)
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating dashboard")

@router.post("/dashboard/refresh", response_model=Dict[str, Any])
async def refresh_dashboard_cache(admin: Dict[str, Any] = Depends(verify_admin)):
    """Force refresh dashboard cache"""
    try:
        dashboard_cache["data"] = None
        dashboard_cache["timestamp"] = None
        return {"message": "Dashboard cache refreshed successfully"}
    except Exception as e:
        logger.error(f"Refresh dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error refreshing dashboard")

# ==================== USER MANAGEMENT (PAGINATED) ====================

@router.get("/users", response_model=Dict[str, Any])
async def get_users(
    admin: Dict[str, Any] = Depends(verify_admin),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get users with pagination and filtering"""
    try:
        # Build query
        query = {}
        if role and role in ALLOWED_ROLES:
            query["role"] = role
        if status_filter and status_filter in ALLOWED_STATUSES:
            query["status"] = status_filter
        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"username": {"$regex": search, "$options": "i"}},
                {"brand_profile.company_name": {"$regex": search, "$options": "i"}},
                {"influencer_profile.full_name": {"$regex": search, "$options": "i"}},
                {"influencer_profile.nickname": {"$regex": search, "$options": "i"}}
            ]
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get total count
        total_users = users_collection.count_documents(query)
        
        # Get paginated users
        users_cursor = users_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        users = list(users_cursor)
        
        # Batch enrich users
        user_ids = [user["_id"] for user in users]
        enriched_data = await batch_enrich_users(user_ids)
        
        # Prepare response
        enriched_users = []
        for user in users:
            user_data = to_str_oid(user)
            enrichment = enriched_data.get(user["_id"], {})
            
            # Get subscription status
            subscription_status = {}
            try:
                subscription_status = await SubscriptionService.get_user_subscription_status(user["email"])
            except Exception:
                subscription_status = {
                    "has_active_subscription": False,
                    "current_plan": "free",
                    "is_trial_active": False
                }
            
            # Calculate activity metrics
            followers = user.get("followers") or []
            following = user.get("following") or []
            
            created_at = user.get("created_at", datetime.utcnow())
            last_login = user.get("last_login", created_at)
            
            user_data["subscription"] = {
                **subscription_status,
                "details": enrichment.get("latest_subscription")
            }
            
            user_data["activity_metrics"] = {
                "post_count": enrichment.get("post_count", 0),
                "followers_count": len(followers) if isinstance(followers, list) else 0,
                "following_count": len(following) if isinstance(following, list) else 0,
                "days_since_registration": (datetime.utcnow() - created_at).days,
                "days_since_last_login": (datetime.utcnow() - last_login).days if user.get("last_login") else None
            }
            
            user_data["profile_completed"] = bool(
                user.get("brand_profile") if user.get("role") == "brand" 
                else user.get("influencer_profile") if user.get("role") == "influencer" 
                else False
            )
            
            enriched_users.append(user_data)
        
        return {
            "users": enriched_users,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_users,
                "pages": (total_users + limit - 1) // limit,
                "has_next": skip + limit < total_users,
                "has_prev": page > 1
            }
        }
        
    except Exception as e:
        logger.error(f"Get users error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving users")

@router.get("/users/quick-stats", response_model=Dict[str, Any])
async def get_users_quick_stats(admin: Dict[str, Any] = Depends(verify_admin)):
    """Get quick user statistics for dashboard"""
    try:
        # Run all aggregations in parallel
        tasks = [
            asyncio.to_thread(users_collection.aggregate, [
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }}
            ]),
            asyncio.to_thread(users_collection.aggregate, [
                {"$group": {
                    "_id": "$role",
                    "count": {"$sum": 1}
                }}
            ]),
            asyncio.to_thread(users_collection.count_documents, {"created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}}),
            asyncio.to_thread(users_collection.count_documents, {"last_login": {"$gte": datetime.utcnow() - timedelta(days=1)}}),
        ]
        
        results = await asyncio.gather(*tasks)
        
        status_stats = {stat["_id"]: stat["count"] for stat in list(results[0])}
        role_stats = {role["_id"]: role["count"] for role in list(results[1])}
        
        return {
            "status_distribution": status_stats,
            "role_distribution": role_stats,
            "new_users_7d": results[2],
            "active_users_24h": results[3],
            "total_users": sum(status_stats.values())
        }
        
    except Exception as e:
        logger.error(f"Get user stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving user statistics")

@router.get("/users/{user_id}", response_model=Dict[str, Any])
async def get_user_details(user_id: str, admin: Dict[str, Any] = Depends(verify_admin)):
    """Get detailed user information"""
    try:
        uid = safe_objectid(user_id)
        user = users_collection.find_one({"_id": uid})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user data in parallel
        tasks = [
            asyncio.to_thread(posts_collection.find, {"user_id": uid}),
            asyncio.to_thread(subscriptions_collection.find, {"user_email": user["email"]}),
            SubscriptionService.get_user_subscription_status(user["email"])
        ]
        
        user_posts, subscription_history, current_subscription = await asyncio.gather(*tasks)
        user_posts = list(user_posts)
        subscription_history = list(subscription_history)
        
        # Calculate engagement metrics
        total_likes = sum(len(post.get("likes", [])) for post in user_posts)
        total_comments = sum(len(post.get("comments", [])) for post in user_posts)
        total_views = sum(len(post.get("views", [])) for post in user_posts)
        
        # Prepare response
        user_data = to_str_oid(user)
        user_data["engagement_metrics"] = {
            "total_posts": len(user_posts),
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_views": total_views,
            "average_engagement": round((total_likes + total_comments + total_views) / max(len(user_posts), 1), 2)
        }
        
        user_data["subscription"] = {
            "current": current_subscription,
            "history": to_str_oid(subscription_history)
        }
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user details error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving user details")

# ==================== SUBSCRIPTION REPORTS ====================

# In your backend code, fix the /subscriptions/overview endpoint:
@router.get("/subscriptions/overview", response_model=Dict[str, Any])
async def get_subscriptions_overview(admin: Dict[str, Any] = Depends(verify_admin)):
    """Get comprehensive subscription overview"""
    try:
        # Use asyncio.to_thread for synchronous operations
        # Subscription counts by plan
        plan_counts_cursor = subscriptions_collection.aggregate([
            {"$match": {"status": {"$in": ["active", "trialing"]}}},
            {"$group": {
                "_id": "$plan",
                "count": {"$sum": 1},
                "trialing": {"$sum": {"$cond": [{"$eq": ["$status", "trialing"]}, 1, 0]}},
                "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}}
            }},
            {"$sort": {"count": -1}}
        ])
        plan_counts = await plan_counts_cursor.to_list(length=None)
        
        # Total subscription metrics
        total_metrics_cursor = subscriptions_collection.aggregate([
            {"$group": {
                "_id": None,
                "total_subscriptions": {"$sum": 1},
                "active_subscriptions": {"$sum": {"$cond": [{"$in": ["$status", ["active", "trialing"]]}, 1, 0]}},
                "trial_subscriptions": {"$sum": {"$cond": [{"$eq": ["$is_trial", True]}, 1, 0]}}
            }}
        ])
        total_metrics = await total_metrics_cursor.to_list(length=None)
        
        # Recent subscription activity (last 10)
        recent_subscriptions = await subscriptions_collection.find().sort("created_at", -1).limit(10).to_list(length=10)
        
        # Expiring trials and subscriptions
        expiring_soon = await subscriptions_collection.find({
            "$or": [
                {"trial_end": {"$lte": datetime.utcnow() + timedelta(days=7), "$gte": datetime.utcnow()}},
                {"current_period_end": {"$lte": datetime.utcnow() + timedelta(days=7), "$gte": datetime.utcnow()}}
            ],
            "status": {"$in": ["active", "trialing"]}
        }).to_list(length=None)
        
        return {
            "plan_distribution": to_str_oid(plan_counts),
            "total_metrics": total_metrics[0] if total_metrics else {},
            "recent_subscriptions": to_str_oid(recent_subscriptions),
            "expiring_soon": {
                "count": len(expiring_soon),
                "subscriptions": to_str_oid(expiring_soon)
            }
        }
        
    except Exception as e:
        logger.error(f"Subscription overview error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating subscription overview")

@router.get("/subscriptions", response_model=Dict[str, Any])
async def get_subscriptions(
    admin: Dict[str, Any] = Depends(verify_admin),
    plan: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get subscriptions with pagination"""
    try:
        query = {}
        if plan and plan in SUBSCRIPTION_PLANS:
            query["plan"] = plan
        if status and status in SUBSCRIPTION_STATUSES:
            query["status"] = status
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get total count
        total = subscriptions_collection.count_documents(query)
        
        # Get paginated subscriptions
        cursor = subscriptions_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        subscriptions = list(cursor)
        
        # Get user info for subscriptions in batch
        user_emails = [sub["user_email"] for sub in subscriptions]
        users = users_collection.find({"email": {"$in": user_emails}})
        user_map = {user["email"]: user for user in users}
        
        # Enrich subscriptions
        enriched_subscriptions = []
        for subscription in subscriptions:
            sub_data = to_str_oid(subscription)
            
            user = user_map.get(subscription["user_email"])
            if user:
                name, picture = get_user_display_info(user)
                sub_data["user"] = {
                    "id": str(user["_id"]),
                    "name": name,
                    "email": user["email"],
                    "role": user.get("role"),
                    "profile_picture": picture
                }
            
            enriched_subscriptions.append(sub_data)
        
        return {
            "subscriptions": enriched_subscriptions,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        logger.error(f"Get subscriptions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving subscriptions")

# ==================== POST REPORTS ====================

@router.get("/posts", response_model=Dict[str, Any])
async def get_posts(
    admin: Dict[str, Any] = Depends(verify_admin),
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Get posts with pagination"""
    try:
        query = {}
        if user_id:
            query["user_id"] = safe_objectid(user_id)
        
        # Calculate skip
        skip = (page - 1) * limit
        
        # Get total count
        total = posts_collection.count_documents(query)
        
        # Get paginated posts
        cursor = posts_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        posts = list(cursor)
        
        # Get user info in batch
        user_ids = [post["user_id"] for post in posts]
        users = users_collection.find({"_id": {"$in": user_ids}})
        user_map = {str(user["_id"]): user for user in users}
        
        # Enrich posts
        enriched_posts = []
        for post in posts:
            post_data = to_str_oid(post)
            
            user = user_map.get(str(post["user_id"]))
            if user:
                name, picture = get_user_display_info(user)
                post_data["author"] = {
                    "id": str(user["_id"]),
                    "name": name,
                    "email": user.get("email"),
                    "profile_picture": picture
                }
            
            post_data["engagement"] = {
                "likes": len(post.get("likes", [])),
                "comments": len(post.get("comments", [])),
                "views": len(post.get("views", []))
            }
            
            enriched_posts.append(post_data)
        
        return {
            "posts": enriched_posts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }
        
    except Exception as e:
        logger.error(f"Get posts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving posts")

@router.get("/posts/stats", response_model=Dict[str, Any])
async def get_posts_stats(
    admin: Dict[str, Any] = Depends(verify_admin),
    days: int = Query(7, ge=1, le=365)
):
    """Get post statistics for given time period"""
    try:
        since_date = datetime.utcnow() - timedelta(days=days)
        
        # Run queries in parallel
        tasks = [
            asyncio.to_thread(posts_collection.count_documents, {"created_at": {"$gte": since_date}}),
            asyncio.to_thread(posts_collection.aggregate, [
                {"$match": {"created_at": {"$gte": since_date}}},
                {"$group": {
                    "_id": None,
                    "total_likes": {"$sum": {"$size": {"$ifNull": ["$likes", []]}}},
                    "total_comments": {"$sum": {"$size": {"$ifNull": ["$comments", []]}}},
                    "total_views": {"$sum": {"$size": {"$ifNull": ["$views", []]}}},
                    "avg_engagement": {"$avg": {
                        "$add": [
                            {"$size": {"$ifNull": ["$likes", []]}},
                            {"$size": {"$ifNull": ["$comments", []]}},
                            {"$size": {"$ifNull": ["$views", []]}}
                        ]
                    }}
                }}
            ]),
            asyncio.to_thread(posts_collection.aggregate, [
                {"$match": {"created_at": {"$gte": since_date}}},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}},
                {"$limit": 30}
            ])
        ]
        
        total_posts, engagement_stats, daily_stats = await asyncio.gather(*tasks)
        
        engagement = list(engagement_stats)[0] if engagement_stats else {}
        daily = list(daily_stats) if daily_stats else []
        
        return {
            "period": days,
            "total_posts": total_posts,
            "engagement": {
                "total_likes": engagement.get("total_likes", 0),
                "total_comments": engagement.get("total_comments", 0),
                "total_views": engagement.get("total_views", 0),
                "avg_engagement": round(engagement.get("avg_engagement", 0), 2)
            },
            "daily_trend": to_str_oid(daily)
        }
        
    except Exception as e:
        logger.error(f"Get posts stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving post statistics")

# ==================== ACTIVITY REPORTS ====================

@router.get("/activities/recent", response_model=Dict[str, Any])
async def get_recent_activities(
    admin: Dict[str, Any] = Depends(verify_admin),
    limit: int = Query(20, ge=1, le=100)
):
    """Get recent platform activities"""
    try:
        # Get recent users
        recent_users = list(users_collection.find()
                          .sort("created_at", -1)
                          .limit(limit))
        
        # Get recent posts
        recent_posts = list(posts_collection.find()
                          .sort("created_at", -1)
                          .limit(limit))
        
        # Get recent subscriptions
        recent_subs = list(subscriptions_collection.find()
                          .sort("created_at", -1)
                          .limit(limit))
        
        activities = []
        
        # Add user registrations
        for user in recent_users:
            activities.append({
                "type": "user",
                "title": f"New {user.get('role', 'user')} registered",
                "description": user.get("email", "Unknown"),
                "time": user.get("created_at"),
                "data": {
                    "id": str(user["_id"]),
                    "role": user.get("role"),
                    "status": user.get("status")
                }
            })
        
        # Add new posts
        for post in recent_posts:
            activities.append({
                "type": "post",
                "title": "New post created",
                "description": f"Post by user ID: {post.get('user_id')}",
                "time": post.get("created_at"),
                "data": {
                    "id": str(post["_id"]),
                    "user_id": str(post.get("user_id"))
                }
            })
        
        # Add new subscriptions
        for sub in recent_subs:
            activities.append({
                "type": "subscription",
                "title": f"New {sub.get('plan')} subscription",
                "description": f"User: {sub.get('user_email')}",
                "time": sub.get("created_at"),
                "data": {
                    "id": str(sub["_id"]),
                    "plan": sub.get("plan"),
                    "status": sub.get("status")
                }
            })
        
        # Sort by time
        activities.sort(key=lambda x: x["time"], reverse=True)
        
        return {
            "activities": to_str_oid(activities[:limit]),
            "total": len(activities)
        }
        
    except Exception as e:
        logger.error(f"Get activities error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving activities")

# ==================== SYSTEM REPORTS ====================

@router.get("/system/health", response_model=Dict[str, Any])
async def get_system_health(admin: Dict[str, Any] = Depends(verify_admin)):
    """Get system health status"""
    try:
        # Test database connections
        tasks = [
            asyncio.to_thread(users_collection.count_documents, {}),
            asyncio.to_thread(posts_collection.count_documents, {}),
            asyncio.to_thread(subscriptions_collection.count_documents, {}),
            asyncio.to_thread(collaborations_collection.count_documents, {}),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        health_status = {
            "database": {
                "users": "healthy" if not isinstance(results[0], Exception) else "error",
                "posts": "healthy" if not isinstance(results[1], Exception) else "error",
                "subscriptions": "healthy" if not isinstance(results[2], Exception) else "error",
                "collaborations": "healthy" if not isinstance(results[3], Exception) else "error"
            },
            "cache": "healthy" if dashboard_cache["data"] else "empty",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Get system health error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error checking system health")

# ==================== SIMPLE ROUTES (for your frontend) ====================

@router.get("/reports/summary", response_model=Dict[str, Any])
async def get_summary_report(admin: Dict[str, Any] = Depends(verify_admin)):
    """Get all summary data in one call for dashboard"""
    try:
        # Run all summary queries in parallel
        tasks = [
            get_admin_dashboard(admin),
            get_users_quick_stats(admin),
            get_subscriptions_overview(admin),
            get_posts_stats(admin, days=7)
        ]
        
        dashboard, user_stats, subscription_overview, post_stats = await asyncio.gather(*tasks)
        
        return {
            "dashboard": dashboard,
            "user_stats": user_stats,
            "subscription_overview": subscription_overview,
            "post_stats": post_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Get summary report error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating summary report")

# ==================== QUICK ACTION ROUTES ====================

@router.get("/quick/users", response_model=Dict[str, Any])
async def get_quick_users_list(
    admin: Dict[str, Any] = Depends(verify_admin),
    limit: int = Query(10, ge=1, le=50)
):
    """Quick user list for dropdowns/search"""
    try:
        users = list(users_collection.find()
                    .sort("created_at", -1)
                    .limit(limit))
        
        simplified_users = []
        for user in users:
            name, _ = get_user_display_info(user)
            simplified_users.append({
                "id": str(user["_id"]),
                "email": user.get("email"),
                "name": name,
                "role": user.get("role"),
                "status": user.get("status")
            })
        
        return {"users": simplified_users}
        
    except Exception as e:
        logger.error(f"Get quick users error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving users")

@router.get("/quick/stats", response_model=Dict[str, Any])
async def get_quick_stats(admin: Dict[str, Any] = Depends(verify_admin)):
    """Quick stats for dashboard widgets"""
    try:
        # Get basic counts
        tasks = [
            asyncio.to_thread(users_collection.count_documents, {}),
            asyncio.to_thread(posts_collection.count_documents, {}),
            asyncio.to_thread(subscriptions_collection.count_documents, {"status": {"$in": ["active", "trialing"]}}),
            asyncio.to_thread(users_collection.count_documents, {"created_at": {"$gte": datetime.utcnow() - timedelta(days=1)}}),
        ]
        
        total_users, total_posts, active_subs, new_users_24h = await asyncio.gather(*tasks)
        
        return {
            "total_users": total_users,
            "total_posts": total_posts,
            "active_subscriptions": active_subs,
            "new_users_24h": new_users_24h,
            "updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Get quick stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving quick stats")
    
    
@router.get("/users/{user_id}/complete", response_model=Dict[str, Any])
async def get_user_complete_details(user_id: str, admin: Dict[str, Any] = Depends(verify_admin)):
    """Get complete user information including posts and detailed analytics"""
    try:
        uid = safe_objectid(user_id)
        user = users_collection.find_one({"_id": uid})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's posts with full details
        user_posts = list(posts_collection.find({"user_id": uid}).sort("created_at", -1).limit(50))
        
        # Calculate detailed engagement metrics with proper error handling
        total_likes = 0
        total_comments = 0
        total_views = 0
        
        for post in user_posts:
            # Handle likes count - check both formats (list of user_ids or list of dicts)
            likes = post.get("likes", [])
            if likes and isinstance(likes, list):
                if isinstance(likes[0], dict):
                    total_likes += len(likes)
                else:
                    total_likes += len(likes)
            
            # Handle comments count
            comments = post.get("comments", [])
            if comments and isinstance(comments, list):
                total_comments += len(comments)
            
            # Handle views count
            views = post.get("views", [])
            if views and isinstance(views, list):
                total_views += len(views)
        
        # Get subscription history
        subscription_history = list(subscriptions_collection.find({
            "user_email": user["email"]
        }).sort("created_at", -1))
        
        # Get current subscription status
        current_subscription = await SubscriptionService.get_user_subscription_status(user["email"])
        
        # Enrich user data
        user_data = to_str_oid(user)

        
        # Add detailed posts information
        user_data["posts"] = {
            "recent_posts": to_str_oid(user_posts),
            "engagement_metrics": {
                "total_posts": len(user_posts),
                "total_likes": total_likes,
                "total_comments": total_comments,
                "total_views": total_views,
                "average_engagement_per_post": round(
                    (total_likes + total_comments + total_views) / max(len(user_posts), 1), 2
                )
            }
        }
        
        user_data["subscription_history"] = to_str_oid(subscription_history)
        user_data["current_subscription"] = current_subscription
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user complete details error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving user complete details")

@router.put("/users/{user_id}/status", response_model=Dict[str, Any])
async def update_user_status(
    user_id: str,
    status_data: Dict[str, str],
    admin: Dict[str, Any] = Depends(verify_admin)
):
    """Update user status"""
    try:
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")
        
        if new_status not in ALLOWED_STATUSES:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(ALLOWED_STATUSES)}")
        
        uid = safe_objectid(user_id)
        
        # Prevent admin from modifying their own status
        if str(uid) == str(admin["_id"]):
            raise HTTPException(status_code=400, detail="Cannot modify your own status")
        
        result = users_collection.update_one(
            {"_id": uid},
            {"$set": {
                "status": new_status,
                "updated_at": datetime.utcnow(),
                "status_updated_by": str(admin["_id"]),
                "status_updated_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Admin {admin['email']} updated user {user_id} status to {new_status}")
        return {"message": f"User status updated to {new_status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user status error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user status")

@router.delete("/users/{user_id}", response_model=Dict[str, Any])
async def delete_user(
    user_id: str,
    background_tasks: BackgroundTasks,
    admin: Dict[str, Any] = Depends(verify_admin)
):
    """Delete user and associated data"""
    try:
        uid = safe_objectid(user_id)
        
        # Check if user exists
        user = users_collection.find_one({"_id": uid})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent admin from deleting themselves
        if str(uid) == str(admin["_id"]):
            raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
        async def cleanup_user_data(user_oid: ObjectId, user_email: str):
            """Background task to clean up user data"""
            try:
                # Delete user's posts
                posts_collection.delete_many({"user_id": user_oid})
                
                # Delete user's subscriptions
                subscriptions_collection.delete_many({"user_email": user_email})
                
                # Remove user from followers/following
                users_collection.update_many(
                    {"followers": user_oid},
                    {"$pull": {"followers": user_oid}}
                )
                users_collection.update_many(
                    {"following": user_oid},
                    {"$pull": {"following": user_oid}}
                )
                
                # Remove user interactions from posts
                posts_collection.update_many(
                    {},
                    {
                        "$pull": {
                            "likes": {"user_id": user_oid},
                            "comments": {"user_id": user_oid},
                            "views": {"user_id": user_oid}
                        }
                    }
                )
                
                logger.info(f"Cleaned up data for user {user_email}")
                
            except Exception as e:
                logger.error(f"Error cleaning up user data: {str(e)}")
        
        # Add background cleanup task
        background_tasks.add_task(cleanup_user_data, uid, user.get("email", "unknown"))
        
        # Delete user
        result = users_collection.delete_one({"_id": uid})
        
        logger.info(f"Admin {admin['email']} deleted user {user.get('email')}")
        return {"message": "User and associated data scheduled for deletion"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting user")

@router.put("/users/{user_id}/suspend", response_model=Dict[str, Any])
async def suspend_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(verify_admin)
):
    """Suspend a user account"""
    try:
        uid = safe_objectid(user_id)
        
        # Check if user exists
        user = users_collection.find_one({"_id": uid})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent admin from suspending themselves
        if str(uid) == str(admin["_id"]):
            raise HTTPException(status_code=400, detail="Cannot suspend your own account")
        
        # Update user status to suspended
        result = users_collection.update_one(
            {"_id": uid},
            {"$set": {
                "status": "suspended",
                "updated_at": datetime.utcnow(),
                "status_updated_by": str(admin["_id"]),
                "status_updated_at": datetime.utcnow(),
                "suspended_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Admin {admin['email']} suspended user {user['email']} (ID: {user_id})")
        return {
            "message": "User suspended successfully",
            "user_id": user_id,
            "email": user["email"],
            "status": "suspended"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Suspend user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error suspending user")

@router.put("/users/{user_id}/activate", response_model=Dict[str, Any])
async def activate_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(verify_admin)
):
    """Activate a suspended user account"""
    try:
        uid = safe_objectid(user_id)
        
        # Check if user exists
        user = users_collection.find_one({"_id": uid})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user status to active
        result = users_collection.update_one(
            {"_id": uid},
            {"$set": {
                "status": "active",
                "updated_at": datetime.utcnow(),
                "status_updated_by": str(admin["_id"]),
                "status_updated_at": datetime.utcnow(),
                "activated_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Admin {admin['email']} activated user {user['email']} (ID: {user_id})")
        return {
            "message": "User activated successfully",
            "user_id": user_id,
            "email": user["email"],
            "status": "active"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Activate user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error activating user")


@router.get("/export/data")
async def export_admin_data(
    export_type: str,
    admin=Depends(verify_admin)
):
    if export_type == "users":
        users = list(users_collection.find())
        return {"users": to_str_oid(users)}

    raise HTTPException(status_code=400, detail="Invalid export type")
