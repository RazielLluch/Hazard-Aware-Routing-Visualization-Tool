import {DeliveryStop} from "@/types/routing";

export const isSameLocation = (a: DeliveryStop, b: DeliveryStop) =>
    a.location.lat === b.location.lat &&
    a.location.lng === b.location.lng;