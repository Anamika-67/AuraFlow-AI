import React from "react";
import { Folder, Clock, Zap } from "lucide-react";

export default function ProjectHistoryGrid({ projects }) {
  return (
    <div className="ag-card" id="card-recent-projects">
      <div className="ag-card-header">
        <h3 className="ag-card-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Folder size={18} color="var(--ag-accent-cyan)" /> Recent Executions Library
        </h3>
        <span style={{ fontSize: "0.8rem", color: "var(--ag-text-dim)" }}>
          Total Items: {projects.length}
        </span>
      </div>

      <div className="ag-projects-grid">
        {projects.map((proj) => (
          <div key={proj.id} className="ag-project-card" id={`project-card-${proj.id}`}>
            {proj.thumbnail ? (
              <img
                src={proj.thumbnail}
                alt={proj.title}
                className="ag-project-thumb"
              />
            ) : (
              <div className="ag-project-thumb-placeholder">
                <span>Audio Track Generated</span>
              </div>
            )}
            <div className="ag-project-details">
              <div className="ag-project-title" title={proj.title}>
                {proj.title}
              </div>
              <div className="ag-project-meta">
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={12} /> {proj.createdAt}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--ag-accent-cyan)" }}>
                  <Zap size={12} /> {proj.metrics.generationTimeSec > 0 ? `${proj.metrics.generationTimeSec}s` : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
