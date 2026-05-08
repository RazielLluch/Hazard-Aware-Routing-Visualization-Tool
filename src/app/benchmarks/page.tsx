import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/lib/api"

export default async function BenchmarksPage() {
  const result = await api.listBenchmarks()

  if (!result.ok) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Backend unreachable</AlertTitle>
          <AlertDescription>
            Could not list benchmarks: {result.error}. Start the FastAPI service with{" "}
            <code className="font-mono">uvicorn src.main:app --reload</code> and refresh.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>No benchmarks found</AlertTitle>
          <AlertDescription>
            The harness output directory is empty. Run the scenario generator to produce
            a cohort and refresh.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Benchmarks</h1>
        <p className="text-muted-foreground">
          Evaluation cohorts available for analysis.
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
        {result.data.map((b) => (
          <Link
            key={b.benchmarkId}
            href={`/benchmarks/${b.benchmarkId}`}
            className="block transition hover:opacity-90"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-mono text-base">{b.benchmarkId}</CardTitle>
                <CardDescription>
                  {b.numScenarios} scenarios · {b.numDeliveries} deliveries ·{" "}
                  {b.algorithms.length} algorithms
                </CardDescription>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(["RI1", "RI2", "RI3", "RI4", "RI5"] as const).map((ri) => (
                    <Badge key={ri} variant="secondary" className="font-mono text-xs">
                      {ri} · {b.riDistribution[ri]}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
