"use client"

import { useEffect, useRef, useState } from "react"

import { validateBackendCatalog } from "@/lib/bootstrap"
import { useCompareStore } from "@/store/compareStore"

import { ComparePane } from "./ComparePane"
import { CompareTopbar } from "./CompareTopbar"
import { MetricCompareChart } from "./MetricCompareChart"
import { PlaybackControls } from "./PlaybackControls"

interface CompareShellProps {
  /** F5 single-pane mode: hide the right pane (left pane only). */
  singlePane?: boolean
  /** Scenario deep-link seed: auto-select this scenario once the list loads,
   *  if it is present in the active cohort. No-ops when absent. */
  seedScenarioId?: string
}

/**
 * Wires the compareStore: runs the boot guard (validateBackendCatalog), then
 * loads the graph export, scenario sets, and the initial scenario list. A
 * failed boot renders a scoped error panel rather than crashing the app.
 */
export function CompareShell({ singlePane = false, seedScenarioId }: CompareShellProps) {
  const setCatalog = useCompareStore((s) => s.setCatalog)
  const loadGraph = useCompareStore((s) => s.loadGraph)
  const loadScenarioSets = useCompareStore((s) => s.loadScenarioSets)
  const loadScenarios = useCompareStore((s) => s.loadScenarios)
  const scenarios = useCompareStore((s) => s.scenarios)
  const setScenario = useCompareStore((s) => s.setScenario)
  const [bootError, setBootError] = useState<string | null>(null)
  const seededRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function boot(): Promise<void> {
      try {
        const catalog = await validateBackendCatalog()
        if (cancelled) return
        setCatalog(catalog)
        void loadGraph()
        void loadScenarioSets()
        void loadScenarios()
      } catch (error: unknown) {
        if (!cancelled) {
          setBootError(
            error instanceof Error
              ? error.message
              : "Macro-DDQN backend unavailable",
          )
        }
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [setCatalog, loadGraph, loadScenarioSets, loadScenarios])

  // Apply the deep-link seed once the scenario list has loaded. Latched by a
  // ref so a later manual topbar selection is never clobbered on re-render;
  // a seed id absent from the cohort latches too (user picks manually).
  useEffect(() => {
    if (seededRef.current || !seedScenarioId || scenarios.length === 0) return
    seededRef.current = true
    const match = scenarios.find((s) => s.scenario_id === seedScenarioId)
    if (match) setScenario(match)
  }, [scenarios, seedScenarioId, setScenario])

  if (bootError) {
    return (
      <div className="m-4 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-semibold">Comparison surface unavailable</p>
        <p className="mt-1">{bootError}</p>
        <p className="mt-2 text-muted-foreground">
          Start the FastAPI service (uv run uvicorn src.main:app) and reload.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[640px] flex-col gap-3 p-4">
      <CompareTopbar />
      <PlaybackControls />
      <div className="flex flex-col gap-3 lg:flex-row">
        <ComparePane side="left" />
        {!singlePane && <ComparePane side="right" />}
      </div>
      <MetricCompareChart />
    </div>
  )
}
