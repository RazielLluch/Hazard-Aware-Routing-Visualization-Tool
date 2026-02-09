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
            center={[14.5995, 120.9842]}
            zoom={13}
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
