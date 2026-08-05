import React, { useState } from "react";
import { Play, RefreshCw, Sliders, Image, Video, Mic, Download } from "lucide-react";
import { PRESET_PROMPTS } from "./mockData";

export default function ExecutionCanvas({
  prompt,
  setPrompt,
  pipelineSteps,
  isExecuting,
  onRunExecution,
}) {
  const [selectedMediaType, setSelectedMediaType] = useState("video");
  const [cfgScale, setCfgScale] = useState(7.5);
  const [inferenceSteps, setInferenceSteps] = useState(30);

  return (
    <div className="ag-workspace-grid" id="ag-execution-canvas">
      {/* Left Main Workspace Pane */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Prompt Input Card */}
        <div className="ag-card" id="card-prompt-input">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Multimodal Prompt Builder</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className={`ag-btn-secondary ${selectedMediaType === "image" ? "active" : ""}`}
                onClick={() => setSelectedMediaType("image")}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Image size={14} /> Image
              </button>
              <button
                className={`ag-btn-secondary ${selectedMediaType === "video" ? "active" : ""}`}
                onClick={() => setSelectedMediaType("video")}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Video size={14} /> Video
              </button>
              <button
                className={`ag-btn-secondary ${selectedMediaType === "voice" ? "active" : ""}`}
                onClick={() => setSelectedMediaType("voice")}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Mic size={14} /> Voice
              </button>
            </div>
          </div>

          <div className="ag-prompt-input-wrapper">
            <textarea
              id="prompt-textarea"
              className="ag-prompt-textarea"
              placeholder="Describe your creative vision (e.g. Cyberpunk city at twilight, 8k resolution, volumetric fog...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* Quick Preset Pills */}
          <div className="ag-preset-pills" id="preset-prompts-container">
            <span style={{ fontSize: "0.75rem", color: "var(--ag-text-dim)", alignSelf: "center" }}>
              Try Presets:
            </span>
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                className="ag-pill"
                onClick={() => setPrompt(p)}
              >
                {p.length > 40 ? p.substring(0, 40) + "..." : p}
              </button>
            ))}
          </div>

          {/* Execute Pipeline Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button
              id="btn-run-pipeline"
              className="ag-btn-primary"
              onClick={onRunExecution}
              disabled={isExecuting || !prompt.trim()}
              style={{
                opacity: isExecuting || !prompt.trim() ? 0.6 : 1,
                cursor: isExecuting || !prompt.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isExecuting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Run Execution Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Pipeline Execution Steps */}
        <div className="ag-card" id="card-pipeline-tracker">
          <h3 className="ag-card-title" style={{ marginBottom: "1rem" }}>
            Pipeline Execution Tracker
          </h3>
          <div className="ag-pipeline-list">
            {pipelineSteps.map((step) => (
              <div key={step.id} className="ag-pipeline-item" id={`pipeline-step-${step.id}`}>
                <div className="ag-pipeline-info">
                  <span className={`ag-status-badge ${step.status}`}>
                    {step.status === "in_progress" ? "RUNNING" : step.status}
                  </span>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ag-text-muted)" }}>
                      {step.details}
                    </div>
                  </div>
                </div>
                {step.durationMs > 0 && (
                  <div style={{ fontSize: "0.75rem", color: "var(--ag-text-dim)" }}>
                    {(step.durationMs / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Live Preview & Model Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Live Preview Pane */}
        <div className="ag-card" id="card-live-preview">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Live Preview</h3>
            <button className="ag-btn-secondary" style={{ padding: "0.3rem 0.5rem" }}>
              <Download size={14} />
            </button>
          </div>

          <div
            style={{
              width: "100%",
              height: 220,
              borderRadius: "var(--ag-radius-md)",
              overflow: "hidden",
              position: "relative",
              background: "#000000",
              border: "1px solid var(--ag-panel-border)",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80"
              alt="Live AI Generation Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {isExecuting && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(9, 13, 22, 0.75)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "0.5rem",
                  color: "#ffffff",
                }}
              >
                <RefreshCw size={24} style={{ animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  Generating frame tensors...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Model Hyperparameters Card */}
        <div className="ag-card" id="card-hyperparameters">
          <div className="ag-card-header">
            <h3 className="ag-card-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Sliders size={16} /> Hyperparameters
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                <span style={{ color: "var(--ag-text-muted)" }}>CFG Guidance Scale</span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>{cfgScale}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={cfgScale}
                onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--ag-primary)" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.35rem" }}>
                <span style={{ color: "var(--ag-text-muted)" }}>Inference Steps</span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>{inferenceSteps}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={inferenceSteps}
                onChange={(e) => setInferenceSteps(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--ag-accent-cyan)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
