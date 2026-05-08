"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { usePlaybackStore } from "@/store/playbackStore"

const chartConfig = {
  hazardFlood: { label: "Flood", color: "var(--chart-1)" },
  hazardLandslide: { label: "Landslide", color: "var(--chart-3)" },
} satisfies ChartConfig

export function StepHazardTimeline() {
  const run = usePlaybackStore((s) => s.run)
  const currentStep = usePlaybackStore((s) => s.currentStep)

  if (!run || run.perEdge.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center border-t text-xs text-muted-foreground">
        No per-step hazard data for this run.
      </div>
    )
  }

  const data = run.perEdge.map((edge, i) => ({
    step: i,
    hazardFlood: edge.hazardFlood,
    hazardLandslide: edge.hazardLandslide,
  }))

  return (
    <div className="border-t bg-background/95 px-4 py-3 backdrop-blur">
      <ChartContainer config={chartConfig} className="h-28 w-full">
        <AreaChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="step" tickLine={false} axisLine={false} tickMargin={6} fontSize={10} />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
            tickFormatter={(v) => v.toFixed(1)}
            fontSize={10}
            width={28}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="hazardFlood"
            type="monotone"
            stroke="var(--color-hazardFlood)"
            fill="var(--color-hazardFlood)"
            fillOpacity={0.35}
            stackId="hazards"
          />
          <Area
            dataKey="hazardLandslide"
            type="monotone"
            stroke="var(--color-hazardLandslide)"
            fill="var(--color-hazardLandslide)"
            fillOpacity={0.35}
            stackId="hazards"
          />
          <ReferenceLine
            x={currentStep}
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
