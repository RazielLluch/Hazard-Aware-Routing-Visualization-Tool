"use client"

import { CircleMarker, Tooltip, useMapEvents } from "react-leaflet"
import type { GraphNode, LatLng } from "@/types/api"
import { findNearestNode } from "@/lib/spatial"
import { useBundleStore } from "@/store/bundleStore"

interface BundleMapLayerProps {
  /** All nodes available for selection. Caller fetches via api.listNodes. */
  nodes: readonly GraphNode[]
}

/**
 * Map child component that captures clicks and routes them to the bundle
 * store as depot/stop selections, plus renders the current selection as
 * coloured markers.
 *
 * MUST be rendered as a descendant of `<MapContainer>` so `useMapEvents`
 * can attach to the map instance.
 */
export function BundleMapLayer({ nodes }: BundleMapLayerProps) {
  const mode = useBundleStore((s) => s.mode)
  const depot = useBundleStore((s) => s.depot)
  const stops = useBundleStore((s) => s.stops)
  const setDepot = useBundleStore((s) => s.setDepot)
  const addStop = useBundleStore((s) => s.addStop)
  const removeStop = useBundleStore((s) => s.removeStop)

  useMapEvents({
    click: (event) => {
      const target: LatLng = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      }
      const nearest = findNearestNode(target, nodes)
      if (!nearest) return
      if (mode === "depot") {
        setDepot(nearest.id)
      } else {
        addStop(nearest.id)
      }
    },
  })

  const nodeById = new Map(nodes.map((n) => [n.id, n]))

  return (
    <>
      {depot && nodeById.has(depot) && (
        <CircleMarker
          center={[
            nodeById.get(depot)!.location.lat,
            nodeById.get(depot)!.location.lng,
          ]}
          radius={9}
          pathOptions={{
            color: "#0ea5e9",
            fillColor: "#0ea5e9",
            fillOpacity: 0.9,
            weight: 2,
          }}
          eventHandlers={{ click: () => setDepot(null) }}
        >
          <Tooltip>Depot ({depot}) — click to clear</Tooltip>
        </CircleMarker>
      )}
      {stops.map((stopId, idx) =>
        nodeById.has(stopId) ? (
          <CircleMarker
            key={stopId}
            center={[
              nodeById.get(stopId)!.location.lat,
              nodeById.get(stopId)!.location.lng,
            ]}
            radius={7}
            pathOptions={{
              color: "#f97316",
              fillColor: "#f97316",
              fillOpacity: 0.85,
              weight: 2,
            }}
            eventHandlers={{ click: () => removeStop(stopId) }}
          >
            <Tooltip>
              Stop #{idx + 1} ({stopId}) — click to remove
            </Tooltip>
          </CircleMarker>
        ) : null,
      )}
    </>
  )
}
