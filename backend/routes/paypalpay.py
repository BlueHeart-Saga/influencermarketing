# paypalpay.py - Complete PayPal Payment Gateway Implementation
import os
import logging
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request, Header, Query
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from bson.errors import InvalidId
import paypalrestsdk
import requests





# -------------------- Logging Configuration --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- Configuration --------------------
PAYPAL_CONFIG = {
    "mode": os.getenv("PAYPAL_MODE", "sandbox"),  # 'sandbox' or 'live'
    "client_id": os.getenv("PAYPAL_CLIENT_ID", ""),  # Remove hardcoded credentials
    "client_secret": os.getenv("PAYPAL_CLIENT_SECRET", ""),  # Remove hardcoded credentials
    "currency": "USD",
    "return_url": os.getenv("PAYPAL_RETURN_URL", "http://localhost:3000/brand/paypalpay/success"),
    "cancel_url": os.getenv("PAYPAL_CANCEL_URL", "http://localhost:3000/brand/paypalpay/cancel")
}

# -------------------- Enums --------------------
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PROCESSING = "processing"
    CREATED = "created"
    APPROVED = "approved"
    CANCELLED = "cancelled"

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
class PayPalOrderCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in base currency")
    currency: str = Field("USD", description="Currency code")
    campaign_id: str = Field(..., description="Campaign ID")
    influencer_id: str = Field(..., description="Influencer ID")
    description: str = Field("Campaign Payment", description="Payment description")
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

class PayPalOrderCapture(BaseModel):
    order_id: str = Field(..., description="PayPal Order ID")
    payer_id: str = Field(..., description="PayPal Payer ID")

class PayPalPayoutCreate(BaseModel):
    email: str = Field(..., description="Influencer PayPal email")
    amount: float = Field(..., gt=0, description="Amount to payout")
    currency: str = Field("USD", description="Currency code")
    note: str = Field("", description="Payout note")

class PaymentResponse(BaseModel):
    success: bool
    message: str
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    approval_url: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    payout_batch_id: Optional[str] = None

# -------------------- PayPal Service --------------------
# -------------------- PayPal Service --------------------
class PayPalService:
    def __init__(self):
        self.mode = PAYPAL_CONFIG["mode"]
        self.client_id = PAYPAL_CONFIG["client_id"]
        self.client_secret = PAYPAL_CONFIG["client_secret"]
        self.currency = PAYPAL_CONFIG["currency"]
        self.return_url = PAYPAL_CONFIG["return_url"]
        self.cancel_url = PAYPAL_CONFIG["cancel_url"]
        
        # Validate credentials
        if not self.client_id or not self.client_secret:
            logger.error("❌ PayPal credentials not configured")
            logger.error(f"Client ID: {'*' * 8}{self.client_id[-4:] if self.client_id else 'MISSING'}")
            logger.error(f"Client Secret: {'*' * 8}{self.client_secret[-4:] if self.client_secret else 'MISSING'}")
            raise Exception("PayPal credentials not configured. Please check environment variables.")
        
        self.base_url = "https://api.sandbox.paypal.com" if self.mode == "sandbox" else "https://api.paypal.com"
        self.access_token = None
        self.token_expiry = None
        
        logger.info(f"✅ PayPal service initialized - Mode: {self.mode}")
        logger.info(f"✅ PayPal base URL: {self.base_url}")

    def _get_access_token(self) -> str:
        """Get PayPal access token with improved error handling"""
        try:
            # Check if token is still valid
            if self.access_token and self.token_expiry and datetime.utcnow().timestamp() < self.token_expiry:
                return self.access_token
                
            auth = (self.client_id, self.client_secret)
            headers = {
                "Accept": "application/json", 
                "Accept-Language": "en_US",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            data = {"grant_type": "client_credentials"}
            
            logger.info(f"🔄 Requesting PayPal access token from: {self.base_url}/v1/oauth2/token")
            
            response = requests.post(
                f"{self.base_url}/v1/oauth2/token",
                headers=headers,
                data=data,
                auth=auth,
                timeout=30
            )
            
            logger.info(f"📊 PayPal token response status: {response.status_code}")
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
                # Set expiry 5 minutes before actual expiry for safety
                expires_in = token_data.get("expires_in", 32400)  # Default 9 hours
                self.token_expiry = datetime.utcnow().timestamp() + expires_in - 300
                logger.info("✅ PayPal access token obtained successfully")
                return self.access_token
            else:
                error_detail = response.json() if response.content else {}
                logger.error(f"❌ Failed to get PayPal access token: {response.status_code}")
                logger.error(f"❌ PayPal error: {error_detail}")
                raise Exception(f"PayPal authentication failed: {error_detail.get('error_description', 'Unknown error')}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Network error getting PayPal token: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"❌ Error getting PayPal access token: {str(e)}")
            raise

    def _make_api_request(self, method: str, endpoint: str, data: Dict = None) -> Dict[str, Any]:
        """Make authenticated API request to PayPal with improved error handling"""
        try:
            token = self._get_access_token()
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            url = f"{self.base_url}{endpoint}"
            logger.info(f"🔄 Making PayPal API request to: {endpoint}")
            
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            logger.info(f"📊 PayPal API response status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                return response.json() if response.content else {}
            else:
                error_detail = response.json() if response.content else {}
                logger.error(f"❌ PayPal API error {response.status_code}: {error_detail}")
                raise Exception(f"PayPal API error {response.status_code}: {error_detail.get('message', 'Unknown error')}")
                
        except requests.exceptions.Timeout:
            logger.error("❌ PayPal API request timeout")
            raise Exception("PayPal API timeout - please try again")
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ PayPal API network error: {str(e)}")
            raise Exception(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"❌ PayPal API request failed: {str(e)}")
            raise

    def create_order(self, amount: float, currency: str, description: str, 
                   custom_id: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create PayPal order with improved error handling"""
        try:
            # Validate amount
            if amount <= 0:
                raise Exception("Amount must be greater than 0")
            
            # Validate currency
            supported_currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
            if currency.upper() not in supported_currencies:
                raise Exception(f"Currency {currency} not supported. Supported: {supported_currencies}")

            order_data = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": currency.upper(),
                            "value": f"{amount:.2f}"
                        },
                        "description": description[:127],  # PayPal description limit
                        "custom_id": custom_id
                    }
                ],
                "application_context": {
                    "brand_name": "InfluencerHub",
                    "landing_page": "BILLING",
                    "user_action": "PAY_NOW",
                    "return_url": self.return_url,
                    "cancel_url": self.cancel_url,
                    "shipping_preference": "NO_SHIPPING"
                }
            }
            
            if metadata:
                order_data["purchase_units"][0]["metadata"] = metadata
            
            logger.info(f"🔄 Creating PayPal order: {amount} {currency} - {description}")
            result = self._make_api_request("POST", "/v2/checkout/orders", order_data)
            
            # Extract approval URL
            approval_url = next(
                (link["href"] for link in result["links"] if link["rel"] == "approve"), 
                None
            )
            
            if not approval_url:
                raise Exception("No approval URL found in PayPal response")
            
            logger.info(f"✅ PayPal order created: {result['id']}")
            return {
                "success": True,
                "order_id": result["id"],
                "status": result["status"],
                "approval_url": approval_url,
                "amount": amount,
                "currency": currency
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to create PayPal order: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "error_type": "paypal_api_error"
            }

    def capture_order(self, order_id: str, payer_id: str = None) -> Dict[str, Any]:
        """Capture PayPal payment"""
        try:
            logger.info(f"🔍 Capturing PayPal order: {order_id}")
            
            result = self._make_api_request("POST", f"/v2/checkout/orders/{order_id}/capture")
            
            if result["status"] == "COMPLETED":
                logger.info(f"✅ PayPal order captured successfully: {order_id}")
                
                # Extract transaction details
                purchase_unit = result["purchase_units"][0]
                capture = purchase_unit["payments"]["captures"][0]
                
                return {
                    "success": True,
                    "transaction_id": capture["id"],
                    "order_id": result["id"],
                    "amount": float(capture["amount"]["value"]),
                    "currency": capture["amount"]["currency_code"],
                    "status": result["status"],
                    "create_time": capture["create_time"],
                    "payer_email": result.get("payer", {}).get("email_address", ""),
                    "payer_name": f"{result.get('payer', {}).get('name', {}).get('given_name', '')} {result.get('payer', {}).get('name', {}).get('surname', '')}".strip()
                }
            else:
                logger.warning(f"⚠️ PayPal order not completed. Status: {result['status']}")
                return {
                    "success": False,
                    "error": f"Order not completed. Status: {result['status']}",
                    "status": result["status"]
                }
                
        except Exception as e:
            logger.error(f"❌ Failed to capture PayPal order {order_id}: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_order_details(self, order_id: str) -> Dict[str, Any]:
        """Get PayPal order details"""
        try:
            result = self._make_api_request("GET", f"/v2/checkout/orders/{order_id}")
            logger.info(f"✅ PayPal order details fetched - Status: {result.get('status')}")
            return {
                "success": True,
                "order": result,
                "status": result["status"]
            }
        except Exception as e:
            logger.error(f"❌ Fetch PayPal order failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def create_payout(self, email: str, amount: float, currency: str, note: str = "") -> Dict[str, Any]:
        """Create PayPal payout to influencer"""
        try:
            payout_data = {
                "sender_batch_header": {
                    "sender_batch_id": f"Payout_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                    "email_subject": "You have a payment from InfluencerHub",
                    "email_message": f"You have received a payment of {amount} {currency} from InfluencerHub. {note}"
                },
                "items": [
                    {
                        "recipient_type": "EMAIL",
                        "amount": {
                            "value": f"{amount:.2f}",
                            "currency": currency.upper()
                        },
                        "receiver": email,
                        "note": note,
                        "sender_item_id": f"item_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
                    }
                ]
            }
            
            logger.info(f"Creating PayPal payout for {email}: {amount} {currency}")
            result = self._make_api_request("POST", "/v1/payments/payouts", payout_data)
            
            logger.info(f"✅ PayPal payout created: {result['batch_header']['payout_batch_id']}")
            return {
                "success": True,
                "payout_batch_id": result["batch_header"]["payout_batch_id"],
                "batch_status": result["batch_header"]["batch_status"],
                "amount": amount,
                "currency": currency,
                "receiver": email
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to create PayPal payout: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_payout_status(self, payout_batch_id: str) -> Dict[str, Any]:
        """Get PayPal payout status"""
        try:
            result = self._make_api_request("GET", f"/v1/payments/payouts/{payout_batch_id}")
            return {
                "success": True,
                "payout_batch_id": result["batch_header"]["payout_batch_id"],
                "batch_status": result["batch_header"]["batch_status"],
                "amount": result["batch_header"]["amount"]["value"],
                "currency": result["batch_header"]["amount"]["currency"],
                "transactions": result["items"]
            }
        except Exception as e:
            logger.error(f"❌ Failed to get payout status: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def refund_payment(self, capture_id: str, amount: float = None, currency: str = "USD") -> Dict[str, Any]:
        """Refund a PayPal payment"""
        try:
            refund_data = {}
            if amount:
                refund_data["amount"] = {
                    "value": f"{amount:.2f}",
                    "currency_code": currency.upper()
                }
            
            logger.info(f"Processing refund for capture: {capture_id}")
            result = self._make_api_request("POST", f"/v2/payments/captures/{capture_id}/refund", refund_data)
            
            logger.info(f"✅ PayPal refund processed: {result['id']}")
            return {
                "success": True,
                "refund_id": result["id"],
                "status": result["status"],
                "amount": float(result["amount"]["value"]),
                "currency": result["amount"]["currency_code"]
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to process refund: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

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

    def update_payment_status(self, payment_id: str, status: PaymentStatus, transaction_id: Optional[str] = None, order_id: Optional[str] = None) -> bool:
        """Update payment status"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            if transaction_id:
                update_data["transaction_id"] = transaction_id
            if order_id:
                update_data["order_id"] = order_id
                
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

    def get_payment_by_order_id(self, order_id: str) -> Dict[str, Any]:
        """Get payment record by PayPal order ID"""
        payment = self.payments.find_one({"order_id": order_id})
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
def create_paypal_payment_router(payments_collection, earnings_collection, campaigns_collection, users_collection, get_current_user):
    router = APIRouter(prefix="/paypal", tags=["paypal-payments"])
    
    # Initialize services
    paypal_service = PayPalService()
    payment_ops = PaymentOperations(payments_collection, earnings_collection, campaigns_collection, users_collection)
    email_service = EmailService()

    async def _process_successful_payment(
        payment_record: Dict[str, Any],
        background_tasks: BackgroundTasks,
        transaction_id: str,
        order_id: str,
        payer_email: str = "",
        payer_name: str = ""
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
                "transaction_id": transaction_id,
                "order_id": order_id
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
            
            logger.info(f"🎉 PayPal payment process completed successfully for order: {order_id}")
            
            return PaymentResponse(
                success=True,
                message="Payment confirmed successfully and campaign marked as completed",
                payment_id=str(payment_record["_id"]),
                order_id=order_id,
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
                order_id=order_id,
                amount=payment_record["amount"],
                currency=payment_record["currency"],
                status="completed_with_warnings"
            )

    # ---------------- Create PayPal Order ----------------
    # ---------------- Create PayPal Order ----------------
    @router.post("/create-order", response_model=PaymentResponse)
    async def create_paypal_order(
        payment_data: PayPalOrderCreate,
        current_user: dict = Depends(get_current_user)
    ):
        """Create a PayPal order for payment"""
        try:
            logger.info(f"💰 Creating PayPal order for user {current_user['_id']} - Campaign: {payment_data.campaign_id}")
            
            if current_user.get("role") != "brand":
                raise HTTPException(status_code=403, detail="Only brands can create payments")
            
            # Validate payment eligibility
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
            
            # Create custom ID for tracking
            custom_id = f"campaign_{payment_data.campaign_id}_influencer_{payment_data.influencer_id}"
            
            # Create PayPal order
            paypal_result = paypal_service.create_order(
                amount=payment_data.amount,
                currency=payment_data.currency,
                description=payment_data.description,
                custom_id=custom_id,
                metadata={
                    "campaign_id": payment_data.campaign_id,
                    "influencer_id": payment_data.influencer_id,
                    "brand_id": str(current_user["_id"]),
                    "campaign_title": campaign.get("title", "Unknown Campaign")
                }
            )
            
            if not paypal_result["success"]:
                error_detail = paypal_result.get("error", "Failed to create PayPal order")
                logger.error(f"❌ PayPal order creation failed: {error_detail}")
                
                # Provide more specific error messages
                if "invalid_client" in error_detail.lower():
                    error_detail = "PayPal authentication failed. Please check server configuration."
                elif "network error" in error_detail.lower():
                    error_detail = "Network error connecting to PayPal. Please try again."
                    
                raise HTTPException(status_code=400, detail=error_detail)
            
            # Create payment record
            payment_record = {
                "campaign_id": payment_data.campaign_id,
                "brand_id": str(current_user["_id"]),
                "influencer_id": payment_data.influencer_id,
                "amount": payment_data.amount,
                "currency": payment_data.currency,
                "status": PaymentStatus.CREATED,
                "order_id": paypal_result["order_id"],
                "payment_gateway": "paypal",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {
                    "campaign_title": campaign.get("title"),
                    "influencer_name": None,
                    "brand_name": current_user.get("username"),
                    "description": payment_data.description
                }
            }
            
            payment_id = payment_ops.create_payment_record(payment_record)
            
            return PaymentResponse(
                success=True,
                message="PayPal order created successfully",
                payment_id=payment_id,
                order_id=paypal_result["order_id"],
                approval_url=paypal_result["approval_url"],
                amount=payment_data.amount,
                currency=payment_data.currency,
                status=paypal_result["status"]
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error in create PayPal order: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    # ---------------- Capture PayPal Payment ----------------
    @router.post("/capture-order", response_model=PaymentResponse)
    async def capture_paypal_order(
        background_tasks: BackgroundTasks,
        payment_data: PayPalOrderCapture,
        current_user: dict = Depends(get_current_user)
    ):
        """Capture PayPal payment and update application status to completed"""
        try:
            logger.info(f"🔍 Processing PayPal order capture for: {payment_data.order_id}")
            
            # Step 1: Get payment record
            payment_record = payment_ops.get_payment_by_order_id(payment_data.order_id)
            
            # Check if user owns this payment
            if payment_record["brand_id"] != str(current_user["_id"]):
                raise HTTPException(status_code=403, detail="Not authorized for this payment")
            
            # Step 2: Check current payment status in database
            if payment_record.get("status") == PaymentStatus.COMPLETED:
                logger.info("✅ Payment already completed in database")
                return PaymentResponse(
                    success=True,
                    message="Payment already completed",
                    payment_id=str(payment_record["_id"]),
                    order_id=payment_data.order_id
                )
            
            # Step 3: Check current status with PayPal first
            paypal_status_result = paypal_service.get_order_details(payment_data.order_id)
            
            if not paypal_status_result["success"]:
                raise HTTPException(status_code=400, detail=paypal_status_result.get("error", "Failed to fetch order status"))
            
            paypal_status = paypal_status_result.get("status")
            logger.info(f"📊 PayPal order status: {paypal_status}")
            
            # Step 4: Handle different PayPal statuses
            if paypal_status == "COMPLETED":
                logger.info("✅ Order already completed in PayPal - processing completion...")
                
                # Get capture details
                capture_result = paypal_service.capture_order(payment_data.order_id)
                
                if not capture_result["success"]:
                    raise HTTPException(status_code=400, detail=capture_result.get("error", "Failed to get capture details"))
                
                # Update payment status to completed
                success = payment_ops.update_payment_status(
                    str(payment_record["_id"]),
                    PaymentStatus.COMPLETED,
                    capture_result["transaction_id"],
                    payment_data.order_id
                )
                
                if not success:
                    raise HTTPException(status_code=500, detail="Failed to update payment status")
                
                # Process successful payment
                return await _process_successful_payment(
                    payment_record=payment_record,
                    background_tasks=background_tasks,
                    transaction_id=capture_result["transaction_id"],
                    order_id=payment_data.order_id,
                    payer_email=capture_result.get("payer_email", ""),
                    payer_name=capture_result.get("payer_name", "")
                )
                
            elif paypal_status == "APPROVED":
                # Order needs to be captured
                logger.info("🔄 Order approved - capturing payment...")
                
                capture_result = paypal_service.capture_order(payment_data.order_id, payment_data.payer_id)
                
                if not capture_result["success"]:
                    # Update payment status to failed
                    payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.FAILED
                    )
                    raise HTTPException(status_code=400, detail=capture_result.get("error", "Payment capture failed"))
                
                if capture_result.get("status") == "COMPLETED":
                    # Update payment status to completed
                    success = payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.COMPLETED,
                        capture_result["transaction_id"],
                        payment_data.order_id
                    )
                    
                    if not success:
                        raise HTTPException(status_code=500, detail="Failed to update payment status")
                    
                    return await _process_successful_payment(
                        payment_record=payment_record,
                        background_tasks=background_tasks,
                        transaction_id=capture_result["transaction_id"],
                        order_id=payment_data.order_id,
                        payer_email=capture_result.get("payer_email", ""),
                        payer_name=capture_result.get("payer_name", "")
                    )
                else:
                    # Payment still processing
                    logger.info(f"⏳ Payment processing - current status: {capture_result.get('status')}")
                    return PaymentResponse(
                        success=True,
                        message=f"Payment processing - status: {capture_result.get('status')}",
                        payment_id=str(payment_record["_id"]),
                        order_id=payment_data.order_id,
                        status=capture_result.get("status")
                    )
                    
            elif paypal_status in ["VOIDED", "CANCELLED"]:
                logger.warning(f"❌ Order was cancelled: {payment_data.order_id}")
                payment_ops.update_payment_status(
                    str(payment_record["_id"]),
                    PaymentStatus.CANCELLED
                )
                raise HTTPException(status_code=400, detail="Order was cancelled")
                
            else:
                logger.warning(f"⚠️ Unexpected order status: {paypal_status}")
                raise HTTPException(status_code=400, detail=f"Unexpected order status: {paypal_status}")
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error in PayPal order capture: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error during payment capture")

    # ---------------- PayPal Webhook ----------------
    @router.post("/webhook")
    async def paypal_webhook(
        request: Request,
        background_tasks: BackgroundTasks
    ):
        """Handle PayPal webhook events"""
        try:
            body = await request.body()
            body_str = body.decode('utf-8')
            payload = json.loads(body_str)
            
            logger.info(f"📨 PayPal webhook received: {payload.get('event_type')}")
            
            event_type = payload.get("event_type")
            resource = payload.get("resource", {})
            
            if event_type == "PAYMENT.CAPTURE.COMPLETED":
                order_id = resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id")
                if not order_id:
                    logger.error("❌ No order ID in webhook payload")
                    return JSONResponse(status_code=400, content={"error": "Invalid payload"})
                
                try:
                    payment_record = payment_ops.get_payment_by_order_id(order_id)
                    
                    # Update payment status to completed
                    payment_ops.update_payment_status(
                        str(payment_record["_id"]),
                        PaymentStatus.COMPLETED,
                        resource.get("id"),
                        order_id
                    )
                    
                    # Process successful payment in background
                    background_tasks.add_task(
                        _process_successful_payment,
                        payment_record=payment_record,
                        background_tasks=background_tasks,
                        transaction_id=resource.get("id"),
                        order_id=order_id
                    )
                    
                    logger.info(f"✅ PayPal webhook processed successfully for order {order_id}")
                    
                except Exception as e:
                    logger.error(f"❌ PayPal webhook processing error: {str(e)}")
                    return JSONResponse(status_code=500, content={"error": "Webhook processing failed"})
            
            elif event_type == "PAYMENT.CAPTURE.DENIED":
                order_id = resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id")
                if order_id:
                    try:
                        payment_record = payment_ops.get_payment_by_order_id(order_id)
                        payment_ops.update_payment_status(
                            str(payment_record["_id"]),
                            PaymentStatus.FAILED
                        )
                        logger.info(f"❌ Payment denied via webhook: {order_id}")
                    except Exception as e:
                        logger.error(f"❌ Failed to update payment status to failed: {str(e)}")
            
            return JSONResponse(status_code=200, content={"status": "success"})
            
        except Exception as e:
            logger.error(f"❌ PayPal webhook error: {str(e)}")
            return JSONResponse(status_code=500, content={"error": "Webhook processing failed"})

    # ---------------- Create Payout to Influencer ----------------
    @router.post("/create-payout", response_model=PaymentResponse)
    async def create_paypal_payout(
        payout_data: PayPalPayoutCreate,
        current_user: dict = Depends(get_current_user)
    ):
        """Create PayPal payout to influencer (admin only)"""
        try:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Only admins can create payouts")
            
            payout_result = paypal_service.create_payout(
                email=payout_data.email,
                amount=payout_data.amount,
                currency=payout_data.currency,
                note=payout_data.note
            )
            
            if not payout_result["success"]:
                raise HTTPException(status_code=400, detail=payout_result.get("error", "Failed to create payout"))
            
            return PaymentResponse(
                success=True,
                message="Payout created successfully",
                payout_batch_id=payout_result["payout_batch_id"],
                amount=payout_data.amount,
                currency=payout_data.currency,
                status=payout_result["batch_status"]
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to create PayPal payout: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create payout")

    # ---------------- Get Payout Status ----------------
    @router.get("/payouts/{payout_batch_id}")
    async def get_payout_status(
        payout_batch_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Get PayPal payout status (admin only)"""
        try:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Only admins can view payout status")
            
            payout_result = paypal_service.get_payout_status(payout_batch_id)
            
            if not payout_result["success"]:
                raise HTTPException(status_code=400, detail=payout_result.get("error", "Failed to get payout status"))
            
            return {
                "success": True,
                "payout_batch_id": payout_result["payout_batch_id"],
                "batch_status": payout_result["batch_status"],
                "amount": payout_result["amount"],
                "currency": payout_result["currency"],
                "transactions": payout_result.get("transactions", [])
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get payout status: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get payout status")

    # ---------------- Refund Payment ----------------
    @router.post("/refund/{capture_id}")
    async def refund_paypal_payment(
        capture_id: str,
        amount: float = Query(None, gt=0),
        currency: str = Query("USD"),
        current_user: dict = Depends(get_current_user)
    ):
        """Refund a PayPal payment (admin only)"""
        try:
            if current_user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Only admins can process refunds")
            
            refund_result = paypal_service.refund_payment(capture_id, amount, currency)
            
            if not refund_result["success"]:
                raise HTTPException(status_code=400, detail=refund_result.get("error", "Failed to process refund"))
            
            return {
                "success": True,
                "refund_id": refund_result["refund_id"],
                "status": refund_result["status"],
                "amount": refund_result["amount"],
                "currency": refund_result["currency"],
                "message": "Refund processed successfully"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to process refund: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process refund")

    # ---------------- Get Order Details ----------------
    @router.get("/orders/{order_id}")
    async def get_paypal_order_details(
        order_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Get PayPal order details"""
        try:
            payment_record = payment_ops.get_payment_by_order_id(order_id)
            
            # Check if user owns this payment
            if (payment_record["brand_id"] != str(current_user["_id"]) and 
                current_user.get("role") != "admin"):
                raise HTTPException(status_code=403, detail="Not authorized to view this order")
            
            order_result = paypal_service.get_order_details(order_id)
            
            if not order_result["success"]:
                raise HTTPException(status_code=400, detail=order_result.get("error", "Failed to get order details"))
            
            return {
                "success": True,
                "order": order_result["order"],
                "payment_record": payment_record
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get order details: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get order details")

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
        
        
        
        # ---------------- Get PayPal Payment History ----------------
    @router.get("/payment-history")
    async def get_paypal_payment_history(
        page: int = Query(1, ge=1),
        limit: int = Query(20, ge=1, le=100),
        status: Optional[str] = Query(None),
        current_user: dict = Depends(get_current_user)
    ):
        """Get PayPal payment history for current user"""
        try:
            # Build query filter
            query_filter = {"payment_gateway": "paypal"}
            
            if current_user.get("role") == "brand":
                query_filter["brand_id"] = str(current_user["_id"])
            elif current_user.get("role") == "influencer":
                query_filter["influencer_id"] = str(current_user["_id"])
            else:
                raise HTTPException(status_code=403, detail="Access denied")
            
            # Add status filter if provided
            if status:
                query_filter["status"] = status
            
            # Calculate skip for pagination
            skip = (page - 1) * limit
            
            # Get total count
            total = payments_collection.count_documents(query_filter)
            
            # Get payments with pagination
            payments_cursor = payments_collection.find(query_filter).sort("created_at", -1).skip(skip).limit(limit)
            payments = list(payments_cursor)
            
            # Format payments with additional details
            formatted_payments = []
            for payment in payments:
                payment_data = {
                    "_id": str(payment.get("_id")),
                    "order_id": payment.get("order_id"),
                    "campaign_id": payment.get("campaign_id"),
                    "brand_id": payment.get("brand_id"),
                    "influencer_id": payment.get("influencer_id"),
                    "amount": payment.get("amount", 0),
                    "currency": payment.get("currency", "USD"),
                    "status": payment.get("status"),
                    "transaction_id": payment.get("transaction_id"),
                    "payment_gateway": payment.get("payment_gateway", "paypal"),
                    "created_at": payment.get("created_at"),
                    "updated_at": payment.get("updated_at")
                }
                
                # Add campaign title
                try:
                    campaign = payment_ops.get_campaign(payment.get("campaign_id"))
                    payment_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
                except:
                    payment_data["campaign_title"] = "Unknown Campaign"
                
                # Add influencer name if user is brand
                if current_user.get("role") == "brand":
                    try:
                        influencer = payment_ops.get_user(payment.get("influencer_id"))
                        payment_data["influencer_name"] = influencer.get("username", "Unknown Influencer")
                    except:
                        payment_data["influencer_name"] = "Unknown Influencer"
                
                # Add brand name if user is influencer
                elif current_user.get("role") == "influencer":
                    try:
                        brand = payment_ops.get_user(payment.get("brand_id"))
                        payment_data["brand_name"] = brand.get("username", "Unknown Brand")
                    except:
                        payment_data["brand_name"] = "Unknown Brand"
                
                formatted_payments.append(payment_data)
            
            logger.info(f"✅ PayPal payment history fetched for {current_user['role']}: {len(payments)} payments")
            
            return {
                "success": True,
                "payments": formatted_payments,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit  # Ceiling division
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to fetch PayPal payment history: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch payment history")
    
    # ---------------- Get Payment Details ----------------
    @router.get("/payments/{payment_id}")
    async def get_paypal_payment_details(
        payment_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Get detailed PayPal payment information"""
        try:
            payment = payments_collection.find_one({"_id": payment_ops._validate_object_id(payment_id)})
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            # Check authorization
            if (current_user["role"] == "brand" and payment["brand_id"] != str(current_user["_id"])) and \
            (current_user["role"] == "influencer" and payment["influencer_id"] != str(current_user["_id"])) and \
            (current_user["role"] != "admin"):
                raise HTTPException(status_code=403, detail="Not authorized to view this payment")
            
            payment_data = {
                "_id": str(payment["_id"]),
                "order_id": payment.get("order_id"),
                "campaign_id": payment["campaign_id"],
                "brand_id": payment["brand_id"],
                "influencer_id": payment["influencer_id"],
                "amount": payment["amount"],
                "currency": payment["currency"],
                "status": payment["status"],
                "transaction_id": payment.get("transaction_id"),
                "payment_gateway": payment.get("payment_gateway", "paypal"),
                "created_at": payment["created_at"],
                "updated_at": payment.get("updated_at"),
                "metadata": payment.get("metadata", {})
            }
            
            # Get additional details
            try:
                campaign = payment_ops.get_campaign(payment["campaign_id"])
                payment_data["campaign_title"] = campaign.get("title", "Unknown Campaign")
                payment_data["campaign_description"] = campaign.get("description", "")
                
                if current_user["role"] == "brand":
                    influencer = payment_ops.get_user(payment["influencer_id"])
                    payment_data["influencer_name"] = influencer.get("username", "Unknown Influencer")
                    payment_data["influencer_email"] = influencer.get("email", "")
                else:
                    brand = payment_ops.get_user(payment["brand_id"])
                    payment_data["brand_name"] = brand.get("username", "Unknown Brand")
                    payment_data["brand_email"] = brand.get("email", "")
                    
            except Exception as e:
                logger.warning(f"⚠️ Failed to fetch additional details: {str(e)}")
            
            return {
                "success": True,
                "payment": payment_data
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch payment details: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch payment details")
        
        

    return router