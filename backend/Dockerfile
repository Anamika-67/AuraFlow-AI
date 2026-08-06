# =============================================================================
# AuraFlow-AI Backend Dockerfile
# Multi-stage optimized Docker configuration for AWS / Production deployment
# =============================================================================

FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=8000

WORKDIR /app

# Install required system packages (FFmpeg, OpenCV dependencies, cURL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1 \
    libglib2.0-0 \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies definition
COPY backend/requirements.txt /app/backend/requirements.txt

# Install Python requirements
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Install PyTorch (default CPU wheel for portable deployment)
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy backend code
COPY backend /app/backend

# Ensure persistent directories exist
RUN mkdir -p /app/backend/outputs /app/backend/projects /app/backend/models

EXPOSE 8000

# Run FastAPI backend with Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
