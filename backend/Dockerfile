# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential && apt-get clean

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Make startup script executable
RUN chmod +x startup.sh

# Expose port (for documentation only)
EXPOSE 8000

# Start app using startup script
CMD ["sh", "startup.sh"]