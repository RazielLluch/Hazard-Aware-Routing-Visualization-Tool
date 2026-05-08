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
}

export interface RunSummary {
  scenarioId: string
  algorithmId: AlgorithmId
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
  mean: number
  stdev: number
  min: number
  max: number
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
  profile: Profile
}

export interface InferenceResponse extends Run {
  modelVersion: string
  inferenceMs: number
}

export interface InferenceHealth {
  loaded: Partial<Record<Profile, number[]>>
  device: string
  isWarm: boolean
}
