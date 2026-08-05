// Mock dataset for Antigravity Dashboard & AI Execution Canvas
// TODO: Replace with WebSocket subscriptions once backend event stream is live

export const INITIAL_SYSTEM_METRICS = {
  gpuModel: "AMD Radeon RX 7900 XTX",
  rocmVersion: "ROCm 6.1.2",
  vramUsedGB: 18.4,
  vramTotalGB: 24.0,
  gpuUtilPercent: 78,
  temperatureC: 62,
  activeQueueLength: 2,
};

export const MOCK_PROJECTS = [
  {
    id: "proj-8812",
    title: "Neon Cyberpunk Alleyway",
    type: "video",
    prompt: "Cinematic drone fly-through of neon-lit futuristic Tokyo alleyway, rain reflections, 4k 60fps",
    status: "completed",
    createdAt: "10 mins ago",
    thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80",
    metrics: { generationTimeSec: 8.4, vramPeakGB: 19.2, fps: 48 },
  },
  {
    id: "proj-8813",
    title: "Orbital Habitat Concept",
    type: "image",
    prompt: "Massive rotating space station orbiting Saturn with gold solar sails, photo-realistic photogrammetry",
    status: "completed",
    createdAt: "45 mins ago",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    metrics: { generationTimeSec: 4.1, vramPeakGB: 14.8, resolution: "2048x2048" },
  },
  {
    id: "proj-8814",
    title: "Volcanic Landscape Voiceover",
    type: "voice",
    prompt: "Deep documentary voice narration detailing the geothermal activity of Icelandic rift valleys",
    status: "processing",
    createdAt: "Just now",
    thumbnail: null,
    metrics: { generationTimeSec: 2.3, audioDurationSec: 42 },
  },
  {
    id: "proj-8815",
    title: "Biomimetic Architectural Shell",
    type: "image",
    prompt: "Organic lattice museum facade inspired by lily pads, matte white concrete and smart glass",
    status: "queued",
    createdAt: "2 hours ago",
    thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    metrics: { generationTimeSec: 0, vramPeakGB: 0 },
  },
];

export const MOCK_PIPELINE_STEPS = [
  {
    id: "step-1",
    name: "Prompt Analysis & Context Extraction",
    status: "completed",
    durationMs: 420,
    details: "Extracted: Style='Cinematic', Subject='Mecha Titan', Lighting='Volumetric Sunbeams'",
  },
  {
    id: "step-2",
    name: "SDXL Latent Sampling (ROCm Accelerated)",
    status: "completed",
    durationMs: 3800,
    details: "30/30 steps completed using DPM++ 2M Karras sampler",
  },
  {
    id: "step-3",
    name: "AnimateDiff Temporal Interpolation",
    status: "in_progress",
    durationMs: 1400,
    details: "Generating 48 motion frames with 0.8 motion scale...",
  },
  {
    id: "step-4",
    name: "Piper Neural Speech Synthesis",
    status: "pending",
    durationMs: 0,
    details: "Queued for audio track generation",
  },
  {
    id: "step-5",
    name: "FFmpeg Hardware Video Encoding",
    status: "pending",
    durationMs: 0,
    details: "Awaiting upstream frame pipeline completion",
  },
];

export const PRESET_PROMPTS = [
  "Bioluminescent underwater coral metropolis with glowing jelly creatures, 8k render",
  "Futuristic Formula 1 hovercraft racing through desert canyon at sunset, high motion blur",
  "Portrait of an ancient cyborg philosopher surrounded by floating holo-runes, ultra detailed",
  "Serene Scandinavian cabin in pine forest under northern lights, tilt-shift photography",
];
