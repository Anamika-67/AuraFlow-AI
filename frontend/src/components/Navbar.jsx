import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, LayoutDashboard, Cpu, FlaskConical } from "lucide-react";

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const navItems = [
  { to: "/", icon: Zap, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Projects" },
  { to: "/studio", icon: FlaskConical, label: "Studio" },
  { to: "/benchmark", icon: Cpu, label: "GPU Monitor" },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(8,12,20,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1e2d42",
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #00f0ff, #7b00ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Zap size={20} color="#000" fill="#000" />
        </div>
        <div>
          <div className="gradient-text-aura" style={{ fontWeight: 800, fontSize: 18, lineHeight: 1 }}>
            AuraFlow
          </div>
          <div style={{ fontSize: 10, color: "#4a5568", fontFamily: "JetBrains Mono, monospace", letterSpacing: 2 }}>
            AI STUDIO
          </div>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                color: active ? "#00f0ff" : "#94a3b8",
                background: active ? "rgba(0,240,255,0.08)" : "transparent",
                border: active ? "1px solid rgba(0,240,255,0.2)" : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* AMD Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(237,28,36,0.12)",
            border: "1px solid rgba(237,28,36,0.25)",
            fontSize: 11,
            fontWeight: 700,
            color: "#ff6b35",
            letterSpacing: 1,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ed1c24", display: "inline-block" }} />
          AMD ROCm
        </div>
        <a
          href="https://github.com/Anamika-67/AuraFlow-AI"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#4a5568", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00f0ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
        >
          <GithubIcon size={18} />
        </a>
      </div>
    </nav>
  );
}

