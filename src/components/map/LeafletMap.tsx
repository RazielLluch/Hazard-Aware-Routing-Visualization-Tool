"use client";

import {MapContainer, Pane} from "react-leaflet";
import HazardLayer from "./HazardLayers";
import BaseMapLayer from "@/components/map/BaseMapLayer";
import RouteLayer from "@/components/map/RouteLayer";
import {useRouteRequestStore} from "@/store/routeStore";

interface LeafletMapProps {
    floodVisible: boolean;
    landslideVisible: boolean;
}

export default function LeafletMap({
                                       floodVisible,
                                       landslideVisible,
                                   }: LeafletMapProps) {

    const routeCalls = useRouteRequestStore((s) => s.routeCalls);

    return (
        <MapContainer
            center={[16.4484, 120.5905]}
            zoom={14}
            className="absolute inset-0 z-0"
        >
            <BaseMapLayer />
            <HazardLayer
                floodVisible={floodVisible}
                landslideVisible={landslideVisible}
                fillOpacity={0.8}
            />

            <Pane name="routePane" style={{ zIndex: 200 }}>
                {routeCalls
                    .filter((call) => call.status === "success" && call.response)
                    .map((call) => (
                        <RouteLayer
                            key={call.id}
                            route={call.response!} // we know response exists
                            metadata={{
                                color: "black",
                                lineWeight: 4,
                                opacity: 1,
                            }}
                        />
                    ))}
            </Pane>

        </MapContainer>
    );
}
