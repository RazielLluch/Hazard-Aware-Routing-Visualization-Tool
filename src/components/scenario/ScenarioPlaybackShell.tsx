"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer } from "react-leaflet"

import { usePlaybackStore } from "@/store/playbackStore"
import type {
  AlgorithmId,
  GraphInfo,
  GraphNode,
  Run,
  Scenario,
} from "@/types/api"

import { AlgorithmSwitcher } from "./AlgorithmSwitcher"
import { PlaybackControls } from "./PlaybackControls"
import { RunPlaybackLayer } from "./RunPlaybackLayer"
import { StepHazardTimeline } from "./StepHazardTimeline"

interface ScenarioPlaybackShellProps {
  benchmarkId: string
  scenario: Scenario
  run: Run
  graph: GraphInfo
  nodes: GraphNode[]
  algorithms: AlgorithmId[]
  currentAlgorithm: AlgorithmId
}

const DEFAULT_CENTER: [number, number] = [16.4484, 120.5905]

export function ScenarioPlaybackShell({
  benchmarkId,
  scenario,
  run,
  graph,
  nodes,
  algorithms,
  currentAlgorithm,
}: ScenarioPlaybackShellProps) {
  const load = usePlaybackStore((s) => s.load)
  const reset = usePlaybackStore((s) => s.reset)

  useEffect(() => {
    load(benchmarkId, scenario.scenarioId, currentAlgorithm, run)
    return () => reset()
  }, [benchmarkId, scenario.scenarioId, currentAlgorithm, run, load, reset])

  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const center: [number, number] =
    graph.bbox != null
      ? [(graph.bbox[1] + graph.bbox[3]) / 2, (graph.bbox[0] + graph.bbox[2]) / 2]
      : DEFAULT_CENTER

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="space-y-0.5">
          <div className="font-mono text-sm">{scenario.scenarioId}</div>
          <div className="text-xs text-muted-foreground">
            {scenario.ri} · {scenario.deliveryNodes.length} deliveries · max{" "}
            {scenario.maxSteps} steps
          </div>
        </div>
        <AlgorithmSwitcher algorithms={algorithms} current={currentAlgorithm} />
      </div>

      <div className="relative flex-1">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RunPlaybackLayer nodesById={nodesById} />
        </MapContainer>
      </div>

      <PlaybackControls />
      <StepHazardTimeline />
    </div>
  )
}
