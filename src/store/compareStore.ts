"use client"

import { create } from "zustand"

import { v2 } from "@/lib/api"
import type {
  AlgorithmEntry,
  CohortId,
  GraphExport,
  InferenceResponseV2,
  PaneSelection,
  RILevel,
  ScenarioSetScenario,
  ScenarioSetSummary,
} from "@/types/api"

/** Wall-clock seconds of animation per minute of real travel at 1x speed.
 *  Shared between the store (cap arithmetic in playbackTick) and
 *  AgentMarker (position interpolation). */
export const BASE_ANIM_SEC_PER_MIN = 0.1

// ---------------------------------------------------------------------------
// Discriminated async entries — mirrors the graphTopologyStore pattern.
// ---------------------------------------------------------------------------
export type GraphEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; payload: GraphExport }
  | { status: "error"; error: string }

export type ScenarioSetsEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; payload: ScenarioSetSummary[] }
  | { status: "error"; error: string }

/**
 * A pane's route. Always sourced from `v2.runLive` — the precomputed
 * `CompactResult` carries no per-segment geometry, so it cannot back a
 * polyline. `runLive` recomputes via the bridge (sub-second) and returns the
 * full `InferenceResponseV2` with legs + segments.
 */
export type RouteEntry =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; result: InferenceResponseV2 }
  | { status: "error"; error: string }

export type RouteColourMode = "solid" | "combined_hazard"

export interface PlaybackState {
  playing: boolean
  elapsed: number
  speedMultiplier: number
}

export interface CompareLayers {
  roads: boolean
  flood: boolean
  landslide: boolean
  softBlocked: boolean
}

/** Serialisable LatLng bounds tuple [[south, west], [north, east]] — never a
 *  Leaflet object, so Zustand state stays serialisable. */
export type ViewBounds = [[number, number], [number, number]]

type Side = "left" | "right"

interface CompareStateSlice {
  catalog: AlgorithmEntry[]
  graph: GraphEntry
  scenarioSets: ScenarioSetsEntry
  scenarios: ScenarioSetScenario[]
  cohort: CohortId
  ri: RILevel
  scenarioId: string | null
  scenario: ScenarioSetScenario | null
  layers: CompareLayers
  routeColourMode: RouteColourMode
  viewBounds: ViewBounds | null
  playback: PlaybackState
  left: PaneSelection
  right: PaneSelection
  leftRoute: RouteEntry
  rightRoute: RouteEntry
}

interface CompareActionSlice {
  setCatalog: (entries: AlgorithmEntry[]) => void
  loadGraph: () => Promise<void>
  loadScenarioSets: () => Promise<void>
  loadScenarios: () => Promise<void>
  setCohort: (cohort: CohortId) => void
  setRI: (ri: RILevel) => void
  setScenario: (scenario: ScenarioSetScenario) => void
  setPane: (side: Side, selection: PaneSelection) => void
  fetchPane: (side: Side) => Promise<void>
  toggleLayer: (key: keyof CompareLayers) => void
  setColourMode: (mode: RouteColourMode) => void
  setBounds: (bounds: ViewBounds | null) => void
  playbackPlay: () => void
  playbackPause: () => void
  playbackReset: () => void
  playbackSetSpeed: (m: number) => void
  playbackTick: (deltaSec: number) => void
  reset: () => void
}

export type CompareStore = CompareStateSlice & CompareActionSlice

const INITIAL: CompareStateSlice = {
  catalog: [],
  graph: { status: "idle" },
  scenarioSets: { status: "idle" },
  scenarios: [],
  cohort: "random",
  ri: "RI3",
  scenarioId: null,
  scenario: null,
  layers: { roads: true, flood: true, landslide: true, softBlocked: true },
  routeColourMode: "solid",
  viewBounds: null,
  playback: { playing: false, elapsed: 0, speedMultiplier: 1 },
  left: { profile: "balanced", algorithm: "Macro-DDQN-Offline-NoAnchor" },
  right: { profile: "balanced", algorithm: "Greedy-HazardAware" },
  leftRoute: { status: "idle" },
  rightRoute: { status: "idle" },
}

const SCENARIO_PAGE_SIZE = 300

export const useCompareStore = create<CompareStore>((set, get) => ({
  ...INITIAL,

  setCatalog: (entries) => set({ catalog: entries }),

  loadGraph: async () => {
    const status = get().graph.status
    if (status === "loaded" || status === "loading") return
    set({ graph: { status: "loading" } })
    const result = await v2.getGraphExport()
    set({
      graph: result.ok
        ? { status: "loaded", payload: result.data }
        : { status: "error", error: result.error },
    })
  },

  loadScenarioSets: async () => {
    if (get().scenarioSets.status === "loading") return
    set({ scenarioSets: { status: "loading" } })
    const result = await v2.listScenarioSets()
    set({
      scenarioSets: result.ok
        ? { status: "loaded", payload: result.data }
        : { status: "error", error: result.error },
    })
  },

  loadScenarios: async () => {
    const { cohort, ri } = get()
    const result = await v2.listScenarios({ cohort, ri, pageSize: SCENARIO_PAGE_SIZE })
    set({ scenarios: result.ok ? result.data.items : [] })
  },

  setCohort: (cohort) => {
    set({ cohort, scenarioId: null, scenario: null, scenarios: [] })
    void get().loadScenarios()
  },

  setRI: (ri) => {
    set({ ri, scenarioId: null, scenario: null, scenarios: [] })
    void get().loadScenarios()
  },

  setScenario: (scenario) => {
    set((state) => ({
      scenarioId: scenario.scenario_id,
      scenario,
      playback: { ...state.playback, playing: false, elapsed: 0 },
    }))
    void get().fetchPane("left")
    void get().fetchPane("right")
  },

  setPane: (side, selection) => {
    set((state) => ({
      ...(side === "left" ? { left: selection } : { right: selection }),
      playback: { ...state.playback, playing: false, elapsed: 0 },
    }))
    void get().fetchPane(side)
  },

  fetchPane: async (side) => {
    const { scenario, cohort } = get()
    const selection = side === "left" ? get().left : get().right
    const entryKey = side === "left" ? "leftRoute" : "rightRoute"
    if (!scenario) {
      set({ [entryKey]: { status: "idle" } } as Partial<CompareStateSlice>)
      return
    }
    set({ [entryKey]: { status: "loading" } } as Partial<CompareStateSlice>)
    const result = await v2.runLive(scenario.scenario_id, { ...selection, cohort })
    set({
      [entryKey]: result.ok
        ? { status: "loaded", result: result.data }
        : { status: "error", error: result.error },
    } as Partial<CompareStateSlice>)
  },

  toggleLayer: (key) =>
    set((state) => ({ layers: { ...state.layers, [key]: !state.layers[key] } })),

  setColourMode: (mode) => set({ routeColourMode: mode }),

  setBounds: (bounds) => set({ viewBounds: bounds }),

  playbackPlay: () =>
    set((state) => ({ playback: { ...state.playback, playing: true } })),
  playbackPause: () =>
    set((state) => ({ playback: { ...state.playback, playing: false } })),
  playbackReset: () =>
    set((state) => ({ playback: { ...state.playback, playing: false, elapsed: 0 } })),
  playbackSetSpeed: (m) =>
    set((state) => ({ playback: { ...state.playback, speedMultiplier: m } })),
  playbackTick: (deltaSec) =>
    set((state) => {
      const leftTime =
        state.leftRoute.status === "loaded"
          ? state.leftRoute.result.metrics.time_min
          : 0
      const rightTime =
        state.rightRoute.status === "loaded"
          ? state.rightRoute.result.metrics.time_min
          : 0
      const maxTimeMin = Math.max(leftTime, rightTime)
      if (maxTimeMin <= 0) return {}
      const scaledDuration = maxTimeMin * BASE_ANIM_SEC_PER_MIN
      const next =
        state.playback.elapsed + deltaSec * state.playback.speedMultiplier
      if (next >= scaledDuration) {
        return {
          playback: { ...state.playback, elapsed: scaledDuration, playing: false },
        }
      }
      return { playback: { ...state.playback, elapsed: next } }
    }),

  reset: () => set({ ...INITIAL }),
}))
