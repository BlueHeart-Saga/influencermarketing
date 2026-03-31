from pydantic import BaseModel
from typing import List
from pymongo import MongoClient

class MenuItem(BaseModel):
    title: str
    path: str
    icon: str

class RoleMenu(BaseModel):
    role: str
    title: str
    path: str
    icon: str

class ReorderRequest(BaseModel):
    role: str
    menus: List[MenuItem] = []
    navbar: List[RoleMenu] = []