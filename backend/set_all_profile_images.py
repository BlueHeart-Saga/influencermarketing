import os
import shutil
import sys
from pymongo import MongoClient

# =========================
# GET IMAGE PATH FROM CMD
# =========================
if len(sys.argv) < 2:
    print("❌ Please provide image path")
    print("Example: python set_all_profile_images.py path/to/image.png")
    exit()

LOCAL_IMAGE_PATH = sys.argv[1]

if not os.path.exists(LOCAL_IMAGE_PATH):
    print("❌ File not found:", LOCAL_IMAGE_PATH)
    exit()

# =========================
# DB CONFIG
# =========================
ATLAS_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://Sagasri:srisaga143@box.c7q0mmf.mongodb.net/?retryWrites=true&w=majority"
)

client = MongoClient(ATLAS_URI)
db = client["QUICK"]
users_collection = db["users"]

UPLOAD_DIR = "uploads/profile"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# PROCESS
# =========================
users = users_collection.find()
count = 0

for user in users:
    user_id = str(user["_id"])

    filename = f"{user_id}.png"
    destination = os.path.join(UPLOAD_DIR, filename)

    shutil.copy(LOCAL_IMAGE_PATH, destination)

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "profile_image": f"/uploads/profile/{filename}"
            }
        }
    )

    count += 1

print(f"✅ Done! Updated {count} users.")