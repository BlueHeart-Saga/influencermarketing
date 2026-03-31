# backend/routes/menu_routes.py
from typing import List, Optional, Dict, Any, Set, Literal
from datetime import datetime
from urllib.parse import unquote

from fastapi import APIRouter, Depends, HTTPException, Path, UploadFile, File, status
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from bson import ObjectId
# from gridfs import GridFS

# Import your DB and auth utils (adjust import paths to your project)
from database import db, storage as storage_provider  # expect this to be a pymongo.database.Database instance
from auth.utils import decode_access_token, oauth2_scheme

# Collections
menus_collection = db.get_collection("menus")
navbars_collection = db.get_collection("navbars")
# fs = GridFS(db)  # GridFS instance
fs = storage_provider

router = APIRouter()

# ------------------- Allowed extensions -------------------
ALLOWED_IMAGE_EXTENSIONS: Set[str] = {"png", "jpg", "jpeg", "gif", "bmp", "webp"}
ALLOWED_SVG_EXTENSIONS: Set[str] = {"svg"}
ALLOWED_ICON_EXTENSIONS: Set[str] = {"ico"}
ALLOWED_EXTENSIONS: Set[str] = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_SVG_EXTENSIONS | ALLOWED_ICON_EXTENSIONS

# ------------------- Pydantic Models -------------------
IconType = Literal["url", "upload", "emoji", "fa_icon"]

class IconData(BaseModel):
    type: IconType  # "url", "upload", "emoji", "fa_icon"
    value: str      # url or GridFS id (string) or emoji or fontawesome class
    alt_text: Optional[str] = ""

class SubMenuItem(BaseModel):
    title: str
    path: str
    icon: Optional[IconData] = None

class MenuItem(BaseModel):
    title: str
    path: str
    icon: Optional[IconData] = None
    children: Optional[List[SubMenuItem]] = Field(default_factory=list)

class SaveRequest(BaseModel):
    role: str
    items: List[MenuItem]

class IconUploadResponse(BaseModel):
    icon_id: str
    filename: str
    content_type: str
    file_size: int
    uploaded_at: datetime

# ------------------- Auth Dependency -------------------
def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return payload

# ------------------- Helper utils -------------------
def _validate_extension(filename: str) -> str:
    if "." not in filename:
        raise HTTPException(status_code=400, detail="File has no extension")
    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Extension '.{ext}' not allowed")
    return ext

def _gridfs_put(contents: bytes, filename: str, content_type: str) -> str:
    file_id = storage_provider.upload(
        contents,
        filename=filename,
        folder="icons"
    )
    return file_id

# ------------------- ICON upload / fetch -------------------
@router.post("/icon/upload", response_model=IconUploadResponse, summary="Upload icon file to GridFS")
async def upload_icon(file: UploadFile = File(...), user: Dict[str, Any] = Depends(get_current_user)):
    """
    Upload icon files (png,jpg,svg,ico,webp,...) to GridFS.
    Returns an icon_id which you can store in menu items as:
        {"type": "upload", "value": "<icon_id>", "alt_text": "..."}
    """
    filename = file.filename or "unknown"
    _validate_extension(filename)
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    try:
        file_id = _gridfs_put(contents, filename=filename, content_type=file.content_type or "application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    return IconUploadResponse(
        icon_id=str(file_id),
        filename=filename,
        content_type=file.content_type or "application/octet-stream",
        file_size=len(contents),
        uploaded_at=datetime.utcnow()
    )

@router.get("/icon/{icon_id}", summary="Fetch icon by GridFS id")
def get_icon(icon_id: str):
    try:
        content = storage_provider.download(icon_id)
        # Basic content type detection
        content_type = "image/png"
        if icon_id.lower().endswith(".svg"):
            content_type = "image/svg+xml"
        elif icon_id.lower().endswith(".ico"):
            content_type = "image/x-icon"
            
        return Response(content=content, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail="Icon not found")

# ------------------- GET Endpoints -------------------
@router.get("/menu/{role}", summary="Get all sidebar menus by role")
def get_menus(role: str, user: Dict[str, Any] = Depends(get_current_user)):
    doc = menus_collection.find_one({"role": role}, {"_id": 0, "items": 1})
    return {"menus": doc["items"] if doc else []}

@router.get("/page/sidebar/{role}", summary="Get sidebar menus by role")
def get_sidebar(role: str, user: Dict[str, Any] = Depends(get_current_user)):
    doc = menus_collection.find_one({"role": role}, {"_id": 0, "items": 1})
    return {"menus": doc["items"] if doc else []}

@router.get("/navbar/{role}", summary="Get navbar menus by role (with submenus)")
def get_navbar(role: str, user: Dict[str, Any] = Depends(get_current_user)):
    doc = navbars_collection.find_one({"role": role}, {"_id": 0, "items": 1})
    return {"items": doc["items"] if doc else []}

# ------------------- SAVE / OVERWRITE -------------------
@router.post("/menu/save", summary="Save/overwrite sidebar menus (with submenus)")
def save_menus(req: SaveRequest, user: Dict[str, Any] = Depends(get_current_user)):
    # Optionally: validate menu items further here (unique paths, children shapes, etc.)
    menus_collection.update_one(
        {"role": req.role},
        {"$set": {"items": [m.dict() for m in req.items], "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"status": "ok", "menus": req.items}

@router.post("/navbar/save", summary="Save/overwrite navbar menus (with submenus)")
@router.post("/navbar/add", summary="Alias for saving navbar menus")
def save_navbar(req: SaveRequest, user: Dict[str, Any] = Depends(get_current_user)):
    navbars_collection.update_one(
        {"role": req.role},
        {"$set": {"items": [m.dict() for m in req.items], "updated_at": datetime.utcnow()}},
        upsert=True
    )
    return {"status": "ok", "navbar": req.items}

# ------------------- REMOVE -------------------
@router.delete("/menu/remove/{role}/{path:path}", summary="Remove a sidebar menu or submenu by path")
def remove_menu(role: str, path: str = Path(...), user: Dict[str, Any] = Depends(get_current_user)):
    path = unquote(path)
    doc = menus_collection.find_one({"role": role})
    if not doc:
        raise HTTPException(status_code=404, detail="Role not found")

    new_items = []
    removed = False
    for item in doc.get("items", []):
        if item.get("path") == path:
            removed = True
            continue
        # also clean children
        children = item.get("children", [])
        filtered_children = [c for c in children if c.get("path") != path]
        if len(filtered_children) != len(children):
            removed = True
        item["children"] = filtered_children
        new_items.append(item)

    if not removed:
        raise HTTPException(status_code=404, detail=f"Path '{path}' not found for role '{role}'")

    menus_collection.update_one({"role": role}, {"$set": {"items": new_items, "updated_at": datetime.utcnow()}})
    return {"message": f"Sidebar menu/submenu '{path}' removed for {role}"}

@router.delete("/navbar/remove/{role}/{path:path}", summary="Remove a navbar item or submenu by path")
def remove_navbar(role: str, path: str = Path(...), user: Dict[str, Any] = Depends(get_current_user)):
    path = unquote(path)
    doc = navbars_collection.find_one({"role": role})
    if not doc:
        raise HTTPException(status_code=404, detail="Role not found")

    new_items = []
    removed = False
    for item in doc.get("items", []):
        if item.get("path") == path:
            removed = True
            continue
        # also clean children
        children = item.get("children", [])
        filtered_children = [c for c in children if c.get("path") != path]
        if len(filtered_children) != len(children):
            removed = True
        item["children"] = filtered_children
        new_items.append(item)

    if not removed:
        raise HTTPException(status_code=404, detail=f"Path '{path}' not found for role '{role}'")

    navbars_collection.update_one({"role": role}, {"$set": {"items": new_items, "updated_at": datetime.utcnow()}})
    return {"message": f"Navbar item/submenu '{path}' removed for {role}"}
