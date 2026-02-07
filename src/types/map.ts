import {Coordinate} from "@/types/routing";

export interface MapBounds {
    northEast: Coordinate;
    southWest: Coordinate;
}

export interface MapMarker {
    id: string;
    position: Coordinate;
    label?: string;
}

export interface MapLayer {
    id: string;
    name: string;
    visible: boolean;
    color?: string;
}
