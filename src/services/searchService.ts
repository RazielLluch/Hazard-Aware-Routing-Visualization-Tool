export type OSMSearchResult = {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
};

const DEFAULT_LOCATION_SUFFIX =
    ", La Trinidad, Benguet, Cordillera Administrative Region, 2601, Philippines";

export async function searchOSM(query: string): Promise<OSMSearchResult[]> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
    )}&format=json&limit=5`;

    const res = await fetch(url, {
        headers: {
            "Accept": "application/json",
            "User-Agent": "RouteApp/1.0",
        },
    });

    const data: OSMSearchResult[] = await res.json();

    // Clean display names
    return data.map((item) => {
        let name = item.display_name;
        if (name.endsWith(DEFAULT_LOCATION_SUFFIX)) {
            name = name.slice(0, -DEFAULT_LOCATION_SUFFIX.length);
        }
        return { ...item, display_name: name };
    });
}