"use client";

import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";
import type { RainIntensity } from "@/types/hazard";

interface RainIntensitySliderProps {
    value: RainIntensity;
    onChange: (value: RainIntensity) => void;
}

const LABELS: Record<RainIntensity, string> = {
    1: "Very Light",
    2: "Light",
    3: "Moderate",
    4: "Heavy",
    5: "Extreme",
};

export default function RainIntensitySlider({
                                                value,
                                                onChange,
                                            }: RainIntensitySliderProps) {
    // single-thumb slider: state is optional, can be controlled from parent
    const [internalValue, setInternalValue] = useState<RainIntensity>(value);

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Top label */}
            <div className="flex justify-between text-sm text-gray-700">
                <span>Rain Intensity</span>
                <span className="font-medium">
          RI_{internalValue} — {LABELS[internalValue]}
        </span>
            </div>

            {/* Slider */}
            <Slider.Root
                className="relative flex items-center w-full h-4 select-none touch-none"
                value={[internalValue]}
                min={1}
                max={5}
                step={1}
                onValueChange={(val) => {
                    const ri = val[0] as RainIntensity;
                    setInternalValue(ri);
                    onChange(ri);
                }}
            >
                <Slider.Track className="bg-gray-200 relative grow h-1 rounded-full">
                    <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white border border-gray-400 rounded-full shadow-md cursor-pointer" />

                {/* Tick marks */}
                {([1, 2, 3, 4, 5] as const).map((v) => (
                    <div
                        key={v}
                        className="absolute -top-3 text-xs text-gray-500"
                        style={{ left: `${((v - 1) / 4) * 100}%` }}
                    >
                        RI_{v}
                    </div>
                ))}
            </Slider.Root>

            {/* Optional bottom labels */}
            <div className="flex justify-between text-xs text-gray-500 px-1">
                {([1, 2, 3, 4, 5] as const).map((v) => (
                    <span key={v}>{LABELS[v]}</span>
                ))}
            </div>
        </div>
    );
}
