# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps (optional but safe)
RUN apt-get update && apt-get install -y build-essential

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Start app
CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]