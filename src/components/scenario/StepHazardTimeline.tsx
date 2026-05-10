"use client"

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
  cumulative: { label: "Cumulative", color: "var(--chart-5)" },
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

  // Build per-step data with a running cumulative total of (flood + landslide)
  // hazard scores. The cumulative axis lives on the right so it can scale
  // independently of the [0,1] per-step axis on the left.
  let runningTotal = 0
  const data = run.perEdge.map((edge, i) => {
    runningTotal += edge.hazardFlood + edge.hazardLandslide
    return {
      step: i,
      hazardFlood: edge.hazardFlood,
      hazardLandslide: edge.hazardLandslide,
      cumulative: runningTotal,
    }
  })
  const cumulativeMax = data.length > 0 ? data[data.length - 1].cumulative : 0
  // Step indices where the agent replanned around a blocked edge — drawn as
  // faint vertical reference lines so the chart calls out the same moments
  // that BlockEncounterMarkers highlights on the map.
  const replanSteps = run.perEdge
    .map((edge, i) => (edge.wasReplan ? i : null))
    .filter((i): i is number => i !== null)

  return (
    <div className="border-t bg-background/95 px-4 py-3 backdrop-blur">
      <ChartContainer config={chartConfig} className="h-28 w-full">
        <ComposedChart data={data} margin={{ left: 12, right: 16, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="step" tickLine={false} axisLine={false} tickMargin={6} fontSize={10} />
          <YAxis
            yAxisId="per-step"
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
            tickFormatter={(v) => v.toFixed(1)}
            fontSize={10}
            width={28}
          />
          <YAxis
            yAxisId="cumulative"
            orientation="right"
            tickLine={false}
            axisLine={false}
            domain={[0, Math.max(1, Math.ceil(cumulativeMax))]}
            tickFormatter={(v) => v.toFixed(0)}
            fontSize={10}
            width={28}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            yAxisId="per-step"
            dataKey="hazardFlood"
            type="monotone"
            stroke="var(--color-hazardFlood)"
            fill="var(--color-hazardFlood)"
            fillOpacity={0.35}
            stackId="hazards"
          />
          <Area
            yAxisId="per-step"
            dataKey="hazardLandslide"
            type="monotone"
            stroke="var(--color-hazardLandslide)"
            fill="var(--color-hazardLandslide)"
            fillOpacity={0.35}
            stackId="hazards"
          />
          <Line
            yAxisId="cumulative"
            dataKey="cumulative"
            type="monotone"
            stroke="var(--color-cumulative)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {replanSteps.map((stepIdx) => (
            <ReferenceLine
              key={`replan-line-${stepIdx}`}
              yAxisId="per-step"
              x={stepIdx}
              stroke="#eab308"
              strokeWidth={1.5}
              strokeDasharray="1 3"
              opacity={0.7}
            />
          ))}
          <ReferenceLine
            yAxisId="per-step"
            x={currentStep}
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
