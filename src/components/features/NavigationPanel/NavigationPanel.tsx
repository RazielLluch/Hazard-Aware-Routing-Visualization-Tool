"use client";

import RouteSelector from "./RouteSelector";
import ExecuteButton from "./ExecuteButton";
import RainIntensitySlider from "./RainIntensitySlider";
import type { RouteType } from "@/types/routing";
import type { RainIntensity } from "@/types/hazard";

interface NavigationPanelProps {
    routeType: RouteType;
    rainIntensity: RainIntensity;
    onRouteChange: (value: RouteType) => void;
    onRainChange: (value: RainIntensity) => void;
    onExecute: () => void;
}

export default function NavigationPanel({
                                            routeType,
                                            rainIntensity,
                                            onRouteChange,
                                            onRainChange,
                                            onExecute,
                                        }: NavigationPanelProps) {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xl p-4 bg-white shadow-lg rounded-lg flex gap-4 items-center z-[1000]">
            <RainIntensitySlider value={rainIntensity} onChange={onRainChange} />
            <RouteSelector value={routeType} onChange={onRouteChange} />
            <ExecuteButton onClick={onExecute} />
        </div>
    );
}
