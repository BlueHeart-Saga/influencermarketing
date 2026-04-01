from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.utils import get_current_user
from database import db


# Import routers
from auth.routes import router as auth_router
# from auth.adminauth import router as admin_auth_router

from routes.logo import router as logo_router
from routes import menu_routes, admin_routes, youtubeapi, aisearch
from routes.campaign import router as campaign_router
from routes.automation import router as automation_router
from routes.bulkmessage import router as bulk_email_router
# from routes.settings_routes import router as settings_router
from routes.feedback_routes import router as feedback_router
from routes.help_routes import router as help_router
from collaboration.routes import router as collaboration_router
from routes.collaboration import router as collaboration_router 
from routes.chatbot import router as chatbot_router
from routes.messager import router as messager_router
from routes.chatapp import router as chatapp_router
from routes.ailink import router as ailink_router
from routes.aihashtag import router as hashtag_router
from routes.profile import router as profile_router

from routes.payment import create_payment_router as create_razorpay_router
from routes.stripepay import create_payment_router as create_stripe_router
from routes.campaign_payments import router as campaign_payment
from routes.admin_payments import router as admin_payments_router
from routes.init_admin_payments import init_admin_payments_collections


from database import payments_collection, earnings_collection, campaigns_collection, users_collection

from routes.autopay import router as autopay_router
from routes.paypalpay import create_paypal_payment_router
from routes.stripepay import create_payment_router
from routes.accountdetails import router as accountdetails_router
from routes.subscription import router as subscription_router
from routes.earnings import router as earnings_router
from routes.influenceranalytics import router as analytics_router
from routes.brandnotification import router as brandnotification_router
from routes.influencernotification import router as influencernotification_router

# from routes import campaigns, applications, messages, payments, earnings, admin
from routes.fastpost import router as fastpost_router
from routes.social_stats import router as social_stats_router
from routes.ImageGenerate import router as imagegen_router
from routes.content_generator import router as content_generator
from routes.ai import router as ai_router
from routes.contentcreator import router as content_creator_router
from routes.content_analyzer import router as content_analyzer_router
from routes.contact_routes import router as contact_router

from routes.brandAnalytics import router as brand_analytics_router
from routes.influenceranalytics import router as influencer_analytics_router

# In your main FastAPI app
from routes.footer import router as footer_router
from routes.chating import router as chating_router

from fastapi.staticfiles import StaticFiles

from auth.utils import decode_access_token

connected_users = {}



app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory="public"),
    name="static"
)

# -----------------------------
# CORS Setup
# -----------------------------
origins = [
    "http://localhost:3000",  # Local frontend
    "https://quickboxio-d0hshhejbfbtecd6.southindia-01.azurewebsites.net", # Azure current frontend,
    "https://brio.devopstrio.co.uk",  # Domain frontend,
    "https://quickboxqa-bqbcb6bxezbtaqf0.southindia-01.azurewebsites.net",  # Azure frontend,
    "https://marketingstorein.z30.web.core.windows.net",  # Azure frontend,
    
    "http://localhost:8081"  # App browser
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
# app.include_router(admin_auth_router,  tags=["Admin Auth"])
app.include_router(menu_routes.router, tags=["Menu & Navbar"])
app.include_router(logo_router, prefix="/api", tags=["Logo"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin Users"])
app.include_router(campaign_router, prefix="/api", tags=["Campaigns"])
app.include_router(automation_router, tags=["Automation"])
app.include_router(youtubeapi.router, prefix="", tags=["YouTube Influencers"])
# app.include_router(collaboration_router, prefix="/collaboration", tags=["Collaborations"])
# app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])
app.include_router(feedback_router, prefix="/api", tags=["Feedback"])
app.include_router(help_router, prefix="/api/help", tags=["Help"])
app.include_router(chatbot_router,prefix="/chatbot", tags=["Chatbot"])
app.include_router(chatapp_router, tags=["chat"])
app.include_router(messager_router, prefix="/messages")
app.include_router(ailink_router,prefix="/api", tags=["AiLink"])
app.include_router(content_generator)
app.include_router(aisearch.router, prefix="/ai", tags=["AI"])
app.include_router(hashtag_router,prefix="/ai", tags=["Hashtags"])
app.include_router(collaboration_router, prefix="/api",tags=["collaboration"])


app.include_router(brand_analytics_router, prefix="/api", tags=["Brand Analytics"])
app.include_router(influencer_analytics_router, tags=["Influencer Analytics"])


# Add this to your routers section (with other app.include_router calls)
app.include_router(contact_router, prefix="/api", tags=["Contact"])


# Create payment router
razorpay_router = create_razorpay_router(
    payments_collection=payments_collection,
    earnings_collection=earnings_collection,
    campaigns_collection=campaigns_collection,
    users_collection=users_collection,
    get_current_user=get_current_user
)

stripepay_router = create_stripe_router(
    payments_collection=payments_collection,
    earnings_collection=earnings_collection,
    campaigns_collection=campaigns_collection,
    users_collection=users_collection,
    get_current_user=get_current_user
)

# Create PayPal router with dependencies
paypalpay_router = create_paypal_payment_router(
    payments_collection=payments_collection,
    earnings_collection=earnings_collection,
    campaigns_collection=campaigns_collection,
    users_collection=users_collection,
    get_current_user=get_current_user
)

# db = get_database()

# Initialize admin payments collections
# admin_payments_collection, payouts_collection = init_admin_payments_collections(db)

# # Create admin payments router
# admin_payments_router = create_admin_payments_router(
#     payments_collection=db["payments"],
#     earnings_collection=db["earnings"],
#     campaigns_collection=db["campaigns"],
#     users_collection=db["users"],
#     get_current_user=get_current_user,
#     admin_payments_collection=admin_payments_collection,
#     payouts_collection=payouts_collection
# )


# Then include it
app.include_router(razorpay_router, prefix="/api", tags=["Razorpay Payments"])
app.include_router(stripepay_router, tags=["Stripe Payments"])
app.include_router(paypalpay_router, tags=["paypalpay"])
app.include_router(campaign_payment, prefix="/api")

app.include_router(admin_payments_router)

# ✅ NEW: Include Autopay router
app.include_router(autopay_router, tags=["Autopay"])
app.include_router(subscription_router, tags=["subscription"])

app.include_router(accountdetails_router, tags=["accountdetails"])
app.include_router(earnings_router, prefix="/api", tags=["Earnings"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(brandnotification_router, prefix="/api", tags=["Brand Notifications"])
app.include_router(influencernotification_router, prefix="/api", tags=["Influencer Notifications"])

app.include_router(fastpost_router, prefix="/fastpost")
app.include_router(social_stats_router, prefix="/api")
app.include_router(profile_router, tags=["Profiles"])
app.include_router(imagegen_router, prefix="/api", tags=["AI Image Generation"])

app.include_router(ai_router, prefix="/api", tags=["AI"])
app.include_router(content_creator_router, prefix="/api/ai", tags=["Content Creator"])
app.include_router(content_analyzer_router, prefix="/api/ai", tags=["AI"])
# app.include_router(campaigns.router, prefix="/api", tags=["Campaigns"])
# app.include_router(applications.router, prefix="/api", tags=["Applications"])
# app.include_router(messages.router, prefix="/api", tags=["Messages"])
# app.include_router(payments.router, prefix="/api", tags=["Payments"])
# app.include_router(earnings.router, prefix="/api", tags=["Earnings"])
# app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

app.include_router(footer_router)
app.include_router(chating_router, tags=["chating"])

# -----------------------------
# Root endpoint
# -----------------------------
@app.get("/")
def root():
    return {"message": "Hello from Azure!"}

@app.get("/test")
def test():
    return {"status": "working"}

@app.get("/healthz")
def health():
    return {"status": "ok"}


# NEW: Startup event for Autopay Scheduler
# -----------------------------
@app.on_event("startup")
async def startup_event():
    try:
        import asyncio
        from scheduler.autopay_scheduler import AutopayScheduler

        scheduler = AutopayScheduler()
        asyncio.create_task(scheduler.start())

        print("Scheduler started")
    except Exception as e:
        print("Scheduler error:", e)
        
        
import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)
socket_app = socketio.ASGIApp(sio)

app.mount("/socket.io", socket_app)

@sio.event
async def connect(sid, environ, auth):
    try:
        token = None
        if auth:
            token = auth.get("token")

        if not token:
            return False  # reject connection

        payload = decode_access_token(token)
        user_id = payload.get("sub")

        connected_users[user_id] = sid

        print("Socket connected:", user_id, sid)
        return True
    except Exception as e:
        print("Socket connect error:", e)
        return False

@sio.event
async def disconnect(sid):
    for uid, s in list(connected_users.items()):
        if s == sid:
            del connected_users[uid]
            break
    print("Socket disconnected:", sid)

@sio.event
async def send_message(sid, data):
    """
    Safe handler that:
    - prevents empty messages
    - resolves receiver_id if not provided
    - does not crash when keys are missing
    """

    try:
        conversation_id = data.get("conversation_id")
        content = (data.get("content") or "").strip()
        sender_id = data.get("sender_id")
        receiver_id = data.get("receiver_id")

        # 1) Block empty content unless an attachment exists
        if not content and not data.get("attachment_url"):
            print("Blocked empty message")
            return

        # 2) Resolve receiver if not passed from client
        if not receiver_id and conversation_id:
            from routes.messager import conversations_collection

            convo = conversations_collection.find_one({"_id": conversation_id})

            if convo:
                members = convo.get("participants", [])
                # receiver is the other person
                receiver_id = next((m for m in members if m != sender_id), None)

        if not receiver_id:
            print("Receiver not found, abort emit")
            return

        payload = {
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "content": content,
            "attachment_url": data.get("attachment_url"),
            "message_id": data.get("message_id"),
        }

        # 3) deliver to receiver if online
        if receiver_id in connected_users:
            await sio.emit("new_message", payload, to=connected_users[receiver_id])

        # 4) confirm back to sender
        await sio.emit("message_sent", payload, to=sid)

    except Exception as e:
        print("Socket send_message error:", e)



# -----------------------------
# Local run entrypoint
# (Azure will use gunicorn)
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
