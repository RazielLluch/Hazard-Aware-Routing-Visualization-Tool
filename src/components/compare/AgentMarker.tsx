"use client"

import { useMemo } from "react"
import { Marker } from "react-leaflet"

import { BASE_ANIM_SEC_PER_MIN, useCompareStore } from "@/store/compareStore"
import type { InferenceResponseV2 } from "@/types/api"

import { AGENT_ICON_LEFT, AGENT_ICON_RIGHT } from "./markerIcons"

interface AgentMarkerProps {
  result: InferenceResponseV2 | null
  side: "left" | "right"
}

interface Path {
  coords: Array<[number, number]>
  cumDist: number[]
  total: number
}

function buildPath(result: InferenceResponseV2 | null): Path | null {
  if (!result) return null
  const coords: Array<[number, number]> = []
  for (const leg of result.legs) {
    for (const segment of leg.segments) {
      for (const c of segment.coordinates) {
        const last = coords[coords.length - 1]
        if (!last || last[0] !== c.lat || last[1] !== c.lng) {
          coords.push([c.lat, c.lng])
        }
      }
    }
  }
  if (coords.length === 0) return null

  const cumDist: number[] = [0]
  for (let i = 1; i < coords.length; i++) {
    const [a0, a1] = coords[i - 1]
    const [b0, b1] = coords[i]
    cumDist.push(cumDist[i - 1] + Math.hypot(b0 - a0, b1 - a1))
  }
  return { coords, cumDist, total: cumDist[cumDist.length - 1] }
}

function interpolate(path: Path, t: number): [number, number] | null {
  if (path.coords.length === 0) return null
  if (t <= 0) return path.coords[0]
  if (t >= 1) return path.coords[path.coords.length - 1]
  const target = t * path.total

  let lo = 1
  let hi = path.cumDist.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (path.cumDist[mid] < target) lo = mid + 1
    else hi = mid
  }
  const i = lo
  const prevDist = path.cumDist[i - 1]
  const segLen = path.cumDist[i] - prevDist
  const f = segLen === 0 ? 0 : (target - prevDist) / segLen
  const [a0, a1] = path.coords[i - 1]
  const [b0, b1] = path.coords[i]
  return [a0 + (b0 - a0) * f, a1 + (b1 - a1) * f]
}

export function AgentMarker({ result, side }: AgentMarkerProps) {
  const elapsed = useCompareStore((s) => s.playback.elapsed)

  const path = useMemo(() => buildPath(result), [result])
  if (!path || !result) return null

  const scaledDuration = result.metrics.time_min * BASE_ANIM_SEC_PER_MIN
  const t = Math.min(1, elapsed / Math.max(scaledDuration, 0.001))
  const pos = interpolate(path, t)
  if (!pos) return null

  const icon = side === "left" ? AGENT_ICON_LEFT : AGENT_ICON_RIGHT
  return <Marker position={pos} icon={icon} />
}
