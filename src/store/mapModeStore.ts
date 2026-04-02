import {create} from "zustand";
import {MapMode} from "@/types/map";

type MapModeStore = {
    mapMode: MapMode;
    setMapMode: (mapMode: MapMode) => void;
};

export const useMapModeStore = create<MapModeStore>((set) => ({
    mapMode: "input",
    setMapMode: (mapMode: MapMode) => {
        set({ mapMode });
    },
}))