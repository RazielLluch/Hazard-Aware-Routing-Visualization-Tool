"use client"

import { useEffect, useMemo, useRef } from "react"
import L from "leaflet"
import { Pane, Polyline, useMap } from "react-leaflet"

import { usePlaybackStore } from "@/store/playbackStore"
import type { AlgorithmId, GraphNode, Run } from "@/types/api"

interface MultiRunPlaybackLayerProps {
  nodesById: Record<string, GraphNode>
  fitOnLoad?: boolean
}

/**
 * Stable per-algorithm color palette. Each algorithm gets a distinct hue
 * so they're distinguishable on the same map. Adding a new AlgorithmId
 * requires extending this map.
 */
export const ALGORITHM_COLORS: Record<AlgorithmId, string> = {
  "NNA-Dijkstra": "#0ea5e9",
  "NNA-AStar": "#22d3ee",
  "NNA-Dijkstra-HA": "#10b981",
  "NNA-Dijkstra-Blind": "#a855f7",
  "NNA-AStar-Blind": "#ec4899",
  "NNA-Dijkstra-HA-Blind": "#f59e0b",
  "DQN@balanced_HF": "#ef4444",
  "DQN@fast_HF": "#f97316",
  "DQN@safe_HF": "#84cc16",
}

const ALGORITHM_DRAW_ORDER: AlgorithmId[] = [
  "NNA-Dijkstra",
  "NNA-AStar",
  "NNA-Dijkstra-Blind",
  "NNA-AStar-Blind",
  "NNA-Dijkstra-HA",
  "NNA-Dijkstra-HA-Blind",
  "DQN@balanced_HF",
  "DQN@fast_HF",
  "DQN@safe_HF",
]

function asLatLng(n: GraphNode): [number, number] {
  return [n.location.lat, n.location.lng]
}

interface AlgorithmRunSegmentsProps {
  algorithmId: AlgorithmId
  run: Run
  nodesById: Record<string, GraphNode>
  currentStep: number
  paneIndex: number
  color: string
}

function AlgorithmRunSegments({
  algorithmId,
  run,
  nodesById,
  currentStep,
  paneIndex,
  color,
}: AlgorithmRunSegmentsProps) {
  const traveled = useMemo(() => {
    return run.perEdge.slice(0, currentStep).flatMap((edge) => {
      const u = nodesById[edge.u]
      const v = nodesById[edge.v]
      if (!u || !v) return []
      return [[asLatLng(u), asLatLng(v)] as [number, number][]]
    })
  }, [run, currentStep, nodesById])

  const pending = useMemo(() => {
    return run.perEdge.slice(currentStep).flatMap((edge) => {
      const u = nodesById[edge.u]
      const v = nodesById[edge.v]
      if (!u || !v) return []
      return [[asLatLng(u), asLatLng(v)] as [number, number][]]
    })
  }, [run, currentStep, nodesById])

  // Pending sits below traveled so the moving frontier is always visible.
  // Each algorithm reserves a 2-slot z-band so its pending+traveled don't
  // interleave with another algorithm's pending/traveled.
  const baseZ = 200 + paneIndex * 2

  return (
    <>
      <Pane name={`algo-${algorithmId}-pending`} style={{ zIndex: baseZ }}>
        {pending.map((positions, i) => (
          <Polyline
            key={`pending-${algorithmId}-${i}`}
            positions={positions}
            pathOptions={{
              color,
              weight: 3,
              opacity: 0.35,
              dashArray: "6 6",
            }}
          />
        ))}
      </Pane>
      <Pane
        name={`algo-${algorithmId}-traveled`}
        style={{ zIndex: baseZ + 1 }}
      >
        {traveled.map((positions, i) => (
          <Polyline
            key={`traveled-${algorithmId}-${i}`}
            positions={positions}
            pathOptions={{ color, weight: 5, opacity: 0.9 }}
          />
        ))}
      </Pane>
    </>
  )
}

export function MultiRunPlaybackLayer({
  nodesById,
  fitOnLoad = true,
}: MultiRunPlaybackLayerProps) {
  const map = useMap()
  const runs = usePlaybackStore((s) => s.runs)
  const visibleAlgorithms = usePlaybackStore((s) => s.visibleAlgorithms)
  const playbackState = usePlaybackStore((s) => s.state)
  const currentStep = usePlaybackStore((s) => s.currentStep)

  // Drive the rAF tick from the primary `run` field already managed by the
  // single-run code path. `loadMulti` sets the primary to the longest run
  // so playback never finishes prematurely on shorter algorithms.
  const accumulatorRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (playbackState !== "playing") {
      lastTimeRef.current = null
      accumulatorRef.current = 0
      return
    }
    let rafId = 0
    const tick = (now: number) => {
      const last = lastTimeRef.current ?? now
      const dt = now - last
      lastTimeRef.current = now
      const fresh = usePlaybackStore.getState()
      if (!fresh.run || fresh.state !== "playing") return
      const edge = fresh.run.perEdge[fresh.currentStep]
      const stepDurationMs = edge
        ? Math.max(150, Math.min(2000, edge.travelTime * 800))
        : 200
      accumulatorRef.current += dt * fresh.speed
      if (accumulatorRef.current >= stepDurationMs) {
        accumulatorRef.current -= stepDurationMs
        fresh.advanceStep()
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [playbackState])

  useEffect(() => {
    if (!fitOnLoad) return
    const points: L.LatLngTuple[] = []
    for (const id of Object.keys(runs) as AlgorithmId[]) {
      const run = runs[id]
      if (!run) continue
      for (const edge of run.perEdge) {
        const u = nodesById[edge.u]
        const v = nodesById[edge.v]
        if (u) points.push(asLatLng(u))
        if (v) points.push(asLatLng(v))
      }
    }
    if (points.length === 0) return
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, map, fitOnLoad])

  const visible = new Set(visibleAlgorithms)

  return (
    <>
      {ALGORITHM_DRAW_ORDER.map((algorithmId, idx) => {
        const run = runs[algorithmId]
        if (!run || !visible.has(algorithmId)) return null
        return (
          <AlgorithmRunSegments
            key={algorithmId}
            algorithmId={algorithmId}
            run={run}
            nodesById={nodesById}
            currentStep={Math.min(currentStep, run.perEdge.length)}
            paneIndex={idx}
            color={ALGORITHM_COLORS[algorithmId]}
          />
        )
      })}
    </>
  )
}
