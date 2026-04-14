from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, Any
import os
from datetime import datetime, timezone
from database import storage, db
from auth.utils import get_current_user

router = APIRouter()

# Global config for attachments
ALLOWED_EXTENSIONS = {
    "image": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "video": [".mp4", ".mov", ".avi", ".mkv"],
    "audio": [".mp3", ".wav", ".ogg", ".aac"],
    "document": [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".rtf"]
}

@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read binary content
    content = await file.read()
    file_size = len(content)

    # 100MB limit
    if file_size > 100 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large (max 100MB)")

    # Determine file type
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    file_type = "file"
    if ext in ALLOWED_EXTENSIONS["image"]:
        file_type = "image"
    elif ext in ALLOWED_EXTENSIONS["video"]:
        file_type = "video"
    elif ext in ALLOWED_EXTENSIONS["audio"]:
        file_type = "audio"
    elif ext in ALLOWED_EXTENSIONS["document"]:
        file_type = "document"

    # Upload to storage (GridFS or Local depending on storage implementation)
    try:
        storage_id = storage.upload(content, filename=filename, folder="attachments")
        
        # In a real app, you might want to resolve of a public URL
        # For our case, we'll return a way to download it
        # Assuming the existing logo system uses /api/logo/current, 
        # let's make a generic /api/attachments/download/{id}
        
        return {
            "success": True,
            "url": f"/attachments/download/{storage_id}",
            "storage_id": storage_id,
            "filename": filename,
            "file_type": file_type,
            "file_size": file_size,
            "content_type": file.content_type
        }
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.get("/download/{storage_id}")
async def download_attachment(storage_id: str):
    try:
        from fastapi.responses import StreamingResponse
        import io
        
        content = storage.download(storage_id)
        if not content:
            raise HTTPException(status_code=404, detail="File not found")
            
        # Get filename if possible (storage utility might need to store metadata)
        # For now, generic download
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f'attachment; filename="shared_file"'}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")
