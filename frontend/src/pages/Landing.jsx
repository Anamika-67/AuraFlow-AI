import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Image, Film, Mic2, Layers, Cpu, ArrowRight, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Image,
    color: "#00f0ff",
    title: "AI Image Generation",
    desc: "Stable Diffusion XL generates stunning 1024px images from any text prompt, with 7 artistic style presets.",
  },
  {
    icon: Film,
    color: "#a855f7",
    title: "Video Animation",
    desc: "AnimateDiff brings your images to life with zoom, pan, tilt, and vortex motion — creating smooth animated GIFs.",
  },
  {
    icon: Mic2,
    color: "#ff007f",
    title: "AI Voice Narration",
    desc: "Piper TTS synthesizes cinematic voiceovers with 5 custom voice characters and pitch/speed control.",
  },
  {
    icon: Layers,
    color: "#f59e0b",
    title: "FFmpeg Composer",
    desc: "Merges animated visuals, voice narration, and subtitles into a final broadcast-ready MP4 export.",
  },
  {
    icon: Cpu,
    color: "#10b981",
    title: "AMD ROCm Accelerated",
    desc: "First-class AMD Radeon GPU support via ROCm 6.1 with real-time HIP telemetry and FP16 inference.",
  },
  {
    icon: Zap,
    color: "#00f0ff",
    title: "Context Intelligence",
    desc: "Automatically extracts style, mood, lighting and color palette from your prompt to unify every output.",
  },
];

const pipelineSteps = [
  { num: "01", label: "Write Prompt", color: "#00f0ff" },
  { num: "02", label: "Generate Image", color: "#a855f7" },
  { num: "03", label: "Animate Video", color: "#ff007f" },
  { num: "04", label: "Add Narration", color: "#f59e0b" },
  { num: "05", label: "Export MP4", color: "#10b981" },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 64 }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#1e2d4218 1px, transparent 1px), linear-gradient(90deg, #1e2d4218 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, #00f0ff12, transparent 70%)",
            top: "10%",
            left: "20%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, #7b00ff10, transparent 70%)",
            bottom: "20%",
            right: "15%",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: "relative", zIndex: 1, maxWidth: 800 }}
        >
          {/* AMD Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: "rgba(237,28,36,0.1)",
              border: "1px solid rgba(237,28,36,0.3)",
              fontSize: 12,
              fontWeight: 700,
              color: "#ff6b35",
              letterSpacing: 2,
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: 24,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ed1c24", display: "inline-block", boxShadow: "0 0 8px #ed1c24" }} />
            POWERED BY AMD ROCm 6.1
          </motion.div>

          <h1
            style={{
              fontSize: "clamp(42px, 6vw, 80px)",
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 24,
              letterSpacing: -2,
            }}
          >
            <span className="gradient-text-aura">Transform Ideas</span>
            <br />
            <span style={{ color: "#e2e8f0" }}>Into AI Masterpieces</span>
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#64748b",
              maxWidth: 580,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            A context-aware multimodal AI studio — generate images, animate videos, and synthesize voice narration from a single prompt, accelerated by AMD Radeon GPUs.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/studio" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-aura btn-primary"
                style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}
              >
                <Zap size={18} />
                Launch Studio
              </motion.button>
            </Link>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-aura btn-secondary"
                style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}
              >
                View Projects
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Pipeline Flow ─────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            One Prompt. <span className="gradient-text-aura">Full Pipeline.</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: 15 }}>Five intelligent stages, zero manual stitching.</p>
        </motion.div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            flexWrap: "wrap",
          }}
        >
          {pipelineSteps.map((step, i) => (
            <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass"
                style={{
                  padding: "20px 24px",
                  borderRadius: 12,
                  textAlign: "center",
                  minWidth: 130,
                  border: `1px solid ${step.color}22`,
                  boxShadow: `0 0 20px ${step.color}10`,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    fontFamily: "JetBrains Mono, monospace",
                    color: step.color,
                    lineHeight: 1,
                    marginBottom: 8,
                    textShadow: `0 0 20px ${step.color}66`,
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{step.label}</div>
              </motion.div>
              {i < pipelineSteps.length - 1 && (
                <ChevronRight size={20} color="#1e2d42" style={{ margin: "0 4px", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: "40px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Every Tool You Need, <span className="gradient-text-aura">Built In</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: 15 }}>
            Replace 5 separate AI tools with a single unified creative pipeline.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass"
              style={{
                padding: "28px 24px",
                borderRadius: 16,
                border: `1px solid ${feat.color}18`,
                cursor: "default",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${feat.color}18`,
                  border: `1px solid ${feat.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <feat.icon size={22} color={feat.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>{feat.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "60px 24px",
          textAlign: "center",
          background: "linear-gradient(to bottom, transparent, #0d1420)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Ready to <span className="gradient-text-aura">Create?</span>
          </h2>
          <p style={{ color: "#64748b", marginBottom: 32 }}>
            Start your first AI creative project in seconds.
          </p>
          <Link to="/studio">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-aura btn-primary"
              style={{ padding: "16px 40px", fontSize: 16, borderRadius: 14 }}
            >
              <Zap size={20} />
              Open Creative Studio
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
