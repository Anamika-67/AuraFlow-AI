import { motion } from "framer-motion";

// Circular arc gauge for GPU metrics
export default function GPUGauge({ value = 0, max = 100, label, unit = "%", color = "#00f0ff", size = 120 }) {
  const pct = Math.min(1, value / max);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * 0.75; // 270° arc
  const strokeOffset = strokeDash * (1 - pct);

  const displayVal = typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(135deg)", display: "block" }}>
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e2d42"
            strokeWidth={8}
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: strokeDash }}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Center value */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 10,
          }}
        >
          <span style={{ fontSize: size * 0.18, fontWeight: 800, color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>
            {displayVal}
          </span>
          <span style={{ fontSize: size * 0.09, color: "#4a5568", fontFamily: "JetBrains Mono, monospace" }}>{unit}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}
