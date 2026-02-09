"use client"

import dynamic from "next/dynamic";
import NavigationPanel from "@/components/features/NavigationPanel";
import { useRouting } from "@/hooks/useRouting";
import { useState } from "react";
import { RouteType } from "@/types/routing";
import { RainIntensity } from "@/types/hazard";

const LeafletMap = dynamic(
    () => import("@/components/map/LeafletMap"),
    { ssr : false }
);

export default function Home() {
    const [routeType, setRouteType] = useState<RouteType>("balanced");
    const [rainIntensity, setRainIntensity] = useState<RainIntensity>(3);
    const { executeRoute } = useRouting();

    return (
        <div className="h-screen w-screen relative">
            <LeafletMap />
            <NavigationPanel
                routeType={routeType}
                rainIntensity={rainIntensity}
                onRouteChange={setRouteType}
                onRainChange={setRainIntensity}
                onExecute={() => executeRoute(routeType, rainIntensity)}
            />
        </div>
      );
}
