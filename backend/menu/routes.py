# from fastapi import FastAPI, APIRouter, Depends, HTTPException, Body
# from pymongo import MongoClient

# # -------------------- MongoDB Connection --------------------
# client = MongoClient("mongodb://localhost:27017/")
# db = client["QUICK"]
# menu_collection = db["menus"]
# navbar_collection = db["navbar"]

# app = FastAPI()
# router = APIRouter()

# # -------------------- Dummy Auth (replace with JWT later) --------------------
# def get_current_user():
#     return {"role": "admin"}  # simulate login

# def check_role(user: dict, role: str):
#     if not user:
#         raise HTTPException(status_code=401, detail="Not authenticated")
#     if user["role"] != "admin" and user["role"] != role:
#         raise HTTPException(status_code=403, detail="Forbidden")


# # ============================================================
# #                          MENU ENDPOINTS
# # ============================================================

# @router.get("/menu/{role}")
# def get_menus(role: str, user=Depends(get_current_user)):
#     check_role(user, role)
#     doc = menu_collection.find_one({"role": role})
#     return {"menus": doc.get("items", []) if doc else []}


# @router.post("/menu/add")
# def add_menu_item(data: dict = Body(...), user=Depends(get_current_user)):
#     """
#     Add a menu item. Supports children.
#     Example:
#     {
#       "role": "admin",
#       "title": "Users",
#       "path": "/admin/users",
#       "icon": "👥",
#       "children": [
#           {"title": "Add", "path": "/admin/users/add", "icon": "➕"}
#       ]
#     }
#     """
#     role = data.get("role")
#     if not role:
#         raise HTTPException(status_code=400, detail="Role is required")
#     check_role(user, role)

#     new_items = []
#     if all(k in data for k in ["title", "path", "icon"]):
#         new_items = [{
#             "title": data["title"],
#             "path": data["path"],
#             "icon": data["icon"],
#             "children": data.get("children", [])
#         }]
#     elif "items" in data and isinstance(data["items"], list):
#         new_items = data["items"]
#     else:
#         raise HTTPException(status_code=400, detail="Invalid format")

#     menu_collection.update_one(
#         {"role": role},
#         {"$push": {"items": {"$each": new_items}}},
#         upsert=True
#     )
#     return {"status": "ok", "added": new_items}


# @router.put("/menu/update")
# def update_menu(data: dict = Body(...), user=Depends(get_current_user)):
#     """
#     Update a menu item (title/path/icon/children).
#     """
#     role = data.get("role")
#     old_path = data.get("oldPath")
#     if not role or not old_path:
#         raise HTTPException(status_code=400, detail="Role and oldPath required")
#     check_role(user, role)

#     updated = menu_collection.update_one(
#         {"role": role, "items.path": old_path},
#         {"$set": {
#             "items.$.title": data.get("title"),
#             "items.$.path": data.get("path"),
#             "items.$.icon": data.get("icon"),
#             "items.$.children": data.get("children", [])
#         }}
#     )
#     if updated.modified_count == 0:
#         raise HTTPException(status_code=404, detail="Menu not found")
#     return {"status": "ok", "message": "Menu updated"}


# @router.delete("/menu/remove/{role}/{path:path}")
# def remove_menu(role: str, path: str, user=Depends(get_current_user)):
#     """
#     Remove a menu item by path. If it’s inside children, it will be removed as well.
#     """
#     check_role(user, role)
#     path = f"/{path}" if not path.startswith("/") else path

#     result = menu_collection.update_one(
#         {"role": role},
#         {"$pull": {"items": {"path": path}}}
#     )

#     if result.modified_count == 0:
#         # try removing from children
#         result = menu_collection.update_one(
#             {"role": role},
#             {"$pull": {"items.$[].children": {"path": path}}}
#         )

#     if result.modified_count == 0:
#         raise HTTPException(status_code=404, detail="Menu not found")

#     return {"status": "ok", "message": "Menu removed"}


# @router.post("/menu/save")
# def save_menu_order(data: dict = Body(...), user=Depends(get_current_user)):
#     """
#     Save entire sidebar structure (with children).
#     """
#     role = data.get("role")
#     menus = data.get("menus")
#     if not role or not isinstance(menus, list):
#         raise HTTPException(status_code=400, detail="Invalid format")
#     check_role(user, role)

#     menu_collection.update_one(
#         {"role": role},
#         {"$set": {"items": menus}},
#         upsert=True
#     )
#     return {"status": "ok", "message": "Sidebar order saved"}


# # ============================================================
# #                        NAVBAR ENDPOINTS
# # ============================================================

# @router.get("/navbar/{role}")
# def get_navbar(role: str, user=Depends(get_current_user)):
#     check_role(user, role)
#     doc = navbar_collection.find_one({"role": role})
#     return {"items": doc.get("items", []) if doc else []}


# @router.post("/navbar/add")
# def add_navbar_item(data: dict = Body(...), user=Depends(get_current_user)):
#     """
#     Add navbar item. Supports children (dropdowns).
#     """
#     role = data.get("role")
#     if not role:
#         raise HTTPException(status_code=400, detail="Role is required")
#     check_role(user, role)

#     new_items = []
#     if all(k in data for k in ["title", "path", "icon"]):
#         new_items = [{
#             "title": data["title"],
#             "path": data["path"],
#             "icon": data["icon"],
#             "children": data.get("children", [])
#         }]
#     elif "items" in data and isinstance(data["items"], list):
#         new_items = data["items"]
#     else:
#         raise HTTPException(status_code=400, detail="Invalid format")

#     navbar_collection.update_one(
#         {"role": role},
#         {"$push": {"items": {"$each": new_items}}},
#         upsert=True
#     )
#     return {"status": "ok", "added": new_items}


# @router.put("/navbar/update")
# def update_navbar_item(data: dict = Body(...), user=Depends(get_current_user)):
#     role = data.get("role")
#     old_path = data.get("oldPath")
#     if not role or not old_path:
#         raise HTTPException(status_code=400, detail="Role and oldPath required")
#     check_role(user, role)

#     updated = navbar_collection.update_one(
#         {"role": role, "items.path": old_path},
#         {"$set": {
#             "items.$.title": data.get("title"),
#             "items.$.path": data.get("path"),
#             "items.$.icon": data.get("icon"),
#             "items.$.children": data.get("children", [])
#         }}
#     )
#     if updated.modified_count == 0:
#         raise HTTPException(status_code=404, detail="Navbar item not found")
#     return {"status": "ok", "message": "Navbar updated"}


# @router.delete("/navbar/remove/{role}/{path:path}")
# def remove_navbar_item(role: str, path: str, user=Depends(get_current_user)):
#     check_role(user, role)
#     path = f"/{path}" if not path.startswith("/") else path

#     result = navbar_collection.update_one(
#         {"role": role},
#         {"$pull": {"items": {"path": path}}}
#     )

#     if result.modified_count == 0:
#         result = navbar_collection.update_one(
#             {"role": role},
#             {"$pull": {"items.$[].children": {"path": path}}}
#         )

#     if result.modified_count == 0:
#         raise HTTPException(status_code=404, detail="Navbar item not found")

#     return {"status": "ok", "message": "Navbar item removed"}


# @router.post("/navbar/save")
# def save_navbar_order(data: dict = Body(...), user=Depends(get_current_user)):
#     role = data.get("role")
#     items = data.get("items")
#     if not role or not isinstance(items, list):
#         raise HTTPException(status_code=400, detail="Invalid format")
#     check_role(user, role)

#     navbar_collection.update_one(
#         {"role": role},
#         {"$set": {"items": items}},
#         upsert=True
#     )
#     return {"status": "ok", "message": "Navbar order saved"}


# # ============================================================
# #                        Mount Router
# # ============================================================
# app.include_router(router)

