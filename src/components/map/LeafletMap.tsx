"use client";

import { MapContainer } from "react-leaflet";
import HazardLayer from "./HazardLayers";
import BaseMapLayer from "@/components/map/BaseMapLayer";
import routeData1 from "@/data/mockRouteAmbiguous.json"
import routeData2 from "@/data/mockRouteDetailed.json"
import RouteLayer from "@/components/map/RouteLayer";

interface LeafletMapProps {
    floodVisible: boolean;
    landslideVisible: boolean;
}

export default function LeafletMap({
                                       floodVisible,
                                       landslideVisible,
                                   }: LeafletMapProps) {
    return (
        <MapContainer
            center={[16.4484, 120.5905]}
            zoom={14}
            className="absolute inset-0 z-0"
        >
            <BaseMapLayer />

            <HazardLayer
                floodVisible={floodVisible}
                landslideVisible={landslideVisible}
            />

            <RouteLayer
                route={routeData2}
                metadata={{
                    color: "black",
                    lineWeight: 6,
                    opacity: 1
                }}
            />

        </MapContainer>
    );
}
