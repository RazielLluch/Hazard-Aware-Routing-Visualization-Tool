"use client"

import { MapContainer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import BaseMapLayer from "@/components/map/BaseMapLayer"
import { BundleMapLayer } from "@/components/bundle/BundleMapLayer"
import type { GraphInfo, GraphNode } from "@/types/api"

interface BundleMapProps {
  graphInfo: GraphInfo | null
  nodes: GraphNode[]
}

/**
 * Self-contained Leaflet map for the bundle picker. Lives in its own
 * module so the page can `dynamic(() => import(...), { ssr: false })`
 * it -- top-level imports of react-leaflet/leaflet reference `window`
 * during module evaluation, which crashes Next.js SSR.
 */
export default function BundleMap({ graphInfo, nodes }: BundleMapProps) {
  const center: [number, number] = graphInfo?.bbox
    ? [
        (graphInfo.bbox[1] + graphInfo.bbox[3]) / 2,
        (graphInfo.bbox[0] + graphInfo.bbox[2]) / 2,
      ]
    : [16.4484, 120.5905]

  return (
    <MapContainer center={center} zoom={14} className="absolute inset-0 z-0">
      <BaseMapLayer />
      <BundleMapLayer nodes={nodes} />
    </MapContainer>
  )
}
