"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

import { BundlePicker } from "@/components/bundle/BundlePicker"
import { api } from "@/lib/api"
import type { GraphInfo, GraphNode } from "@/types/api"

const DEFAULT_GRAPH_ID = "la_trinidad_subgraph_n200"

// react-leaflet's MapContainer references `window` at module evaluation,
// so the leaflet-touching subtree must load client-only via next/dynamic.
const BundleMap = dynamic(() => import("@/components/bundle/BundleMap"), {
  ssr: false,
})

export default function BundlesPage() {
  const [graphInfo, setGraphInfo] = useState<GraphInfo | null>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [graphRes, nodesRes] = await Promise.all([
        api.getGraph(DEFAULT_GRAPH_ID),
        api.listNodes(DEFAULT_GRAPH_ID),
      ])
      if (cancelled) return
      if (!graphRes.ok) {
        setLoadError(graphRes.error)
        return
      }
      if (!nodesRes.ok) {
        setLoadError(nodesRes.error)
        return
      }
      setGraphInfo(graphRes.data)
      setNodes(nodesRes.data)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative grid h-[calc(100vh-4rem)] grid-cols-[1fr_360px]">
      <div className="relative">
        {loadError && (
          <div className="bg-destructive text-destructive-foreground absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-md px-4 py-2">
            {loadError}
          </div>
        )}
        <BundleMap graphInfo={graphInfo} nodes={nodes} />
      </div>
      <aside className="overflow-y-auto border-l">
        <BundlePicker graphId={DEFAULT_GRAPH_ID} />
      </aside>
    </div>
  )
}
