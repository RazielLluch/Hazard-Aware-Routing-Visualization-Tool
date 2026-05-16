import { v2 } from "@/lib/api"
import type { AlgorithmEntry } from "@/types/api"

/**
 * The 7 macro algorithm ids the /compare surface depends on. Kept in sync with
 * the backend bridge's _ALGORITHM_SPECS — the boot guard below fails loudly if
 * the live catalog is missing any of them.
 */
export const REQUIRED_ALGORITHM_IDS = [
  "Macro-DQN",
  "Macro-DDQN-Online-Scratch",
  "Macro-DDQN-Offline-NoAnchor",
  "Macro-DP-Oracle",
  "Greedy-Time-Base",
  "Greedy-Time-SoftPenalty",
  "Greedy-HazardAware",
] as const

/**
 * Boot-time guard for the comparison surface: fetch /api/v2/algorithms and
 * fail loudly if the backend is unreachable or its catalog is incomplete.
 *
 * Returns the validated catalog so the caller (the compare store) can hydrate
 * from it without a second fetch. Throwing here surfaces through a Next.js
 * error boundary instead of failing silently deep inside a route component —
 * the HANDOFF risk-table mitigation for "frontend silently accepts a
 * wrong-shape catalog".
 */
export async function validateBackendCatalog(): Promise<AlgorithmEntry[]> {
  const result = await v2.listAlgorithms()
  if (!result.ok) {
    throw new Error(
      `Macro-DDQN backend unreachable: GET /api/v2/algorithms failed — ${result.error}`,
    )
  }
  const present = new Set(result.data.map((entry) => entry.id))
  const missing = REQUIRED_ALGORITHM_IDS.filter((id) => !present.has(id))
  if (missing.length > 0) {
    throw new Error(
      `Macro-DDQN backend catalog is incomplete — missing algorithm ids: ${missing.join(", ")}`,
    )
  }
  return result.data
}
