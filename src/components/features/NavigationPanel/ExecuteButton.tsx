"use client";

interface ExecuteButtonProps {
    onClick: () => void;
}

export default function ExecuteButton({ onClick }: ExecuteButtonProps) {
    return (
        <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
    onClick={onClick}
        >
      ▶ Apply
    </button>
);
}
