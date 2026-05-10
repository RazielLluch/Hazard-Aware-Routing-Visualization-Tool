import type { GraphNode, LatLng } from "@/types/api"

/**
 * Find the graph node closest to a clicked map coordinate.
 *
 * Implementation note: for the current ~200-node subgraph, a linear scan
 * over squared distances is well under 1ms per click and lets us avoid
 * the complexity of a KD-tree. If a future graph grows past ~10k nodes,
 * swap the body of this function for a KD-tree (e.g. via `kdbush`)
 * without changing the call sites.
 *
 * Distance is computed in equirectangular projection -- adequate for
 * "which node is closest" comparisons within a single municipality.
 * Latitude is corrected by `cos(lat)` so longitudinal differences scale
 * realistically.
 */
export function findNearestNode(
  target: LatLng,
  nodes: readonly GraphNode[],
): GraphNode | null {
  if (nodes.length === 0) return null

  const cosLat = Math.cos((target.lat * Math.PI) / 180)
  let bestIdx = 0
  let bestDistSq = Infinity

  for (let i = 0; i < nodes.length; i++) {
    const dLat = nodes[i].location.lat - target.lat
    const dLng = (nodes[i].location.lng - target.lng) * cosLat
    const distSq = dLat * dLat + dLng * dLng
    if (distSq < bestDistSq) {
      bestDistSq = distSq
      bestIdx = i
    }
  }

  return nodes[bestIdx]
}

/**
 * Approximate distance in metres between two LatLng points using the
 * equirectangular projection. Good enough for local "within X metres"
 * tolerance checks; not appropriate for routing.
 */
export function approxDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000 // mean earth radius in metres
  const cosLat = Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180))
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = (((b.lng - a.lng) * Math.PI) / 180) * cosLat
  return R * Math.sqrt(dLat * dLat + dLng * dLng)
}
