import { create } from "zustand"

import type { AlgorithmId, Run } from "@/types/api"

export type PlaybackState =
  | "idle"
  | "loading"
  | "loaded"
  | "playing"
  | "paused"
  | "finished"
  | "error"

export type PlaybackSpeed = 0.5 | 1 | 2 | 5

interface PlaybackStateSlice {
  state: PlaybackState
  benchmarkId: string | null
  scenarioId: string | null
  algorithmId: AlgorithmId | null
  run: Run | null
  /**
   * Multi-run mode (Stage 6). When populated, MultiRunPlaybackLayer
   * renders every visible algorithm simultaneously. Empty {} means
   * single-run mode is active and ``run`` is the source of truth.
   */
  runs: Partial<Record<AlgorithmId, Run>>
  visibleAlgorithms: AlgorithmId[]
  currentStep: number
  speed: PlaybackSpeed
  loop: boolean
  error: string | null
}

interface PlaybackActionSlice {
  load: (
    benchmarkId: string,
    scenarioId: string,
    algorithmId: AlgorithmId,
    run: Run,
  ) => void
  /** Multi-run loader. Replaces ``runs`` entirely; ``visibleAlgorithms``
   * defaults to all keys. Single-run ``run`` field is set to whichever
   * run has the most edges so playback timing has a sensible default. */
  loadMulti: (
    benchmarkId: string,
    scenarioId: string,
    runs: Partial<Record<AlgorithmId, Run>>,
  ) => void
  toggleAlgorithmVisibility: (id: AlgorithmId) => void
  setError: (error: string) => void
  play: () => void
  pause: () => void
  toggle: () => void
  setStep: (step: number) => void
  advanceStep: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  setLoop: (loop: boolean) => void
  reset: () => void
}

export type PlaybackStore = PlaybackStateSlice & PlaybackActionSlice

const INITIAL: PlaybackStateSlice = {
  state: "idle",
  benchmarkId: null,
  scenarioId: null,
  algorithmId: null,
  run: null,
  runs: {},
  visibleAlgorithms: [],
  currentStep: 0,
  speed: 1,
  loop: false,
  error: null,
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  ...INITIAL,

  load: (benchmarkId, scenarioId, algorithmId, run) =>
    set({
      state: "loaded",
      benchmarkId,
      scenarioId,
      algorithmId,
      run,
      runs: {},
      visibleAlgorithms: [],
      currentStep: 0,
      error: null,
    }),

  loadMulti: (benchmarkId, scenarioId, runs) => {
    const algorithmIds = Object.keys(runs) as AlgorithmId[]
    // Pick the run with the most edges as the playback timing reference.
    let primaryAlgo: AlgorithmId | null = null
    let primaryRun: Run | null = null
    let maxEdges = -1
    for (const id of algorithmIds) {
      const r = runs[id]
      if (!r) continue
      if (r.perEdge.length > maxEdges) {
        maxEdges = r.perEdge.length
        primaryAlgo = id
        primaryRun = r
      }
    }
    set({
      state: primaryRun ? "loaded" : "idle",
      benchmarkId,
      scenarioId,
      algorithmId: primaryAlgo,
      run: primaryRun,
      runs,
      visibleAlgorithms: algorithmIds,
      currentStep: 0,
      error: null,
    })
  },

  toggleAlgorithmVisibility: (id) =>
    set((s) => ({
      visibleAlgorithms: s.visibleAlgorithms.includes(id)
        ? s.visibleAlgorithms.filter((a) => a !== id)
        : [...s.visibleAlgorithms, id],
    })),

  setError: (error) => set({ state: "error", error }),

  play: () => {
    const { run, state, currentStep } = get()
    if (!run) return
    const restart = state === "finished"
    set({
      state: "playing",
      currentStep: restart ? 0 : currentStep,
    })
  },

  pause: () => {
    if (get().state === "playing") set({ state: "paused" })
  },

  toggle: () => {
    const { state, play, pause } = get()
    if (state === "playing") pause()
    else play()
  },

  setStep: (step) => {
    const { run, state } = get()
    if (!run) return
    const max = run.perEdge.length
    const clamped = Math.max(0, Math.min(step, max))
    const nextState: PlaybackState =
      state === "playing"
        ? "paused"
        : state === "finished" && clamped < max
          ? "paused"
          : state
    set({ currentStep: clamped, state: nextState })
  },

  advanceStep: () => {
    const { run, currentStep, loop } = get()
    if (!run) return
    const max = run.perEdge.length
    const next = currentStep + 1
    if (next >= max) {
      if (loop) set({ currentStep: 0 })
      else set({ currentStep: max, state: "finished" })
    } else {
      set({ currentStep: next })
    }
  },

  setSpeed: (speed) => set({ speed }),
  setLoop: (loop) => set({ loop }),
  reset: () => set({ ...INITIAL }),
}))
