from database import db
from bson import ObjectId

def check_campaigns():
    campaigns = db["campaigns"].find().limit(5)
    for c in campaigns:
        print(f"ID: {c['_id']}, ImageID: {c.get('campaign_image_id')}, VideoID: {c.get('campaign_video_id')}")

if __name__ == "__main__":
    check_campaigns()
