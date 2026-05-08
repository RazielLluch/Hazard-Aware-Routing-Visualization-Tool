"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import NavigationPanel from "@/components/features/NavigationPanel";
import SideBar from "@/components/features/SideBar";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
});

export default function DemoPage() {
  const [floodVisible, setFloodVisible] = useState(true);
  const [landslideVisible, setLandslideVisible] = useState(true);

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
      />
      <SideBar />
    </div>
  );
}
