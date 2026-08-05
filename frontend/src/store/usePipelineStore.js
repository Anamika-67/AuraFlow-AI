import { create } from "zustand";

const usePipelineStore = create((set, get) => ({
  // ── Active Project ────────────────────────────────────────────────────────
  project: null,
  setProject: (project) => set({ project }),

  // ── Pipeline Stage Results ────────────────────────────────────────────────
  context: null,
  image: null,
  editedImage: null,
  video: null,
  audio: null,
  render: null,

  setContext: (ctx) => set({ context: ctx }),
  setImage: (img) => set({ image: img }),
  setEditedImage: (img) => set({ editedImage: img }),
  setVideo: (vid) => set({ video: vid }),
  setAudio: (aud) => set({ audio: aud }),
  setRender: (rnd) => set({ render: rnd }),

  // ── UI State ──────────────────────────────────────────────────────────────
  activeStep: 0,
  setActiveStep: (step) => set({ activeStep: step }),

  // ── GPU Telemetry ─────────────────────────────────────────────────────────
  telemetry: null,
  setTelemetry: (t) => set({ telemetry: t }),

  // ── Loading / Error per stage ─────────────────────────────────────────────
  loading: {},
  errors: {},
  setLoading: (stage, val) =>
    set((s) => ({ loading: { ...s.loading, [stage]: val } })),
  setError: (stage, err) =>
    set((s) => ({ errors: { ...s.errors, [stage]: err } })),
  clearError: (stage) =>
    set((s) => {
      const e = { ...s.errors };
      delete e[stage];
      return { errors: e };
    }),

  // ── Reset pipeline ────────────────────────────────────────────────────────
  resetPipeline: () =>
    set({
      context: null,
      image: null,
      editedImage: null,
      video: null,
      audio: null,
      render: null,
      activeStep: 0,
      loading: {},
      errors: {},
    }),
}));

export default usePipelineStore;
