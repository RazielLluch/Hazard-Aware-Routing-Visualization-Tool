"use client"

import { usePlaybackStore } from "@/store/playbackStore"
import type { AlgorithmId } from "@/types/api"
import { ALGORITHM_COLORS } from "./MultiRunPlaybackLayer"

export function AlgorithmLegend() {
  const runs = usePlaybackStore((s) => s.runs)
  const visibleAlgorithms = usePlaybackStore((s) => s.visibleAlgorithms)
  const toggleVisibility = usePlaybackStore(
    (s) => s.toggleAlgorithmVisibility,
  )

  const algorithmIds = Object.keys(runs) as AlgorithmId[]
  if (algorithmIds.length === 0) return null

  const visible = new Set(visibleAlgorithms)

  return (
    <div className="bg-background/80 border-t backdrop-blur-sm">
      <div className="flex flex-wrap gap-2 p-3 text-xs">
        {algorithmIds.map((id) => {
          const run = runs[id]
          if (!run) return null
          const isVisible = visible.has(id)
          const color = ALGORITHM_COLORS[id]
          const successLabel = run.success ? "✓" : "✗"
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleVisibility(id)}
              className={
                "flex items-center gap-2 rounded-md border px-2 py-1 transition " +
                (isVisible
                  ? "border-foreground/20 bg-background"
                  : "border-foreground/10 bg-muted text-muted-foreground")
              }
              aria-pressed={isVisible}
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full border border-white shadow"
                style={{
                  background: color,
                  opacity: isVisible ? 1 : 0.4,
                }}
              />
              <span className="font-mono">{id}</span>
              <span
                className={
                  "rounded px-1 text-[10px] " +
                  (run.success
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700")
                }
              >
                {successLabel}
              </span>
              <span className="text-muted-foreground">
                {run.perEdge.length} steps
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
