from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Dict, Any
import uuid
import json

from database import (
    campaigns_collection, 
    users_collection, 
    payments_collection,
    transactions_collection,
    notifications_collection
)
from auth.utils import get_current_user
from routes.accountdetails import BankAccountService
import config
import stripe
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/payments", tags=["Campaign Payments"])
stripe.api_key = config.STRIPE_SECRET_KEY

bank_account_service = BankAccountService()


class DirectPaymentRequest(BaseModel):
    campaign_id: str
    influencer_id: str
    amount: float
    payment_method: Optional[str]
    notes: Optional[str]


# ---------------------------------------------------
# HELPER FUNCTION FOR BANK ACCOUNT DATA
# ---------------------------------------------------
# In the get_payment_ready_bank_account_data function, fix the id field:
async def get_payment_ready_bank_account_data(influencer_id: str) -> Optional[Dict[str, Any]]:
    """Get bank account data formatted for payment processing"""
    try:
        # Get primary account first
        bank_account = await bank_account_service.get_primary_bank_account(influencer_id)
        
        # If no primary, get any account
        if not bank_account:
            accounts = await bank_account_service.get_bank_accounts(influencer_id)
            bank_account = accounts[0] if accounts else None
        
        if not bank_account:
            return None
        
        # Format for payment processing
        return {
            "id": str(bank_account.get("_id")),  # Convert ObjectId to string
            "account_holder_name": bank_account.get("account_holder_name"),
            "account_number": bank_account.get("account_number"),
            "masked_account": f"****{bank_account.get('account_number', '')[-4:]}" if bank_account.get('account_number') else None,
            "ifsc_code": bank_account.get("ifsc_code"),
            "bank_name": bank_account.get("bank_name"),
            "branch_name": bank_account.get("branch_name"),
            "account_type": bank_account.get("account_type"),
            "is_primary": bank_account.get("is_primary", False),
            "is_verified": bank_account.get("is_verified", False),
            "verification_status": bank_account.get("verification_status", "pending"),
            "bank_details": bank_account.get("bank_details", {}),
            "created_at": bank_account.get("created_at"),
            "updated_at": bank_account.get("updated_at")
        }
    
    except Exception as e:
        print(f"Error getting payment-ready account: {str(e)}")
        return None

# ---------------------------------------------------
# 1. GET ALL PENDING DIRECT PAYMENTS
# ---------------------------------------------------
@router.get("/pending-direct-payments")
async def get_pending_direct_payments(
    current_user: dict = Depends(get_current_user)
):
    """Get all campaigns with pending payments for direct pay"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    brand_id = str(current_user["_id"])
    
    # Find all campaigns by this brand
    campaigns = list(campaigns_collection.find({"brand_id": brand_id}))
    
    pending_payments = []
    
    for campaign in campaigns:
        campaign_id = str(campaign["_id"])
        
        for application in campaign.get("applications", []):
            # Check if application is ready for payment
            if application.get("status") in ["approved", "media_submitted"]:
                influencer_id = application["influencer_id"]
                
                # Get influencer details
                influencer = users_collection.find_one(
                    {"_id": ObjectId(influencer_id)},
                    {"username": 1, "email": 1, "profile": 1}
                )
                
                if not influencer:
                    continue
                
                # Get bank account using helper function
                bank_account = await get_payment_ready_bank_account_data(influencer_id)
                
                # Calculate amount due
                amount_due = None
                if "budget" in campaign:
                    if isinstance(campaign["budget"], dict):
                        amount_due = campaign["budget"].get("min", campaign["budget"].get("max", 0))
                    else:
                        amount_due = campaign["budget"]
                
                # Format bank account data for response
                bank_account_response = None
                if bank_account:
                    bank_account_response = {
                        "id": bank_account.get("id"),
                        "account_holder_name": bank_account.get("account_holder_name"),
                        "bank_name": bank_account.get("bank_name"),
                        "branch_name": bank_account.get("branch_name"),
                        "last4": bank_account.get("account_number", "")[-4:] if bank_account.get("account_number") else None,
                        "ifsc_code": bank_account.get("ifsc_code"),
                        "account_type": bank_account.get("account_type", "savings"),
                        "verified": bank_account.get("is_verified", False),
                        "status": bank_account.get("verification_status", "pending"),
                        "is_primary": bank_account.get("is_primary", False)
                    }
                
                pending_payments.append({
                    "application_id": application.get("application_id") or str(uuid.uuid4()),
                    "campaign_id": campaign_id,
                    "campaign_title": campaign.get("title", "Untitled Campaign"),
                    "campaign_image_id": campaign.get("image_id"),
                    "status": application.get("status", "pending"),
                    "applied_at": application.get("applied_at"),
                    "message": application.get("message"),
                    "media_submitted": "submitted_media" in application and len(application["submitted_media"]) > 0,
                    
                    "influencer": {
                        "id": influencer_id,
                        "name": influencer.get("username", "Unknown Influencer"),
                        "email": influencer.get("email"),
                        "profile": influencer.get("profile", {})
                    },
                    
                    "amount_due": amount_due,
                    "currency": campaign.get("currency", "USD"),
                    
                    "has_bank_account": bank_account is not None,
                    "bank_account": bank_account_response
                })
    
    return {
        "success": True,
        "count": len(pending_payments),
        "applications": pending_payments
    }

# ---------------------------------------------------
# 2. DIRECT PAY INFLUENCER
# ---------------------------------------------------
@router.post("/direct-pay")
async def direct_pay_influencer(
    request: DirectPaymentRequest,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    """Process direct payment to influencer's bank account using JSON body"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    brand_id = str(current_user["_id"])
    
    # Extract from request
    campaign_id = request.campaign_id
    influencer_id = request.influencer_id
    amount = request.amount
    payment_method = request.payment_method
    notes = request.notes
    
    # Validate campaign
    campaign = campaigns_collection.find_one({
        "_id": ObjectId(campaign_id),
        "brand_id": brand_id
    })
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found or unauthorized")
    
    # Validate influencer exists in campaign applications
    application_found = False
    application_data = None
    for app in campaign.get("applications", []):
        if app["influencer_id"] == influencer_id:
            application_found = True
            application_data = app
            break
    
    if not application_found:
        raise HTTPException(status_code=404, detail="Influencer not found in campaign applications")
    
    # Get influencer details
    influencer = users_collection.find_one(
        {"_id": ObjectId(influencer_id)},
        {"username": 1, "email": 1, "profile": 1}
    )
    
    if not influencer:
        raise HTTPException(status_code=404, detail="Influencer not found")
    
    # Get bank account using helper function
    bank_account = await get_payment_ready_bank_account_data(influencer_id)
    
    if not bank_account:
        raise HTTPException(status_code=400, detail="Influencer has no bank account")
    
    if not bank_account.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Influencer bank account is not verified")
    
    # Validate amount
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    # Check brand balance (if using platform wallet)
    brand_wallet = payments_collection.find_one({"user_id": brand_id, "type": "wallet"})
    if brand_wallet and brand_wallet.get("balance", 0) < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Generate payment ID
    payment_id = f"dp_{uuid.uuid4().hex[:16]}"
    
    # Create payment record
    payment_record = {
        "_id": payment_id,
        "brand_id": brand_id,
        "influencer_id": influencer_id,
        "campaign_id": campaign_id,
        "application_id": application_data.get("application_id"),
        "amount": amount,
        "currency": campaign.get("currency", "USD"),
        "payment_method": payment_method,
        "payment_type": "direct_pay",
        "status": "processing",
        "bank_account_id": bank_account.get("id"),
        "bank_details": {
            "account_holder_name": bank_account.get("account_holder_name"),
            "account_number": bank_account.get("account_number"),
            "masked_account": bank_account.get("masked_account"),
            "ifsc_code": bank_account.get("ifsc_code"),
            "bank_name": bank_account.get("bank_name"),
            "branch_name": bank_account.get("branch_name"),
            "account_type": bank_account.get("account_type")
        },
        "notes": notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Save payment record
    payments_collection.insert_one(payment_record)
    
    # 💳 INTEGRATE WITH PAYMENT PROVIDER (Stripe/PayPal/Razorpay)
    try:
        if payment_method == "stripe_connect":
            # For Stripe Connect payouts
            payout = stripe.Transfer.create(
                amount=int(amount * 100),  # Convert to cents
                currency=campaign.get("currency", "USD").lower(),
                description=f"Payment for campaign: {campaign.get('title')}"
            )
            payment_record["stripe_payout_id"] = payout.id
            payment_record["status"] = "completed"
            
        elif payment_method == "bank_transfer":
            # For manual bank transfer (record only)
            payment_record["status"] = "pending_bank_transfer"
            payment_record["instructions"] = {
                "bank_name": bank_account.get("bank_name"),
                "account_holder_name": bank_account.get("account_holder_name"),
                "account_number": bank_account.get("masked_account"),
                "ifsc_code": bank_account.get("ifsc_code"),
                "amount": amount,
                "currency": campaign.get("currency", "USD")
            }
            
        elif payment_method == "platform_wallet":
            # Deduct from brand wallet and credit influencer wallet
            if brand_wallet:
                # Deduct from brand
                payments_collection.update_one(
                    {"_id": brand_wallet["_id"]},
                    {"$inc": {"balance": -amount}}
                )
                
                # Credit influencer wallet
                influencer_wallet = payments_collection.find_one({"user_id": influencer_id, "type": "wallet"})
                if influencer_wallet:
                    payments_collection.update_one(
                        {"_id": influencer_wallet["_id"]},
                        {"$inc": {"balance": amount}}
                    )
                else:
                    payments_collection.insert_one({
                        "user_id": influencer_id,
                        "type": "wallet",
                        "balance": amount,
                        "created_at": datetime.utcnow()
                    })
                
                payment_record["status"] = "completed"
        
        # Update payment record
        payments_collection.update_one(
            {"_id": payment_id},
            {"$set": payment_record}
        )
        
        # Create transaction record
        transaction_data = {
            "_id": f"txn_{uuid.uuid4().hex[:16]}",
            "payment_id": payment_id,
            "brand_id": brand_id,
            "brand_name": current_user.get("username", "Brand"),
            "influencer_id": influencer_id,
            "influencer_name": influencer.get("username", "Influencer"),
            "campaign_id": campaign_id,
            "campaign_title": campaign.get("title"),
            "amount": amount,
            "currency": campaign.get("currency", "USD"),
            "type": "direct_payment",
            "status": payment_record["status"],
            "payment_method": payment_method,
            "created_at": datetime.utcnow()
        }
        
        transactions_collection.insert_one(transaction_data)
        
        # Update campaign application status
        campaigns_collection.update_one(
            {
                "_id": ObjectId(campaign_id),
                "applications.influencer_id": influencer_id
            },
            {
                "$set": {
                    "applications.$.status": "paid",
                    "applications.$.payment_id": payment_id,
                    "applications.$.paid_at": datetime.utcnow(),
                    "applications.$.payment_amount": amount
                }
            }
        )
        
        # Send notifications (background task)
        if background_tasks:
            background_tasks.add_task(
                send_payment_notifications,
                brand_id,
                influencer_id,
                campaign_id,
                amount,
                payment_record["status"],
                payment_id
            )
        
        return {
            "success": True,
            "message": "Payment processed successfully",
            "payment_id": payment_id,
            "status": payment_record["status"],
            "amount": amount,
            "currency": campaign.get("currency", "USD"),
            "transaction_id": transaction_data["_id"]
        }
        
    except Exception as e:
        # Update payment as failed
        payments_collection.update_one(
            {"_id": payment_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
        
        raise HTTPException(
            status_code=500,
            detail=f"Payment processing failed: {str(e)}"
        )

# ---------------------------------------------------
# 3. GET CAMPAIGN APPLICATIONS WITH ACCOUNTS
# ---------------------------------------------------
@router.get("/campaigns/{campaign_id}/applications")
async def get_campaign_applications_with_accounts(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all applications for a campaign with bank account details"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not your campaign")
    
    applications_response = []
    
    for app in campaign.get("applications", []):
        influencer_id = app["influencer_id"]
        
        influencer = users_collection.find_one(
            {"_id": ObjectId(influencer_id)},
            {"username": 1, "email": 1, "profile": 1}
        )
        
        # Get bank account using helper function
        bank_account = await get_payment_ready_bank_account_data(influencer_id)
        
        # Format bank account for response
        bank_account_response = None
        if bank_account:
            bank_account_response = {
                "id": bank_account.get("id"),
                "account_holder_name": bank_account.get("account_holder_name"),
                "bank_name": bank_account.get("bank_name"),
                "branch_name": bank_account.get("branch_name"),
                "last4": bank_account.get("account_number", "")[-4:] if bank_account.get("account_number") else None,
                "ifsc_code": bank_account.get("ifsc_code"),
                "account_type": bank_account.get("account_type", "savings"),
                "verified": bank_account.get("is_verified", False),
                "status": bank_account.get("verification_status", "pending"),
                "is_primary": bank_account.get("is_primary", False)
            }
        
        applications_response.append({
            "application_id": app.get("application_id", str(uuid.uuid4())),
            "status": app.get("status", "pending"),
            "applied_at": app.get("applied_at"),
            "message": app.get("message"),
            "submitted_media": app.get("submitted_media", []),
            "media_submitted": len(app.get("submitted_media", [])) > 0,
            
            "influencer": {
                "id": influencer_id,
                "name": influencer.get("username", "Unknown Influencer"),
                "email": influencer.get("email"),
                "profile": influencer.get("profile", {})
            },
            
            "has_bank_account": bank_account is not None,
            "bank_account": bank_account_response
        })
    
    return {
        "success": True,
        "campaign_id": campaign_id,
        "campaign_title": campaign.get("title"),
        "applications": applications_response
    }

# ---------------------------------------------------
# 4. GET PAYMENT HISTORY (Keep existing)
# ---------------------------------------------------
@router.get("/history")
async def get_payment_history(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    payment_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get payment history for brand"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    brand_id = str(current_user["_id"])
    
    # Build query
    query = {"brand_id": brand_id}
    if status:
        query["status"] = status
    if payment_type:
        query["payment_type"] = payment_type
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get payments
    payments = list(payments_collection.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit))
    
    # Get total count
    total = payments_collection.count_documents(query)
    
    # Get influencer names for each payment
    for payment in payments:
        influencer = users_collection.find_one(
            {"_id": ObjectId(payment["influencer_id"])},
            {"username": 1, "profile": 1}
        )
        if influencer:
            payment["influencer_name"] = influencer.get("username")
            payment["influencer_profile"] = influencer.get("profile", {})
        
        # Get campaign title
        campaign = campaigns_collection.find_one(
            {"_id": ObjectId(payment["campaign_id"])},
            {"title": 1}
        )
        if campaign:
            payment["campaign_title"] = campaign.get("title")
    
    return {
        "success": True,
        "payments": payments,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

# ---------------------------------------------------
# 5. GET PAYMENT DETAILS (Keep existing)
# ---------------------------------------------------
@router.get("/{payment_id}")
async def get_payment_details(
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed payment information"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    payment = payments_collection.find_one({"_id": payment_id})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Get influencer details
    influencer = users_collection.find_one(
        {"_id": ObjectId(payment["influencer_id"])},
        {"username": 1, "email": 1, "profile": 1}
    )
    
    # Get campaign details
    campaign = campaigns_collection.find_one(
        {"_id": ObjectId(payment["campaign_id"])},
        {"title": 1, "description": 1, "category": 1}
    )
    
    # Get transaction history
    transactions = list(transactions_collection.find(
        {"payment_id": payment_id}
    ).sort("created_at", -1))
    
    return {
        "success": True,
        "payment": payment,
        "influencer": influencer,
        "campaign": campaign,
        "transactions": transactions
    }

# ---------------------------------------------------
# 6. CANCEL PAYMENT (Keep existing)
# ---------------------------------------------------
@router.post("/{payment_id}/cancel")
async def cancel_payment(
    payment_id: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a pending payment"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    payment = payments_collection.find_one({"_id": payment_id})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Only allow cancellation for pending payments
    if payment["status"] not in ["pending", "processing", "pending_bank_transfer"]:
        raise HTTPException(status_code=400, detail="Cannot cancel payment in current status")
    
    # Update payment status
    updates = {
        "status": "cancelled",
        "cancelled_at": datetime.utcnow(),
        "cancellation_reason": reason,
        "updated_at": datetime.utcnow()
    }
    
    payments_collection.update_one(
        {"_id": payment_id},
        {"$set": updates}
    )
    
    # Update campaign application status
    campaigns_collection.update_one(
        {
            "_id": ObjectId(payment["campaign_id"]),
            "applications.influencer_id": payment["influencer_id"]
        },
        {
            "$set": {
                "applications.$.status": "cancelled",
                "applications.$.cancelled_at": datetime.utcnow()
            }
        }
    )
    
    # Refund to wallet if using platform wallet
    if payment.get("payment_method") == "platform_wallet":
        brand_wallet = payments_collection.find_one(
            {"user_id": payment["brand_id"], "type": "wallet"}
        )
        if brand_wallet:
            payments_collection.update_one(
                {"_id": brand_wallet["_id"]},
                {"$inc": {"balance": payment["amount"]}}
            )
    
    return {
        "success": True,
        "message": "Payment cancelled successfully",
        "payment_id": payment_id
    }

# ---------------------------------------------------
# 7. GET PAYMENT STATISTICS (Keep existing)
# ---------------------------------------------------
@router.get("/statistics")
async def get_payment_statistics(
    current_user: dict = Depends(get_current_user)
):
    """Get payment statistics for brand"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    brand_id = str(current_user["_id"])
    
    # Total payments
    total_payments = payments_collection.count_documents({"brand_id": brand_id})
    
    # Completed payments
    completed_payments = payments_collection.count_documents({
        "brand_id": brand_id,
        "status": "completed"
    })
    
    # Pending payments
    pending_payments = payments_collection.count_documents({
        "brand_id": brand_id,
        "status": {"$in": ["pending", "processing", "pending_bank_transfer"]}
    })
    
    # Total amount paid
    pipeline = [
        {"$match": {"brand_id": brand_id, "status": "completed"}},
        {"$group": {
            "_id": None,
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]
    
    result = list(payments_collection.aggregate(pipeline))
    total_amount = result[0]["total_amount"] if result else 0
    
    # Recent payments (last 30 days)
    thirty_days_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = thirty_days_ago.replace(day=thirty_days_ago.day - 30)
    
    recent_payments = payments_collection.count_documents({
        "brand_id": brand_id,
        "created_at": {"$gte": thirty_days_ago},
        "status": "completed"
    })
    
    # Payment methods distribution
    pipeline_methods = [
        {"$match": {"brand_id": brand_id}},
        {"$group": {
            "_id": "$payment_method",
            "count": {"$sum": 1},
            "total": {"$sum": "$amount"}
        }}
    ]
    
    methods_result = list(payments_collection.aggregate(pipeline_methods))
    
    return {
        "success": True,
        "statistics": {
            "total_payments": total_payments,
            "completed_payments": completed_payments,
            "pending_payments": pending_payments,
            "total_amount": total_amount,
            "recent_payments_30d": recent_payments,
            "payment_methods": methods_result
        }
    }

# ---------------------------------------------------
# 8. GET PAYMENT METHODS (Keep existing)
# ---------------------------------------------------
@router.get("/methods")
async def get_payment_methods(current_user: dict = Depends(get_current_user)):
    """Get available payment methods for brand"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    brand_id = str(current_user["_id"])
    
    # Get brand's saved payment methods
    saved_methods = list(payments_collection.find({
        "user_id": brand_id,
        "type": "payment_method"
    }))
    
    # Default available methods
    available_methods = [
        {
            "id": "bank_transfer",
            "name": "Bank Transfer",
            "description": "Direct bank transfer to influencer account",
            "fee_percentage": 0,
            "processing_time": "1-3 business days",
            "enabled": True
        },
        {
            "id": "stripe_connect",
            "name": "Stripe Connect",
            "description": "Instant payout via Stripe",
            "fee_percentage": 2.5,
            "processing_time": "Instant",
            "enabled": True  # Assuming enabled
        },
        {
            "id": "platform_wallet",
            "name": "Platform Wallet",
            "description": "Use your wallet balance",
            "fee_percentage": 0,
            "processing_time": "Instant",
            "enabled": True
        }
    ]
    
    return {
        "success": True,
        "available_methods": available_methods,
        "saved_methods": saved_methods
    }

# ---------------------------------------------------
# 9. GET WALLET BALANCE (Keep existing)
# ---------------------------------------------------
@router.get("/wallet/balance")
async def get_wallet_balance(current_user: dict = Depends(get_current_user)):
    """Get brand's wallet balance"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Brand access only")
    
    brand_id = str(current_user["_id"])
    
    wallet = payments_collection.find_one({
        "user_id": brand_id,
        "type": "wallet"
    })
    
    if not wallet:
        # Create wallet if doesn't exist
        wallet = {
            "_id": f"wallet_{uuid.uuid4().hex[:16]}",
            "user_id": brand_id,
            "type": "wallet",
            "balance": 0,
            "currency": "USD",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        payments_collection.insert_one(wallet)
    
    return {
        "success": True,
        "balance": wallet.get("balance", 0),
        "currency": wallet.get("currency", "USD")
    }

# ---------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------
async def send_payment_notifications(
    brand_id: str,
    influencer_id: str,
    campaign_id: str,
    amount: float,
    status: str,
    payment_id: str
):
    """Send notifications for payment events"""
    
    # Get brand details
    brand = users_collection.find_one(
        {"_id": ObjectId(brand_id)},
        {"username": 1, "email": 1}
    )
    
    # Get influencer details
    influencer = users_collection.find_one(
        {"_id": ObjectId(influencer_id)},
        {"username": 1, "email": 1}
    )
    
    # Get campaign details
    campaign = campaigns_collection.find_one(
        {"_id": ObjectId(campaign_id)},
        {"title": 1}
    )
    
    # Notification for influencer
    notification_influencer = {
        "_id": f"notif_{uuid.uuid4().hex[:16]}",
        "user_id": influencer_id,
        "type": "payment_received",
        "title": "Payment Received",
        "message": f"{brand.get('username', 'Brand')} sent you ${amount:.2f} for campaign '{campaign.get('title')}'",
        "data": {
            "payment_id": payment_id,
            "campaign_id": campaign_id,
            "amount": amount,
            "status": status
        },
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    # Notification for brand
    notification_brand = {
        "_id": f"notif_{uuid.uuid4().hex[:16]}",
        "user_id": brand_id,
        "type": "payment_sent",
        "title": "Payment Sent",
        "message": f"You sent ${amount:.2f} to {influencer.get('username', 'Influencer')} for campaign '{campaign.get('title')}'",
        "data": {
            "payment_id": payment_id,
            "campaign_id": campaign_id,
            "amount": amount,
            "status": status
        },
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    # Save notifications
    notifications_collection.insert_many([notification_influencer, notification_brand])