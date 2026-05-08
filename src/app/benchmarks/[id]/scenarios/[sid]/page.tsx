import dynamic from "next/dynamic"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { AlgorithmId } from "@/types/api"

const ScenarioPlaybackShell = dynamic(
  () =>
    import("@/components/scenario/ScenarioPlaybackShell").then(
      (m) => m.ScenarioPlaybackShell,
    ),
  { ssr: false },
)

interface PageProps {
  params: Promise<{ id: string; sid: string }>
  searchParams: Promise<{ algo?: string }>
}

export default async function ScenarioPage({ params, searchParams }: PageProps) {
  const { id, sid } = await params
  const { algo: algoParam } = await searchParams

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

  const [scenarioResult, runResult, graphResult] = await Promise.all([
    api.getScenario(id, sid),
    api.getRun(id, sid, algoId),
    api.getGraph(benchmark.graphId),
  ])

  if (!scenarioResult.ok || !runResult.ok || !graphResult.ok) {
    const error =
      (!scenarioResult.ok && scenarioResult.error) ||
      (!runResult.ok && runResult.error) ||
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
  const run = runResult.data

  const allNodeIds = Array.from(
    new Set<string>([
      scenario.startNode,
      ...scenario.deliveryNodes,
      ...run.edgeSequence.flat(),
      ...run.visitOrder,
    ]),
  )

  const nodesResult = await api.listNodes(scenario.graphId, allNodeIds)
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
    <ScenarioPlaybackShell
      benchmarkId={id}
      scenario={scenario}
      run={run}
      graph={graphResult.data}
      nodes={nodesResult.data}
      algorithms={algorithms}
      currentAlgorithm={algoId}
    />
  )
}
