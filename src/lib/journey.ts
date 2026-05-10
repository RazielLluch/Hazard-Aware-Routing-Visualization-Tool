import { api } from "@/lib/api"
import type { BenchmarkSummary } from "@/types/api"

export interface JourneyContext {
  defaultBenchmarkId: string | null
  defaultScenarioId: string | null
  recent: BenchmarkSummary[]
  apiOk: boolean
}

// Server-side resolver shared by the root layout (sidebar deep links) and
// the home dashboard (Step 3 playback buttons). Fetches the most recent
// benchmark, then asks the API for that benchmark's first scenarioId so
// deep links use real ids instead of an integer index.
export async function resolveJourneyContext(): Promise<JourneyContext> {
  const benchmarksResult = await api.listBenchmarks()
  if (!benchmarksResult.ok) {
    return {
      defaultBenchmarkId: null,
      defaultScenarioId: null,
      recent: [],
      apiOk: false,
    }
  }

  const all = benchmarksResult.data
  const defaultBenchmarkId = all[0]?.benchmarkId ?? "la_trinidad_mini"

  const scenariosResult = await api.listScenarios(defaultBenchmarkId, {
    pageSize: 1,
  })
  const defaultScenarioId =
    scenariosResult.ok && scenariosResult.data.items.length > 0
      ? scenariosResult.data.items[0].scenarioId
      : null

  return {
    defaultBenchmarkId,
    defaultScenarioId,
    recent: all.slice(0, 3),
    apiOk: true,
  }
}
