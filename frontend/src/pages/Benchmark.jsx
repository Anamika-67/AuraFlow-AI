import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from "recharts";
import { Cpu, Thermometer, Zap, MemoryStick, Activity, Monitor, TrendingUp, Gauge } from "lucide-react";
import { getBenchmarkTelemetry, getBenchmarkLatency, createTelemetrySocket } from "../api/auraflow";
import usePipelineStore from "../store/usePipelineStore";
import GPUGauge from "../components/GPUGauge";

const HISTORY_SIZE = 60;

// Custom tooltip for charts
function AuraTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1420", border: "1px solid #1e2d42", borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
      <div style={{ color: "#64748b", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontFamily: "JetBrains Mono, monospace" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </div>
      ))}
    </div>
  );
}

const latencyColors = {
  image_generation_sdxl_ms: "#a855f7",
  image_editing_diffusers_ms: "#ff007f",
  video_animation_animatediff_ms: "#f59e0b",
  voice_narration_piper_ms: "#10b981",
  ffmpeg_composition_ms: "#6366f1",
};

const latencyLabels = {
  image_generation_sdxl_ms: "Image Gen",
  image_editing_diffusers_ms: "Img Edit",
  video_animation_animatediff_ms: "Video Anim",
  voice_narration_piper_ms: "TTS",
  ffmpeg_composition_ms: "FFmpeg",
};

function MetricCard({ label, value, unit, color, icon: Icon }) {
  return (
    <div
      className="glass"
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        border: `1px solid ${color}20`,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: "#4a5568", fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
          {value}<span style={{ fontSize: 12, fontWeight: 500, marginLeft: 3 }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

// Speedup badge component
function SpeedupBadge({ speedup, label }) {
  const color = speedup >= 3 ? "#10b981" : speedup >= 2 ? "#00f0ff" : "#f59e0b";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 999,
      background: `${color}12`, border: `1px solid ${color}30`,
      fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
      color,
    }}>
      <TrendingUp size={13} />
      {speedup.toFixed(1)}× {label}
    </div>
  );
}

export default function Benchmark() {
  const { telemetry, setTelemetry } = usePipelineStore();
  const [history, setHistory] = useState([]);
  const [latency, setLatency] = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting");
  const wsRef = useRef(null);

  useEffect(() => {
    // Load latency benchmarks
    getBenchmarkLatency().then(setLatency).catch(() => {});

    // Try WebSocket first, fall back to polling
    let pollInterval;
    try {
      const ws = createTelemetrySocket((data) => {
        setTelemetry(data);
        setWsStatus("live");
        setHistory((h) => {
          const next = [...h, { ...data, t: new Date().toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) }];
          return next.slice(-HISTORY_SIZE);
        });
      });
      ws.onopen = () => setWsStatus("live");
      ws.onerror = () => {
        setWsStatus("polling");
        startPolling();
      };
      ws.onclose = () => setWsStatus("disconnected");
      wsRef.current = ws;
    } catch {
      setWsStatus("polling");
      startPolling();
    }

    function startPolling() {
      pollInterval = setInterval(() => {
        getBenchmarkTelemetry().then((data) => {
          setTelemetry(data);
          setHistory((h) => {
            const next = [...h, { ...data, t: new Date().toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) }];
            return next.slice(-HISTORY_SIZE);
          });
        }).catch(() => {});
      }, 2000);
    }

    return () => {
      wsRef.current?.close();
      clearInterval(pollInterval);
    };
  }, []);

  const t = telemetry;
  const latencyBarData = latency
    ? Object.entries(latencyLabels).map(([key, name]) => ({
        name,
        ms: latency[key] || 0,
      }))
    : [];

  // Build acceleration comparison data
  const accelComparison = latency?.acceleration_comparison || {};
  const accelBarData = Object.entries(accelComparison).map(([stage, data]) => ({
    name: stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace("Tts", "TTS"),
    cpu: data.cpu_baseline_ms,
    rocm: data.rocm_accelerated_ms,
    speedup: data.speedup_x,
  }));

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            AMD ROCm <span className="gradient-text-aura">GPU Monitor</span>
          </h1>
          <p style={{ fontSize: 13, color: "#4a5568" }}>
            Real-time hardware telemetry and pipeline benchmark analysis
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 999,
            background: wsStatus === "live" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${wsStatus === "live" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            fontSize: 12,
            fontWeight: 700,
            color: wsStatus === "live" ? "#10b981" : "#f59e0b",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: wsStatus === "live" ? "#10b981" : "#f59e0b", display: "inline-block", boxShadow: `0 0 8px ${wsStatus === "live" ? "#10b981" : "#f59e0b"}`, animation: "pulse-ring 2s infinite" }} />
          {wsStatus === "live" ? "LIVE WebSocket" : wsStatus === "polling" ? "POLLING 2s" : "DISCONNECTED"}
        </div>
      </div>

      {/* GPU Name Banner */}
      {t && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass"
          style={{
            padding: "16px 24px",
            borderRadius: 14,
            marginBottom: 24,
            border: "1px solid rgba(237,28,36,0.2)",
            background: "rgba(237,28,36,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Cpu size={20} color="#ed1c24" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#e2e8f0" }}>{t.gpu_name}</div>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "JetBrains Mono, monospace" }}>
                ROCm {t.rocm_version} | {(t.vram_total_mb / 1024).toFixed(0)} GB VRAM{t.gpu_arch && t.gpu_arch !== "N/A" ? ` | ${t.gpu_arch}` : ""}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(t.optimizations || {}).map(([k, v]) => (
              v && (
                <span key={k} style={{ fontSize: 10, background: "#10b98118", border: "1px solid #10b98133", color: "#10b981", padding: "3px 10px", borderRadius: 999, fontFamily: "JetBrains Mono, monospace" }}>
                  {k.replace(/_/g, " ").toUpperCase()}
                </span>
              )
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Gauge Row ──────────────────────────────────────────────────────── */}
      {t && (
        <div
          className="glass"
          style={{
            padding: 28,
            borderRadius: 16,
            marginBottom: 24,
            border: "1px solid #1e2d42",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <GPUGauge value={t.gpu_utilization_pct} label="GPU Load" color="#00f0ff" />
          <GPUGauge value={t.vram_utilization_pct} label="VRAM Use" color="#a855f7" />
          <GPUGauge value={t.gpu_temperature_c} max={100} label="GPU Temp" unit="°C" color="#ff007f" />
          <GPUGauge value={t.estimated_tflops} max={80} label="TFLOPS" unit="T" color="#f59e0b" />
          <GPUGauge value={t.system_cpu_pct} label="CPU Load" color="#10b981" />
        </div>
      )}

      {/* ── Metric Cards ──────────────────────────────────────────────────── */}
      {t && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          <MetricCard label="VRAM Used" value={(t.vram_used_mb / 1024).toFixed(1)} unit="GB" color="#00f0ff" icon={MemoryStick} />
          <MetricCard label="VRAM Total" value={(t.vram_total_mb / 1024).toFixed(1)} unit="GB" color="#a855f7" icon={MemoryStick} />
          <MetricCard label="Power Draw" value={t.power_draw_w?.toFixed(0) || "—"} unit="W" color="#ff007f" icon={Zap} />
          <MetricCard label="RAM Used" value={t.system_ram_used_gb?.toFixed(1)} unit="GB" color="#6366f1" icon={Monitor} />
        </div>
      )}

      {/* ── Live History Chart ────────────────────────────────────────────── */}
      <div className="glass" style={{ borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid #1e2d42" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>
          GPU Utilization History
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vramGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
            <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#374151" }} interval={Math.max(1, Math.floor(history.length / 8))} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#374151" }} unit="%" />
            <Tooltip content={<AuraTooltip />} />
            <Area type="monotone" dataKey="gpu_utilization_pct" name="GPU %" stroke="#00f0ff" fill="url(#gpuGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="vram_utilization_pct" name="VRAM %" stroke="#a855f7" fill="url(#vramGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Acceleration Comparison Chart (NEW) ────────────────────────────── */}
      {accelBarData.length > 0 && (
        <div className="glass" style={{ borderRadius: 16, padding: 24, marginBottom: 24, border: "1px solid #1e2d42" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
              CPU vs AMD ROCm Acceleration
            </h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {accelBarData.map((d) => (
                <SpeedupBadge key={d.name} speedup={d.speedup} label={d.name.split(" ")[0]} />
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={accelBarData} margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 9, fill: "#374151" }} unit="ms" />
              <Tooltip content={<AuraTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#64748b" }}
                formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>}
              />
              <Bar dataKey="cpu" name="CPU Baseline" fill="#374151" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="rocm" name="ROCm FP16 + Compile" fill="#00f0ff" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Pipeline Latency Benchmarks ───────────────────────────────────── */}
      {latency && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="glass" style={{ borderRadius: 16, padding: 24, border: "1px solid #1e2d42" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>
              Pipeline Stage Latency
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={latencyBarData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: "#374151" }} unit="ms" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} width={75} />
                <Tooltip content={<AuraTooltip />} />
                <Bar dataKey="ms" radius={4}>
                  {latencyBarData.map((entry, i) => (
                    <Cell key={i} fill={Object.values(latencyColors)[i] || "#00f0ff"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="glass" style={{ borderRadius: 16, padding: 24, border: "1px solid #1e2d42" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>
              Performance Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Total Pipeline Latency", value: `${(latency.total_pipeline_latency_ms / 1000).toFixed(2)}s`, color: "#00f0ff" },
                { label: "Animation FPS", value: `${latency.fps_during_animation}`, color: "#a855f7" },
                { label: "Model Load Time", value: `${latency.model_load_time_sec}s`, color: "#f59e0b" },
                { label: "Image Gen (SDXL)", value: `${latency.image_generation_sdxl_ms}ms`, color: "#a855f7" },
                { label: "Video Anim (AnimateDiff)", value: `${latency.video_animation_animatediff_ms}ms`, color: "#f59e0b" },
                { label: "TTS (Piper)", value: `${latency.voice_narration_piper_ms}ms`, color: "#10b981" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Active optimizations summary */}
            {latency.active_optimizations && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1e2d42" }}>
                <div style={{ fontSize: 11, color: "#4a5568", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  Active Optimizations
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(latency.active_optimizations).map(([k, v]) => (
                    <span
                      key={k}
                      style={{
                        fontSize: 9,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontFamily: "JetBrains Mono, monospace",
                        background: v ? "#10b98112" : "#37415112",
                        border: `1px solid ${v ? "#10b98130" : "#37415130"}`,
                        color: v ? "#10b981" : "#374151",
                      }}
                    >
                      {v ? "✓" : "✗"} {k.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offline state */}
      {!t && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#374151" }}>
          <Activity size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>Connecting to backend... Make sure FastAPI is running on localhost:8000</p>
        </div>
      )}
    </div>
  );
}
