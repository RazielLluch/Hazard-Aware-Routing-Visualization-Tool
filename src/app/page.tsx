import { CompareShellLazy } from "@/components/compare/CompareShellLoader"

export const metadata = {
  title: "Hazard-Aware Routing",
}

/**
 * Landing page — the dual-pane Macro-DDQN comparison surface. Loaded
 * dynamically because Leaflet requires a window object.
 */
export default function HomePage() {
  return (
    <main className="h-full">
      <CompareShellLazy />
    </main>
  )
}
