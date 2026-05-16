"use client"

import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

import { useCompareStore } from "@/store/compareStore"

/**
 * Two-way bind a pane's Leaflet map to `compareStore.viewBounds` so the two
 * compare panes pan/zoom in lockstep. A ref-guard breaks the feedback loop —
 * a programmatic `fitBounds` must not re-emit `moveend` back into the store.
 */
export function useSyncedView(): void {
  const map = useMap()
  const viewBounds = useCompareStore((s) => s.viewBounds)
  const setBounds = useCompareStore((s) => s.setBounds)
  const isSyncingRef = useRef(false)

  // This pane -> store
  useEffect(() => {
    const handler = (): void => {
      if (isSyncingRef.current) return
      const b = map.getBounds()
      setBounds([
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getEast()],
      ])
    }
    map.on("moveend", handler)
    map.on("zoomend", handler)
    return () => {
      map.off("moveend", handler)
      map.off("zoomend", handler)
    }
  }, [map, setBounds])

  // Store -> this pane
  useEffect(() => {
    if (!viewBounds) return
    isSyncingRef.current = true
    map.fitBounds(viewBounds, { animate: false })
    const releaseId = window.setTimeout(() => {
      isSyncingRef.current = false
    }, 60)
    return () => window.clearTimeout(releaseId)
  }, [map, viewBounds])
}
