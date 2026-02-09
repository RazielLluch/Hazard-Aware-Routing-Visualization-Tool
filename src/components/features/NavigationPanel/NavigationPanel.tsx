"use client";

import { useState } from "react";
import RouteSelector from "./RouteSelector";
import ExecuteButton from "./ExecuteButton";
import RainIntensitySlider from "./RainIntensitySlider";
import type { RouteType } from "@/types/routing";
import type { RainIntensity } from "@/types/hazard";

interface NavigationPanelProps {
    onExecute: (routeType: RouteType, rainIntensity: RainIntensity) => void;
    floodVisible: boolean;
    landslideVisible: boolean;
    setFloodVisible: (val: boolean) => void;
    setLandslideVisible: (val: boolean) => void;
}

export default function NavigationPanel({
                                            onExecute,
                                            floodVisible,
                                            landslideVisible,
                                            setFloodVisible,
                                            setLandslideVisible,
                                        }: NavigationPanelProps) {
    const [routeType, setRouteType] = useState<RouteType>("balanced");
    const [rainIntensity, setRainIntensity] = useState<RainIntensity>(3);

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl p-4 bg-white shadow-lg rounded-lg flex flex-col gap-20">
            <div className="flex gap-4 items-center">
                <RainIntensitySlider value={rainIntensity} onChange={setRainIntensity}/>
                <RouteSelector value={routeType} onChange={setRouteType}/>
                <ExecuteButton onClick={() => onExecute(routeType, rainIntensity)}/>
                <div className="flex-col gap-4 items-center">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={floodVisible}
                            onChange={() => setFloodVisible(!floodVisible)}
                        />
                        Flood Hazard
                    </label>
                    <label className="flex items-center gap-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={landslideVisible}
                            onChange={() => setLandslideVisible(!landslideVisible)}
                        />
                        Landslide Hazard
                    </label>
                </div>
            </div>
        </div>
    );
}
