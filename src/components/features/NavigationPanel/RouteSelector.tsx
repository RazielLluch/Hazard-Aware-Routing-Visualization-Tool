"use client";

import { RouteType } from "@/types/routing";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {useStopsStore} from "@/store/stopsStore";

const ROUTE_OPTIONS: RouteType[] = ["safe", "balanced", "fast"];

export default function RouteSelector() {

    const routeType = useStopsStore((state) => state.routeType);
    const setRouteType = useStopsStore((state) => state.setRouteType);


    return (
        <div className="flex flex-col gap-2 min-w-[100px]">
            <span className="text-sm text-muted-foreground">
            Route Type
            </span>

            <Select value={routeType} onValueChange={setRouteType}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select route" />
                </SelectTrigger>

                <SelectContent>
                    {ROUTE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}