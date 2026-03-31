# backend/pages_api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = "mongodb://localhost:27017"
client = MongoClient(MONGO_URL)
db = client["QUICK"]  # database name = QUICK
users_collection = db["users"] # database
pages_collection = db["pages"]

# Page model
class PageModel(BaseModel):
    role: str
    slug: str
    title: str
    components: list  # e.g., [{type: "text", content: "Hello"}]

# Create page
@app.post("/pages")
def create_page(page: PageModel):
    if pages_collection.find_one({"role": page.role, "slug": page.slug}):
        raise HTTPException(status_code=400, detail="Page already exists")
    pages_collection.insert_one(page.dict())
    return {"message": "Page created successfully"}

# Fetch single page
@app.get("/pages/{role}/{slug}")
def get_page(role: str, slug: str):
    page = pages_collection.find_one({"role": role, "slug": slug})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    page["_id"] = str(page["_id"])
    return page

# Fetch all pages for a role
@app.get("/pages/{role}")
def get_pages_by_role(role: str):
    pages = list(pages_collection.find({"role": role}))
    for page in pages:
        page["_id"] = str(page["_id"])
    return {"pages": pages}
