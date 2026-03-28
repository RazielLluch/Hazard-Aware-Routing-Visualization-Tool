"use client";

import { Button } from "@/components/ui/button";
import {useRouteRequestStore} from "@/store/routeStore";

interface ExecuteButtonProps {
    onClick: () => void;
}

export default function ExecuteButton() {

    const addRouteCall = useRouteRequestStore((s) => s.addRouteCall);

    return (
        <Button onClick={addRouteCall}>
            ▶ Apply
        </Button>
    );
}