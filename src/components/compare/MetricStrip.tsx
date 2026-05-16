import type { InferenceResponseV2 } from "@/types/api"

interface MetricStripProps {
  result: InferenceResponseV2 | null
}

interface CellProps {
  label: string
  value: string
}

function Cell({ label, value }: CellProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}

const fmt = (value: number | undefined, suffix = ""): string =>
  value === undefined ? "--" : `${value.toFixed(2)}${suffix}`

/** Per-pane 4-cell metric grid. The cross-pane comparative chart lives in
 *  MetricCompareChart and is mounted once below the pane row. */
export function MetricStrip({ result }: MetricStripProps) {
  const m = result?.metrics
  return (
    <div className="grid grid-cols-4 gap-2">
      <Cell label="Common risk" value={fmt(m?.common_risk_exposure)} />
      <Cell label="Travel time" value={fmt(m?.time_min, " min")} />
      <Cell label="Blockage exp" value={fmt(m?.blockage_exposure)} />
      <Cell label="Distance" value={fmt(m?.distance_km, " km")} />
    </div>
  )
}
