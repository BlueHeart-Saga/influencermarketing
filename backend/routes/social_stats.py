from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter(prefix="/api/influencer", tags=["Social Stats"])

# Load tokens from env
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
TIKTOK_ACCESS_TOKEN = os.getenv("TIKTOK_ACCESS_TOKEN")
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")

@router.get("/social-stats")
def get_social_stats():
    stats = {}

    # 1️⃣ Instagram (Meta Graph API)
    try:
        ig_url = f"https://graph.facebook.com/v19.0/me?fields=followers_count,media_count&access_token={META_ACCESS_TOKEN}"
        ig_res = requests.get(ig_url).json()
        stats["instagram"] = {
            "followers": ig_res.get("followers_count"),
            "posts": ig_res.get("media_count")
        }
    except Exception as e:
        stats["instagram"] = {"error": str(e)}

    # 2️⃣ Facebook (Meta Graph API)
    try:
        fb_url = f"https://graph.facebook.com/v19.0/me?fields=fan_count&access_token={META_ACCESS_TOKEN}"
        fb_res = requests.get(fb_url).json()
        stats["facebook"] = {"page_likes": fb_res.get("fan_count")}
    except Exception as e:
        stats["facebook"] = {"error": str(e)}

    # 3️⃣ YouTube (YouTube Data API)
    try:
        channel_id = "UC_x5XG1OV2P6uZZ5FSM9Ttw"  # Replace with real influencer channel
        yt_url = f"https://www.googleapis.com/youtube/v3/channels?part=statistics&id={channel_id}&key={YOUTUBE_API_KEY}"
        yt_res = requests.get(yt_url).json()
        data = yt_res["items"][0]["statistics"]
        stats["youtube"] = {
            "subscribers": data.get("subscriberCount"),
            "views": data.get("viewCount"),
            "videos": data.get("videoCount")
        }
    except Exception as e:
        stats["youtube"] = {"error": str(e)}

    # 4️⃣ Twitter/X API v2
    try:
        headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
        username = "TwitterDev"  # Replace with influencer handle
        tw_url = f"https://api.twitter.com/2/users/by/username/{username}?user.fields=public_metrics"
        tw_res = requests.get(tw_url, headers=headers).json()
        stats["twitter"] = {
            "followers": tw_res["data"]["public_metrics"]["followers_count"],
            "tweets": tw_res["data"]["public_metrics"]["tweet_count"]
        }
    except Exception as e:
        stats["twitter"] = {"error": str(e)}

    # 5️⃣ TikTok API
    try:
        tk_headers = {"Authorization": f"Bearer {TIKTOK_ACCESS_TOKEN}"}
        tk_url = "https://open.tiktokapis.com/v2/user/info/"
        tk_res = requests.get(tk_url, headers=tk_headers).json()
        stats["tiktok"] = {
            "followers": tk_res["data"]["follower_count"],
            "likes": tk_res["data"]["likes_count"]
        }
    except Exception as e:
        stats["tiktok"] = {"error": str(e)}

    # 6️⃣ LinkedIn API
    try:
        li_headers = {"Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}"}
        li_url = "https://api.linkedin.com/v2/me"
        li_res = requests.get(li_url, headers=li_headers).json()
        stats["linkedin"] = {
            "id": li_res.get("id"),
            "localizedFirstName": li_res.get("localizedFirstName")
        }
    except Exception as e:
        stats["linkedin"] = {"error": str(e)}

    return stats
