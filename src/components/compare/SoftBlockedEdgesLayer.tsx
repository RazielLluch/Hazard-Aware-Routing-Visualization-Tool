"use client"

import { LayerGroup, Polyline, Tooltip } from "react-leaflet"

import type { GraphExportNode, NetworkEdge } from "@/types/api"

interface SoftBlockedEdgesLayerProps {
  /** Edges with `blocked === 1` for the active (RI, profile) network. */
  softBlockedEdges: NetworkEdge[]
  nodesById: Record<string, GraphExportNode>
}

/**
 * Soft-blocked edges as red dashed polylines. Under the Macro-DDQN
 * soft-blocking model a "blocked" edge stays *traversable* — at 7x travel time
 * and 40x hazard exposure — so it is styled distinctly from a hard block and
 * carries a tooltip making that explicit.
 */
export function SoftBlockedEdgesLayer({
  softBlockedEdges,
  nodesById,
}: SoftBlockedEdgesLayerProps) {
  return (
    <LayerGroup>
      {softBlockedEdges.map((edge, i) => {
        const a = nodesById[edge.u]
        const b = nodesById[edge.v]
        if (!a || !b) return null
        return (
          <Polyline
            key={`soft-${edge.u}-${edge.v}-${i}`}
            positions={[
              [a.y, a.x],
              [b.y, b.x],
            ]}
            pathOptions={{
              color: "#dc2626",
              weight: 4,
              opacity: 0.85,
              dashArray: "6 6",
              lineCap: "round",
            }}
          >
            <Tooltip sticky>
              Soft-blocked &mdash; passable at 7&times; cost / 40&times; hazard exposure
            </Tooltip>
          </Polyline>
        )
      })}
    </LayerGroup>
  )
}
