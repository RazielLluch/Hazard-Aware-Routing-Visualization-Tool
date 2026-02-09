"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import BaseMapLayer from "./BaseMapLayer";
import HazardLayer from "./HazardLayers";
import RouteLayer from "./RouteLayer";

export default function LeafletMap() {
    return (
        <MapContainer
            className="absolute inset-0 z-0"
            center={[14.5995, 120.9842]}
            zoom={13}
        >
            <BaseMapLayer />
            {/*<HazardLayer />*/}
            {/*<RouteLayer />*/}
        </MapContainer>
    );
}
