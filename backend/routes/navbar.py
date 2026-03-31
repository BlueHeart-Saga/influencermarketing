# from fastapi import APIRouter, HTTPException, Depends
# from fastapi.security import OAuth2PasswordBearer
# from database import db  # your MongoDB client
# from auth.utils import decode_access_token

# router = APIRouter()
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# navbars_collection = db["navbars"]  # MongoDB collection for navbar items

# # ✅ Get Navbar items for a role
# @router.get("/{role}")
# def get_navbar(role: str, token: str = Depends(oauth2_scheme)):
#     payload = decode_access_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid token")

#     nav_items = navbars_collection.find_one({"role": role})
#     if not nav_items:
#         return {"items": []}
#     return {"items": nav_items.get("items", [])}

# # ✅ Add Navbar item (Admin only)
# @router.post("/add")
# def add_navbar_item(item: dict, token: str = Depends(oauth2_scheme)):
#     payload = decode_access_token(token)
#     if not payload or payload["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     role = item["role"]
#     existing = navbars_collection.find_one({"role": role})
#     if existing:
#         navbars_collection.update_one(
#             {"role": role},
#             {"$push": {"items": {"title": item["title"], "path": item["path"], "icon": item.get("icon", "")}}}
#         )
#     else:
#         navbars_collection.insert_one({"role": role, "items": [item]})
#     return {"message": f"Navbar item added for {role}"}

# # ✅ Remove Navbar item (Admin only)
# @router.delete("/remove/{role}/{path}")
# def remove_navbar_item(role: str, path: str, token: str = Depends(oauth2_scheme)):
#     payload = decode_access_token(token)
#     if not payload or payload["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     navbars_collection.update_one(
#         {"role": role},
#         {"$pull": {"items": {"path": path}}}
#     )
#     return {"message": f"Navbar item removed from {role}"}

