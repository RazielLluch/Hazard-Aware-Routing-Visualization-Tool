export type RILevel = "RI1" | "RI2" | "RI3" | "RI4" | "RI5"

export type AlgorithmId =
  | "NNA-Dijkstra"
  | "NNA-AStar"
  | "NNA-Dijkstra-HA"
  | "NNA-Dijkstra-Blind"
  | "NNA-AStar-Blind"
  | "NNA-Dijkstra-HA-Blind"
  | "DQN@balanced_HF"
  | "DQN@fast_HF"
  | "DQN@safe_HF"

export type Profile = "balanced" | "fast" | "safe"

export type RainLevel = 1 | 2 | 3 | 4 | 5

export interface LatLng {
  lat: number
  lng: number
}

export interface Page<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface RIDistribution {
  RI1: number
  RI2: number
  RI3: number
  RI4: number
  RI5: number
}

export interface BenchmarkSummary {
  benchmarkId: string
  graphId: string
  numScenarios: number
  numDeliveries: number
  algorithms: AlgorithmId[]
  riDistribution: RIDistribution
}

export interface Benchmark extends BenchmarkSummary {
  masterSeed: number
  samplingPolicy: string
  activationMode: string
  feasibilityFiltered: boolean
  graphPath: string
  generatedAt: string | null
}

export interface ScenarioListItem {
  scenarioId: string
  rainLevel: RainLevel
  ri: RILevel
  numDeliveries: number
  numBlockedEdges: number
}

export interface Scenario {
  scenarioId: string
  benchmarkId: string
  graphId: string
  rainLevel: RainLevel
  ri: RILevel
  startNode: string
  deliveryNodes: string[]
  blockedEdges: [string, string][]
  maxSteps: number
  activationMode: string
  activationSeed: number | null
}

export interface RouteEdge {
  step: number
  u: string
  v: string
  lengthM: number
  travelTime: number
  hazardFlood: number
  hazardLandslide: number
  wasReplan: boolean
  /** Schema v3: when wasReplan is true, this is the (u, v) edge the
   *  planner attempted before the block forced a replan. Null on legacy
   *  v2 routes and on non-replan steps. */
  plannedNextEdge: [string, string] | null
}

export interface RunSummary {
  scenarioId: string
  algorithmId: AlgorithmId
  /** Schema v3: surfaced from the parent scenario so a flat list of
   *  run summaries can be bucketed by RI without a second fetch. */
  ri: RILevel | null
  success: boolean
  failureReason: string | null
  replanCount: number
  wallTimeMs: number
  totalTravelTime: number | null
  totalDistanceM: number | null
  totalHazardScore: number | null
}

export interface Run extends RunSummary {
  visitOrder: string[]
  edgeSequence: [string, string][]
  perEdge: RouteEdge[]
  policyMetadata: Record<string, unknown>
  algorithmConfigHash: string | null
}

export interface MetricBucket {
  n: number
  /** Stats are null when the bucket has zero observations. */
  mean: number | null
  stdev: number | null
  min: number | null
  max: number | null
}

export type MetricsByRI = Record<string, MetricBucket>
export type MetricsByName = Record<string, MetricsByRI>

export interface MetricsBundle {
  benchmarkId: string
  algorithms: Record<AlgorithmId, MetricsByName>
}

export interface GraphInfo {
  graphId: string
  crs: string
  numNodes: number
  numEdges: number
  bbox: [number, number, number, number] | null
  source: string
}

export interface GraphNode {
  id: string
  location: LatLng
  streetCount: number | null
  highway: string | null
}

export interface GraphEdge {
  u: string
  v: string
  length: number
  travelTimeMin: number
  floodHazard: number
  landslideHazard: number
  combinedHazard: number
  geometry: LatLng[]
  highway: string | null
  name: string | null
}

export interface SampleNodesRequest {
  rainLevel: RainLevel
  k: number
  seed?: number
}

export interface SampleNodesResponse {
  feasible: boolean
  sccSize: number
  seed: number
  depot: GraphNode | null
  nodes: GraphNode[]
}

export interface InferenceRequest {
  depot: string | LatLng
  deliveryStops: (string | LatLng)[]
  rainLevel: RainLevel
  algorithm?: AlgorithmId | null
  profile?: Profile | null
}

export interface InferenceResponse extends Run {
  modelVersion: string
  inferenceMs: number
  /** Schema v3: scenario context surfaced alongside the run for /demo
   *  to render BlockedEdgesLayer + synthesise a Scenario for
   *  ScenarioPlaybackShell without a second fetch. */
  graphId: string
  ri: RILevel
  startNode: string
  deliveryNodes: string[]
  blockedEdges: [string, string][]
}

export interface InferenceHealth {
  loaded: Partial<Record<Profile, number[]>>
  device: string
  isWarm: boolean
}

// ---- Stage 3: jobs (benchmark generation) -----------------------------------

export type JobStage = "scenario_gen" | "run_policies" | "evaluate"
export type JobStatus = "queued" | "running" | "succeeded" | "failed"
export type JobKind = "benchmark_generation"

export interface JobSummary {
  jobId: string
  kind: JobKind
  status: JobStatus
  startedAt: string
  finishedAt: string | null
  currentStage: JobStage | null
  resultPath: string | null
}

export interface Job extends JobSummary {
  config: Record<string, unknown>
  error: string | null
}

export interface JobEvent {
  ts: string
  stage: JobStage
  current: number
  total: number
  message: string
}

export interface BenchmarkCreateRequest {
  benchmarkId: string
  graphId: string
  masterSeed?: number
  nScenarios?: number
  kDeliveries?: number
  rainIntensities?: RILevel[]
  activationStrategy?: string
  sampler?: "uniform_open" | "scc_restricted"
  longitudinal?: boolean
  algorithms?: AlgorithmId[]
  /** Optional: pre-fill scenario_idx 0 with a saved (depot, stops) bundle.
   *  Bundle must already exist for the chosen graphId. */
  bundleName?: string
}

// ---- Stage 4: node bundles ---------------------------------------------------

export interface Bundle {
  name: string
  graphId: string
  depot: string
  stops: string[]
  createdAt: string
  updatedAt: string
  description: string | null
}

export interface BundleSummary {
  name: string
  graphId: string
  numStops: number
  createdAt: string
  updatedAt: string
}

export interface BundleCreateRequest {
  name: string
  depot: string
  stops: string[]
  description?: string
}

export interface BundleUpdateRequest {
  depot?: string
  stops?: string[]
  description?: string
}
