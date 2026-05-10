"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon, PauseIcon, ReloadIcon } from "@hugeicons/core-free-icons"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { usePlaybackStore, type PlaybackSpeed } from "@/store/playbackStore"

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 5]

export function PlaybackControls() {
  const state = usePlaybackStore((s) => s.state)
  const run = usePlaybackStore((s) => s.run)
  const currentStep = usePlaybackStore((s) => s.currentStep)
  const speed = usePlaybackStore((s) => s.speed)
  const toggle = usePlaybackStore((s) => s.toggle)
  const setStep = usePlaybackStore((s) => s.setStep)
  const setSpeed = usePlaybackStore((s) => s.setSpeed)

  const totalSteps = run?.perEdge.length ?? 0
  const isPlaying = state === "playing"
  const isFinished = state === "finished"
  const disabled = !run || state === "idle" || state === "loading" || state === "error"

  // Cumulative hazard accrued through the current step.
  const accruedHazard = useMemo(() => {
    if (!run || run.perEdge.length === 0) return 0
    const upTo = Math.min(currentStep, run.perEdge.length)
    let total = 0
    for (let i = 0; i < upTo; i++) {
      total += run.perEdge[i].hazardFlood + run.perEdge[i].hazardLandslide
    }
    return total
  }, [run, currentStep])

  return (
    <div className="flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
      <Button
        size="icon"
        variant="default"
        onClick={isFinished ? () => setStep(0) : toggle}
        disabled={disabled}
        aria-label={isFinished ? "Restart" : isPlaying ? "Pause" : "Play"}
      >
        <HugeiconsIcon
          icon={isFinished ? ReloadIcon : isPlaying ? PauseIcon : PlayIcon}
          strokeWidth={2}
        />
      </Button>

      <div className="flex-1">
        <Slider
          min={0}
          max={Math.max(0, totalSteps)}
          step={1}
          value={[currentStep]}
          onValueChange={(values) => setStep(values[0] ?? 0)}
          disabled={disabled}
          aria-label="Scrub playback"
        />
      </div>

      <div className="font-mono text-xs tabular-nums text-muted-foreground">
        {currentStep} / {totalSteps}
      </div>

      <div
        className="font-mono text-xs tabular-nums text-muted-foreground"
        title="Cumulative hazard score accrued through this step"
      >
        Hazard: {accruedHazard.toFixed(2)}
      </div>

      <Select
        value={String(speed)}
        onValueChange={(v) => setSpeed(Number(v) as PlaybackSpeed)}
        disabled={disabled}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPEEDS.map((s) => (
            <SelectItem key={s} value={String(s)}>
              {s}x
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
