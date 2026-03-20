"use client"

import { Polyline, Marker, Popup } from "react-leaflet"
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteResponseModel, RouteMetadata } from "@/types/routing"
import { renderToString } from "react-dom/server";
import { PiWarehouseBold } from "react-icons/pi";
import { FaMapMarkerAlt } from "react-icons/fa";


interface RouteLayerProps {
    route: RouteResponseModel
    metadata?: RouteMetadata
}

export default function RouteLayer({ route, metadata }: RouteLayerProps) {

    const depotIcon = L.divIcon({
        html: renderToString(<PiWarehouseBold size={28} color="red" />),
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28]
    });

    const stopIcon = L.divIcon({
        html: renderToString(<FaMapMarkerAlt size={28} color="red" />),
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28]
    });

    return (
        <>

            {route.segments.map(segment => {

                const positions = segment.coordinates.map(c => [c.lat, c.lng] as [number, number])

                return (
                    <Polyline
                        key={segment.id}
                        positions={positions}
                        pathOptions={{
                            color: metadata?.color ?? "blue",
                            weight: metadata?.lineWeight ?? 5,
                            opacity: metadata?.opacity ?? 0.9
                        }}
                    />
                )
            })}

            {route.deliveryStops.map(stop => (
                <Marker
                    key={stop.id}
                    position={[stop.location.lat, stop.location.lng]}
                    icon={stop.sequence === 1? depotIcon : stopIcon}
                >
                    <Popup>
                        {stop.sequence === 1? "Depot" : `Stop ${stop.sequence! - 1}`}
                        {stop.label ? ` - ${stop.label}` : `${stop.id === "1"? "depot" : ""}`}
                    </Popup>
                </Marker>
            ))}
        </>
    )
}