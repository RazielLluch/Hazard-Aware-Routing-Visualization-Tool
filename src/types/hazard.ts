import { GeoJSON } from "geojson";

export type HazardType = "flood" | "landslide";

export interface HazardFeature {
    id: string;
    type: HazardType;
    geometry: GeoJSON.Geometry; // Using TypeScript GeoJSON types
    score: number; // normalized 0-1 risk
}

export interface HazardLayer {
    id: string;
    name: string;
    features: HazardFeature[];
    visible: boolean;
}

// hazard.ts
export enum RainIntensity {
    RI1 = "RI1",
    RI2 = "RI2",
    RI3 = "RI3",
    RI4 = "RI4",
    RI5 = "RI5",
}

// Map enum → integer for slider
export const RainIntensityValues: Record<RainIntensity, number> = {
    [RainIntensity.RI1]: 1,
    [RainIntensity.RI2]: 2,
    [RainIntensity.RI3]: 3,
    [RainIntensity.RI4]: 4,
    [RainIntensity.RI5]: 5,
};

// Map enum → human-readable label
export const RainIntensityLabels: Record<RainIntensity, string> = {
    [RainIntensity.RI1]: "Light",
    [RainIntensity.RI2]: "Moderate",
    [RainIntensity.RI3]: "Heavy",
    [RainIntensity.RI4]: "Intense",
    [RainIntensity.RI5]: "Torrential",
};

// Helpers
export function intToRI(i: number): RainIntensity {
    const entry = (Object.entries(RainIntensityValues) as [RainIntensity, number][]).find(
        ([, val]) => val === i
    );
    if (!entry) throw new Error(`Invalid RainIntensity number: ${i}`);
    return entry[0];
}

export function RIToInt(ri: RainIntensity): number {
    return RainIntensityValues[ri];
}