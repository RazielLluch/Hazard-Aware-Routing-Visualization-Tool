"use client"

import { useMemo } from "react"
import { MapContainer } from "react-leaflet"

import BaseMapLayer from "@/components/map/BaseMapLayer"
import { useCompareStore } from "@/store/compareStore"
import type { GraphExportNode, Profile } from "@/types/api"

import { AgentMarker } from "./AgentMarker"
import { HazardScoreLayer } from "./HazardScoreLayer"
import { MetricStrip } from "./MetricStrip"
import { RouteCompareLayer } from "./RouteCompareLayer"
import { RouteStopsLayer } from "./RouteStopsLayer"
import { SoftBlockedEdgesLayer } from "./SoftBlockedEdgesLayer"
import { useSyncedView } from "./useSyncedView"

const PROFILES: Profile[] = ["fast", "balanced", "safe"]
export const PANE_COLOUR: Record<"left" | "right", string> = {
  left: "#7c3aed",
  right: "#10b981",
}

/** Mounted inside MapContainer so `useMap()` resolves; renders nothing. */
function SyncedView() {
  useSyncedView()
  return null
}

interface ComparePaneProps {
  side: "left" | "right"
}

export function ComparePane({ side }: ComparePaneProps) {
  const selection = useCompareStore((s) => (side === "left" ? s.left : s.right))
  const routeEntry = useCompareStore((s) => (side === "left" ? s.leftRoute : s.rightRoute))
  const setPane = useCompareStore((s) => s.setPane)
  const catalog = useCompareStore((s) => s.catalog)
  const graph = useCompareStore((s) => s.graph)
  const layers = useCompareStore((s) => s.layers)
  const colourMode = useCompareStore((s) => s.routeColourMode)
  const ri = useCompareStore((s) => s.ri)

  const graphPayload = graph.status === "loaded" ? graph.payload : null

  const nodesById = useMemo(() => {
    const map: Record<string, GraphExportNode> = {}
    if (graphPayload) for (const node of graphPayload.nodes) map[node.id] = node
    return map
  }, [graphPayload])

  const networkEdges = useMemo(
    () => graphPayload?.networks[`${ri}:${selection.profile}`] ?? [],
    [graphPayload, ri, selection.profile],
  )
  const softBlocked = useMemo(
    () => networkEdges.filter((edge) => edge.blocked === 1),
    [networkEdges],
  )

  const result = routeEntry.status === "loaded" ? routeEntry.result : null

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          aria-label={`${side} pane profile`}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm capitalize"
          value={selection.profile}
          onChange={(e) =>
            setPane(side, { ...selection, profile: e.target.value as Profile })
          }
        >
          {PROFILES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          aria-label={`${side} pane algorithm`}
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
          value={selection.algorithm}
          onChange={(e) => setPane(side, { ...selection, algorithm: e.target.value })}
        >
          {catalog.length === 0 ? (
            <option value={selection.algorithm}>{selection.algorithm}</option>
          ) : (
            catalog.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-md border border-border">
        <MapContainer center={[16.4484, 120.5905]} zoom={14} className="absolute inset-0">
          <BaseMapLayer />
          <SyncedView />
          {(layers.flood || layers.landslide) && (
            <HazardScoreLayer
              networkEdges={networkEdges}
              nodesById={nodesById}
              showFlood={layers.flood}
              showLandslide={layers.landslide}
            />
          )}
          {layers.softBlocked && (
            <SoftBlockedEdgesLayer softBlockedEdges={softBlocked} nodesById={nodesById} />
          )}
          <RouteCompareLayer
            result={result}
            colourMode={colourMode}
            paneColour={PANE_COLOUR[side]}
          />
          <RouteStopsLayer result={result} />
          <AgentMarker result={result} side={side} />
        </MapContainer>

        {routeEntry.status === "loading" && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/60 text-sm">
            Computing route...
          </div>
        )}
        {routeEntry.status === "error" && (
          <div className="absolute inset-x-0 top-0 z-[1000] bg-destructive/90 px-2 py-1 text-xs text-destructive-foreground">
            {routeEntry.error}
          </div>
        )}
      </div>

      <MetricStrip result={result} />
    </div>
  )
}
