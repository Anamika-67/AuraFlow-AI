import os
import sys
import pathlib

# Base Directories
BASE_DIR = pathlib.Path(__file__).resolve().parent
OUTPUTS_DIR = BASE_DIR / "outputs"
PROJECTS_DIR = BASE_DIR / "projects"
MODELS_DIR = BASE_DIR / "models"

# Ensure required directories exist
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Hardware & Acceleration Detection
DEVICE_TYPE = "cpu"
ROCM_AVAILABLE = False
ROCM_VERSION = "N/A"
GPU_NAME = "AMD Radeon GPU (Simulated / ROCm Telemetry active)"
VRAM_TOTAL_MB = 16384  # 16 GB default representation

try:
    import torch
    if hasattr(torch, "version") and hasattr(torch.version, "hip") and torch.version.hip:
        ROCM_AVAILABLE = True
        ROCM_VERSION = torch.version.hip
        DEVICE_TYPE = "cuda"  # PyTorch uses 'cuda' API for ROCm HIP
        if torch.cuda.is_available():
            GPU_NAME = torch.cuda.get_device_name(0)
            VRAM_TOTAL_MB = int(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024))
    elif torch.cuda.is_available():
        DEVICE_TYPE = "cuda"
        GPU_NAME = torch.cuda.get_device_name(0)
        VRAM_TOTAL_MB = int(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024))
except Exception:
    pass

# Server Config
HOST = "0.0.0.0"
PORT = 8000
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]
