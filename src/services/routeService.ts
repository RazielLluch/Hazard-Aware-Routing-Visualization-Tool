import {RouteRequestModel, RouteState} from "@/types/routing";

export function buildRouteRequest(state: RouteState): RouteRequestModel {

    const depot = state.stops.find(s => s.id === state.depotId)

    const orderedStops = [
        depot!,
        ...state.stops.filter(s => s.id !== state.depotId)
    ]

    return {
        id: null,
        rainIntensity: state.rainIntensity,
        routeType: state.routeType,
        deliveryStops: orderedStops.map((stop, index) => ({
            id: stop.id,
            location: stop.location,
            sequence: index + 1,
            label: stop.label
        }))
    }
}