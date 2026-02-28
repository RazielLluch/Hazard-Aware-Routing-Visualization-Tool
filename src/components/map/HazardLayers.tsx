"use client";

import { useState, useEffect } from "react";
import { useMap, GeoJSON } from "react-leaflet";
import { getLODLevel } from "@/utils/getLODLevel";
import { useLODGeoJSON } from "@/hooks/useLODGeoJSON";

interface HazardLayerProps {
    floodVisible: boolean;
    landslideVisible: boolean;
}

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

    const floodStyle = { color: "blue", weight: 1, fillOpacity: 0.3 };
    const landslideStyle = { color: "brown", weight: 1, fillOpacity: 0.3 };

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