# backend/routes/autopay.py
import os
import logging
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Dict, Any, List
from bson import ObjectId
from bson.errors import InvalidId

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from pydantic import BaseModel, Field, validator

from database import db
from auth.utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/autopay", tags=["Autopay"])

# Collections
users_collection = db["users"]
campaigns_collection = db["campaigns"]
payments_collection = db["payments"]
earnings_collection = db["earnings"]
autopay_collection = db["autopay_settings"]
bank_details_collection = db["bank_details"]

# -------------------- MODELS --------------------
class AutopayFrequency(str, Enum):
    IMMEDIATE = "immediate"
    WEEKLY = "weekly"
    BI_WEEKLY = "bi_weekly"
    MONTHLY = "monthly"
    AFTER_CAMPAIGN = "after_campaign"

class AutopayStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class AutopayCreate(BaseModel):
    campaign_id: str
    influencer_id: str
    amount: float = Field(..., gt=0)
    frequency: AutopayFrequency
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_payments: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = None

    @validator('end_date')
    def validate_dates(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v <= values['start_date']:
                raise ValueError('End date must be after start date')
        return v

class AutopayUpdate(BaseModel):
    status: Optional[AutopayStatus] = None
    frequency: Optional[AutopayFrequency] = None
    amount: Optional[float] = Field(None, gt=0)
    end_date: Optional[datetime] = None
    max_payments: Optional[int] = Field(None, ge=1)

class DirectPaymentRequest(BaseModel):
    campaign_id: str
    influencer_id: str
    amount: float = Field(..., gt=0)
    notes: Optional[str] = None
    immediate_payout: bool = True

class AutopayResponse(BaseModel):
    id: str
    brand_id: str
    influencer_id: str
    campaign_id: str
    amount: float
    frequency: AutopayFrequency
    status: AutopayStatus
    next_payment_date: datetime
    payments_made: int
    total_paid: float
    created_at: datetime
    updated_at: datetime

# -------------------- SERVICES --------------------
class RazorpayDirectPayoutService:
    def __init__(self):
        import razorpay
        self.client = razorpay.Client(auth=(
            os.getenv("RAZORPAY_KEY_ID", ""),
            os.getenv("RAZORPAY_KEY_SECRET", "")
        ))

    def create_direct_payout(self, account_number: str, ifsc: str, amount: float, 
                           name: str, notes: dict = None) -> Dict[str, Any]:
        """Create direct payout to influencer bank account"""
        try:
            # First, create a fund account if not exists
            fund_account_data = {
                "account_type": "bank_account",
                "bank_account": {
                    "name": name,
                    "ifsc": ifsc,
                    "account_number": account_number
                }
            }
            
            # Create fund account
            fund_account = self.client.fund_account.create({
                "contact_id": self._get_or_create_contact(name, notes),
                **fund_account_data
            })

            # Create payout
            payout_data = {
                "account_number": os.getenv("RAZORPAY_SETTLEMENT_ACCOUNT"),  # Your settlement account
                "fund_account_id": fund_account["id"],
                "amount": int(amount * 100),
                "currency": "INR",
                "mode": "IMPS",
                "purpose": "payout",
                "queue_if_low_balance": True,
                "notes": notes or {}
            }

            payout = self.client.payout.create(payout_data)
            
            return {
                "success": True,
                "payout_id": payout["id"],
                "fund_account_id": fund_account["id"],
                "status": payout["status"],
                "amount": amount
            }

        except Exception as e:
            logger.error(f"Direct payout failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def _get_or_create_contact(self, name: str, notes: dict) -> str:
        """Get or create contact in Razorpay"""
        try:
            # In a real implementation, you'd check if contact exists first
            contact = self.client.contact.create({
                "name": name,
                "email": notes.get("email", f"{name.replace(' ', '.').lower()}@autopay.com"),
                "type": "vendor",
                "reference_id": notes.get("influencer_id", "direct_payout")
            })
            return contact["id"]
        except Exception as e:
            logger.error(f"Contact creation failed: {str(e)}")
            # Fallback - you might want to handle this differently
            return "cont_fallback_123"

class AutopayService:
    def __init__(self):
        self.payout_service = RazorpayDirectPayoutService()
        self.background_tasks = BackgroundTasks()

    async def create_autopay(self, autopay_data: AutopayCreate, brand_id: str) -> Dict[str, Any]:
        """Create new autopay schedule"""
        try:
            # Validate campaign and influencer
            campaign = campaigns_collection.find_one({"_id": ObjectId(autopay_data.campaign_id)})
            if not campaign:
                raise HTTPException(status_code=404, detail="Campaign not found")

            influencer = users_collection.find_one({"_id": ObjectId(autopay_data.influencer_id)})
            if not influencer:
                raise HTTPException(status_code=404, detail="Influencer not found")

            # Check if influencer has bank account
            bank_account = bank_details_collection.find_one({
                "user_id": autopay_data.influencer_id,
                "is_primary": True
            })
            if not bank_account:
                raise HTTPException(status_code=400, detail="Influencer has no primary bank account")

            # Calculate next payment date
            next_payment_date = self._calculate_next_payment_date(
                autopay_data.frequency, 
                autopay_data.start_date
            )

            autopay_doc = {
                "brand_id": brand_id,
                "influencer_id": autopay_data.influencer_id,
                "campaign_id": autopay_data.campaign_id,
                "amount": autopay_data.amount,
                "frequency": autopay_data.frequency,
                "status": AutopayStatus.ACTIVE,
                "next_payment_date": next_payment_date,
                "payments_made": 0,
                "total_paid": 0.0,
                "max_payments": autopay_data.max_payments,
                "start_date": autopay_data.start_date or datetime.utcnow(),
                "end_date": autopay_data.end_date,
                "influencer_bank_account": {
                    "account_number": bank_account["account_number"],
                    "ifsc": bank_account["ifsc_code"],
                    "account_holder_name": bank_account["account_holder_name"],
                    "bank_name": bank_account["bank_name"]
                },
                "notes": autopay_data.notes,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = autopay_collection.insert_one(autopay_doc)
            autopay_id = str(result.inserted_id)

            # Process immediate payment if frequency is immediate
            if autopay_data.frequency == AutopayFrequency.IMMEDIATE:
                await self._process_single_payment(autopay_id)

            return {
                "success": True,
                "autopay_id": autopay_id,
                "message": "Autopay schedule created successfully",
                "next_payment_date": next_payment_date
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Autopay creation failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create autopay schedule")

    async def process_direct_payment(self, payment_data: DirectPaymentRequest, brand_id: str) -> Dict[str, Any]:
        """Process single direct payment to influencer"""
        try:
            # Validate campaign and influencer
            campaign = campaigns_collection.find_one({"_id": ObjectId(payment_data.campaign_id)})
            if not campaign:
                raise HTTPException(status_code=404, detail="Campaign not found")

            influencer = users_collection.find_one({"_id": ObjectId(payment_data.influencer_id)})
            if not influencer:
                raise HTTPException(status_code=404, detail="Influencer not found")

            # Get influencer's bank account
            bank_account = bank_details_collection.find_one({
                "user_id": payment_data.influencer_id,
                "is_primary": True
            })
            if not bank_account:
                raise HTTPException(status_code=400, detail="Influencer has no primary bank account")

            # Process payout
            payout_notes = {
                "campaign_id": payment_data.campaign_id,
                "brand_id": brand_id,
                "influencer_id": payment_data.influencer_id,
                "type": "direct_payment",
                "notes": payment_data.notes
            }

            payout_result = self.payout_service.create_direct_payout(
                account_number=bank_account["account_number"],
                ifsc=bank_account["ifsc_code"],
                amount=payment_data.amount,
                name=bank_account["account_holder_name"],
                notes=payout_notes
            )

            if not payout_result["success"]:
                raise HTTPException(status_code=400, detail=f"Payout failed: {payout_result['error']}")

            # Record payment
            payment_record = {
                "brand_id": brand_id,
                "influencer_id": payment_data.influencer_id,
                "campaign_id": payment_data.campaign_id,
                "amount": payment_data.amount,
                "type": "direct",
                "payout_id": payout_result["payout_id"],
                "status": "completed",
                "bank_account": {
                    "account_number": bank_account["account_number"],
                    "ifsc": bank_account["ifsc_code"],
                    "account_holder_name": bank_account["account_holder_name"]
                },
                "notes": payment_data.notes,
                "processed_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }

            payment_id = payments_collection.insert_one(payment_record).inserted_id

            # Create earning record for influencer
            earning_record = {
                "influencer_id": payment_data.influencer_id,
                "campaign_id": payment_data.campaign_id,
                "amount": payment_data.amount,
                "type": "direct_payment",
                "status": "paid",
                "payment_id": str(payment_id),
                "payout_id": payout_result["payout_id"],
                "paid_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }

            earnings_collection.insert_one(earning_record)

            return {
                "success": True,
                "payment_id": str(payment_id),
                "payout_id": payout_result["payout_id"],
                "amount": payment_data.amount,
                "message": "Direct payment processed successfully"
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Direct payment failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process direct payment")

    async def process_scheduled_payments(self):
        """Process all due autopay payments (called by scheduler)"""
        try:
            now = datetime.utcnow()
            due_payments = autopay_collection.find({
                "status": AutopayStatus.ACTIVE,
                "next_payment_date": {"$lte": now},
                "$or": [
                    {"max_payments": {"$exists": False}},
                    {"max_payments": {"$gt": "$payments_made"}}
                ]
            })

            processed = 0
            for autopay in due_payments:
                try:
                    await self._process_single_payment(str(autopay["_id"]))
                    processed += 1
                except Exception as e:
                    logger.error(f"Failed to process autopay {autopay['_id']}: {str(e)}")
                    continue

            logger.info(f"Processed {processed} scheduled payments")
            return {"processed": processed}

        except Exception as e:
            logger.error(f"Scheduled payments processing failed: {str(e)}")
            return {"processed": 0, "error": str(e)}

    async def _process_single_payment(self, autopay_id: str):
        """Process a single autopay payment"""
        autopay = autopay_collection.find_one({"_id": ObjectId(autopay_id)})
        if not autopay:
            return

        payout_result = self.payout_service.create_direct_payout(
            account_number=autopay["influencer_bank_account"]["account_number"],
            ifsc=autopay["influencer_bank_account"]["ifsc"],
            amount=autopay["amount"],
            name=autopay["influencer_bank_account"]["account_holder_name"],
            notes={
                "autopay_id": autopay_id,
                "campaign_id": autopay["campaign_id"],
                "brand_id": autopay["brand_id"],
                "influencer_id": autopay["influencer_id"],
                "payment_number": autopay["payments_made"] + 1
            }
        )

        if payout_result["success"]:
            # Update autopay record
            new_payment_count = autopay["payments_made"] + 1
            new_total_paid = autopay["total_paid"] + autopay["amount"]
            
            update_data = {
                "payments_made": new_payment_count,
                "total_paid": new_total_paid,
                "next_payment_date": self._calculate_next_payment_date(
                    autopay["frequency"],
                    datetime.utcnow()
                ),
                "updated_at": datetime.utcnow()
            }

            # Check if autopay should be completed
            if (autopay.get("max_payments") and new_payment_count >= autopay["max_payments"]) or \
               (autopay.get("end_date") and datetime.utcnow() >= autopay["end_date"]):
                update_data["status"] = AutopayStatus.COMPLETED

            autopay_collection.update_one(
                {"_id": ObjectId(autopay_id)},
                {"$set": update_data}
            )

            # Record payment
            payment_record = {
                "brand_id": autopay["brand_id"],
                "influencer_id": autopay["influencer_id"],
                "campaign_id": autopay["campaign_id"],
                "amount": autopay["amount"],
                "type": "autopay",
                "autopay_id": autopay_id,
                "payout_id": payout_result["payout_id"],
                "status": "completed",
                "bank_account": autopay["influencer_bank_account"],
                "payment_number": new_payment_count,
                "processed_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }

            payment_id = payments_collection.insert_one(payment_record).inserted_id

            # Create earning record
            earning_record = {
                "influencer_id": autopay["influencer_id"],
                "campaign_id": autopay["campaign_id"],
                "amount": autopay["amount"],
                "type": "autopay",
                "status": "paid",
                "payment_id": str(payment_id),
                "payout_id": payout_result["payout_id"],
                "autopay_id": autopay_id,
                "paid_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }

            earnings_collection.insert_one(earning_record)

    def _calculate_next_payment_date(self, frequency: AutopayFrequency, from_date: datetime = None) -> datetime:
        """Calculate next payment date based on frequency"""
        from_date = from_date or datetime.utcnow()
        
        if frequency == AutopayFrequency.IMMEDIATE:
            return from_date
        elif frequency == AutopayFrequency.WEEKLY:
            return from_date + timedelta(days=7)
        elif frequency == AutopayFrequency.BI_WEEKLY:
            return from_date + timedelta(days=14)
        elif frequency == AutopayFrequency.MONTHLY:
            return from_date + timedelta(days=30)
        elif frequency == AutopayFrequency.AFTER_CAMPAIGN:
            # This would be set when campaign completes
            return from_date + timedelta(days=1)
        else:
            return from_date

# -------------------- ROUTES --------------------
autopay_service = AutopayService()

@router.post("/setup", response_model=Dict[str, Any])
async def setup_autopay(
    autopay_data: AutopayCreate,
    current_user: dict = Depends(get_current_user)
):
    """Setup autopay schedule for brand to influencer"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can setup autopay")

    result = await autopay_service.create_autopay(autopay_data, str(current_user["_id"]))
    return result

@router.post("/direct-payment", response_model=Dict[str, Any])
async def make_direct_payment(
    payment_data: DirectPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Make direct one-time payment to influencer"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can make direct payments")

    result = await autopay_service.process_direct_payment(payment_data, str(current_user["_id"]))
    return result

@router.get("/my-autopays", response_model=List[Dict[str, Any]])
async def get_my_autopays(
    status: Optional[AutopayStatus] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all autopay schedules for current brand"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can view autopays")

    query = {"brand_id": str(current_user["_id"])}
    if status:
        query["status"] = status

    autopays = list(autopay_collection.find(query).sort("created_at", -1))
    
    for autopay in autopays:
        autopay["_id"] = str(autopay["_id"])
        # Add influencer details
        influencer = users_collection.find_one(
            {"_id": ObjectId(autopay["influencer_id"])},
            {"username": 1, "email": 1}
        )
        autopay["influencer_name"] = influencer.get("username") if influencer else "Unknown"
        
        # Add campaign details
        campaign = campaigns_collection.find_one(
            {"_id": ObjectId(autopay["campaign_id"])},
            {"title": 1}
        )
        autopay["campaign_title"] = campaign.get("title") if campaign else "Unknown"

    return autopays

@router.put("/{autopay_id}", response_model=Dict[str, Any])
async def update_autopay(
    autopay_id: str,
    update_data: AutopayUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update autopay schedule"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can update autopays")

    try:
        # Verify ownership
        autopay = autopay_collection.find_one({
            "_id": ObjectId(autopay_id),
            "brand_id": str(current_user["_id"])
        })
        if not autopay:
            raise HTTPException(status_code=404, detail="Autopay not found")

        update_fields = {}
        if update_data.status:
            update_fields["status"] = update_data.status
        if update_data.frequency:
            update_fields["frequency"] = update_data.frequency
            # Recalculate next payment date if frequency changes
            update_fields["next_payment_date"] = autopay_service._calculate_next_payment_date(
                update_data.frequency
            )
        if update_data.amount:
            update_fields["amount"] = update_data.amount
        if update_data.end_date:
            update_fields["end_date"] = update_data.end_date
        if update_data.max_payments:
            update_fields["max_payments"] = update_data.max_payments

        update_fields["updated_at"] = datetime.utcnow()

        result = autopay_collection.update_one(
            {"_id": ObjectId(autopay_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")

        return {"success": True, "message": "Autopay updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Autopay update failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update autopay")

@router.delete("/{autopay_id}", response_model=Dict[str, Any])
async def cancel_autopay(
    autopay_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel autopay schedule"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can cancel autopays")

    try:
        result = autopay_collection.update_one(
            {
                "_id": ObjectId(autopay_id),
                "brand_id": str(current_user["_id"])
            },
            {
                "$set": {
                    "status": AutopayStatus.CANCELLED,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Autopay not found")

        return {"success": True, "message": "Autopay cancelled successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Autopay cancellation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel autopay")

@router.get("/payment-history", response_model=List[Dict[str, Any]])
async def get_payment_history(
    current_user: dict = Depends(get_current_user)
):
    """Get direct payment history for brand"""
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can view payment history")

    payments = list(payments_collection.find({
        "brand_id": str(current_user["_id"])
    }).sort("created_at", -1))

    for payment in payments:
        payment["_id"] = str(payment["_id"])
        # Add influencer details
        influencer = users_collection.find_one(
            {"_id": ObjectId(payment["influencer_id"])},
            {"username": 1, "email": 1}
        )
        payment["influencer_name"] = influencer.get("username") if influencer else "Unknown"

    return payments

# Admin endpoints
@router.post("/admin/process-payments", response_model=Dict[str, Any])
async def admin_process_payments(current_user: dict = Depends(get_current_user)):
    """Admin: Manually trigger payment processing"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can process payments")

    result = await autopay_service.process_scheduled_payments()
    return result

@router.get("/admin/all-autopays", response_model=List[Dict[str, Any]])
async def get_all_autopays(current_user: dict = Depends(get_current_user)):
    """Admin: Get all autopay schedules"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can view all autopays")

    autopays = list(autopay_collection.find().sort("created_at", -1))
    
    for autopay in autopays:
        autopay["_id"] = str(autopay["_id"])
        # Add brand and influencer details
        brand = users_collection.find_one(
            {"_id": ObjectId(autopay["brand_id"])},
            {"username": 1, "email": 1}
        )
        autopay["brand_name"] = brand.get("username") if brand else "Unknown"
        
        influencer = users_collection.find_one(
            {"_id": ObjectId(autopay["influencer_id"])},
            {"username": 1, "email": 1}
        )
        autopay["influencer_name"] = influencer.get("username") if influencer else "Unknown"

    return autopays