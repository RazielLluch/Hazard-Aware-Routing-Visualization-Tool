import { useEffect, useRef, useState } from "react";

type LODLevel = "low" | "mid" | "high";

export function useLODGeoJSON(
    baseName: string,
    lodLevel: LODLevel,
    visible: boolean
) {
    const [data, setData] = useState<any>(null);
    const cache = useRef<Record<string, any>>({});

    useEffect(() => {
        if (!visible) return;

        const file = `/data/${baseName}_${lodLevel}.geojson`;

        if (cache.current[file]) {
            setData(cache.current[file]);
            return;
        }

        const controller = new AbortController();

        fetch(file, { signal: controller.signal })
            .then((res) => res.json())
            .then((json) => {
                cache.current[file] = json;
                setData(json);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error(err);
                }
            });

        return () => controller.abort();
    }, [baseName, lodLevel, visible]);

    return data;
}