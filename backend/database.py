
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.server_api import ServerApi
import os
from storage import storage

# -----------------------------
# MongoDB URIs
# -----------------------------
LOCAL_URI = "mongodb://localhost:27017"
ATLAS_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://Sagasri:srisaga143@box.c7q0mmf.mongodb.net/?retryWrites=true&w=majority"
)

# -----------------------------
# Connect to MongoDB
# -----------------------------
def create_mongo_client(uri: str):
    """Create a MongoClient with proper server API version if Atlas."""
    if "mongodb+srv" in uri:
        return MongoClient(uri, server_api=ServerApi("1"))
    return MongoClient(uri)

client = create_mongo_client(ATLAS_URI if "mongodb+srv" in ATLAS_URI else LOCAL_URI)

# Test the connection
try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB")
except Exception as e:
    print("❌ MongoDB connection error:", e)

# -----------------------------
# Database
# -----------------------------

db = client["QUICK"]

# -----------------------------
# Collections
# -----------------------------
users_collection = db["users"]
posts_collection = db["posts"]
influencer_profiles_collection = db["influencer_profiles"]
collaborations_collection = db["collaborations"]

brand_profiles_collection = db["brand_profiles"]
media_collection = db["media"]

menus_collection = db["menus"]
navbars_collection = db["navbars"]
campaigns_collection = db["campaigns"]
likes_collection = db["likes"]
bookmarks_collection = db["bookmarks"]
payments_collection = db["payments"]
brand_payments_collection = db["payments"]
init_admin_payments_collections = db["init_admin_payments"]
subscriptions_collection = db["subscriptions"]
earnings_collection = db["earnings"]
withdrawals_collection = db["withdrawals"]
influencer_withdrawals_collection =  db["withdrawals"]
logo_collection = db["logo"]
feedback_collection = db["feedback"]
help_collection = db["help_articles"]
messages_collection = db["messages"]  # messaging feature
notifications_collection = db["notifications"]
reports_collection = db["reports"]
categories_collection = db["categories"]
reviews_collection = db["reviews"]
transactions_collection = db["transactions"]

agreements_collection = db["agreements"]
content_submissions_collection = db["content_submissions"]
applications_collection = db["applications"]
autopay_collection = db["autopay_settings"]
image_generation_usage_collection = db["image_generation_usage"]
contact_submissions_collection = db["contact_submissions"]

# Admin payments collections
admin_payments_collection = db["admin_payments"]
payouts_collection = db["payouts"]

# Create indexes
def create_indexes():
    # Admin payments indexes
    admin_payments_collection.create_index([("status", ASCENDING)])
    admin_payments_collection.create_index([("payment_method", ASCENDING)])
    admin_payments_collection.create_index([("influencer_id", ASCENDING)])
    admin_payments_collection.create_index([("campaign_id", ASCENDING)])
    admin_payments_collection.create_index([("created_at", DESCENDING)])
    
    # Payouts indexes
    payouts_collection.create_index([("status", ASCENDING)])
    payouts_collection.create_index([("payment_id", ASCENDING)])
    payouts_collection.create_index([("influencer_id", ASCENDING)])
    payouts_collection.create_index([("created_at", DESCENDING)])
    
    print("✅ Database indexes created")

# Initialize indexes
create_indexes()

def get_database():
    return db

# Replaced GridFS with Azure Blob Storage instance
# Deprecating 'fs' in favor of 'storage'
fs = storage 

# -----------------------------
# Optional: Function to switch DB (Local vs Atlas)
# -----------------------------
def switch_database(use_atlas: bool = True):
    """Switch between local and Atlas DB dynamically."""
    global client, db
    client = create_mongo_client(ATLAS_URI if use_atlas else LOCAL_URI)
    db = client["QUICK"]
    print(f"🔄 Switched to {'Atlas' if use_atlas else 'Local'} MongoDB")
