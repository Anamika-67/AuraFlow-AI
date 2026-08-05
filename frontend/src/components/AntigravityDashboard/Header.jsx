import React from "react";
import { Zap, User } from "lucide-react";

export default function Header({ onQuickLaunch }) {
  return (
    <header className="ag-top-header" id="ag-header-bar">
      <div className="ag-header-status">
        <span className="ag-status-dot" />
        <span style={{ fontWeight: 500, color: "#ffffff" }}>ROCm 6.1 Acceleration Active</span>
        <span style={{ color: "var(--ag-text-dim)", margin: "0 0.35rem" }}>•</span>
        <span>Queue Status: Operational</span>
      </div>

      <div className="ag-header-actions">
        {/* Quick Launch Action Button */}
        <button
          id="btn-quick-generate"
          className="ag-btn-primary"
          onClick={onQuickLaunch}
        >
          <Zap size={15} />
          <span>New Execution</span>
        </button>

        {/* User Profile Avatar */}
        <div
          id="user-profile-avatar"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid var(--ag-panel-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ag-text-muted)",
            cursor: "pointer",
          }}
        >
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
