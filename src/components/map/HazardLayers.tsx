"use client";
import {TileLayer} from "react-leaflet";

interface HazardLayerProps {
    floodVisible: boolean;
    landslideVisible: boolean;
    fillOpacity: number;
}

export default function HazardLayer({
                                        floodVisible,
                                        landslideVisible,
                                        fillOpacity
                                    }: HazardLayerProps) {
    return (
        <>
            {floodVisible && (
                <TileLayer
                    url="/tiles/flood25/{z}/{x}/{y}.png"
                    opacity={fillOpacity}
                />
            )}

            {landslideVisible && (
                <TileLayer
                    url="/tiles/landslide/{z}/{x}/{y}.png"
                    opacity={fillOpacity}
                />
            )}
        </>
    );
}