import {create} from "zustand";
import {DeliveryStop, RouteType} from "@/types/routing";
import {isSameLocation} from "@/utils/duplicateChecker";
import {RainIntensity} from "@/types/hazard";

type StopsStateStore = {
    depot: DeliveryStop | null;
    requestStops: DeliveryStop[]
    rainIntensity: RainIntensity;
    routeType: RouteType;

    selectedLocation: DeliveryStop | null;
    loading: boolean;

    setDepot: (depot: DeliveryStop | null) => void;
    addStop: (stop: DeliveryStop) => void;
    removeStop: (index: number) => void;
    clearStops: () => void;
    setRainIntensity: (rainIntensity: RainIntensity) => void;
    setRouteType: (routeType: RouteType) => void;
    setSelectedLocation: (loc: DeliveryStop | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useStopsStore = create<StopsStateStore>((set) => ({
    depot: null,
    requestStops: [],
    rainIntensity: RainIntensity.RI3,
    routeType: "balanced",
    selectedLocation: null,
    loading: false,

    setDepot: (depot) =>
        set((state) => {
            const existsInStops = state.requestStops.some((s) =>
                isSameLocation(s, depot!)
            );

            if (existsInStops) {
                console.warn("Depot already exists as a stop");
                return state;
            }

            return { depot };
        }),

    addStop: (stop) =>
        set((state) => {
            const alreadyExists = state.requestStops.some((s) =>
                isSameLocation(s, stop)
            );

            if (alreadyExists) {
                console.warn("Stop already exists");
                return state; // no change
            }

            // optional: prevent depot duplication
            const isDepotDuplicate =
                state.depot && isSameLocation(state.depot, stop);

            if (isDepotDuplicate) {
                console.warn("Stop is already the depot");
                return state;
            }

            return {
                requestStops: [...state.requestStops, stop],
            };
        }),

    removeStop: (index) =>
        set((state) => ({
            requestStops: state.requestStops.filter((_, i) => i !== index),
        })),

    clearStops: () => set({ requestStops: [] }),

    setRainIntensity: (rainIntensity) => set({ rainIntensity }),

    setRouteType: (routeType) => set({routeType}),

    setSelectedLocation: (loc) => set({ selectedLocation: loc }),

    setLoading: (loading) => set({ loading }),
}))