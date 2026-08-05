import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, FolderOpen, Clock, Image, Film, Mic2, Layers, Trash2, X, Loader2 } from "lucide-react";
import { listProjects, createProject } from "../api/auraflow";
import usePipelineStore from "../store/usePipelineStore";

function StatBadge({ icon: Icon, count, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
      <Icon size={12} color={color} />
      <span>{count}</span>
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  const created = new Date(project.created_at * 1000).toLocaleDateString();
  const assets = project.assets || {};
  const imageCount = (assets.images?.length || 0) + (assets.edited_images?.length || 0);
  const videoCount = assets.videos?.length || 0;
  const audioCount = assets.audios?.length || 0;
  const renderCount = assets.renders?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 8px 30px #00f0ff18" }}
      className="glass"
      style={{
        borderRadius: 16,
        padding: 24,
        cursor: "pointer",
        border: "1px solid #1e2d42",
        transition: "all 0.2s",
      }}
      onClick={() => onOpen(project)}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #00f0ff22, #7b00ff22)",
            border: "1px solid #00f0ff22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FolderOpen size={20} color="#00f0ff" />
        </div>
        <span
          style={{
            fontSize: 10,
            fontFamily: "JetBrains Mono, monospace",
            color: "#374151",
            padding: "2px 8px",
            borderRadius: 999,
            background: "#1e2d42",
          }}
        >
          {project.id}
        </span>
      </div>

      {/* Name & Description */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{project.name}</h3>
      <p style={{ fontSize: 12, color: "#4a5568", marginBottom: 16, lineHeight: 1.5 }}>
        {project.description || "No description"}
      </p>

      {/* Asset counts */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        <StatBadge icon={Image} count={imageCount} color="#00f0ff" />
        <StatBadge icon={Film} count={videoCount} color="#a855f7" />
        <StatBadge icon={Mic2} count={audioCount} color="#ff007f" />
        <StatBadge icon={Layers} count={renderCount} color="#10b981" />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#374151" }}>
        <Clock size={11} />
        Created {created}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setProject, resetPipeline } = usePipelineStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (e) {
      setError("Backend offline. Make sure FastAPI is running on localhost:8000");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const project = await createProject(name.trim(), desc.trim());
      setProjects((p) => [project, ...p]);
      setShowModal(false);
      setName("");
      setDesc("");
      handleOpen(project);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  function handleOpen(project) {
    resetPipeline();
    setProject(project);
    navigate("/studio");
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 24px 60px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
            Creative Projects
          </h1>
          <p style={{ fontSize: 13, color: "#4a5568" }}>
            Manage your AI creative sessions and asset history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-aura btn-primary"
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", borderRadius: 10 }}
        >
          <Plus size={16} />
          New Project
        </motion.button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: "rgba(255,0,127,0.08)",
            border: "1px solid rgba(255,0,127,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 13,
            color: "#ff6b9d",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {error}
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#ff6b9d", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0", gap: 12, color: "#4a5568" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "100px 24px",
            border: "1px dashed #1e2d42",
            borderRadius: 20,
          }}
        >
          <FolderOpen size={48} color="#1e2d42" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
            No projects yet
          </h3>
          <p style={{ color: "#374151", fontSize: 13, marginBottom: 24 }}>
            Create your first AI creative project to get started.
          </p>
          <button className="btn-aura btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create First Project
          </button>
        </motion.div>
      ) : (
        /* Project Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={handleOpen} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
                zIndex: 100,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 101,
                width: "min(480px, 90vw)",
                background: "#0d1420",
                border: "1px solid #00f0ff22",
                borderRadius: 20,
                padding: 32,
                boxShadow: "0 0 60px #00f0ff18",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0" }}>New Project</h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", color: "#4a5568", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>
                    PROJECT NAME
                  </label>
                  <input
                    className="aura-input"
                    placeholder="e.g., Cyberpunk City Timelapse"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>
                    DESCRIPTION (optional)
                  </label>
                  <textarea
                    className="aura-input"
                    placeholder="Brief description of your creative vision..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn-aura btn-secondary"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-aura btn-primary"
                    disabled={creating || !name.trim()}
                    style={{ flex: 1 }}
                  >
                    {creating ? <span className="spinner" /> : <Plus size={16} />}
                    {creating ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
