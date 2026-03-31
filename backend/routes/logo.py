from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from bson.objectid import ObjectId
from datetime import datetime
from typing import List, Dict, Any
import itertools
# import imghdr

from database import storage, logo_collection

router = APIRouter()

# Accept all image formats - relaxed validation
ALLOWED_EXTENSIONS = (
    ".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", 
    ".webp", ".bmp", ".tiff", ".tif", ".avif", ".heic", ".heif"
)

# Counter for simple file IDs
file_counter = itertools.count(1)

# ----------------------------------------------------------
# Get next simple file ID
# ----------------------------------------------------------
def get_next_file_id():
    # Get the highest current file_id from history
    record = logo_collection.find_one({"key": "logo"})
    if record and "history" in record:
        max_id = 0
        for entry in record["history"]:
            file_id = entry.get("file_id")
            if isinstance(file_id, int) and file_id > max_id:
                max_id = file_id
        return max_id + 1
    return 1

# ----------------------------------------------------------
# Initialize logo record with proper structure
# ----------------------------------------------------------
def initialize_logo_record():
    record = logo_collection.find_one({"key": "logo"})
    if not record:
        logo_collection.insert_one({
            "key": "logo",
            "current_file_id": None,
            "current_filename": None,
            "history": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    return logo_collection.find_one({"key": "logo"})

# ----------------------------------------------------------
# Initialize platform name record
# ----------------------------------------------------------
def initialize_platform_record():
    record = logo_collection.find_one({"key": "platform_name"})
    if not record:
        logo_collection.insert_one({
            "key": "platform_name",
            "value": "InfluenceAI",
            "history": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    return logo_collection.find_one({"key": "platform_name"})

# Initialize records on startup
initialize_logo_record()
initialize_platform_record()

# ============================================================
# UPLOAD / UPDATE PLATFORM LOGO - RELAXED VALIDATION
# ============================================================
@router.post("/logo/upload")
async def upload_logo(file: UploadFile):
    # Basic file existence check
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Very relaxed file type check - accept any file that might be an image
    if file.filename:
        file_extension = file.filename.lower()
        # Just check if it has a reasonable image extension
        if not any(file_extension.endswith(ext) for ext in ALLOWED_EXTENSIONS):
            # Still allow upload but warn about potential issues
            print(f"Warning: Uploading file with non-standard extension: {file.filename}")

    # Get next file ID
    file_id = get_next_file_id()
    
    # Save file to GridFS
    content = await file.read()
    
    # Basic content check - ensure file is not empty
    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    
    # Very generous file size limit (50MB)
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large (max 50MB)")

    storage_id = storage.upload(content, filename=file.filename, folder="logos")

    # Create history entry with simple numeric ID
    history_entry = {
        "file_id": file_id,  # Simple numeric ID
        "gridfs_id": storage_id,  # Now a string (blob path)
        "filename": file.filename,
        "content_type": file.content_type or "image/png",
        "uploaded_at": datetime.utcnow(),
        "type": "upload",
        "file_size": len(content)
    }

    # Update the logo record
    logo_collection.update_one(
        {"key": "logo"},
        {
            "$set": {
                "current_file_id": file_id,
                "current_filename": file.filename,
                "current_gridfs_id": storage_id,
                "current_content_type": file.content_type or "image/png",
                "updated_at": datetime.utcnow()
            },
            "$push": {"history": {"$each": [history_entry], "$position": 0}}  # Add to beginning for newest first
        }
    )

    return {
        "message": "Logo uploaded successfully", 
        "file_id": file_id,
        "filename": file.filename,
        "file_size": len(content)
    }

# ============================================================
# GET CURRENT LOGO (binary) - IMPROVED VERSION
# ============================================================
@router.get("/logo/current")
async def get_logo():
    record = logo_collection.find_one({"key": "logo"})
    if not record or "current_gridfs_id" not in record:
        raise HTTPException(status_code=404, detail="Logo not found")

    try:
        file_content = storage.download(record["current_gridfs_id"])
        
        # Check if we actually got content
        if not file_content:
            raise HTTPException(status_code=404, detail="Logo file is empty")
            
        print(f"Serving logo: {record.get('current_filename')}, size: {len(file_content)} bytes")
        
    except Exception as e:
        print(f"Error getting logo from GridFS: {e}")
        raise HTTPException(status_code=404, detail="Logo file missing or corrupted")

    return StreamingResponse(
        iter([file_content]),
        media_type=record.get("current_content_type", record.get("content_type", "image/png")),
        headers={
            "Content-Disposition": f'inline; filename="{record.get("current_filename", "logo.png")}"',
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

# ============================================================
# GET LOGO INFO (metadata only)
# ============================================================
@router.get("/logo/info")
async def get_logo_info():
    record = logo_collection.find_one({"key": "logo"})
    if not record:
        raise HTTPException(status_code=404, detail="Logo not found")
    
    return {
        "current_file_id": record.get("current_file_id"),
        "filename": record.get("current_filename"),
        "uploaded_at": record.get("updated_at"),
        "content_type": record.get("current_content_type", "image/png"),
        "has_logo": "current_gridfs_id" in record
    }

# ============================================================
# GET LOGO HISTORY (simple format)
# ============================================================
@router.get("/logo/history")
async def get_logo_history():
    record = logo_collection.find_one({"key": "logo"})
    if not record or "history" not in record:
        return []

    # Return history with simple file IDs
    history = []
    for entry in record.get("history", []):
        history.append({
            "file_id": entry.get("file_id"),
            "filename": entry.get("filename"),
            "uploaded_at": entry.get("uploaded_at"),
            "type": entry.get("type", "upload"),
            "content_type": entry.get("content_type", "image/png"),
            "file_size": entry.get("file_size"),
            "is_current": entry.get("file_id") == record.get("current_file_id")
        })

    return history

# ============================================================
# REVERT LOGO (using simple file ID)
# ============================================================
@router.post("/logo/revert/{file_id}")
async def revert_logo(file_id: int):
    record = logo_collection.find_one({"key": "logo"})
    if not record or "history" not in record:
        raise HTTPException(status_code=404, detail="No logo history found")

    # Find the history entry with the specified file_id
    selected_entry = None
    for entry in record["history"]:
        if entry.get("file_id") == file_id:
            selected_entry = entry
            break

    if not selected_entry:
        raise HTTPException(status_code=404, detail=f"Logo with ID {file_id} not found in history")

    # Create a revert entry
    revert_entry = {
        "file_id": get_next_file_id(),  # New file ID for the revert
        "gridfs_id": selected_entry["gridfs_id"],  # Reuse the same GridFS file
        "filename": selected_entry["filename"],
        "content_type": selected_entry["content_type"],
        "uploaded_at": datetime.utcnow(),
        "type": "revert",
        "reverted_from": file_id,  # Track which file we reverted from
        "file_size": selected_entry.get("file_size")
    }

    # Update current logo to use the reverted file
    logo_collection.update_one(
        {"key": "logo"},
        {
            "$set": {
                "current_file_id": revert_entry["file_id"],
                "current_filename": revert_entry["filename"],
                "current_gridfs_id": revert_entry["gridfs_id"],
                "current_content_type": revert_entry["content_type"],
                "updated_at": datetime.utcnow()
            },
            "$push": {"history": {"$each": [revert_entry], "$position": 0}}
        }
    )

    return {
        "message": f"Logo reverted to version {file_id} successfully",
        "new_file_id": revert_entry["file_id"],
        "reverted_from": file_id
    }

# ============================================================
# DELETE LOGO (remove current logo)
# ============================================================
@router.delete("/logo/current")
async def delete_current_logo():
    record = logo_collection.find_one({"key": "logo"})
    if not record or "current_gridfs_id" not in record:
        raise HTTPException(status_code=404, detail="No logo to delete")

    # Delete from Storage
    try:
        storage.delete(record["current_gridfs_id"])
    except Exception:
        pass  # Ignore if file already doesn't exist

    # Update record
    logo_collection.update_one(
        {"key": "logo"},
        {
            "$set": {
                "current_file_id": None,
                "current_filename": None,
                "current_gridfs_id": None,
                "current_content_type": None,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Current logo deleted successfully"}

# ============================================================
# CLEAR LOGO HISTORY (keep current logo)
# ============================================================
@router.delete("/logo/history")
async def clear_logo_history():
    record = logo_collection.find_one({"key": "logo"})
    if not record:
        raise HTTPException(status_code=404, detail="Logo record not found")

    # Keep only the current logo in history if it exists
    current_file_id = record.get("current_file_id")
    new_history = []
    
    if current_file_id:
        for entry in record.get("history", []):
            if entry.get("file_id") == current_file_id:
                new_history = [entry]
                break

    logo_collection.update_one(
        {"key": "logo"},
        {
            "$set": {
                "history": new_history,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Logo history cleared", "current_file_id": current_file_id}

# ============================================================
# PLATFORM NAME ENDPOINTS
# ============================================================
@router.get("/platform/name")
async def get_platform_name():
    record = logo_collection.find_one({"key": "platform_name"})
    return {"platform_name": record.get("value", "InfluenceAI") if record else "InfluenceAI"}

@router.put("/platform/name")
async def update_platform_name(data: Dict[str, str]):
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Platform name cannot be empty")

    # Create history entry
    history_entry = {
        "name": name,
        "changed_at": datetime.utcnow(),
        "type": "name_change"
    }

    logo_collection.update_one(
        {"key": "platform_name"},
        {
            "$set": {
                "value": name,
                "updated_at": datetime.utcnow()
            },
            "$push": {"history": {"$each": [history_entry], "$position": 0}}
        },
        upsert=True
    )

    return {"message": "Platform name updated", "platform_name": name}

@router.get("/platform/name/history")
async def platform_name_history():
    record = logo_collection.find_one({"key": "platform_name"})
    if not record or "history" not in record:
        return []

    history = []
    for entry in record.get("history", []):
        history.append({
            "name": entry.get("name"),
            "changed_at": entry.get("changed_at"),
            "type": entry.get("type", "name_change"),
            "is_current": entry.get("name") == record.get("value")
        })

    return history

@router.post("/platform/name/revert")
async def revert_platform_name(data: Dict[str, str]):
    name_to_revert = data.get("name", "").strip()
    if not name_to_revert:
        raise HTTPException(status_code=400, detail="Platform name cannot be empty")

    record = logo_collection.find_one({"key": "platform_name"})
    if not record:
        raise HTTPException(status_code=404, detail="Platform name record not found")

    # Check if the name exists in history
    name_exists = any(entry.get("name") == name_to_revert for entry in record.get("history", []))
    if not name_exists:
        raise HTTPException(status_code=404, detail="Platform name not found in history")

    # Create revert entry
    revert_entry = {
        "name": name_to_revert,
        "changed_at": datetime.utcnow(),
        "type": "revert"
    }

    logo_collection.update_one(
        {"key": "platform_name"},
        {
            "$set": {
                "value": name_to_revert,
                "updated_at": datetime.utcnow()
            },
            "$push": {"history": {"$each": [revert_entry], "$position": 0}}
        }
    )

    return {"message": f"Platform name reverted to '{name_to_revert}'"}

# ============================================================
# HEALTH CHECK ENDPOINT
# ============================================================
@router.get("/logo/health")
async def health_check():
    """Health check endpoint to verify logo service is working"""
    record = logo_collection.find_one({"key": "logo"})
    
    health_info = {
        "service": "logo_management",
        "status": "healthy",
        "has_logo": bool(record and record.get("current_gridfs_id")),
        "logo_count": len(record.get("history", [])) if record else 0,
        "current_logo": {
            "file_id": record.get("current_file_id") if record else None,
            "filename": record.get("current_filename") if record else None
        }
    }
    
    return health_info