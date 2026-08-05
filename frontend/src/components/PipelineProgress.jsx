import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const steps = [
  { id: 0, label: "Context", sub: "Style & mood extraction" },
  { id: 1, label: "Image Gen", sub: "SDXL generation" },
  { id: 2, label: "Edit", sub: "AI inpainting" },
  { id: 3, label: "Animate", sub: "AnimateDiff video" },
  { id: 4, label: "Narration", sub: "Piper TTS" },
  { id: 5, label: "Compose", sub: "FFmpeg render" },
];

export default function PipelineProgress({ activeStep, completedSteps = [], loadingStep = null }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        background: "#0d1420",
        borderBottom: "1px solid #1e2d42",
        overflowX: "auto",
        gap: 0,
      }}
    >
      {steps.map((step, i) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = activeStep === step.id;
        const isLoading = loadingStep === step.id;

        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 90 }}>
              {/* Icon */}
              <motion.div
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isCompleted
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : isActive
                    ? "linear-gradient(135deg, #00f0ff, #7b00ff)"
                    : "#1e2d42",
                  border: isActive ? "2px solid #00f0ff" : "2px solid transparent",
                  boxShadow: isActive ? "0 0 16px #00f0ff44" : "none",
                  transition: "all 0.3s",
                }}
              >
                {isLoading ? (
                  <Loader2 size={16} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                ) : isCompleted ? (
                  <CheckCircle2 size={16} color="#fff" />
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#000" : "#4a5568" }}>
                    {step.id + 1}
                  </span>
                )}
              </motion.div>

              {/* Labels */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? "#00f0ff" : isCompleted ? "#10b981" : "#4a5568" }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 9, color: "#374151", fontFamily: "JetBrains Mono, monospace" }}>
                  {step.sub}
                </div>
              </div>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 20,
                  background: isCompleted ? "linear-gradient(to right, #10b981, #059669)" : "#1e2d42",
                  transition: "background 0.5s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
