import { RouteRequestModel, RouteResponseModel } from "@/types/routing";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function requestRoute(
    request: RouteRequestModel
): Promise<RouteResponseModel> {

    console.log(JSON.stringify(request));

    const res = await fetch(`${BASE_URL}/route/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch route");
    }

    return res.json();
}