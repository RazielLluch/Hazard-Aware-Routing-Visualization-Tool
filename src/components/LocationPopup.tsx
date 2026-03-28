// components/LocationPopup.tsx
"use client";

import { DeliveryStop } from "@/types/routing";

type LocationPopupProps = {
    label: string;
    onLabelChange: (val: string) => void;
    onAddAsDepot: () => void;
    onAddAsStop: () => void;
    onCancel: () => void;
};

export default function LocationPopup({
                                          label,
                                          onLabelChange,
                                          onAddAsDepot,
                                          onAddAsStop,
                                          onCancel,
                                      }: LocationPopupProps) {
    return (
        <div className="absolute top-24 left-4 right-4 bg-white border shadow-lg rounded p-4 z-50">
            <h3 className="font-semibold mb-2">Add Location</h3>

            <div className="mb-2">
                <label className="block text-sm mb-1">Label:</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded outline-none"
                    value={label}
                    onChange={(e) => onLabelChange(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <button
                    className="flex-1 bg-green-500 text-white p-2 rounded"
                    onClick={onAddAsDepot}
                >
                    Set as Depot
                </button>
                <button
                    className="flex-1 bg-blue-500 text-white p-2 rounded"
                    onClick={onAddAsStop}
                >
                    Add as Stop
                </button>
                <button
                    className="flex-1 bg-gray-300 text-black p-2 rounded"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}