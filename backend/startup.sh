#!/bin/bash

echo "🚀 Starting FastAPI App..."

# Ensure we are in app directory
cd /app

# Start with dynamic PORT (Azure compatible)
gunicorn main:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:${PORT:-8000} \
  --timeout 600