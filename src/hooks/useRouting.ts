"use client";

import { useState, useCallback } from "react";
import type { RainIntensity } from "@/types/hazard";
import type { RouteType, RouteResponseModel } from "@/types/routing";

interface UseRoutingResult {
    route: RouteResponseModel | null;
    isLoading: boolean;
    error: string | null;
    executeRoute: (
        type: RouteType,
        rainIntensity: RainIntensity
    ) => Promise<void>;
}

export function useRouting(): UseRoutingResult {
    const [route, setRoute] = useState<RouteResponseModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeRoute = useCallback(
        async (type: RouteType, rainIntensity: RainIntensity) => {
            setIsLoading(true);
            setError(null);

            try {
                console.log("Execute Route triggered");

                const response = await fetch("http://127.0.0.1:8000");
                if (!response.ok) {
                    throw new Error(`API request failed (${response.status})`);

                }

                const data = await response.json();
                console.log("API Response:", data);

                // Temporary: do not set route yet
                // setRoute(data);

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
