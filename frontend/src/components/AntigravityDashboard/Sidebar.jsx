import React from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Layers, 
  Cpu, 
  FolderKanban, 
  Settings,
  Activity 
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, metrics }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "studio", label: "Execution Canvas", icon: Sparkles },
    { id: "projects", label: "Project Library", icon: FolderKanban },
    { id: "pipelines", label: "AI Pipelines", icon: Layers },
    { id: "rocm", label: "ROCm Telemetry", icon: Cpu },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const vramUsagePercent = Math.round((metrics.vramUsedGB / metrics.vramTotalGB) * 100);

  return (
    <aside className="ag-sidebar" id="ag-sidebar-nav">
      {/* Brand Header */}
      <div className="ag-brand">
        <div className="ag-brand-logo">A</div>
        <div>
          <div className="ag-brand-title">Antigravity</div>
          <div style={{ fontSize: "0.7rem", color: "var(--ag-text-dim)" }}>
            Multimodal AI Engine
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="ag-nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              className={`ag-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="ag-nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* GPU Telemetry Quick Widget */}
      <div className="ag-telemetry-card" id="ag-telemetry-sidebar-widget">
        <div className="ag-telemetry-header">
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Activity size={12} color="var(--ag-accent-cyan)" /> AMD ROCm
          </span>
          <span>{metrics.gpuUtilPercent}% UTIL</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--ag-text-muted)" }}>
          VRAM: {metrics.vramUsedGB} GB / {metrics.vramTotalGB} GB
        </div>
        <div className="ag-progress-bar-bg">
          <div
            className="ag-progress-bar-fill"
            style={{ width: `${vramUsagePercent}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
