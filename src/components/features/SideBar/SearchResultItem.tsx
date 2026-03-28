// components/SearchResultItem.tsx
import { OSMSearchResult } from "@/services/searchService";

type SearchResultItemProps = {
    loc: OSMSearchResult;
    onSelect: (loc: OSMSearchResult) => void;
};

export default function SearchResultItem({ loc, onSelect }: SearchResultItemProps) {
    return (
        <div
            className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => onSelect(loc)}
        >
            {loc.display_name}
        </div>
    );
}