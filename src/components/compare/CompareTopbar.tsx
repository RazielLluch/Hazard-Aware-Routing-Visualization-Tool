"use client"

import { useCompareStore } from "@/store/compareStore"
import type { CohortId, RILevel } from "@/types/api"

const COHORTS: { id: CohortId; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "hazard_opportunity", label: "Hazard Opportunity" },
  { id: "risk_time_tradeoff", label: "Risk-Time Tradeoff" },
]
const RI_LEVELS: RILevel[] = ["RI1", "RI2", "RI3", "RI4", "RI5"]
const LAYER_TOGGLES = [
  { key: "flood", label: "Flood" },
  { key: "landslide", label: "Landslide" },
  { key: "softBlocked", label: "Soft-blocked" },
] as const

const SELECT = "rounded-md border border-border bg-background px-2 py-1 text-sm"

export function CompareTopbar() {
  const cohort = useCompareStore((s) => s.cohort)
  const ri = useCompareStore((s) => s.ri)
  const scenarioId = useCompareStore((s) => s.scenarioId)
  const scenarios = useCompareStore((s) => s.scenarios)
  const layers = useCompareStore((s) => s.layers)
  const colourMode = useCompareStore((s) => s.routeColourMode)
  const setCohort = useCompareStore((s) => s.setCohort)
  const setRI = useCompareStore((s) => s.setRI)
  const setScenario = useCompareStore((s) => s.setScenario)
  const toggleLayer = useCompareStore((s) => s.toggleLayer)
  const setColourMode = useCompareStore((s) => s.setColourMode)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
      <label className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Scenario set</span>
        <select
          className={SELECT}
          value={cohort}
          onChange={(e) => setCohort(e.target.value as CohortId)}
        >
          {COHORTS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">RI</span>
        <select
          className={SELECT}
          value={ri}
          onChange={(e) => setRI(e.target.value as RILevel)}
        >
          {RI_LEVELS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        <span className="shrink-0 text-muted-foreground">Scenario</span>
        <select
          className={`${SELECT} min-w-0 flex-1`}
          value={scenarioId ?? ""}
          onChange={(e) => {
            const next = scenarios.find((s) => s.scenario_id === e.target.value)
            if (next) setScenario(next)
          }}
        >
          <option value="" disabled>
            {scenarios.length ? "Select a scenario" : "Loading scenarios..."}
          </option>
          {scenarios.map((s) => (
            <option key={s.scenario_id} value={s.scenario_id}>
              {s.scenario_id}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3">
        {LAYER_TOGGLES.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => toggleLayer(key)}
            />
            {label}
          </label>
        ))}
      </div>

      <label className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Route colour</span>
        <select
          className={SELECT}
          value={colourMode}
          onChange={(e) =>
            setColourMode(e.target.value as "solid" | "combined_hazard")
          }
        >
          <option value="solid">Solid</option>
          <option value="combined_hazard">Combined hazard</option>
        </select>
      </label>
    </div>
  )
}
