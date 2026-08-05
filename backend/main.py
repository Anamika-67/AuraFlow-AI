import os
import time
import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from backend.config import OUTPUTS_DIR, ALLOWED_ORIGINS, GPU_NAME, ROCM_AVAILABLE
from backend.core.context_engine import context_engine
from backend.core.image_engine import image_engine
from backend.core.edit_engine import edit_engine
from backend.core.video_engine import video_engine
from backend.core.tts_engine import tts_engine
from backend.core.composer import composer
from backend.core.benchmark import benchmark_monitor
from backend.core.project_manager import project_manager

app = FastAPI(
    title="Aura Studio API",
    description="Multimodal AI Creative Pipeline accelerated by AMD ROCm",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount outputs directory to serve generated files
app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

# --- Pydantic Request Models ---
class ContextExtractRequest(BaseModel):
    prompt: str
    project_id: Optional[str] = None

class ImageGenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "blurry, low resolution, distorted"
    width: Optional[int] = 1024
    height: Optional[int] = 1024
    steps: Optional[int] = 30
    cfg_scale: Optional[float] = 7.5
    seed: Optional[int] = None
    style: Optional[str] = "Cinematic Realism"
    project_id: Optional[str] = None

class ImageEditRequest(BaseModel):
    image_path: str
    edit_prompt: str
    strength: Optional[float] = 0.75
    project_id: Optional[str] = None

class VideoAnimateRequest(BaseModel):
    image_path: str
    motion_type: Optional[str] = "zoom_in"
    motion_strength: Optional[float] = 0.5
    num_frames: Optional[int] = 16
    fps: Optional[int] = 8
    project_id: Optional[str] = None

class TTSSynthesizeRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "nova"
    speed: Optional[float] = 1.0
    pitch: Optional[float] = 1.0
    project_id: Optional[str] = None

class ComposeRequest(BaseModel):
    visual_path: str
    audio_path: Optional[str] = None
    subtitle_text: Optional[str] = None
    add_music: Optional[bool] = True
    format: Optional[str] = "mp4"
    project_id: Optional[str] = None

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = ""


# --- API Routes ---

@app.get("/")
def read_root():
    return {
        "app": "Aura Studio - Multimodal Creative Pipeline",
        "status": "ONLINE",
        "gpu": GPU_NAME,
        "rocm_accelerated": ROCM_AVAILABLE,
        "docs_url": "/docs"
    }

# 1. Context Engine
@app.post("/api/context/extract")
def extract_context(req: ContextExtractRequest):
    context = context_engine.extract_context(req.prompt, req.project_id)
    if req.project_id:
        proj = project_manager.get_project(req.project_id)
        if proj:
            proj["context"] = context
            project_manager.save_project(proj)
    return context

# 2. Text-to-Image Generation (SDXL)
@app.post("/api/image/generate")
def generate_image(req: ImageGenerateRequest):
    try:
        res = image_engine.generate_image(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            width=req.width,
            height=req.height,
            steps=req.steps,
            cfg_scale=req.cfg_scale,
            seed=req.seed,
            style=req.style
        )
        benchmark_monitor.record_stage_latency("image_generation", res["latency_ms"])
        if req.project_id:
            project_manager.add_asset(req.project_id, "images", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Image Editing / Inpainting
@app.post("/api/image/edit")
def edit_image(req: ImageEditRequest):
    try:
        res = edit_engine.edit_image(
            base_image_path=req.image_path,
            edit_prompt=req.edit_prompt,
            strength=req.strength
        )
        benchmark_monitor.record_stage_latency("image_editing", res["latency_ms"])
        if req.project_id:
            project_manager.add_asset(req.project_id, "edited_images", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Image-to-Video Animation (AnimateDiff)
@app.post("/api/video/animate")
def animate_video(req: VideoAnimateRequest):
    try:
        res = video_engine.animate_image(
            source_image_path=req.image_path,
            motion_type=req.motion_type,
            motion_strength=req.motion_strength,
            num_frames=req.num_frames,
            fps=req.fps
        )
        benchmark_monitor.record_stage_latency("video_animation", res["latency_ms"])
        if req.project_id:
            project_manager.add_asset(req.project_id, "videos", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Text-to-Speech Narration (Piper TTS)
@app.post("/api/tts/synthesize")
def synthesize_tts(req: TTSSynthesizeRequest):
    try:
        res = tts_engine.generate_narration(
            text=req.text,
            voice_id=req.voice_id,
            speed=req.speed,
            pitch=req.pitch
        )
        benchmark_monitor.record_stage_latency("tts_narration", res["latency_ms"])
        if req.project_id:
            project_manager.add_asset(req.project_id, "audios", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. FFmpeg Multimedia Composer
@app.post("/api/composer/render")
def render_multimedia(req: ComposeRequest):
    try:
        res = composer.compose_multimedia(
            video_or_image_path=req.visual_path,
            audio_narration_path=req.audio_path,
            subtitle_text=req.subtitle_text,
            add_background_music=req.add_music,
            output_format=req.format
        )
        benchmark_monitor.record_stage_latency("multimedia_render", res["latency_ms"])
        if req.project_id:
            project_manager.add_asset(req.project_id, "renders", res)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7. AMD ROCm GPU Benchmark Dashboard API
@app.get("/api/benchmark/telemetry")
def get_benchmark_telemetry():
    return benchmark_monitor.get_telemetry()

@app.get("/api/benchmark/latency")
def get_benchmark_latency():
    return benchmark_monitor.get_latency_breakdown()

# 8. Project Management API
@app.get("/api/projects")
def list_projects():
    return project_manager.list_projects()

@app.post("/api/projects")
def create_project(req: CreateProjectRequest):
    return project_manager.create_project(name=req.name, description=req.description)

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    proj = project_manager.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

# WebSocket for real-time ROCm telemetry feeds
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = benchmark_monitor.get_telemetry()
            await websocket.send_json(data)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
