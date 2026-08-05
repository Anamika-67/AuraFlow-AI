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

# ---------------------------------------------------------------------------
# Hardware & Acceleration Detection
# ---------------------------------------------------------------------------
DEVICE_TYPE = "cpu"
ROCM_AVAILABLE = False
ROCM_VERSION = "N/A"
ROCM_ARCH = "N/A"
GPU_NAME = "AMD Radeon GPU (Simulated / ROCm Telemetry active)"
VRAM_TOTAL_MB = 16384  # 16 GB default representation
DRIVER_VERSION = "N/A"

try:
    import torch

    # ROCm Detection — PyTorch uses 'cuda' API namespace for HIP/ROCm
    if hasattr(torch, "version") and hasattr(torch.version, "hip") and torch.version.hip:
        ROCM_AVAILABLE = True
        ROCM_VERSION = torch.version.hip
        DEVICE_TYPE = "cuda"

        if torch.cuda.is_available():
            GPU_NAME = torch.cuda.get_device_name(0)
            props = torch.cuda.get_device_properties(0)
            VRAM_TOTAL_MB = int(props.total_mem / (1024 * 1024))

            # Detect GPU architecture (gcnArchName for AMD GPUs)
            if hasattr(props, "gcnArchName"):
                ROCM_ARCH = props.gcnArchName

    elif torch.cuda.is_available():
        # NVIDIA CUDA fallback (still works with same acceleration code)
        DEVICE_TYPE = "cuda"
        GPU_NAME = torch.cuda.get_device_name(0)
        VRAM_TOTAL_MB = int(torch.cuda.get_device_properties(0).total_mem / (1024 * 1024))

except Exception:
    pass

# ---------------------------------------------------------------------------
# Optimization Flags (runtime state — updated by gpu_accelerator module)
# ---------------------------------------------------------------------------
OPTIMIZATION_FLAGS = {
    "fp16_precision": DEVICE_TYPE == "cuda",
    "torch_compile": DEVICE_TYPE == "cuda",
    "sdpa_attention": DEVICE_TYPE == "cuda",
    "xformers_attention": False,
    "hip_graph_acceleration": ROCM_AVAILABLE,
    "model_cpu_offload": False,
    "vae_slicing": DEVICE_TYPE == "cuda",
    "vae_tiling": DEVICE_TYPE == "cuda",
}

# ---------------------------------------------------------------------------
# Environment Variable Overrides
# ---------------------------------------------------------------------------
# Allow all settings to be overridden via environment variables
DEVICE_TYPE = os.environ.get("AURA_DEVICE", DEVICE_TYPE)
if DEVICE_TYPE == "auto":
    DEVICE_TYPE = "cuda" if ROCM_AVAILABLE else "cpu"

# HuggingFace model cache directory
HF_CACHE_DIR = os.environ.get("HF_HOME", str(MODELS_DIR / "hf_cache"))

# ROCm architecture override (for HSA_OVERRIDE_GFX_VERSION)
HSA_GFX_VERSION = os.environ.get("HSA_OVERRIDE_GFX_VERSION", "")

# ---------------------------------------------------------------------------
# Server Config
# ---------------------------------------------------------------------------
HOST = os.environ.get("AURA_HOST", "0.0.0.0")
PORT = int(os.environ.get("AURA_PORT", "8000"))
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-24s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger("auraflow.config")
logger.info("Device: %s | GPU: %s | ROCm: %s (v%s) | VRAM: %d MB | Arch: %s",
            DEVICE_TYPE, GPU_NAME, ROCM_AVAILABLE, ROCM_VERSION, VRAM_TOTAL_MB, ROCM_ARCH)
