"use client";

import * as Slider from "@radix-ui/react-slider";
import {intToRI, RainIntensity, RIToInt} from "@/types/hazard";
import {useStopsStore} from "@/store/stopsStore";

const LABELS: Record<RainIntensity, string> = {
    "RI1": "Light",
    "RI2": "Moderate",
    "RI3": "Heavy",
    "RI4": "Intense",
    "RI5": "Torrential",
};

export default function RainIntensitySlider() {
    // single-thumb slider: state is optional, can be controlled from parent
    // const [internalValue, setInternalValue] = useState<RainIntensity>(value);

    const rainIntensity = useStopsStore((state) => state.rainIntensity);
    const setRainIntensity = useStopsStore((state) => state.setRainIntensity);

    return (
        <div className="flex flex-col gap-2 w-full pr-5">
            {/* Top label */}
            <div className="flex justify-between text-sm text-gray-700">
                <span>Rain Intensity</span>
                <span className="font-medium">
                    {rainIntensity} — {LABELS[rainIntensity]}
                </span>
            </div>

            {/* Slider */}
            <Slider.Root
                className="relative flex items-center w-full h-4 select-none touch-none"
                value={[RIToInt(rainIntensity)]}
                min={1}
                max={5}
                step={1}
                onValueChange={(val) => {
                    const ri = val[0];
                    setRainIntensity(intToRI(ri));
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
