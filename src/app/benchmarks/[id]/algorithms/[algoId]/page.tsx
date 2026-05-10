import { notFound } from "next/navigation"

import { TrialListAccordion } from "@/components/benchmark/TrialListAccordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import type { AlgorithmId } from "@/types/api"

const RI_KEYS = ["RI1", "RI2", "RI3", "RI4", "RI5", "all"] as const
const METRIC_KEYS = [
  "success",
  "travel_time",
  "hazard_exposure",
  "hazard_score",
  "steps",
  "distance",
  "runtime",
] as const

/** Render a nullable number as a fixed-precision string, or "—" when null.
 *  Stats are null when a (algorithm, RI, metric) bucket has zero
 *  observations -- e.g. hazard_exposure at RI4-RI5 on benchmarks where
 *  every algorithm has 0% success.
 */
const fmt = (v: number | null | undefined, digits = 3): string =>
  v === null || v === undefined ? "—" : v.toFixed(digits)

interface PageProps {
  params: Promise<{ id: string; algoId: string }>
}

export default async function AlgorithmDetailPage({ params }: PageProps) {
  const { id, algoId: algoIdRaw } = await params
  const algoId = decodeURIComponent(algoIdRaw) as AlgorithmId
  const [metricsResult, runsResult] = await Promise.all([
    api.getMetrics(id),
    api.listRunsForAlgorithm(id, algoId),
  ])

  if (!metricsResult.ok) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Metrics unavailable</AlertTitle>
          <AlertDescription>
            Could not load metrics for <code className="font-mono">{id}</code>:{" "}
            {metricsResult.error}.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const algoMetrics = metricsResult.data.algorithms[algoId]
  if (!algoMetrics) {
    notFound()
  }

  const runs = runsResult.ok ? runsResult.data : []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight font-mono">{algoId}</h1>
        <p className="text-muted-foreground">
          Per-RI performance breakdown for benchmark{" "}
          <code className="font-mono">{id}</code>.
        </p>
      </div>

      {METRIC_KEYS.map((metricName) => {
        const buckets = algoMetrics[metricName]
        if (!buckets) return null
        return (
          <Card key={metricName}>
            <CardHeader>
              <CardTitle className="text-base font-mono">{metricName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RI</TableHead>
                    <TableHead className="text-right">n</TableHead>
                    <TableHead className="text-right">mean</TableHead>
                    <TableHead className="text-right">stdev</TableHead>
                    <TableHead className="text-right">min</TableHead>
                    <TableHead className="text-right">max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RI_KEYS.map((ri) => {
                    const bucket = buckets[ri]
                    if (!bucket) return null
                    return (
                      <TableRow key={ri}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {ri}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{bucket.n}</TableCell>
                        <TableCell className="text-right font-mono">
                          {fmt(bucket.mean)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmt(bucket.stdev)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmt(bucket.min)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fmt(bucket.max)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trial drill-down by rain intensity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Expand a rain-intensity section to inspect the individual scenarios
            this algorithm ran against. Sorted by hazard score (worst first),
            failures grouped on top. Click <em>View environment</em> on any row
            to render the route, blocked edges, and step-by-step playback.
          </p>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <Alert>
              <AlertTitle>No trial data</AlertTitle>
              <AlertDescription>
                Run records for <code className="font-mono">{algoId}</code> are
                not yet on disk. Re-run <code className="font-mono">run_policies</code>{" "}
                or kick off a fresh benchmark to populate this section.
              </AlertDescription>
            </Alert>
          ) : (
            <TrialListAccordion benchmarkId={id} algoId={algoId} runs={runs} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
