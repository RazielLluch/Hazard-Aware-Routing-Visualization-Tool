"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AlgorithmId, RILevel, RunSummary } from "@/types/api"

const RI_KEYS: RILevel[] = ["RI1", "RI2", "RI3", "RI4", "RI5"]

const FAILURE_REASONS = [
  "blocked",
  "trapped",
  "timeout",
  "no_route",
  "invalid_action",
  "success",
] as const

type FilterKey = (typeof FAILURE_REASONS)[number]

interface TrialListAccordionProps {
  benchmarkId: string
  algoId: AlgorithmId
  runs: RunSummary[]
}

/** Inline accordion that expands a per-RI trial list under the existing
 *  metric tables. Each RI section shows the trials that ran at that RI
 *  with hazard score, travel time, replan count, and status; a "View
 *  environment" button deep-links to the scenario playback page. */
export function TrialListAccordion({
  benchmarkId,
  algoId,
  runs,
}: TrialListAccordionProps) {
  const bucketed = useMemo(() => {
    const out: Record<string, RunSummary[]> = {
      RI1: [],
      RI2: [],
      RI3: [],
      RI4: [],
      RI5: [],
      _unknown: [],
    }
    for (const r of runs) {
      const key = r.ri ?? "_unknown"
      ;(out[key] ?? out._unknown).push(r)
    }
    return out
  }, [runs])

  return (
    <div className="space-y-3">
      {RI_KEYS.map((ri) => (
        <RISection
          key={ri}
          ri={ri}
          benchmarkId={benchmarkId}
          algoId={algoId}
          runs={bucketed[ri] ?? []}
        />
      ))}
      {bucketed._unknown && bucketed._unknown.length > 0 && (
        <RISection
          ri={null}
          benchmarkId={benchmarkId}
          algoId={algoId}
          runs={bucketed._unknown}
        />
      )}
    </div>
  )
}

interface RISectionProps {
  ri: RILevel | null
  benchmarkId: string
  algoId: AlgorithmId
  runs: RunSummary[]
}

function RISection({ ri, benchmarkId, algoId, runs }: RISectionProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(() => new Set())

  const successCount = runs.filter((r) => r.success).length
  const successRate = runs.length === 0 ? 0 : (successCount / runs.length) * 100
  const label = ri ?? "Unknown"

  const visible = useMemo(() => {
    let list = runs
    if (activeFilters.size > 0) {
      list = list.filter((r) => {
        const reason = r.success ? "success" : (r.failureReason as FilterKey | null)
        return reason !== null && activeFilters.has(reason as FilterKey)
      })
    }
    // Primary sort: hazard score desc (nulls last). Secondary: failures
    // first. Tertiary: scenario_id ascending for stable ordering.
    return [...list].sort((a, b) => {
      const ah = a.totalHazardScore
      const bh = b.totalHazardScore
      if (ah !== bh) {
        if (ah === null) return 1
        if (bh === null) return -1
        return bh - ah
      }
      if (a.success !== b.success) return a.success ? 1 : -1
      return a.scenarioId.localeCompare(b.scenarioId)
    })
  }, [runs, activeFilters])

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      id={ri ? `ri-${ri.replace("RI", "")}` : undefined}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border bg-card px-4 py-3 text-left transition hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono">
              {label}
            </Badge>
            <span className="font-medium">
              {runs.length} trial{runs.length === 1 ? "" : "s"}
            </span>
            <span className="text-sm text-muted-foreground">
              {successCount}/{runs.length} succeeded ({successRate.toFixed(0)}%)
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {open ? "Hide" : "Show"} environments
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {runs.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">
            No trials at {label}.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 px-1 pb-3">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Filter
              </span>
              {FAILURE_REASONS.map((key) => (
                <FilterChip
                  key={key}
                  label={key}
                  active={activeFilters.has(key)}
                  onClick={() => toggleFilter(key)}
                />
              ))}
              {activeFilters.size > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilters(new Set())}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-right">Hazard score</TableHead>
                  <TableHead className="text-right">Travel time</TableHead>
                  <TableHead className="text-right">Replans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-px" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((run) => (
                  <TrialRow
                    key={run.scenarioId}
                    benchmarkId={benchmarkId}
                    algoId={algoId}
                    run={run}
                  />
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No trials match the active filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface FilterChipProps {
  label: FilterKey
  active: boolean
  onClick: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs font-mono transition " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-accent")
      }
    >
      {label}
    </button>
  )
}

interface TrialRowProps {
  benchmarkId: string
  algoId: AlgorithmId
  run: RunSummary
}

const fmt = (v: number | null | undefined, digits = 2): string =>
  v === null || v === undefined ? "—" : v.toFixed(digits)

function TrialRow({ benchmarkId, algoId, run }: TrialRowProps) {
  const statusLabel = run.success ? "Success" : (run.failureReason ?? "—")
  const statusVariant: "default" | "destructive" | "secondary" = run.success
    ? "secondary"
    : "destructive"
  const playbackHref =
    `/benchmarks/${encodeURIComponent(benchmarkId)}` +
    `/scenarios/${encodeURIComponent(run.scenarioId)}` +
    `?algo=${encodeURIComponent(algoId)}`

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{run.scenarioId}</TableCell>
      <TableCell className="text-right font-mono">
        {fmt(run.totalHazardScore, 2)}
      </TableCell>
      <TableCell className="text-right font-mono">
        {fmt(run.totalTravelTime, 1)}
      </TableCell>
      <TableCell className="text-right font-mono">{run.replanCount}</TableCell>
      <TableCell>
        <Badge variant={statusVariant} className="font-mono">
          {statusLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <Button asChild size="sm" variant="outline">
          <Link href={playbackHref}>View environment</Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
