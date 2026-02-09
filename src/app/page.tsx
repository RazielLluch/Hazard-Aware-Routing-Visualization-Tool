"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouting } from "@/hooks/useRouting";
import NavigationPanel from "@/components/features/NavigationPanel";
import {RouteType} from "@/types/routing";
import {RainIntensity} from "@/types/hazard";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
    ssr: false,
});

export default function Home() {
    const { executeRoute } = useRouting();
    const [floodVisible, setFloodVisible] = useState(true);
    const [landslideVisible, setLandslideVisible] = useState(true);

    const handleExecute = (routeType: RouteType, rainIntensity: RainIntensity) => {
        executeRoute(routeType, rainIntensity);
    };

    return (
        <div className="relative h-screen w-screen">
            <LeafletMap
                floodVisible={floodVisible}
                landslideVisible={landslideVisible}
            />
            <NavigationPanel
                onExecute={handleExecute}
                floodVisible={floodVisible}
                landslideVisible={landslideVisible}
                setFloodVisible={setFloodVisible}
                setLandslideVisible={setLandslideVisible}
            />
        </div>
    );
}
