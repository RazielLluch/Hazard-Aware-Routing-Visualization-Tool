// components/DeliveryStopsList.tsx
import { DeliveryStop } from "@/types/routing";
import { Button } from "@/components/ui/button"; // or any button component you use
import { useRouteRequestStore } from "@/store/routeStore";

type DeliveryStopsListProps = {
    stops: DeliveryStop[];
};

export default function DeliveryStopsList({ stops }: DeliveryStopsListProps) {

    const removeStop = useRouteRequestStore((s) => s.removeStop);

    if (stops.length === 0) {
        return <div className="text-gray-500">No delivery stops yet</div>;
    }

    return (
        <div className="space-y-2 max-h-48 overflow-y-auto">
            {stops.map((stop, idx) => (
                <div
                    key={idx}
                    className="p-2 border rounded flex justify-between items-center"
                >
                    <span>{stop.label}</span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStop(idx)}
                    >
                        Remove
                    </Button>
                </div>
            ))}
        </div>
    );
}