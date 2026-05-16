"use client"

import { LayerGroup, Polyline } from "react-leaflet"

import type { RouteColourMode } from "@/store/compareStore"
import type { InferenceResponseV2 } from "@/types/api"

interface RouteCompareLayerProps {
  result: InferenceResponseV2 | null
  colourMode: RouteColourMode
  /** Solid-mode colour — distinct per pane (left vs right). */
  paneColour: string
}

/**
 * Combined-hazard HSL ramp: green (safe) -> red (hazardous). Mirrors the
 * static route_viewer.html mapping. The v2 inference response already carries
 * per-segment flood/landslide hazard, so no graph join is needed.
 */
function hazardColour(score: number): string {
  const clamped = Math.min(1, Math.max(0, score))
  const hue = 128 - clamped * 128
  const light = 42 + (1 - clamped) * 4
  return `hsl(${hue} 70% ${light}%)`
}

/** Renders an InferenceResponseV2's legs[].segments[] as map polylines. */
export function RouteCompareLayer({
  result,
  colourMode,
  paneColour,
}: RouteCompareLayerProps) {
  if (!result) return null
  return (
    <LayerGroup>
      {result.legs.flatMap((leg, legIdx) =>
        leg.segments.map((seg, segIdx) => {
          const positions = seg.coordinates.map(
            (c) => [c.lat, c.lng] as [number, number],
          )
          const colour =
            colourMode === "combined_hazard"
              ? hazardColour(Math.max(seg.flood_hazard, seg.landslide_hazard))
              : paneColour
          return (
            <Polyline
              key={`leg-${legIdx}-seg-${segIdx}`}
              positions={positions}
              pathOptions={{ color: colour, weight: 5, opacity: 0.9, lineCap: "round" }}
            />
          )
        }),
      )}
    </LayerGroup>
  )
}
