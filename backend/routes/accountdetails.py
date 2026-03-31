# C:\Sagadevan\quickbox\backend\routes\accountdetails.py
import os
import requests
import logging
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from database import db
from auth.utils import get_current_user
import csv
from fastapi.responses import StreamingResponse
from io import StringIO

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/account", tags=["Account Details"])

# Collections
users_collection = db["users"]
bank_details_collection = db["bank_details"]

# Free Razorpay IFSC API Configuration
IFSC_API_BASE_URL = "https://ifsc.razorpay.com"

# -------------------- SCHEMAS --------------------
class BankAccountBase(BaseModel):
    account_holder_name: str = Field(..., min_length=1, max_length=100)
    account_number: str = Field(..., min_length=9, max_length=18)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    account_type: str = Field(default="savings", pattern="^(savings|current)$")
    is_primary: bool = Field(default=True)

    @validator('account_number')
    def validate_account_number(cls, v):
        if not v.isdigit():
            raise ValueError('Account number must contain only digits')
        return v

    @validator('ifsc_code')
    def validate_ifsc_code(cls, v):
        if not v.isalnum() or len(v) != 11:
            raise ValueError('IFSC code must be 11 characters alphanumeric')
        return v.upper()

class BankAccountCreate(BankAccountBase):
    pass

class BankAccountResponse(BankAccountBase):
    id: str = Field(alias="_id")
    user_id: str
    user_role: str
    is_verified: bool = False
    verification_status: str = Field(default="pending")  # pending, verified, failed
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class BankAccountUpdate(BaseModel):
    account_holder_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_primary: Optional[bool] = None

class IFSCValidationResponse(BaseModel):
    is_valid: bool
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    bank_code: Optional[str] = None
    ifsc_code: Optional[str] = None
    center: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    contact: Optional[str] = None
    message: Optional[str] = None

# -------------------- SERVICES --------------------
class IFSCValidationService:
    def __init__(self):
        self.base_url = IFSC_API_BASE_URL

    def validate_ifsc(self, ifsc_code: str) -> IFSCValidationResponse:
        """Validate IFSC code using free Razorpay IFSC API"""
        try:
            url = f"{self.base_url}/{ifsc_code}"
            logger.info(f"Validating IFSC: {ifsc_code}")
            
            response = requests.get(url, timeout=10)
            logger.info(f"IFSC API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"IFSC API Response Data: {data}")
                
                # Check if we have valid bank data
                if data.get("BANK") and data.get("BRANCH"):
                    return IFSCValidationResponse(
                        is_valid=True,
                        bank_name=data.get("BANK"),
                        branch_name=data.get("BRANCH"),
                        bank_code=data.get("BANKCODE"),
                        ifsc_code=data.get("IFSC"),
                        center=data.get("CENTRE"),
                        district=data.get("DISTRICT"),
                        state=data.get("STATE"),
                        contact=data.get("CONTACT"),
                        message=f"Valid IFSC code for {data.get('BANK')} - {data.get('BRANCH')}"
                    )
                else:
                    return IFSCValidationResponse(
                        is_valid=False,
                        message="Invalid IFSC code - Bank details not found"
                    )
            
            elif response.status_code == 404:
                return IFSCValidationResponse(
                    is_valid=False,
                    message="Invalid IFSC code - Not found in database"
                )
            else:
                return IFSCValidationResponse(
                    is_valid=False,
                    message=f"IFSC validation failed with status: {response.status_code}"
                )
                
        except requests.exceptions.Timeout:
            logger.error("IFSC validation timeout")
            return IFSCValidationResponse(
                is_valid=False,
                message="IFSC validation service timeout"
            )
        except requests.exceptions.ConnectionError:
            logger.error("IFSC validation connection error")
            return IFSCValidationResponse(
                is_valid=False,
                message="IFSC validation service unavailable"
            )
        except Exception as e:
            logger.error(f"IFSC validation failed: {str(e)}")
            return IFSCValidationResponse(
                is_valid=False,
                message="Failed to validate IFSC code"
            )

class BankAccountService:
    
    def __init__(self):
        self.ifsc_service = IFSCValidationService()

    async def create_bank_account(self, bank_data: BankAccountCreate, user_id: str, user_role: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new bank account with IFSC validation"""
        try:
            # Validate IFSC code first
            ifsc_validation = self.ifsc_service.validate_ifsc(bank_data.ifsc_code)
            if not ifsc_validation.is_valid:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid IFSC code: {ifsc_validation.message}"
                )

            # Check if account already exists
            existing_account = bank_details_collection.find_one({
                "user_id": user_id,
                "account_number": bank_data.account_number,
                "ifsc_code": bank_data.ifsc_code
            })
            
            if existing_account:
                raise HTTPException(
                    status_code=400,
                    detail="Bank account already exists"
                )
                
            account_count = bank_details_collection.count_documents({"user_id": user_id})
            if account_count >= 3:
                raise HTTPException(
                    status_code=400,
                    detail="Maximum 3 bank accounts allowed"
                )


            # Prepare bank account data
            bank_account_data = {
                "user_id": user_id,
                "user_role": user_role,
                "account_holder_name": bank_data.account_holder_name,
                "account_number": bank_data.account_number,
                "ifsc_code": bank_data.ifsc_code,
                "bank_name": ifsc_validation.bank_name,
                "branch_name": ifsc_validation.branch_name,
                "account_type": bank_data.account_type,
                "is_primary": bank_data.is_primary,
                "is_verified": True,  # Verified via IFSC validation
                "verification_status": "verified",
                "bank_details": {
                    "center": ifsc_validation.center,
                    "district": ifsc_validation.district,
                    "state": ifsc_validation.state,
                    "contact": ifsc_validation.contact,
                    "bank_code": ifsc_validation.bank_code
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            # If this is set as primary, update other accounts to non-primary
            if bank_data.is_primary:
                bank_details_collection.update_many(
                    {"user_id": user_id, "is_primary": True},
                    {"$set": {"is_primary": False}}
                )

            # Insert new bank account
            result = bank_details_collection.insert_one(bank_account_data)
            bank_account_data["_id"] = str(result.inserted_id)

            # Update user with bank account reference
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"has_bank_account": True, "updated_at": datetime.utcnow()}}
            )

            return {
                "success": True,
                "message": "Bank account added successfully",
                "bank_account": bank_account_data,
                "ifsc_validation": ifsc_validation.dict()
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Bank account creation failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to create bank account"
            )

    async def get_bank_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all bank accounts for a user"""
        try:
            accounts = list(bank_details_collection.find({"user_id": user_id}).sort("is_primary", -1))
            
            for account in accounts:
                account["_id"] = str(account["_id"])
                
            return accounts
        except Exception as e:
            logger.error(f"Failed to fetch bank accounts: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch bank accounts"
            )

    async def get_primary_bank_account(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get primary bank account for a user"""
        try:
            account = bank_details_collection.find_one({
                "user_id": user_id,
                "is_primary": True
            })
            
            if account:
                account["_id"] = str(account["_id"])
                
            return account
        except Exception as e:
            logger.error(f"Failed to fetch primary bank account: {str(e)}")
            return None

    async def update_bank_account(self, account_id: str, update_data: BankAccountUpdate, user_id: str) -> Dict[str, Any]:
        """Update bank account details"""
        try:
            # Verify account belongs to user
            account = bank_details_collection.find_one({
                "_id": ObjectId(account_id),
                "user_id": user_id
            })
            
            if not account:
                raise HTTPException(
                    status_code=404,
                    detail="Bank account not found"
                )

            update_fields = {}
            if update_data.account_holder_name is not None:
                update_fields["account_holder_name"] = update_data.account_holder_name
                
            if update_data.is_primary is not None:
                update_fields["is_primary"] = update_data.is_primary
                # If setting as primary, update other accounts
                if update_data.is_primary:
                    bank_details_collection.update_many(
                        {"user_id": user_id, "is_primary": True},
                        {"$set": {"is_primary": False}}
                    )

            update_fields["updated_at"] = datetime.utcnow()

            result = bank_details_collection.update_one(
                {"_id": ObjectId(account_id)},
                {"$set": update_fields}
            )

            if result.modified_count == 0:
                raise HTTPException(
                    status_code=400,
                    detail="No changes made to bank account"
                )

            return {
                "success": True,
                "message": "Bank account updated successfully"
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Bank account update failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to update bank account"
            )

    async def delete_bank_account(self, account_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a bank account"""
        try:
            # Verify account belongs to user
            account = bank_details_collection.find_one({
                "_id": ObjectId(account_id),
                "user_id": user_id
            })
            
            if not account:
                raise HTTPException(
                    status_code=404,
                    detail="Bank account not found"
                )

            # Don't allow deletion if it's the only account
            account_count = bank_details_collection.count_documents({"user_id": user_id})
            if account_count == 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete the only bank account. Add another account first."
                )

            result = bank_details_collection.delete_one({"_id": ObjectId(account_id)})

            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=404,
                    detail="Bank account not found"
                )

            # If deleted account was primary, set another account as primary
            if account.get("is_primary"):
                other_account = bank_details_collection.find_one({"user_id": user_id})
                if other_account:
                    bank_details_collection.update_one(
                        {"_id": other_account["_id"]},
                        {"$set": {"is_primary": True}}
                    )

            # Update user if no accounts left
            remaining_count = bank_details_collection.count_documents({"user_id": user_id})
            if remaining_count == 0:
                users_collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"has_bank_account": False}}
                )

            return {
                "success": True,
                "message": "Bank account deleted successfully"
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Bank account deletion failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to delete bank account"
            )
            
    # Add this method to the BankAccountService class
    async def get_influencer_account_summary(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get influencer's bank account summary for campaign applications"""
        try:
            account = await self.get_primary_bank_account(user_id)
            
            if not account:
                # Try to get any account
                accounts = await self.get_bank_accounts(user_id)
                if accounts:
                    account = accounts[0]
                else:
                    return None
            
            # Return a safe summary without sensitive data
            return {
                "bank_account_id": account.get("_id"),
                "account_holder_name": account.get("account_holder_name"),
                "bank_name": account.get("bank_name"),
                "branch_name": account.get("branch_name"),
                "account_type": account.get("account_type"),
                "ifsc_code": account.get("ifsc_code"),  # Keep this for payment processing
                "is_verified": account.get("is_verified", False),
                "verification_status": account.get("verification_status", "pending"),
                "has_bank_account": True
            }
        
        except Exception as e:
            logger.error(f"Error fetching account summary: {str(e)}")
            return None




# -------------------- ROUTES --------------------
bank_service = BankAccountService()





@router.post("/bank-accounts", response_model=Dict[str, Any])
async def create_bank_account(
    bank_data: BankAccountCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new bank account for influencer or brand"""
    if current_user["role"] not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=403,
            detail="Only influencers and brands can add bank accounts"
        )

    result = await bank_service.create_bank_account(
        bank_data, 
        str(current_user["_id"]),
        current_user["role"],
        current_user
    )
    return result

@router.get("/bank-accounts", response_model=List[BankAccountResponse])
async def get_my_bank_accounts(current_user: dict = Depends(get_current_user)):
    """Get all bank accounts for current user"""
    if current_user["role"] not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=403,
            detail="Only influencers and brands can view bank accounts"
        )

    accounts = await bank_service.get_bank_accounts(str(current_user["_id"]))
    return accounts

@router.get("/bank-accounts/primary", response_model=BankAccountResponse)
async def get_primary_bank_account(current_user: dict = Depends(get_current_user)):
    """Get primary bank account for current user"""
    if current_user["role"] not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=403,
            detail="Only influencers and brands can view bank accounts"
        )

    account = await bank_service.get_primary_bank_account(str(current_user["_id"]))
    if not account:
        raise HTTPException(
            status_code=404,
            detail="No primary bank account found"
        )
    return account

@router.put("/bank-accounts/{account_id}", response_model=Dict[str, Any])
async def update_bank_account(
    account_id: str,
    update_data: BankAccountUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update bank account details"""
    if current_user["role"] not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=403,
            detail="Only influencers and brands can update bank accounts"
        )

    result = await bank_service.update_bank_account(
        account_id, 
        update_data, 
        str(current_user["_id"])
    )
    return result

@router.delete("/bank-accounts/{account_id}", response_model=Dict[str, Any])
async def delete_bank_account(
    account_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a bank account"""
    if current_user["role"] not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=403,
            detail="Only influencers and brands can delete bank accounts"
        )

    result = await bank_service.delete_bank_account(
        account_id, 
        str(current_user["_id"])
    )
    return result

@router.get("/validate-ifsc/{ifsc_code}", response_model=IFSCValidationResponse)
async def validate_ifsc_code(ifsc_code: str):
    """Validate IFSC code using free Razorpay IFSC API"""
    ifsc_service = IFSCValidationService()
    return ifsc_service.validate_ifsc(ifsc_code)

@router.get("/bank-accounts/status")
async def get_bank_account_status(current_user: dict = Depends(get_current_user)):
    """Check if user has bank accounts and get status"""
    if current_user["role"] not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=403,
            detail="Only influencers and brands can check bank account status"
        )

    try:
        account_count = bank_details_collection.count_documents({
            "user_id": str(current_user["_id"])
        })
        
        primary_account = await bank_service.get_primary_bank_account(str(current_user["_id"]))
        
        return {
            "has_accounts": account_count > 0,
            "account_count": account_count,
            "has_primary_account": primary_account is not None,
            "primary_account": primary_account
        }
    except Exception as e:
        logger.error(f"Failed to get bank account status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get bank account status"
        )

# Test endpoint with known valid IFSC codes
@router.get("/test-ifsc")
async def test_ifsc_validation():
    """Test IFSC validation with known valid codes"""
    ifsc_service = IFSCValidationService()
    
    test_codes = [
        "SBIN0000001",  # State Bank of India, Mumbai
        "HDFC0000001",  # HDFC Bank, Mumbai
        "ICIC0000001",  # ICICI Bank, Mumbai
        "UBIN0000001",  # Union Bank of India, Mumbai
        "CNRB0000001",  # Canara Bank, Mumbai
    ]
    
    results = {}
    for ifsc_code in test_codes:
        results[ifsc_code] = ifsc_service.validate_ifsc(ifsc_code).dict()
    
    return {
        "test_results": results,
        "timestamp": datetime.utcnow().isoformat()
    }

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for account service"""
    try:
        # Test IFSC validation service
        ifsc_service = IFSCValidationService()
        test_ifsc = "SBIN0000001"  # SBI main branch IFSC
        ifsc_check = ifsc_service.validate_ifsc(test_ifsc)
        
        return {
            "status": "healthy",
            "ifsc_service_working": ifsc_check.is_valid,
            "test_ifsc": test_ifsc,
            "validation_result": ifsc_check.is_valid,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "ifsc_service_working": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        
@router.get("/all-bank-accounts", response_model=List[BankAccountResponse])
async def get_all_bank_accounts(current_user: dict = Depends(get_current_user)):
    """Admin: Get all bank accounts of all users"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can view all bank accounts"
        )

    try:
        accounts = list(bank_details_collection.find().sort("created_at", -1))
        for account in accounts:
            account["_id"] = str(account["_id"])
        return accounts

    except Exception as e:
        logger.error(f"Failed to fetch all bank accounts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch all bank accounts"
        )


@router.get("/user/{user_id}/bank-accounts", response_model=List[BankAccountResponse])
async def get_user_bank_accounts(user_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Get bank accounts of a specific user"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can view bank accounts"
        )

    try:
        accounts = list(bank_details_collection.find({"user_id": user_id}))
        for account in accounts:
            account["_id"] = str(account["_id"])
        return accounts

    except Exception as e:
        logger.error(f"Failed to fetch bank accounts for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch bank accounts"
        )


@router.put("/suspend-user/{user_id}", response_model=Dict[str, Any])
async def suspend_user_account(user_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Suspend a user account"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can suspend user accounts"
        )

    try:
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_suspended": True, "updated_at": datetime.utcnow()}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "message": f"User {user_id} has been suspended"
        }

    except Exception as e:
        logger.error(f"Failed to suspend user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to suspend user"
        )


@router.get("/report/all-users", response_model=List[Dict[str, Any]])
async def generate_user_account_report(current_user: dict = Depends(get_current_user)):
    """Admin: Generate report of all users and their bank accounts"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can generate reports"
        )

    try:
        users = list(users_collection.find())
        report = []

        for user in users:
            user_id_str = str(user["_id"])
            accounts = list(bank_details_collection.find({"user_id": user_id_str}))
            for account in accounts:
                account["_id"] = str(account["_id"])

            report.append({
                "user_id": user_id_str,
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role"),
                "is_suspended": user.get("is_suspended", False),
                "bank_accounts": accounts
            })

        return report

    except Exception as e:
        logger.error(f"Failed to generate user report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate report"
        )

@router.put("/unsuspend-user/{user_id}", response_model=Dict[str, Any])
async def unsuspend_user_account(user_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Unsuspend a user account"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can unsuspend user accounts"
        )

    try:
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_suspended": False, "updated_at": datetime.utcnow()}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "message": f"User {user_id} has been unsuspended"
        }

    except Exception as e:
        logger.error(f"Failed to unsuspend user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to unsuspend user"
        )

@router.get("/report/all-users/csv")
async def export_user_account_report_csv(current_user: dict = Depends(get_current_user)):
    """Admin: Export all users and their bank accounts as CSV"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can export reports"
        )

    try:
        users = list(users_collection.find())
        output = StringIO()
        writer = csv.writer(output)

        # Write CSV header
        writer.writerow([
            "User ID", "Name", "Email", "Role", "Is Suspended",
            "Bank Account ID", "Account Holder Name", "Account Number",
            "IFSC Code", "Bank Name", "Branch Name", "Account Type", 
            "Is Primary", "Verification Status", "User Role"
        ])

        # Write CSV rows
        for user in users:
            user_id_str = str(user["_id"])
            accounts = list(bank_details_collection.find({"user_id": user_id_str}))
            if accounts:
                for account in accounts:
                    writer.writerow([
                        user_id_str,
                        user.get("name"),
                        user.get("email"),
                        user.get("role"),
                        user.get("is_suspended", False),
                        str(account["_id"]),
                        account.get("account_holder_name"),
                        account.get("account_number"),
                        account.get("ifsc_code"),
                        account.get("bank_name"),
                        account.get("branch_name"),
                        account.get("account_type"),
                        account.get("is_primary"),
                        account.get("verification_status"),
                        account.get("user_role", "influencer")  # Include user role from bank account
                    ])
            else:
                # User has no accounts
                writer.writerow([
                    user_id_str,
                    user.get("name"),
                    user.get("email"),
                    user.get("role"),
                    user.get("is_suspended", False),
                    "", "", "", "", "", "", "", "", "", ""
                ])

        output.seek(0)
        response = StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_bank_report.csv"}
        )
        return response

    except Exception as e:
        logger.error(f"Failed to export CSV report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to export CSV report"
        )

# Brand-specific endpoints
@router.get("/brand/bank-accounts", response_model=List[BankAccountResponse])
async def get_brand_bank_accounts(current_user: dict = Depends(get_current_user)):
    """Get bank accounts for brand users"""
    if current_user["role"] != "brand":
        raise HTTPException(
            status_code=403,
            detail="Only brands can access this endpoint"
        )

    accounts = await bank_service.get_bank_accounts(str(current_user["_id"]))
    return accounts

@router.get("/brand/bank-accounts/primary", response_model=BankAccountResponse)
async def get_brand_primary_bank_account(current_user: dict = Depends(get_current_user)):
    """Get primary bank account for brand"""
    if current_user["role"] != "brand":
        raise HTTPException(
            status_code=403,
            detail="Only brands can access this endpoint"
        )

    account = await bank_service.get_primary_bank_account(str(current_user["_id"]))
    if not account:
        raise HTTPException(
            status_code=404,
            detail="No primary bank account found"
        )
    return account

# Filter bank accounts by user role (admin only)
@router.get("/bank-accounts/by-role/{role}", response_model=List[BankAccountResponse])
async def get_bank_accounts_by_role(role: str, current_user: dict = Depends(get_current_user)):
    """Admin: Get bank accounts filtered by user role"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can filter bank accounts by role"
        )

    if role not in ["influencer", "brand"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be either 'influencer' or 'brand'"
        )

    try:
        accounts = list(bank_details_collection.find({"user_role": role}).sort("created_at", -1))
        for account in accounts:
            account["_id"] = str(account["_id"])
        return accounts

    except Exception as e:
        logger.error(f"Failed to fetch bank accounts by role {role}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch bank accounts"
        )