"use client"

import { LayerGroup, Polyline } from "react-leaflet"

import type { GraphExportNode, NetworkEdge } from "@/types/api"

interface HazardScoreLayerProps {
  networkEdges: NetworkEdge[]
  nodesById: Record<string, GraphExportNode>
  showFlood: boolean
  showLandslide: boolean
}

/**
 * Per-edge hazard tinting from the GraphExport network. Flood-active edges
 * tint blue, landslide-active edges orange, each scaled by its score. Replaces
 * the static raster HazardLayers for the score-aware /compare view (the raster
 * tiles cannot vary opacity per edge).
 */
export function HazardScoreLayer({
  networkEdges,
  nodesById,
  showFlood,
  showLandslide,
}: HazardScoreLayerProps) {
  return (
    <LayerGroup>
      {networkEdges.map((edge, i) => {
        const a = nodesById[edge.u]
        const b = nodesById[edge.v]
        if (!a || !b) return null
        const positions: [number, number][] = [
          [a.y, a.x],
          [b.y, b.x],
        ]
        const showF = showFlood && edge.flood_active === 1 && edge.flood > 0
        const showL = showLandslide && edge.landslide_active === 1 && edge.landslide > 0
        if (!showF && !showL) return null
        return (
          <LayerGroup key={`hz-${edge.u}-${edge.v}-${i}`}>
            {showF && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#2563eb",
                  weight: 3,
                  opacity: 0.25 + 0.5 * Math.min(1, edge.flood),
                }}
              />
            )}
            {showL && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#ea580c",
                  weight: 3,
                  opacity: 0.25 + 0.5 * Math.min(1, edge.landslide),
                }}
              />
            )}
          </LayerGroup>
        )
      })}
    </LayerGroup>
  )
}
