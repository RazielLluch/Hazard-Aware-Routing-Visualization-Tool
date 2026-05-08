"use client"

import dynamic from "next/dynamic"

export const ScenarioPlaybackShellLazy = dynamic(
  () =>
    import("./ScenarioPlaybackShell").then((mod) => mod.ScenarioPlaybackShell),
  { ssr: false },
)
