"use client";

import { MapContainer } from "react-leaflet";
import HazardLayer from "./HazardLayers";
import BaseMapLayer from "@/components/map/BaseMapLayer";

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
        </MapContainer>
    );
}
