import { create } from "zustand";
import {DeliveryStop, RouteRequestModel, RouteResponseModel, RouteType} from "@/types/routing";
import {requestRoute} from "@/services/routeService";
import {RainIntensity} from "@/types/hazard";

type RouteCall = {
    id: string; // important for tracking updates
    request: RouteRequestModel;
    response?: RouteResponseModel;
    status: "idle" | "loading" | "success" | "error";
};

type RouteStateStore = {
    // current working state
    depot: DeliveryStop | null;
    requestStops: DeliveryStop[];

    rainIntensity: RainIntensity;
    routeType: RouteType;

    // history
    routeCalls: RouteCall[];

    // UI state
    selectedLocation: DeliveryStop | null;
    loading: boolean;

    // actions
    setDepot: (depot: DeliveryStop | null) => void;
    addStop: (stop: DeliveryStop) => void;
    removeStop: (index: number) => void;
    clearStops: () => void;
    setRainIntensity: (rainIntensity: RainIntensity) => void;
    setRouteType: (routeType: RouteType) => void;

    setSelectedLocation: (loc: DeliveryStop | null) => void;

    addRouteCall: () => Promise<void>;

    setLoading: (loading: boolean) => void;
};

export const useRouteRequestStore = create<RouteStateStore>((set) => ({
    // state
    depot: null,
    requestStops: [],
    routeCalls: [],
    rainIntensity: RainIntensity.RI3,
    routeType: "balanced",
    selectedLocation: null,
    loading: false,

    // actions
    setDepot: (depot) => set({ depot }),

    addStop: (stop) =>
        set((state) => ({
            requestStops: [...state.requestStops, stop],
        })),

    removeStop: (index) =>
        set((state) => ({
            requestStops: state.requestStops.filter((_, i) => i !== index),
        })),

    clearStops: () => set({ requestStops: [] }),

    setRainIntensity: (rainIntensity) => set({ rainIntensity }),

    setRouteType: (routeType) => set({routeType}),

    setSelectedLocation: (loc) => set({ selectedLocation: loc }),

    addRouteCall: async () => {
        const id = crypto.randomUUID();

        const state = useRouteRequestStore.getState(); // ✅ get current store state
        const { routeType, rainIntensity, depot, requestStops } = state;

        if (!depot) {
            alert("Please select a depot before generating a route.");
            return;
        }

        const request: RouteRequestModel = {
            id: id,
            routeType: routeType,
            rainIntensity: rainIntensity,
            depot: {
                id: "depot",  // fixed string for the API
                label: depot?.label ?? "Depot",
                location: depot?.location!,
            },
            deliveryStops: requestStops.map((stop, index) => ({
                id: `stop-${index + 1}`,  // API expects string IDs
                label: stop.label,
                location: stop.location,
            })),
        };

        set((state) => ({
            routeCalls: [
                ...state.routeCalls,
                { id, request, status: "loading" },
            ],
        }));

        try {
            const response = await requestRoute(request);

            set((state) => ({
                routeCalls: state.routeCalls.map((call) =>
                    call.id === id
                        ? { ...call, response, status: "success" }
                        : call
                ),
            }));
        } catch {
            set((state) => ({
                routeCalls: state.routeCalls.map((call) =>
                    call.id === id
                        ? { ...call, status: "error" }
                        : call
                ),
            }));
        }
    },

    setLoading: (loading) => set({ loading }),
}));