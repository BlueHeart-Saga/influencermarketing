# # backend/payments.py
# import os
# import hmac
# import hashlib
# import logging
# from datetime import datetime
# from enum import Enum
# from typing import Optional, Dict, Any

# import razorpay
# from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Form, Request
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel, Field
# from bson import ObjectId
# from bson.errors import InvalidId

# logger = logging.getLogger(__name__)

# # -------------------- Config --------------------
# RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
# RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
# RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# # -------------------- Enums --------------------
# class PaymentStatus(str, Enum):
#     PENDING = "pending"
#     COMPLETED = "completed"
#     FAILED = "failed"
#     REFUNDED = "refunded"

# # -------------------- Schemas --------------------
# class RazorpayOrderCreate(BaseModel):
#     amount: float = Field(..., gt=0)
#     currency: str = "INR"
#     campaign_id: str
#     influencer_id: str

# class RazorpayPayment(BaseModel):
#     razorpay_payment_id: str
#     razorpay_order_id: str
#     razorpay_signature: str

# # -------------------- Razorpay Service --------------------
# class RazorpayService:
#     def __init__(self):
#         self.client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

#     def create_order(self, amount: float, currency: str = "INR", notes: dict = None) -> Dict[str, Any]:
#         try:
#             order = self.client.order.create({
#                 "amount": int(amount * 100),
#                 "currency": currency,
#                 "payment_capture": 1,
#                 "notes": notes or {}
#             })
#             return {"success": True, "order_id": order["id"], "amount": amount, "currency": currency, "razorpay_key_id": RAZORPAY_KEY_ID}
#         except Exception as e:
#             logger.error(f"Order creation failed: {e}")
#             return {"success": False, "error": str(e)}

#     def verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
#         try:
#             body = f"{order_id}|{payment_id}"
#             generated = hmac.new(RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
#             return hmac.compare_digest(generated, signature)
#         except Exception as e:
#             logger.error(f"Signature verification failed: {e}")
#             return False

#     def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
#         try:
#             payment = self.client.payment.fetch(payment_id)
#             return {"success": True, "payment": payment}
#         except Exception as e:
#             logger.error(f"Fetch payment failed: {e}")
#             return {"success": False, "error": str(e)}

#     def refund_payment(self, payment_id: str, amount: Optional[float] = None, notes: Optional[dict] = None) -> Dict[str, Any]:
#         try:
#             refund_data = {}
#             if amount: refund_data["amount"] = int(amount * 100)
#             if notes: refund_data["notes"] = notes
#             refund = self.client.payment.refund(payment_id, refund_data)
#             return {"success": True, "refund_id": refund["id"], "status": refund["status"], "amount": refund.get("amount",0)/100}
#         except Exception as e:
#             logger.error(f"Refund failed: {e}")
#             return {"success": False, "error": str(e)}

# # -------------------- Payment Operations --------------------
# class PaymentOperations:
#     def __init__(self, payments_collection, earnings_collection, campaigns_collection, users_collection):
#         self.payments = payments_collection
#         self.earnings = earnings_collection
#         self.campaigns = campaigns_collection
#         self.users = users_collection

#     def _validate_id(self, id_str: str) -> ObjectId:
#         try:
#             return ObjectId(id_str)
#         except InvalidId:
#             raise HTTPException(status_code=400, detail="Invalid ID")

#     def create_payment_record(self, data: dict) -> str:
#         return str(self.payments.insert_one(data).inserted_id)

#     def update_payment_status(self, payment_id: str, status: str, transaction_id: Optional[str] = None):
#         update_data = {"status": status}
#         if transaction_id: update_data["transaction_id"] = transaction_id
#         return self.payments.update_one({"_id": self._validate_id(payment_id)}, {"$set": update_data}).modified_count > 0

#     def get_payment_by_order_id(self, order_id: str):
#         payment = self.payments.find_one({"razorpay_order_id": order_id})
#         if not payment: raise HTTPException(status_code=404, detail="Payment record not found")
#         return payment

#     def get_payment_by_id(self, payment_id: str):
#         payment = self.payments.find_one({"_id": self._validate_id(payment_id)})
#         if not payment: raise HTTPException(status_code=404, detail="Payment not found")
#         return payment

# # -------------------- Payment Router --------------------
# def create_payment_router(payments_collection, earnings_collection, campaigns_collection, users_collection, get_current_user):
#     router = APIRouter()
#     service = RazorpayService()
#     ops = PaymentOperations(payments_collection, earnings_collection, campaigns_collection, users_collection)

#     # -------- Create Order --------
#     @router.post("/payments/razorpay/create-order")
#     async def create_order(order: RazorpayOrderCreate, current_user: dict = Depends(get_current_user)):
#         notes = {"campaign_id": order.campaign_id, "influencer_id": order.influencer_id}
#         payment_result = service.create_order(order.amount, order.currency, notes)
#         if not payment_result["success"]: raise HTTPException(status_code=400, detail=payment_result["error"])
#         payment_data = {
#             "campaign_id": order.campaign_id,
#             "brand_id": str(current_user["_id"]),
#             "influencer_id": order.influencer_id,
#             "amount": order.amount,
#             "currency": order.currency,
#             "status": PaymentStatus.PENDING,
#             "razorpay_order_id": payment_result["order_id"],
#             "created_at": datetime.utcnow()
#         }
#         payment_id = ops.create_payment_record(payment_data)
#         return {**payment_result, "payment_id": payment_id}

#     # -------- Verify Payment --------
#     @router.post("/payments/razorpay/verify")
#     async def verify_payment(payment: RazorpayPayment, current_user: dict = Depends(get_current_user)):
#         payment_record = ops.get_payment_by_order_id(payment.razorpay_order_id)
#         if not service.verify_signature(payment.razorpay_order_id, payment.razorpay_payment_id, payment.razorpay_signature):
#             ops.update_payment_status(str(payment_record["_id"]), PaymentStatus.FAILED)
#             raise HTTPException(status_code=400, detail="Invalid signature")
#         payment_details = service.get_payment_details(payment.razorpay_payment_id)
#         if not payment_details["success"]:
#             ops.update_payment_status(str(payment_record["_id"]), PaymentStatus.FAILED)
#             raise HTTPException(status_code=400, detail=payment_details["error"])
#         if payment_details["payment"]["status"] != "captured":
#             ops.update_payment_status(str(payment_record["_id"]), PaymentStatus.FAILED)
#             raise HTTPException(status_code=400, detail="Payment not captured")
#         ops.update_payment_status(str(payment_record["_id"]), PaymentStatus.COMPLETED, payment.razorpay_payment_id)
#         return {"message": "Payment verified", "payment_id": str(payment_record["_id"])}

#     # -------- Razorpay Webhook --------
#     @router.post("/payments/razorpay/webhook")
#     async def razorpay_webhook(request: Request):
#         body = await request.body()
#         signature = request.headers.get("X-Razorpay-Signature", "")
#         expected_signature = hmac.new(RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
#         if not hmac.compare_digest(signature, expected_signature):
#             return JSONResponse(status_code=400, content={"error": "Invalid signature"})

#         payload = await request.json()
#         event = payload.get("event")
#         payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
#         order_id = payment_entity.get("order_id")
#         payment_id = payment_entity.get("id")

#         if order_id and payment_id:
#             payment_record = payments_collection.find_one({"razorpay_order_id": order_id})
#             if payment_record:
#                 if event == "payment.captured":
#                     ops.update_payment_status(str(payment_record["_id"]), PaymentStatus.COMPLETED, payment_id)
#                 elif event == "payment.failed":
#                     ops.update_payment_status(str(payment_record["_id"]), PaymentStatus.FAILED)

#         return JSONResponse(status_code=200, content={"status": "success"})

#     return router


#     @router.get("/campaigns/{campaign_id}/influencer-details")
#     async def get_influencer_details(campaign_id: str, current_user: dict = Depends(get_current_user)):
#         # Only brand can view
#         if current_user["role"] != "brand":
#             raise HTTPException(status_code=403, detail="Unauthorized")
        
#         campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
#         if not campaign or campaign["brand_id"] != str(current_user["_id"]):
#             raise HTTPException(status_code=403, detail="Unauthorized")
        
#         # Only show after payment is ready/confirmed
#         if campaign.get("status") != "confirmed":
#             raise HTTPException(status_code=400, detail="Influencer details are not available yet")
        
#         influencer = users_collection.find_one({"_id": ObjectId(campaign["influencer_id"])})
#         return {
#             "username": influencer["username"],
#             "email": influencer["email"],
#             "phone": influencer.get("phone"),
#             "payout_account_id": influencer.get("payout_account_id")
#         }
        
        
# backend/payments.py
# backend/payments.py
import os
import hmac
import hashlib
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

import razorpay
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from bson.errors import InvalidId

# -------------------- Logging Configuration --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- Configuration --------------------
RAZORPAY_CONFIG = {
    "key_id": os.getenv("RAZORPAY_KEY_ID", "rzp_test_your_key_here"),
    "key_secret": os.getenv("RAZORPAY_KEY_SECRET", "your_secret_here"),
    "webhook_secret": os.getenv("RAZORPAY_WEBHOOK_SECRET", "your_webhook_secret_here")
}

# -------------------- Enums --------------------
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PROCESSING = "processing"

class EarningStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONTRACTED = "contracted"
    MEDIA_SUBMITTED = "media_submitted"
    COMPLETED = "completed"

# -------------------- Pydantic Schemas --------------------
class RazorpayOrderCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in base currency (not paise)")
    currency: str = Field("INR", description="Currency code")
    campaign_id: str = Field(..., description="Campaign ID")
    influencer_id: str = Field(..., description="Influencer ID")
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class RazorpayPayment(BaseModel):
    razorpay_payment_id: str = Field(..., description="Razorpay Payment ID")
    razorpay_order_id: str = Field(..., description="Razorpay Order ID")
    razorpay_signature: str = Field(..., description="Payment signature")

class PaymentResponse(BaseModel):
    success: bool
    message: str
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None

# -------------------- Razorpay Service --------------------
class RazorpayService:
    def __init__(self):
        self.key_id = RAZORPAY_CONFIG["key_id"]
        self.key_secret = RAZORPAY_CONFIG["key_secret"]
        self.webhook_secret = RAZORPAY_CONFIG["webhook_secret"]
        
        if not self.key_id or not self.key_secret:
            logger.error("Razorpay credentials not configured")
            raise Exception("Razorpay credentials not configured")
        
        self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        logger.info("✅ Razorpay service initialized successfully")

    def create_order(self, amount: float, currency: str = "INR", notes: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create Razorpay order"""
        try:
            # Convert amount to paise (smallest currency unit)
            amount_in_paise = int(amount * 100)
            
            order_data = {
                "amount": amount_in_paise,
                "currency": currency,
                "payment_capture": 1,  # Auto capture payment
                "notes": notes or {}
            }
            
            logger.info(f"Creating Razorpay order with data: {order_data}")
            order = self.client.order.create(data=order_data)
            
            logger.info(f"✅ Razorpay order created: {order['id']}")
            return {
                "success": True, 
                "order_id": order["id"],
                "amount": amount,
                "currency": currency,
                "razorpay_key_id": self.key_id
            }
            
        except Exception as e:
            logger.error(f"❌ Razorpay order creation failed: {str(e)}")
            return {"success": False, "error": str(e)}

    def verify_payment_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        """Verify Razorpay payment signature"""
        try:
            # Create the message string in the format: order_id|payment_id
            message = f"{order_id}|{payment_id}"
            
            # Generate expected signature
            expected_signature = hmac.new(
                self.key_secret.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            logger.info(f"🔐 Signature verification - Expected: {expected_signature}, Received: {signature}")
            
            # Compare signatures securely
            is_valid = hmac.compare_digest(expected_signature, signature)
            if is_valid:
                logger.info("✅ Payment signature verified successfully")
            else:
                logger.error("❌ Payment signature verification failed")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"❌ Signature verification failed: {str(e)}")
            return False

    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """Fetch payment details from Razorpay"""
        try:
            payment = self.client.payment.fetch(payment_id)
            logger.info(f"✅ Payment details fetched - Status: {payment.get('status')}")
            return {"success": True, "payment": payment}
            
        except Exception as e:
            logger.error(f"❌ Fetch payment failed: {str(e)}")
            return {"success": False, "error": str(e)}

# -------------------- Payment Operations --------------------
class PaymentOperations:
    def __init__(self, payments_collection, earnings_collection, campaigns_collection, users_collection):
        self.payments = payments_collection
        self.earnings = earnings_collection
        self.campaigns = campaigns_collection
        self.users = users_collection

    def _validate_object_id(self, id_str: str) -> ObjectId:
        """Validate and convert string to ObjectId"""
        try:
            return ObjectId(id_str)
        except InvalidId:
            raise HTTPException(status_code=400, detail=f"Invalid ID format: {id_str}")

    def create_payment_record(self, data: Dict[str, Any]) -> str:
        """Create a new payment record"""
        try:
            result = self.payments.insert_one(data)
            payment_id = str(result.inserted_id)
            logger.info(f"✅ Payment record created: {payment_id}")
            return payment_id
        except Exception as e:
            logger.error(f"❌ Failed to create payment record: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create payment record")

    def update_payment_status(self, payment_id: str, status: PaymentStatus, transaction_id: Optional[str] = None) -> bool:
        """Update payment status"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            if transaction_id:
                update_data["transaction_id"] = transaction_id
                
            result = self.payments.update_one(
                {"_id": self._validate_object_id(payment_id)},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                logger.info(f"✅ Payment {payment_id} status updated to: {status}")
                return True
            else:
                logger.warning(f"⚠️ No payment found with ID: {payment_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to update payment status: {str(e)}")
            return False

    def create_earning_record(self, data: Dict[str, Any]) -> str:
        """Create earning record for influencer"""
        try:
            result = self.earnings.insert_one(data)
            earning_id = str(result.inserted_id)
            logger.info(f"✅ Earning record created: {earning_id}")
            return earning_id
        except Exception as e:
            logger.error(f"❌ Failed to create earning record: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create earning record")

    def get_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Get campaign details"""
        campaign = self.campaigns.find_one({"_id": self._validate_object_id(campaign_id)})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return campaign

    def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user details"""
        user = self.users.find_one({"_id": self._validate_object_id(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def get_payment_by_order_id(self, razorpay_order_id: str) -> Dict[str, Any]:
        """Get payment record by Razorpay order ID"""
        payment = self.payments.find_one({"razorpay_order_id": razorpay_order_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        payment["_id"] = str(payment["_id"])
        return payment

    def update_campaign_application_status(self, campaign_id: str, influencer_id: str, status: ApplicationStatus) -> bool:
        """Update campaign application status after payment"""
        try:
            logger.info(f"🔄 Updating campaign application status - Campaign: {campaign_id}, Influencer: {influencer_id}, Status: {status}")
            
            # Find the campaign
            campaign = self.campaigns.find_one({"_id": self._validate_object_id(campaign_id)})
            if not campaign:
                logger.error(f"❌ Campaign not found: {campaign_id}")
                return False

            # Find the specific application for this influencer
            application_found = False
            for application in campaign.get("applications", []):
                if application.get("influencer_id") == influencer_id:
                    application_found = True
                    logger.info(f"✅ Found application for influencer: {influencer_id}")
                    break

            if not application_found:
                logger.error(f"❌ Application not found for influencer: {influencer_id}")
                return False

            # Update the application status
            result = self.campaigns.update_one(
                {
                    "_id": self._validate_object_id(campaign_id),
                    "applications.influencer_id": influencer_id
                },
                {
                    "$set": {
                        "applications.$.status": status,
                        "applications.$.completed_at": datetime.utcnow() if status == ApplicationStatus.COMPLETED else None
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"✅ Campaign application status updated to: {status}")
                return True
            else:
                logger.warning(f"⚠️ No application updated for campaign: {campaign_id}, influencer: {influencer_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to update campaign application status: {str(e)}")
            return False

    def validate_campaign_payment_eligibility(self, campaign_id: str, influencer_id: str, brand_id: str) -> bool:
        """Validate if campaign is eligible for payment"""
        try:
            campaign = self.get_campaign(campaign_id)
            
            # Check if brand owns the campaign
            if campaign.get("brand_id") != brand_id:
                logger.error(f"❌ Brand {brand_id} doesn't own campaign {campaign_id}")
                return False
            
            # Check if influencer has an approved application with submitted media
            application = None
            for app in campaign.get("applications", []):
                if app.get("influencer_id") == influencer_id:
                    application = app
                    break
            
            if not application:
                logger.error(f"❌ No application found for influencer {influencer_id}")
                return False
            
            # Check if application is in media_submitted status
            if application.get("status") != ApplicationStatus.MEDIA_SUBMITTED:
                logger.error(f"❌ Application status is {application.get('status')}, expected 'media_submitted'")
                return False
            
            # Check if media was submitted
            if not application.get("submitted_media"):
                logger.error(f"❌ No media submitted for this application")
                return False
            
            logger.info(f"✅ Campaign payment eligibility validated successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Campaign payment eligibility validation failed: {str(e)}")
            return False

# -------------------- Email Service --------------------
class EmailService:
    @staticmethod
    def send_payment_receipt(email: str, name: str, campaign_title: str, amount: float, currency: str, transaction_id: str) -> bool:
        """Send payment receipt email to influencer"""
        try:
            # TODO: Implement actual email sending logic
            logger.info(f"📧 Payment receipt sent to {name} ({email}) for campaign '{campaign_title}' - Amount: {amount} {currency} - Transaction: {transaction_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send payment receipt email: {str(e)}")
            return False

    @staticmethod
    def send_payment_confirmation(email: str, name: str, campaign_title: str, amount: float, currency: str, transaction_id: str) -> bool:
        """Send payment confirmation email to brand"""
        try:
            # TODO: Implement actual email sending logic
            logger.info(f"📧 Payment confirmation sent to {name} ({email}) for campaign '{campaign_title}' - Amount: {amount} {currency} - Transaction: {transaction_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send payment confirmation email: {str(e)}")
            return False

# -------------------- Function Definitions --------------------
async def create_razorpay_order_endpoint(
    order_data: RazorpayOrderCreate,
    current_user: dict,
    razorpay_service: RazorpayService,
    payment_ops: PaymentOperations
) -> PaymentResponse:
    """Create a Razorpay order for payment"""
    try:
        logger.info(f"💰 Creating order for user {current_user['_id']} - Campaign: {order_data.campaign_id}")
        
        # Verify user is a brand
        if current_user.get("role") != "brand":
            raise HTTPException(status_code=403, detail="Only brands can create payments")
        
        # Validate campaign payment eligibility
        is_eligible = payment_ops.validate_campaign_payment_eligibility(
            campaign_id=order_data.campaign_id,
            influencer_id=order_data.influencer_id,
            brand_id=str(current_user["_id"])
        )
        
        if not is_eligible:
            raise HTTPException(
                status_code=400, 
                detail="Campaign is not eligible for payment. Ensure media is submitted and application is approved."
            )
        
        # Verify campaign exists
        campaign = payment_ops.get_campaign(order_data.campaign_id)
        logger.info(f"✅ Campaign found: {campaign.get('title', 'Unknown')}")
        
        # Create Razorpay order
        razorpay_result = razorpay_service.create_order(
            amount=order_data.amount,
            currency=order_data.currency,
            notes={
                "campaign_id": order_data.campaign_id,
                "influencer_id": order_data.influencer_id,
                "brand_id": str(current_user["_id"]),
                "campaign_title": campaign.get("title", "Unknown Campaign")
            }
        )
        
        if not razorpay_result["success"]:
            raise HTTPException(status_code=400, detail=razorpay_result.get("error", "Failed to create order"))
        
        # Create payment record in database
        payment_record = {
            "campaign_id": order_data.campaign_id,
            "brand_id": str(current_user["_id"]),
            "influencer_id": order_data.influencer_id,
            "amount": order_data.amount,
            "currency": order_data.currency,
            "status": PaymentStatus.PENDING,
            "razorpay_order_id": razorpay_result["order_id"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "metadata": {
                "campaign_title": campaign.get("title"),
                "influencer_name": None,  # Will be populated after payment
                "brand_name": current_user.get("username")
            }
        }
        
        payment_id = payment_ops.create_payment_record(payment_record)
        
        return PaymentResponse(
            success=True,
            message="Order created successfully",
            payment_id=payment_id,
            order_id=razorpay_result["order_id"],
            amount=order_data.amount,
            currency=order_data.currency
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in create order: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def verify_razorpay_payment_endpoint(
    payment_data: RazorpayPayment,
    background_tasks: BackgroundTasks,
    current_user: dict,
    razorpay_service: RazorpayService,
    payment_ops: PaymentOperations,
    email_service: EmailService
) -> PaymentResponse:
    """Verify Razorpay payment and update application status to completed"""
    try:
        logger.info(f"🔍 Verifying payment for order: {payment_data.razorpay_order_id}")
        
        # Step 1: Verify payment signature
        is_signature_valid = razorpay_service.verify_payment_signature(
            order_id=payment_data.razorpay_order_id,
            payment_id=payment_data.razorpay_payment_id,
            signature=payment_data.razorpay_signature
        )
        
        if not is_signature_valid:
            logger.error("❌ Payment signature verification failed")
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Step 2: Get payment record
        payment_record = payment_ops.get_payment_by_order_id(payment_data.razorpay_order_id)
        
        # Check if payment is already completed
        if payment_record.get("status") == PaymentStatus.COMPLETED:
            logger.info("ℹ️ Payment already processed")
            return PaymentResponse(
                success=True,
                message="Payment already processed",
                payment_id=str(payment_record["_id"])
            )
        
        # Step 3: Verify payment with Razorpay
        payment_details = razorpay_service.get_payment_details(payment_data.razorpay_payment_id)
        if not payment_details["success"]:
            logger.error(f"❌ Payment details fetch failed: {payment_details.get('error')}")
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        razorpay_payment = payment_details["payment"]
        logger.info(f"📊 Razorpay payment status: {razorpay_payment.get('status')}")
        
        # Step 4: Check if payment was captured
        if razorpay_payment.get("status") != "captured":
            # Update payment status to failed
            payment_ops.update_payment_status(
                str(payment_record["_id"]),
                PaymentStatus.FAILED
            )
            raise HTTPException(status_code=400, detail="Payment not captured")
        
        # Step 5: Update payment status to completed
        success = payment_ops.update_payment_status(
            str(payment_record["_id"]),
            PaymentStatus.COMPLETED,
            payment_data.razorpay_payment_id
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update payment status")
        
        # Step 6: ✅ CRITICAL - Update campaign application status to COMPLETED
        application_updated = payment_ops.update_campaign_application_status(
            payment_record["campaign_id"],
            payment_record["influencer_id"],
            ApplicationStatus.COMPLETED
        )
        
        if application_updated:
            logger.info("✅ Campaign application status updated to COMPLETED")
        else:
            logger.error("❌ Failed to update campaign application status")
            # Don't fail the payment, but log the error
        
        # Step 7: Create earning record for influencer
        earning_data = {
            "influencer_id": payment_record["influencer_id"],
            "campaign_id": payment_record["campaign_id"],
            "payment_id": str(payment_record["_id"]),
            "amount": payment_record["amount"],
            "currency": payment_record["currency"],
            "status": EarningStatus.PAID,
            "earned_at": datetime.utcnow(),
            "paid_at": datetime.utcnow(),
            "transaction_id": payment_data.razorpay_payment_id
        }
        
        earning_id = payment_ops.create_earning_record(earning_data)
        logger.info(f"✅ Earning record created: {earning_id}")
        
        # Step 8: Send receipt emails
        try:
            campaign = payment_ops.get_campaign(payment_record["campaign_id"])
            influencer = payment_ops.get_user(payment_record["influencer_id"])
            brand = payment_ops.get_user(payment_record["brand_id"])
            
            # Send receipt to influencer
            background_tasks.add_task(
                email_service.send_payment_receipt,
                email=influencer.get("email"),
                name=influencer.get("username", "Influencer"),
                campaign_title=campaign.get("title", "Unknown Campaign"),
                amount=payment_record["amount"],
                currency=payment_record["currency"],
                transaction_id=payment_data.razorpay_payment_id
            )
            
            # Send confirmation to brand
            background_tasks.add_task(
                email_service.send_payment_confirmation,
                email=brand.get("email"),
                name=brand.get("username", "Brand"),
                campaign_title=campaign.get("title", "Unknown Campaign"),
                amount=payment_record["amount"],
                currency=payment_record["currency"],
                transaction_id=payment_data.razorpay_payment_id
            )
            
        except Exception as email_error:
            logger.error(f"⚠️ Email sending failed: {str(email_error)}")
        
        logger.info(f"🎉 Payment process completed successfully for order: {payment_data.razorpay_order_id}")
        
        return PaymentResponse(
            success=True,
            message="Payment verified successfully and campaign marked as completed",
            payment_id=str(payment_record["_id"]),
            amount=payment_record["amount"],
            currency=payment_record["currency"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in payment verification: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during payment verification")

async def get_payment_history_endpoint(
    current_user: dict,
    payments_collection,
    payment_ops: PaymentOperations
) -> Dict[str, Any]:
    """Get payment history for current user"""
    try:
        if current_user.get("role") == "brand":
            payments = list(payments_collection.find({"brand_id": str(current_user["_id"])}).sort("created_at", -1))
        elif current_user.get("role") == "influencer":
            payments = list(payments_collection.find({"influencer_id": str(current_user["_id"])}).sort("created_at", -1))
        else:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Convert ObjectId to string and add campaign/influencer details
        for payment in payments:
            payment["_id"] = str(payment["_id"])
            try:
                campaign = payment_ops.get_campaign(payment["campaign_id"])
                payment["campaign_title"] = campaign.get("title", "Unknown Campaign")
                
                if current_user.get("role") == "brand":
                    influencer = payment_ops.get_user(payment["influencer_id"])
                    payment["influencer_name"] = influencer.get("username", "Unknown Influencer")
                else:
                    brand = payment_ops.get_user(payment["brand_id"])
                    payment["brand_name"] = brand.get("username", "Unknown Brand")
            except Exception as e:
                logger.error(f"⚠️ Failed to fetch details for payment {payment['_id']}: {str(e)}")
                payment["campaign_title"] = "Unknown Campaign"
                if current_user.get("role") == "brand":
                    payment["influencer_name"] = "Unknown Influencer"
                else:
                    payment["brand_name"] = "Unknown Brand"
        
        return {
            "success": True,
            "payments": payments,
            "total": len(payments)
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to fetch payment history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment history")

async def razorpay_webhook_endpoint(
    request: Request,
    background_tasks: BackgroundTasks,
    x_razorpay_signature: str,
    razorpay_service: RazorpayService,
    payment_ops: PaymentOperations
) -> JSONResponse:
    """Handle Razorpay webhook events and update application status"""
    try:
        body = await request.body()
        body_str = body.decode('utf-8')
        
        logger.info(f"📨 Webhook received: {body_str}")
        logger.info(f"🔐 Webhook signature: {x_razorpay_signature}")
        
        # Verify webhook signature
        expected_signature = hmac.new(
            razorpay_service.webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, x_razorpay_signature):
            logger.error("❌ Webhook signature verification failed")
            return JSONResponse(status_code=400, content={"error": "Invalid signature"})
        
        # Parse webhook payload
        payload = await request.json()
        event = payload.get("event")
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        
        razorpay_order_id = payment_entity.get("order_id")
        razorpay_payment_id = payment_entity.get("id")
        
        if not razorpay_order_id or not razorpay_payment_id:
            return JSONResponse(status_code=400, content={"error": "Invalid payload"})
        
        logger.info(f"📊 Webhook event: {event}, Order: {razorpay_order_id}, Payment: {razorpay_payment_id}")
        
        # Handle payment captured event
        if event == "payment.captured":
            try:
                payment_record = payment_ops.get_payment_by_order_id(razorpay_order_id)
                
                # Update payment status to completed
                payment_ops.update_payment_status(
                    str(payment_record["_id"]),
                    PaymentStatus.COMPLETED,
                    razorpay_payment_id
                )
                
                # ✅ Update campaign application status to COMPLETED via background task
                background_tasks.add_task(
                    payment_ops.update_campaign_application_status,
                    payment_record["campaign_id"],
                    payment_record["influencer_id"],
                    ApplicationStatus.COMPLETED
                )
                
                # Create earning record
                earning_data = {
                    "influencer_id": payment_record["influencer_id"],
                    "campaign_id": payment_record["campaign_id"],
                    "payment_id": str(payment_record["_id"]),
                    "amount": payment_record["amount"],
                    "currency": payment_record["currency"],
                    "status": EarningStatus.PAID,
                    "earned_at": datetime.utcnow(),
                    "paid_at": datetime.utcnow(),
                    "transaction_id": razorpay_payment_id
                }
                
                payment_ops.create_earning_record(earning_data)
                
                logger.info(f"✅ Webhook processed successfully for order {razorpay_order_id}")
                
            except Exception as e:
                logger.error(f"❌ Webhook processing error: {str(e)}")
                return JSONResponse(status_code=500, content={"error": "Webhook processing failed"})
        
        return JSONResponse(status_code=200, content={"status": "success"})
        
    except Exception as e:
        logger.error(f"❌ Webhook error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": "Webhook processing failed"})

async def check_payment_eligibility_endpoint(
    campaign_id: str,
    influencer_id: str,
    current_user: dict,
    payment_ops: PaymentOperations
) -> Dict[str, Any]:
    """Check if a campaign is eligible for payment"""
    try:
        if current_user.get("role") != "brand":
            raise HTTPException(status_code=403, detail="Only brands can check payment eligibility")
        
        is_eligible = payment_ops.validate_campaign_payment_eligibility(
            campaign_id=campaign_id,
            influencer_id=influencer_id,
            brand_id=str(current_user["_id"])
        )
        
        campaign = payment_ops.get_campaign(campaign_id)
        influencer = payment_ops.get_user(influencer_id)
        
        return {
            "success": True,
            "is_eligible": is_eligible,
            "campaign_title": campaign.get("title"),
            "influencer_name": influencer.get("username"),
            "message": "Campaign is eligible for payment" if is_eligible else "Campaign is not eligible for payment"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to check payment eligibility: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check payment eligibility")

# -------------------- Payment Router --------------------
def create_payment_router(payments_collection, earnings_collection, campaigns_collection, users_collection, get_current_user):
    router = APIRouter(prefix="/payments", tags=["payments"])
    
    # Initialize services
    razorpay_service = RazorpayService()
    payment_ops = PaymentOperations(payments_collection, earnings_collection, campaigns_collection, users_collection)
    email_service = EmailService()

    # ---------------- Create Razorpay Order ----------------
    @router.post("/razorpay/create-order", response_model=PaymentResponse)
    async def create_razorpay_order(
        order_data: RazorpayOrderCreate,
        current_user: dict = Depends(get_current_user)
    ):
        return await create_razorpay_order_endpoint(
            order_data=order_data,
            current_user=current_user,
            razorpay_service=razorpay_service,
            payment_ops=payment_ops
        )

    # ---------------- Verify Payment & Update Application Status ----------------
    @router.post("/razorpay/verify", response_model=PaymentResponse)
    async def verify_razorpay_payment(
        background_tasks: BackgroundTasks,
        payment_data: RazorpayPayment,
        current_user: dict = Depends(get_current_user)
    ):
        return await verify_razorpay_payment_endpoint(
            payment_data=payment_data,
            background_tasks=background_tasks,
            current_user=current_user,
            razorpay_service=razorpay_service,
            payment_ops=payment_ops,
            email_service=email_service
        )

    # ---------------- Get Payment History ----------------
    @router.get("/history")
    async def get_payment_history(current_user: dict = Depends(get_current_user)):
        return await get_payment_history_endpoint(
            current_user=current_user,
            payments_collection=payments_collection,
            payment_ops=payment_ops
        )

    # ---------------- Razorpay Webhook (with application status update) ----------------
    @router.post("/razorpay/webhook")
    async def razorpay_webhook(
        request: Request,
        background_tasks: BackgroundTasks,
        x_razorpay_signature: str = Header(..., alias="X-Razorpay-Signature")
    ):
        return await razorpay_webhook_endpoint(
            request=request,
            background_tasks=background_tasks,
            x_razorpay_signature=x_razorpay_signature,
            razorpay_service=razorpay_service,
            payment_ops=payment_ops
        )

    # ---------------- Check Payment Eligibility ----------------
    @router.get("/campaigns/{campaign_id}/influencer/{influencer_id}/eligibility")
    async def check_payment_eligibility(
        campaign_id: str,
        influencer_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        return await check_payment_eligibility_endpoint(
            campaign_id=campaign_id,
            influencer_id=influencer_id,
            current_user=current_user,
            payment_ops=payment_ops
        )

    return router