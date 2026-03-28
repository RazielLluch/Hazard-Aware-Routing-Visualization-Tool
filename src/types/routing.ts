import {RainIntensity} from "@/types/hazard";

export type RouteType = "safe" | "balanced" | "fast";

export interface Coordinate {
    lat: number;
    lng: number;
}

export interface RouteSegment {
    id?: string;
    coordinates: Coordinate[];
    distanceMeters?: number | null;
    travelTimeSeconds?: number | null;
    hazardScore?: number | null;
}

export interface DeliveryStop {
    id?: string;
    location: Coordinate;
    sequence?: number | null;
    label?: string | null;
}

export interface RouteRequestModel {
    id: string | null;
    rainIntensity: RainIntensity;
    routeType: RouteType;
    depot: DeliveryStop;
    deliveryStops: DeliveryStop[];
}

export interface RouteResponseModel {
    id: string; // UUID represented as string in TypeScript
    type: RouteType;
    rainIntensity: RainIntensity;
    depot: DeliveryStop;
    segments: RouteSegment[];
    deliveryStops: DeliveryStop[];

    totalDistanceMeters?: number | null;
    totalTravelTimeSeconds?: number | null;
    averageHazardScore?: number | null;
    status: string;
}

export interface RouteState {
    depotId?: string  | null;
    stops: DeliveryStop[];
    rainIntensity: RainIntensity;
    routeType: RouteType;
}

export interface RouteMetadata {
    color?: string | null;
    lineWeight?: number | null;
    opacity?: number | null;
}