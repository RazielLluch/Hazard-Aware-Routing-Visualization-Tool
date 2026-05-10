"use client"

import { LayerGroup, Polyline } from "react-leaflet"

import type { GraphNode } from "@/types/api"

interface BlockedEdgesLayerProps {
  /** [u, v] pairs of OSM node ids that are blocked under the active RI. */
  blockedEdges: [string, string][]
  /** Node lookup map (id → GraphNode with location.lat/lng). */
  nodesById: Record<string, GraphNode>
}

/** Renders the scenario's blocked-edge set as red dashed polylines on the
 *  map. Each polyline draws between the (u, v) endpoints; missing nodes are
 *  silently skipped (defensive against partial node hydration). */
export function BlockedEdgesLayer({ blockedEdges, nodesById }: BlockedEdgesLayerProps) {
  return (
    <LayerGroup>
      {blockedEdges.map(([u, v], i) => {
        const a = nodesById[u]
        const b = nodesById[v]
        if (!a || !b) return null
        return (
          <Polyline
            key={`${u}-${v}-${i}`}
            positions={[
              [a.location.lat, a.location.lng],
              [b.location.lat, b.location.lng],
            ]}
            pathOptions={{
              color: "#dc2626",
              weight: 4,
              opacity: 0.85,
              dashArray: "6 6",
              lineCap: "round",
            }}
          />
        )
      })}
    </LayerGroup>
  )
}
