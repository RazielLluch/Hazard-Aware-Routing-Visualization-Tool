import { Polyline, Marker, Popup, useMap } from "react-leaflet";
import * as L from 'leaflet';
import { RouteResponseModel, RouteMetadata } from "@/types/routing";
import { renderToString } from "react-dom/server";
import { PiWarehouseBold } from "react-icons/pi";
import { FaMapMarkerAlt } from "react-icons/fa";

interface RouteLayerProps {
    route: RouteResponseModel;
    metadata?: RouteMetadata;
}

export default function RouteLayer({ route, metadata }: RouteLayerProps) {
    const map = useMap();

    // Ensure a pane for the polyline with lower zIndex
    map.createPane("polylinePane");
    map.getPane("polylinePane")!.style.zIndex = "400"; // lower than marker default (600)

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
                const positions = segment.coordinates.map(c => [c.lat, c.lng] as [number, number]);
                return (
                    <Polyline
                        key={segment.id}
                        positions={positions}
                        pathOptions={{
                            color: metadata?.color ?? "blue",
                            weight: metadata?.lineWeight ?? 5,
                            opacity: metadata?.opacity ?? 0.9
                        }}
                        pane="polylinePane" // ✅ assign the polyline to its pane
                    />
                );
            })}

            {route.deliveryStops.map(stop => (
                <Marker
                    key={stop.id}
                    position={[stop.location.lat, stop.location.lng]}
                    icon={stop.sequence === 1 ? depotIcon : stopIcon}
                >
                    <Popup>
                        {stop.sequence === 1 ? "Depot" : `Stop ${stop.sequence! - 1}`}
                        {stop.label ? ` - ${stop.label}` : ""}
                    </Popup>
                </Marker>
            ))}
        </>
    );
}