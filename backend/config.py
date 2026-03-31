import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "QUICK"

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")  # change in production
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60


STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_ENABLED = os.getenv("STRIPE_ENABLED") == "true"
PAYPAL_ENABLED = os.getenv("PAYPAL_ENABLED") == "true"

