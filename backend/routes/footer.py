# Create a new file: backend/routes/footer.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from database import db
from auth.utils import get_current_user

router = APIRouter(prefix="/footer", tags=["Footer Management"])

# MongoDB Collections
footer_collection = db["footer_configs"]
footer_analytics_collection = db["footer_analytics"]

# Models
class FooterLink(BaseModel):
    text: str
    url: str
    target: str = "_self"  # _self, _blank
    icon: Optional[str] = None
    order: int = 0
    is_active: bool = True

class FooterColumn(BaseModel):
    title: str
    links: List[FooterLink] = []
    order: int = 0
    is_active: bool = True

class SocialLink(BaseModel):
    platform: str  # facebook, twitter, linkedin, instagram, youtube, etc.
    url: str
    icon: str
    order: int = 0
    is_active: bool = True

class ContactInfo(BaseModel):
    type: str  # email, phone, address
    value: str
    icon: Optional[str] = None
    label: Optional[str] = None
    is_active: bool = True

class FooterConfig(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    company_name: str
    copyright_text: str
    columns: List[FooterColumn] = []
    social_links: List[SocialLink] = []
    contact_info: List[ContactInfo] = []
    newsletter_enabled: bool = True
    newsletter_title: str = "Subscribe to our newsletter"
    newsletter_description: Optional[str] = None
    show_language_switcher: bool = True
    show_app_store_badges: bool = True
    show_trust_badges: bool = True
    trust_badges: List[str] = []
    theme: Dict[str, Any] = {
        "primary_color": "#0066cc",
        "secondary_color": "#333333",
        "background_color": "#f8f9fa",
        "text_color": "#333333",
        "link_color": "#0066cc"
    }
    css_customizations: Optional[str] = None
    is_active: bool = True
    is_default: bool = False

class FooterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    company_name: Optional[str] = None
    copyright_text: Optional[str] = None
    columns: Optional[List[FooterColumn]] = None
    social_links: Optional[List[SocialLink]] = None
    contact_info: Optional[List[ContactInfo]] = None
    newsletter_enabled: Optional[bool] = None
    newsletter_title: Optional[str] = None
    newsletter_description: Optional[str] = None
    show_language_switcher: Optional[bool] = None
    show_app_store_badges: Optional[bool] = None
    show_trust_badges: Optional[bool] = None
    trust_badges: Optional[List[str]] = None
    theme: Optional[Dict[str, Any]] = None
    css_customizations: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

# Utility Functions
def serialize_footer(footer):
    if not footer:
        return None
    
    return {
        "id": str(footer["_id"]),
        "name": footer.get("name"),
        "description": footer.get("description"),
        "logo_url": footer.get("logo_url"),
        "company_name": footer.get("company_name"),
        "copyright_text": footer.get("copyright_text"),
        "columns": footer.get("columns", []),
        "social_links": footer.get("social_links", []),
        "contact_info": footer.get("contact_info", []),
        "newsletter_enabled": footer.get("newsletter_enabled", True),
        "newsletter_title": footer.get("newsletter_title"),
        "newsletter_description": footer.get("newsletter_description"),
        "show_language_switcher": footer.get("show_language_switcher", True),
        "show_app_store_badges": footer.get("show_app_store_badges", True),
        "show_trust_badges": footer.get("show_trust_badges", True),
        "trust_badges": footer.get("trust_badges", []),
        "theme": footer.get("theme", {}),
        "css_customizations": footer.get("css_customizations"),
        "is_active": footer.get("is_active", True),
        "is_default": footer.get("is_default", False),
        "created_at": footer["created_at"].isoformat() if isinstance(footer["created_at"], datetime) else footer["created_at"],
        "updated_at": footer["updated_at"].isoformat() if isinstance(footer["updated_at"], datetime) else footer["updated_at"],
        "created_by": str(footer.get("created_by")),
        "version": footer.get("version", 1)
    }

# API Routes
@router.post("/create")
async def create_footer(config: FooterConfig, current_user: dict = Depends(get_current_user)):
    """Create a new footer configuration"""
    try:
        # Check if a default footer already exists
        if config.is_default:
            # Remove default flag from existing default footer
            footer_collection.update_many(
                {"is_default": True},
                {"$set": {"is_default": False}}
            )
        
        footer_doc = {
            "_id": ObjectId(),
            **config.dict(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": ObjectId(current_user["_id"]),
            "version": 1
        }
        
        result = footer_collection.insert_one(footer_doc)
        
        return {
            "id": str(result.inserted_id),
            "message": "Footer configuration created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating footer: {str(e)}")

@router.get("/")
async def get_footers(current_user: dict = Depends(get_current_user)):
    """Get all footer configurations"""
    try:
        footers = list(footer_collection.find().sort("created_at", -1))
        return [serialize_footer(footer) for footer in footers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching footers: {str(e)}")

@router.get("/active")
async def get_active_footer():
    """Get the active footer configuration (public endpoint)"""
    try:
        # Try to get default footer first, then any active footer
        footer = footer_collection.find_one({"is_default": True, "is_active": True})
        
        if not footer:
            footer = footer_collection.find_one({"is_active": True})
        
        if not footer:
            # Return minimal default footer
            return {
                "company_name": "BRIO",
                "copyright_text": f"© {datetime.now().year} BRIO, Inc. All rights reserved.",
                "columns": [],
                "social_links": [],
                "contact_info": [],
                "is_default": True
            }
        
        return serialize_footer(footer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching active footer: {str(e)}")

@router.get("/{footer_id}")
async def get_footer(footer_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific footer configuration"""
    try:
        footer = footer_collection.find_one({"_id": ObjectId(footer_id)})
        if not footer:
            raise HTTPException(status_code=404, detail="Footer not found")
        
        return serialize_footer(footer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching footer: {str(e)}")

@router.put("/{footer_id}")
async def update_footer(footer_id: str, updates: FooterUpdate, current_user: dict = Depends(get_current_user)):
    """Update a footer configuration"""
    try:
        footer = footer_collection.find_one({"_id": ObjectId(footer_id)})
        if not footer:
            raise HTTPException(status_code=404, detail="Footer not found")
        
        update_data = {
            "updated_at": datetime.utcnow(),
            "version": footer.get("version", 1) + 1
        }
        
        # Add only provided updates
        update_dict = updates.dict(exclude_unset=True)
        for key, value in update_dict.items():
            if value is not None:
                update_data[key] = value
        
        # Handle default footer logic
        if updates.is_default:
            # Remove default flag from existing default footer
            footer_collection.update_many(
                {"is_default": True, "_id": {"$ne": ObjectId(footer_id)}},
                {"$set": {"is_default": False}}
            )
        
        result = footer_collection.update_one(
            {"_id": ObjectId(footer_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return {"message": "No changes made"}
        
        return {"message": "Footer updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating footer: {str(e)}")

@router.delete("/{footer_id}")
async def delete_footer(footer_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a footer configuration"""
    try:
        footer = footer_collection.find_one({"_id": ObjectId(footer_id)})
        if not footer:
            raise HTTPException(status_code=404, detail="Footer not found")
        
        # Don't allow deletion of default footer if it's the only one
        if footer.get("is_default"):
            other_footers = footer_collection.count_documents({"_id": {"$ne": ObjectId(footer_id)}})
            if other_footers == 0:
                raise HTTPException(status_code=400, detail="Cannot delete the only footer configuration")
        
        result = footer_collection.delete_one({"_id": ObjectId(footer_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete footer")
        
        return {"message": "Footer deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error deleting footer: {str(e)}")

@router.post("/{footer_id}/duplicate")
async def duplicate_footer(footer_id: str, current_user: dict = Depends(get_current_user)):
    """Duplicate a footer configuration"""
    try:
        footer = footer_collection.find_one({"_id": ObjectId(footer_id)})
        if not footer:
            raise HTTPException(status_code=404, detail="Footer not found")
        
        # Remove MongoDB _id and other metadata
        footer.pop("_id", None)
        footer.pop("created_at", None)
        footer.pop("updated_at", None)
        
        # Create new footer with updated metadata
        new_footer = {
            **footer,
            "_id": ObjectId(),
            "name": f"{footer['name']} (Copy)",
            "is_default": False,  # Duplicate is never default
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": ObjectId(current_user["_id"]),
            "version": 1
        }
        
        result = footer_collection.insert_one(new_footer)
        
        return {
            "id": str(result.inserted_id),
            "message": "Footer duplicated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error duplicating footer: {str(e)}")

@router.post("/{footer_id}/set-default")
async def set_default_footer(footer_id: str, current_user: dict = Depends(get_current_user)):
    """Set a footer as the default"""
    try:
        footer = footer_collection.find_one({"_id": ObjectId(footer_id)})
        if not footer:
            raise HTTPException(status_code=404, detail="Footer not found")
        
        # Remove default flag from all footers
        footer_collection.update_many(
            {},
            {"$set": {"is_default": False}}
        )
        
        # Set this footer as default
        footer_collection.update_one(
            {"_id": ObjectId(footer_id)},
            {"$set": {"is_default": True, "is_active": True, "updated_at": datetime.utcnow()}}
        )
        
        return {"message": "Footer set as default successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error setting default footer: {str(e)}")

@router.get("/preview/{footer_id}")
async def preview_footer(footer_id: str, current_user: dict = Depends(get_current_user)):
    """Generate HTML preview for a footer"""
    try:
        footer = footer_collection.find_one({"_id": ObjectId(footer_id)})
        if not footer:
            raise HTTPException(status_code=404, detail="Footer not found")
        
        # Generate HTML from footer config
        html_preview = generate_footer_html(footer)
        
        return {
            "html": html_preview,
            "css": generate_footer_css(footer)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")

def generate_footer_html(footer):
    """Generate HTML from footer configuration"""
    # This is a simplified HTML generator
    # In production, you'd want a more sophisticated template engine
    
    theme = footer.get("theme", {})
    
    html = f'''
    <footer style="background-color: {theme.get('background_color', '#f8f9fa')}; color: {theme.get('text_color', '#333333')};">
        <div class="footer-container">
            <div class="footer-top">
                <div class="footer-brand">
                    {f'<img src="{footer.get("logo_url")}" alt="{footer.get("company_name")}" style="max-height: 40px;">' if footer.get("logo_url") else ''}
                    <h3>{footer.get("company_name", "Company Name")}</h3>
                    <p>{footer.get("description", "")}</p>
                </div>
                
                <div class="footer-columns">
    '''
    
    # Add columns
    for column in footer.get("columns", []):
        if column.get("is_active", True):
            html += f'''
            <div class="footer-column">
                <h4>{column.get("title", "")}</h4>
                <ul>
            '''
            
            for link in column.get("links", []):
                if link.get("is_active", True):
                    html += f'''
                    <li>
                        <a href="{link.get("url", "#")}" target="{link.get("target", "_self")}" style="color: {theme.get('link_color', '#0066cc')};">{link.get("text", "")}</a>
                    </li>
                    '''
            
            html += '''
                </ul>
            </div>
            '''
    
    html += '''
                </div>
            </div>
            
            <div class="footer-middle">
    '''
    
    # Add social links
    social_links = footer.get("social_links", [])
    if social_links:
        html += '<div class="social-links">'
        for social in social_links:
            if social.get("is_active", True):
                html += f'''
                <a href="{social.get("url")}" target="_blank" class="social-link">
                    <i class="{social.get("icon")}"></i>
                </a>
                '''
        html += '</div>'
    
    # Add contact info
    contact_info = footer.get("contact_info", [])
    if contact_info:
        html += '<div class="contact-info">'
        for contact in contact_info:
            if contact.get("is_active", True):
                html += f'''
                <div class="contact-item">
                    <i class="{contact.get("icon")}"></i>
                    <span>{contact.get("value")}</span>
                </div>
                '''
        html += '</div>'
    
    html += '''
            </div>
            
            <div class="footer-bottom">
                <div class="copyright">
                    {footer.get("copyright_text", "")}
                </div>
                
                <div class="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/cookies">Cookie Policy</a>
                </div>
            </div>
        </div>
    </footer>
    '''
    
    return html

def generate_footer_css(footer):
    """Generate CSS from footer configuration"""
    theme = footer.get("theme", {})
    
    css = f'''
    footer {{
        background-color: {theme.get('background_color', '#f8f9fa')} !important;
        color: {theme.get('text_color', '#333333')} !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }}
    
    footer a {{
        color: {theme.get('link_color', '#0066cc')} !important;
        text-decoration: none;
        transition: color 0.3s ease;
    }}
    
    footer a:hover {{
        color: {theme.get('primary_color', '#0066cc')} !important;
        text-decoration: underline;
    }}
    
    .footer-container {{
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
    }}
    
    .footer-top {{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 40px;
        margin-bottom: 40px;
    }}
    
    .footer-brand {{
        flex: 1;
        min-width: 300px;
    }}
    
    .footer-columns {{
        display: flex;
        flex-wrap: wrap;
        gap: 40px;
        flex: 2;
    }}
    
    .footer-column {{
        flex: 1;
        min-width: 200px;
    }}
    
    .footer-column h4 {{
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 600;
        color: {theme.get('primary_color', '#0066cc')} !important;
    }}
    
    .footer-column ul {{
        list-style: none;
        padding: 0;
        margin: 0;
    }}
    
    .footer-column li {{
        margin-bottom: 10px;
    }}
    
    .footer-middle {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        padding: 20px 0;
        border-top: 1px solid rgba(0,0,0,0.1);
        border-bottom: 1px solid rgba(0,0,0,0.1);
    }}
    
    .social-links {{
        display: flex;
        gap: 15px;
    }}
    
    .social-link {{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: rgba(0,0,0,0.05);
        border-radius: 50%;
        transition: background-color 0.3s ease;
    }}
    
    .social-link:hover {{
        background-color: {theme.get('primary_color', '#0066cc')} !important;
        color: white !important;
    }}
    
    .contact-info {{
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }}
    
    .contact-item {{
        display: flex;
        align-items: center;
        gap: 10px;
    }}
    
    .footer-bottom {{
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        padding-top: 20px;
    }}
    
    .footer-links {{
        display: flex;
        gap: 20px;
    }}
    
    @media (max-width: 768px) {{
        .footer-top {{
            flex-direction: column;
        }}
        
        .footer-middle {{
            flex-direction: column;
            align-items: flex-start;
        }}
        
        .footer-bottom {{
            flex-direction: column;
            text-align: center;
        }}
    }}
    '''
    
    # Add custom CSS if provided
    if footer.get("css_customizations"):
        css += footer["css_customizations"]
    
    return css