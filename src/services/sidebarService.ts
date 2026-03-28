// services/sidebarService.ts
import { DeliveryStop } from "@/types/routing";
import { OSMSearchResult } from "@/types/search";

export const createStopFromOSM = (loc: OSMSearchResult): DeliveryStop => ({
    id: loc.place_id,
    label: loc.display_name,
    location: {
        lat: parseFloat(loc.lat),
        lng: parseFloat(loc.lon),
    },
});