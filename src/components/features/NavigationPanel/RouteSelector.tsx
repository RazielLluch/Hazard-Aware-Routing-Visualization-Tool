"use client";

import {RouteType} from "@/types/routing";

interface RouteSelectorProps {
    value: string;
    onChange: (value: RouteType) => void;
}

const ROUTE_OPTIONS = ["safe", "balanced", "fast"] as const;

export default function RouteSelector({ value, onChange }: RouteSelectorProps) {
    return (
        <select
            className="border px-3 py-2 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={value}
    onChange={(e) => onChange(e.target.value as RouteType)}
>
    {ROUTE_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
        {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
    ))}
    </select>
);
}
