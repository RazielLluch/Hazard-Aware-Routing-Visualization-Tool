// components/DeliveryStopsList.tsx
import { DeliveryStop } from "@/types/routing";
import { useRouteRequestStore } from "@/store/routeStore";
import StopItem from "@/components/features/SideBar/StopItem";

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
                <StopItem
                    key={idx}
                    stop={stop}
                    index={idx}
                    onRemove={removeStop}
                />
            ))}
        </div>
    );
}