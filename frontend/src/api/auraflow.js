const BASE_URL = "http://localhost:8000";

// ─── Helper ──────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── System ───────────────────────────────────────────────────────────────────
export const getSystemStatus = () => apiFetch("/");

// ─── Context Engine ───────────────────────────────────────────────────────────
export const extractContext = (prompt, project_id = null) =>
  apiFetch("/api/context/extract", {
    method: "POST",
    body: JSON.stringify({ prompt, project_id }),
  });

// ─── Image Generation ─────────────────────────────────────────────────────────
export const generateImage = (params) =>
  apiFetch("/api/image/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });

// ─── Image Editing ────────────────────────────────────────────────────────────
export const editImage = (params) =>
  apiFetch("/api/image/edit", {
    method: "POST",
    body: JSON.stringify(params),
  });

// ─── Video Animation ──────────────────────────────────────────────────────────
export const animateVideo = (params) =>
  apiFetch("/api/video/animate", {
    method: "POST",
    body: JSON.stringify(params),
  });

// ─── TTS Narration ────────────────────────────────────────────────────────────
export const synthesizeTTS = (params) =>
  apiFetch("/api/tts/synthesize", {
    method: "POST",
    body: JSON.stringify(params),
  });

// ─── Composer ─────────────────────────────────────────────────────────────────
export const composeRender = (params) =>
  apiFetch("/api/composer/render", {
    method: "POST",
    body: JSON.stringify(params),
  });

// ─── Benchmark ────────────────────────────────────────────────────────────────
export const getBenchmarkTelemetry = () => apiFetch("/api/benchmark/telemetry");
export const getBenchmarkLatency = () => apiFetch("/api/benchmark/latency");

// ─── Projects ─────────────────────────────────────────────────────────────────
export const listProjects = () => apiFetch("/api/projects");
export const createProject = (name, description = "") =>
  apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
export const getProject = (id) => apiFetch(`/api/projects/${id}`);

// ─── WebSocket Telemetry ──────────────────────────────────────────────────────
export const createTelemetrySocket = (onMessage) => {
  const ws = new WebSocket(`ws://localhost:8000/ws/telemetry`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onerror = () => {};
  return ws;
};

// ─── Media URL Helper ─────────────────────────────────────────────────────────
export const mediaUrl = (path) => `${BASE_URL}${path}`;
