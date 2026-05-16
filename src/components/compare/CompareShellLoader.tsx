"use client"

import dynamic from "next/dynamic"

/**
 * SSR-disabled loader for the compare shell. react-leaflet references `window`
 * at module-eval time, so the shell (and everything under it) must be a
 * client-only dynamic import — mirrors ScenarioPlaybackShellLoader.
 */
export const CompareShellLazy = dynamic(
  () => import("./CompareShell").then((mod) => mod.CompareShell),
  { ssr: false },
)
