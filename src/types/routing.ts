export type RouteType = "safe" | "balanced" | "fast";

export interface Coordinate {
    lat: number;
    lng: number;
}

export interface RouteSegment {
    id: string;
    coordinates: Coordinate[];
    distanceMeters: number;
    travelTimeSeconds: number;
    hazardScore: number;
}

export interface RouteResult {
    id: string;
    type: RouteType;
    segments: RouteSegment[];
    totalDistanceMeters: number;
    totalTravelTimeSeconds: number;
    averageHazardScore: number;
}

export interface RouteMetadata {
    color?: string;
    lineWeight?: number;
    opacity?: number;
}