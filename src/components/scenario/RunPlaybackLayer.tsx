"use client"

import { useEffect, useMemo, useRef } from "react"
import { Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"

import { usePlaybackStore } from "@/store/playbackStore"
import type { GraphNode } from "@/types/api"

interface RunPlaybackLayerProps {
  nodesById: Record<string, GraphNode>
  fitOnLoad?: boolean
}

function hazardColor(flood: number, landslide: number): string {
  const max = Math.max(flood, landslide)
  if (max < 0.2) return "#10b981"
  if (max < 0.5) return "#f59e0b"
  if (max < 0.8) return "#f97316"
  return "#ef4444"
}

function asLatLng(n: GraphNode): [number, number] {
  return [n.location.lat, n.location.lng]
}

export function RunPlaybackLayer({
  nodesById,
  fitOnLoad = true,
}: RunPlaybackLayerProps) {
  const map = useMap()
  const run = usePlaybackStore((s) => s.run)
  const playbackState = usePlaybackStore((s) => s.state)
  const currentStep = usePlaybackStore((s) => s.currentStep)

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

  const traveledSegments = useMemo(() => {
    if (!run) return []
    return run.perEdge.slice(0, currentStep).flatMap((edge) => {
      const u = nodesById[edge.u]
      const v = nodesById[edge.v]
      if (!u || !v) return []
      return [
        {
          positions: [asLatLng(u), asLatLng(v)] as [number, number][],
          color: hazardColor(edge.hazardFlood, edge.hazardLandslide),
        },
      ]
    })
  }, [run, currentStep, nodesById])

  const pendingSegments = useMemo(() => {
    if (!run) return []
    return run.perEdge.slice(currentStep).flatMap((edge) => {
      const u = nodesById[edge.u]
      const v = nodesById[edge.v]
      if (!u || !v) return []
      return [[asLatLng(u), asLatLng(v)] as [number, number][]]
    })
  }, [run, currentStep, nodesById])

  const visitMarkers = useMemo(() => {
    if (!run) return []
    return run.visitOrder.flatMap((nodeId, idx) => {
      const node = nodesById[nodeId]
      if (!node) return []
      const visitedAt =
        idx === 0
          ? 0
          : run.edgeSequence.findIndex(([, target]) => target === nodeId) + 1
      return [
        {
          nodeId,
          position: asLatLng(node),
          index: idx,
          visited: idx === 0 ? true : visitedAt > 0 && currentStep >= visitedAt,
          isDepot: idx === 0,
        },
      ]
    })
  }, [run, nodesById, currentStep])

  useEffect(() => {
    if (!fitOnLoad || !run) return
    const points: L.LatLngTuple[] = []
    for (const edge of run.perEdge) {
      const u = nodesById[edge.u]
      const v = nodesById[edge.v]
      if (u) points.push(asLatLng(u))
      if (v) points.push(asLatLng(v))
    }
    if (points.length === 0) return
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, map, fitOnLoad])

  if (!run) return null

  return (
    <>
      {pendingSegments.map((positions, i) => (
        <Polyline
          key={`pending-${i}`}
          positions={positions}
          pathOptions={{
            color: "#94a3b8",
            weight: 3,
            opacity: 0.4,
            dashArray: "6 6",
          }}
        />
      ))}

      {traveledSegments.map((seg, i) => (
        <Polyline
          key={`traveled-${i}`}
          positions={seg.positions}
          pathOptions={{ color: seg.color, weight: 5, opacity: 0.9 }}
        />
      ))}

      {visitMarkers.map((m) => {
        const fill = m.isDepot ? "#3b82f6" : m.visited ? "#10b981" : "#94a3b8"
        return (
          <Marker
            key={`${m.nodeId}-${m.index}`}
            position={m.position}
            icon={L.divIcon({
              className: "scenario-playback-marker",
              html: `<div style="width:14px;height:14px;border-radius:50%;background:${fill};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
          >
            <Popup>
              <div className="font-mono text-xs">
                {m.isDepot ? "Depot" : `Stop ${m.index}`}: {m.nodeId}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
