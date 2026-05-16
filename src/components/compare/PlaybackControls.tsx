"use client"

import { useEffect, useRef } from "react"

import { useCompareStore } from "@/store/compareStore"

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const

export function PlaybackControls() {
  const playing = useCompareStore((s) => s.playback.playing)
  const speed = useCompareStore((s) => s.playback.speedMultiplier)
  const elapsed = useCompareStore((s) => s.playback.elapsed)
  const play = useCompareStore((s) => s.playbackPlay)
  const pause = useCompareStore((s) => s.playbackPause)
  const reset = useCompareStore((s) => s.playbackReset)
  const setSpeed = useCompareStore((s) => s.playbackSetSpeed)
  const tick = useCompareStore((s) => s.playbackTick)

  const rafRef = useRef<number | null>(null)
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      prevRef.current = null
      return
    }
    const loop = (now: number) => {
      const prev = prevRef.current ?? now
      const dt = (now - prev) / 1000
      prevRef.current = now
      if (dt > 0) tick(dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      prevRef.current = null
    }
  }, [playing, tick])

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
      <button
        type="button"
        onClick={() => (playing ? pause() : play())}
        className="rounded-md border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-accent"
      >
        {playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border border-border bg-background px-3 py-1 text-sm hover:bg-accent"
      >
        Reset
      </button>
      <span className="text-xs text-muted-foreground tabular-nums">
        {elapsed.toFixed(2)}s
      </span>
      <div className="ml-auto flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Speed</span>
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSpeed(opt)}
            className={`rounded-md border px-2 py-1 text-xs ${
              speed === opt
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent"
            }`}
          >
            {opt}x
          </button>
        ))}
      </div>
    </div>
  )
}
