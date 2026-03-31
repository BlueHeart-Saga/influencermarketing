from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import json
import logging
from database import earnings_collection, payments_collection, campaigns_collection, users_collection, withdrawals_collection
from auth.utils import get_current_user
from bson import ObjectId
from bson.errors import InvalidId
import uuid
from routes.influencernotification import influencer_notification_service
from routes.brandnotification import brand_notification_service

router = APIRouter()
logger = logging.getLogger(__name__)

# -------------------- ENUMS --------------------
class EarningStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

class WithdrawalStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    WISE = "wise"
    CRYPTO = "crypto"
    OTHER = "other"

class TimePeriod(str, Enum):
    TODAY = "today"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"
    ALL_TIME = "all_time"
    CUSTOM = "custom"

# -------------------- SCHEMAS --------------------
class EarningBase(BaseModel):
    influencer_id: str
    campaign_id: str
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    payment_method: Optional[PaymentMethod] = PaymentMethod.BANK_TRANSFER
    description: Optional[str] = None

class EarningCreate(EarningBase):
    brand_id: str
    transaction_id: Optional[str] = None
    invoice_number: Optional[str] = None

class EarningUpdate(BaseModel):
    status: Optional[EarningStatus] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class EarningResponse(BaseModel):
    id: Optional[str] = None
    influencer_id: str
    influencer_name: str
    campaign_id: str
    campaign_title: str
    brand_id: str
    brand_name: str
    amount: float
    currency: Optional[str] = "USD"
    status: Optional[EarningStatus] = EarningStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    transaction_id: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    earned_at: datetime
    processed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

    model_config = {
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class WithdrawalBase(BaseModel):
    influencer_id: str
    amount: float = Field(..., gt=0)
    payment_method: PaymentMethod
    account_details: Dict[str, Any]
    currency: str = "USD"
    notes: Optional[str] = None

class WithdrawalCreate(WithdrawalBase):
    pass

class WithdrawalUpdate(BaseModel):
    status: Optional[WithdrawalStatus] = None
    transaction_id: Optional[str] = None
    processing_fee: Optional[float] = None
    net_amount: Optional[float] = None
    admin_notes: Optional[str] = None

class WithdrawalResponse(BaseModel):
    id: str
    influencer_id: str
    influencer_name: str
    amount: float
    net_amount: float
    currency: str
    status: WithdrawalStatus
    payment_method: PaymentMethod
    account_details: Dict[str, Any]
    processing_fee: Optional[float] = None
    transaction_id: Optional[str] = None
    requested_at: datetime
    processed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    admin_notes: Optional[str] = None

    model_config = {
        "json_encoders": {ObjectId: str},
        "from_attributes": True
    }

class EarningsSummary(BaseModel):
    total_earnings: float
    available_balance: float
    pending_earnings: float
    processing_withdrawals: float
    completed_withdrawals: float
    currency: str
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None

class AnalyticsRequest(BaseModel):
    period: TimePeriod = TimePeriod.MONTH
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    group_by: Optional[str] = "day"  # day, week, month, campaign, brand

class AnalyticsResponse(BaseModel):
    summary: Dict[str, Any]
    trends: List[Dict[str, Any]]
    top_campaigns: List[Dict[str, Any]]
    top_brands: List[Dict[str, Any]]
    earnings_over_time: List[Dict[str, Any]]

class PaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    campaign_id: str
    influencer_id: str
    payment_method: PaymentMethod = PaymentMethod.BANK_TRANSFER
    currency: str = "USD"
    notes: Optional[str] = None
    invoice_number: Optional[str] = None

# -------------------- HELPER FUNCTIONS --------------------
def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ID format")

def get_user_by_id(user_id: str) -> dict:
    """Get user by ID"""
    user = users_collection.find_one({"_id": validate_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

def get_campaign_by_id(campaign_id: str) -> dict:
    """Get campaign by ID"""
    campaign = campaigns_collection.find_one({"_id": validate_object_id(campaign_id)})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign["_id"] = str(campaign["_id"])
    return campaign

def check_user_permission(current_user: dict, required_roles: List[str] = None, 
                         influencer_id: str = None) -> bool:
    """Check if user has permission to perform an action"""
    if required_roles and current_user["role"] not in required_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    if influencer_id and current_user["role"] == "influencer" and str(current_user["_id"]) != influencer_id:
        raise HTTPException(status_code=403, detail="Not authorized for this influencer")
    
    return True

# -------------------- EARNING OPERATIONS --------------------
def create_earning(earning_data: dict) -> str:
    """Create a new earning record"""
    earning_data["earning_id"] = str(uuid.uuid4())
    earning_data["earned_at"] = datetime.utcnow()
    earning_data["status"] = EarningStatus.PENDING
    
    result = earnings_collection.insert_one(earning_data)
    return str(result.inserted_id)

def get_earning_by_id(earning_id: str) -> dict:
    """Get earning by ID"""
    earning = earnings_collection.find_one({"_id": validate_object_id(earning_id)})
    if not earning:
        raise HTTPException(status_code=404, detail="Earning not found")
    earning["_id"] = str(earning["_id"])
    return earning

def get_earnings_by_influencer(influencer_id: str, 
                               status: Optional[str] = None,
                               start_date: Optional[datetime] = None,
                               end_date: Optional[datetime] = None,
                               limit: int = 100) -> List[dict]:
    """Get earnings for a specific influencer"""
    query = {"influencer_id": influencer_id}
    
    if status:
        query["status"] = status
    
    if start_date:
        query["earned_at"] = {"$gte": start_date}
    
    if end_date:
        if "earned_at" in query:
            query["earned_at"]["$lte"] = end_date
        else:
            query["earned_at"] = {"$lte": end_date}
    
    earnings = list(earnings_collection.find(query)
                    .sort("earned_at", -1)
                    .limit(limit))
    
    for earning in earnings:
        earning["id"] = str(earning.pop("_id"))

        # Normalize status
        if earning.get("status") == "paid":
            earning["status"] = EarningStatus.COMPLETED

        # Ensure currency exists
        if "currency" not in earning:
            earning["currency"] = "USD"

        
        # Add campaign info
        try:
            campaign = get_campaign_by_id(earning["campaign_id"])
            earning["campaign_title"] = campaign.get("title", "Unknown Campaign")
            earning["brand_id"] = campaign.get("brand_id")
            
            # Add brand info
            brand = get_user_by_id(campaign["brand_id"])
            earning["brand_name"] = brand.get("username", "Unknown Brand")
        except:
            earning["campaign_title"] = "Unknown Campaign"
            earning["brand_name"] = "Unknown Brand"
        
        # Add influencer info
        influencer = get_user_by_id(earning["influencer_id"])
        earning["influencer_name"] = influencer.get("username", "Unknown Influencer")
    
    return earnings

def update_earning_status(earning_id: str, status: EarningStatus, 
                         transaction_id: Optional[str] = None,
                         notes: Optional[str] = None) -> bool:
    """Update earning status"""
    update_data = {"status": status}
    
    if status == EarningStatus.PROCESSING:
        update_data["processed_at"] = datetime.utcnow()
    elif status == EarningStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
    
    if transaction_id:
        update_data["transaction_id"] = transaction_id
    
    if notes:
        update_data["notes"] = notes
    
    result = earnings_collection.update_one(
        {"_id": validate_object_id(earning_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

def get_influencer_earnings_summary(influencer_id: str, 
                                   start_date: Optional[datetime] = None,
                                   end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """Get earnings summary for influencer"""
    
    # Calculate total earnings
    total_query = {"influencer_id": influencer_id, "status": EarningStatus.COMPLETED}
    if start_date:
        total_query["earned_at"] = {"$gte": start_date}
    if end_date:
        if "earned_at" in total_query:
            total_query["earned_at"]["$lte"] = end_date
        else:
            total_query["earned_at"] = {"$lte": end_date}
    
    total_earnings_result = earnings_collection.aggregate([
        {"$match": total_query},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ])
    
    total_doc = next(total_earnings_result, None)
    total_earnings = float(total_doc["total"]) if total_doc else 0.0
    
    # Calculate pending earnings
    pending_query = {"influencer_id": influencer_id, "status": EarningStatus.PENDING}
    pending_result = earnings_collection.aggregate([
        {"$match": pending_query},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ])
    
    pending_earnings = 0
    for result in pending_result:
        pending_earnings = result["total"]
    
    # Calculate available balance (total - pending withdrawals)
    withdrawal_query = {"influencer_id": influencer_id, 
                       "status": {"$in": [WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]}}
    withdrawals_result = withdrawals_collection.aggregate([
        {"$match": withdrawal_query},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ])
    
    processing_withdrawals = 0
    for result in withdrawals_result:
        processing_withdrawals = result["total"]
    
    available_balance = total_earnings - processing_withdrawals
    
    # Get completed withdrawals
    completed_withdrawals_query = {"influencer_id": influencer_id, 
                                  "status": WithdrawalStatus.COMPLETED}
    completed_result = withdrawals_collection.aggregate([
        {"$match": completed_withdrawals_query},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ])
    
    completed_withdrawals = 0
    for result in completed_result:
        completed_withdrawals = result["total"]
    
    return {
        "total_earnings": float(round(total_earnings, 2)),
        "available_balance": float(round(available_balance, 2)),
        "pending_earnings": float(round(pending_earnings, 2)),
        "processing_withdrawals": float(round(processing_withdrawals, 2)),
        "completed_withdrawals": float(round(completed_withdrawals, 2)),
        "currency": "USD",
        "period_start": start_date,
        "period_end": end_date
    }

# -------------------- WITHDRAWAL OPERATIONS --------------------
def create_withdrawal(withdrawal_data: dict) -> str:
    """Create a new withdrawal request"""
    withdrawal_data["withdrawal_id"] = str(uuid.uuid4())
    withdrawal_data["requested_at"] = datetime.utcnow()
    withdrawal_data["status"] = WithdrawalStatus.PENDING
    withdrawal_data["net_amount"] = withdrawal_data["amount"]  # Initially same, fees applied later
    
    result = withdrawals_collection.insert_one(withdrawal_data)
    return str(result.inserted_id)

def get_withdrawal_by_id(withdrawal_id: str) -> dict:
    """Get withdrawal by ID"""
    withdrawal = withdrawals_collection.find_one({"_id": validate_object_id(withdrawal_id)})
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    withdrawal["_id"] = str(withdrawal["_id"])
    return withdrawal

def get_withdrawals_by_influencer(influencer_id: str, 
                                 status: Optional[str] = None,
                                 start_date: Optional[datetime] = None,
                                 end_date: Optional[datetime] = None,
                                 limit: int = 50) -> List[dict]:
    """Get withdrawals for a specific influencer"""
    query = {"influencer_id": influencer_id}
    
    if status:
        query["status"] = status
    
    if start_date:
        query["requested_at"] = {"$gte": start_date}
    
    if end_date:
        if "requested_at" in query:
            query["requested_at"]["$lte"] = end_date
        else:
            query["requested_at"] = {"$lte": end_date}
    
    withdrawals = list(withdrawals_collection.find(query)
                      .sort("requested_at", -1)
                      .limit(limit))
    
    for withdrawal in withdrawals:
        withdrawal["_id"] = str(withdrawal["_id"])
        
        # Add influencer info
        influencer = get_user_by_id(withdrawal["influencer_id"])
        withdrawal["influencer_name"] = influencer.get("username", "Unknown Influencer")
    
    return withdrawals

def update_withdrawal_status(withdrawal_id: str, status: WithdrawalStatus,
                            transaction_id: Optional[str] = None,
                            admin_notes: Optional[str] = None,
                            processing_fee: Optional[float] = None) -> bool:
    """Update withdrawal status"""
    withdrawal = get_withdrawal_by_id(withdrawal_id)
    update_data = {"status": status}
    
    if status == WithdrawalStatus.PROCESSING:
        update_data["processed_at"] = datetime.utcnow()
    elif status == WithdrawalStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
    
    if transaction_id:
        update_data["transaction_id"] = transaction_id
    
    if admin_notes:
        update_data["admin_notes"] = admin_notes
    
    if processing_fee is not None:
        update_data["processing_fee"] = processing_fee
        update_data["net_amount"] = withdrawal["amount"] - processing_fee
    
    result = withdrawals_collection.update_one(
        {"_id": validate_object_id(withdrawal_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

def calculate_withdrawal_fee(amount: float, payment_method: PaymentMethod) -> float:
    """Calculate withdrawal fee based on amount and payment method"""
    if payment_method == PaymentMethod.BANK_TRANSFER:
        fee = max(2.0, amount * 0.02)  # 2% or $2 minimum
    elif payment_method == PaymentMethod.PAYPAL:
        fee = max(1.5, amount * 0.035)  # 3.5% or $1.50 minimum
    elif payment_method == PaymentMethod.STRIPE:
        fee = max(0.5, amount * 0.025)  # 2.5% or $0.50 minimum
    elif payment_method == PaymentMethod.WISE:
        fee = max(1.0, amount * 0.01)   # 1% or $1 minimum
    elif payment_method == PaymentMethod.CRYPTO:
        fee = max(5.0, amount * 0.005)  # 0.5% or $5 minimum
    else:
        fee = amount * 0.03  # 3% default
    
    return round(fee, 2)

# -------------------- ANALYTICS OPERATIONS --------------------
def get_earnings_analytics(influencer_id: str, 
                          period: TimePeriod = TimePeriod.MONTH,
                          start_date: Optional[datetime] = None,
                          end_date: Optional[datetime] = None,
                          group_by: str = "day") -> Dict[str, Any]:
    """Get earnings analytics for influencer"""
    
    # Calculate date range based on period
    end_date = end_date or datetime.utcnow()
    
    if period == TimePeriod.TODAY:
        start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == TimePeriod.WEEK:
        start_date = end_date - timedelta(days=7)
    elif period == TimePeriod.MONTH:
        start_date = end_date - timedelta(days=30)
    elif period == TimePeriod.QUARTER:
        start_date = end_date - timedelta(days=90)
    elif period == TimePeriod.YEAR:
        start_date = end_date - timedelta(days=365)
    elif period == TimePeriod.ALL_TIME:
        start_date = datetime(2020, 1, 1)  # Platform launch date
    elif period == TimePeriod.CUSTOM and start_date:
        # Use provided start_date
        pass
    else:
        start_date = end_date - timedelta(days=30)  # Default to month
    
    # Get summary
    summary = get_influencer_earnings_summary(influencer_id, start_date, end_date)
    
    # Get earnings over time
    earnings_over_time = []
    
    if group_by == "day":
        pipeline = [
            {
                "$match": {
                    "influencer_id": influencer_id,
                    "status": EarningStatus.COMPLETED,
                    "earned_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$earned_at"},
                        "month": {"$month": "$earned_at"},
                        "day": {"$dayOfMonth": "$earned_at"}
                    },
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
        ]
    
    elif group_by == "week":
        pipeline = [
            {
                "$match": {
                    "influencer_id": influencer_id,
                    "status": EarningStatus.COMPLETED,
                    "earned_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$earned_at"},
                        "week": {"$week": "$earned_at"}
                    },
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.week": 1}}
        ]
    
    elif group_by == "month":
        pipeline = [
            {
                "$match": {
                    "influencer_id": influencer_id,
                    "status": EarningStatus.COMPLETED,
                    "earned_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$earned_at"},
                        "month": {"$month": "$earned_at"}
                    },
                    "total_amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
    
    # Execute pipeline
    earnings_data = list(earnings_collection.aggregate(pipeline))
    
    for data in earnings_data:
        earnings_over_time.append({
            "period": data["_id"],
            "amount": round(data["total_amount"], 2),
            "transaction_count": data["count"]
        })
    
    # Get top campaigns
    campaigns_pipeline = [
        {
            "$match": {
                "influencer_id": influencer_id,
                "status": EarningStatus.COMPLETED,
                "earned_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$campaign_id",
                "total_amount": {"$sum": "$amount"},
                "transaction_count": {"$sum": 1}
            }
        },
        {"$sort": {"total_amount": -1}},
        {"$limit": 10}
    ]
    
    top_campaigns_data = list(earnings_collection.aggregate(campaigns_pipeline))
    top_campaigns = []
    
    for campaign_data in top_campaigns_data:
        try:
            campaign = get_campaign_by_id(campaign_data["_id"])
            brand = get_user_by_id(campaign.get("brand_id", ""))
            
            top_campaigns.append({
                "campaign_id": campaign_data["_id"],
                "campaign_title": campaign.get("title", "Unknown Campaign"),
                "brand_name": brand.get("username", "Unknown Brand"),
                "total_amount": round(campaign_data["total_amount"], 2),
                "transaction_count": campaign_data["transaction_count"]
            })
        except:
            continue
    
    # Get top brands
    brands_pipeline = [
        {
            "$match": {
                "influencer_id": influencer_id,
                "status": EarningStatus.COMPLETED,
                "earned_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$lookup": {
                "from": "campaigns",
                "localField": "campaign_id",
                "foreignField": "_id",
                "as": "campaign"
            }
        },
        {"$unwind": "$campaign"},
        {
            "$group": {
                "_id": "$campaign.brand_id",
                "total_amount": {"$sum": "$amount"},
                "campaign_count": {"$sum": 1},
                "transaction_count": {"$sum": 1}
            }
        },
        {"$sort": {"total_amount": -1}},
        {"$limit": 10}
    ]
    
    top_brands_data = list(earnings_collection.aggregate(brands_pipeline))
    top_brands = []
    
    for brand_data in top_brands_data:
        try:
            brand = get_user_by_id(brand_data["_id"])
            
            top_brands.append({
                "brand_id": brand_data["_id"],
                "brand_name": brand.get("username", "Unknown Brand"),
                "total_amount": round(brand_data["total_amount"], 2),
                "campaign_count": brand_data["campaign_count"],
                "transaction_count": brand_data["transaction_count"]
            })
        except:
            continue
    
    # Calculate trends
    # Get previous period for comparison
    prev_start_date = start_date - (end_date - start_date)
    prev_summary = get_influencer_earnings_summary(influencer_id, prev_start_date, start_date)
    
    current_total = summary["total_earnings"]
    previous_total = prev_summary["total_earnings"]
    
    growth_rate = 0
    if previous_total > 0:
        growth_rate = ((current_total - previous_total) / previous_total) * 100
    
    trends = [
        {"metric": "Total Earnings", "current": current_total, "previous": previous_total, "growth": growth_rate},
        {"metric": "Available Balance", "current": summary["available_balance"], "previous": prev_summary["available_balance"], "growth": 0},
        {"metric": "Average per Campaign", "current": round(current_total / max(1, len(top_campaigns)), 2), "previous": 0, "growth": 0}
    ]
    
    return {
        "summary": summary,
        "trends": trends,
        "top_campaigns": top_campaigns,
        "top_brands": top_brands,
        "earnings_over_time": earnings_over_time,
        "period": {
            "start": start_date,
            "end": end_date,
            "type": period
        }
    }

# -------------------- NOTIFICATION HELPERS --------------------
def send_payment_notification(background_tasks: BackgroundTasks,
                            earning_id: str,
                            status: EarningStatus,
                            old_status: Optional[EarningStatus] = None):
    """Send payment notifications to influencer"""
    earning = get_earning_by_id(earning_id)
    influencer_id = earning["influencer_id"]
    
    if status == EarningStatus.COMPLETED:
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "payment_completed",
            "✅ Payment Completed!",
            f"Your payment of ${earning['amount']:.2f} has been completed.",
            "high",
            f"/influencer/earnings/{earning_id}",
            {
                "earning_id": earning_id,
                "amount": earning["amount"],
                "currency": earning.get("currency", "USD"),
                "campaign_id": earning.get("campaign_id"),
                "transaction_id": earning.get("transaction_id"),
                "completed_at": datetime.utcnow().isoformat()
            }
        )
    
    elif status == EarningStatus.PROCESSING and old_status == EarningStatus.PENDING:
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "payment_processing",
            "⏳ Payment Processing",
            f"Your payment of ${earning['amount']:.2f} is now being processed.",
            "medium",
            f"/influencer/earnings",
            {
                "earning_id": earning_id,
                "amount": earning["amount"],
                "currency": earning.get("currency", "USD"),
                "expected_completion": (datetime.utcnow() + timedelta(days=3)).isoformat()
            }
        )

def send_withdrawal_notification(background_tasks: BackgroundTasks,
                               withdrawal_id: str,
                               status: WithdrawalStatus,
                               old_status: Optional[WithdrawalStatus] = None):
    """Send withdrawal notifications to influencer"""
    withdrawal = get_withdrawal_by_id(withdrawal_id)
    influencer_id = withdrawal["influencer_id"]
    
    if status == WithdrawalStatus.COMPLETED:
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "withdrawal_completed",
            "✅ Withdrawal Completed!",
            f"Your withdrawal of ${withdrawal['amount']:.2f} has been completed.",
            "high",
            f"/influencer/withdrawals/{withdrawal_id}",
            {
                "withdrawal_id": withdrawal_id,
                "amount": withdrawal["amount"],
                "net_amount": withdrawal.get("net_amount", withdrawal["amount"]),
                "currency": withdrawal.get("currency", "USD"),
                "payment_method": withdrawal["payment_method"],
                "transaction_id": withdrawal.get("transaction_id"),
                "completed_at": datetime.utcnow().isoformat()
            }
        )
    
    elif status == WithdrawalStatus.PROCESSING and old_status == WithdrawalStatus.PENDING:
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "withdrawal_processing",
            "⏳ Withdrawal Processing",
            f"Your withdrawal of ${withdrawal['amount']:.2f} is now being processed.",
            "medium",
            f"/influencer/withdrawals",
            {
                "withdrawal_id": withdrawal_id,
                "amount": withdrawal["amount"],
                "payment_method": withdrawal["payment_method"],
                "expected_completion": (datetime.utcnow() + timedelta(days=5)).isoformat()
            }
        )
    
    elif status == WithdrawalStatus.REJECTED:
        background_tasks.add_task(
            influencer_notification_service.create_notification,
            influencer_id,
            "withdrawal_rejected",
            "❌ Withdrawal Rejected",
            f"Your withdrawal of ${withdrawal['amount']:.2f} was rejected. Check the notes for details.",
            "high",
            f"/influencer/withdrawals/{withdrawal_id}",
            {
                "withdrawal_id": withdrawal_id,
                "amount": withdrawal["amount"],
                "admin_notes": withdrawal.get("admin_notes"),
                "rejection_date": datetime.utcnow().isoformat()
            }
        )

# -------------------- EARNING ROUTES --------------------
@router.post("/earnings", response_model=dict)
async def create_earning_endpoint(
    background_tasks: BackgroundTasks,
    earning: EarningCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new earning record (Brand only)"""
    check_user_permission(current_user, ["brand"])
    
    # Verify campaign exists and belongs to brand
    campaign = get_campaign_by_id(earning.campaign_id)
    if campaign["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized for this campaign")
    
    # Verify influencer exists
    influencer = get_user_by_id(earning.influencer_id)
    
    # Create earning record
    earning_dict = earning.model_dump()
    earning_dict["brand_id"] = str(current_user["_id"])
    earning_dict["created_by"] = str(current_user["_id"])
    
    earning_id = create_earning(earning_dict)
    
    # Send notification to influencer
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        earning.influencer_id,
        "payment_initiated",
        "💰 Payment Initiated",
        f"A payment of ${earning.amount:.2f} has been initiated for your work.",
        "medium",
        f"/influencer/earnings",
        {
            "earning_id": earning_id,
            "amount": earning.amount,
            "currency": earning.currency,
            "campaign_id": earning.campaign_id,
            "brand_name": current_user.get("username", "Unknown Brand"),
            "status": "pending"
        }
    )
    
    return {"message": "Earning created successfully", "earning_id": earning_id}

@router.get("/earnings", response_model=List[EarningResponse])
async def get_earnings_endpoint(
    current_user: dict = Depends(get_current_user),
    status: Optional[EarningStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=500)
):
    """Get earnings for the current user"""
    
    if current_user["role"] == "influencer":
        earnings = get_earnings_by_influencer(
            influencer_id=str(current_user["_id"]),
            status=status.value if status else None,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
    elif current_user["role"] == "brand":
        # Brands can see earnings they created
        query = {"brand_id": str(current_user["_id"])}
        
        if status:
            query["status"] = status.value
        
        if start_date:
            query["earned_at"] = {"$gte": start_date}
        
        if end_date:
            if "earned_at" in query:
                query["earned_at"]["$lte"] = end_date
            else:
                query["earned_at"] = {"$lte": end_date}
        
        earnings = list(earnings_collection.find(query)
                       .sort("earned_at", -1)
                       .limit(limit))
        
        for earning in earnings:
            earning["_id"] = str(earning["_id"])
            
            # Add influencer info
            try:
                influencer = get_user_by_id(earning["influencer_id"])
                earning["influencer_name"] = influencer.get("username", "Unknown Influencer")
            except:
                earning["influencer_name"] = "Unknown Influencer"
            
            # Add campaign info
            try:
                campaign = get_campaign_by_id(earning["campaign_id"])
                earning["campaign_title"] = campaign.get("title", "Unknown Campaign")
            except:
                earning["campaign_title"] = "Unknown Campaign"
            
            earning["brand_name"] = current_user.get("username", "Unknown Brand")
    
    elif current_user["role"] == "admin":
        # Admins can see all earnings
        query = {}
        
        if status:
            query["status"] = status.value
        
        if start_date:
            query["earned_at"] = {"$gte": start_date}
        
        if end_date:
            if "earned_at" in query:
                query["earned_at"]["$lte"] = end_date
            else:
                query["earned_at"] = {"$lte": end_date}
        
        earnings = list(earnings_collection.find(query)
                       .sort("earned_at", -1)
                       .limit(limit))
        
        for earning in earnings:
            earning["_id"] = str(earning["_id"])
            
            # Add influencer info
            try:
                influencer = get_user_by_id(earning["influencer_id"])
                earning["influencer_name"] = influencer.get("username", "Unknown Influencer")
            except:
                earning["influencer_name"] = "Unknown Influencer"
            
            # Add campaign info
            try:
                campaign = get_campaign_by_id(earning["campaign_id"])
                earning["campaign_title"] = campaign.get("title", "Unknown Campaign")
                earning["brand_id"] = campaign.get("brand_id")
                
                # Add brand info
                brand = get_user_by_id(campaign["brand_id"])
                earning["brand_name"] = brand.get("username", "Unknown Brand")
            except:
                earning["campaign_title"] = "Unknown Campaign"
                earning["brand_name"] = "Unknown Brand"
    
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return earnings

@router.get("/earnings/summary", response_model=EarningsSummary)
async def get_earnings_summary_endpoint(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Get earnings summary for the current user"""
    check_user_permission(current_user, ["influencer"])
    
    summary = get_influencer_earnings_summary(
        influencer_id=str(current_user["_id"]),
        start_date=start_date,
        end_date=end_date
    )
    
    return EarningsSummary(**summary)

@router.get("/earnings/{earning_id}", response_model=EarningResponse)
async def get_earning_detail_endpoint(
    earning_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific earning"""
    earning = get_earning_by_id(earning_id)
    
    # Check permissions
    if current_user["role"] == "influencer" and earning["influencer_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this earning")
    
    if current_user["role"] == "brand" and earning.get("brand_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this earning")
    
    # Add additional info
    try:
        influencer = get_user_by_id(earning["influencer_id"])
        earning["influencer_name"] = influencer.get("username", "Unknown Influencer")
    except:
        earning["influencer_name"] = "Unknown Influencer"
    
    try:
        campaign = get_campaign_by_id(earning["campaign_id"])
        earning["campaign_title"] = campaign.get("title", "Unknown Campaign")
        earning["brand_id"] = campaign.get("brand_id")
        
        brand = get_user_by_id(campaign["brand_id"])
        earning["brand_name"] = brand.get("username", "Unknown Brand")
    except:
        earning["campaign_title"] = "Unknown Campaign"
        earning["brand_name"] = "Unknown Brand"
    
    return EarningResponse(**earning)

@router.put("/earnings/{earning_id}/status", response_model=dict)
async def update_earning_status_endpoint(
    background_tasks: BackgroundTasks,
    earning_id: str,
    status_update: EarningUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update earning status (Brand/Admin only)"""
    check_user_permission(current_user, ["brand", "admin"])
    
    earning = get_earning_by_id(earning_id)
    
    # Brand can only update their own earnings
    if current_user["role"] == "brand" and earning.get("brand_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to update this earning")
    
    old_status = earning.get("status")
    
    # Update status
    success = update_earning_status(
        earning_id,
        status_update.status,
        status_update.transaction_id,
        status_update.notes
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Earning not found")
    
    # Send notifications
    if status_update.status:
        send_payment_notification(background_tasks, earning_id, status_update.status, old_status)
    
    return {"message": f"Earning status updated to {status_update.status}"}

# -------------------- WITHDRAWAL ROUTES --------------------
@router.post("/withdrawals", response_model=dict)
async def create_withdrawal_endpoint(
    background_tasks: BackgroundTasks,
    withdrawal: WithdrawalCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new withdrawal request (Influencer only)"""
    check_user_permission(current_user, ["influencer"])
    
    # Verify influencer
    if str(current_user["_id"]) != withdrawal.influencer_id:
        raise HTTPException(status_code=403, detail="You can only create withdrawals for yourself")
    
    # Check available balance
    summary = get_influencer_earnings_summary(withdrawal.influencer_id)
    available_balance = summary["available_balance"]
    
    if withdrawal.amount > available_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Available balance: ${available_balance:.2f}"
        )
    
    # Calculate processing fee
    processing_fee = calculate_withdrawal_fee(withdrawal.amount, withdrawal.payment_method)
    net_amount = withdrawal.amount - processing_fee
    
    # Minimum withdrawal amount
    if net_amount < 10:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum withdrawal amount after fees is $10. Net amount: ${net_amount:.2f}"
        )
    
    # Create withdrawal
    withdrawal_dict = withdrawal.model_dump()
    withdrawal_dict["processing_fee"] = processing_fee
    withdrawal_dict["net_amount"] = net_amount
    withdrawal_dict["created_by"] = str(current_user["_id"])
    
    withdrawal_id = create_withdrawal(withdrawal_dict)
    
    # Send notification to influencer
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        withdrawal.influencer_id,
        "withdrawal_requested",
        "📤 Withdrawal Requested",
        f"Your withdrawal request of ${withdrawal.amount:.2f} has been submitted.",
        "medium",
        f"/influencer/withdrawals/{withdrawal_id}",
        {
            "withdrawal_id": withdrawal_id,
            "amount": withdrawal.amount,
            "net_amount": net_amount,
            "processing_fee": processing_fee,
            "currency": withdrawal.currency,
            "payment_method": withdrawal.payment_method,
            "status": "pending",
            "expected_processing": "3-5 business days"
        }
    )
    
    # Send notification to admin
    background_tasks.add_task(
        brand_notification_service.create_notification,
        "admin",  # Admin user ID
        "withdrawal_request",
        "📤 New Withdrawal Request",
        f"Influencer {current_user['username']} requested a withdrawal of ${withdrawal.amount:.2f}",
        "medium",
        f"/admin/withdrawals/{withdrawal_id}",
        {
            "withdrawal_id": withdrawal_id,
            "influencer_id": withdrawal.influencer_id,
            "influencer_name": current_user["username"],
            "amount": withdrawal.amount,
            "payment_method": withdrawal.payment_method,
            "account_details": withdrawal.account_details
        }
    )
    
    return {
        "message": "Withdrawal request created successfully",
        "withdrawal_id": withdrawal_id,
        "processing_fee": processing_fee,
        "net_amount": net_amount,
        "estimated_completion": (datetime.utcnow() + timedelta(days=5)).isoformat()
    }

@router.get("/withdrawals", response_model=List[WithdrawalResponse])
async def get_withdrawals_endpoint(
    current_user: dict = Depends(get_current_user),
    status: Optional[WithdrawalStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    """Get withdrawals for the current user"""
    
    if current_user["role"] == "influencer":
        withdrawals = get_withdrawals_by_influencer(
            influencer_id=str(current_user["_id"]),
            status=status.value if status else None,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
    elif current_user["role"] in ["brand", "admin"]:
        # Admins can see all withdrawals
        query = {}
        
        if status:
            query["status"] = status.value
        
        if start_date:
            query["requested_at"] = {"$gte": start_date}
        
        if end_date:
            if "requested_at" in query:
                query["requested_at"]["$lte"] = end_date
            else:
                query["requested_at"] = {"$lte": end_date}
        
        withdrawals = list(withdrawals_collection.find(query)
                          .sort("requested_at", -1)
                          .limit(limit))
        
        for withdrawal in withdrawals:
            withdrawal["_id"] = str(withdrawal["_id"])
            
            # Add influencer info
            try:
                influencer = get_user_by_id(withdrawal["influencer_id"])
                withdrawal["influencer_name"] = influencer.get("username", "Unknown Influencer")
            except:
                withdrawal["influencer_name"] = "Unknown Influencer"
    
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return withdrawals

@router.get("/withdrawals/{withdrawal_id}", response_model=WithdrawalResponse)
async def get_withdrawal_detail_endpoint(
    withdrawal_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific withdrawal"""
    withdrawal = get_withdrawal_by_id(withdrawal_id)
    
    # Check permissions
    if current_user["role"] == "influencer" and withdrawal["influencer_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to view this withdrawal")
    
    # Add influencer info
    try:
        influencer = get_user_by_id(withdrawal["influencer_id"])
        withdrawal["influencer_name"] = influencer.get("username", "Unknown Influencer")
    except:
        withdrawal["influencer_name"] = "Unknown Influencer"
    
    return WithdrawalResponse(**withdrawal)

@router.put("/withdrawals/{withdrawal_id}/status", response_model=dict)
async def update_withdrawal_status_endpoint(
    background_tasks: BackgroundTasks,
    withdrawal_id: str,
    status_update: WithdrawalUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update withdrawal status (Admin only)"""
    check_user_permission(current_user, ["admin"])
    
    withdrawal = get_withdrawal_by_id(withdrawal_id)
    old_status = withdrawal.get("status")
    
    # Update status
    success = update_withdrawal_status(
        withdrawal_id,
        status_update.status,
        status_update.transaction_id,
        status_update.admin_notes,
        status_update.processing_fee
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    
    # Send notifications
    if status_update.status:
        send_withdrawal_notification(background_tasks, withdrawal_id, status_update.status, old_status)
    
    return {"message": f"Withdrawal status updated to {status_update.status}"}

# -------------------- ANALYTICS ROUTES --------------------
@router.get("/analytics", response_model=AnalyticsResponse)
async def get_earnings_analytics_endpoint(
    current_user: dict = Depends(get_current_user),
    period: TimePeriod = Query(TimePeriod.MONTH),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    group_by: str = Query("day")
):
    """Get earnings analytics for influencer"""
    check_user_permission(current_user, ["influencer"])
    
    analytics = get_earnings_analytics(
        influencer_id=str(current_user["_id"]),
        period=period,
        start_date=start_date,
        end_date=end_date,
        group_by=group_by
    )
    
    return AnalyticsResponse(**analytics)

@router.get("/analytics/export")
async def export_earnings_data_endpoint(
    current_user: dict = Depends(get_current_user),
    format: str = Query("csv", regex="^(csv|json|excel)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Export earnings data for influencer"""
    check_user_permission(current_user, ["influencer"])
    
    earnings = get_earnings_by_influencer(
        influencer_id=str(current_user["_id"]),
        start_date=start_date,
        end_date=end_date,
        limit=1000
    )
    
    withdrawals = get_withdrawals_by_influencer(
        influencer_id=str(current_user["_id"]),
        start_date=start_date,
        end_date=end_date,
        limit=1000
    )
    
    if format == "json":
        return {
            "earnings": earnings,
            "withdrawals": withdrawals,
            "exported_at": datetime.utcnow().isoformat(),
            "period": {
                "start": start_date.isoformat() if start_date else None,
                "end": end_date.isoformat() if end_date else None
            }
        }
    
    elif format == "csv":
        # Generate CSV content
        csv_content = "Date,Type,Amount,Currency,Status,Description\n"
        
        for earning in earnings:
            csv_content += f"{earning['earned_at'].isoformat()},Earning,{earning['amount']},{earning.get('currency', 'USD')},{earning['status']},{earning.get('description', '')}\n"
        
        for withdrawal in withdrawals:
            csv_content += f"{withdrawal['requested_at'].isoformat()},Withdrawal,-{withdrawal['amount']},{withdrawal.get('currency', 'USD')},{withdrawal['status']},Withdrawal via {withdrawal['payment_method']}\n"
        
        return {
            "filename": f"earnings_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv",
            "content": csv_content,
            "content_type": "text/csv"
        }
    
    return {"message": "Export format not implemented"}

# -------------------- PAYMENT PROCESSING ROUTES --------------------
@router.post("/payments/process", response_model=dict)
async def process_payment_endpoint(
    background_tasks: BackgroundTasks,
    payment_request: PaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Process a payment to influencer (Brand only)"""
    check_user_permission(current_user, ["brand"])
    
    # Verify campaign belongs to brand
    campaign = get_campaign_by_id(payment_request.campaign_id)
    if campaign["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized for this campaign")
    
    # Verify influencer exists
    influencer = get_user_by_id(payment_request.influencer_id)
    
    # Check if influencer has a contract for this campaign
    has_contract = False
    for app in campaign.get("applications", []):
        if app["influencer_id"] == payment_request.influencer_id and app.get("contract_signed"):
            has_contract = True
            break
    
    if not has_contract:
        raise HTTPException(status_code=400, detail="Influencer must have a signed contract for this campaign")
    
    # Create earning record
    earning_data = {
        "influencer_id": payment_request.influencer_id,
        "campaign_id": payment_request.campaign_id,
        "brand_id": str(current_user["_id"]),
        "amount": payment_request.amount,
        "currency": payment_request.currency,
        "payment_method": payment_request.payment_method,
        "description": payment_request.notes,
        "invoice_number": payment_request.invoice_number,
        "created_by": str(current_user["_id"])
    }
    
    earning_id = create_earning(earning_data)
    
    # Update earning status to processing immediately
    update_earning_status(earning_id, EarningStatus.PROCESSING)
    
    # Create payment record in payments collection
    payment_data = {
        "earning_id": earning_id,
        "campaign_id": payment_request.campaign_id,
        "brand_id": str(current_user["_id"]),
        "influencer_id": payment_request.influencer_id,
        "amount": payment_request.amount,
        "currency": payment_request.currency,
        "payment_method": payment_request.payment_method,
        "status": "processing",
        "payment_date": datetime.utcnow(),
        "notes": payment_request.notes,
        "invoice_number": payment_request.invoice_number
    }
    
    payment_id = payments_collection.insert_one(payment_data).inserted_id
    
    # Send comprehensive notifications
    brand_name = current_user.get("username", "Unknown Brand")
    
    # Notify influencer
    background_tasks.add_task(
        influencer_notification_service.notify_payment_processing,
        payment_request.influencer_id,
        payment_request.amount,
        campaign["title"],
        payment_request.payment_method
    )
    
    background_tasks.add_task(
        influencer_notification_service.create_notification,
        payment_request.influencer_id,
        "payment_processing",
        "💸 Payment Processing",
        f"{brand_name} is processing a payment of ${payment_request.amount:.2f} for '{campaign['title']}'.",
        "high",
        f"/influencer/earnings",
        {
            "earning_id": earning_id,
            "payment_id": str(payment_id),
            "amount": payment_request.amount,
            "currency": payment_request.currency,
            "campaign_id": payment_request.campaign_id,
            "campaign_title": campaign["title"],
            "brand_name": brand_name,
            "payment_method": payment_request.payment_method,
            "status": "processing",
            "expected_completion": (datetime.utcnow() + timedelta(days=2)).isoformat()
        }
    )
    
    return {
        "message": "Payment processing initiated",
        "earning_id": earning_id,
        "payment_id": str(payment_id),
        "amount": payment_request.amount,
        "estimated_completion": (datetime.utcnow() + timedelta(days=2)).isoformat()
    }

@router.put("/payments/{payment_id}/complete", response_model=dict)
async def complete_payment_endpoint(
    background_tasks: BackgroundTasks,
    payment_id: str,
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Complete a payment (Brand/Admin only)"""
    check_user_permission(current_user, ["brand", "admin"])
    
    # Get payment
    payment = payments_collection.find_one({"_id": validate_object_id(payment_id)})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Check permissions
    if current_user["role"] == "brand" and payment["brand_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to complete this payment")
    
    # Update payment status
    payments_collection.update_one(
        {"_id": validate_object_id(payment_id)},
        {"$set": {
            "status": "completed",
            "transaction_id": transaction_id,
            "completed_at": datetime.utcnow()
        }}
    )
    
    # Update earning status
    if payment.get("earning_id"):
        update_earning_status(payment["earning_id"], EarningStatus.COMPLETED, transaction_id)
    
    # Get campaign info for notification
    campaign = get_campaign_by_id(payment["campaign_id"])
    brand = get_user_by_id(payment["brand_id"])
    
    # Send notifications
    send_payment_notification(background_tasks, payment["earning_id"], EarningStatus.COMPLETED)
    
    # Check for milestone
    summary = get_influencer_earnings_summary(payment["influencer_id"])
    if summary["total_earnings"] >= 1000:
        background_tasks.add_task(
            influencer_notification_service.notify_earning_milestone,
            payment["influencer_id"],
            summary["total_earnings"],
            "all_time"
        )
    
    return {
        "message": "Payment completed successfully",
        "transaction_id": transaction_id,
        "completed_at": datetime.utcnow().isoformat()
    }

# -------------------- DASHBOARD ROUTES --------------------
@router.get("/dashboard", response_model=dict)
async def get_influencer_dashboard_endpoint(
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive dashboard data for influencer"""
    check_user_permission(current_user, ["influencer"])
    
    influencer_id = str(current_user["_id"])
    
    # Get recent earnings (last 30 days)
    recent_earnings = get_earnings_by_influencer(
        influencer_id=influencer_id,
        start_date=datetime.utcnow() - timedelta(days=30),
        limit=10
    )
    
    # Get recent withdrawals
    recent_withdrawals = get_withdrawals_by_influencer(
        influencer_id=influencer_id,
        limit=5
    )
    
    # Get summary
    summary = get_influencer_earnings_summary(influencer_id)
    
    # Get pending campaigns with payments
    campaigns_with_pending_payments = []
    
    # This would typically query campaigns where influencer has contract but no payment
    # For now, we'll return a simplified version
    
    # Get quick stats
    quick_stats = {
        "today_earnings": 0,
        "this_week_earnings": 0,
        "this_month_earnings": summary["total_earnings"],
        "pending_approvals": 0,
        "active_campaigns": 0
    }
    
    return {
        "summary": summary,
        "quick_stats": quick_stats,
        "recent_activity": {
            "earnings": recent_earnings,
            "withdrawals": recent_withdrawals
        },
        "campaigns_with_pending_payments": campaigns_with_pending_payments,
        "upcoming_payments": [],  # Would calculate from scheduled payments
        "alerts": []  # Would include low balance, payment delays, etc.
    }

# -------------------- HEALTH CHECK --------------------
@router.get("/health")
async def earnings_health_check():
    """Health check for earnings module"""
    try:
        # Check database connections
        earnings_count = earnings_collection.count_documents({})
        withdrawals_count = withdrawals_collection.count_documents({})
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "earnings_collection": "connected",
                "withdrawals_collection": "connected"
            },
            "counts": {
                "earnings": earnings_count,
                "withdrawals": withdrawals_count
            }
        }
    except Exception as e:
        logger.error(f"Earnings health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }