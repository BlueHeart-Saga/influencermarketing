# fastpost.py
import os
import io
from fastapi import FastAPI, APIRouter, UploadFile, Form, HTTPException, Depends, status, BackgroundTasks, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
from pymongo.server_api import ServerApi

import shutil
import json
import datetime
import requests
from typing import Optional, Dict, Any
import logging
from database import db, posts_collection, storage as storage_provider

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# For YouTube
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

# For Twitter
# import tweepy


from dotenv import load_dotenv
load_dotenv()



# For Instagram
import instaloader

# For LinkedIn
# from linkedin_v2 import linkedin


# -----------------------------
# Config / Directories
# -----------------------------
UPLOAD_DIR_IMAGES = os.path.join(os.getcwd(), "uploads/images")
UPLOAD_DIR_VIDEOS = os.path.join(os.getcwd(), "uploads/videos")
os.makedirs(UPLOAD_DIR_IMAGES, exist_ok=True)
os.makedirs(UPLOAD_DIR_VIDEOS, exist_ok=True)

# -----------------------------
# Environment Variables for API Keys
# -----------------------------
# You should set these as environment variables
INSTAGRAM_USERNAME = os.getenv("INSTAGRAM_USERNAME")
INSTAGRAM_PASSWORD = os.getenv("INSTAGRAM_PASSWORD")

YOUTUBE_CLIENT_SECRETS_FILE = os.getenv("YOUTUBE_CLIENT_SECRETS_FILE", "client_secrets.json")
YOUTUBE_CREDENTIALS_FILE = os.getenv("YOUTUBE_CREDENTIALS_FILE", "youtube_credentials.json")

TWITTER_API_KEY = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")

LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")

# Database and storage are imported from database.py

# -----------------------------
# FastAPI setup
# -----------------------------
router = APIRouter()

# -----------------------------
# Social Media Implementation Functions
# -----------------------------

def post_instagram(media_path: str, caption: str, username: str, password: str) -> Dict[str, Any]:
    """
    Post to Instagram using instaloader
    Note: Instagram API is restrictive. This uses web scraping approach.
    """
    try:
        L = instaloader.Instaloader()
        
        # Login (be cautious with credentials)
        if username and password:
            L.login(username, password)
        
        # Upload the post
        if media_path.endswith(('.jpg', '.jpeg', '.png')):
            # For images
            L.upload_picture(media_path, caption=caption)
        elif media_path.endswith(('.mp4', '.mov')):
            # For videos
            L.upload_video(media_path, caption=caption)
        
        return {"status": "success", "message": f"Posted to Instagram: {caption}"}
    except Exception as e:
        logger.error(f"Instagram posting error: {e}")
        return {"status": "error", "message": str(e)}

def post_youtube(video_path: str, title: str, description: str, credentials_file: str) -> Dict[str, Any]:
    """
    Post video to YouTube
    Requires OAuth2 credentials setup
    """
    try:
        # YouTube API setup
        SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
        
        flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
        credentials = flow.run_local_server(port=0)
        
        youtube = build('youtube', 'v3', credentials=credentials)
        
        # Upload video
        request = youtube.videos().insert(
            part="snippet,status",
            body={
                "snippet": {
                    "title": title,
                    "description": description,
                    "tags": [],
                    "categoryId": "22"  # People & Blogs category
                },
                "status": {
                    "privacyStatus": "public"
                }
            },
            media_body=MediaFileUpload(video_path)
        )
        
        response = request.execute()
        return {"status": "success", "video_id": response["id"], "message": f"Uploaded video: {title}"}
    except Exception as e:
        logger.error(f"YouTube posting error: {e}")
        return {"status": "error", "message": str(e)}

# def post_twitter(text: str, media_path: Optional[str], 
#                 api_key: str, api_secret: str, 
#                 access_token: str, access_secret: str) -> Dict[str, Any]:
#     """
#     Post to Twitter using Tweepy
#     """
#     try:
#         # Authenticate
#         auth = tweepy.OAuthHandler(api_key, api_secret)
#         auth.set_access_token(access_token, access_secret)
#         api = tweepy.API(auth)
        
#         # Upload media if provided
#         media_ids = []
#         if media_path and os.path.exists(media_path):
#             if media_path.endswith(('.jpg', '.jpeg', '.png', '.gif')):
#                 media = api.media_upload(media_path)
#                 media_ids.append(media.media_id)
#             elif media_path.endswith(('.mp4', '.mov')):
#                 # For videos, need to use chunked upload
#                 media = api.chunked_upload(media_path, media_category='tweet_video')
#                 media_ids.append(media.media_id)
        
#         # Post tweet
#         if media_ids:
#             tweet = api.update_status(status=text, media_ids=media_ids)
#         else:
#             tweet = api.update_status(status=text)
        
#         return {"status": "success", "tweet_id": tweet.id_str, "message": f"Posted to Twitter: {text}"}
#     except Exception as e:
#         logger.error(f"Twitter posting error: {e}")
#         return {"status": "error", "message": str(e)}

# def post_linkedin(text: str, media_path: Optional[str], 
#                  access_token: str, author_urn: str) -> Dict[str, Any]:
#     """
#     Post to LinkedIn
#     """
#     try:
#         # Initialize LinkedIn application
#         authentication = linkedin.LinkedInAuthentication(
#             LINKEDIN_CLIENT_ID,
#             LINKEDIN_CLIENT_SECRET,
#             'http://localhost:8000',  # Redirect URL
#             ['r_liteprofile', 'w_member_social']
#         )
#         authentication.access_token = access_token
        
#         application = linkedin.LinkedInApplication(authentication)
        
#         # Create post content
#         post_data = {
#             "author": author_urn,
#             "lifecycleState": "PUBLISHED",
#             "specificContent": {
#                 "com.linkedin.ugc.ShareContent": {
#                     "shareCommentary": {
#                         "text": text
#                     },
#                     "shareMediaCategory": "NONE"
#                 }
#             },
#             "visibility": {
#                 "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
#             }
#         }
        
        # Add media if provided
    #     if media_path and os.path.exists(media_path):
    #         # Upload media first
    #         media_response = application.upload_media(
    #             media_path, 
    #             media_type='image/jpeg' if media_path.endswith(('.jpg', '.jpeg')) else 'video/mp4'
    #         )
            
    #         if 'value' in media_response:
    #             post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
    #             post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [{
    #                 "status": "READY",
    #                 "description": {
    #                     "text": text[:200]  # Truncate for description
    #                 },
    #                 "media": media_response['value'],
    #                 "title": {
    #                     "text": "Social Media Post"
    #                 }
    #             }]
        
    #     # Submit post
    #     response = application.submit_ugc_post(post_data)
    #     return {"status": "success", "post_id": response.get('id'), "message": f"Posted to LinkedIn: {text}"}
    # except Exception as e:
    #     logger.error(f"LinkedIn posting error: {e}")
    #     return {"status": "error", "message": str(e)}

def post_facebook(media_path: str, caption: str, page_id: str, access_token: str) -> Dict[str, Any]:
    """
    Post to Facebook Page
    """
    try:
        if media_path.endswith(('.jpg', '.jpeg', '.png')):
            # Photo upload
            url = f"https://graph.facebook.com/{page_id}/photos"
            files = {'source': open(media_path, 'rb')}
            data = {
                'message': caption,
                'access_token': access_token
            }
        else:
            # Video upload (more complex, requires multiple steps)
            url = f"https://graph.facebook.com/{page_id}/videos"
            files = {'source': open(media_path, 'rb')}
            data = {
                'description': caption,
                'access_token': access_token
            }
        
        response = requests.post(url, files=files, data=data)
        result = response.json()
        
        if 'id' in result:
            return {"status": "success", "post_id": result['id'], "message": f"Posted to Facebook: {caption}"}
        else:
            return {"status": "error", "message": result.get('error', {}).get('message', 'Unknown error')}
    except Exception as e:
        logger.error(f"Facebook posting error: {e}")
        return {"status": "error", "message": str(e)}

# -----------------------------
# Endpoints
# -----------------------------

@router.post("/post/")
async def post_content(
    post_content: str = Form(...),
    platforms: str = Form(...),
    media: Optional[UploadFile] = None,
    schedule_time: Optional[str] = Form(None)
):
    """
    Post content to multiple social media platforms
    """
    try:
        platform_list = json.loads(platforms)
        results = {}
        media_id = None
        media_filename = None
        file_path = None

        # Handle media upload
        if media and media.filename:
            media_filename = media.filename
            media_type = "video" if media.content_type and media.content_type.startswith("video") else "image"
            upload_dir = UPLOAD_DIR_VIDEOS if media_type == "video" else UPLOAD_DIR_IMAGES
            file_path = os.path.join(upload_dir, media_filename)

            # Save locally
            with open(file_path, "wb") as f:
                shutil.copyfileobj(media.file, f)

            # Store in Azure Blob Storage
            media.file.seek(0)
            media_id = storage_provider.upload(media.file, filename=media_filename, folder="fastpost")

        # Post to each platform
        for platform in platform_list:
            try:
                if platform == "instagram":
                    results[platform] = post_instagram(
                        media_path=file_path,
                        caption=post_content,
                        username=INSTAGRAM_USERNAME,
                        password=INSTAGRAM_PASSWORD
                    )
                elif platform == "youtube" and file_path and media_type == "video":
                    results[platform] = post_youtube(
                        video_path=file_path,
                        title=post_content[:50] + "..." if len(post_content) > 50 else post_content,
                        description=post_content,
                        credentials_file=YOUTUBE_CREDENTIALS_FILE
                    )
                # elif platform == "twitter":
                #     results[platform] = post_twitter(
                #         text=post_content,
                #         media_path=file_path,
                #         api_key=TWITTER_API_KEY,
                #         api_secret=TWITTER_API_SECRET,
                #         access_token=TWITTER_ACCESS_TOKEN,
                #         access_secret=TWITTER_ACCESS_SECRET
                #     )
                # elif platform == "linkedin":
                #     results[platform] = post_linkedin(
                #         text=post_content,
                #         media_path=file_path,
                #         access_token=LINKEDIN_ACCESS_TOKEN,
                #         author_urn="urn:li:person:YOUR_ID"  # Replace with actual URN
                    # )
                elif platform == "facebook":
                    results[platform] = post_facebook(
                        media_path=file_path,
                        caption=post_content,
                        page_id="YOUR_PAGE_ID",  # Replace with actual page ID
                        access_token="YOUR_FACEBOOK_TOKEN"  # Replace with actual token
                    )
                else:
                    results[platform] = {"status": "error", "message": "Platform not supported or invalid media type"}
            except Exception as e:
                logger.error(f"Error posting to {platform}: {e}")
                results[platform] = {"status": "error", "message": str(e)}

        # Store post record in MongoDB
        post_record = {
            "content": post_content,
            "platforms": platform_list,
            "media_filename": media_filename,
            "media_id": str(media_id) if media_id else None,
            "results": results,
            "created_at": datetime.datetime.utcnow(),
            "scheduled_time": schedule_time
        }
        
        posts_collection.insert_one(post_record)

        # Cleanup local file if it exists
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up local file: {file_path}")
            except Exception as e:
                logger.error(f"Error cleaning up local file: {e}")

        return {
            "status": "success", 
            "details": results, 
            "media_id": str(media_id) if media_id else None,
            "post_id": str(post_record.get("_id"))
        }

    except Exception as e:
        logger.error(f"General posting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts/")
async def get_posts(limit: int = 10, skip: int = 0):
    """
    Get all posts with pagination
    """
    try:
        all_posts = list(posts_collection.find().sort("created_at", -1).skip(skip).limit(limit))
        for post in all_posts:
            post["_id"] = str(post["_id"])
            # Add public URL for media if it exists
            if post.get("media_id"):
                post["media_url"] = storage_provider.get_url(post["media_id"])
        return {"status": "success", "posts": all_posts, "count": len(all_posts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/media/{file_id:path}")
async def get_media(file_id: str):
    """
    Retrieve media from storage
    """
    try:
        # Strip any legacy prefixes or slashes
        clean_id = file_id.replace("\\", "/")
        base_name = clean_id.split("/")[-1]
        
        try:
            # Try specific fastpost folder first
            content = storage_provider.download(f"fastpost/{base_name}")
        except Exception:
            try:
                # Then try the raw file_id
                content = storage_provider.download(file_id)
            except Exception:
                # Finally try base name
                content = storage_provider.download(base_name)

        # Determine media type from filename or default to octet-stream
        media_type = "application/octet-stream"
        if base_name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            media_type = f"image/{base_name.split('.')[-1]}"
            if 'jpg' in media_type: media_type = 'image/jpeg'
        elif base_name.lower().endswith(('.mp4', '.mov', '.webm')):
            media_type = f"video/{base_name.split('.')[-1]}"
            if 'mov' in media_type: media_type = 'video/mp4'
            
        return StreamingResponse(io.BytesIO(content), media_type=media_type)
    except Exception as e:
        logger.error(f"Media retrieval error: {e}")
        raise HTTPException(status_code=404, detail="Media not found")

@router.delete("/post/{post_id}")
async def delete_post(post_id: str):
    """
    Delete a post and associated media
    """
    try:
        from bson import ObjectId
        post = posts_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Delete media from storage if exists
        if post.get("media_id"):
            try:
                storage_provider.delete(post["media_id"])
            except:
                pass  # Media might already be deleted
        
        # Delete post record
        posts_collection.delete_one({"_id": ObjectId(post_id)})
        
        return {"status": "success", "message": "Post deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Setup Instructions
# -----------------------------
# """
# SETUP INSTRUCTIONS:

# 1. Install required packages:
# pip install tweepy instaloader google-api-python-client google-auth-oauthlib google-auth-httplib2 python-linkedin

# 2. Set environment variables for API keys:
# - INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD
# - TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
# - LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ACCESS_TOKEN
# - YOUTUBE_CLIENT_SECRETS_FILE (path to client_secrets.json)

# 3. For YouTube:
#    - Create a project in Google Cloud Console
#    - Enable YouTube Data API v3
#    - Download OAuth2 credentials as client_secrets.json

# 4. For LinkedIn:
#    - Create an app in LinkedIn Developer Portal
#    - Get client ID and secret
#    - Generate access token with appropriate permissions

# 5. For Instagram:
#    - Note: Official API is restrictive
#    - instaloader uses web scraping (may violate terms of service)

# SECURITY NOTES:
# - Never commit API keys to version control
# - Use environment variables or secure secret management
# - Regularly rotate access tokens
# - Be aware of API rate limits
# """

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(router, host="0.0.0.0", port=8000)




