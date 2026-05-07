"use client";

import { Button } from "@/components/ui/button";
import {useRouteRequestStore} from "@/store/routeStore";

interface ExecuteButtonProps {
    text?: string;
    onClick?: () => void;
}

export default function ExecuteButton({text, onClick} : ExecuteButtonProps) {
    const addRouteCall = useRouteRequestStore((s) => s.addRouteCall);

    const handleClick = onClick ?? addRouteCall

    return (
        <Button onClick={handleClick}>
            {text ?? "▶ Apply"}
        </Button>
    );
}