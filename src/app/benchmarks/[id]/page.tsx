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
import type { AlgorithmId } from "@/types/api"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BenchmarkDetailPage({ params }: PageProps) {
  const { id } = await params
  const [benchmarkResult, metricsResult] = await Promise.all([
    api.getBenchmark(id),
    api.getMetrics(id),
  ])

  if (!benchmarkResult.ok) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>Benchmark unavailable</AlertTitle>
          <AlertDescription>
            Could not load benchmark <code className="font-mono">{id}</code>:{" "}
            {benchmarkResult.error}.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const benchmark = benchmarkResult.data
  const metrics = metricsResult.ok ? metricsResult.data : null

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight font-mono">
          {benchmark.benchmarkId}
        </h1>
        <p className="text-muted-foreground">
          {benchmark.numScenarios} scenarios · {benchmark.numDeliveries} deliveries ·{" "}
          activation <code className="font-mono">{benchmark.activationMode}</code> · seed{" "}
          {benchmark.masterSeed}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(["RI1", "RI2", "RI3", "RI4", "RI5"] as const).map((ri) => (
            <Badge key={ri} variant="secondary" className="font-mono text-xs">
              {ri} · {benchmark.riDistribution[ri]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Algorithms</h2>
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benchmark.algorithms.map((algoId: AlgorithmId) => {
            const successAll = metrics?.algorithms[algoId]?.success?.["all"]
            return (
              <Link
                key={algoId}
                href={`/benchmarks/${benchmark.benchmarkId}/algorithms/${encodeURIComponent(algoId)}`}
                className="block transition hover:opacity-90"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="font-mono text-base">{algoId}</CardTitle>
                    {successAll ? (
                      <CardDescription>
                        Success rate {(successAll.mean * 100).toFixed(0)}% · n={successAll.n}
                      </CardDescription>
                    ) : (
                      <CardDescription>
                        {metricsResult.ok ? "no metrics yet" : "metrics unavailable"}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
