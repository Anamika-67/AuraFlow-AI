import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ExecutionCanvas from "./ExecutionCanvas";
import ProjectHistoryGrid from "./ProjectHistoryGrid";

import {
  INITIAL_SYSTEM_METRICS,
  MOCK_PROJECTS,
  MOCK_PIPELINE_STEPS,
} from "./mockData";

import "./styles.css";

// Pragmatic debug flag for local testing
const DEBUG_MODE = false;

export default function AntigravityDashboard() {
  const [activeTab, setActiveTab] = useState("studio");
  const [promptText, setPromptText] = useState(
    "Cinematic drone fly-through of neon-lit futuristic Tokyo alleyway, rain reflections, 4k 60fps"
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState(MOCK_PIPELINE_STEPS);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [metrics] = useState(INITIAL_SYSTEM_METRICS);

  // TODO: Replace simulated step progression with WebSocket listener from FastAPI backend
  const handleRunExecution = () => {
    if (isExecuting || !promptText.trim()) return;

    if (DEBUG_MODE) {
      console.log("[Antigravity] Initiating execution for prompt:", promptText);
    }

    setIsExecuting(true);

    // Reset pipeline step statuses
    const updatedSteps = pipelineSteps.map((step, idx) => ({
      ...step,
      status: idx === 0 ? "in_progress" : "pending",
    }));
    setPipelineSteps(updatedSteps);

    // Simulate step execution stream
    let currentStepIndex = 0;
    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < updatedSteps.length) {
        setPipelineSteps((prev) =>
          prev.map((s, idx) => {
            if (idx < currentStepIndex) return { ...s, status: "completed" };
            if (idx === currentStepIndex) return { ...s, status: "in_progress" };
            return { ...s, status: "pending" };
          })
        );
      } else {
        clearInterval(interval);
        setPipelineSteps((prev) =>
          prev.map((s) => ({ ...s, status: "completed" }))
        );
        setIsExecuting(false);

        // Append generated item to mock projects library
        const newProject = {
          id: `proj-${Date.now()}`,
          title: promptText.slice(0, 30) + "...",
          type: "video",
          prompt: promptText,
          status: "completed",
          createdAt: "Just now",
          thumbnail:
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
          metrics: { generationTimeSec: 6.2, vramPeakGB: 18.9, fps: 60 },
        };
        setProjects((prev) => [newProject, ...prev]);
      }
    }, 1200);
  };

  return (
    <div className="ag-dashboard-container" id="antigravity-dashboard-root">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
      />

      {/* Main App Workspace */}
      <div className="ag-main-wrapper">
        {/* Top Header */}
        <Header onQuickLaunch={() => setActiveTab("studio")} />

        {/* Dynamic Page Content */}
        <main className="ag-content-container">
          {/* Main Execution Canvas */}
          <ExecutionCanvas
            prompt={promptText}
            setPrompt={setPromptText}
            pipelineSteps={pipelineSteps}
            isExecuting={isExecuting}
            onRunExecution={handleRunExecution}
          />

          {/* Project History Grid */}
          <ProjectHistoryGrid projects={projects} />
        </main>
      </div>
    </div>
  );
}
