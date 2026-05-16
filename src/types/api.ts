export type RILevel = "RI1" | "RI2" | "RI3" | "RI4" | "RI5"

/**
 * Algorithm identifier. Runtime-validated against the /api/v2/algorithms
 * catalog rather than a static union — the 7 macro ids (3 learned + the exact
 * oracle + 3 greedy baselines) live on the backend. See AlgorithmEntry.
 */
export type AlgorithmId = string

export type AlgorithmCategory = "learned" | "baseline" | "oracle"

/** One entry in the /api/v2/algorithms comparison-surface catalog (snake_case
 *  to mirror the v2 API 1:1). */
export interface AlgorithmEntry {
  id: AlgorithmId
  label: string
  category: AlgorithmCategory
  requires_model: boolean
  aliases: string[]
}

export type Profile = "balanced" | "fast" | "safe"

// ---------------------------------------------------------------------------
// v2 (Macro-DDQN) — snake_case to mirror the /api/v2 contract 1:1, so no
// camelCase mapping layer is needed between the API and the compare UI.
// ---------------------------------------------------------------------------

export type CohortId = "random" | "hazard_opportunity" | "risk_time_tradeoff"

/** A pane-local (profile, algorithm) selection on the / page. */
export interface PaneSelection {
  profile: Profile
  algorithm: AlgorithmId
}

// ---- /api/v2/inference + /scenarios/{id}/runs/live ----

export interface NodePayloadV2 {
  id: string
  x: number
  y: number
  lng: number
  lat: number
}

export interface RouteMetricsV2 {
  objective: number
  time_min: number
  distance_m: number
  distance_km: number
  flood_exposure: number
  landslide_exposure: number
  blockage_exposure: number
  risk_exposure: number
  common_risk_exposure: number
  hops: number
}

export interface RouteSegmentV2 {
  u: string
  v: string
  coordinates: NodePayloadV2[]
  length_m: number
  base_time_min: number
  travel_time_min: number
  objective: number
  flood_hazard: number
  landslide_hazard: number
  flood_active: 0 | 1
  landslide_active: 0 | 1
  flood_blocked: 0 | 1
  landslide_blocked: 0 | 1
  blocked: 0 | 1
  flood_exposure: number
  landslide_exposure: number
  blockage_exposure: number
  risk_exposure: number
  common_risk_exposure: number
}

export interface RouteLegV2 {
  source: string
  target: string
  path_nodes: string[]
  metrics: RouteMetricsV2
  segments: RouteSegmentV2[]
}

export interface InferenceRequestV2 {
  algorithm: AlgorithmId
  profile: Profile
  ri_key: RILevel
  start: string
  deliveries: string[]
  max_steps?: number
}

export interface InferenceResponseV2 {
  algorithm: AlgorithmId
  profile: Profile
  ri_key: RILevel
  artefact_id: string | null
  delivered: number
  // `success` intentionally absent — always true under soft-blocking.
  failure_reason: string
  start: NodePayloadV2
  deliveries: NodePayloadV2[]
  visit_order: string[]
  metrics: RouteMetricsV2
  legs: RouteLegV2[]
}

// ---- /api/v2/graph ----

export interface GraphExportNode {
  id: string
  x: number
  y: number
}

export interface NetworkEdge {
  u: string
  v: string
  base_time: number
  travel_time: number
  objective: number
  length_m: number
  flood: number
  landslide: number
  combined: number // max(flood, landslide)
  flood_active: 0 | 1
  landslide_active: 0 | 1
  flood_blocked: 0 | 1
  landslide_blocked: 0 | 1
  blocked: 0 | 1
}

export interface GraphExport {
  nodes: GraphExportNode[]
  /** key = "<RI>:<profile>", e.g. "RI3:balanced" */
  networks: Record<string, NetworkEdge[]>
  profiles: Profile[]
  ri_keys: RILevel[]
  algorithms: AlgorithmId[]
  artefact_id: string | null
}

// ---- /api/v2/scenario_sets + /scenarios + /scenarios/{id}/runs ----

export interface ScenarioSetSummary {
  cohort: CohortId
  label: string
  counts_by_ri: Record<string, number>
  total: number
  artefact_id: string | null
}

export interface ScenarioSetScenario {
  scenario_id: string
  ri_key: RILevel
  start: string
  deliveries: string[]
}

/** Paginated scenario list — snake_case `page_size` mirrors the v2 API. */
export interface PageV2<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

/** One precomputed trial row from a cohort's evaluation CSV. `success` is
 *  intentionally absent — always 1 under soft-blocking. */
export interface CompactResult {
  scenario_id: string
  ri_key: RILevel
  profile: Profile
  algorithm: AlgorithmId
  delivered: number
  objective: number
  time_min: number
  distance_km: number
  flood: number
  landslide: number
  blockage: number
  common_risk: number
  hops: number
  visit_order: string[]
}

/** One faceted metric cell from `GET /api/v2/metrics`, meaned over the trials
 *  in the `(cohort, profile, ri_key, algorithm)` bucket. `success_rate` is
 *  intentionally absent — always 1.0 under soft-blocking. */
export interface MetricFacetV2 {
  cohort: string
  profile: Profile
  ri_key: RILevel
  algorithm: AlgorithmId
  category: AlgorithmCategory
  n: number
  objective: number
  travel_time_min: number
  distance_km: number
  common_risk_exposure: number
  blockage_exposure: number
  hops: number
  replan_count: number
}

/** Manuscript baseline-reduction row: percent improvement of a learned model
 *  over one comparator — `100 * (mean_baseline - mean_model) / mean_baseline`,
 *  so a positive value means the model lowered that (lower-is-better) metric. */
export interface BaselineReductionV2 {
  profile: Profile
  ri_key: RILevel
  model: AlgorithmId
  baseline: AlgorithmId
  metric: string
  mean_model: number
  mean_baseline: number
  reduction_pct: number
}

export interface MetricsResponseV2 {
  cohort: string
  facets: MetricFacetV2[]
  baseline_reductions: BaselineReductionV2[]
}
