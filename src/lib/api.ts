import type {
  AlgorithmEntry,
  CohortId,
  CompactResult,
  GraphExport,
  InferenceRequestV2,
  InferenceResponseV2,
  MetricsResponseV2,
  PageV2,
  PaneSelection,
  RILevel,
  ScenarioSetScenario,
  ScenarioSetSummary,
} from "@/types/api"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000"

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number }

interface SafeFetchOptions extends RequestInit {
  revalidate?: number
}

async function safeFetch<T>(
  path: string,
  options: SafeFetchOptions = {},
): Promise<ApiResult<T>> {
  const { revalidate = 3600, ...init } = options
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      ...init,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return {
        ok: false,
        status: res.status,
        error: text || `${res.status} ${res.statusText}`,
      }
    }
    return { ok: true, data: (await res.json()) as T }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "unknown fetch error",
    }
  }
}

function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const s = search.toString()
  return s ? `?${s}` : ""
}

// ---------------------------------------------------------------------------
// v2 (Macro-DDQN) — the comparison surface. /api/v1 was removed when the
// app collapsed to a single Compare-only route.
// ---------------------------------------------------------------------------

export const v2 = {
  baseUrl: API_BASE,

  listAlgorithms: () =>
    safeFetch<AlgorithmEntry[]>("/api/v2/algorithms", { revalidate: 3600 }),

  getGraphExport: () =>
    // The graph is invariant within a config; cached aggressively. The backend
    // also serves an ETag, so a revalidation is a cheap 304.
    safeFetch<GraphExport>("/api/v2/graph", { revalidate: 3600 }),

  listScenarioSets: () =>
    safeFetch<ScenarioSetSummary[]>("/api/v2/scenario_sets", { revalidate: 600 }),

  listScenarios: (opts: {
    cohort: CohortId
    ri?: RILevel
    page?: number
    pageSize?: number
  }) =>
    safeFetch<PageV2<ScenarioSetScenario>>(`/api/v2/scenarios${qs(opts)}`, {
      revalidate: 600,
    }),

  runInference: (request: InferenceRequestV2) =>
    safeFetch<InferenceResponseV2>("/api/v2/inference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      revalidate: 0,
    }),

  getRun: (scenarioId: string, sel: PaneSelection & { cohort?: CohortId }) =>
    safeFetch<CompactResult>(
      `/api/v2/scenarios/${encodeURIComponent(scenarioId)}/runs${qs({
        profile: sel.profile,
        algorithm: sel.algorithm,
        cohort: sel.cohort,
      })}`,
      { revalidate: 600 },
    ),

  runLive: (scenarioId: string, sel: PaneSelection & { cohort?: CohortId }) =>
    safeFetch<InferenceResponseV2>(
      `/api/v2/scenarios/${encodeURIComponent(scenarioId)}/runs/live${qs({
        profile: sel.profile,
        algorithm: sel.algorithm,
        cohort: sel.cohort,
      })}`,
      { revalidate: 0 },
    ),

  getMetrics: (cohort: CohortId = "random") =>
    safeFetch<MetricsResponseV2>(`/api/v2/metrics${qs({ cohort })}`, {
      revalidate: 600,
    }),
}
