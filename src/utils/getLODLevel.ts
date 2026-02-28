export type LODLevel = "low" | "mid" | "high";

export function getLODLevel(zoom: number): LODLevel {
    if (zoom >= 14) return "high";
    if (zoom >= 10) return "mid";
    return "low";
}