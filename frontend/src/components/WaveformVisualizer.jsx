import { motion } from "framer-motion";

// Animated bar waveform visualizer from 30-point array
export default function WaveformVisualizer({ data = [], color = "#00f0ff", height = 60 }) {
  if (!data || data.length === 0) {
    // Default idle wave
    data = Array.from({ length: 30 }, (_, i) => Math.abs(Math.sin(i * 0.4)) * 0.4 + 0.1);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height,
        padding: "0 8px",
        background: "#080c14",
        borderRadius: 8,
        border: "1px solid #1e2d42",
        overflow: "hidden",
      }}
    >
      {data.map((val, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [val, val * 1.5 + 0.05, val] }}
          transition={{
            duration: 1.2 + i * 0.03,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
          style={{
            flex: 1,
            height: `${Math.max(8, val * 100)}%`,
            background: `linear-gradient(to top, ${color}88, ${color})`,
            borderRadius: 2,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}
