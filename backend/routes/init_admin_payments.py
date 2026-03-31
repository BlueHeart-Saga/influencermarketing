# backend/init_admin_payments.py
from pymongo import ASCENDING, DESCENDING
from datetime import datetime

def init_admin_payments_collections(db):
    """Initialize admin payments collections with indexes"""
    
    # Admin Payments Collection
    admin_payments_collection = db["admin_payments"]
    
    # Create indexes for admin_payments
    admin_payments_collection.create_index([("status", ASCENDING)])
    admin_payments_collection.create_index([("payment_method", ASCENDING)])
    admin_payments_collection.create_index([("brand_id", ASCENDING)])
    admin_payments_collection.create_index([("influencer_id", ASCENDING)])
    admin_payments_collection.create_index([("campaign_id", ASCENDING)])
    admin_payments_collection.create_index([("created_at", DESCENDING)])
    admin_payments_collection.create_index([("amount", ASCENDING)])
    admin_payments_collection.create_index([
        ("status", ASCENDING),
        ("created_at", DESCENDING)
    ])
    
    # Payouts Collection
    payouts_collection = db["payouts"]
    
    # Create indexes for payouts
    payouts_collection.create_index([("status", ASCENDING)])
    payouts_collection.create_index([("payment_id", ASCENDING)])
    payouts_collection.create_index([("influencer_id", ASCENDING)])
    payouts_collection.create_index([("payout_method", ASCENDING)])
    payouts_collection.create_index([("created_at", DESCENDING)])
    payouts_collection.create_index([("amount", ASCENDING)])
    
    print("✅ Admin payments collections initialized with indexes")
    
    return admin_payments_collection, payouts_collection