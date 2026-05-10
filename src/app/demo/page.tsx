"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { LiveInferenceResult } from "@/components/demo/LiveInferenceResult";
import NavigationPanel from "@/components/features/NavigationPanel";
import SideBar from "@/components/features/SideBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { useStopsStore } from "@/store/stopsStore";
import { RIToInt } from "@/types/hazard";
import type {
  AlgorithmId,
  GraphInfo,
  GraphNode,
  InferenceRequest,
  InferenceResponse,
  RainLevel,
} from "@/types/api";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
});

const DEMO_GRAPH_ID = "la_trinidad_subgraph_n200";
const DEFAULT_ALGORITHM: AlgorithmId = "NNA-Dijkstra-HA";

type DemoMode =
  | { kind: "picking" }
  | { kind: "loading" }
  | { kind: "result"; result: InferenceResponse; graph: GraphInfo; nodes: GraphNode[] }
  | { kind: "error"; message: string };

/** Collect every node id referenced by a Run + scenario context so we can
 *  fetch their coordinates in a single batched listNodes call. */
function collectNodeIds(result: InferenceResponse): string[] {
  const ids = new Set<string>()
  ids.add(result.startNode)
  for (const n of result.deliveryNodes) ids.add(n)
  for (const e of result.perEdge) {
    ids.add(e.u)
    ids.add(e.v)
    if (e.plannedNextEdge) {
      ids.add(e.plannedNextEdge[0])
      ids.add(e.plannedNextEdge[1])
    }
  }
  for (const [u, v] of result.blockedEdges) {
    ids.add(u)
    ids.add(v)
  }
  return Array.from(ids)
}

export default function DemoPage() {
  const [floodVisible, setFloodVisible] = useState(true);
  const [landslideVisible, setLandslideVisible] = useState(true);
  const [mode, setMode] = useState<DemoMode>({ kind: "picking" });

  const depot = useStopsStore((s) => s.depot);
  const requestStops = useStopsStore((s) => s.requestStops);
  const rainIntensity = useStopsStore((s) => s.rainIntensity);

  const handleExecute = useCallback(async () => {
    if (!depot) {
      alert("Pick a depot before running inference.")
      return
    }
    if (requestStops.length === 0) {
      alert("Add at least one delivery stop before running inference.")
      return
    }

    setMode({ kind: "loading" })

    const req: InferenceRequest = {
      depot: { lat: depot.location.lat, lng: depot.location.lng },
      deliveryStops: requestStops.map((s) => ({
        lat: s.location.lat,
        lng: s.location.lng,
      })),
      rainLevel: RIToInt(rainIntensity) as RainLevel,
      algorithm: DEFAULT_ALGORITHM,
    }

    const inferenceResult = await api.runInference(req)
    if (!inferenceResult.ok) {
      setMode({ kind: "error", message: inferenceResult.error })
      return
    }

    const result = inferenceResult.data
    const [graphResult, nodesResult] = await Promise.all([
      api.getGraph(result.graphId),
      api.listNodes(result.graphId, collectNodeIds(result)),
    ])
    if (!graphResult.ok) {
      setMode({ kind: "error", message: graphResult.error })
      return
    }
    if (!nodesResult.ok) {
      setMode({ kind: "error", message: nodesResult.error })
      return
    }

    setMode({
      kind: "result",
      result,
      graph: graphResult.data,
      nodes: nodesResult.data,
    })
  }, [depot, requestStops, rainIntensity])

  const handlePickAgain = useCallback(() => {
    setMode({ kind: "picking" })
  }, [])

  if (mode.kind === "result") {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <LiveInferenceResult
          result={mode.result}
          graph={mode.graph}
          nodes={mode.nodes}
          onPickAgain={handlePickAgain}
        />
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <LeafletMap
        floodVisible={floodVisible}
        landslideVisible={landslideVisible}
      />
      <NavigationPanel
        floodVisible={floodVisible}
        landslideVisible={landslideVisible}
        setFloodVisible={setFloodVisible}
        setLandslideVisible={setLandslideVisible}
        onExecute={handleExecute}
        executeLabel={mode.kind === "loading" ? "Running..." : "▶ Run inference"}
      />
      <SideBar />
      {mode.kind === "loading" && (
        <div className="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center">
          <div className="rounded-md border bg-card/95 px-4 py-3 text-sm shadow backdrop-blur">
            Running NNA-Dijkstra-HA on {DEMO_GRAPH_ID}...
          </div>
        </div>
      )}
      {mode.kind === "error" && (
        <div className="absolute left-1/2 top-4 z-[500] -translate-x-1/2">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Inference failed</AlertTitle>
            <AlertDescription>
              {mode.message}
              <button
                type="button"
                className="ml-2 underline underline-offset-2"
                onClick={handlePickAgain}
              >
                Dismiss
              </button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
