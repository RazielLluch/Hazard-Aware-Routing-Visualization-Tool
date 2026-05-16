"use client"

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { useCompareStore } from "@/store/compareStore"
import type { RouteMetricsV2 } from "@/types/api"

import { PANE_COLOUR } from "./ComparePane"

interface Row {
  metric: string
  left: number
  right: number
  leftDisplay: string
  rightDisplay: string
}

const fmt = (value: number | undefined, suffix = ""): string =>
  value === undefined ? "--" : `${value.toFixed(2)}${suffix}`

function buildRows(
  l: RouteMetricsV2 | undefined,
  r: RouteMetricsV2 | undefined,
): Row[] {
  const peer = (a: number | undefined, b: number | undefined): number =>
    Math.max(a ?? 0, b ?? 0, 0.0001)
  const norm = (v: number | undefined, p: number): number =>
    v === undefined ? 0 : Math.min(1, v / p)

  const riskPeer = peer(l?.common_risk_exposure, r?.common_risk_exposure)
  const timePeer = peer(l?.time_min, r?.time_min)
  const blockPeer = peer(l?.blockage_exposure, r?.blockage_exposure)
  const distPeer = peer(l?.distance_km, r?.distance_km)

  return [
    {
      metric: "Common risk",
      left: norm(l?.common_risk_exposure, riskPeer),
      right: norm(r?.common_risk_exposure, riskPeer),
      leftDisplay: fmt(l?.common_risk_exposure),
      rightDisplay: fmt(r?.common_risk_exposure),
    },
    {
      metric: "Travel time",
      left: norm(l?.time_min, timePeer),
      right: norm(r?.time_min, timePeer),
      leftDisplay: fmt(l?.time_min, " min"),
      rightDisplay: fmt(r?.time_min, " min"),
    },
    {
      metric: "Blockage exp",
      left: norm(l?.blockage_exposure, blockPeer),
      right: norm(r?.blockage_exposure, blockPeer),
      leftDisplay: fmt(l?.blockage_exposure),
      rightDisplay: fmt(r?.blockage_exposure),
    },
    {
      metric: "Distance",
      left: norm(l?.distance_km, distPeer),
      right: norm(r?.distance_km, distPeer),
      leftDisplay: fmt(l?.distance_km, " km"),
      rightDisplay: fmt(r?.distance_km, " km"),
    },
  ]
}

export function MetricCompareChart() {
  const leftRoute = useCompareStore((s) => s.leftRoute)
  const rightRoute = useCompareStore((s) => s.rightRoute)
  const l = leftRoute.status === "loaded" ? leftRoute.result.metrics : undefined
  const r = rightRoute.status === "loaded" ? rightRoute.result.metrics : undefined

  if (!l && !r) return null

  const rows = buildRows(l, r)
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Side-by-side metric comparison (bar length = relative magnitude)</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-3 rounded-sm"
              style={{ background: PANE_COLOUR.left }}
            />
            Left
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-3 rounded-sm"
              style={{ background: PANE_COLOUR.right }}
            />
            Right
          </span>
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 96, bottom: 4, left: 4 }}
            barCategoryGap={12}
            barGap={4}
          >
            <XAxis type="number" domain={[0, 1]} hide />
            <YAxis
              type="category"
              dataKey="metric"
              tickLine={false}
              axisLine={false}
              width={96}
              tick={{ fontSize: 11, fill: "currentColor" }}
            />
            <Bar
              dataKey="left"
              fill={PANE_COLOUR.left}
              radius={[0, 4, 4, 0]}
              barSize={12}
            >
              <LabelList
                dataKey="leftDisplay"
                position="right"
                style={{ fontSize: 10, fill: "currentColor" }}
              />
            </Bar>
            <Bar
              dataKey="right"
              fill={PANE_COLOUR.right}
              radius={[0, 4, 4, 0]}
              barSize={12}
            >
              <LabelList
                dataKey="rightDisplay"
                position="right"
                style={{ fontSize: 10, fill: "currentColor" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
