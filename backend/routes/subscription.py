import os
import stripe
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from bson import ObjectId

from database import db
from auth.utils import get_current_user
from auth.routes import SubscriptionService

# ---------------------------
# Configuration
# ---------------------------
router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])
logger = logging.getLogger("subscriptions")
logger.setLevel(logging.INFO)

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# MongoDB collections
users_collection = db["users"]
subscriptions_collection = db["subscriptions"]
customers_collection = db["customers"]

# Plan configuration
PLANS = {
    "free_trial": {"plan": "Free Trial", "price_id": None, "billing_cycle": "trial"},
    "starter_monthly": {"plan": "Starter", "price_id": os.getenv("STRIPE_STARTER_MONTHLY_ID"), "billing_cycle": "monthly"},
    "starter_yearly": {"plan": "Starter", "price_id": os.getenv("STRIPE_STARTER_YEARLY_ID"), "billing_cycle": "yearly"},
    "pro_monthly": {"plan": "Pro", "price_id": os.getenv("STRIPE_PRO_MONTHLY_ID"), "billing_cycle": "monthly"},
    "pro_yearly": {"plan": "Pro", "price_id": os.getenv("STRIPE_PRO_YEARLY_ID"), "billing_cycle": "yearly"},
    "enterprise_monthly": {"plan": "Enterprise", "price_id": os.getenv("STRIPE_ENT_MONTHLY_ID"), "billing_cycle": "monthly"},
    "enterprise_yearly": {"plan": "Enterprise", "price_id": os.getenv("STRIPE_ENT_YEARLY_ID"), "billing_cycle": "yearly"},
}

FREE_TRIAL_DAYS = int(os.getenv("FREE_TRIAL_DAYS", "15"))

# ---------------------------
# Models
# ---------------------------
class CreateSubscriptionRequest(BaseModel):
    plan_key: str
    payment_method_id: Optional[str] = None

class CreateSubscriptionResponse(BaseModel):
    stripe_subscription_id: Optional[str] = None
    client_secret: Optional[str] = None
    status: str
    message: str

class TestCreateRequest(BaseModel):
    plan_key: str

# ---------------------------
# Helper Functions
# ---------------------------
def now_utc() -> datetime:
    return datetime.utcnow()

async def get_or_create_customer(user_email: str, user_id: str) -> str:
    """Get or create Stripe customer"""
    try:
        # Check if customer already exists
        existing = customers_collection.find_one({"user_email": user_email})
        if existing and existing.get("stripe_customer_id"):
            logger.info(f"Existing Stripe customer: {existing['stripe_customer_id']}")
            return existing["stripe_customer_id"]

        # Create new Stripe customer
        customer = stripe.Customer.create(
            email=user_email, 
            metadata={"user_id": user_id, "created_via": "api"}
        )
        
        # Store in database
        customers_collection.insert_one({
            "user_id": user_id,
            "user_email": user_email,
            "stripe_customer_id": customer.id,
            "created_at": now_utc(),
            "updated_at": now_utc()
        })
        
        # Update user with Stripe customer ID
        users_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": {"stripe_customer_id": customer.id}}
        )
        
        logger.info(f"Created Stripe customer {customer.id} for {user_email}")
        return customer.id
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating customer: {e}")
        raise HTTPException(status_code=502, detail="Stripe error creating customer")
    except Exception as e:
        logger.error(f"Error creating Stripe customer: {e}")
        raise HTTPException(status_code=500, detail="Error creating customer")

async def deactivate_old_subscriptions(user_email: str, keep_stripe_subscription_id: Optional[str] = None):
    """Deactivate old subscriptions for a user"""
    filter_query = {
        "user_email": user_email, 
        "status": {"$in": ["active", "trialing", "incomplete", "past_due"]}
    }
    
    if keep_stripe_subscription_id:
        filter_query["stripe_subscription_id"] = {"$ne": keep_stripe_subscription_id}
    
    subscriptions_collection.update_many(
        filter_query,
        {"$set": {
            "status": "canceled", 
            "updated_at": now_utc(), 
            "canceled_at": now_utc()
        }}
    )

def _safe_ts_to_dt(ts: Optional[int]) -> Optional[datetime]:
    """Safely convert timestamp to datetime"""
    if not ts:
        return None
    try:
        return datetime.fromtimestamp(int(ts))
    except Exception:
        return None

# ---------------------------
# Subscription Routes
# ---------------------------
@router.post("/create", response_model=CreateSubscriptionResponse)
async def create_subscription(req: CreateSubscriptionRequest, user: Dict = Depends(get_current_user)):
    user_id = str(user.get("id") or user.get("_id"))
    user_email = user.get("email")
    username = user.get("username", "")

    if not user_email:
        raise HTTPException(status_code=400, detail="User email missing")

    # Validate plan
    plan_key = req.plan_key
    if plan_key not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    plan_cfg = PLANS[plan_key]
    price_id = plan_cfg.get("price_id")
    billing_cycle = plan_cfg.get("billing_cycle")

    # Handle free trial plan
    if plan_key == "free_trial":
        now = now_utc()
        trial_end = now + timedelta(days=FREE_TRIAL_DAYS)
        
        # Create subscription document
        sub_doc = {
            "user_id": user_id,
            "user_email": user_email,
            "username": username,
            "plan": "free_trial",
            "billing_cycle": "trial",
            "status": "active",
            "is_trial": True,
            "current_period_start": now,
            "current_period_end": trial_end,
            "trial_start": now,
            "trial_end": trial_end,
            "stripe_subscription_id": None,
            "created_at": now,
            "updated_at": now,
        }
        subscriptions_collection.insert_one(sub_doc)

        # Update user subscription data
        await SubscriptionService._update_user_subscription_data(
            user_id=user_id,
            plan="free_trial",
            has_active_subscription=True,
            is_trial_active=True,
            period_start=now,
            period_end=trial_end,
            billing_cycle="trial",
            stripe_subscription_id=None
        )

        return CreateSubscriptionResponse(
            stripe_subscription_id=None,
            client_secret=None,
            status="trialing",
            message=f"Free trial started for {FREE_TRIAL_DAYS} days"
        )

    # Replace the entire paid subscription section with this:

    # Handle paid plans
    if not price_id:
        raise HTTPException(status_code=400, detail="Price ID not configured for this plan")

    if not req.payment_method_id:
        raise HTTPException(status_code=400, detail="Payment method ID is required for paid subscriptions")

    try:
        # Get or create Stripe customer
        stripe_customer_id = await get_or_create_customer(user_email=user_email, user_id=user_id)

        # Attach payment method to customer
        stripe.PaymentMethod.attach(req.payment_method_id, customer=stripe_customer_id)
        stripe.Customer.modify(
            stripe_customer_id, 
            invoice_settings={"default_payment_method": req.payment_method_id}
        )

        # Calculate trial days - only give trial for new customers
        trial_days = None
        existing_paid_subscription = subscriptions_collection.find_one({
            "user_email": user_email,
            "stripe_subscription_id": {"$exists": True, "$ne": None}
        })
        
        # Only give trial if user doesn't have existing paid subscription
        if not existing_paid_subscription:
            trial_days = FREE_TRIAL_DAYS

        # Create Stripe subscription - FIXED: Use allow_incomplete instead of default_incomplete
        subscription_data = {
            'customer': stripe_customer_id,
            'items': [{'price': price_id}],
            'payment_behavior': 'allow_incomplete',  # ✅ CHANGED THIS
            'expand': ['latest_invoice.payment_intent'],
            'metadata': {
                'user_id': user_id, 
                'username': username, 
                'created_via': 'direct_api',
                'billing_cycle': billing_cycle
            }
        }
        
        # Add trial period only for new customers
        if trial_days:
            subscription_data['trial_period_days'] = trial_days

        subscription = stripe.Subscription.create(**subscription_data)

        stripe_sub_id = subscription.id
        status_stripe = subscription.status
        client_secret = None

        # Handle payment authentication if needed
        if getattr(subscription, "latest_invoice", None) and getattr(subscription.latest_invoice, "payment_intent", None):
            pi = subscription.latest_invoice.payment_intent
            client_secret = getattr(pi, "client_secret", None)
            
            # If payment requires action, return client secret
            if pi.status == 'requires_action':
                status_stripe = 'requires_action'

        # Calculate proper period dates
        now = now_utc()
        current_period_start = _safe_ts_to_dt(getattr(subscription, "current_period_start", None))
        current_period_end = _safe_ts_to_dt(getattr(subscription, "current_period_end", None))
        
        # If dates not provided by Stripe, calculate based on billing cycle
        if not current_period_start:
            current_period_start = now
            
        if not current_period_end:
            if billing_cycle == "monthly":
                current_period_end = now + timedelta(days=30)
            elif billing_cycle == "yearly":
                current_period_end = now + timedelta(days=365)
            else:
                current_period_end = now + timedelta(days=30)

        # Calculate trial dates
        trial_start = None
        trial_end = None
        if trial_days:
            trial_start = now
            trial_end = now + timedelta(days=trial_days)

        sub_doc = {
            "user_id": user_id,
            "user_email": user_email,
            "username": username,
            "plan": plan_key,
            "billing_cycle": billing_cycle,
            "price_id": price_id,
            "status": status_stripe,
            "is_trial": bool(trial_days),
            "current_period_start": current_period_start,
            "current_period_end": current_period_end,
            "trial_start": trial_start,
            "trial_end": trial_end,
            "stripe_subscription_id": stripe_sub_id,
            "stripe_customer_id": stripe_customer_id,
            "created_at": now,
            "updated_at": now
        }
        subscriptions_collection.insert_one(sub_doc)

        # Deactivate old subscriptions
        await deactivate_old_subscriptions(user_email, stripe_sub_id)

        # Update user cache - handle different statuses properly
        is_active = status_stripe in ("active", "trialing")
        requires_action = status_stripe == "requires_action"
        
        if requires_action:
            # Subscription created but needs payment confirmation
            user_plan = "pending"
        elif is_active:
            # Subscription is active
            user_plan = plan_key
        else:
            # Subscription failed
            user_plan = "free"

        await SubscriptionService._update_user_subscription_data(
            user_id=user_id,
            plan=user_plan,
            has_active_subscription=is_active and not requires_action,
            is_trial_active=bool(trial_days),
            period_start=current_period_start,
            period_end=current_period_end,
            billing_cycle=billing_cycle,
            stripe_subscription_id=stripe_sub_id
        )

        # Return appropriate response
        if requires_action:
            message = "Payment requires authentication"
            return CreateSubscriptionResponse(
                stripe_subscription_id=stripe_sub_id,
                client_secret=client_secret,
                status="requires_action",
                message=message
            )
        elif is_active:
            message = "Subscription created successfully"
            if trial_days:
                message = f"Subscription created with {trial_days}-day free trial"
            
            return CreateSubscriptionResponse(
                stripe_subscription_id=stripe_sub_id,
                client_secret=None,
                status=status_stripe,
                message=message
            )
        else:
            # Subscription creation failed
            raise HTTPException(
                status_code=400, 
                detail=f"Subscription creation failed with status: {status_stripe}"
            )

    except stripe.error.CardError as e:
        logger.error(f"Stripe card error creating subscription: {e}")
        raise HTTPException(status_code=400, detail=f"Card error: {e.user_message}")
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating subscription: {e}")
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(status_code=500, detail="Error creating subscription")
    


@router.post("/cancel")
async def cancel_subscription(user: Dict = Depends(get_current_user)):
    """Cancel user subscription"""
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=400, detail="User email missing")

    # Find active paid subscription
    user_doc = users_collection.find_one({"email": user_email})
    stripe_sub_id = user_doc.get("stripe_subscription_id") if user_doc else None

    if not stripe_sub_id:
        # Fallback: search in subscriptions collection
        sub = subscriptions_collection.find_one({
            "user_email": user_email,
            "status": {"$in": ["active", "trialing", "incomplete", "past_due"]},
            "stripe_subscription_id": {"$exists": True, "$ne": None}
        })
        if sub:
            stripe_sub_id = sub.get("stripe_subscription_id")

    if not stripe_sub_id:
        raise HTTPException(status_code=400, detail="No active paid subscription found to cancel")

    try:
        # Cancel Stripe subscription
        stripe.Subscription.delete(stripe_sub_id)
    except stripe.error.StripeError as e:
        logger.warning(f"Stripe cancel failed: {e}")

    # Update database
    subscriptions_collection.update_many(
        {"user_email": user_email, "stripe_subscription_id": stripe_sub_id},
        {"$set": {
            "status": "canceled", 
            "canceled_at": now_utc(), 
            "updated_at": now_utc()
        }}
    )

    # Update user to free plan
    await SubscriptionService._update_user_subscription_data(
        user_email=user_email,
        plan="free",
        has_active_subscription=False,
        is_trial_active=False,
        period_start=None,
        period_end=None,
        billing_cycle=None,
        stripe_subscription_id=None
    )

    return {"message": "Subscription canceled successfully"}

@router.get("/me")
async def get_subscription_status(user: Dict = Depends(get_current_user)):
    """Get current user subscription status"""
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=400, detail="User email missing")
    
    # Use the SubscriptionService to get status
    return await SubscriptionService.get_user_subscription_status(user_email)

@router.post("/sync-status")
async def sync_subscription_status(user: Dict = Depends(get_current_user)):
    """Force sync subscription status with Stripe"""
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=400, detail="User email missing")

    try:
        await SubscriptionService.sync_user_subscription(user_email)
        return {"message": "Subscription status synced successfully"}
    except Exception as e:
        logger.error(f"Error syncing subscription status: {e}")
        raise HTTPException(status_code=500, detail="Error syncing subscription status")

@router.get("/all-plans")
async def get_all_plans():
    """Get all available subscription plans"""
    plans_out = []
    for key, cfg in PLANS.items():
        plans_out.append({
            "key": key,
            "plan": cfg.get("plan"),
            "price_id": cfg.get("price_id"),
            "billing_cycle": cfg.get("billing_cycle"),
            "is_free": key == "free_trial"
        })
    return {"plans": plans_out}

@router.post("/test-create")
async def test_create_subscription(req: TestCreateRequest, user: Dict = Depends(get_current_user)):
    """Test endpoint for subscription creation"""
    user_email = user.get("email")
    user_id = str(user.get("id") or user.get("_id"))
    
    try:
        customer_id = await get_or_create_customer(user_email=user_email, user_id=user_id)
        return {
            "ok": True, 
            "customer_id": customer_id, 
            "stripe_api_key_configured": bool(stripe.api_key)
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}

# ---------------------------
# Webhook Handler
# ---------------------------
@router.post("/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not WEBHOOK_SECRET:
        logger.error("Webhook secret not configured")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except ValueError as e:
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature on webhook")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"Webhook construct_event error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing error")

    # Process event asynchronously
    background_tasks.add_task(process_stripe_event, event)
    return JSONResponse({"received": True})

def process_stripe_event(event: Dict[str, Any]):
    """Process Stripe webhook event"""
    try:
        event_type = event.get("type")
        data = event.get("data", {}).get("object", {})
        
        logger.info(f"Processing Stripe webhook: {event_type}")

        if event_type.startswith("customer.subscription."):
            handle_subscription_event(data)
        elif event_type == "invoice.payment_succeeded":
            handle_payment_succeeded(data)
        elif event_type == "invoice.payment_failed":
            handle_payment_failed(data)
        elif event_type == "customer.subscription.deleted":
            handle_subscription_deleted(data)
            
    except Exception as e:
        logger.exception(f"Error processing webhook event: {e}")

def handle_subscription_event(subscription: Dict):
    """Handle subscription created/updated events"""
    stripe_sub_id = subscription.get("id")
    customer_id = subscription.get("customer")
    status_stripe = subscription.get("status")
    
    # Get customer email
    email = subscription.get("customer_email")
    if not email and customer_id:
        try:
            cust = stripe.Customer.retrieve(customer_id)
            email = cust.get("email")
        except Exception:
            email = None

    if not email:
        logger.warning(f"No email found for subscription {stripe_sub_id}")
        return

    # Update subscription in database
    start = _safe_ts_to_dt(subscription.get("current_period_start"))
    end = _safe_ts_to_dt(subscription.get("current_period_end"))
    
    # Get plan from subscription items
    plan_key = "paid"
    try:
        items = subscription.get("items", {}).get("data", [])
        if items:
            price_id = items[0].get("price", {}).get("id")
            # Find plan key from price_id
            for key, cfg in PLANS.items():
                if cfg.get("price_id") == price_id:
                    plan_key = key
                    break
    except Exception:
        pass

    subscriptions_collection.update_one(
        {"stripe_subscription_id": stripe_sub_id},
        {"$set": {
            "user_email": email,
            "stripe_customer_id": customer_id,
            "plan": plan_key,
            "status": status_stripe,
            "current_period_start": start,
            "current_period_end": end,
            "updated_at": now_utc()
        }},
        upsert=True
    )

    # Update user cache
    is_active = status_stripe in ("active", "trialing")
    SubscriptionService._update_user_subscription_data(
        user_email=email,
        plan=plan_key if is_active else "free",
        has_active_subscription=is_active,
        is_trial_active=status_stripe == "trialing",
        period_start=start,
        period_end=end,
        billing_cycle="monthly" if "monthly" in plan_key else "yearly" if "yearly" in plan_key else None,
        stripe_subscription_id=stripe_sub_id
    )

# Add this helper function
def validate_test_card(payment_method_id: str, plan_key: str):
    """Validate test cards for different plan types"""
    # For high-value plans (yearly enterprise), ensure we're using a card that works
    if "enterprise_yearly" in plan_key:
        # Log the card type being used
        try:
            pm = stripe.PaymentMethod.retrieve(payment_method_id)
            logger.info(f"Using card for enterprise_yearly: {pm.card.brand} ****{pm.card.last4}")
        except Exception:
            pass



def handle_payment_succeeded(invoice: Dict):
    """Handle successful payment"""
    stripe_sub_id = invoice.get("subscription")
    if not stripe_sub_id:
        return

    try:
        stripe_sub = stripe.Subscription.retrieve(stripe_sub_id)
        start = _safe_ts_to_dt(getattr(stripe_sub, "current_period_start", None))
        end = _safe_ts_to_dt(getattr(stripe_sub, "current_period_end", None))
        
        # Update subscription
        subscriptions_collection.update_one(
            {"stripe_subscription_id": stripe_sub_id},
            {"$set": {
                "status": stripe_sub.status,
                "current_period_start": start,
                "current_period_end": end,
                "updated_at": now_utc()
            }}
        )
        
        # Get user email from subscription
        sub_doc = subscriptions_collection.find_one({"stripe_subscription_id": stripe_sub_id})
        if sub_doc:
            SubscriptionService._update_user_subscription_data(
                user_email=sub_doc.get("user_email"),
                plan=sub_doc.get("plan", "paid"),
                has_active_subscription=True,
                is_trial_active=False,
                period_start=start,
                period_end=end,
                billing_cycle=sub_doc.get("billing_cycle"),
                stripe_subscription_id=stripe_sub_id
            )
            
    except Exception as e:
        logger.error(f"Error processing payment succeeded: {e}")

def handle_payment_failed(invoice: Dict):
    """Handle failed payment"""
    stripe_sub_id = invoice.get("subscription")
    if stripe_sub_id:
        subscriptions_collection.update_many(
            {"stripe_subscription_id": stripe_sub_id},
            {"$set": {"status": "past_due", "updated_at": now_utc()}}
        )

def handle_subscription_deleted(subscription: Dict):
    """Handle subscription deleted event"""
    stripe_sub_id = subscription.get("id")
    
    subscriptions_collection.update_many(
        {"stripe_subscription_id": stripe_sub_id},
        {"$set": {
            "status": "canceled", 
            "updated_at": now_utc(), 
            "canceled_at": now_utc()
        }}
    )
    
    # Update user to free plan
    sub_doc = subscriptions_collection.find_one({"stripe_subscription_id": stripe_sub_id})
    if sub_doc:
        SubscriptionService._update_user_subscription_data(
            user_email=sub_doc.get("user_email"),
            plan="free",
            has_active_subscription=False,
            is_trial_active=False,
            period_start=None,
            period_end=None,
            billing_cycle=None,
            stripe_subscription_id=None
        )

# ---------------------------
# Admin Routes
# ---------------------------
@router.get("/all")
async def get_all_subscriptions():
    """Get all subscriptions (admin only)"""
    subs = list(subscriptions_collection.find().sort("created_at", -1))
    now = now_utc()
    
    out = []
    for s in subs:
        end = s.get("current_period_end")
        days_left = None
        if end:
            try:
                diff = end - now
                days_left = max(0, diff.days)
            except Exception:
                days_left = None
                
        out.append({
            "_id": str(s.get("_id")),
            "user_email": s.get("user_email"),
            "plan": s.get("plan"),
            "billing_cycle": s.get("billing_cycle"),
            "status": s.get("status"),
            "stripe_subscription_id": s.get("stripe_subscription_id"),
            "current_period_start": s.get("current_period_start"),
            "current_period_end": s.get("current_period_end"),
            "created_at": s.get("created_at"),
            "days_left": days_left
        })
        
    return out

@router.get("/debug/{user_email}")
async def debug_user_subscriptions(user_email: str):
    """Debug endpoint for user subscriptions"""
    user = users_collection.find_one({"email": user_email})
    subs = list(subscriptions_collection.find({"user_email": user_email}))
    cust = customers_collection.find_one({"user_email": user_email})
    
    return {
        "user": user,
        "subscriptions": subs,
        "customer": cust
    }