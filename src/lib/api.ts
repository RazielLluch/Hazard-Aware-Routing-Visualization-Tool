import type {
  Benchmark,
  BenchmarkSummary,
  GraphInfo,
  MetricsBundle,
  Page,
  Run,
  RunSummary,
  SampleNodesRequest,
  SampleNodesResponse,
  Scenario,
  ScenarioListItem,
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

export const api = {
  baseUrl: API_BASE,

  listBenchmarks: () => safeFetch<BenchmarkSummary[]>("/api/v1/benchmarks"),

  getBenchmark: (id: string) =>
    safeFetch<Benchmark>(`/api/v1/benchmarks/${encodeURIComponent(id)}`),

  listScenarios: (
    id: string,
    opts: { ri?: number; page?: number; pageSize?: number } = {},
  ) =>
    safeFetch<Page<ScenarioListItem>>(
      `/api/v1/benchmarks/${encodeURIComponent(id)}/scenarios${qs(opts)}`,
    ),

  getScenario: (id: string, sid: string) =>
    safeFetch<Scenario>(
      `/api/v1/benchmarks/${encodeURIComponent(id)}/scenarios/${encodeURIComponent(sid)}`,
    ),

  listRunsForAlgorithm: (id: string, algoId: string) =>
    safeFetch<RunSummary[]>(
      `/api/v1/benchmarks/${encodeURIComponent(id)}/runs/${encodeURIComponent(algoId)}`,
    ),

  listRunsForScenario: (id: string, sid: string) =>
    safeFetch<RunSummary[]>(
      `/api/v1/benchmarks/${encodeURIComponent(id)}/scenarios/${encodeURIComponent(sid)}/runs`,
    ),

  getRun: (id: string, sid: string, algoId: string) =>
    safeFetch<Run>(
      `/api/v1/benchmarks/${encodeURIComponent(id)}/scenarios/${encodeURIComponent(sid)}/runs/${encodeURIComponent(algoId)}`,
    ),

  getMetrics: (id: string) =>
    safeFetch<MetricsBundle>(`/api/v1/benchmarks/${encodeURIComponent(id)}/metrics`),

  getGraph: (graphId: string) =>
    safeFetch<GraphInfo>(`/api/v1/graphs/${encodeURIComponent(graphId)}`),

  sampleNodes: (graphId: string, request: SampleNodesRequest) =>
    safeFetch<SampleNodesResponse>(
      `/api/v1/graphs/${encodeURIComponent(graphId)}/sample-nodes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        revalidate: 0,
      },
    ),
}
