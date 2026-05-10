"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { JobProgress } from "@/components/job/JobProgress"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { api } from "@/lib/api"
import type {
  AlgorithmId,
  BenchmarkCreateRequest,
  BundleSummary,
  RILevel,
} from "@/types/api"

const RI_KEYS: RILevel[] = ["RI1", "RI2", "RI3", "RI4", "RI5"]

const ALGORITHMS: AlgorithmId[] = [
  "NNA-Dijkstra",
  "NNA-AStar",
  "NNA-Dijkstra-HA",
  "NNA-Dijkstra-Blind",
  "NNA-AStar-Blind",
  "NNA-Dijkstra-HA-Blind",
  "DQN@balanced_HF",
  "DQN@fast_HF",
  "DQN@safe_HF",
]

const GRAPHS = ["la_trinidad_subgraph_n200"] as const

export default function NewBenchmarkPage() {
  const router = useRouter()
  const [benchmarkId, setBenchmarkId] = useState("")
  const [graphId, setGraphId] = useState<string>(GRAPHS[0])
  const [masterSeed, setMasterSeed] = useState(42)
  const [nScenarios, setNScenarios] = useState(100)
  const [kDeliveries, setKDeliveries] = useState(5)
  const [rainIntensities, setRainIntensities] =
    useState<RILevel[]>([...RI_KEYS])
  const [activationStrategy] = useState("deterministic_v3")
  const [sampler, setSampler] = useState<"uniform_open" | "scc_restricted">(
    "uniform_open",
  )
  const [longitudinal, setLongitudinal] = useState(true)
  const [algorithms, setAlgorithms] = useState<AlgorithmId[]>([
    "NNA-Dijkstra",
    "NNA-Dijkstra-HA",
    "NNA-Dijkstra-HA-Blind",
  ])

  const [bundles, setBundles] = useState<BundleSummary[]>([])
  const [bundleName, setBundleName] = useState<string>("")  // "" = none

  const [submitting, setSubmitting] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const res = await api.listBundles(graphId)
      if (cancelled) return
      if (res.ok) {
        setBundles(res.data)
        // If the previously selected bundle no longer exists for this graph,
        // reset the dropdown so we don't ship a stale name to the backend.
        if (bundleName && !res.data.some((b) => b.name === bundleName)) {
          setBundleName("")
        }
      } else {
        setBundles([])
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId])

  const toggleRI = (ri: RILevel) => {
    setRainIntensities((prev) =>
      prev.includes(ri) ? prev.filter((x) => x !== ri) : [...prev, ri],
    )
  }

  const toggleAlgorithm = (algo: AlgorithmId) => {
    setAlgorithms((prev) =>
      prev.includes(algo) ? prev.filter((x) => x !== algo) : [...prev, algo],
    )
  }

  const handleSubmit = async () => {
    setErrorMessage(null)
    if (!benchmarkId) {
      setErrorMessage("Benchmark id is required.")
      return
    }
    if (algorithms.length === 0) {
      setErrorMessage("Pick at least one algorithm.")
      return
    }
    if (rainIntensities.length === 0) {
      setErrorMessage("Pick at least one rain intensity.")
      return
    }

    const request: BenchmarkCreateRequest = {
      benchmarkId,
      graphId,
      masterSeed,
      nScenarios,
      kDeliveries,
      rainIntensities,
      activationStrategy,
      sampler,
      longitudinal,
      algorithms,
      ...(bundleName ? { bundleName } : {}),
    }

    setSubmitting(true)
    const res = await api.createBenchmark(request)
    setSubmitting(false)
    if (!res.ok) {
      setErrorMessage(res.error)
      return
    }
    setJobId(res.data.jobId)
  }

  const handleJobComplete = (
    status: "succeeded" | "failed" | "queued" | "running",
  ) => {
    if (status === "succeeded") {
      router.push(`/benchmarks/${encodeURIComponent(benchmarkId)}`)
    }
  }

  if (jobId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">
          Generating benchmark {benchmarkId}…
        </h1>
        <p className="text-muted-foreground text-sm">Job ID: {jobId}</p>
        <JobProgress jobId={jobId} onComplete={handleJobComplete} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New benchmark</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="benchmark-id">Benchmark id</Label>
          <Input
            id="benchmark-id"
            placeholder="la_trinidad_open_v2"
            value={benchmarkId}
            onChange={(e) => setBenchmarkId(e.target.value)}
            pattern="[a-zA-Z0-9_-]+"
            maxLength={64}
          />
        </div>

        <div className="space-y-2">
          <Label>Graph</Label>
          <Select value={graphId} onValueChange={setGraphId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRAPHS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="master-seed">Master seed</Label>
          <Input
            id="master-seed"
            type="number"
            value={masterSeed}
            onChange={(e) =>
              setMasterSeed(parseInt(e.target.value || "0", 10))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Sampler</Label>
          <Select
            value={sampler}
            onValueChange={(v) =>
              setSampler(v as "uniform_open" | "scc_restricted")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uniform_open">uniform_open</SelectItem>
              <SelectItem value="scc_restricted">scc_restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Number of scenarios: <span className="font-mono">{nScenarios}</span>
        </Label>
        <Slider
          min={20}
          max={500}
          step={20}
          value={[nScenarios]}
          onValueChange={(v) => setNScenarios(v[0])}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Deliveries per scenario:{" "}
          <span className="font-mono">{kDeliveries}</span>
        </Label>
        <Slider
          min={2}
          max={10}
          step={1}
          value={[kDeliveries]}
          onValueChange={(v) => setKDeliveries(v[0])}
        />
      </div>

      <div className="space-y-2">
        <Label>Rain intensities</Label>
        <div className="flex flex-wrap gap-3">
          {RI_KEYS.map((ri) => (
            <label key={ri} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={rainIntensities.includes(ri)}
                onCheckedChange={() => toggleRI(ri)}
              />
              {ri}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="longitudinal"
          checked={longitudinal}
          onCheckedChange={(checked) => setLongitudinal(checked === true)}
        />
        <Label htmlFor="longitudinal" className="text-sm">
          Longitudinal (one (depot, stops) tuple rolled across all RIs)
        </Label>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Pre-fill scenario 0 from bundle (optional)</Label>
          <Link
            href="/bundles"
            target="_blank"
            className="text-muted-foreground hover:text-foreground text-xs underline"
          >
            Manage saved bundles →
          </Link>
        </div>
        <Select
          value={bundleName || "__none__"}
          onValueChange={(v) => setBundleName(v === "__none__" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="(none — fully random sampling)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">(none — fully random sampling)</SelectItem>
            {bundles.map((b) => (
              <SelectItem key={b.name} value={b.name}>
                {b.name} · {b.numStops} stops
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bundleName && (
          <p className="text-muted-foreground text-xs">
            Scenario 0 will use{" "}
            <span className="font-mono">{bundleName}</span>'s depot and stops.
            Scenarios 1..{nScenarios - 1} stay random.
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Algorithms</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ALGORITHMS.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={algorithms.includes(a)}
                onCheckedChange={() => toggleAlgorithm(a)}
              />
              <span className="font-mono">{a}</span>
            </label>
          ))}
        </div>
      </div>

      {errorMessage && (
        <p className="text-destructive text-sm">{errorMessage}</p>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Generate benchmark"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/benchmarks")}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
