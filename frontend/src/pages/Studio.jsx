import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Image, Pencil, Film, Mic2, Layers, Download,
  Loader2, ChevronRight, AlertCircle, CheckCircle2, Play, RefreshCw
} from "lucide-react";
import {
  extractContext, generateImage, editImage, animateVideo,
  synthesizeTTS, composeRender, mediaUrl
} from "../api/auraflow";
import usePipelineStore from "../store/usePipelineStore";
import PipelineProgress from "../components/PipelineProgress";
import WaveformVisualizer from "../components/WaveformVisualizer";

// ── Shared Card Shell ─────────────────────────────────────────────────────────
function StageCard({ title, icon: Icon, color, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass"
      style={{
        borderRadius: 16,
        border: `1px solid ${color}20`,
        overflow: "hidden",
        boxShadow: `0 4px 24px ${color}10`,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${color}18`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: `${color}08`,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </motion.div>
  );
}

// ── Error Alert ───────────────────────────────────────────────────────────────
function ErrorAlert({ msg, onClose }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: 8,
        background: "rgba(255,0,127,0.08)",
        border: "1px solid rgba(255,0,127,0.25)",
        fontSize: 13,
        color: "#ff6b9d",
        marginTop: 12,
      }}
    >
      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#ff6b9d", cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  );
}

// ── Success Badge ─────────────────────────────────────────────────────────────
function LatencyBadge({ ms }) {
  return (
    <span className="latency-badge">
      {ms ? `${ms} ms` : ""}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Studio() {
  const navigate = useNavigate();
  const {
    project, context, image, editedImage, video, audio, render,
    setContext, setImage, setEditedImage, setVideo, setAudio, setRender,
    activeStep, setActiveStep,
    loading, errors, setLoading, setError, clearError,
  } = usePipelineStore();

  // ── Local form state ───────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic Realism");
  const [negPrompt, setNegPrompt] = useState("blurry, low quality, distorted");
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState(-1);
  const [editPrompt, setEditPrompt] = useState("");
  const [editStrength, setEditStrength] = useState(0.75);
  const [motionType, setMotionType] = useState("zoom_in");
  const [motionStrength, setMotionStrength] = useState(0.5);
  const [numFrames, setNumFrames] = useState(16);
  const [fps, setFps] = useState(8);
  const [ttsText, setTtsText] = useState("");
  const [voiceId, setVoiceId] = useState("nova");
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [subtitles, setSubtitles] = useState("");
  const [exportFormat, setExportFormat] = useState("mp4");
  const [addMusic, setAddMusic] = useState(true);

  const pid = project?.id || null;
  const completedSteps = [
    context ? 0 : null, image ? 1 : null, editedImage ? 2 : null,
    video ? 3 : null, audio ? 4 : null, render ? 5 : null,
  ].filter((x) => x !== null);

  // ── Stage Handlers ─────────────────────────────────────────────────────────

  async function handleExtractContext() {
    if (!prompt.trim()) return;
    setLoading("context", true); clearError("context");
    try {
      const ctx = await extractContext(prompt.trim(), pid);
      setContext(ctx);
      if (ctx.suggested_narration) setTtsText(ctx.suggested_narration);
      setActiveStep(1);
    } catch (e) { setError("context", e.message); }
    finally { setLoading("context", false); }
  }

  async function handleGenerateImage() {
    if (!prompt.trim()) return;
    setLoading("image", true); clearError("image");
    try {
      const res = await generateImage({
        prompt: context?.prompt || prompt,
        negative_prompt: negPrompt,
        width: 1024, height: 1024,
        steps, cfg_scale: cfgScale,
        seed: seed < 0 ? null : seed,
        style: context?.style || style,
        project_id: pid,
      });
      setImage(res);
      setActiveStep(2);
    } catch (e) { setError("image", e.message); }
    finally { setLoading("image", false); }
  }

  async function handleEditImage() {
    const srcPath = image?.filepath;
    if (!srcPath || !editPrompt.trim()) return;
    setLoading("edit", true); clearError("edit");
    try {
      const res = await editImage({ image_path: srcPath, edit_prompt: editPrompt, strength: editStrength, project_id: pid });
      setEditedImage(res);
      setActiveStep(3);
    } catch (e) { setError("edit", e.message); }
    finally { setLoading("edit", false); }
  }

  async function handleAnimate() {
    const srcPath = (editedImage || image)?.filepath;
    if (!srcPath) return;
    setLoading("video", true); clearError("video");
    try {
      const res = await animateVideo({ image_path: srcPath, motion_type: motionType, motion_strength: motionStrength, num_frames: numFrames, fps, project_id: pid });
      setVideo(res);
      setActiveStep(4);
    } catch (e) { setError("video", e.message); }
    finally { setLoading("video", false); }
  }

  async function handleTTS() {
    if (!ttsText.trim()) return;
    setLoading("tts", true); clearError("tts");
    try {
      const res = await synthesizeTTS({ text: ttsText, voice_id: voiceId, speed: ttsSpeed, pitch: ttsPitch, project_id: pid });
      setAudio(res);
      setActiveStep(5);
    } catch (e) { setError("tts", e.message); }
    finally { setLoading("tts", false); }
  }

  async function handleCompose() {
    const visualPath = video?.filepath || (editedImage || image)?.filepath;
    if (!visualPath) return;
    setLoading("compose", true); clearError("compose");
    try {
      const res = await composeRender({
        visual_path: visualPath,
        audio_path: audio?.filepath || null,
        subtitle_text: subtitles || null,
        add_music: addMusic,
        format: exportFormat,
        project_id: pid,
      });
      setRender(res);
    } catch (e) { setError("compose", e.message); }
    finally { setLoading("compose", false); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", paddingTop: 64, display: "flex", flexDirection: "column" }}>
      {/* Pipeline Progress Bar */}
      <PipelineProgress
        activeStep={activeStep}
        completedSteps={completedSteps}
        loadingStep={
          loading.context ? 0 : loading.image ? 1 : loading.edit ? 2 :
          loading.video ? 3 : loading.tts ? 4 : loading.compose ? 5 : null
        }
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", height: "calc(100vh - 64px - 90px)", overflow: "hidden" }}>
        {/* ── Left: Pipeline Stages ──────────────────────────────────────── */}
        <div style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Project Banner */}
          {!project && (
            <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, fontSize: 12, color: "#d97706", display: "flex", gap: 8, alignItems: "center" }}>
              <AlertCircle size={14} />
              No project selected. Go to <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#00f0ff", cursor: "pointer", fontSize: 12, textDecoration: "underline", padding: 0 }}>Projects</button> to create one, or continue without a project.
            </div>
          )}

          {/* ── Stage 1: Context ──────────────────────────────────────────── */}
          <StageCard title="1. Context Intelligence" icon={Sparkles} color="#00f0ff">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>CREATIVE PROMPT</label>
                <textarea
                  className="aura-input"
                  rows={3}
                  placeholder="Describe your vision... e.g., 'A cyberpunk city at night with glowing neon lights'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>STYLE PRESET</label>
                  <select className="aura-input" value={style} onChange={(e) => setStyle(e.target.value)}>
                    {["Cinematic Realism","Cyberpunk Neon","Japanese Anime Studio","Dark High Fantasy","Ultra Photorealistic","Octane 3D Render","Minimalist Abstract"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn-aura btn-primary" onClick={handleExtractContext} disabled={loading.context || !prompt.trim()}>
                {loading.context ? <span className="spinner" /> : <Sparkles size={14} />}
                {loading.context ? "Extracting..." : "Extract Context"}
              </button>
              {errors.context && <ErrorAlert msg={errors.context} onClose={() => clearError("context")} />}

              {/* Context result */}
              {context && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0d1420", borderRadius: 10, padding: 14, border: "1px solid #00f0ff22" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                    {[
                      { label: "Style", value: context.style, color: "#00f0ff" },
                      { label: "Mood", value: context.mood, color: "#a855f7" },
                      { label: "Lighting", value: context.lighting, color: "#f59e0b" },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: `${color}12`, border: `1px solid ${color}22`, borderRadius: 6, padding: "4px 10px" }}>
                        <span style={{ fontSize: 9, color: "#4a5568", display: "block" }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {context.color_palette?.map((c) => (
                      <div key={c} style={{ width: 20, height: 20, borderRadius: 4, background: c, border: "1px solid #1e2d42" }} title={c} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>"{context.suggested_narration}"</p>
                </motion.div>
              )}
            </div>
          </StageCard>

          {/* ── Stage 2: Image Generation ─────────────────────────────────── */}
          <StageCard title="2. AI Image Generation (SDXL)" icon={Image} color="#a855f7">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>NEGATIVE PROMPT</label>
                <input className="aura-input" value={negPrompt} onChange={(e) => setNegPrompt(e.target.value)} placeholder="blurry, low quality..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>STEPS: {steps}</label>
                  <input type="range" min={10} max={50} value={steps} onChange={(e) => setSteps(+e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>CFG SCALE: {cfgScale}</label>
                  <input type="range" min={1} max={20} step={0.5} value={cfgScale} onChange={(e) => setCfgScale(+e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>SEED (-1 = random)</label>
                <input className="aura-input" type="number" value={seed} onChange={(e) => setSeed(+e.target.value)} />
              </div>
              <button className="btn-aura btn-primary" onClick={handleGenerateImage} disabled={loading.image || !prompt.trim()} style={{ background: "linear-gradient(135deg, #a855f7, #7b00ff)" }}>
                {loading.image ? <span className="spinner" /> : <Image size={14} />}
                {loading.image ? "Generating..." : "Generate Image"}
              </button>
              {errors.image && <ErrorAlert msg={errors.image} onClose={() => clearError("image")} />}
            </div>
          </StageCard>

          {/* ── Stage 3: Image Edit ───────────────────────────────────────── */}
          <StageCard title="3. AI Image Editing (Inpainting)" icon={Pencil} color="#ff007f">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!image && <p style={{ fontSize: 12, color: "#4a5568" }}>Generate an image first to enable editing.</p>}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>EDIT PROMPT</label>
                <input className="aura-input" placeholder="e.g., add neon glow, make it darker, add sunset colors" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} disabled={!image} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>STRENGTH: {editStrength}</label>
                <input type="range" min={0.1} max={1} step={0.05} value={editStrength} onChange={(e) => setEditStrength(+e.target.value)} disabled={!image} />
              </div>
              <button className="btn-aura btn-primary" onClick={handleEditImage} disabled={loading.edit || !image || !editPrompt.trim()} style={{ background: "linear-gradient(135deg, #ff007f, #ff4444)" }}>
                {loading.edit ? <span className="spinner" /> : <Pencil size={14} />}
                {loading.edit ? "Editing..." : "Apply AI Edit"}
              </button>
              {errors.edit && <ErrorAlert msg={errors.edit} onClose={() => clearError("edit")} />}
            </div>
          </StageCard>

          {/* ── Stage 4: Video Animation ──────────────────────────────────── */}
          <StageCard title="4. Video Animation (AnimateDiff)" icon={Film} color="#f59e0b">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!image && <p style={{ fontSize: 12, color: "#4a5568" }}>Generate an image first to animate it.</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>MOTION TYPE</label>
                  <select className="aura-input" value={motionType} onChange={(e) => setMotionType(e.target.value)} disabled={!image}>
                    {["zoom_in","zoom_out","pan_right","pan_left","tilt_up","rotate","vortex"].map(m => (
                      <option key={m} value={m}>{m.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>FRAMES: {numFrames}</label>
                  <input type="range" min={8} max={32} value={numFrames} onChange={(e) => setNumFrames(+e.target.value)} disabled={!image} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>STRENGTH: {motionStrength}</label>
                  <input type="range" min={0.1} max={1} step={0.1} value={motionStrength} onChange={(e) => setMotionStrength(+e.target.value)} disabled={!image} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>FPS: {fps}</label>
                  <input type="range" min={4} max={24} value={fps} onChange={(e) => setFps(+e.target.value)} disabled={!image} />
                </div>
              </div>
              <button className="btn-aura btn-primary" onClick={handleAnimate} disabled={loading.video || !image} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                {loading.video ? <span className="spinner" /> : <Film size={14} />}
                {loading.video ? "Animating..." : "Animate Video"}
              </button>
              {errors.video && <ErrorAlert msg={errors.video} onClose={() => clearError("video")} />}
            </div>
          </StageCard>

          {/* ── Stage 5: TTS Narration ────────────────────────────────────── */}
          <StageCard title="5. Voice Narration (Piper TTS)" icon={Mic2} color="#10b981">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>NARRATION TEXT</label>
                <textarea className="aura-input" rows={3} placeholder="Narration script..." value={ttsText} onChange={(e) => setTtsText(e.target.value)} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>VOICE</label>
                  <select className="aura-input" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                    {[["nova","Nova (Warm)"],["echo","Echo (Cinematic)"],["onyx","Onyx (Authority)"],["shimmer","Shimmer (Expressive)"],["fable","Fable (Mystical)"]].map(([v,l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>SPEED: {ttsSpeed.toFixed(1)}x</label>
                  <input type="range" min={0.5} max={2} step={0.1} value={ttsSpeed} onChange={(e) => setTtsSpeed(+e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>PITCH: {ttsPitch.toFixed(1)}</label>
                <input type="range" min={0.5} max={2} step={0.1} value={ttsPitch} onChange={(e) => setTtsPitch(+e.target.value)} />
              </div>
              <button className="btn-aura btn-primary" onClick={handleTTS} disabled={loading.tts || !ttsText.trim()} style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                {loading.tts ? <span className="spinner" /> : <Mic2 size={14} />}
                {loading.tts ? "Synthesizing..." : "Generate Narration"}
              </button>
              {errors.tts && <ErrorAlert msg={errors.tts} onClose={() => clearError("tts")} />}
              {audio && <WaveformVisualizer data={audio.waveform} color="#10b981" />}
            </div>
          </StageCard>

          {/* ── Stage 6: Compose ──────────────────────────────────────────── */}
          <StageCard title="6. Compose & Export (FFmpeg)" icon={Layers} color="#6366f1">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!image && !video && <p style={{ fontSize: 12, color: "#4a5568" }}>Generate an image or video first.</p>}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>SUBTITLE TEXT (optional)</label>
                <input className="aura-input" placeholder="Add captions to the final video..." value={subtitles} onChange={(e) => setSubtitles(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>FORMAT</label>
                  <select className="aura-input" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="gif">Animated GIF</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>BG MUSIC</label>
                  <button
                    onClick={() => setAddMusic(!addMusic)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: `1px solid ${addMusic ? "#10b98133" : "#1e2d42"}`,
                      background: addMusic ? "#10b98118" : "#1e2d42",
                      color: addMusic ? "#10b981" : "#64748b",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 12,
                      flex: 1,
                      marginTop: 4,
                    }}
                  >
                    {addMusic ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
              <button className="btn-aura btn-primary" onClick={handleCompose} disabled={loading.compose || (!image && !video)} style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                {loading.compose ? <span className="spinner" /> : <Layers size={14} />}
                {loading.compose ? "Rendering..." : "Render Final Output"}
              </button>
              {errors.compose && <ErrorAlert msg={errors.compose} onClose={() => clearError("compose")} />}
            </div>
          </StageCard>
        </div>

        {/* ── Right: Live Preview Panel ──────────────────────────────────── */}
        <div
          style={{
            borderLeft: "1px solid #1e2d42",
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "#080c14",
          }}
        >
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#4a5568", letterSpacing: 2, textTransform: "uppercase" }}>
            Live Preview
          </h2>

          {/* Render (final) */}
          {render && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0d1420", borderRadius: 12, overflow: "hidden", border: "1px solid #6366f133" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2d42", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6366f1" }}>FINAL RENDER</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <LatencyBadge ms={render.latency_ms} />
                  <a href={mediaUrl(render.url)} download style={{ textDecoration: "none" }}>
                    <button className="btn-aura btn-primary" style={{ padding: "4px 10px", fontSize: 11 }}>
                      <Download size={12} /> Download
                    </button>
                  </a>
                </div>
              </div>
              <div style={{ padding: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, background: "#1e2d42", padding: "2px 8px", borderRadius: 999, color: "#64748b" }}>{render.format.toUpperCase()}</span>
                {render.has_narration && <span style={{ fontSize: 10, background: "#10b98122", padding: "2px 8px", borderRadius: 999, color: "#10b981" }}>With Audio</span>}
                {render.has_subtitles && <span style={{ fontSize: 10, background: "#f59e0b22", padding: "2px 8px", borderRadius: 999, color: "#f59e0b" }}>With Subtitles</span>}
              </div>
            </motion.div>
          )}

          {/* Video Preview */}
          {video && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0d1420", borderRadius: 12, overflow: "hidden", border: "1px solid #f59e0b22" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2d42", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b" }}>VIDEO</span>
                <LatencyBadge ms={video.latency_ms} />
              </div>
              <img src={mediaUrl(video.gif_url)} alt="Animated video" style={{ width: "100%", display: "block" }} />
              <div style={{ padding: "8px 12px", fontSize: 10, color: "#4a5568", fontFamily: "JetBrains Mono, monospace" }}>
                {video.num_frames}f @ {video.fps}fps — {video.duration_sec}s — {video.motion_type}
              </div>
            </motion.div>
          )}

          {/* Edited Image */}
          {editedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0d1420", borderRadius: 12, overflow: "hidden", border: "1px solid #ff007f22" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2d42", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#ff007f" }}>EDITED IMAGE</span>
                <LatencyBadge ms={editedImage.latency_ms} />
              </div>
              <img src={mediaUrl(editedImage.url)} alt="Edited" style={{ width: "100%", display: "block" }} />
            </motion.div>
          )}

          {/* Generated Image */}
          {image && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0d1420", borderRadius: 12, overflow: "hidden", border: "1px solid #a855f722" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2d42", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#a855f7" }}>GENERATED IMAGE</span>
                <LatencyBadge ms={image.latency_ms} />
              </div>
              <img src={mediaUrl(image.url)} alt="Generated" style={{ width: "100%", display: "block" }} />
              <div style={{ padding: "8px 12px", fontSize: 10, color: "#4a5568", fontFamily: "JetBrains Mono, monospace" }}>
                Seed: {image.seed} | Steps: {image.steps} | CFG: {image.cfg_scale}
              </div>
            </motion.div>
          )}

          {/* Audio Player */}
          {audio && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0d1420", borderRadius: 12, overflow: "hidden", border: "1px solid #10b98122" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2d42", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#10b981" }}>NARRATION</span>
                <LatencyBadge ms={audio.latency_ms} />
              </div>
              <div style={{ padding: 12 }}>
                <WaveformVisualizer data={audio.waveform} color="#10b981" height={48} />
                <div style={{ marginTop: 10, fontSize: 10, color: "#4a5568", fontFamily: "JetBrains Mono, monospace" }}>
                  {audio.voice_name} | {audio.duration_sec}s | {audio.speed}x speed
                </div>
                <audio controls src={mediaUrl(audio.url)} style={{ width: "100%", marginTop: 8 }} />
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!image && !video && !audio && !render && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, opacity: 0.4, paddingTop: 60 }}>
              <Play size={40} color="#1e2d42" />
              <span style={{ fontSize: 12, color: "#374151", textAlign: "center" }}>
                Run the pipeline to see your AI creations here
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
