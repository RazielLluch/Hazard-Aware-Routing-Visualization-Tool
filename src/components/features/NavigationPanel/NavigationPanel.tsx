"use client";

import RouteSelector from "./RouteSelector";
import ExecuteButton from "./ExecuteButton";
import RainIntensitySlider from "./RainIntensitySlider";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface NavigationPanelProps {
    floodVisible: boolean;
    landslideVisible: boolean;
    setFloodVisible: (val: boolean) => void;
    setLandslideVisible: (val: boolean) => void;
}

function HazardsCheckboxes({
                               floodVisible,
                               landslideVisible,
                               setFloodVisible,
                               setLandslideVisible,
                           }: {
    floodVisible: boolean;
    landslideVisible: boolean;
    setFloodVisible: (val: boolean) => void;
    setLandslideVisible: (val: boolean) => void;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Checkbox
                    checked={floodVisible}
                    onCheckedChange={(val) => setFloodVisible(!!val)}
                />
                <Label>Flood Hazard</Label>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    checked={landslideVisible}
                    onCheckedChange={(val) => setLandslideVisible(!!val)}
                />
                <Label>Landslide Hazard</Label>
            </div>
        </div>
    );
}

export default function NavigationPanel({
                                            floodVisible,
                                            landslideVisible,
                                            setFloodVisible,
                                            setLandslideVisible,
                                        }: NavigationPanelProps) {

    return (
        <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl shadow-lg">
            <CardContent className="p-4 flex flex-col gap-6">
                <div className="flex flex-row gap-4 items-center">
                    <RainIntensitySlider />

                    <RouteSelector />

                    <ExecuteButton />

                    <HazardsCheckboxes
                        floodVisible={floodVisible}
                        landslideVisible={landslideVisible}
                        setFloodVisible={setFloodVisible}
                        setLandslideVisible={setLandslideVisible}
                    />
                </div>
            </CardContent>
        </Card>
    );
}