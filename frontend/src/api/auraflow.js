const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL !== undefined) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In development, if running via Vite dev server without proxy override
  if (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "5173") {
    return "http://localhost:8000";
  }
  // Default to relative path (works with Nginx proxy in production)
  return "";
};

const BASE_URL = getApiBaseUrl();

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
  let wsUrl;
  if (import.meta.env.VITE_WS_BASE_URL) {
    wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/telemetry`;
  } else if (BASE_URL.startsWith("http")) {
    const wsProto = BASE_URL.startsWith("https") ? "wss://" : "ws://";
    const host = BASE_URL.replace(/^https?:\/\//, "");
    wsUrl = `${wsProto}${host}/ws/telemetry`;
  } else {
    const wsProto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss://" : "ws://";
    const host = typeof window !== "undefined" ? window.location.host : "localhost:8000";
    wsUrl = `${wsProto}${host}/ws/telemetry`;
  }

  const ws = new WebSocket(wsUrl);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  ws.onerror = () => {};
  return ws;
};

// ─── Media URL Helper ─────────────────────────────────────────────────────────
export const mediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path}`;
};

