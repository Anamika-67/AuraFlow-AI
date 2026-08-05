# AuraFlow-AI
An end-to-end multimodal AI creative pipeline that generates, edits, animates, and narrates content while leveraging AMD Radeon GPU acceleration through ROCm, ONNX Runtime, and optimized inference.


# 🏗️ System Architecture

```text
                    ┌──────────────────────────────┐
                    │        React Frontend        │
                    │------------------------------│
                    │ • Prompt Interface           │
                    │ • Creative Canvas            │
                    │ • Live Preview               │
                    │ • Project Dashboard          │
                    └──────────────┬───────────────┘
                                   │
                          REST API / WebSocket
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       FastAPI Backend        │
                    │------------------------------│
                    │ • Project Manager            │
                    │ • Pipeline Orchestrator      │
                    │ • Context Engine             │
                    │ • Asset Manager              │
                    └──────────────┬───────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
 ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
 │ Image Generator│      │ Image Editor   │      │ Video Generator│
 │ (SDXL)         │      │ (Inpainting)   │      │ (AnimateDiff)  │
 └────────────────┘      └────────────────┘      └────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │ Text-to-Speech   │
                         │   (Piper TTS)    │
                         └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │ FFmpeg Composer  │
                         └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │ Final Output     │
                         │ MP4 / GIF / WEBM │
                         └──────────────────┘
```

# 🔄 System Flow

```text
User Prompt
      │
      ▼
Prompt Analysis
      │
      ▼
Context Extraction
      │
      ▼
Image Generation
      │
      ▼
Image Editing
      │
      ▼
Video Generation
      │
      ▼
Voice Generation
      │
      ▼
Video Composition
      │
      ▼
Final Preview
      │
      ▼
Download / Export
```

# 🤖 AI Pipeline

```text
                User Prompt
                     │
                     ▼
          Context Intelligence Engine
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
 Subject         Style         Mood & Theme
 Detection      Extraction      Detection
      │              │              │
      └──────────────┼──────────────┘
                     ▼
          Creative Metadata Generation
                     │
                     ▼
      Stable Diffusion XL (Image Generation)
                     │
                     ▼
        Diffusers (Image Editing)
                     │
                     ▼
        AnimateDiff (Video Generation)
                     │
                     ▼
           Piper TTS (Narration)
                     │
                     ▼
        FFmpeg (Video Composition)
                     │
                     ▼
            Final Multimedia Output
```

# 📁 Project Workflow

```text
Create Project
      │
      ▼
Enter Prompt
      │
      ▼
Generate Image
      │
      ▼
Edit Image
      │
      ▼
Generate Video
      │
      ▼
Generate Narration
      │
      ▼
Merge Audio & Video
      │
      ▼
Preview
      │
      ▼
Export
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | FastAPI |
| **Programming Language** | Python |
| **Database** | PostgreSQL |
| **AI Framework** | PyTorch |
| **Image Generation** | Stable Diffusion XL (SDXL) |
| **Image Editing** | Diffusers (Inpainting) |
| **Video Generation** | AnimateDiff |
| **Text-to-Speech** | Piper TTS |
| **Video Processing** | FFmpeg |
| **GPU Acceleration** | AMD ROCm |
| **Deployment** | Render |
| **Version Control** | Git, GitHub |
