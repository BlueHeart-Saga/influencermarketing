# src/routers/profiles.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import Optional, Dict, Any, List, Union
from database import db, storage as storage_provider
from auth.utils import decode_access_token, oauth2_scheme
from io import BytesIO

router = APIRouter(prefix="/profiles", tags=["Profiles"])
users_collection = db["users"]
posts_collection = db["posts"]


DEFAULT_INFLUENCER_AVATAR = "/static/defaults/influencer-avatar.png"
DEFAULT_BRAND_LOGO = "/static/defaults/brand-logo.png"


# ---------------- UTILS ----------------
def to_str_oid(obj: Any) -> Any:
    """Recursively convert ObjectId to string in dict/list"""
    if isinstance(obj, list):
        return [to_str_oid(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_str_oid(v) for k, v in obj.items()}
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj


def serialize_profile(profile: Dict[str, Any], profile_type: str, user_id: ObjectId) -> Dict[str, Any]:
    serialized = to_str_oid(profile)
    serialized["id"] = str(user_id)
    return {"type": profile_type, "profile": serialized}


async def save_image(file: Optional[UploadFile]) -> Optional[str]:
    if not file:
        return None
    content = await file.read()
    file_id = storage_provider.upload(
        content, 
        filename=getattr(file, "filename", "upload") or "upload",
        folder="profiles"
    )
    return file_id


async def get_user_from_token(token: str):
    payload = decode_access_token(token)
    user_id = ObjectId(payload["sub"])
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user, user_id


def get_user_display_info(user: dict) -> (str, Optional[str]):
    """Return display name and picture for a user document"""
    if user.get("role") == "brand":
        profile = user.get("brand_profile", {})
        # For brand, show company name
        name = profile.get("company_name") or "Unknown Brand"
        # Get logo if available, otherwise use default
        picture = profile.get("logo") or DEFAULT_BRAND_LOGO
    elif user.get("role") == "influencer":
        profile = user.get("influencer_profile", {})
        # For influencer, show nickname if available, otherwise full name
        name = profile.get("nickname") or profile.get("full_name") or "Unknown Influencer"
        # Get profile picture if available
        picture = profile.get("profile_picture") or DEFAULT_INFLUENCER_AVATAR
    else:
        # For admin or other roles
        name = user.get("username") or user.get("email") or "User"
        picture = None
    
    return name, picture


def safe_objectid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id format")
    
def is_brand_profile_complete(profile: dict) -> bool:
    """Check if brand profile is complete with reasonable requirements"""
    # Required fields for a complete brand profile
    required_fields = [
        profile.get("company_name"),
        profile.get("contact_person_name"),
        profile.get("phone_number"),
        profile.get("location"),
        profile.get("logo") and profile.get("logo") != DEFAULT_BRAND_LOGO,
        profile.get("bio"),
    ]
    
    # Categories should have at least one
    has_categories = bool(profile.get("categories") and len(profile.get("categories", [])) > 0)
    
    # Target audience is optional but nice to have
    has_target_audience = bool(profile.get("target_audience"))
    
    # Return True if all required fields are filled AND has categories
    return all(required_fields) and has_categories


def is_influencer_profile_complete(profile: dict) -> bool:
    """Check if influencer profile is complete with reasonable requirements"""
    # Required fields for a complete influencer profile
    required_fields = [
        profile.get("full_name"),
        profile.get("location"),
        profile.get("profile_picture") and profile.get("profile_picture") != DEFAULT_INFLUENCER_AVATAR,
    ]
    
    # Categories should have at least one
    has_categories = bool(profile.get("categories") and len(profile.get("categories", [])) > 0)
    
    # Bio is optional but nice to have
    has_bio = bool(profile.get("bio"))
    
    # Return True if all required fields are filled AND has categories
    return all(required_fields) and has_categories


def calculate_profile_progress(profile: dict, profile_type: str) -> int:
    """Calculate profile completion percentage"""
    if profile_type == "brand":
        # Core required fields
        core_fields = [
            "company_name", "contact_person_name", "phone_number", 
            "location", "categories", "logo", "bio"
        ]
        total_fields = len(core_fields) + 1  # +1 for target_audience as bonus
        completed = 0
        
        # Check core fields
        for field in core_fields:
            if field == "categories":
                if profile.get("categories") and len(profile.get("categories", [])) > 0:
                    completed += 1
            elif field == "logo":
                if profile.get("logo") and profile.get("logo") != DEFAULT_BRAND_LOGO:
                    completed += 1
            elif profile.get(field):
                completed += 1
        
        # Bonus field
        if profile.get("target_audience"):
            completed += 1
            
    else:  # influencer
        # Core required fields
        core_fields = [
            "full_name", "location", "profile_picture", 
            "categories", "bio", "phone_number"
        ]
        total_fields = len(core_fields)
        completed = 0
        
        # Check core fields
        for field in core_fields:
            if field == "categories":
                if profile.get("categories") and len(profile.get("categories", [])) > 0:
                    completed += 1
            elif field == "profile_picture":
                if profile.get("profile_picture") and profile.get("profile_picture") != DEFAULT_INFLUENCER_AVATAR:
                    completed += 1
            elif profile.get(field):
                completed += 1
    
    return int((completed / total_fields) * 100)

# ---------------- PROFILE CRUD ----------------
# --------- BRAND PROFILE ---------
@router.post("/brand")
async def create_brand_profile(
    company_name: str = Form(...),
    contact_person_name: str = Form(...),
    phone_number: str = Form(...),
    website: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    categories: Optional[str] = Form(None),  # Comes as string from Form
    instagram: Optional[str] = Form(None),
    youtube: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None),
    twitter: Optional[str] = Form(None),
    tiktok: Optional[str] = Form(None),
    target_audience: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    bg_image: Optional[UploadFile] = File(None),
    bio: Optional[str] = Form(None),
    token: str = Depends(oauth2_scheme),
):
    user, user_id = await get_user_from_token(token)

    social_links = {k: v for k, v in [
        ("instagram", instagram), ("youtube", youtube), ("linkedin", linkedin), 
        ("facebook", facebook), ("twitter", twitter), ("tiktok", tiktok)
    ] if v}

    # Handle categories - split by comma if provided as string
    categories_list = []
    if categories:
        if isinstance(categories, str):
            # Split by comma and strip whitespace
            categories_list = [c.strip() for c in categories.split(",") if c.strip()]
        elif isinstance(categories, list):
            categories_list = categories

    profile_data = {
        "company_name": company_name,
        "contact_person_name": contact_person_name,
        "phone_number": phone_number,
        "website": website,
        "location": location,
        "categories": categories_list,  # Use the processed list
        "social_links": social_links,
        "target_audience": target_audience or "",
        "logo": (
            await save_image(logo)
            or DEFAULT_BRAND_LOGO
        ),
        "bg_image": await save_image(bg_image),
        "bio": bio or "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"brand_profile": profile_data, "role": "brand"}}
    )
    return {"message": "Brand profile created", **serialize_profile(profile_data, "brand", user_id)}

@router.put("/brand")
async def update_brand_profile(
    company_name: Optional[str] = Form(None),
    contact_person_name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    website: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    categories: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None),
    youtube: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None),
    twitter: Optional[str] = Form(None),
    tiktok: Optional[str] = Form(None),
    target_audience: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    bg_image: Optional[UploadFile] = File(None),
    bio: Optional[str] = Form(None),
    token: str = Depends(oauth2_scheme),
):
    user, user_id = await get_user_from_token(token)
    if not user.get("brand_profile"):
        raise HTTPException(status_code=404, detail="Brand profile not found")

    update_data = {**user["brand_profile"], "updated_at": datetime.utcnow()}

    if company_name: update_data["company_name"] = company_name
    if contact_person_name: update_data["contact_person_name"] = contact_person_name
    if phone_number: update_data["phone_number"] = phone_number
    if website: update_data["website"] = website
    if location: update_data["location"] = location
    
    # Handle categories properly
    if categories is not None:
        if isinstance(categories, str):
            # Split by comma and strip whitespace
            categories_list = [c.strip() for c in categories.split(",") if c.strip()]
            update_data["categories"] = categories_list
        elif isinstance(categories, list):
            update_data["categories"] = categories
    
    if target_audience: update_data["target_audience"] = target_audience

    social_links = update_data.get("social_links", {})
    for k, v in [
        ("instagram", instagram), ("youtube", youtube), ("linkedin", linkedin), 
        ("facebook", facebook), ("twitter", twitter), ("tiktok", tiktok)
    ]:
        if v:
            social_links[k] = v
    update_data["social_links"] = social_links

    if logo: update_data["logo"] = await save_image(logo)
    if bg_image: update_data["bg_image"] = await save_image(bg_image)
    if bio is not None:
        update_data["bio"] = bio

    users_collection.update_one({"_id": user_id}, {"$set": {"brand_profile": update_data}})
    return {"message": "Brand profile updated", **serialize_profile(update_data, "brand", user_id)}

@router.delete("/brand")
async def delete_brand_profile(token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    if not user.get("brand_profile"):
        raise HTTPException(status_code=404, detail="Brand profile not found")
    users_collection.update_one({"_id": user_id}, {"$unset": {"brand_profile": ""}})
    return {"message": "Brand profile deleted"}


# --------- INFLUENCER PROFILE ---------
@router.post("/influencer")
async def create_influencer_profile(
    full_name: str = Form(...),
    nickname: Optional[str] = Form(None),
    # email: str = Form(...),
    phone_number: Optional[str] = Form(None),
    categories: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None),
    youtube: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None),
    tiktok: Optional[str] = Form(None),
    twitter: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    bg_image: Optional[UploadFile] = File(None),
    location: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    
    token: str = Depends(oauth2_scheme),
):
    user, user_id = await get_user_from_token(token)

    social_links = {k: v for k, v in [
        ("instagram", instagram), ("youtube", youtube), ("linkedin", linkedin), ("facebook", facebook), ("twitter", twitter), ("tiktok", tiktok)
    ] if v}

    profile_data = {
        "full_name": full_name,
        "nickname": nickname,
        # "email": email,
        "phone_number": phone_number,
        "categories": categories if isinstance(categories, list) else (
            [c.strip() for c in categories.split(",")] if categories else []
        ),

        "social_links": social_links,
        "profile_picture": (
    await save_image(profile_picture)
    or DEFAULT_INFLUENCER_AVATAR
),
        "bg_image": await save_image(bg_image),
        "location": location,
        "bio": bio,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    users_collection.update_one({"_id": user_id}, {"$set": {"influencer_profile": profile_data, "role": "influencer"}})
    return {"message": "Influencer profile created", **serialize_profile(profile_data, "influencer", user_id)}


@router.put("/influencer")
async def update_influencer_profile(
    full_name: Optional[str] = Form(None),
    nickname: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    categories: Optional[str] = Form(None),  # This comes as string from Form
    instagram: Optional[str] = Form(None),
    youtube: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    facebook: Optional[str] = Form(None),
    tiktok: Optional[str] = Form(None),
    twitter: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    bg_image: Optional[UploadFile] = File(None),
    location: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    token: str = Depends(oauth2_scheme),
):
    user, user_id = await get_user_from_token(token)
    if not user.get("influencer_profile"):
        raise HTTPException(status_code=404, detail="Influencer profile not found")

    update_data = {**user["influencer_profile"], "updated_at": datetime.utcnow()}

    if full_name: update_data["full_name"] = full_name
    if nickname: update_data["nickname"] = nickname
    if phone_number: update_data["phone_number"] = phone_number
    
    # FIX: Handle categories properly - it can come as comma-separated string or list
    if categories is not None:
        if isinstance(categories, str):
            # Try to parse as JSON array first
            try:
                import json
                parsed_categories = json.loads(categories)
                if isinstance(parsed_categories, list):
                    update_data["categories"] = parsed_categories
                else:
                    # Fallback to comma splitting
                    update_data["categories"] = [c.strip() for c in categories.split(",") if c.strip()]
            except json.JSONDecodeError:
                # If not valid JSON, treat as comma-separated string
                update_data["categories"] = [c.strip() for c in categories.split(",") if c.strip()]
        elif isinstance(categories, list):
            update_data["categories"] = categories
        else:
            update_data["categories"] = []

    social_links = update_data.get("social_links", {})
    for k, v in [("instagram", instagram), ("youtube", youtube), ("linkedin", linkedin),
                 ("facebook", facebook),("twitter", twitter), ("tiktok", tiktok)]:
        if v:
            social_links[k] = v
    update_data["social_links"] = social_links

    if profile_picture:
        update_data["profile_picture"] = await save_image(profile_picture)
    elif not update_data.get("profile_picture"):
        update_data["profile_picture"] = DEFAULT_INFLUENCER_AVATAR

    if bg_image: update_data["bg_image"] = await save_image(bg_image)
    if location: update_data["location"] = location
    if bio: update_data["bio"] = bio

    users_collection.update_one({"_id": user_id}, {"$set": {"influencer_profile": update_data}})
    return {"message": "Influencer profile updated", **serialize_profile(update_data, "influencer", user_id)}

@router.delete("/influencer")
async def delete_influencer_profile(token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    if not user.get("influencer_profile"):
        raise HTTPException(status_code=404, detail="Influencer profile not found")
    users_collection.update_one({"_id": user_id}, {"$unset": {"influencer_profile": ""}})
    return {"message": "Influencer profile deleted"}


# ---------------- GET PROFILES ----------------
@router.get("/me")
async def get_my_profile(token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    if user.get("role") == "brand" and user.get("brand_profile"):
        return serialize_profile(user["brand_profile"], "brand", user_id)
    if user.get("role") == "influencer" and user.get("influencer_profile"):
        return serialize_profile(user["influencer_profile"], "influencer", user_id)
    raise HTTPException(status_code=404, detail="Profile not found")


@router.get("/user/{user_id}")
async def get_profile_by_user_id(user_id: str):
    uid = safe_objectid(user_id)
    user = users_collection.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") == "brand" and user.get("brand_profile"):
        return serialize_profile(user["brand_profile"], "brand", uid)
    if user.get("role") == "influencer" and user.get("influencer_profile"):
        return serialize_profile(user["influencer_profile"], "influencer", uid)
    raise HTTPException(status_code=404, detail="Profile not found")


@router.get("/public")
async def get_all_public_profiles():
    profiles = []
    for user in users_collection.find():
        if user.get("brand_profile"):
            profiles.append(serialize_profile(user["brand_profile"], "brand", user["_id"]))
        if user.get("influencer_profile"):
            profiles.append(serialize_profile(user["influencer_profile"], "influencer", user["_id"]))
    return profiles

@router.get("/admin/all")
async def get_all_profiles_admin(token: str = Depends(oauth2_scheme)):
    """Admin-only endpoint to get all users with their profiles."""
    user, user_id = await get_user_from_token(token)

    # Check if the logged-in user is an admin
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admins only")

    all_users = list(users_collection.find())
    result = []

    for u in all_users:
        user_data = {
            "id": str(u["_id"]),
            "email": u.get("email"),
            "role": u.get("role"),
            "created_at": u.get("created_at"),
            "updated_at": u.get("updated_at"),
        }

        if u.get("brand_profile"):
            user_data["profile_type"] = "brand"
            user_data["profile"] = to_str_oid(u["brand_profile"])
        elif u.get("influencer_profile"):
            user_data["profile_type"] = "influencer"
            user_data["profile"] = to_str_oid(u["influencer_profile"])
        else:
            user_data["profile_type"] = "none"
            user_data["profile"] = {}

        result.append(user_data)

    return {"count": len(result), "profiles": result}


# ---------------- POSTS ----------------
@router.post("/posts")
async def create_post(
    caption: Optional[str] = Form(None),
    media: List[UploadFile] = File(...),
    token: str = Depends(oauth2_scheme)
):
    user, user_id = await get_user_from_token(token)
    file_ids = []
    for file in media:
        content = await file.read()
        file_id = storage_provider.upload(
            content,
            filename=getattr(file, "filename", "upload") or "upload",
            folder="posts"
        )
        file_ids.append(file_id)

    post = {
        "user_id": user_id,
        "media": file_ids,
        "caption": caption or "",
        # interactions are lists of dicts with user_id:ObjectId, user_name, profile_picture, timestamp fields
        "likes": [],
        "comments": [],
        "views": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = posts_collection.insert_one(post)
    return {"message": "Post created", "post_id": str(result.inserted_id)}


def enrich_interaction_users(interactions: List[Union[str, Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """Given a list of interaction entries (either user_id strings or dicts), return enriched user entries."""
    enriched = []
    for entry in interactions:
        # entry might be a dict with user_id or a raw user_id (ObjectId / str)
        user_id = None
        if isinstance(entry, dict):
            user_id = entry.get("user_id")
        else:
            user_id = entry

        if not user_id:
            continue

        # ensure we have an ObjectId
        try:
            uid = user_id if isinstance(user_id, ObjectId) else ObjectId(user_id)
        except Exception:
            continue

        user_doc = users_collection.find_one({"_id": uid})
        if not user_doc:
            # if no user found, still include a fallback entry from the stored dict
            if isinstance(entry, dict):
                fallback = {
                    "user_id": to_str_oid(entry.get("user_id")),
                    "user_name": entry.get("user_name") or "Unknown",
                    "profile_picture": entry.get("profile_picture"),
                }
                # ⚠️ CRITICAL FIX: Preserve comment text and other fields
                if "comment" in entry:
                    fallback["comment"] = entry["comment"]
                if "created_at" in entry:
                    fallback["created_at"] = entry["created_at"]
                enriched.append(fallback)
            continue

        name, picture = get_user_display_info(user_doc)
        obj = {
            "user_id": str(user_doc["_id"]),
            "user_name": name,
            "profile_picture": picture,
        }
        
        # ⚠️ CRITICAL FIX: Preserve ALL original comment data
        if isinstance(entry, dict):
            # Preserve comment text
            if "comment" in entry:
                obj["comment"] = entry["comment"]
            # Preserve all timestamp fields
            for k in ("liked_at", "viewed_at", "created_at"):
                if entry.get(k):
                    obj[k] = entry.get(k)
            # Preserve any other fields that might be present
            for key, value in entry.items():
                if key not in obj and key not in ["user_id", "user_name", "profile_picture"]:
                    obj[key] = value
        
        enriched.append(obj)
    return enriched

@router.get("/posts/{user_id}")
async def get_user_posts(user_id: str):
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    posts = list(posts_collection.find({"user_id": uid}).sort("created_at", -1))
    out = []
    for post in posts:
        post = to_str_oid(post)
        post["comments"] = enrich_interaction_users(post.get("comments", []))
        post["likes"] = enrich_interaction_users(post.get("likes", []))
        post["views"] = enrich_interaction_users(post.get("views", []))
        out.append(post)
    return out


@router.get("/post/{post_id}")
async def get_post_by_id(post_id: str):
    try:
        pid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")
    post = posts_collection.find_one({"_id": pid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post = to_str_oid(post)
    post["comments"] = enrich_interaction_users(post.get("comments", []))
    post["likes"] = enrich_interaction_users(post.get("likes", []))
    post["views"] = enrich_interaction_users(post.get("views", []))
    return post


async def interact_with_post(post_id: str, token: str, field: str, data: dict = None, add: bool = True):
    """Generic helper to add/remove an interaction entry on a post.
       `field` should be 'likes'|'comments'|'views'. `data` is the dict stored."""
    user, user_id = await get_user_from_token(token)
    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")

    if add:
        posts_collection.update_one({"_id": obj_id}, {"$addToSet": {field: data}})
    else:
        # For removal we attempt to remove by user_id match (works for likes and views).
        # If caller passed a full dict for removal, it will be used as-is.
        if data and "user_id" in data:
            posts_collection.update_one({"_id": obj_id}, {"$pull": {field: {"user_id": data["user_id"]}}})
        else:
            posts_collection.update_one({"_id": obj_id}, {"$pull": {field: data}})
    return


@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    try:
        pid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")

    # check existing like
    existing = posts_collection.find_one({"_id": pid, "likes.user_id": user_id})
    if existing:
        # unlike
        await interact_with_post(post_id, token, "likes", {"user_id": user_id}, add=False)
        return {"message": "Post unliked"}

    name, picture = get_user_display_info(user)
    like_data = {"user_id": user_id, "user_name": name, "profile_picture": picture, "liked_at": datetime.utcnow()}
    await interact_with_post(post_id, token, "likes", like_data, add=True)
    return {"message": "Post liked"}


@router.post("/posts/{post_id}/comment")
async def comment_post(post_id: str, comment: str = Form(...), token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    try:
        pid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")

    name, picture = get_user_display_info(user)
    comment_data = {
        "user_id": user_id,
        "user_name": name,
        "profile_picture": picture,
        "comment": comment,  # MAKE SURE THIS LINE IS CORRECT
        "created_at": datetime.utcnow()
    }
    await interact_with_post(post_id, token, "comments", comment_data, add=True)
    return {"message": "Comment added", "comment": to_str_oid(comment_data)}


@router.post("/posts/{post_id}/view")
async def view_post(post_id: str, token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    try:
        pid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")

    # Optionally avoid duplicate views by same user: remove existing then add (keeps only latest viewed_at)
    posts_collection.update_one({"_id": pid}, {"$pull": {"views": {"user_id": user_id}}})

    name, picture = get_user_display_info(user)
    view_data = {"user_id": user_id, "user_name": name, "profile_picture": picture, "viewed_at": datetime.utcnow()}
    await interact_with_post(post_id, token, "views", view_data, add=True)
    return {"message": "Post viewed"}


@router.get("/posts/{post_id}/likes")
async def get_post_likes(post_id: str):
    try:
        pid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")
    post = posts_collection.find_one({"_id": pid}, {"likes": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return enrich_interaction_users(post.get("likes", []))


@router.get("/posts/{post_id}/views")
async def get_post_views(post_id: str):
    try:
        pid = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post id")
    post = posts_collection.find_one({"_id": pid}, {"views": 1})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return enrich_interaction_users(post.get("views", []))


# ---------------- FOLLOW / UNFOLLOW ----------------
@router.post("/follow/{target_user_id}")
async def follow_user(target_user_id: str, token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    if str(user_id) == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target_oid = safe_objectid(target_user_id)
    users_collection.update_one({"_id": user_id}, {"$addToSet": {"following": target_oid}})
    users_collection.update_one({"_id": target_oid}, {"$addToSet": {"followers": user_id}})
    return {"message": "Followed"}


@router.post("/unfollow/{target_user_id}")
async def unfollow_user(target_user_id: str, token: str = Depends(oauth2_scheme)):
    user, user_id = await get_user_from_token(token)
    if str(user_id) == target_user_id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")

    target_oid = safe_objectid(target_user_id)
    users_collection.update_one({"_id": user_id}, {"$pull": {"following": target_oid}})
    users_collection.update_one({"_id": target_oid}, {"$pull": {"followers": user_id}})
    return {"message": "Unfollowed"}


@router.get("/followers/{user_id}")
async def get_followers(user_id: str):
    uid = safe_objectid(user_id)
    user = users_collection.find_one({"_id": uid}, {"followers": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    followers = list(users_collection.find({"_id": {"$in": user.get("followers", [])}}))
    return to_str_oid(followers)


@router.get("/following/{user_id}")
async def get_following(user_id: str):
    uid = safe_objectid(user_id)
    user = users_collection.find_one({"_id": uid}, {"following": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    following = list(users_collection.find({"_id": {"$in": user.get("following", [])}}))
    return to_str_oid(following)


# ---------------- GET IMAGE ----------------
@router.get("/image/{file_id}")
async def get_image(file_id: str):
    try:
        content = storage_provider.download(file_id)
        # Simplified media type detection
        media_type = "image/jpeg"
        if file_id.lower().endswith(".png"):
            media_type = "image/png"
        elif file_id.lower().endswith(".webp"):
            media_type = "image/webp"
            
        return StreamingResponse(
            BytesIO(content),
            media_type=media_type,
            headers={"Content-Disposition": f"inline; filename={file_id}"}
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")

# Add this to the POSTS section in src/routers/profiles.py

# Add these fixed feed endpoints to your profiles.py file

@router.get("/posts/feed/me")
async def get_my_feed(
    token: str = Depends(oauth2_scheme),
    page: int = 1,
    limit: int = 20
):
    """Get feed posts for the current user (posts from followed users + discovery)"""
    user, user_id = await get_user_from_token(token)
    
    # Get users that current user follows
    following = user.get("following", [])
    
    # If user doesn't follow anyone, show discovery posts (most recent posts)
    if not following:
        # Discovery feed - most recent posts from all users
        posts_cursor = posts_collection.find().sort("created_at", -1)
    else:
        # Personal feed - posts from followed users
        posts_cursor = posts_collection.find({"user_id": {"$in": following}}).sort("created_at", -1)
    
    # Apply pagination
    skip = (page - 1) * limit
    posts = list(posts_cursor.skip(skip).limit(limit))
    
    # Enrich posts with user info and interactions
    enriched_posts = []
    for post in posts:
        # Get post author info
        author = users_collection.find_one({"_id": post["user_id"]})
        author_name, author_picture = get_user_display_info(author) if author else ("Unknown", None)
        
        # Convert post to serializable format
        post_data = to_str_oid(post)
        
        # Add author info to post
        post_data["author"] = {
            "id": str(post["user_id"]),
            "name": author_name,
            "profile_picture": author_picture
        }
        
        # FIX: Check if current user has liked this post - handle both ObjectId and dict formats
        post_data["has_liked"] = False
        for like in post.get("likes", []):
            if isinstance(like, dict):
                if str(like.get("user_id")) == str(user_id):
                    post_data["has_liked"] = True
                    break

            else:
                # Like is stored as ObjectId (user_id directly)
                if like == user_id:
                    post_data["has_liked"] = True
                    break
        
        # Enrich interactions
        post_data["comments"] = enrich_interaction_users(post.get("comments", []))
        post_data["likes"] = enrich_interaction_users(post.get("likes", []))
        post_data["views"] = enrich_interaction_users(post.get("views", []))
        
        enriched_posts.append(post_data)
    
    return {
        "posts": enriched_posts,
        "page": page,
        "limit": limit,
        "has_more": len(posts) == limit
    }


@router.get("/posts/feed/discovery")
async def get_discovery_feed(
    page: int = 1,
    limit: int = 20
):
    """Get discovery feed (posts from all users, sorted by engagement)"""
    # Get posts sorted by engagement score (likes + comments + views)
    pipeline = [
        {
            "$addFields": {
                "engagement_score": {
                    "$add": [
                        {"$size": {"$ifNull": ["$likes", []]}},
                        {"$size": {"$ifNull": ["$comments", []]}},
                        {"$size": {"$ifNull": ["$views", []]}}
                    ]
                }
            }
        },
        {"$sort": {"engagement_score": -1, "created_at": -1}},
        {"$skip": (page - 1) * limit},
        {"$limit": limit}
    ]
    
    posts = list(posts_collection.aggregate(pipeline))
    
    # Enrich posts with user info
    enriched_posts = []
    for post in posts:
        author = users_collection.find_one({"_id": post["user_id"]})
        author_name, author_picture = get_user_display_info(author) if author else ("Unknown", None)
        
        post_data = to_str_oid(post)
        post_data["author"] = {
            "id": str(post["user_id"]),
            "name": author_name,
            "profile_picture": author_picture
        }
        
        # For discovery feed, we don't check has_liked since it requires auth
        post_data["has_liked"] = False
        
        # Enrich interactions
        post_data["comments"] = enrich_interaction_users(post.get("comments", []))
        post_data["likes"] = enrich_interaction_users(post.get("likes", []))
        post_data["views"] = enrich_interaction_users(post.get("views", []))
        
        enriched_posts.append(post_data)
    
    return {
        "posts": enriched_posts,
        "page": page,
        "limit": limit,
        "has_more": len(posts) == limit
    }


# Also update the enrich_interaction_users function to handle ObjectId formats
def enrich_interaction_users(interactions: List[Union[str, Dict[str, Any], ObjectId]]) -> List[Dict[str, Any]]:
    """Given a list of interaction entries (either user_id strings, ObjectId, or dicts), return enriched user entries."""
    enriched = []
    for entry in interactions:
        # Handle different formats: ObjectId, string, or dict
        user_id = None
        original_data = {}
        
        if isinstance(entry, dict):
            user_id = entry.get("user_id")
            original_data = entry
        elif isinstance(entry, (ObjectId, str)):
            user_id = entry
            original_data = {"user_id": user_id}
        
        if not user_id:
            continue

        # Ensure we have an ObjectId for database lookup
        try:
            uid = user_id if isinstance(user_id, ObjectId) else ObjectId(user_id)
        except Exception:
            # If we can't convert to ObjectId, use the original data as fallback
            if isinstance(entry, dict):
                fallback = {
                    "user_id": to_str_oid(entry.get("user_id")),
                    "user_name": entry.get("user_name") or "Unknown",
                    "profile_picture": entry.get("profile_picture"),
                }
                # Preserve all original fields
                for key, value in entry.items():
                    if key not in fallback:
                        fallback[key] = value
                enriched.append(fallback)
            continue

        # Look up user in database
        user_doc = users_collection.find_one({"_id": uid})
        if user_doc:
            name, picture = get_user_display_info(user_doc)
            obj = {
                "user_id": str(user_doc["_id"]),
                "user_name": name,
                "profile_picture": picture,
            }
            
            # Preserve all original data from the interaction
            if isinstance(entry, dict):
                for key, value in entry.items():
                    if key not in obj:
                        obj[key] = value
            
            enriched.append(obj)
        else:
            # User not found, use original data as fallback
            if isinstance(entry, dict):
                fallback = {
                    "user_id": to_str_oid(entry.get("user_id")),
                    "user_name": entry.get("user_name") or "Unknown",
                    "profile_picture": entry.get("profile_picture"),
                }
                for key, value in entry.items():
                    if key not in fallback:
                        fallback[key] = value
                enriched.append(fallback)
    
    return enriched


@router.get("/user/{user_id}/complete")
async def get_complete_user_profile(user_id: str):
    """Get complete user profile with completion status"""
    uid = safe_objectid(user_id)
    user = users_collection.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine profile type and data
    if user.get("role") == "brand" and user.get("brand_profile"):
        profile_data = user["brand_profile"]
        profile_type = "brand"
        is_complete = is_brand_profile_complete(profile_data)
        # Add completion details
        completion_details = {
            "missing_fields": [],
            "has_categories": bool(profile_data.get("categories") and len(profile_data.get("categories", [])) > 0),
            "has_logo": bool(profile_data.get("logo") and profile_data.get("logo") != DEFAULT_BRAND_LOGO),
        }
        
        # Check each required field
        if not profile_data.get("company_name"):
            completion_details["missing_fields"].append("company_name")
        if not profile_data.get("contact_person_name"):
            completion_details["missing_fields"].append("contact_person_name")
        if not profile_data.get("phone_number"):
            completion_details["missing_fields"].append("phone_number")
        if not profile_data.get("location"):
            completion_details["missing_fields"].append("location")
        if not profile_data.get("bio"):
            completion_details["missing_fields"].append("bio")

    elif user.get("role") == "influencer" and user.get("influencer_profile"):
        profile_data = user["influencer_profile"]
        profile_type = "influencer"
        is_complete = is_influencer_profile_complete(profile_data)
        # Add completion details
        completion_details = {
            "missing_fields": [],
            "has_categories": bool(profile_data.get("categories") and len(profile_data.get("categories", [])) > 0),
            "has_profile_picture": bool(profile_data.get("profile_picture") and profile_data.get("profile_picture") != DEFAULT_INFLUENCER_AVATAR),
        }
        
        # Check each required field
        if not profile_data.get("full_name"):
            completion_details["missing_fields"].append("full_name")
        if not profile_data.get("location"):
            completion_details["missing_fields"].append("location")

    else:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Build response
    complete_profile = {
        **to_str_oid(profile_data),
        "id": str(uid),
        "user_id": str(uid),
        "profile_type": profile_type,
        "role": user.get("role"),
        "email": user.get("email"),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
        "isComplete": is_complete,
        "completionDetails": completion_details,  # Add detailed completion info
        "progress": calculate_profile_progress(profile_data, profile_type)  # Add progress percentage
    }

    return complete_profile

@router.get("/completion/status")
async def get_profile_completion_status(token: str = Depends(oauth2_scheme)):
    """Get current user's profile completion status"""
    user, user_id = await get_user_from_token(token)
    
    if user.get("role") == "brand" and user.get("brand_profile"):
        profile = user["brand_profile"]
        is_complete = is_brand_profile_complete(profile)
        progress = calculate_profile_progress(profile, "brand")
        
        return {
            "profile_type": "brand",
            "isComplete": is_complete,
            "progress": progress,
            "completionDetails": {
                "company_name": bool(profile.get("company_name")),
                "contact_person_name": bool(profile.get("contact_person_name")),
                "phone_number": bool(profile.get("phone_number")),
                "location": bool(profile.get("location")),
                "categories": bool(profile.get("categories") and len(profile.get("categories", [])) > 0),
                "logo": bool(profile.get("logo") and profile.get("logo") != DEFAULT_BRAND_LOGO),
                "bio": bool(profile.get("bio")),
                "target_audience": bool(profile.get("target_audience")),
            }
        }
        
    elif user.get("role") == "influencer" and user.get("influencer_profile"):
        profile = user["influencer_profile"]
        is_complete = is_influencer_profile_complete(profile)
        progress = calculate_profile_progress(profile, "influencer")
        
        return {
            "profile_type": "influencer",
            "isComplete": is_complete,
            "progress": progress,
            "completionDetails": {
                "full_name": bool(profile.get("full_name")),
                "location": bool(profile.get("location")),
                "profile_picture": bool(profile.get("profile_picture") and profile.get("profile_picture") != DEFAULT_INFLUENCER_AVATAR),
                "categories": bool(profile.get("categories") and len(profile.get("categories", [])) > 0),
                "bio": bool(profile.get("bio")),
                "phone_number": bool(profile.get("phone_number")),
            }
        }
    
    # No profile exists
    return {
        "profile_type": None,
        "isComplete": False,
        "progress": 0,
        "completionDetails": {}
    }