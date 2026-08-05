#!/usr/bin/env python3
"""
AuraFlow-AI — Model Downloader Utility
=======================================
Downloads the real AI model weights required for the pipeline.
This prevents the system from using the "Procedural Fallback" 
mock engines and ensures real AI generation for judges.

Models Downloaded:
- SDXL Base 1.0 (Image Generation)
- Stable Diffusion Inpainting (Image Editing)
- AnimateDiff Motion Adapter (Video Animation)
- Piper TTS (Voice)

Usage:
    python backend/scripts/download_models.py
"""

import os
import sys
import subprocess
from pathlib import Path

# Ensure paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = PROJECT_ROOT / "backend" / "models"
HF_CACHE = MODELS_DIR / "hf_cache"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
HF_CACHE.mkdir(parents=True, exist_ok=True)

# Set env var so huggingface_hub uses our local cache
os.environ["HF_HOME"] = str(HF_CACHE)

def install_deps():
    print("[1/5] Checking dependencies...")
    try:
        import huggingface_hub
    except ImportError:
        print("  Installing huggingface_hub...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub"])
        import huggingface_hub

def robust_download(repo_id, allow_patterns, ignore_patterns=None, filename=None, local_dir=None):
    from huggingface_hub import snapshot_download, hf_hub_download
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if filename:
                hf_hub_download(repo_id=repo_id, filename=filename, local_dir=local_dir, resume_download=True)
            else:
                snapshot_download(
                    repo_id=repo_id,
                    allow_patterns=allow_patterns,
                    ignore_patterns=ignore_patterns,
                    resume_download=True
                )
            return
        except Exception as e:
            print(f"  [Attempt {attempt+1}/{max_retries}] Network error: {e}")
            if attempt == max_retries - 1:
                print("  ❌ Failed after maximum retries. Please check your internet connection.")
                raise e
            import time
            time.sleep(3)

def download_models():
    print("\n[2/5] Downloading SDXL Base 1.0 (~6.5 GB)...")
    print("  This may take a while. If it fails, it will automatically resume.")
    robust_download(
        repo_id="stabilityai/stable-diffusion-xl-base-1.0",
        allow_patterns=["*.safetensors", "*.json", "*.txt"],
        ignore_patterns=[".msgpack", "*.bin"]
    )
    print("  ✅ SDXL Downloaded.")

    print("\n[3/5] Downloading Inpainting Model (~2 GB)...")
    robust_download(
        repo_id="diffusers/stable-diffusion-xl-1.0-inpainting-0.1",
        allow_patterns=["*.safetensors", "*.json", "*.txt"]
    )
    print("  ✅ Inpainting Model Downloaded.")

    print("\n[4/5] Downloading AnimateDiff Adapter (~1.2 GB)...")
    robust_download(
        repo_id="guoyww/animatediff-motion-adapter-v1-5-2",
        allow_patterns=["*.safetensors", "*.json"]
    )
    print("  ✅ AnimateDiff Downloaded.")

    print("\n[5/5] Downloading Piper TTS Model (~50 MB)...")
    piper_dir = MODELS_DIR / "piper_voices"
    piper_dir.mkdir(exist_ok=True)
    robust_download(
        repo_id="rhasspy/piper-voices",
        filename="en/en_US/lessac/medium/en_US-lessac-medium.onnx",
        local_dir=piper_dir,
        allow_patterns=[]
    )
    robust_download(
        repo_id="rhasspy/piper-voices",
        filename="en/en_US/lessac/medium/en_US-lessac-medium.onnx.json",
        local_dir=piper_dir,
        allow_patterns=[]
    )
    print("  ✅ Piper TTS Downloaded.")

    print("\n" + "="*50)
    print("🎉 ALL MODELS DOWNLOADED SUCCESSFULLY!")
    print("="*50)
    print("The backend will now automatically use the real AI models")
    print("instead of the procedural fallback engines.")
    print("Run the backend: python -m uvicorn backend.main:app")

if __name__ == "__main__":
    install_deps()
    download_models()
