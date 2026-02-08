"use client";

import { useState } from "react";
import RouteSelector from "./RouteSelector";
import ExecuteButton from "./ExecuteButton";
import type { RouteType } from "@/types/routing";
import RainIntensitySlider from "@/components/features/NavigationPanel/RainIntensitySlider";
import {RainIntensity} from "@/types/hazard";

interface NavigationPanelProps {
    onExecute: (routeType: RouteType) => void;
}

export default function NavigationPanel({ onExecute }: NavigationPanelProps) {
    const [routeType, setRouteType] = useState<RouteType>("balanced");
    const [rainIntensity, setRainIntensity] = useState<RainIntensity>(3);

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl p-4 bg-white shadow-lg rounded-lg flex gap-4 items-center">
            <RainIntensitySlider value={rainIntensity} onChange={setRainIntensity}/>
            <RouteSelector value={routeType} onChange={setRouteType} />
            <ExecuteButton onClick={() => onExecute(routeType)} />
        </div>
    );
}
