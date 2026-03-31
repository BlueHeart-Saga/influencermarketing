# backend/scheduler/autopay_scheduler.py
import asyncio
import logging
from datetime import datetime
from database import db
from routes.autopay import AutopayService

logger = logging.getLogger(__name__)

class AutopayScheduler:
    def __init__(self):
        self.autopay_service = AutopayService()
        self.running = False

    async def start(self):
        """Start the autopay scheduler"""
        self.running = True
        logger.info("Autopay scheduler started")
        
        while self.running:
            try:
                # Process payments every hour
                await self.process_due_payments()
                await asyncio.sleep(3600)  # 1 hour
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                await asyncio.sleep(300)  # 5 minutes on error

    async def process_due_payments(self):
        """Process all due autopay payments"""
        try:
            result = await self.autopay_service.process_scheduled_payments()
            logger.info(f"Processed {result.get('processed', 0)} payments at {datetime.utcnow()}")
        except Exception as e:
            logger.error(f"Payment processing failed: {str(e)}")

    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Autopay scheduler stopped")