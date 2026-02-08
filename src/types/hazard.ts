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

export type RainIntensity = 1 | 2 | 3 | 4 | 5;