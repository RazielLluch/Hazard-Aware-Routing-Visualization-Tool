"use client"

import { CircleMarker, LayerGroup, Polyline, Tooltip } from "react-leaflet"

import { usePlaybackStore } from "@/store/playbackStore"
import type { GraphNode } from "@/types/api"

interface BlockEncounterMarkersProps {
  nodesById: Record<string, GraphNode>
}

/** Renders block-encounter markers from the run's per-edge trace.
 *
 * For every step where `wasReplan=true`, draws:
 * - A distinct yellow CircleMarker at the step's cursor (the node where the
 *   planner detected a block and rerouted).
 * - A faint ghost Polyline from the cursor to `plannedNextEdge[1]` — the
 *   originally-planned-but-blocked destination — so the viewer sees what
 *   the agent attempted before deciding to take the actual path.
 *
 * Steps without `plannedNextEdge` (e.g. legacy v2 routes) still get a
 * marker but no ghost line; the marker by itself is enough to flag "agent
 * replanned here." */
export function BlockEncounterMarkers({ nodesById }: BlockEncounterMarkersProps) {
  const run = usePlaybackStore((s) => s.run)
  if (!run || run.perEdge.length === 0) return null

  return (
    <LayerGroup>
      {run.perEdge.map((edge, i) => {
        if (!edge.wasReplan) return null
        const cursor = nodesById[edge.u]
        if (!cursor) return null

        const planned = edge.plannedNextEdge
        const ghostTarget = planned ? nodesById[planned[1]] : null

        return (
          <LayerGroup key={`replan-${i}`}>
            {ghostTarget && (
              <Polyline
                positions={[
                  [cursor.location.lat, cursor.location.lng],
                  [ghostTarget.location.lat, ghostTarget.location.lng],
                ]}
                pathOptions={{
                  color: "#eab308",
                  weight: 3,
                  opacity: 0.55,
                  dashArray: "2 5",
                }}
              />
            )}
            <CircleMarker
              center={[cursor.location.lat, cursor.location.lng]}
              radius={7}
              pathOptions={{
                color: "#eab308",
                fillColor: "#fef3c7",
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} sticky>
                <div className="space-y-0.5 text-xs">
                  <div className="font-medium">Replan at step {edge.step}</div>
                  {planned ? (
                    <div>
                      Tried {planned[0]} → {planned[1]}, went {edge.u} → {edge.v}
                    </div>
                  ) : (
                    <div>Re-routed at this node (no planned-edge data).</div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          </LayerGroup>
        )
      })}
    </LayerGroup>
  )
}
