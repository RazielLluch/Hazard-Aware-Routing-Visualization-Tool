"use client"

import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { BundleSummary, RainLevel } from "@/types/api"
import { useBundleStore } from "@/store/bundleStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface BundlePickerProps {
  graphId: string
  /** Used by the random-sample button. Defaults to RI3. */
  randomSampleRI?: RainLevel
  /** Optional callback fired after a bundle is loaded or saved. */
  onBundleChanged?: () => void
}

/**
 * Side-panel controls for the BundleMapLayer.
 *
 * - Toggle depot/stop mode for the next click.
 * - Random-sample a feasible (depot, stops) tuple.
 * - Save the current selection as a named bundle.
 * - Load / delete previously saved bundles.
 *
 * Pair with `<BundleMapLayer />` rendered inside the same `<MapContainer>`.
 */
export function BundlePicker({
  graphId,
  randomSampleRI = 3 as RainLevel,
  onBundleChanged,
}: BundlePickerProps) {
  const mode = useBundleStore((s) => s.mode)
  const depot = useBundleStore((s) => s.depot)
  const stops = useBundleStore((s) => s.stops)
  const loadedBundleName = useBundleStore((s) => s.loadedBundleName)
  const setMode = useBundleStore((s) => s.setMode)
  const setDepot = useBundleStore((s) => s.setDepot)
  const addStop = useBundleStore((s) => s.addStop)
  const clear = useBundleStore((s) => s.clear)
  const loadFromBundle = useBundleStore((s) => s.loadFromBundle)

  const [bundles, setBundles] = useState<BundleSummary[]>([])
  const [name, setName] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshBundles = useCallback(async () => {
    const res = await api.listBundles(graphId)
    if (res.ok) setBundles(res.data)
  }, [graphId])

  useEffect(() => {
    void refreshBundles()
  }, [refreshBundles])

  const handleRandomSample = useCallback(async () => {
    setBusy(true)
    setErrorMessage(null)
    const res = await api.sampleNodes(graphId, {
      rainLevel: randomSampleRI,
      k: 5,
    })
    setBusy(false)
    if (!res.ok) {
      setErrorMessage(res.error)
      return
    }
    if (res.data.depot) setDepot(res.data.depot.id)
    res.data.nodes.forEach((n) => addStop(n.id))
  }, [graphId, randomSampleRI, setDepot, addStop])

  const handleSave = useCallback(async () => {
    if (!name) {
      setErrorMessage("Bundle name is required.")
      return
    }
    if (!depot) {
      setErrorMessage("Depot is required.")
      return
    }
    if (stops.length === 0) {
      setErrorMessage("At least one stop is required.")
      return
    }
    setBusy(true)
    setErrorMessage(null)
    const res = await api.createBundle(graphId, {
      name,
      depot,
      stops,
    })
    setBusy(false)
    if (!res.ok) {
      setErrorMessage(res.error)
      return
    }
    setName("")
    await refreshBundles()
    onBundleChanged?.()
  }, [name, depot, stops, graphId, refreshBundles, onBundleChanged])

  const handleLoad = useCallback(
    async (bundleName: string) => {
      setBusy(true)
      const res = await api.getBundle(graphId, bundleName)
      setBusy(false)
      if (!res.ok) {
        setErrorMessage(res.error)
        return
      }
      loadFromBundle(res.data.name, res.data.depot, res.data.stops)
      onBundleChanged?.()
    },
    [graphId, loadFromBundle, onBundleChanged],
  )

  const handleDelete = useCallback(
    async (bundleName: string) => {
      setBusy(true)
      const res = await api.deleteBundle(graphId, bundleName)
      setBusy(false)
      if (!res.ok) {
        setErrorMessage(res.error)
        return
      }
      await refreshBundles()
      onBundleChanged?.()
    },
    [graphId, refreshBundles, onBundleChanged],
  )

  return (
    <div className="flex flex-col gap-4 p-4 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bundle picker</h3>
        {loadedBundleName && (
          <span className="text-muted-foreground text-xs">
            loaded: {loadedBundleName}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={mode === "depot" ? "default" : "outline"}
          onClick={() => setMode("depot")}
        >
          Pick depot
        </Button>
        <Button
          size="sm"
          variant={mode === "stop" ? "default" : "outline"}
          onClick={() => setMode("stop")}
        >
          Pick stops
        </Button>
        <Button size="sm" variant="ghost" onClick={clear} disabled={busy}>
          Clear
        </Button>
      </div>

      <div className="space-y-1">
        <div>
          <span className="text-muted-foreground">Depot:</span>{" "}
          <span className="font-mono">{depot ?? "(none)"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">
            Stops ({stops.length}):
          </span>{" "}
          <span className="font-mono">{stops.join(", ") || "(none)"}</span>
        </div>
      </div>

      <Button
        size="sm"
        variant="secondary"
        onClick={handleRandomSample}
        disabled={busy}
      >
        Random sample (RI{randomSampleRI})
      </Button>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="bundle-name">Save as</Label>
        <div className="flex gap-2">
          <Input
            id="bundle-name"
            placeholder="e.g. janiola_set1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            pattern="[a-zA-Z0-9_-]+"
            maxLength={64}
          />
          <Button size="sm" onClick={handleSave} disabled={busy}>
            Save
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="text-destructive text-xs">{errorMessage}</p>
      )}

      <Separator />

      <div className="space-y-2">
        <h4 className="font-medium">Saved bundles ({bundles.length})</h4>
        {bundles.length === 0 ? (
          <p className="text-muted-foreground text-xs">No bundles yet.</p>
        ) : (
          <ul className="space-y-1">
            {bundles.map((b) => (
              <li
                key={b.name}
                className="flex items-center justify-between gap-2"
              >
                <span className="font-mono">{b.name}</span>
                <span className="text-muted-foreground text-xs">
                  {b.numStops} stops
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoad(b.name)}
                    disabled={busy}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(b.name)}
                    disabled={busy}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
