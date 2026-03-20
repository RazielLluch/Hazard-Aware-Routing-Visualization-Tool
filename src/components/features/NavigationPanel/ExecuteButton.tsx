"use client";

import { Button } from "@/components/ui/button";

interface ExecuteButtonProps {
    onClick: () => void;
}

export default function ExecuteButton({ onClick }: ExecuteButtonProps) {
    return (
        <Button onClick={onClick}>
            ▶ Apply
        </Button>
    );
}