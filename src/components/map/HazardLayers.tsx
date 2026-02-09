"use client";

import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoJSON } from "react-leaflet";

interface HazardLayerProps {
    floodVisible: boolean;
    landslideVisible: boolean;
}

export default function HazardLayer({
                                        floodVisible,
                                        landslideVisible,
                                    }: HazardLayerProps) {
    const [floodData, setFloodData] = useState<any>(null);
    const [landslideData, setLandslideData] = useState<any>(null);
    const map = useMap();

    // Load GeoJSON once
    useEffect(() => {
        if (floodVisible && !floodData) {
            fetch("/data/flood25.geojson")
                .then((res) => res.json())
                .then(setFloodData)
                .catch(console.error);
        }
        if (landslideVisible && !landslideData) {
            fetch("/data/landslide.geojson")
                .then((res) => res.json())
                .then(setLandslideData)
                .catch(console.error);
        }
    }, [floodVisible, landslideVisible]);

    // Optional styling
    const floodStyle = {
        color: "blue",
        weight: 1,
        fillOpacity: 0.3,
    };
    const landslideStyle = {
        color: "brown",
        weight: 1,
        fillOpacity: 0.3,
    };

    return (
        <>
            {floodVisible && floodData && <GeoJSON data={floodData} style={floodStyle} />}
            {landslideVisible && landslideData && (
                <GeoJSON data={landslideData} style={landslideStyle} />
            )}
        </>
    );
}
