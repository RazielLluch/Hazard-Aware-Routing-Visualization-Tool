"use client";

import { useState, useEffect } from "react";
import { useMap, GeoJSON } from "react-leaflet";
import { getLODLevel } from "@/utils/getLODLevel";
import { useLODGeoJSON } from "@/hooks/useLODGeoJSON";

interface HazardLayerProps {
    floodVisible: boolean;
    landslideVisible: boolean;
}

// Define color maps for hazard levels
const floodColors: Record<string, string> = {
    "1": "#B4D1E2", // low
    "2": "#5F88CE", // medium
    "3": "#2B75B2", // high
};

const landslideColors: Record<string, string> = {
    "1": "#B7E392", // low
    "2": "#66BF71", // medium
    "3": "#1A994E", // high
};

export default function HazardLayer({
                                        floodVisible,
                                        landslideVisible,
                                    }: HazardLayerProps) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const handleZoom = () => setZoom(map.getZoom());
        map.on("zoomend", handleZoom);
        return () => map.off("zoomend", handleZoom);
    }, [map]);

    const lodLevel = getLODLevel(zoom);

    const floodData = useLODGeoJSON("flood25", lodLevel, floodVisible);
    const landslideData = useLODGeoJSON("landslide", lodLevel, landslideVisible);

    // Style functions
    const floodStyle = (feature: any) => ({
        color: floodColors[feature.properties.Var] || "blue",
        weight: 1,
        fillOpacity: 0.9,
    });

    const landslideStyle = (feature: any) => ({
        color: landslideColors[feature.properties.LH] || "brown",
        weight: 1,
        fillOpacity: 0.9,
    });

    return (
        <>
            {floodVisible && floodData && (
                <GeoJSON data={floodData} style={floodStyle} />
            )}

            {landslideVisible && landslideData && (
                <GeoJSON data={landslideData} style={landslideStyle} />
            )}
        </>
    );
}