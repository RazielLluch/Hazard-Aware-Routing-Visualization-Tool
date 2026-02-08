"use client";

interface RouteSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const ROUTE_OPTIONS = ["safe", "balanced", "fast"] as const;

export default function RouteSelector({ value, onChange }: RouteSelectorProps) {
    return (
        <select
            className="border px-3 py-2 rounded-md"
    value={value}
    onChange={(e) => onChange(e.target.value)}
>
    {ROUTE_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
        {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
    ))}
    </select>
);
}
