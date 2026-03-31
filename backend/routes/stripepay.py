# stripepay.py - Complete Stripe Payment Gateway Implementation
import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

import stripe
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from bson.errors import InvalidId

# -------------------- Logging Configuration --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- Configuration --------------------
STRIPE_CONFIG = {
    "secret_key": os.getenv("STRIPE_SECRET_KEY", "sk_test_your_secret_key_here"),
    "public_key": os.getenv("STRIPE_PUBLIC_KEY", "pk_test_your_public_key_here"),
    "webhook_secret": os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_your_webhook_secret_here"),
    "currency": "usd"
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

# class CampaignStatus(str, Enum):
#     ACTIVE = "active"
#     PAUSED = "paused"
#     COMPLETED = "completed"

# -------------------- Pydantic Schemas --------------------
class StripePaymentIntentCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in base currency")
    currency: str = Field("usd", description="Currency code")
    campaign_id: str = Field(..., description="Campaign ID")
    influencer_id: str = Field(..., description="Influencer ID")
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class StripePaymentConfirm(BaseModel):
    payment_intent_id: str = Field(..., description="Stripe Payment Intent ID")
    payment_method_id: str = Field(..., description="Stripe Payment Method ID")

class PaymentResponse(BaseModel):
    success: bool
    message: str
    payment_id: Optional[str] = None
    payment_intent_id: Optional[str] = None
    client_secret: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None

# -------------------- Stripe Service --------------------
class StripeService:
    def __init__(self):
        self.secret_key = STRIPE_CONFIG["secret_key"]
        self.public_key = STRIPE_CONFIG["public_key"]
        self.webhook_secret = STRIPE_CONFIG["webhook_secret"]
        self.currency = STRIPE_CONFIG["currency"]
        
        if not self.secret_key or not self.public_key:
            logger.error("Stripe credentials not configured")
            raise Exception("Stripe credentials not configured")
        
        stripe.api_key = self.secret_key
        logger.info("✅ Stripe service initialized successfully")

    def create_payment_intent(self, amount: float, currency: str = "usd", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create Stripe Payment Intent"""
        try:
            # Convert amount to cents (smallest currency unit)
            amount_in_cents = int(amount * 100)
            
            # Validate minimum amount
            if amount_in_cents < 50:
                return {
                    "success": False, 
                    "error": "Amount must be at least 0.50 USD"
                }
            
            intent_data = {
                "amount": amount_in_cents,
                "currency": currency.lower(),
                "automatic_payment_methods": {"enabled": True},
                "metadata": metadata or {}
            }
            
            logger.info(f"Creating Stripe Payment Intent with data: {intent_data}")
            payment_intent = stripe.PaymentIntent.create(**intent_data)
            
            logger.info(f"✅ Stripe Payment Intent created: {payment_intent.id}")
            return {
                "success": True, 
                "payment_intent_id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "amount": amount,
                "currency": currency
            }
            
        except stripe.error.CardError as e:
            logger.error(f"❌ Stripe Card Error: {str(e)}")
            return {
                "success": False, 
                "error": e.user_message,
                "error_type": "card_error"
            }
        except stripe.error.StripeError as e:
            logger.error(f"❌ Stripe Error: {str(e)}")
            return {
                "success": False, 
                "error": str(e),
                "error_type": "stripe_error"
            }
        except Exception as e:
            logger.error(f"❌ Unexpected error creating payment intent: {str(e)}")
            return {
                "success": False, 
                "error": "Internal server error"
            }

    def confirm_payment_intent(self, payment_intent_id: str, payment_method_id: str) -> Dict[str, Any]:
        """Confirm and process Stripe Payment Intent"""
        try:
            logger.info(f"🔍 Confirming payment intent: {payment_intent_id}")
            
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            valid_return_url = f"{frontend_url}/payment/success"
            
            # Confirm the payment intent
            confirmed_intent = stripe.PaymentIntent.confirm(
                payment_intent_id,
                payment_method=payment_method_id,
                return_url=valid_return_url
            )
            
            if confirmed_intent.status == 'succeeded':
                logger.info(f"✅ Payment {payment_intent_id} confirmed successfully")
                return {
                    "success": True,
                    "transaction_id": confirmed_intent.id,
                    "amount": confirmed_intent.amount / 100,
                    "currency": confirmed_intent.currency,
                    "status": confirmed_intent.status
                }
            else:
                logger.warning(f"⚠️ Payment {payment_intent_id} not completed. Status: {confirmed_intent.status}")
                return {
                    "success": False,
                    "error": f"Payment not completed. Status: {confirmed_intent.status}",
                    "status": confirmed_intent.status
                }
                
        except stripe.error.CardError as e:
            logger.error(f"❌ Card error for payment {payment_intent_id}: {str(e)}")
            return {
                "success": False,
                "error": e.user_message,
                "error_type": "card_error"
            }
        except stripe.error.StripeError as e:
            logger.error(f"❌ Stripe error for payment {payment_intent_id}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "error_type": "stripe_error"
            }
        except Exception as e:
            logger.error(f"❌ Unexpected error confirming payment {payment_intent_id}: {str(e)}")
            return {
                "success": False,
                "error": "Internal server error"
            }

    def get_payment_intent(self, payment_intent_id: str) -> Dict[str, Any]:
        """Fetch payment intent details from Stripe"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            logger.info(f"✅ Payment intent details fetched - Status: {payment_intent.get('status')}")
            return {
                "success": True, 
                "payment_intent": payment_intent,
                "status": payment_intent.status
            }
        except stripe.error.StripeError as e:
            logger.error(f"❌ Fetch payment intent failed: {str(e)}")
            return {
                "success": False, 
                "error": str(e)
            }

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify Stripe webhook signature"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            logger.info("✅ Webhook signature verified successfully")
            return True
        except ValueError as e:
            logger.error(f"❌ Invalid webhook payload: {str(e)}")
            return False
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"❌ Invalid webhook signature: {str(e)}")
            return False

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
        campaign["_id"] = str(campaign["_id"])
        return campaign

    def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user details"""
        user = self.users.find_one({"_id": self._validate_object_id(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user["_id"] = str(user["_id"])
        return user

    def get_payment_by_intent_id(self, payment_intent_id: str) -> Dict[str, Any]:
        """Get payment record by Stripe payment intent ID"""
        payment = self.payments.find_one({"payment_intent_id": payment_intent_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        payment["_id"] = str(payment["_id"])
        return payment

    def update_campaign_application_status(self, campaign_id: str, influencer_id: str, status: ApplicationStatus) -> bool:
        """Update campaign application status after payment"""
        try:
            logger.info(f"🔄 Updating campaign application status - Campaign: {campaign_id}, Influencer: {influencer_id}, Status: {status}")
            
            campaign = self.campaigns.find_one({"_id": self._validate_object_id(campaign_id)})
            if not campaign:
                logger.error(f"❌ Campaign not found: {campaign_id}")
                return False

            application_found = False
            for application in campaign.get("applications", []):
                if application.get("influencer_id") == influencer_id:
                    application_found = True
                    logger.info(f"✅ Found application for influencer: {influencer_id}")
                    break

            if not application_found:
                logger.error(f"❌ Application not found for influencer: {influencer_id}")
                return False

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

    # def update_campaign_status(self, campaign_id: str, status: CampaignStatus) -> bool:
    #     """Update campaign status"""
    #     try:
    #         logger.info(f"🔄 Updating campaign status - Campaign: {campaign_id}, Status: {status}")
            
    #         result = self.campaigns.update_one(
    #             {"_id": self._validate_object_id(campaign_id)},
    #             {
    #                 "$set": {
    #                     "status": status,
    #                     "updated_at": datetime.utcnow()
    #                 }
    #             }
    #         )
            
    #         if result.modified_count > 0:
    #             logger.info(f"✅ Campaign status updated to: {status}")
    #             return True
    #         else:
    #             logger.warning(f"⚠️ No campaign found with ID: {campaign_id}")
    #             return False
                
    #     except Exception as e:
    #         logger.error(f"❌ Failed to update campaign status: {str(e)}")
    #         return False

    def validate_campaign_payment_eligibility(self, campaign_id: str, influencer_id: str, brand_id: str) -> bool:
        """Validate if campaign is eligible for payment"""
        try:
            campaign = self.get_campaign(campaign_id)
            
            if campaign.get("brand_id") != brand_id:
                logger.error(f"❌ Brand {brand_id} doesn't own campaign {campaign_id}")
                return False
            
            application = None
            for app in campaign.get("applications", []):
                if app.get("influencer_id") == influencer_id:
                    application = app
                    break
            
            if not application:
                logger.error(f"❌ No application found for influencer {influencer_id}")
                return False
            
            if application.get("status") != ApplicationStatus.MEDIA_SUBMITTED:
                logger.error(f"❌ Application status is {application.get('status')}, expected 'media_submitted'")
                return False
            
            if not application.get("submitted_media"):
                logger.error(f"❌ No media submitted for this application")
                return False
            
            if not application.get("contract_signed"):
                logger.error(f"❌ Contract not signed for this application")
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
            logger.info(f"📧 Payment receipt sent to {name} ({email}) for campaign '{campaign_title}' - Amount: {amount} {currency} - Transaction: {transaction_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send payment receipt email: {str(e)}")
            return False

    @staticmethod
    def send_payment_confirmation(email: str, name: str, campaign_title: str, amount: float, currency: str, transaction_id: str) -> bool:
        """Send payment confirmation email to brand"""
        try:
            logger.info(f"📧 Payment confirmation sent to {name} ({email}) for campaign '{campaign_title}' - Amount: {amount} {currency} - Transaction: {transaction_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send payment confirmation email: {str(e)}")
            return False

# -------------------- Payment Router --------------------
def create_payment_router(payments_collection, earnings_collection, campaigns_collection, users_collection, get_current_user):
    router = APIRouter(prefix="/payments", tags=["payments"])
    
    # Initialize services
    stripe_service = StripeService()
    payment_ops = PaymentOperations(payments_collection, earnings_collection, campaigns_collection, users_collection)
    email_service = EmailService()

    async def _process_successful_payment(
        payment_record: Dict[str, Any],
        background_tasks: BackgroundTasks,
        transaction_id: str
    ) -> PaymentResponse:
        """Process a successful payment - update application status and send emails"""
        try:
            # Update campaign application status to COMPLETED
            application_updated = payment_ops.update_campaign_application_status(
                payment_record["campaign_id"],
                payment_record["influencer_id"],
                ApplicationStatus.COMPLETED
            )
            
            if application_updated:
                logger.info("✅ Campaign application status updated to COMPLETED")
            else:
                logger.error("❌ Failed to update campaign application status")
            
            # # Update campaign status to completed
            # campaign_updated = payment_ops.update_campaign_status(
            #     payment_record["campaign_id"],
            #     CampaignStatus.COMPLETED
            # )
            
            # if campaign_updated:
            #     logger.info("✅ Campaign status updated to COMPLETED")
            # else:
            #     logger.warning("⚠️ Failed to update campaign status")
            
            # Create earning record for influencer
            earning_data = {
                "influencer_id": payment_record["influencer_id"],
                "campaign_id": payment_record["campaign_id"],
                "payment_id": str(payment_record["_id"]),
                "amount": payment_record["amount"],
                "currency": payment_record["currency"],
                "status": EarningStatus.PAID,
                "earned_at": datetime.utcnow(),
                "paid_at": datetime.utcnow(),
                "transaction_id": transaction_id
            }
            
            earning_id = payment_ops.create_earning_record(earning_data)
            logger.info(f"✅ Earning record created: {earning_id}")
            
            # Send receipt emails
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
                    transaction_id=transaction_id
                )
                
                # Send confirmation to brand
                background_tasks.add_task(
                    email_service.send_payment_confirmation,
                    email=brand.get("email"),
                    name=brand.get("username", "Brand"),
                    campaign_title=campaign.get("title", "Unknown Campaign"),
                    amount=payment_record["amount"],
                    currency=payment_record["currency"],
                    transaction_id=transaction_id
                )
                
            except Exception as email_error:
                logger.error(f"⚠️ Email sending failed: {str(email_error)}")
            
            logger.info(f"🎉 Payment process completed successfully for payment intent: {transaction_id}")
            
            return PaymentResponse(
                success=True,
                message="Payment confirmed successfully and campaign marked as completed",
                payment_id=str(payment_record["_id"]),
                amount=payment_record["amount"],
                currency=payment_record["currency"],
                status="completed"
            )
            
        except Exception as e:
            logger.error(f"❌ Error processing successful payment: {str(e)}")
            return PaymentResponse(
                success=True,
                message="Payment completed but some post-processing failed",
                payment_id=str(payment_record["_id"]),
                amount=payment_record["amount"],
                currency=payment_record["currency"],
                status="completed_with_warnings"
            )

    # ---------------- Create Stripe Payment Intent ----------------
    @router.post("/stripe/create-payment-intent", response_model=PaymentResponse)
    async def create_stripe_payment_intent(
        payment_data: StripePaymentIntentCreate,
        current_user: dict = Depends(get_current_user)
    ):
        """Create a Stripe Payment Intent for payment"""
        try:
            logger.info(f"💰 Creating payment intent for user {current_user['_id']} - Campaign: {payment_data.campaign_id}")
            
            if current_user.get("role") != "brand":
                raise HTTPException(status_code=403, detail="Only brands can create payments")
            
            is_eligible = payment_ops.validate_campaign_payment_eligibility(
                campaign_id=payment_data.campaign_id,
                influencer_id=payment_data.influencer_id,
                brand_id=str(current_user["_id"])
            )
            
            if not is_eligible:
                raise HTTPException(
                    status_code=400, 
                    detail="Campaign is not eligible for payment. Ensure media is submitted, contract is signed, and application is approved."
                )
            
            campaign = payment_ops.get_campaign(payment_data.campaign_id)
            logger.info(f"✅ Campaign found: {campaign.get('title', 'Unknown')}")
            
            stripe_result = stripe_service.create_payment_intent(
                amount=payment_data.amount,
                currency=payment_data.currency,
                metadata={
                    "campaign_id": payment_data.campaign_id,
                    "influencer_id": payment_data.influencer_id,
                    "brand_id": str(current_user["_id"]),
                    "campaign_title": campaign.get("title", "Unknown Campaign")
                }
            )
            
            if not stripe_result["success"]:
                error_detail = stripe_result.get("error", "Failed to create payment intent")
                error_type = stripe_result.get("error_type", "unknown")
                raise HTTPException(
                    status_code=400, 
                    detail=error_detail,
                    headers={"X-Error-Type": error_type}
                )
            
            payment_record = {
                "campaign_id": payment_data.campaign_id,
                "brand_id": str(current_user["_id"]),
                "influencer_id": payment_data.influencer_id,
                "amount": payment_data.amount,
                "currency": payment_data.currency,
                "status": PaymentStatus.PENDING,
                "payment_intent_id": stripe_result["payment_intent_id"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {
                    "campaign_title": campaign.get("title"),
                    "influencer_name": None,
                    "brand_name": current_user.get("username")
                }
            }
            
            payment_id = payment_ops.create_payment_record(payment_record)
            
            return PaymentResponse(
                success=True,
                message="Payment intent created successfully",
                payment_id=payment_id,
                payment_intent_id=stripe_result["payment_intent_id"],
                client_secret=stripe_result["client_secret"],
                amount=payment_data.amount,
                currency=payment_data.currency
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error in create payment intent: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    # ---------------- Improved Confirm Payment & Update Application Status ----------------
    @router.post("/stripe/confirm-payment", response_model=PaymentResponse)
    async def confirm_stripe_payment(
        background_tasks: BackgroundTasks,
        payment_data: StripePaymentConfirm,
        current_user: dict = Depends(get_current_user)
    ):
        """Confirm Stripe payment and update application status to completed"""
        try:
            logger.info(f"🔍 Processing payment confirmation for: {payment_data.payment_intent_id}")
            
            # Step 1: Get payment record
            payment_record = payment_ops.get_payment_by_intent_id(payment_data.payment_intent_id)
            
            # Check if user owns this payment
            if payment_record["brand_id"] != str(current_user["_id"]):
                raise HTTPException(status_code=403, detail="Not authorized for this payment")
            
            # Step 2: Check current payment status in database
            if payment_record.get("status") == PaymentStatus.COMPLETED:
                logger.info("✅ Payment already completed in database")
                return PaymentResponse(
                    success=True,
                    message="Payment already completed",
                    payment_id=str(payment_record["_id"])
                )
            
            # Step 3: Check current status with Stripe first
            stripe_status_result = stripe_service.get_payment_intent(payment_data.payment_intent_id)
            
            if not stripe_status_result["success"]:
                raise HTTPException(status_code=400, detail=stripe_status_result.get("error", "Failed to fetch payment status"))
            
            stripe_status = stripe_status_result.get("status")
            logger.info(f"📊 Stripe payment intent status: {stripe_status}")
            
            # Step 4: Handle different Stripe statuses
            if stripe_status == "succeeded":
                logger.info("✅ Payment already succeeded in Stripe - processing completion...")
                
                # Update payment status to completed
                success = payment_ops.update_payment_status(
                    str(payment_record["_id"]),
                    PaymentStatus.COMPLETED,
                    payment_data.payment_intent_id
                )
                
                if not success:
                    raise HTTPException(status_code=500, detail="Failed to update payment status")
                
                # Process successful payment
                return await _process_successful_payment(
                    payment_record=payment_record,
                    background_tasks=background_tasks,
                    transaction_id=payment_data.payment_intent_id
                )
                
            elif stripe_status in ["requires_payment_method", "requires_confirmation", "requires_action"]:
                # Payment needs to be confirmed
                logger.info(f"🔄 Payment requires confirmation - status: {stripe_status}")
                
                payment_result = stripe_service.confirm_payment_intent(
                    payment_data.payment_intent_id,
                    payment_data.payment_method_id
                )
                
                if not payment_result["success"]:
                    # Update payment status to failed
                    payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.FAILED
                    )
                    raise HTTPException(status_code=400, detail=payment_result.get("error", "Payment confirmation failed"))
                
                if payment_result.get("status") == "succeeded":
                    # Update payment status to completed
                    success = payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.COMPLETED,
                        payment_result["transaction_id"]
                    )
                    
                    if not success:
                        raise HTTPException(status_code=500, detail="Failed to update payment status")
                    
                    return await _process_successful_payment(
                        payment_record=payment_record,
                        background_tasks=background_tasks,
                        transaction_id=payment_result["transaction_id"]
                    )
                else:
                    # Payment still processing
                    logger.info(f"⏳ Payment processing - current status: {payment_result.get('status')}")
                    return PaymentResponse(
                        success=True,
                        message=f"Payment processing - status: {payment_result.get('status')}",
                        payment_id=str(payment_record["_id"]),
                        status=payment_result.get("status")
                    )
                    
            elif stripe_status == "canceled":
                logger.warning(f"❌ Payment was canceled: {payment_data.payment_intent_id}")
                payment_ops.update_payment_status(
                    str(payment_record["_id"]),
                    PaymentStatus.FAILED
                )
                raise HTTPException(status_code=400, detail="Payment was canceled")
                
            else:
                logger.warning(f"⚠️ Unexpected payment status: {stripe_status}")
                raise HTTPException(status_code=400, detail=f"Unexpected payment status: {stripe_status}")
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error in payment confirmation: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error during payment confirmation")

    # ---------------- Get Payment History ----------------
    @router.get("/history")
    async def get_payment_history(current_user: dict = Depends(get_current_user)):
        """Get payment history for current user"""
        try:
            if current_user.get("role") == "brand":
                payments = list(payments_collection.find({"brand_id": str(current_user["_id"])}).sort("created_at", -1))
            elif current_user.get("role") == "influencer":
                payments = list(payments_collection.find({"influencer_id": str(current_user["_id"])}).sort("created_at", -1))
            else:
                raise HTTPException(status_code=403, detail="Access denied")
            
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

    # ---------------- Stripe Webhook ----------------
    @router.post("/stripe/webhook")
    async def stripe_webhook(
        request: Request,
        background_tasks: BackgroundTasks,
        stripe_signature: str = Header(..., alias="Stripe-Signature")
    ):
        """Handle Stripe webhook events and update application status"""
        try:
            body = await request.body()
            body_str = body.decode('utf-8')
            
            logger.info(f"📨 Stripe webhook received: {body_str[:500]}...")
            
            if not stripe_service.verify_webhook_signature(body, stripe_signature):
                logger.error("❌ Stripe webhook signature verification failed")
                return JSONResponse(status_code=400, content={"error": "Invalid signature"})
            
            payload = await request.json()
            event_type = payload.get("type")
            payment_intent = payload.get("data", {}).get("object", {})
            
            payment_intent_id = payment_intent.get("id")
            
            if not payment_intent_id:
                return JSONResponse(status_code=400, content={"error": "Invalid payload"})
            
            logger.info(f"📊 Stripe webhook event: {event_type}, Payment Intent: {payment_intent_id}")
            
            if event_type == "payment_intent.succeeded":
                try:
                    payment_record = payment_ops.get_payment_by_intent_id(payment_intent_id)
                    
                    # Update payment status to completed
                    payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.COMPLETED,
                        payment_intent_id
                    )
                    
                    # Process successful payment in background
                    background_tasks.add_task(
                        _process_successful_payment,
                        payment_record=payment_record,
                        background_tasks=background_tasks,
                        transaction_id=payment_intent_id
                    )
                    
                    logger.info(f"✅ Stripe webhook processed successfully for payment intent {payment_intent_id}")
                    
                except Exception as e:
                    logger.error(f"❌ Stripe webhook processing error: {str(e)}")
                    return JSONResponse(status_code=500, content={"error": "Webhook processing failed"})
            
            elif event_type == "payment_intent.payment_failed":
                try:
                    payment_record = payment_ops.get_payment_by_intent_id(payment_intent_id)
                    payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.FAILED
                    )
                    logger.info(f"❌ Payment failed via webhook: {payment_intent_id}")
                except Exception as e:
                    logger.error(f"❌ Failed to update payment status to failed: {str(e)}")
            
            return JSONResponse(status_code=200, content={"status": "success"})
            
        except Exception as e:
            logger.error(f"❌ Stripe webhook error: {str(e)}")
            return JSONResponse(status_code=500, content={"error": "Webhook processing failed"})

    # ---------------- Check Payment Eligibility ----------------
    @router.get("/campaigns/{campaign_id}/influencer/{influencer_id}/eligibility")
    async def check_payment_eligibility(
        campaign_id: str,
        influencer_id: str,
        current_user: dict = Depends(get_current_user)
    ):
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

    # ---------------- Get Payment Details ----------------
    @router.get("/{payment_id}")
    async def get_payment_details(
        payment_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Get detailed payment information"""
        try:
            payment = payments_collection.find_one({"_id": payment_ops._validate_object_id(payment_id)})
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            if (current_user["role"] == "brand" and payment["brand_id"] != str(current_user["_id"])) and \
               (current_user["role"] == "influencer" and payment["influencer_id"] != str(current_user["_id"])) and \
               (current_user["role"] != "admin"):
                raise HTTPException(status_code=403, detail="Not authorized to view this payment")
            
            payment["_id"] = str(payment["_id"])
            
            campaign = payment_ops.get_campaign(payment["campaign_id"])
            if current_user["role"] == "brand":
                influencer = payment_ops.get_user(payment["influencer_id"])
                payment["influencer_name"] = influencer.get("username")
                payment["influencer_email"] = influencer.get("email")
            else:
                brand = payment_ops.get_user(payment["brand_id"])
                payment["brand_name"] = brand.get("username")
                payment["brand_email"] = brand.get("email")
            
            payment["campaign_title"] = campaign.get("title")
            
            return {
                "success": True,
                "payment": payment
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch payment details: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch payment details")

    return router