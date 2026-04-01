"use client";

import { useState } from "react";
import { useRouteRequestStore } from "@/store/routeStore";
import { DeliveryStop } from "@/types/routing";
import {searchOSM} from "@/services/searchService";
import SearchResultItem from "@/components/features/SideBar/SearchResultItem";
import DeliveryStopsList from "@/components/features/SideBar/DeliveryStopsList";
import LocationPopup from "@/components/LocationPopup";
import {OSMSearchResult} from "@/types/search";
import {createStopFromOSM} from "@/services/sidebarService";
import StopItem from "@/components/features/SideBar/StopItem";

export default function Sidebar() {
    const depot = useRouteRequestStore((s) => s.depot);
    const requestStops = useRouteRequestStore((s) => s.requestStops);
    const addStop = useRouteRequestStore((s) => s.addStop);
    const setDepot = useRouteRequestStore((s) => s.setDepot);
    const selectedLocation = useRouteRequestStore((s) => s.selectedLocation);
    const setSelectedLocation = useRouteRequestStore((s) => s.setSelectedLocation);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<OSMSearchResult[]>([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupLabel, setPopupLabel] = useState("");

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const data = await searchOSM(`${searchQuery}, La Trinidad, Benguet, Philippines`);
        setSearchResults(data);
    };

    // When clicking a search result
    const handleSelectLocation = (loc: OSMSearchResult) => {
        setSelectedLocation(createStopFromOSM(loc));
        setPopupLabel(loc.display_name);
        setPopupVisible(true);
    };

    const handleAddLocation = (asDepot: boolean) => {
        if (!selectedLocation) return;

        const location: DeliveryStop = {
            ...selectedLocation,
            label: popupLabel || selectedLocation.label,
        };

        if (asDepot) {
            if (depot) {
                if (!confirm("A depot is already set. Overwrite?")) {
                    setPopupVisible(false);
                    return;
                }
            }
            setDepot(location);
        } else {
            addStop(location);
        }

        setPopupVisible(false);
        setSelectedLocation(null);
        setSearchResults([]);
        setSearchQuery("");
    };

    return (
        <div className="w-[320px] h-screen p-4 bg-white border-r overflow-y-auto relative">
            {/* Search Section */}
            <section className="mb-6">
                <h2 className="font-semibold mb-2">Search Location</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                        className="p-2 bg-blue-500 text-white rounded"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>

                {/* Search Results */}
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map((loc) => (
                        <SearchResultItem key={loc.place_id} loc={loc} onSelect={handleSelectLocation} />
                    ))}
                </div>
            </section>
            <section className="mb-6">
                <h2 className="font-semibold mb-2">Depot</h2>
                <StopItem stop={depot} isDepot />
            </section>

            {/* Delivery Stops Section */}
            <section className="mb-6">
                <h2 className="font-semibold mb-2">Delivery Stops</h2>
                <DeliveryStopsList stops={requestStops}/>
            </section>

            {/* Popup for Adding Location */}
            {popupVisible && selectedLocation && (
                <LocationPopup
                    label={popupLabel}
                    onLabelChange={setPopupLabel}
                    onAddAsDepot={() => handleAddLocation(true)}
                    onAddAsStop={() => handleAddLocation(false)}
                    onCancel={() => setPopupVisible(false)}
                />
            )}
        </div>
    );
}