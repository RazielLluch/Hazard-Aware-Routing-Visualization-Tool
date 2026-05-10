import { ScenarioPlaybackShellLazy } from "@/components/scenario/ScenarioPlaybackShellLoader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { AlgorithmId, Run } from "@/types/api"

type PlaybackMode = "single" | "multi"

interface PageProps {
  params: Promise<{ id: string; sid: string }>
  searchParams: Promise<{ algo?: string; mode?: string }>
}

export default async function ScenarioPage({ params, searchParams }: PageProps) {
  const { id, sid } = await params
  const { algo: algoParam, mode: modeParam } = await searchParams
  const mode: PlaybackMode = modeParam === "multi" ? "multi" : "single"

  const benchmarkResult = await api.getBenchmark(id)
  if (!benchmarkResult.ok) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Benchmark unavailable</AlertTitle>
          <AlertDescription>{benchmarkResult.error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const benchmark = benchmarkResult.data
  const algorithms = benchmark.algorithms
  if (algorithms.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>No algorithms ran on this benchmark</AlertTitle>
        </Alert>
      </div>
    )
  }

  const algoId =
    algoParam && algorithms.includes(algoParam as AlgorithmId)
      ? (algoParam as AlgorithmId)
      : algorithms[0]

  // In multi mode we fan out one getRun per algorithm so the shell can hand
  // the full map to MultiRunPlaybackLayer. In single mode we only need the
  // currently-selected algorithm's run.
  const runFetches =
    mode === "multi"
      ? algorithms.map((aid) => api.getRun(id, sid, aid))
      : [api.getRun(id, sid, algoId)]

  const [scenarioResult, graphResult, ...runResults] = await Promise.all([
    api.getScenario(id, sid),
    api.getGraph(benchmark.graphId),
    ...runFetches,
  ])

  const runs: Partial<Record<AlgorithmId, Run>> = {}
  if (mode === "multi") {
    for (let i = 0; i < algorithms.length; i++) {
      const r = runResults[i]
      if (r.ok) runs[algorithms[i]] = r.data
    }
  }

  const primaryRunResult =
    mode === "multi"
      ? runResults[Math.max(0, algorithms.indexOf(algoId))]
      : runResults[0]

  if (!scenarioResult.ok || !primaryRunResult || !primaryRunResult.ok || !graphResult.ok) {
    const error =
      (!scenarioResult.ok && scenarioResult.error) ||
      (primaryRunResult && !primaryRunResult.ok && primaryRunResult.error) ||
      (!graphResult.ok && graphResult.error) ||
      "unknown"
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Run data unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const scenario = scenarioResult.data
  const run = primaryRunResult.data

  // Union every node id any rendered run touches so we hydrate the map in
  // one batch. Multi mode pools across all loaded runs; single mode is the
  // primary run only.
  const nodeIdSet = new Set<string>([
    scenario.startNode,
    ...scenario.deliveryNodes,
  ])
  if (mode === "multi") {
    for (const algo of algorithms) {
      const r = runs[algo]
      if (!r) continue
      for (const edge of r.edgeSequence) for (const n of edge) nodeIdSet.add(n)
      for (const n of r.visitOrder) nodeIdSet.add(n)
    }
  } else {
    for (const edge of run.edgeSequence) for (const n of edge) nodeIdSet.add(n)
    for (const n of run.visitOrder) nodeIdSet.add(n)
  }

  const nodesResult = await api.listNodes(scenario.graphId, Array.from(nodeIdSet))
  if (!nodesResult.ok) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Graph nodes unavailable</AlertTitle>
          <AlertDescription>{nodesResult.error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <ScenarioPlaybackShellLazy
      benchmarkId={id}
      scenario={scenario}
      run={run}
      runs={runs}
      graph={graphResult.data}
      nodes={nodesResult.data}
      algorithms={algorithms}
      currentAlgorithm={algoId}
      initialMode={mode}
    />
  )
}
