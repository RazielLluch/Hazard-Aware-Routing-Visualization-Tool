// components/StopItem.tsx
import { DeliveryStop } from "@/types/routing";
import { Button } from "@/components/ui/button";

type StopItemProps = {
    stop?: DeliveryStop;
    index?: number;
    onRemove?: (index: number) => void;
    isDepot?: boolean;
    onClick?: (stop: DeliveryStop) => void;
};

export default function StopItem({
                                     stop,
                                     index,
                                     onRemove,
                                     isDepot = false,
                                     onClick,
                                 }: StopItemProps) {
    return (
        <div
            className="p-2 border rounded flex justify-between items-center"
            onClick={() => stop && onClick?.(stop)}
        >
            <span>
                {isDepot
                    ? stop
                        ? `Depot - ${stop.label}`
                        : "No depot selected"
                    : stop.label ? `${stop.label}` : ""
                }
            </span>
                {!isDepot && onRemove && index !== undefined && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation(); // 🔑 prevents triggering parent click
                            onRemove?.(index!);
                        }}
                    >
                        Remove
                    </Button>
                )}
        </div>
    );
}