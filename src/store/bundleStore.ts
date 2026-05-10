import { create } from "zustand"

export type BundleSelectionMode = "depot" | "stop"

interface BundleState {
  /** Current selection mode: next click sets depot or appends a stop. */
  mode: BundleSelectionMode
  /** Selected depot node id (null if not yet picked). */
  depot: string | null
  /** Stops in selection order. */
  stops: string[]
  /** Optional name of a loaded bundle (for "save as update" affordances). */
  loadedBundleName: string | null

  setMode: (mode: BundleSelectionMode) => void
  setDepot: (nodeId: string | null) => void
  addStop: (nodeId: string) => void
  removeStop: (nodeId: string) => void
  clear: () => void
  loadFromBundle: (name: string, depot: string, stops: string[]) => void
}

export const useBundleStore = create<BundleState>((set) => ({
  mode: "depot",
  depot: null,
  stops: [],
  loadedBundleName: null,

  setMode: (mode) => set({ mode }),
  setDepot: (depot) =>
    set((s) => ({
      depot,
      // Drop the depot from stops if it was previously a stop.
      stops: depot ? s.stops.filter((id) => id !== depot) : s.stops,
    })),
  addStop: (nodeId) =>
    set((s) => {
      if (nodeId === s.depot) return s
      if (s.stops.includes(nodeId)) return s
      return { stops: [...s.stops, nodeId] }
    }),
  removeStop: (nodeId) =>
    set((s) => ({ stops: s.stops.filter((id) => id !== nodeId) })),
  clear: () =>
    set({ mode: "depot", depot: null, stops: [], loadedBundleName: null }),
  loadFromBundle: (name, depot, stops) =>
    set({
      loadedBundleName: name,
      depot,
      stops: [...stops],
      mode: "stop",
    }),
}))
