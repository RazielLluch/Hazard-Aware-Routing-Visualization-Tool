"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LayoutBottomIcon,
  PieChartIcon,
  ComputerTerminalIcon,
  RoboticIcon,
  MapsIcon,
} from "@hugeicons/core-free-icons"

const user = {
  name: "Thesis Team",
  email: "UC Baguio",
  avatar: "",
}

const teams = [
  {
    name: "La Trinidad Benchmark",
    logo: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
    plan: "Thesis 2026",
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  defaultBenchmarkId?: string | null
  defaultScenarioId?: string | null
}

export function AppSidebar({
  defaultBenchmarkId,
  defaultScenarioId,
  ...props
}: AppSidebarProps) {
  // Sub-items under Benchmarks are journey actions (create one, watch a
  // single algo play, compare all of them). The playback links need a
  // concrete (benchmark, scenario) pair; without both we surface only
  // "+ New benchmark" so the empty state has an obvious next step.
  const benchmarkSubItems: { title: string; url: string }[] = [
    { title: "+ New benchmark", url: "/benchmarks/new" },
  ]
  if (defaultBenchmarkId && defaultScenarioId) {
    const base = `/benchmarks/${encodeURIComponent(defaultBenchmarkId)}/scenarios/${encodeURIComponent(defaultScenarioId)}`
    benchmarkSubItems.push(
      { title: "Single playback", url: `${base}?mode=single` },
      { title: "Compare playback", url: `${base}?mode=multi` },
    )
  }

  const navMain = [
    {
      title: "Overview",
      url: "/",
      icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
      isActive: true,
    },
    {
      title: "Live Demo",
      url: "/demo",
      icon: <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />,
    },
    {
      title: "Benchmarks",
      url: "/benchmarks",
      icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
      items: benchmarkSubItems,
    },
    {
      title: "Bundles",
      url: "/bundles",
      icon: <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} label="Workspace" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
