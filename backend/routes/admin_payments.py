# backend/routes/admin_payments.py
import os
import logging
import json
import csv
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple, Union
from enum import Enum
from io import StringIO

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, validator, model_validator
from bson import ObjectId
from bson.errors import InvalidId
import stripe
import calendar
from collections import defaultdict

from database import (
    db,
    admin_payments_collection,
    payouts_collection,
    payments_collection,
    earnings_collection,
    campaigns_collection,
    users_collection,
    influencer_withdrawals_collection,
    brand_payments_collection
)
from auth.utils import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Stripe if key exists
stripe_api_key = os.getenv("STRIPE_SECRET_KEY")
if stripe_api_key:
    stripe.api_key = stripe_api_key

router = APIRouter(prefix="/admin/payments", tags=["admin-payments"])

# ==================== ENUMS ====================
class AdminPaymentStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    RAZORPAY = "razorpay"
    STRIPE = "stripe"
    PAYPAL = "paypal"
    MANUAL_TRANSFER = "manual_transfer"
    BANK_TRANSFER = "bank_transfer"
    UPI = "upi"
    CASH = "cash"

class PayoutStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    INITIATED = "initiated"
    PROCESSING = "processing"
    PROCESSED = "processed"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class PayoutMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    STRIPE_CONNECT = "stripe_connect"
    RAZORPAY_X = "razorpay_x"
    PAYPAL = "paypal"
    UPI = "upi"
    MANUAL = "manual"

class WithdrawalStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONTRACTED = "contracted"
    MEDIA_SUBMITTED = "media_submitted"
    COMPLETED = "completed"

class PaymentFlowStatus(str, Enum):
    APPLICATION_COMPLETED = "application_completed"
    WAITING_PAYMENT = "waiting_payment"
    PAYMENT_CREATED = "payment_created"
    PAYMENT_APPROVED = "payment_approved"
    PAYMENT_PROCESSING = "payment_processing"
    PAYMENT_COMPLETED = "payment_completed"
    EARNING_CREATED = "earning_created"
    EARNING_AVAILABLE = "earning_available"
    WITHDRAWAL_REQUESTED = "withdrawal_requested"
    WITHDRAWAL_PROCESSED = "withdrawal_processed"

# ==================== PYDANTIC MODELS ====================
class BankDetails(BaseModel):
    account_holder_name: str = Field(..., min_length=1)
    account_number: str = Field(..., min_length=5)
    ifsc_code: str = Field(..., min_length=8, max_length=11)
    bank_name: str = Field(..., min_length=1)
    branch: Optional[str] = None

class UPIDetails(BaseModel):
    upi_id: str = Field(..., pattern=r'^[\w.\-]+@[\w]+$')
    provider: Optional[str] = None

class PayPalDetails(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    account_name: Optional[str] = None

class PayoutDetails(BaseModel):
    payout_method: PayoutMethod
    bank_details: Optional[BankDetails] = None
    upi_details: Optional[UPIDetails] = None
    paypal_details: Optional[PayPalDetails] = None
    stripe_connect_id: Optional[str] = None
    razorpay_contact_id: Optional[str] = None

    @model_validator(mode='after')
    def validate_payout_details(self):
        method_requirements = {
            PayoutMethod.BANK_TRANSFER: ("bank_details", "Bank details"),
            PayoutMethod.UPI: ("upi_details", "UPI details"),
            PayoutMethod.PAYPAL: ("paypal_details", "PayPal details"),
            PayoutMethod.STRIPE_CONNECT: ("stripe_connect_id", "Stripe Connect ID"),
            PayoutMethod.RAZORPAY_X: ("razorpay_contact_id", "Razorpay contact ID")
        }
        
        if self.payout_method in method_requirements:
            field_name, field_label = method_requirements[self.payout_method]
            if not getattr(self, field_name):
                raise ValueError(f"{field_label} required for {self.payout_method.value} payout")
        return self

class AdminPaymentCreate(BaseModel):
    campaign_id: str = Field(..., description="Campaign ID")
    influencer_id: str = Field(..., description="Influencer ID")
    amount: float = Field(..., gt=0, description="Payment amount")
    currency: str = Field("USD", description="Currency code")
    payment_method: PaymentMethod
    notes: Optional[str] = None
    scheduled_payout_date: Optional[datetime] = None
    auto_approve: bool = False
    
    @validator('currency')
    def validate_currency(cls, v):
        valid_currencies = [
            "USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "NZD", "CHF",
            "JPY", "KRW", "HKD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF",
            "THB", "PHP", "MYR", "IDR", "ZAR", "BRL", "MXN"
        ]
        v_upper = v.upper()
        if v_upper not in valid_currencies:
            raise ValueError(f"Invalid currency. Must be one of: {', '.join(valid_currencies)}")
        return v_upper

class AdminPaymentUpdate(BaseModel):
    status: AdminPaymentStatus
    notes: Optional[str] = None
    transaction_id: Optional[str] = None

class PayoutCreate(BaseModel):
    payment_ids: List[str] = Field(..., min_items=1)
    payout_method: PayoutMethod
    payout_details: PayoutDetails
    scheduled_date: Optional[datetime] = None
    notes: Optional[str] = None

class PayoutUpdate(BaseModel):
    status: PayoutStatus
    transaction_id: Optional[str] = None
    failure_reason: Optional[str] = None
    notes: Optional[str] = None

class BulkPayoutAction(BaseModel):
    payout_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., pattern="^(initiate|process|cancel)$")

class PaymentFlowStep(BaseModel):
    step: PaymentFlowStatus
    status: str = Field("pending", pattern="^(pending|in_progress|completed|failed)$")
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CampaignApplicationPayment(BaseModel):
    campaign_id: str
    campaign_title: str
    brand_id: str
    brand_name: str
    influencer_id: str
    influencer_name: str
    application_id: str
    application_status: str
    application_completed_at: Optional[datetime] = None
    contract_signed: bool = False
    media_submitted: bool = False
    media_submitted_at: Optional[datetime] = None
    payment_required: bool = True
    payment_created: bool = False
    payment_id: Optional[str] = None
    payment_status: Optional[str] = None
    payment_amount: Optional[float] = None
    payment_currency: str = "USD"
    earning_created: bool = False
    earning_id: Optional[str] = None
    earning_status: Optional[str] = None
    payout_created: bool = False
    payout_id: Optional[str] = None
    payout_status: Optional[str] = None

class PaymentDashboardStats(BaseModel):
    total_applications: int = 0
    completed_applications: int = 0
    waiting_payments: int = 0
    pending_payments: int = 0
    processing_payments: int = 0
    completed_payments: int = 0
    failed_payments: int = 0
    pending_payouts: int = 0
    processing_payouts: int = 0
    completed_payouts: int = 0
    total_platform_fees: float = 0
    total_influencer_payouts: float = 0
    total_brand_payments: float = 0
    pending_withdrawals: int = 0
    processing_withdrawals: int = 0
    completed_withdrawals: int = 0

# ==================== HELPER FUNCTIONS ====================
def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {id_str}")

def admin_only(current_user: dict = Depends(get_current_user)):
    """Ensure user is admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def generate_reference(prefix: str) -> str:
    """Generate unique reference string"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_str = os.urandom(3).hex().upper()[:6]
    return f"{prefix}{timestamp}{random_str}"

# ==================== DATABASE MODELS ====================
class PaymentFlowModel:
    """Manage complete payment flow tracking"""
    
    COLLECTION = "payment_flows"
    
    @staticmethod
    def create(
        campaign_id: str,
        influencer_id: str,
        application_id: str,
        application_status: str
    ) -> str:
        """Create new payment flow tracking"""
        try:
            flow_data = {
                "campaign_id": campaign_id,
                "influencer_id": influencer_id,
                "application_id": application_id,
                "application_status": application_status,
                "current_step": PaymentFlowStatus.APPLICATION_COMPLETED,
                "overall_status": "pending",
                "flow_steps": [{
                    "step": PaymentFlowStatus.APPLICATION_COMPLETED,
                    "status": "completed",
                    "timestamp": datetime.utcnow(),
                    "notes": "Application marked as completed"
                }],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = db[PaymentFlowModel.COLLECTION].insert_one(flow_data)
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to create payment flow: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create payment flow")

    @staticmethod
    def update_step(
        flow_id: str,
        step: PaymentFlowStatus,
        status: str = "completed",
        notes: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update payment flow with new step"""
        try:
            flow = db[PaymentFlowModel.COLLECTION].find_one(
                {"_id": validate_object_id(flow_id)}
            )
            if not flow:
                return False
            
            new_step = {
                "step": step,
                "status": status,
                "timestamp": datetime.utcnow(),
                "notes": notes,
                "metadata": metadata or {}
            }
            
            update_data = {
                "current_step": step,
                "updated_at": datetime.utcnow()
            }
            
            # Update overall status based on step
            if status == "failed":
                update_data["overall_status"] = "failed"
            elif step == PaymentFlowStatus.WITHDRAWAL_PROCESSED and status == "completed":
                update_data["overall_status"] = "completed"
            
            result = db[PaymentFlowModel.COLLECTION].update_one(
                {"_id": validate_object_id(flow_id)},
                {
                    "$set": update_data,
                    "$push": {"flow_steps": new_step}
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to update payment flow: {str(e)}")
            return False

    @staticmethod
    def get(flow_id: str) -> Dict[str, Any]:
        """Get payment flow by ID"""
        try:
            flow = db[PaymentFlowModel.COLLECTION].find_one(
                {"_id": validate_object_id(flow_id)}
            )
            if not flow:
                raise HTTPException(status_code=404, detail="Payment flow not found")
            
            flow["_id"] = str(flow["_id"])
            return flow
            
        except Exception as e:
            logger.error(f"Failed to get payment flow: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get payment flow")

class PaymentModel:
    """Enhanced payment management with complete flow tracking"""
    
    @staticmethod
    def create_from_completed_application(
        campaign_id: str,
        influencer_id: str,
        brand_id: str,
        amount: float,
        currency: str = "USD",
        payment_method: PaymentMethod = PaymentMethod.MANUAL_TRANSFER,
        notes: Optional[str] = None
    ) -> Tuple[str, str]:
        """Create admin payment from completed application"""
        try:
            payment_reference = generate_reference("PAY")
            
            payment_data = {
                "campaign_id": campaign_id,
                "influencer_id": influencer_id,
                "brand_id": brand_id,
                "amount": amount,
                "currency": currency,
                "payment_method": payment_method.value,
                "status": AdminPaymentStatus.PENDING_APPROVAL.value,
                "payment_reference": payment_reference,
                "notes": notes or f"Payment for completed campaign application",
                "source": "completed_application",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {
                    "auto_generated": True,
                    "generated_from": "completed_application"
                }
            }
            
            result = admin_payments_collection.insert_one(payment_data)
            payment_id = str(result.inserted_id)
            
            # Create payment flow
            flow_id = PaymentFlowModel.create(
                campaign_id=campaign_id,
                influencer_id=influencer_id,
                application_id=f"{campaign_id}_{influencer_id}",
                application_status="completed"
            )
            
            # Update flow with payment creation
            PaymentFlowModel.update_step(
                flow_id=flow_id,
                step=PaymentFlowStatus.PAYMENT_CREATED,
                notes=f"Payment {payment_reference} created",
                metadata={"payment_id": payment_id}
            )
            
            # Create audit log
            AuditLogModel.create(
                entity_type="payment",
                entity_id=payment_id,
                action="create_from_application",
                performed_by="system",
                changes={"payment_data": payment_data}
            )
            
            return payment_id, flow_id
            
        except Exception as e:
            logger.error(f"Failed to create payment from application: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create payment")

    @staticmethod
    def get_completed_applications_for_payment() -> List[Dict[str, Any]]:
        """Get all completed applications that need payment"""
        try:
            completed_applications = []
            
            campaigns = list(campaigns_collection.find({
                "applications.status": ApplicationStatus.COMPLETED.value
            }))
            
            for campaign in campaigns:
                campaign_id = str(campaign["_id"])
                brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
                brand_name = brand.get("username", "Unknown") if brand else "Unknown"
                
                for app in campaign.get("applications", []):
                    if app.get("status") == ApplicationStatus.COMPLETED.value:
                        influencer_id = app.get("influencer_id")
                        
                        # Check if payment already exists
                        existing_payment = admin_payments_collection.find_one({
                            "campaign_id": campaign_id,
                            "influencer_id": influencer_id,
                            "status": {"$in": [
                                AdminPaymentStatus.PENDING_APPROVAL.value,
                                AdminPaymentStatus.APPROVED.value,
                                AdminPaymentStatus.PROCESSING.value,
                                AdminPaymentStatus.COMPLETED.value
                            ]}
                        })
                        
                        # Get influencer details
                        influencer = users_collection.find_one({"_id": ObjectId(influencer_id)})
                        influencer_name = influencer.get("username", "Unknown") if influencer else "Unknown"
                        
                        app_data = {
                            "campaign_id": campaign_id,
                            "campaign_title": campaign.get("title", "Untitled"),
                            "brand_id": str(campaign["brand_id"]),
                            "brand_name": brand_name,
                            "influencer_id": influencer_id,
                            "influencer_name": influencer_name,
                            "application_id": f"{campaign_id}_{influencer_id}",
                            "application_status": app.get("status"),
                            "application_completed_at": app.get("completed_at"),
                            "contract_signed": app.get("contract_signed", False),
                            "media_submitted": bool(app.get("submitted_media")),
                            "media_submitted_at": app.get("media_submitted_at"),
                            "payment_required": True,
                            "payment_created": existing_payment is not None,
                            "payment_id": str(existing_payment["_id"]) if existing_payment else None,
                            "payment_status": existing_payment.get("status") if existing_payment else None,
                            "payment_amount": existing_payment.get("amount") if existing_payment else campaign.get("budget", 0),
                            "payment_currency": existing_payment.get("currency") if existing_payment else campaign.get("currency", "USD"),
                            "earning_created": False,
                            "created_at": app.get("completed_at") or datetime.utcnow()
                        }
                        
                        # Check for existing earnings
                        if existing_payment:
                            earning = earnings_collection.find_one({
                                "admin_payment_id": str(existing_payment["_id"])
                            })
                            if earning:
                                app_data["earning_created"] = True
                                app_data["earning_id"] = str(earning["_id"])
                                app_data["earning_status"] = earning.get("status")
                                app_data["earning_amount"] = earning.get("amount")
                        
                        completed_applications.append(app_data)
            
            # Sort by completion date (oldest first) - handle None dates
            completed_applications.sort(
                key=lambda x: x.get("application_completed_at") or datetime.min
            )
            
            return completed_applications
            
        except Exception as e:
            logger.error(f"Failed to get completed applications: {str(e)}")
            return []

    @staticmethod
    def batch_create_from_applications(application_ids: List[str]) -> Dict[str, Any]:
        """Batch create payments from multiple completed applications"""
        results = {
            "successful": [],
            "failed": [],
            "already_processed": []
        }
        
        for app_id in application_ids:
            try:
                # Parse application_id format: campaign_id_influencer_id
                parts = app_id.split("_", 1)
                if len(parts) != 2:
                    results["failed"].append({
                        "application_id": app_id,
                        "reason": "Invalid application ID format"
                    })
                    continue
                
                campaign_id, influencer_id = parts
                
                # Check if already processed
                existing_payment = admin_payments_collection.find_one({
                    "campaign_id": campaign_id,
                    "influencer_id": influencer_id,
                    "status": {"$in": [
                        AdminPaymentStatus.PENDING_APPROVAL.value,
                        AdminPaymentStatus.APPROVED.value,
                        AdminPaymentStatus.PROCESSING.value,
                        AdminPaymentStatus.COMPLETED.value
                    ]}
                })
                
                if existing_payment:
                    results["already_processed"].append({
                        "application_id": app_id,
                        "payment_id": str(existing_payment["_id"]),
                        "payment_status": existing_payment.get("status")
                    })
                    continue
                
                # Get campaign details
                campaign = campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
                if not campaign:
                    results["failed"].append({
                        "application_id": app_id,
                        "reason": "Campaign not found"
                    })
                    continue
                
                # Get application
                application = None
                for app in campaign.get("applications", []):
                    if app.get("influencer_id") == influencer_id:
                        application = app
                        break
                
                if not application or application.get("status") != ApplicationStatus.COMPLETED.value:
                    results["failed"].append({
                        "application_id": app_id,
                        "reason": "Application not completed"
                    })
                    continue
                
                # Create payment
                payment_id, flow_id = PaymentModel.create_from_completed_application(
                    campaign_id=campaign_id,
                    influencer_id=influencer_id,
                    brand_id=str(campaign["brand_id"]),
                    amount=campaign.get("budget", 0),
                    currency=campaign.get("currency", "USD"),
                    notes=f"Batch created from completed application"
                )
                
                results["successful"].append({
                    "application_id": app_id,
                    "payment_id": payment_id,
                    "flow_id": flow_id,
                    "amount": campaign.get("budget", 0),
                    "currency": campaign.get("currency", "USD")
                })
                
            except Exception as e:
                logger.error(f"Failed to create payment for {app_id}: {str(e)}")
                results["failed"].append({
                    "application_id": app_id,
                    "reason": str(e)
                })
        
        return results

class EarningsModel:
    """Enhanced earnings management"""
    
    @staticmethod
    def create_from_payment(payment_id: str, flow_id: str) -> str:
        """Create earning record from approved payment"""
        try:
            payment = admin_payments_collection.find_one(
                {"_id": validate_object_id(payment_id)}
            )
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            # Check if earning already exists
            existing_earning = earnings_collection.find_one(
                {"admin_payment_id": payment_id}
            )
            if existing_earning:
                return str(existing_earning["_id"])
            
            # Create earning record
            earning_data = {
                "influencer_id": payment["influencer_id"],
                "campaign_id": payment["campaign_id"],
                "brand_id": payment.get("brand_id"),
                "admin_payment_id": payment_id,
                "amount": payment["amount"],
                "currency": payment["currency"],
                "payment_method": payment["payment_method"],
                "status": "pending",
                "type": "campaign_earning",
                "notes": f"Earning from payment {payment.get('payment_reference')}",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {
                    "payment_reference": payment.get("payment_reference"),
                    "campaign_title": payment.get("metadata", {}).get("campaign_title", "Unknown")
                }
            }
            
            result = earnings_collection.insert_one(earning_data)
            earning_id = str(result.inserted_id)
            
            # Update payment flow
            PaymentFlowModel.update_step(
                flow_id=flow_id,
                step=PaymentFlowStatus.EARNING_CREATED,
                notes=f"Earning record created: {earning_id}",
                metadata={"earning_id": earning_id}
            )
            
            # Create audit log
            AuditLogModel.create(
                entity_type="earning",
                entity_id=earning_id,
                action="create_from_payment",
                performed_by="system",
                changes={"earning_data": earning_data}
            )
            
            return earning_id
            
        except Exception as e:
            logger.error(f"Failed to create earning from payment: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create earning")

class PayoutModel:
    """Payout management"""
    
    @staticmethod
    def create(payout_data: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """Create a new payout"""
        try:
            payout_reference = generate_reference("POUT")
            payout_data["payout_reference"] = payout_reference
            
            # Validate payment IDs
            for payment_id in payout_data["payment_ids"]:
                payment = admin_payments_collection.find_one({
                    "_id": validate_object_id(payment_id)
                })
                if not payment:
                    raise HTTPException(
                        status_code=404, 
                        detail=f"Payment {payment_id} not found"
                    )
                if payment.get("status") != AdminPaymentStatus.APPROVED.value:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Payment {payment_id} is not approved"
                    )
            
            # Calculate total amount
            total_amount = 0
            for payment_id in payout_data["payment_ids"]:
                payment = admin_payments_collection.find_one({
                    "_id": validate_object_id(payment_id)
                })
                total_amount += payment.get("amount", 0)
            
            payout_data["total_amount"] = total_amount
            payout_data["payment_count"] = len(payout_data["payment_ids"])
            
            result = payouts_collection.insert_one(payout_data)
            payout_id = str(result.inserted_id)
            
            # Update payment statuses
            for payment_id in payout_data["payment_ids"]:
                admin_payments_collection.update_one(
                    {"_id": validate_object_id(payment_id)},
                    {"$set": {
                        "status": AdminPaymentStatus.PROCESSING.value,
                        "payout_id": payout_id
                    }}
                )
            
            # Create audit log
            AuditLogModel.create(
                entity_type="payout",
                entity_id=payout_id,
                action="create",
                performed_by=payout_data.get("created_by"),
                changes={"new_payout": payout_data}
            )
            
            return payout_id, payout_data
            
        except Exception as e:
            logger.error(f"Failed to create payout: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create payout")

class AuditLogModel:
    """Audit logging"""
    
    COLLECTION = "payment_audit_logs"
    
    @staticmethod
    def create(
        entity_type: str,
        entity_id: str,
        action: str,
        performed_by: str,
        changes: Dict[str, Any]
    ):
        """Create audit log entry"""
        try:
            audit_log = {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "action": action,
                "performed_by": performed_by,
                "changes": changes,
                "timestamp": datetime.utcnow(),
                "ip_address": None
            }
            
            db[AuditLogModel.COLLECTION].insert_one(audit_log)
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")

class PaymentDashboardService:
    """Dashboard statistics service"""
    
    @staticmethod
    def get_stats() -> PaymentDashboardStats:
        """Get comprehensive payment dashboard statistics"""
        try:
            # Application statistics
            pipeline_applications = [
                {"$unwind": "$applications"},
                {"$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "completed": {
                        "$sum": {"$cond": [{"$eq": ["$applications.status", "completed"]}, 1, 0]}
                    }
                }}
            ]
            
            app_stats = list(campaigns_collection.aggregate(pipeline_applications))
            total_applications = app_stats[0]["total"] if app_stats else 0
            completed_applications = app_stats[0]["completed"] if app_stats else 0
            
            # Payment status counts
            waiting_payments = admin_payments_collection.count_documents({
                "status": AdminPaymentStatus.PENDING_APPROVAL.value
            })
            
            pending_payments = admin_payments_collection.count_documents({
                "status": AdminPaymentStatus.APPROVED.value
            })
            
            processing_payments = admin_payments_collection.count_documents({
                "status": AdminPaymentStatus.PROCESSING.value
            })
            
            completed_payments = admin_payments_collection.count_documents({
                "status": AdminPaymentStatus.COMPLETED.value
            })
            
            failed_payments = admin_payments_collection.count_documents({
                "status": AdminPaymentStatus.FAILED.value
            })
            
            # Payout status counts
            pending_payouts = payouts_collection.count_documents({
                "status": PayoutStatus.PENDING.value
            })
            
            processing_payouts = payouts_collection.count_documents({
                "status": PayoutStatus.PROCESSING.value
            })
            
            completed_payouts = payouts_collection.count_documents({
                "status": PayoutStatus.PAID.value
            })
            
            # Withdrawal status counts
            pending_withdrawals = influencer_withdrawals_collection.count_documents({
                "status": "pending"
            })
            
            processing_withdrawals = influencer_withdrawals_collection.count_documents({
                "status": "processing"
            })
            
            completed_withdrawals = influencer_withdrawals_collection.count_documents({
                "status": "completed"
            })
            
            # Financial statistics
            pipeline_fees = [
                {"$match": {"status": AdminPaymentStatus.COMPLETED.value}},
                {"$group": {
                    "_id": None,
                    "total_amount": {"$sum": "$amount"},
                    "platform_fees": {"$sum": {"$multiply": ["$amount", 0.10]}}
                }}
            ]
            
            fee_stats = list(admin_payments_collection.aggregate(pipeline_fees))
            total_platform_fees = fee_stats[0]["platform_fees"] if fee_stats else 0
            total_influencer_payouts = fee_stats[0]["total_amount"] - total_platform_fees if fee_stats else 0
            
            # Brand payments
            pipeline_brand_payments = [
                {"$match": {"status": "completed"}},
                {"$group": {
                    "_id": None,
                    "total_amount": {"$sum": "$amount"}
                }}
            ]
            
            brand_payment_stats = list(brand_payments_collection.aggregate(pipeline_brand_payments))
            total_brand_payments = brand_payment_stats[0]["total_amount"] if brand_payment_stats else 0
            
            return PaymentDashboardStats(
                total_applications=total_applications,
                completed_applications=completed_applications,
                waiting_payments=waiting_payments,
                pending_payments=pending_payments,
                processing_payments=processing_payments,
                completed_payments=completed_payments,
                failed_payments=failed_payments,
                pending_payouts=pending_payouts,
                processing_payouts=processing_payouts,
                completed_payouts=completed_payouts,
                total_platform_fees=round(total_platform_fees, 2),
                total_influencer_payouts=round(total_influencer_payouts, 2),
                total_brand_payments=round(total_brand_payments, 2),
                pending_withdrawals=pending_withdrawals,
                processing_withdrawals=processing_withdrawals,
                completed_withdrawals=completed_withdrawals
            )
            
        except Exception as e:
            logger.error(f"Failed to get dashboard stats: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to get dashboard statistics"
            )

# ==================== API ENDPOINTS ====================

# ---------- Dashboard ----------
@router.get("/dashboard/stats", response_model=PaymentDashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(admin_only)
):
    """Get comprehensive payment dashboard statistics"""
    return PaymentDashboardService.get_stats()

# ---------- Applications ----------
@router.get("/applications/completed", response_model=List[CampaignApplicationPayment])
async def get_completed_applications_for_payment(
    brand_id: Optional[str] = Query(None),
    influencer_id: Optional[str] = Query(None),
    campaign_id: Optional[str] = Query(None),
    has_payment: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(admin_only)
):
    """Get all completed applications ready for payment processing"""
    try:
        applications = PaymentModel.get_completed_applications_for_payment()
        
        # Apply filters
        if brand_id:
            applications = [app for app in applications if app["brand_id"] == brand_id]
        
        if influencer_id:
            applications = [app for app in applications if app["influencer_id"] == influencer_id]
        
        if campaign_id:
            applications = [app for app in applications if app["campaign_id"] == campaign_id]
        
        if has_payment is not None:
            if has_payment:
                applications = [app for app in applications if app["payment_created"]]
            else:
                applications = [app for app in applications if not app["payment_created"]]
        
        # Paginate
        paginated_applications = applications[skip:skip + limit]
        
        return paginated_applications
        
    except Exception as e:
        logger.error(f"Failed to get completed applications: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to get completed applications"
        )

@router.post("/applications/batch-create-payments")
async def batch_create_payments_from_applications(
    application_ids: List[str],
    current_user: dict = Depends(admin_only)
):
    """Batch create payments from completed applications"""
    try:
        results = PaymentModel.batch_create_from_applications(application_ids)
        
        return {
            "success": True,
            "message": "Batch payment creation completed",
            "results": results,
            "summary": {
                "total_requested": len(application_ids),
                "successful": len(results["successful"]),
                "failed": len(results["failed"]),
                "already_processed": len(results["already_processed"])
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to batch create payments: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to batch create payments"
        )

# ---------- Payments ----------
@router.get("/payments")
async def get_payments(
    status: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    brand_id: Optional[str] = Query(None),
    influencer_id: Optional[str] = Query(None),
    campaign_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    has_payout: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: dict = Depends(admin_only)
):
    """Get all payments with filtering"""
    try:
        query = {}
        
        if status:
            query["status"] = status
        if payment_method:
            query["payment_method"] = payment_method
        if brand_id:
            query["brand_id"] = brand_id
        if influencer_id:
            query["influencer_id"] = influencer_id
        if campaign_id:
            query["campaign_id"] = campaign_id
        if has_payout is not None:
            query["payout_id"] = {"$exists": has_payout}
        
        # Date range
        if date_from or date_to:
            date_query = {}
            if date_from:
                date_query["$gte"] = date_from
            if date_to:
                date_query["$lte"] = date_to
            query["created_at"] = date_query
        
        # Amount range
        if min_amount is not None or max_amount is not None:
            amount_query = {}
            if min_amount is not None:
                amount_query["$gte"] = min_amount
            if max_amount is not None:
                amount_query["$lte"] = max_amount
            query["amount"] = amount_query
        
        payments = list(admin_payments_collection.find(query)
                       .sort("created_at", -1)
                       .skip(skip)
                       .limit(limit))
        
        total_count = admin_payments_collection.count_documents(query)
        
        # Enrich payment data
        for payment in payments:
            payment["_id"] = str(payment["_id"])
            
            # Add influencer name
            if payment.get("influencer_id"):
                influencer = users_collection.find_one({
                    "_id": ObjectId(payment["influencer_id"])
                })
                payment["influencer_name"] = influencer.get("username", "Unknown") if influencer else "Unknown"
            
            # Add campaign title
            if payment.get("campaign_id"):
                campaign = campaigns_collection.find_one({
                    "_id": ObjectId(payment["campaign_id"])
                })
                payment["campaign_title"] = campaign.get("title", "Unknown") if campaign else "Unknown"
            
            # Add brand name
            if payment.get("brand_id"):
                brand = users_collection.find_one({
                    "_id": ObjectId(payment["brand_id"])
                })
                payment["brand_name"] = brand.get("username", "Unknown") if brand else "Unknown"
        
        return {
            "success": True,
            "payments": payments,
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Failed to get payments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get payments")

@router.post("/payments/create")
async def create_payment(
    payment_data: AdminPaymentCreate,
    current_user: dict = Depends(admin_only)
):
    """Create a new admin payment"""
    try:
        # Verify campaign exists
        campaign = campaigns_collection.find_one({
            "_id": ObjectId(payment_data.campaign_id)
        })
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Verify influencer exists
        influencer = users_collection.find_one({
            "_id": ObjectId(payment_data.influencer_id)
        })
        if not influencer:
            raise HTTPException(status_code=404, detail="Influencer not found")
        
        # Create payment record
        payment_reference = generate_reference("PAY")
        
        payment_record = {
            "campaign_id": payment_data.campaign_id,
            "influencer_id": payment_data.influencer_id,
            "brand_id": campaign.get("brand_id"),
            "amount": payment_data.amount,
            "currency": payment_data.currency,
            "payment_method": payment_data.payment_method,
            "status": AdminPaymentStatus.APPROVED.value if payment_data.auto_approve else AdminPaymentStatus.PENDING_APPROVAL.value,
            "payment_reference": payment_reference,
            "created_by": str(current_user["_id"]),
            "created_by_name": current_user.get("username", "Admin"),
            "notes": payment_data.notes,
            "scheduled_payout_date": payment_data.scheduled_payout_date,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "metadata": {
                "campaign_title": campaign.get("title"),
                "influencer_name": influencer.get("username"),
                "brand_name": users_collection.find_one({
                    "_id": ObjectId(campaign.get("brand_id"))
                }).get("username") if campaign.get("brand_id") else "Unknown"
            }
        }
        
        result = admin_payments_collection.insert_one(payment_record)
        payment_id = str(result.inserted_id)
        
        return {
            "success": True,
            "message": "Payment created successfully",
            "payment_id": payment_id,
            "status": payment_record["status"],
            "payment_reference": payment_reference
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment")

@router.put("/payments/{payment_id}/approve")
async def approve_payment(
    payment_id: str,
    notes: Optional[str] = Query(None),
    current_user: dict = Depends(admin_only)
):
    """Approve a pending payment and create earning"""
    try:
        payment = admin_payments_collection.find_one({
            "_id": validate_object_id(payment_id)
        })
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment.get("status") != AdminPaymentStatus.PENDING_APPROVAL.value:
            raise HTTPException(status_code=400, detail="Payment is not pending approval")
        
        # Update payment status
        update_data = {
            "status": AdminPaymentStatus.APPROVED.value,
            "approved_at": datetime.utcnow(),
            "approved_by": str(current_user["_id"]),
            "approved_by_name": current_user.get("username", "Admin"),
            "updated_at": datetime.utcnow()
        }
        
        if notes:
            update_data["notes"] = notes
        
        result = admin_payments_collection.update_one(
            {"_id": validate_object_id(payment_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Find and update payment flow
        flow = db["payment_flows"].find_one({
            "campaign_id": payment["campaign_id"],
            "influencer_id": payment["influencer_id"]
        })
        
        if flow:
            flow_id = str(flow["_id"])
            PaymentFlowModel.update_step(
                flow_id=flow_id,
                step=PaymentFlowStatus.PAYMENT_APPROVED,
                notes=f"Payment approved by {current_user.get('username', 'Admin')}",
                metadata={"approved_by": str(current_user["_id"])}
            )
            
            # Create earning record
            earning_id = EarningsModel.create_from_payment(payment_id, flow_id)
            
            # Update earning status to available
            earnings_collection.update_one(
                {"_id": ObjectId(earning_id)},
                {"$set": {
                    "status": "available", 
                    "updated_at": datetime.utcnow()
                }}
            )
            
            # Update flow with earning available
            PaymentFlowModel.update_step(
                flow_id=flow_id,
                step=PaymentFlowStatus.EARNING_AVAILABLE,
                notes=f"Earning {earning_id} now available for withdrawal",
                metadata={"earning_id": earning_id}
            )
        
        # Create audit log
        AuditLogModel.create(
            entity_type="payment",
            entity_id=payment_id,
            action="approve",
            performed_by=str(current_user["_id"]),
            changes={"status": AdminPaymentStatus.APPROVED.value}
        )
        
        return {
            "success": True,
            "message": "Payment approved successfully",
            "payment_id": payment_id,
            "earning_created": bool(flow)
        }
        
    except Exception as e:
        logger.error(f"Failed to approve payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to approve payment")

@router.put("/payments/{payment_id}/mark-paid")
async def mark_payment_as_paid(
    payment_id: str,
    transaction_id: str = Query(..., description="External transaction ID"),
    notes: Optional[str] = Query(None),
    current_user: dict = Depends(admin_only)
):
    """Mark payment as paid (completed)"""
    try:
        payment = admin_payments_collection.find_one({
            "_id": validate_object_id(payment_id)
        })
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        valid_statuses = [
            AdminPaymentStatus.APPROVED.value, 
            AdminPaymentStatus.PROCESSING.value
        ]
        if payment.get("status") not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail="Payment must be approved or processing"
            )
        
        # Update payment status
        update_data = {
            "status": AdminPaymentStatus.COMPLETED.value,
            "transaction_id": transaction_id,
            "paid_at": datetime.utcnow(),
            "paid_by": str(current_user["_id"]),
            "paid_by_name": current_user.get("username", "Admin"),
            "updated_at": datetime.utcnow()
        }
        
        if notes:
            update_data["notes"] = notes
        
        result = admin_payments_collection.update_one(
            {"_id": validate_object_id(payment_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Update related earning
        earnings_collection.update_one(
            {"admin_payment_id": payment_id},
            {"$set": {
                "status": "completed",
                "transaction_id": transaction_id,
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Find and update payment flow
        flow = db["payment_flows"].find_one({
            "campaign_id": payment["campaign_id"],
            "influencer_id": payment["influencer_id"]
        })
        
        if flow:
            flow_id = str(flow["_id"])
            PaymentFlowModel.update_step(
                flow_id=flow_id,
                step=PaymentFlowStatus.PAYMENT_COMPLETED,
                notes=f"Payment marked as paid. Transaction: {transaction_id}",
                metadata={"transaction_id": transaction_id}
            )
        
        # Create audit log
        AuditLogModel.create(
            entity_type="payment",
            entity_id=payment_id,
            action="mark_paid",
            performed_by=str(current_user["_id"]),
            changes={
                "status": AdminPaymentStatus.COMPLETED.value,
                "transaction_id": transaction_id
            }
        )
        
        return {
            "success": True,
            "message": "Payment marked as paid successfully",
            "payment_id": payment_id,
            "transaction_id": transaction_id
        }
        
    except Exception as e:
        logger.error(f"Failed to mark payment as paid: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark payment as paid")

# ---------- Earnings ----------
@router.get("/earnings")
async def get_all_earnings(
    status: Optional[str] = Query(None),
    influencer_id: Optional[str] = Query(None),
    brand_id: Optional[str] = Query(None),
    campaign_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_user: dict = Depends(admin_only)
):
    """Get all influencer earnings"""
    try:
        query = {}
        
        if status:
            query["status"] = status
        if influencer_id:
            query["influencer_id"] = influencer_id
        if brand_id:
            query["brand_id"] = brand_id
        if campaign_id:
            query["campaign_id"] = campaign_id
        
        # Date range
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = start_date
            if end_date:
                date_query["$lte"] = end_date
            query["created_at"] = date_query
        
        earnings = list(earnings_collection.find(query)
                       .sort("created_at", -1)
                       .skip(skip)
                       .limit(limit))
        
        total_count = earnings_collection.count_documents(query)
        
        # Enrich earning data
        for earning in earnings:
            earning["_id"] = str(earning["_id"])
            
            # Add influencer info
            if earning.get("influencer_id"):
                influencer = users_collection.find_one({
                    "_id": ObjectId(earning["influencer_id"])
                })
                earning["influencer_name"] = influencer.get("username", "Unknown") if influencer else "Unknown"
            
            # Add campaign info
            if earning.get("campaign_id"):
                campaign = campaigns_collection.find_one({
                    "_id": ObjectId(earning["campaign_id"])
                })
                earning["campaign_title"] = campaign.get("title", "Unknown") if campaign else "Unknown"
            
            # Add brand info
            if earning.get("brand_id"):
                brand = users_collection.find_one({
                    "_id": ObjectId(earning["brand_id"])
                })
                earning["brand_name"] = brand.get("username", "Unknown") if brand else "Unknown"
        
        return {
            "success": True,
            "earnings": earnings,
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Failed to get earnings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get earnings")

# ---------- Payment Flow ----------
@router.get("/payments/flow/{campaign_id}/{influencer_id}")
async def get_payment_flow_status(
    campaign_id: str,
    influencer_id: str,
    current_user: dict = Depends(admin_only)
):
    """Get complete payment flow status for a campaign application"""
    try:
        # Get campaign
        campaign = campaigns_collection.find_one({
            "_id": ObjectId(campaign_id)
        })
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get application
        application = None
        for app in campaign.get("applications", []):
            if app.get("influencer_id") == influencer_id:
                application = app
                break
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get influencer info
        influencer = users_collection.find_one({"_id": ObjectId(influencer_id)})
        influencer_name = influencer.get("username", "Unknown") if influencer else "Unknown"
        
        # Get brand info
        brand = users_collection.find_one({"_id": ObjectId(campaign["brand_id"])})
        brand_name = brand.get("username", "Unknown") if brand else "Unknown"
        
        # Get payment
        payment = admin_payments_collection.find_one({
            "campaign_id": campaign_id,
            "influencer_id": influencer_id
        })
        
        # Get earning
        earning = None
        if payment:
            earning = earnings_collection.find_one({
                "admin_payment_id": str(payment["_id"])
            })
        
        # Get withdrawal
        withdrawal = None
        if earning:
            withdrawal = influencer_withdrawals_collection.find_one({
                "earning_id": str(earning["_id"])
            })
        
        # Get payout
        payout = None
        if payment:
            payout = payouts_collection.find_one({
                "payment_ids": str(payment["_id"])
            })
        
        # Construct flow response
        flow_response = {
            "campaign_id": campaign_id,
            "campaign_title": campaign.get("title", "Unknown"),
            "influencer_id": influencer_id,
            "influencer_name": influencer_name,
            "brand_id": str(campaign["brand_id"]),
            "brand_name": brand_name,
            "application_status": application.get("status", "unknown"),
            "application_completed_at": application.get("completed_at"),
            "media_submitted": bool(application.get("submitted_media")),
            "media_submitted_at": application.get("media_submitted_at"),
            "payment": None,
            "earning": None,
            "withdrawal": None,
            "payout": None,
            "overall_status": "unknown"
        }
        
        # Add payment details
        if payment:
            flow_response["payment"] = {
                "id": str(payment["_id"]),
                "reference": payment.get("payment_reference"),
                "amount": payment.get("amount"),
                "currency": payment.get("currency", "USD"),
                "status": payment.get("status"),
                "method": payment.get("payment_method"),
                "created_at": payment.get("created_at"),
                "approved_at": payment.get("approved_at"),
                "paid_at": payment.get("paid_at")
            }
        
        # Add earning details
        if earning:
            flow_response["earning"] = {
                "id": str(earning["_id"]),
                "amount": earning.get("amount"),
                "currency": earning.get("currency", "USD"),
                "status": earning.get("status"),
                "created_at": earning.get("created_at"),
                "available_at": earning.get("available_at")
            }
        
        # Add withdrawal details
        if withdrawal:
            flow_response["withdrawal"] = {
                "id": str(withdrawal["_id"]),
                "amount": withdrawal.get("amount"),
                "status": withdrawal.get("status"),
                "requested_at": withdrawal.get("requested_at"),
                "processed_at": withdrawal.get("processed_at"),
                "method": withdrawal.get("payment_method")
            }
        
        # Add payout details
        if payout:
            flow_response["payout"] = {
                "id": str(payout["_id"]),
                "reference": payout.get("payout_reference"),
                "status": payout.get("status"),
                "method": payout.get("payout_method"),
                "created_at": payout.get("created_at"),
                "processed_at": payout.get("processed_at")
            }
        
        # Determine overall status
        if withdrawal and withdrawal.get("status") == "completed":
            flow_response["overall_status"] = "completed"
        elif earning and earning.get("status") == "completed":
            flow_response["overall_status"] = "payment_completed"
        elif payment and payment.get("status") == "completed":
            flow_response["overall_status"] = "payment_paid"
        elif payment and payment.get("status") == "approved":
            flow_response["overall_status"] = "payment_approved"
        elif payment:
            flow_response["overall_status"] = payment.get("status")
        elif application.get("status") == "completed":
            flow_response["overall_status"] = "waiting_payment"
        else:
            flow_response["overall_status"] = application.get("status")
        
        return {
            "success": True,
            "flow": flow_response
        }
        
    except Exception as e:
        logger.error(f"Failed to get payment flow: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get payment flow")

# ---------- Health Check ----------
@router.get("/health")
async def health_check(current_user: dict = Depends(admin_only)):
    """Health check endpoint"""
    try:
        # Test all collections
        collections = {
            "admin_payments": admin_payments_collection.count_documents({}),
            "payouts": payouts_collection.count_documents({}),
            "earnings": earnings_collection.count_documents({}),
            "withdrawals": influencer_withdrawals_collection.count_documents({}),
            "campaigns": campaigns_collection.count_documents({}),
            "users": users_collection.count_documents({})
        }
        
        return {
            "status": "healthy",
            "service": "admin-payments",
            "timestamp": datetime.utcnow().isoformat(),
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "admin-payments",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        
@router.get("/analytics/revenue")
async def get_revenue_analytics(
    timeframe: str = Query("30d", description="Timeframe: 7d, 30d, 90d, 1y, all"),
    group_by: str = Query("day", description="Group by: day, week, month"),
    current_user: dict = Depends(admin_only)
):
    """Get revenue analytics"""
    try:
        # Calculate date range
        now = datetime.utcnow()
        timeframe_map = {
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
            "90d": timedelta(days=90),
            "1y": timedelta(days=365),
            "all": None
        }
        
        date_match = {}
        delta = timeframe_map.get(timeframe)
        if delta:
            date_match = {
                "$gte": now - delta
            }
        
        # Revenue pipeline
        pipeline = []
        
        if date_match:
            pipeline.append({"$match": {"created_at": date_match}})
        
        # Group by date
        date_format = {
            "day": "%Y-%m-%d",
            "week": "%Y-%U",
            "month": "%Y-%m"
        }.get(group_by, "%Y-%m-%d")
        
        pipeline.extend([
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": date_format,
                            "date": "$created_at"
                        }
                    },
                    "total_revenue": {"$sum": "$amount"},
                    "payment_count": {"$sum": 1},
                    "completed_revenue": {
                        "$sum": {"$cond": [
                            {"$in": ["$status", ["completed", "approved", "processing"]]}, 
                            "$amount", 
                            0
                        ]}
                    },
                    "completed_count": {
                        "$sum": {"$cond": [
                            {"$in": ["$status", ["completed", "approved", "processing"]]}, 
                            1, 
                            0
                        ]}
                    },
                    "avg_amount": {"$avg": "$amount"}
                }
            },
            {"$sort": {"_id": 1}}
        ])
        
        revenue_data = list(admin_payments_collection.aggregate(pipeline))
        
        # Generate dates for empty data points
        if timeframe in ["7d", "30d", "90d"]:
            # Fill in missing dates
            start_date = now - delta
            all_dates = []
            current = start_date
            
            while current <= now:
                if group_by == "day":
                    date_str = current.strftime("%Y-%m-%d")
                elif group_by == "week":
                    date_str = f"{current.year}-{current.isocalendar()[1]:02d}"
                else:  # month
                    date_str = current.strftime("%Y-%m")
                all_dates.append(date_str)
                
                if group_by == "day":
                    current += timedelta(days=1)
                elif group_by == "week":
                    current += timedelta(weeks=1)
                else:
                    # Move to next month
                    year = current.year
                    month = current.month + 1
                    if month > 12:
                        month = 1
                        year += 1
                    current = datetime(year, month, 1)
            
            # Merge with actual data
            revenue_dict = {item["_id"]: item for item in revenue_data}
            revenue_data = []
            for date_str in all_dates:
                if date_str in revenue_dict:
                    revenue_data.append(revenue_dict[date_str])
                else:
                    revenue_data.append({
                        "_id": date_str,
                        "total_revenue": 0,
                        "payment_count": 0,
                        "completed_revenue": 0,
                        "completed_count": 0,
                        "avg_amount": 0
                    })
        
        # Payout analytics
        payout_pipeline = []
        if date_match:
            payout_pipeline.append({"$match": {"created_at": date_match}})
        
        payout_pipeline.extend([
            {
                "$group": {
                    "_id": None,
                    "total_payouts": {"$sum": "$total_amount"},
                    "payout_count": {"$sum": 1},
                    "paid_payouts": {
                        "$sum": {"$cond": [
                            {"$in": ["$status", ["paid", "processed", "completed"]]}, 
                            "$total_amount", 
                            0
                        ]}
                    },
                    "avg_payout": {"$avg": "$total_amount"}
                }
            }
        ])
        
        payout_data = list(payouts_collection.aggregate(payout_pipeline))
        
        # Platform fee calculation (10% of completed revenue)
        platform_fee = sum([item.get("completed_revenue", 0) * 0.10 for item in revenue_data])
        
        return {
            "success": True,
            "timeframe": timeframe,
            "group_by": group_by,
            "revenue_analytics": revenue_data[-30:],  # Last 30 data points
            "payout_analytics": payout_data[0] if payout_data else {
                "total_payouts": 0,
                "payout_count": 0,
                "paid_payouts": 0,
                "avg_payout": 0
            },
            "platform_fee": round(platform_fee, 2),
            "net_profit": round(platform_fee - (payout_data[0].get("total_payouts", 0) if payout_data else 0), 2)
        }
        
    except Exception as e:
        logger.error(f"Failed to get revenue analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get revenue analytics")

@router.get("/analytics/top-influencers")
async def get_top_influencers(
    limit: int = Query(10, ge=1, le=50),
    timeframe: str = Query("30d", description="Timeframe: 7d, 30d, 90d, 1y, all"),
    current_user: dict = Depends(admin_only)
):
    """Get top influencers by earnings"""
    try:
        # Calculate date range
        now = datetime.utcnow()
        timeframe_map = {
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
            "90d": timedelta(days=90),
            "1y": timedelta(days=365),
            "all": None
        }
        
        date_match = {}
        delta = timeframe_map.get(timeframe)
        if delta:
            date_match = {
                "$gte": now - delta
            }
        
        # Pipeline for top influencers
        pipeline = []
        
        if date_match:
            pipeline.append({"$match": {
                "created_at": date_match,
                "status": {"$in": ["completed", "approved", "processing"]}
            }})
        else:
            pipeline.append({"$match": {
                "status": {"$in": ["completed", "approved", "processing"]}
            }})
        
        pipeline.extend([
            {
                "$group": {
                    "_id": "$influencer_id",
                    "total_earnings": {"$sum": "$amount"},
                    "payment_count": {"$sum": 1},
                    "avg_payment": {"$avg": "$amount"},
                    "last_payment": {"$max": "$created_at"}
                }
            },
            {"$sort": {"total_earnings": -1}},
            {"$limit": limit}
        ])
        
        result = list(admin_payments_collection.aggregate(pipeline))
        
        # Add influencer details
        top_influencers = []
        for item in result:
            influencer_id = item["_id"]
            if not influencer_id:
                continue
                
            influencer = users_collection.find_one({"_id": ObjectId(influencer_id)})
            
            top_influencers.append({
                "influencer_id": influencer_id,
                "name": influencer.get("username", "Unknown") if influencer else "Unknown",
                "email": influencer.get("email", "") if influencer else "",
                "total_earnings": round(item.get("total_earnings", 0), 2),
                "payment_count": item.get("payment_count", 0),
                "avg_payment": round(item.get("avg_payment", 0), 2),
                "last_payment": item.get("last_payment")
            })
        
        return {
            "success": True,
            "timeframe": timeframe,
            "limit": limit,
            "top_influencers": top_influencers
        }
        
    except Exception as e:
        logger.error(f"Failed to get top influencers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get top influencers")

@router.get("/analytics/top-brands")
async def get_top_brands(
    limit: int = Query(10, ge=1, le=50),
    timeframe: str = Query("30d", description="Timeframe: 7d, 30d, 90d, 1y, all"),
    current_user: dict = Depends(admin_only)
):
    """Get top brands by spending"""
    try:
        # Calculate date range
        now = datetime.utcnow()
        timeframe_map = {
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
            "90d": timedelta(days=90),
            "1y": timedelta(days=365),
            "all": None
        }
        
        date_match = {}
        delta = timeframe_map.get(timeframe)
        if delta:
            date_match = {
                "$gte": now - delta
            }
        
        # Pipeline for top brands
        pipeline = []
        
        if date_match:
            pipeline.append({"$match": {"created_at": date_match}})
        
        pipeline.extend([
            {
                "$group": {
                    "_id": "$brand_id",
                    "total_spent": {"$sum": "$amount"},
                    "payment_count": {"$sum": 1},
                    "completed_payments": {
                        "$sum": {"$cond": [
                            {"$in": ["$status", ["completed", "approved", "processing"]]}, 
                            1, 
                            0
                        ]}
                    },
                    "avg_payment": {"$avg": "$amount"}
                }
            },
            {"$sort": {"total_spent": -1}},
            {"$limit": limit}
        ])
        
        result = list(admin_payments_collection.aggregate(pipeline))
        
        # Add brand details
        top_brands = []
        for item in result:
            brand_id = item["_id"]
            if not brand_id:
                continue
                
            brand = users_collection.find_one({"_id": ObjectId(brand_id)})
            
            top_brands.append({
                "brand_id": brand_id,
                "name": brand.get("username", "Unknown") if brand else "Unknown",
                "email": brand.get("email", "") if brand else "",
                "total_spent": round(item.get("total_spent", 0), 2),
                "payment_count": item.get("payment_count", 0),
                "completed_payments": item.get("completed_payments", 0),
                "avg_payment": round(item.get("avg_payment", 0), 2)
            })
        
        return {
            "success": True,
            "timeframe": timeframe,
            "limit": limit,
            "top_brands": top_brands
        }
        
    except Exception as e:
        logger.error(f"Failed to get top brands: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get top brands")

@router.get("/analytics/payment-methods")
async def get_payment_methods_analytics(
    timeframe: str = Query("30d", description="Timeframe: 7d, 30d, 90d, 1y, all"),
    current_user: dict = Depends(admin_only)
):
    """Get payment methods analytics"""
    try:
        # Calculate date range
        now = datetime.utcnow()
        timeframe_map = {
            "7d": timedelta(days=7),
            "30d": timedelta(days=30),
            "90d": timedelta(days=90),
            "1y": timedelta(days=365),
            "all": None
        }
        
        date_match = {}
        delta = timeframe_map.get(timeframe)
        if delta:
            date_match = {
                "$gte": now - delta
            }
        
        pipeline = []
        
        if date_match:
            pipeline.append({"$match": {"created_at": date_match}})
        
        pipeline.extend([
            {
                "$group": {
                    "_id": "$payment_method",
                    "total_amount": {"$sum": "$amount"},
                    "payment_count": {"$sum": 1},
                    "successful_payments": {
                        "$sum": {"$cond": [
                            {"$in": ["$status", ["completed", "approved", "processing"]]}, 
                            1, 
                            0
                        ]}
                    },
                    "failed_payments": {
                        "$sum": {"$cond": [
                            {"$eq": ["$status", "failed"]}, 
                            1, 
                            0
                        ]}
                    },
                    "avg_amount": {"$avg": "$amount"}
                }
            },
            {"$sort": {"total_amount": -1}}
        ])
        
        result = list(admin_payments_collection.aggregate(pipeline))
        
        # Format response
        payment_methods_data = []
        for item in result:
            payment_methods_data.append({
                "name": item["_id"].title().replace("_", " ") if item["_id"] else "Unknown",
                "value": round(item.get("total_amount", 0), 2),
                "payment_count": item.get("payment_count", 0),
                "success_rate": round(
                    (item.get("successful_payments", 0) / item.get("payment_count", 1) * 100), 
                    2
                ) if item.get("payment_count", 0) > 0 else 0
            })
        
        return {
            "success": True,
            "timeframe": timeframe,
            "payment_methods": payment_methods_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get payment methods analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get payment methods analytics")