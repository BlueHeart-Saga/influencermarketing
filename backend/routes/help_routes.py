from fastapi import APIRouter, Depends, HTTPException
from database import help_collection
from auth.utils import get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from bson import ObjectId

router = APIRouter()

class HelpArticle(BaseModel):
    title: str
    content: str
    category: str = "general"
    is_published: bool = True

@router.get("/help-articles")
async def get_help_articles(category: Optional[str] = None, user=Depends(get_current_user)):
    query = {"is_published": True}
    if category:
        query["category"] = category
    
    articles = list(help_collection.find(query).sort("title", 1))
    for article in articles:
        article["_id"] = str(article["_id"])
    return articles

@router.post("/help-articles")
async def create_help_article(article: HelpArticle, admin=Depends(get_current_user)):
    article_data = {
        **article.dict(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = help_collection.insert_one(article_data)
    return {"message": "Help article created", "id": str(result.inserted_id)}

@router.put("/help-articles/{article_id}")
async def update_help_article(
    article_id: str, 
    article: HelpArticle, 
    admin=Depends(get_current_user)
):
    result = help_collection.update_one(
        {"_id": ObjectId(article_id)},
        {"$set": {**article.dict(), "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Article updated successfully"}

@router.delete("/help-articles/{article_id}")
async def delete_help_article(article_id: str, admin=Depends(get_current_user)):
    result = help_collection.delete_one({"_id": ObjectId(article_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"message": "Article deleted successfully"}