"use client"

import { useEffect } from "react"
import Link from "next/link"
import { MapContainer, TileLayer } from "react-leaflet"

import { usePlaybackStore } from "@/store/playbackStore"
import type {
  AlgorithmId,
  GraphInfo,
  GraphNode,
  Run,
  Scenario,
} from "@/types/api"

import { AlgorithmLegend } from "./AlgorithmLegend"
import { AlgorithmSwitcher } from "./AlgorithmSwitcher"
import { MultiRunPlaybackLayer } from "./MultiRunPlaybackLayer"
import { PlaybackControls } from "./PlaybackControls"
import { RunPlaybackLayer } from "./RunPlaybackLayer"
import { StepHazardTimeline } from "./StepHazardTimeline"

export type PlaybackMode = "single" | "multi"

interface ScenarioPlaybackShellProps {
  benchmarkId: string
  scenario: Scenario
  run: Run
  runs?: Partial<Record<AlgorithmId, Run>>
  graph: GraphInfo
  nodes: GraphNode[]
  algorithms: AlgorithmId[]
  currentAlgorithm: AlgorithmId
  initialMode?: PlaybackMode
}

const DEFAULT_CENTER: [number, number] = [16.4484, 120.5905]

export function ScenarioPlaybackShell({
  benchmarkId,
  scenario,
  run,
  runs,
  graph,
  nodes,
  algorithms,
  currentAlgorithm,
  initialMode = "single",
}: ScenarioPlaybackShellProps) {
  const load = usePlaybackStore((s) => s.load)
  const loadMulti = usePlaybackStore((s) => s.loadMulti)
  const reset = usePlaybackStore((s) => s.reset)

  const isMulti =
    initialMode === "multi" && runs != null && Object.keys(runs).length > 0

  useEffect(() => {
    if (isMulti && runs) {
      loadMulti(benchmarkId, scenario.scenarioId, runs)
    } else {
      load(benchmarkId, scenario.scenarioId, currentAlgorithm, run)
    }
    return () => reset()
  }, [
    benchmarkId,
    scenario.scenarioId,
    currentAlgorithm,
    run,
    runs,
    isMulti,
    load,
    loadMulti,
    reset,
  ])

  const nodesById = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const center: [number, number] =
    graph.bbox != null
      ? [(graph.bbox[1] + graph.bbox[3]) / 2, (graph.bbox[0] + graph.bbox[2]) / 2]
      : DEFAULT_CENTER

  // Mode toggle navigates rather than mutating client state — keeps the URL
  // as the source of truth so deep links and bookmarks stay accurate.
  const baseHref = `/benchmarks/${encodeURIComponent(benchmarkId)}/scenarios/${encodeURIComponent(scenario.scenarioId)}`
  const singleHref = `${baseHref}?mode=single&algo=${encodeURIComponent(currentAlgorithm)}`
  const multiHref = `${baseHref}?mode=multi`

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="space-y-0.5">
          <div className="font-mono text-sm">{scenario.scenarioId}</div>
          <div className="text-xs text-muted-foreground">
            {scenario.ri} · {scenario.deliveryNodes.length} deliveries · max{" "}
            {scenario.maxSteps} steps
            {isMulti ? " · comparing all algorithms" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border bg-background p-0.5 text-xs">
            <Link
              href={singleHref}
              className={`rounded px-2.5 py-1 transition ${
                isMulti ? "text-muted-foreground hover:bg-muted" : "bg-muted font-medium"
              }`}
              aria-pressed={!isMulti}
            >
              Single
            </Link>
            <Link
              href={multiHref}
              className={`rounded px-2.5 py-1 transition ${
                isMulti ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted"
              }`}
              aria-pressed={isMulti}
            >
              Compare
            </Link>
          </div>
          {!isMulti ? (
            <AlgorithmSwitcher algorithms={algorithms} current={currentAlgorithm} />
          ) : null}
        </div>
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
          {isMulti ? (
            <MultiRunPlaybackLayer nodesById={nodesById} />
          ) : (
            <RunPlaybackLayer nodesById={nodesById} />
          )}
        </MapContainer>
        {isMulti ? (
          <div className="absolute right-4 top-4 z-[400] max-w-xs">
            <AlgorithmLegend />
          </div>
        ) : null}
      </div>

      <PlaybackControls />
      <StepHazardTimeline />
    </div>
  )
}
