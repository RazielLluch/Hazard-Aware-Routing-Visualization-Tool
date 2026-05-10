"use client"

import { ScenarioPlaybackShellLazy } from "@/components/scenario/ScenarioPlaybackShellLoader"
import { Button } from "@/components/ui/button"
import type {
  GraphInfo,
  GraphNode,
  InferenceResponse,
  Run,
  Scenario,
} from "@/types/api"

interface LiveInferenceResultProps {
  result: InferenceResponse
  graph: GraphInfo
  nodes: GraphNode[]
  onPickAgain: () => void
}

const SYNTHETIC_BENCHMARK_ID = "_live"

/** Renders a live single-route inference result through the same playback
 *  shell that the benchmark trial pages use. Synthesises a Scenario and
 *  Run from the InferenceResponse payload (which now carries the scenario
 *  context: blockedEdges, startNode, deliveryNodes, ri). */
export function LiveInferenceResult({
  result,
  graph,
  nodes,
  onPickAgain,
}: LiveInferenceResultProps) {
  const algorithm = result.algorithmId

  const scenario: Scenario = {
    scenarioId: result.scenarioId,
    benchmarkId: SYNTHETIC_BENCHMARK_ID,
    graphId: result.graphId,
    rainLevel: Number(result.ri.replace("RI", "")) as 1 | 2 | 3 | 4 | 5,
    ri: result.ri,
    startNode: result.startNode,
    deliveryNodes: result.deliveryNodes,
    blockedEdges: result.blockedEdges,
    maxSteps: 220,
    activationMode: "deterministic_v3",
    activationSeed: null,
  }

  const run: Run = {
    scenarioId: result.scenarioId,
    algorithmId: result.algorithmId,
    ri: result.ri,
    success: result.success,
    failureReason: result.failureReason,
    replanCount: result.replanCount,
    wallTimeMs: result.wallTimeMs,
    totalTravelTime: result.totalTravelTime,
    totalDistanceM: result.totalDistanceM,
    totalHazardScore: result.totalHazardScore,
    visitOrder: result.visitOrder,
    edgeSequence: result.edgeSequence,
    perEdge: result.perEdge,
    policyMetadata: result.policyMetadata,
    algorithmConfigHash: result.algorithmConfigHash,
  }

  return (
    <div className="relative h-full w-full">
      <ScenarioPlaybackShellLazy
        benchmarkId={SYNTHETIC_BENCHMARK_ID}
        scenario={scenario}
        run={run}
        graph={graph}
        nodes={nodes}
        algorithms={[algorithm]}
        currentAlgorithm={algorithm}
        initialMode="single"
      />
      <div className="absolute right-4 top-4 z-[400] flex items-center gap-2 rounded-md border bg-card/95 px-3 py-2 shadow backdrop-blur">
        <span className="text-xs text-muted-foreground">
          Live · {algorithm} · {result.ri} ·{" "}
          {result.success ? "success" : (result.failureReason ?? "failed")} ·{" "}
          {result.inferenceMs.toFixed(0)} ms
        </span>
        <Button size="sm" variant="outline" onClick={onPickAgain}>
          Pick again
        </Button>
      </div>
    </div>
  )
}
