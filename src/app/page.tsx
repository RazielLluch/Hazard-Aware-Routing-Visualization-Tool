"use client"

// import MapContainer from "@/components/map/MapContainer";
import NavigationPanel from "@/components/features/NavigationPanel";
import { useRouting } from "@/hooks/useRouting";
import {RouteType} from "@/types/routing";


export default function Home() {
  const { executeRoute } = useRouting();

  return (
    <div className="h-screen w-screen">
      {/*<MapContainer></MapContainer>*/}
      <NavigationPanel onExecute={(routeType: RouteType) => executeRoute(routeType)}/>
    </div>
  );
}
