# ===========================================================================
# AuraFlow-AI — Multi-Stage Dockerfile
# Optimized for AMD Radeon GPU deployment via ROCm
# ===========================================================================
# Base: Official AMD ROCm PyTorch image with HIP runtime
# Includes: Python 3.10, PyTorch 2.3, ROCm 6.1, HIP SDK
# ===========================================================================

# ── Stage 1: Backend (Python + ROCm + AI Models) ──────────────────────────
FROM rocm/pytorch:rocm6.1_ubuntu22.04_py3.10_pytorch_2.3 AS backend

WORKDIR /app

# System dependencies: FFmpeg, audio libraries, build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    libportaudio2 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Piper TTS binary (local neural TTS)
RUN mkdir -p /opt/piper && \
    wget -qO /opt/piper/piper.tar.gz \
      "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz" && \
    tar -xzf /opt/piper/piper.tar.gz -C /opt/piper --strip-components=1 && \
    rm /opt/piper/piper.tar.gz && \
    ln -sf /opt/piper/piper /usr/local/bin/piper

# Download default Piper voice model
RUN mkdir -p /opt/piper/models && \
    wget -qO /opt/piper/models/en_US-lessac-medium.onnx \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx" && \
    wget -qO /opt/piper/models/en_US-lessac-medium.onnx.json \
      "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json"

ENV PIPER_MODEL=/opt/piper/models/en_US-lessac-medium.onnx

# Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend source
COPY backend/ /app/backend/

# ── Stage 2: Frontend Build (Node.js) ─────────────────────────────────────
FROM node:20-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --production=false

COPY frontend/ ./
RUN npm run build

# ── Stage 3: Final Runtime Image ──────────────────────────────────────────
FROM rocm/pytorch:rocm6.1_ubuntu22.04_py3.10_pytorch_2.3 AS runtime

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy Piper TTS from build stage
COPY --from=backend /opt/piper /opt/piper
COPY --from=backend /usr/local/bin/piper /usr/local/bin/piper
ENV PIPER_MODEL=/opt/piper/models/en_US-lessac-medium.onnx

# Copy Python dependencies from build stage
COPY --from=backend /opt/conda /opt/conda

# Copy backend source
COPY --from=backend /app/backend /app/backend

# Copy frontend build artifacts
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Create required directories
RUN mkdir -p /app/backend/outputs /app/backend/projects /app/backend/models

# Environment configuration for AMD ROCm
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    # ROCm GPU configuration
    HSA_OVERRIDE_GFX_VERSION=${HSA_OVERRIDE_GFX_VERSION:-11.0.0} \
    PYTORCH_ROCM_ARCH=${PYTORCH_ROCM_ARCH:-gfx1100} \
    HIP_VISIBLE_DEVICES=0 \
    # PyTorch optimizations
    PYTORCH_HIP_ALLOC_CONF=max_split_size_mb:512 \
    TORCH_COMPILE_BACKEND=inductor \
    # AuraFlow configuration
    AURA_DEVICE=auto \
    AURA_FP16=true \
    AURA_TORCH_COMPILE=false \
    AURA_ATTENTION_BACKEND=sdpa

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start FastAPI server with uvicorn
CMD ["python", "-m", "uvicorn", "backend.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--timeout-keep-alive", "120"]
