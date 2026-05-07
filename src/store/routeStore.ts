import { create } from "zustand";
import { RouteCall, RouteRequestModel } from "@/types/routing";
import {requestRoute} from "@/services/routeService";
import {useStopsStore} from "@/store/stopsStore";

type RouteStateStore = {
    // history
    routeCalls: RouteCall[];


    // actions
    addRouteCall: () => Promise<void>;
};

export const useRouteRequestStore = create<RouteStateStore>((set) => ({
    // state
    routeCalls: [],

    //actions
    addRouteCall: async () => {
        const id = crypto.randomUUID();

        const {
            routeType,
            rainIntensity,
            depot,
            requestStops
        } = useStopsStore.getState();

        if (!depot) {
            alert("Please select a depot before generating a route.");
            return;
        }

        const request: RouteRequestModel = {
            id,
            routeType: routeType,
            rainIntensity: rainIntensity,
            depot: {
                id: "depot",  // fixed string for the API
                label: depot?.label ?? "Depot",
                location: depot?.location!,
            },
            deliveryStops: requestStops.map((stop, i) => ({
                id: `stop-${i + 1}`,  // API expects string IDs
                label: stop.label,
                location: stop.location,
            })),
        };

        const updateCall = (updater: (call: any) => any) =>
            set((state) => ({
                routeCalls: state.routeCalls.map((call) =>
                    call.id === id ? updater(call) : call
                ),
            }));

        set((state) => ({
            routeCalls: [...state.routeCalls, { id, request, status: "loading" },
            ],
        }));

        try {
            const response = await requestRoute(request);
            updateCall((call) => ({ ...call, response, status: "success" }))
        } catch {
            updateCall((call) => ({ ...call, status: "error" }))
        }
    },
}));