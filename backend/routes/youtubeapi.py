# backend/routes/youtubeapi.py
import os
import ssl
import logging
from fastapi import APIRouter, HTTPException, Query
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
import urllib.request
from datetime import datetime, timedelta
import asyncio
import aiohttp
import json
from collections import defaultdict

# Fix SSL certificate issue
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Load API Key
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
if not YOUTUBE_API_KEY:
    raise RuntimeError("❌ Missing YOUTUBE_API_KEY in environment")

# Build YouTube client with better error handling
try:
    yt = build("youtube", "v3", developerKey=YOUTUBE_API_KEY, cache_discovery=False)
except Exception as e:
    logger.error(f"Failed to build YouTube client: {e}")
    yt = None

# --------- Enhanced Helper Functions ---------
def safe_youtube_call(api_call, max_retries=3):
    """Safely call YouTube API with retry logic"""
    for attempt in range(max_retries):
        try:
            if yt is None:
                raise HTTPException(status_code=500, detail="YouTube client not initialized")
            return api_call.execute()
        except HttpError as e:
            if e.resp.status in [403, 404]:
                raise HTTPException(status_code=e.resp.status, detail="YouTube API quota exceeded or resource not found")
            elif e.resp.status == 400:
                raise HTTPException(status_code=400, detail="Invalid request parameters")
            elif attempt == max_retries - 1:
                logger.error(f"YouTube API error after {max_retries} attempts: {e}")
                raise HTTPException(status_code=500, detail="YouTube API service unavailable")
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Unexpected error after {max_retries} attempts: {e}")
                raise HTTPException(status_code=500, detail="Internal server error")
    return None

def get_channel_comprehensive_stats(channel_id: str) -> Optional[Dict[str, Any]]:
    """Get comprehensive channel statistics with all available data"""
    try:
        res = safe_youtube_call(
            yt.channels().list(
                part="snippet,statistics,contentDetails,brandingSettings,status,topicDetails",
                id=channel_id
            )
        )

        if not res or "items" not in res or not res["items"]:
            return None

        item = res["items"][0]
        snippet = item.get("snippet", {})
        statistics = item.get("statistics", {})
        branding = item.get("brandingSettings", {})
        status = item.get("status", {})
        topic_details = item.get("topicDetails", {})
        
        # Safely parse statistics
        try:
            sub_count = int(statistics.get("subscriberCount", 0))
            view_count = int(statistics.get("viewCount", 0))
            video_count = int(statistics.get("videoCount", 0))
            avg_views_per_video = view_count / video_count if video_count > 0 else 0
            engagement_rate = (avg_views_per_video / sub_count * 100) if sub_count > 0 else 0
            
            # Calculate growth metrics (placeholder - would need historical data)
            growth_potential = min(sub_count / 10000, 100)  # Simplified growth metric
        except (ValueError, TypeError, ZeroDivisionError):
            sub_count = view_count = video_count = avg_views_per_video = engagement_rate = growth_potential = 0

        # Parse branding settings
        channel_branding = branding.get("channel", {})
        image_branding = branding.get("image", {})
        
        # Parse topic details
        topic_categories = topic_details.get("topicCategories", [])
        topic_ids = topic_details.get("topicIds", [])
        
        return {
            "channelId": item.get("id", ""),
            "title": snippet.get("title", "Unknown Channel"),
            "description": snippet.get("description", ""),
            "customUrl": snippet.get("customUrl", ""),
            "publishedAt": snippet.get("publishedAt", ""),
            "thumbnails": snippet.get("thumbnails", {}),
            "country": snippet.get("country", ""),
            "defaultLanguage": snippet.get("defaultLanguage", ""),
            "statistics": {
                "subscriberCount": statistics.get("subscriberCount", "0"),
                "videoCount": statistics.get("videoCount", "0"),
                "viewCount": statistics.get("viewCount", "0"),
                "hiddenSubscriberCount": statistics.get("hiddenSubscriberCount", False)
            },
            "status": {
                "privacyStatus": status.get("privacyStatus", ""),
                "isLinked": status.get("isLinked", False),
                "longUploadsStatus": status.get("longUploadsStatus", "")
            },
            "brandingSettings": {
                "channel": {
                    "title": channel_branding.get("title", ""),
                    "description": channel_branding.get("description", ""),
                    "keywords": channel_branding.get("keywords", ""),
                    "defaultTab": channel_branding.get("defaultTab", ""),
                    "trackingAnalyticsAccountId": channel_branding.get("trackingAnalyticsAccountId", ""),
                    "moderateComments": channel_branding.get("moderateComments", False),
                    "showRelatedChannels": channel_branding.get("showRelatedChannels", False),
                    "showBrowseView": channel_branding.get("showBrowseView", False),
                    "featuredChannelsTitle": channel_branding.get("featuredChannelsTitle", ""),
                    "featuredChannelsUrls": channel_branding.get("featuredChannelsUrls", [])
                },
                "image": {
                    "bannerExternalUrl": image_branding.get("bannerExternalUrl", ""),
                    "bannerImageUrl": image_branding.get("bannerImageUrl", ""),
                    "bannerMobileImageUrl": image_branding.get("bannerMobileImageUrl", "")
                }
            },
            "topicDetails": {
                "topicCategories": topic_categories,
                "topicIds": topic_ids
            },
            "influencerMetrics": {
                "engagementRate": round(engagement_rate, 2),
                "avgViewsPerVideo": round(avg_views_per_video),
                "subscriberCount": sub_count,
                "growthPotential": round(growth_potential, 2),
                "contentFrequency": calculate_content_frequency(channel_id),
                "audienceQuality": calculate_audience_quality(statistics)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Channel stats error for {channel_id}: {e}")
        return None

def calculate_content_frequency(channel_id: str) -> float:
    """Calculate content posting frequency"""
    try:
        videos_response = get_channel_videos_internal(channel_id, 20)
        videos = videos_response.get("videos", [])
        
        if len(videos) < 2:
            return 0.0
            
        # Calculate average time between videos
        dates = []
        for video in videos:
            try:
                pub_date = datetime.fromisoformat(video["publishedAt"].replace('Z', '+00:00'))
                dates.append(pub_date)
            except:
                continue
        
        if len(dates) < 2:
            return 0.0
            
        dates.sort()
        total_days = (dates[0] - dates[-1]).days
        if total_days <= 0:
            return 0.0
            
        avg_days_between = total_days / (len(dates) - 1)
        frequency_score = min(7 / avg_days_between, 10)  # Normalize to 0-10 scale
        return round(frequency_score, 2)
    except:
        return 0.0

def calculate_audience_quality(statistics: Dict) -> float:
    """Calculate audience quality score"""
    try:
        view_count = int(statistics.get("viewCount", 0))
        sub_count = int(statistics.get("subscriberCount", 0))
        video_count = int(statistics.get("videoCount", 0))
        
        if sub_count == 0 or video_count == 0:
            return 0.0
            
        # Calculate views per subscriber ratio
        views_per_sub = view_count / sub_count
        # Calculate views per video
        views_per_video = view_count / video_count
        
        # Normalize scores
        sub_engagement = min(views_per_sub / 10, 10)  # Assuming 10 views per sub is excellent
        video_performance = min(views_per_video / 100000, 10)  # Assuming 100k views per video is excellent
        
        quality_score = (sub_engagement + video_performance) / 2
        return round(quality_score, 2)
    except:
        return 0.0

def get_video_comprehensive_details(video_ids: List[str]) -> Dict[str, Any]:
    """Get comprehensive details for multiple videos"""
    try:
        if not video_ids:
            return {}
            
        stats = safe_youtube_call(
            yt.videos().list(
                part="statistics,snippet,contentDetails,status,topicDetails",
                id=",".join(video_ids[:50])
            )
        )
        
        return {item["id"]: item for item in stats.get("items", [])} if stats else {}
    except Exception as e:
        logger.error(f"Video details error: {e}")
        return {}

def get_channel_videos_internal(channel_id: str, max_results: int = 20):
    """Internal function to get channel videos"""
    try:
        # Get uploads playlist
        ch = safe_youtube_call(
            yt.channels().list(
                part="contentDetails", 
                id=channel_id
            )
        )
        
        if not ch or "items" not in ch or not ch["items"]:
            return {"videos": [], "performanceMetrics": {}}

        uploads = ch["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

        # Get videos from uploads playlist
        vids = safe_youtube_call(
            yt.playlistItems().list(
                part="snippet,contentDetails",
                playlistId=uploads,
                maxResults=max_results
            )
        )

        if not vids:
            return {"videos": [], "performanceMetrics": {}}

        video_ids = [v["contentDetails"]["videoId"] for v in vids.get("items", [])]
        video_details = get_video_comprehensive_details(video_ids)

        items = []
        total_views = 0
        total_likes = 0
        total_comments = 0
        total_duration = 0

        for v in vids.get("items", []):
            video_id = v["contentDetails"]["videoId"]
            details = video_details.get(video_id, {})
            statistics = details.get("statistics", {})
            snippet = details.get("snippet", v["snippet"])
            content_details = details.get("contentDetails", {})
            
            view_count = int(statistics.get("viewCount", 0))
            like_count = int(statistics.get("likeCount", 0))
            comment_count = int(statistics.get("commentCount", 0))
            duration = parse_duration(content_details.get("duration", "PT0M"))
            
            total_views += view_count
            total_likes += like_count
            total_comments += comment_count
            total_duration += duration

            video_data = {
                "videoId": video_id,
                "title": snippet.get("title", "Unknown Title"),
                "description": snippet.get("description", ""),
                "publishedAt": v["contentDetails"].get("videoPublishedAt", ""),
                "thumbnails": snippet.get("thumbnails", {}),
                "duration": duration,
                "categoryId": snippet.get("categoryId", ""),
                "tags": snippet.get("tags", []),
                "statistics": {
                    "viewCount": view_count,
                    "likeCount": like_count,
                    "commentCount": comment_count,
                    "favoriteCount": statistics.get("favoriteCount", 0),
                    "engagementRate": round((like_count + comment_count) / max(view_count, 1) * 100, 2)
                },
                "contentDetails": {
                    "duration": content_details.get("duration", ""),
                    "dimension": content_details.get("dimension", ""),
                    "definition": content_details.get("definition", ""),
                    "caption": content_details.get("caption", ""),
                    "licensedContent": content_details.get("licensedContent", False),
                    "contentRating": content_details.get("contentRating", {}),
                    "projection": content_details.get("projection", "")
                },
                "status": details.get("status", {})
            }
            items.append(video_data)

        # Calculate average performance metrics
        video_count = len(items)
        avg_metrics = {
            "avgViews": round(total_views / video_count) if video_count > 0 else 0,
            "avgLikes": round(total_likes / video_count) if video_count > 0 else 0,
            "avgComments": round(total_comments / video_count) if video_count > 0 else 0,
            "avgDuration": round(total_duration / video_count) if video_count > 0 else 0,
            "avgEngagementRate": round((total_likes + total_comments) / max(total_views, 1) * 100, 2)
        }

        return {
            "videos": items,
            "performanceMetrics": avg_metrics,
            "totalVideosAnalyzed": video_count
        }
    except Exception as e:
        logger.error(f"Internal channel videos error: {e}")
        return {"videos": [], "performanceMetrics": {}}

def parse_duration(duration: str) -> int:
    """Parse ISO 8601 duration to seconds"""
    try:
        if not duration.startswith('PT'):
            return 0
            
        duration = duration[2:]
        hours = minutes = seconds = 0
        
        if 'H' in duration:
            hours_str, duration = duration.split('H')
            hours = int(hours_str)
        if 'M' in duration:
            minutes_str, duration = duration.split('M')
            minutes = int(minutes_str)
        if 'S' in duration:
            seconds_str = duration.replace('S', '')
            seconds = int(seconds_str)
            
        return hours * 3600 + minutes * 60 + seconds
    except:
        return 0

def calculate_comprehensive_influencer_score(channel_data: Dict[str, Any], videos_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate comprehensive influencer score with multiple dimensions"""
    try:
        stats = channel_data.get("statistics", {})
        metrics = channel_data.get("influencerMetrics", {})
        performance_metrics = videos_data.get("performanceMetrics", {})
        
        subscriber_count = int(stats.get("subscriberCount", 0))
        engagement_rate = metrics.get("engagementRate", 0)
        video_count = int(stats.get("videoCount", 0))
        growth_potential = metrics.get("growthPotential", 0)
        content_frequency = metrics.get("contentFrequency", 0)
        audience_quality = metrics.get("audienceQuality", 0)
        
        # Calculate individual dimension scores
        popularity_score = min(subscriber_count / 1000000 * 10, 10)
        engagement_score = min(engagement_rate / 10, 5)
        content_score = min(video_count / 100, 5)
        growth_score = growth_potential
        consistency_score = content_frequency
        quality_score = audience_quality
        
        # Weighted total score
        total_score = (
            popularity_score * 0.25 +
            engagement_score * 0.25 +
            content_score * 0.15 +
            growth_score * 0.15 +
            consistency_score * 0.10 +
            quality_score * 0.10
        )
        
        return {
            "totalScore": round(total_score, 2),
            "dimensionScores": {
                "popularity": round(popularity_score, 2),
                "engagement": round(engagement_score, 2),
                "contentVolume": round(content_score, 2),
                "growthPotential": round(growth_score, 2),
                "consistency": round(consistency_score, 2),
                "audienceQuality": round(quality_score, 2)
            },
            "breakdown": {
                "subscriberCount": subscriber_count,
                "engagementRate": engagement_rate,
                "videoCount": video_count,
                "avgViews": performance_metrics.get("avgViews", 0),
                "avgEngagementRate": performance_metrics.get("avgEngagementRate", 0)
            }
        }
    except Exception as e:
        logger.error(f"Comprehensive score calculation error: {e}")
        return {"totalScore": 0, "dimensionScores": {}, "breakdown": {}}

def analyze_video_performance_trends(videos: List[Dict]) -> Dict[str, Any]:
    """Analyze video performance trends over time"""
    try:
        if len(videos) < 3:
            return {"trend": "insufficient_data", "growthRate": 0}
            
        # Sort by publish date
        sorted_videos = sorted(videos, key=lambda x: x.get("publishedAt", ""))
        
        # Analyze last 5 videos for trends
        recent_videos = sorted_videos[-5:]
        views_trend = []
        engagement_trend = []
        
        for video in recent_videos:
            views_trend.append(video["statistics"].get("viewCount", 0))
            engagement_trend.append(video["statistics"].get("engagementRate", 0))
        
        # Calculate growth rate
        if len(views_trend) >= 2:
            growth_rate = ((views_trend[-1] - views_trend[0]) / max(views_trend[0], 1)) * 100
        else:
            growth_rate = 0
            
        # Determine trend
        if growth_rate > 10:
            trend = "growing"
        elif growth_rate > -10:
            trend = "stable"
        else:
            trend = "declining"
            
        return {
            "trend": trend,
            "growthRate": round(growth_rate, 2),
            "avgRecentViews": round(sum(views_trend) / len(views_trend)),
            "avgRecentEngagement": round(sum(engagement_trend) / len(engagement_trend), 2)
        }
    except:
        return {"trend": "unknown", "growthRate": 0, "avgRecentViews": 0, "avgRecentEngagement": 0}

# --------- Enhanced Routes ---------
@router.get("/youtube/search/channels")
def search_channels(
    q: str = Query(..., min_length=1),
    max_results: int = Query(12, ge=1, le=50),
    order: str = Query("relevance"),
    min_subscribers: int = Query(0, ge=0),
    max_subscribers: int = Query(100000000, ge=0)
):
    """Search influencers by keyword with advanced filtering"""
    try:
        res = safe_youtube_call(
            yt.search().list(
                part="snippet",
                q=q,
                type="channel",
                maxResults=max_results,
                order=order
            )
        )

        items = []
        for r in res.get("items", []):
            cid = r["snippet"]["channelId"]
            channel_data = get_channel_comprehensive_stats(cid)
            if channel_data:
                # Apply subscriber filter
                sub_count = int(channel_data["statistics"].get("subscriberCount", 0))
                if min_subscribers <= sub_count <= max_subscribers:
                    # Get videos for comprehensive scoring
                    videos_data = get_channel_videos_internal(cid, 10)
                    score_data = calculate_comprehensive_influencer_score(channel_data, videos_data)
                    
                    channel_data["influencerScore"] = score_data
                    channel_data["recentPerformance"] = videos_data.get("performanceMetrics", {})
                    items.append(channel_data)
        
        # Sort by total influencer score
        items.sort(key=lambda x: x.get("influencerScore", {}).get("totalScore", 0), reverse=True)
        
        return {
            "items": items,
            "totalResults": res.get("pageInfo", {}).get("totalResults", 0),
            "searchQuery": q,
            "filtersApplied": {
                "minSubscribers": min_subscribers,
                "maxSubscribers": max_subscribers
            }
        }
    except Exception as e:
        logger.error(f"Channel search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/youtube/channel/{channel_id}")
def get_channel(channel_id: str):
    """Get comprehensive channel details"""
    channel_data = get_channel_comprehensive_stats(channel_id)
    if not channel_data:
        raise HTTPException(status_code=404, detail="Channel not found or inaccessible")
    
    # Get videos for comprehensive scoring
    videos_data = get_channel_videos_internal(channel_id, 10)
    score_data = calculate_comprehensive_influencer_score(channel_data, videos_data)
    
    channel_data["influencerScore"] = score_data
    channel_data["recentPerformance"] = videos_data.get("performanceMetrics", {})
    
    return {"item": channel_data}

@router.get("/youtube/channel/{channel_id}/videos")
def get_channel_videos(
    channel_id: str,
    max_results: int = Query(20, ge=1, le=50),
    include_details: bool = Query(True)
):
    """Get latest videos from a channel with comprehensive analytics"""
    try:
        # Get channel details first
        channel_data = get_channel_comprehensive_stats(channel_id)
        if not channel_data:
            raise HTTPException(status_code=404, detail="Channel not found")

        videos_data = get_channel_videos_internal(channel_id, max_results)
        
        # Add performance trends analysis
        performance_trends = analyze_video_performance_trends(videos_data.get("videos", []))
        
        response_data = {
            "channelInfo": channel_data,
            "videos": videos_data.get("videos", []),
            "performanceMetrics": videos_data.get("performanceMetrics", {}),
            "performanceTrends": performance_trends,
            "totalVideosAnalyzed": videos_data.get("totalVideosAnalyzed", 0)
        }
        
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Channel videos error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch videos: {str(e)}")

@router.get("/youtube/video/{video_id}")
def get_video_details(video_id: str):
    """Get comprehensive video details"""
    try:
        video_details = get_video_comprehensive_details([video_id])
        if not video_details or video_id not in video_details:
            raise HTTPException(status_code=404, detail="Video not found")
        
        video_data = video_details[video_id]
        statistics = video_data.get("statistics", {})
        snippet = video_data.get("snippet", {})
        content_details = video_data.get("contentDetails", {})
        
        # Calculate engagement metrics
        view_count = int(statistics.get("viewCount", 0))
        like_count = int(statistics.get("likeCount", 0))
        comment_count = int(statistics.get("commentCount", 0))
        favorite_count = int(statistics.get("favoriteCount", 0))
        
        engagement_rate = round((like_count + comment_count) / max(view_count, 1) * 100, 2)
        like_ratio = round(like_count / max(view_count, 1) * 100, 2)
        
        return {
            "videoId": video_id,
            "title": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "publishedAt": snippet.get("publishedAt", ""),
            "channelId": snippet.get("channelId", ""),
            "channelTitle": snippet.get("channelTitle", ""),
            "thumbnails": snippet.get("thumbnails", {}),
            "tags": snippet.get("tags", []),
            "categoryId": snippet.get("categoryId", ""),
            "liveBroadcastContent": snippet.get("liveBroadcastContent", ""),
            "statistics": {
                "viewCount": view_count,
                "likeCount": like_count,
                "commentCount": comment_count,
                "favoriteCount": favorite_count,
                "engagementRate": engagement_rate,
                "likeRatio": like_ratio
            },
            "contentDetails": {
                "duration": content_details.get("duration", ""),
                "durationSeconds": parse_duration(content_details.get("duration", "")),
                "dimension": content_details.get("dimension", ""),
                "definition": content_details.get("definition", ""),
                "caption": content_details.get("caption", ""),
                "licensedContent": content_details.get("licensedContent", False),
                "contentRating": content_details.get("contentRating", {}),
                "projection": content_details.get("projection", "")
            },
            "status": video_data.get("status", {})
        }
    except Exception as e:
        logger.error(f"Video details error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch video details: {str(e)}")

@router.get("/youtube/influencer/analyze/{channel_id}")
def analyze_influencer(channel_id: str):
    """Comprehensive influencer analysis with detailed metrics"""
    try:
        # Get comprehensive channel data
        channel_data = get_channel_comprehensive_stats(channel_id)
        if not channel_data:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        # Get recent videos for analysis
        videos_response = get_channel_videos(channel_id, max_results=20)
        videos = videos_response["videos"]
        performance_metrics = videos_response["performanceMetrics"]
        performance_trends = videos_response["performanceTrends"]
        
        # Calculate comprehensive influencer score
        score_data = calculate_comprehensive_influencer_score(channel_data, videos_response)
        
        # Determine influencer tier
        subscriber_count = int(channel_data["statistics"].get("subscriberCount", 0))
        if subscriber_count >= 1000000:
            tier = "Mega"
        elif subscriber_count >= 100000:
            tier = "Macro"
        elif subscriber_count >= 10000:
            tier = "Micro"
        else:
            tier = "Nano"
        
        # Content consistency analysis
        content_analysis = {
            "totalVideosAnalyzed": len(videos),
            "avgVideosPerWeek": channel_data["influencerMetrics"].get("contentFrequency", 0),
            "consistencyRating": "High" if channel_data["influencerMetrics"].get("contentFrequency", 0) >= 7 
                               else "Medium" if channel_data["influencerMetrics"].get("contentFrequency", 0) >= 3 
                               else "Low",
            "avgVideoDuration": performance_metrics.get("avgDuration", 0),
            "contentQuality": "High" if performance_metrics.get("avgEngagementRate", 0) > 5 
                            else "Medium" if performance_metrics.get("avgEngagementRate", 0) > 2 
                            else "Low"
        }
        
        # Audience analysis
        audience_analysis = {
            "qualityScore": channel_data["influencerMetrics"].get("audienceQuality", 0),
            "engagementLevel": "High" if channel_data["influencerMetrics"].get("engagementRate", 0) > 5 
                             else "Medium" if channel_data["influencerMetrics"].get("engagementRate", 0) > 2 
                             else "Low",
            "growthPotential": channel_data["influencerMetrics"].get("growthPotential", 0),
            "subscriberToViewRatio": round(int(channel_data["statistics"].get("viewCount", 0)) / 
                                         max(int(channel_data["statistics"].get("subscriberCount", 1)), 1), 2)
        }
        
        # Monetization potential
        monetization_potential = {
            "estimatedEarningsPerVideo": calculate_estimated_earnings(performance_metrics.get("avgViews", 0)),
            "sponsorshipValue": calculate_sponsorship_value(channel_data, performance_metrics),
            "monetizationTier": determine_monetization_tier(subscriber_count, performance_metrics.get("avgViews", 0))
        }
        
        analysis = {
            "channelInfo": channel_data,
            "influencerTier": tier,
            "influencerScore": score_data,
            "contentAnalysis": content_analysis,
            "audienceAnalysis": audience_analysis,
            "performanceMetrics": performance_metrics,
            "performanceTrends": performance_trends,
            "monetizationPotential": monetization_potential,
            "recommendations": generate_recommendations(channel_data, performance_metrics, performance_trends),
            "recentVideosSample": videos[:5]
        }
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Influencer analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze influencer: {str(e)}")

@router.get("/youtube/trending/categories")
def get_trending_categories():
    """Get popular video categories for discovery"""
    try:
        # Get video categories
        categories = safe_youtube_call(
            yt.videoCategories().list(
                part="snippet",
                regionCode="US"
            )
        )
        
        return {
            "categories": categories.get("items", []),
            "totalCategories": len(categories.get("items", []))
        }
    except Exception as e:
        logger.error(f"Categories error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

# --------- Business Logic Functions ---------
def calculate_estimated_earnings(avg_views: int) -> float:
    """Calculate estimated earnings per video based on average views"""
    # Rough estimate: $2-5 per 1000 views
    cpm_range = (2, 5)
    estimated_earnings = (avg_views / 1000) * ((cpm_range[0] + cpm_range[1]) / 2)
    return round(estimated_earnings, 2)

def calculate_sponsorship_value(channel_data: Dict, performance_metrics: Dict) -> Dict[str, Any]:
    """Calculate potential sponsorship value"""
    sub_count = int(channel_data["statistics"].get("subscriberCount", 0))
    engagement_rate = channel_data["influencerMetrics"].get("engagementRate", 0)
    avg_views = performance_metrics.get("avgViews", 0)
    
    # Basic sponsorship calculation
    base_value = sub_count * 0.01  # $0.01 per subscriber
    engagement_bonus = engagement_rate * 10  # $10 per engagement percentage point
    view_bonus = avg_views * 0.005  # $0.005 per view
    
    total_value = base_value + engagement_bonus + view_bonus
    
    return {
        "estimatedSponsorshipFee": round(total_value, 2),
        "valueTier": "Premium" if total_value > 1000 else "Mid" if total_value > 100 else "Starter",
        "factors": {
            "subscriberBase": round(base_value, 2),
            "engagementBonus": round(engagement_bonus, 2),
            "viewPerformance": round(view_bonus, 2)
        }
    }

def determine_monetization_tier(subscriber_count: int, avg_views: int) -> str:
    """Determine monetization tier"""
    if subscriber_count > 1000000 and avg_views > 500000:
        return "Elite"
    elif subscriber_count > 100000 and avg_views > 50000:
        return "Professional"
    elif subscriber_count > 10000 and avg_views > 5000:
        return "Emerging"
    else:
        return "Starter"

def generate_recommendations(channel_data: Dict, performance_metrics: Dict, trends: Dict) -> List[str]:
    """Generate personalized recommendations for the influencer"""
    recommendations = []
    
    engagement_rate = channel_data["influencerMetrics"].get("engagementRate", 0)
    content_frequency = channel_data["influencerMetrics"].get("contentFrequency", 0)
    avg_views = performance_metrics.get("avgViews", 0)
    
    if engagement_rate < 3:
        recommendations.append("Focus on improving audience engagement through community interactions")
    if content_frequency < 3:
        recommendations.append("Consider increasing content frequency to maintain audience interest")
    if trends.get("trend") == "declining":
        recommendations.append("Analyze recent content performance to reverse declining view trends")
    if avg_views < 1000:
        recommendations.append("Experiment with different content formats to increase viewership")
    
    return recommendations

@router.get("/youtube/batch/channels")
def get_multiple_channels(channel_ids: str = Query(..., description="Comma-separated channel IDs")):
    """Get multiple channels data in batch"""
    try:
        channel_id_list = [cid.strip() for cid in channel_ids.split(",") if cid.strip()]
        if len(channel_id_list) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 channels per request")
        
        channels_data = []
        for channel_id in channel_id_list:
            channel_data = get_channel_comprehensive_stats(channel_id)
            if channel_data:
                videos_data = get_channel_videos_internal(channel_id, 5)
                score_data = calculate_comprehensive_influencer_score(channel_data, videos_data)
                channel_data["influencerScore"] = score_data
                channels_data.append(channel_data)
        
        return {
            "channels": channels_data,
            "totalChannels": len(channels_data),
            "requestedChannels": len(channel_id_list)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch channels error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch batch channels: {str(e)}")