# 📊 AuraFlow-AI — Comprehensive Project Analysis Report

> **Analyzed & Updated on:** 2026-08-05  
> **Repository:** [https://github.com/Anamika-67/AuraFlow-AI](https://github.com/Anamika-67/AuraFlow-AI)  
> **Status:** Backend — ✅ Complete | Frontend — ✅ Complete (React + Vite SPA)

---

## 1. 🧠 What Is This Project?

**AuraFlow-AI** (also called *Aura Studio*) is a **context-aware, multimodal AI creative platform** that transforms a simple text prompt into a full multimedia production — including AI-generated images, animated videos, voice narration, and a final composed video export.

It is specifically built and optimized to run on **AMD Radeon GPUs using ROCm** (Radeon Open Compute), leveraging AMD's open-source GPU compute stack as an alternative to NVIDIA CUDA. The platform is designed to demonstrate the full power of AMD GPUs for AI inference workloads.

Think of it as: **"Type a prompt → Get a complete AI-generated video with narration"** — all in one unified pipeline.

---

## 2. ❗ Problem Statement

### 2.1 Fragmented AI Creative Tools
Creators today must use 5–10 different disconnected tools to produce AI multimedia content:
- **Midjourney / DALL-E** for images
- **RunwayML / Pika** for video animation
- **ElevenLabs / Murf** for voice narration
- **FFmpeg / CapCut** for final video editing

There is **no unified pipeline** that takes a single prompt and orchestrates all of these automatically.

### 2.2 NVIDIA Lock-In in AI Tooling
Almost all AI image/video generation tools are built exclusively for **NVIDIA CUDA GPUs**. AMD GPU users:
- Cannot run Stable Diffusion natively without workarounds
- Are locked out of most GPU-accelerated AI inference
- Have no polished, production-ready creative AI platform targeting AMD hardware

### 2.3 No Context Awareness Across Modalities
Existing tools generate each output independently with no shared "style memory" — the outputs feel disconnected. There is no intelligent context propagation from prompt → image → video → audio.

---

## 3. ✅ Solution

AuraFlow-AI solves all three problems with a **unified, context-driven multimodal creative pipeline**:

```
Single Text Prompt
       ↓
Context Intelligence Engine (extracts style, mood, subject)
       ↓
AI Image Generation (SDXL / Stable Diffusion XL via ROCm)
       ↓
AI Image Editing / Inpainting (Diffusers)
       ↓
AI Video Animation (AnimateDiff — image → animated video)
       ↓
AI Voice Narration (Piper TTS — text → speech audio)
       ↓
FFmpeg Multimedia Composer (merge video + audio + subtitles)
       ↓
Final Downloadable MP4 / GIF / WEBM
```

**The key differentiator:** The **Context Intelligence Engine** extracts style, mood, lighting, and color palette from the user's prompt and passes this metadata through every stage — ensuring all outputs are visually and thematically consistent.

---

## 4. 🌟 Full Feature Breakdown

### 4.1 Context Intelligence Engine

| Feature | Details |
|---------|---------|
| Style Detection | Detects 7 visual styles: Cinematic, Cyberpunk, Anime, Fantasy, Photorealistic, 3D Render, Abstract |
| Mood Detection | Detects 7 moods: Futuristic, Mystical, Dark, Epic, Calm, Energetic, Melancholy |
| Subject Extraction | NLP heuristic parsing to identify the main creative subject from prompt |
| Color Palette Generation | Returns thematic hex color sets per detected style |
| Lighting Metadata | Maps style → ideal lighting (e.g., Cyberpunk → Volumetric Neon Lights) |
| TTS Script Seed | Auto-generates a narration sentence from prompt context |
| Project Context Memory | Persists context per project for cross-stage consistency |

**Style Signatures:**
| Style | Lighting | Signature Colors |
|-------|----------|-----------------|
| Cinematic | Dramatic Chiaroscuro | Dark navy, light gray, blue |
| Cyberpunk | Volumetric Neon Lights | Cyan #00F0FF, Pink #FF007F, Purple |
| Anime | Vibrant Soft Glow | Pastel pinks, greens, warm tones |
| Fantasy | Ethereal Bioluminescence | Deep purple, teal, gold |
| Photorealistic | Natural Golden Hour | Warm amber, sunset oranges |
| 3D Render | Studio Softbox Key Light | Indigo, violet, pink |
| Abstract | Ambient Diffusion | Dark slate, sky blue, rose |

---

### 4.2 AI Image Generation Engine

| Feature | Details |
|---------|---------|
| Primary Model | Stable Diffusion XL (SDXL) via HuggingFace Diffusers |
| GPU Acceleration | AMD ROCm (HIP FP16 precision) |
| Resolution | Configurable — default 1024×1024 |
| Inference Steps | Configurable — default 30 steps |
| CFG Scale | Guidance scale control (default 7.5) |
| Seed Control | Reproducible generation with manual seed support |
| Negative Prompt | Configurable negative prompt filtering |
| Fallback Engine | Procedural Canvas Synthesis — radial gradients, light beam overlays, geometric focal elements, grid accents |
| Output Format | PNG, served at `/outputs/{filename}` |

---

### 4.3 AI Image Editing Engine (Inpainting)

| Feature | Details |
|---------|---------|
| Primary Model | Diffusers `AutoPipelineForInpainting` |
| Edit Types via Prompt | Keyword-driven: warm/sunset, neon/cyberpunk/glow, dark/night/shadow, vintage/retro |
| Edit Strength | 0.0–1.0 blend intensity parameter |
| Mask Support | Base64 or mask file input for regional inpainting |
| Fallback Engine | Smart procedural pixel adjustment (color enhancement, gradient blending, contrast) |

---

### 4.4 AI Video Animation Engine

| Feature | Details |
|---------|---------|
| Primary Model | AnimateDiff (Diffusers) |
| Input | Static generated/edited image |
| Motion Types | `zoom_in`, `zoom_out`, `pan_right`, `pan_left`, `tilt_up`, `rotate`, `vortex` |
| Motion Strength | 0.0–1.0 controllable intensity |
| Frame Count | Configurable (default 16 frames) |
| FPS | Configurable (default 8 fps) |
| Glow Pulse Effect | Dynamic frame-by-frame blue light pulse overlay |
| Output Format | Animated GIF (looping) |

---

### 4.5 AI Voice Narration Engine (TTS)

| Feature | Details |
|---------|---------|
| Primary Engine | Piper TTS (local neural TTS binary) |
| Voice Presets | 5 named voice characters (`nova`, `echo`, `onyx`, `shimmer`, `fable`) |
| Speed Control | 0.5–2.0x playback speed |
| Pitch Control | 0.5–2.0x pitch multiplier |
| Output Format | WAV (16-bit PCM, 22050 Hz, Mono) |
| Waveform Data | Returns 30-point waveform visualization array |
| Duration Estimation | ~0.45 seconds per word, adjusted by speed |

---

### 4.6 FFmpeg Multimedia Composer

| Feature | Details |
|---------|---------|
| Input Formats | GIF, MP4, PNG (visual) + WAV (audio) |
| Audio Merge | TTS narration + video (AAC 192kbps) |
| Subtitle Overlay | Text captions burned into video frames |
| Background Music | Toggle to add ambient music track |
| Output Formats | MP4 (H.264, yuv420p), GIF, WEBM |
| MP4 Streaming | `+faststart` flag for web-optimized playback |

---

### 4.7 AMD ROCm GPU Benchmark Dashboard

| Metric | Details |
|--------|---------|
| Real-time VRAM Usage | MB used / MB total, utilization % |
| GPU Utilization % | Live query via PyTorch ROCm/CUDA |
| GPU Temperature | Estimated °C from utilization curve |
| TFLOPS Estimate | Theoretical compute throughput |
| System CPU % | via psutil |
| System RAM | Used / total GB via psutil |
| WebSocket Telemetry | Real-time push via `/ws/telemetry` (1-second interval) |

---

## 5. 🔌 Full API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | System status, GPU info, ROCm status |
| `POST` | `/api/context/extract` | Extract style/mood/subject from prompt |
| `POST` | `/api/image/generate` | Generate AI image (SDXL) |
| `POST` | `/api/image/edit` | Edit image with natural language |
| `POST` | `/api/video/animate` | Animate image into video |
| `POST` | `/api/tts/synthesize` | Generate voice narration |
| `POST` | `/api/composer/render` | Compose final video with audio + subtitles |
| `GET` | `/api/benchmark/telemetry` | GPU/CPU telemetry snapshot |
| `GET` | `/api/benchmark/latency` | Pipeline latency benchmarks |
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create new project |
| `GET` | `/api/projects/{project_id}` | Get project details |
| `WS` | `/ws/telemetry` | Real-time GPU telemetry stream |
| `STATIC` | `/outputs/{filename}` | Serve generated media files |

---

## 6. 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Backend Framework** | FastAPI | REST API + WebSocket server |
| **Backend Language** | Python 3.10+ | Backend logic |
| **AI Framework** | PyTorch + HuggingFace Diffusers | AI model inference |
| **Image Generation** | Stable Diffusion XL (SDXL) | Text-to-image AI |
| **Image Editing** | Diffusers AutoPipelineForInpainting | AI inpainting |
| **Video Generation** | AnimateDiff | Image-to-video animation |
| **Text-to-Speech** | Piper TTS | Local neural speech synthesis |
| **Video Processing** | FFmpeg CLI | Final video composition |
| **GPU Acceleration** | AMD ROCm 6.1 (HIP) | PRIMARY — AMD Radeon GPU compute |
| **Frontend Framework** | React 18 + Vite | Single Page Application UI |
| **Frontend Styling** | Tailwind CSS v4 + Vanilla CSS | Dark theme, glow effects, glassmorphism |
| **State Management** | Zustand | Global pipeline, project & GPU state |
| **Charts & Metrics** | Recharts | GPU utilization history & latency bar charts |
| **Animations** | Framer Motion | Smooth transitions, card entrances, progress indicators |
| **Icons** | Lucide React | Clean icon set |
| **Routing** | React Router DOM v7 | SPA navigation (`/`, `/dashboard`, `/studio`, `/benchmark`) |

---

## 7. 📁 Project File Structure

```
AuraFlow-AI/
├── backend/
│   ├── main.py                  ← FastAPI app, all API routes
│   ├── config.py                ← Hardware detection, paths, CORS
│   ├── requirements.txt         ← Python dependencies
│   └── core/
│       ├── context_engine.py    ← Prompt → style/mood/subject extraction
│       ├── image_engine.py      ← SDXL image generation
│       ├── edit_engine.py       ← Diffusers inpainting/editing
│       ├── video_engine.py      ← AnimateDiff animation
│       ├── tts_engine.py        ← Piper TTS voice synthesis
│       ├── composer.py          ← FFmpeg multimedia composer
│       ├── benchmark.py         ← AMD ROCm GPU telemetry
│       └── project_manager.py   ← Project CRUD + asset management
│
├── frontend/                    ← ✅ NEW: Built React + Vite SPA
│   ├── index.html               ← HTML entry point with Google Fonts
│   ├── package.json             ← React 18, Vite, Tailwind CSS v4, Zustand, Recharts
│   ├── vite.config.js           ← Vite config with API proxy to port 8000
│   └── src/
│       ├── main.jsx             ← Entry script
│       ├── App.jsx              ← React Router setup & global background
│       ├── index.css            ← Design system tokens, glassmorphism, glow utilities
│       ├── api/
│       │   └── auraflow.js      ← Central API service layer & WebSocket handler
│       ├── store/
│       │   └── usePipelineStore.js ← Global Zustand store
│       ├── components/
│       │   ├── Navbar.jsx       ← Top navigation bar with AMD ROCm badge
│       │   ├── PipelineProgress.jsx ← 6-stage step progress indicator
│       │   ├── WaveformVisualizer.jsx ← 30-point audio wave visualizer
│       │   └── GPUGauge.jsx     ← Circular SVG arc gauge component
│       └── pages/
│           ├── Landing.jsx      ← Hero page with interactive feature grid
│           ├── Dashboard.jsx    ← Project list & creation modal
│           ├── Studio.jsx       ← Main 6-stage AI studio with live preview panel
│           └── Benchmark.jsx    ← Real-time GPU telemetry & latency charts
│
├── dist/                        ← Original compiled frontend build
├── README.md
└── LICENSE
```

---

## 8. 🎨 Frontend Architecture & Features (Newly Built)

The React frontend has been built from scratch to provide a state-of-the-art UI experience:

### 8.1 Landing Page (`Landing.jsx`)
- **Hero Section**: Glowing radial ambient background, call-to-action buttons, AMD ROCm badge.
- **Pipeline Step Flow**: 5-step numbered horizontal workflow cards.
- **Feature Grid**: 6 visual cards detailing SDXL, AnimateDiff, Piper TTS, FFmpeg, ROCm, and Context Engine.

### 8.2 Project Dashboard (`Dashboard.jsx`)
- **Project Grid**: Cards displaying project ID, creation date, and asset counters (Images, Videos, Audios, Renders).
- **Creation Modal**: Modal dialog for creating new projects with custom names and descriptions.
- **Store Integration**: Clicking a project binds it to the Zustand state and opens the Creative Studio.

### 8.3 Creative Studio (`Studio.jsx`)
- **Step Progress Indicator**: Interactive top bar highlighting active, completed, and loading stages (0–5).
- **6 Accordion/Card Stage Forms**:
  1. *Context Intelligence*: Prompt input, style preset dropdown, context extraction output.
  2. *SDXL Image Generator*: Negative prompt, inference steps slider, CFG scale slider, seed input.
  3. *Image Editing (Inpainting)*: Edit prompt input, strength slider.
  4. *AnimateDiff Video Animator*: Motion type dropdown (`zoom_in`, `pan_right`, `vortex`, etc.), frame count, FPS slider.
  5. *Piper TTS Narration*: Script text area, voice preset selector (`nova`, `echo`, `onyx`, etc.), speed/pitch sliders, animated waveform visualizer.
  6. *FFmpeg Multimedia Composer*: Subtitle overlay input, format selector (MP4, GIF, WebM), ambient music toggle.
- **Live Preview Panel**: Right-hand column displaying generated PNGs, animated GIFs, audio player with waveform, final rendered video with download buttons, and per-stage latency badges.

### 8.4 AMD ROCm GPU Monitor (`Benchmark.jsx`)
- **Real-Time Telemetry**: Connects via WebSocket (`ws://localhost:8000/ws/telemetry`) with automatic polling fallback.
- **5 Circular SVG Gauges**: GPU Load %, VRAM Use %, GPU Temperature (°C), TFLOPS, CPU Load %.
- **Area Utilization Chart**: Live 60-second Recharts time-series graph tracking GPU Load and VRAM usage.
- **Latency Breakdown Chart**: Horizontal bar chart comparing standard latency per stage (SDXL, Diffusers, AnimateDiff, TTS, FFmpeg).
- **Optimization Badges**: Shows active flags (FP16, xFormers, Flash Attention v2, HIP Graph Acceleration).

---

## 9. ⚙️ How to Run the Full Application

### 1. Run Backend (FastAPI)
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend API available at:* `http://localhost:8000` (Docs at `/docs`)

### 2. Run Frontend (Vite + React)
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (already installed)
npm install

# Start Vite development server
npm run dev
```
*Frontend UI available at:* `http://localhost:5173`

---

## 10. 📊 Final Project Status Summary

| Dimension | Assessment |
|-----------|-----------|
| **Backend Status** | ✅ 100% Complete (FastAPI + 8 Engine Modules + Offline Fallbacks) |
| **Frontend Status** | ✅ 100% Complete (React 18 + Vite SPA with 4 Pages & Dark Theme) |
| **AI Capability** | Full pipeline with graceful fallbacks when model weights are offline |
| **AMD Differentiation** | First-class AMD ROCm GPU support with live telemetry dashboard |
| **Code Quality** | Clean, modular React component hierarchy + Pythonic backend |
| **API Integration** | Complete REST & WebSocket proxy integration between Vite and FastAPI |

---

*Report updated by Antigravity AI | AuraFlow-AI Project Analysis*
