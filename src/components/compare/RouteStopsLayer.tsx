"use client"

import { LayerGroup, Marker, Tooltip } from "react-leaflet"

import type { InferenceResponseV2 } from "@/types/api"

import { DEPOT_ICON, stopIconFor } from "./markerIcons"

interface RouteStopsLayerProps {
  result: InferenceResponseV2 | null
}

export function RouteStopsLayer({ result }: RouteStopsLayerProps) {
  if (!result) return null

  const depotInOrder = result.visit_order[0] === result.start.id
  const stopNumberFor = (deliveryId: string): number => {
    const idx = result.visit_order.indexOf(deliveryId)
    if (idx < 0) return 0
    return depotInOrder ? idx : idx + 1
  }

  return (
    <LayerGroup>
      <Marker position={[result.start.lat, result.start.lng]} icon={DEPOT_ICON}>
        <Tooltip>Depot ({result.start.id})</Tooltip>
      </Marker>

      {result.deliveries.map((delivery) => (
        <Marker
          key={delivery.id}
          position={[delivery.lat, delivery.lng]}
          icon={stopIconFor(stopNumberFor(delivery.id))}
        />
      ))}
    </LayerGroup>
  )
}
