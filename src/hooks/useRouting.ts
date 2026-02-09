"use client";

import { useState, useCallback } from "react";
import type { RainIntensity } from "@/types/hazard";
import type { RouteType, RouteResult } from "@/types/routing";

interface UseRoutingResult {
    route: RouteResult | null;
    isLoading: boolean;
    error: string | null;
    executeRoute: (
        type: RouteType,
        rainIntensity: RainIntensity
    ) => Promise<void>;
}

export function useRouting(): UseRoutingResult {
    const [route, setRoute] = useState<RouteResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeRoute = useCallback(
        async (type: RouteType, rainIntensity: RainIntensity) => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    type,
                    rainIntensity: rainIntensity.toString(),
                });

                const response = await fetch(`/api/routes?${params.toString()}`);

                if (!response.ok) {
                    throw new Error(`Routing failed (${response.status})`);
                }

                const data: RouteResult = await response.json();
                setRoute(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unknown routing error"
                );
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        route,
        isLoading,
        error,
        executeRoute,
    };
}
