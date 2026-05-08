"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
  AudioWave01Icon,
  RoboticIcon,
  MapsIcon,
  BookOpen02Icon,
} from "@hugeicons/core-free-icons"

const data = {
  user: {
    name: "Thesis Team",
    email: "UC Baguio",
    avatar: "",
  },
  teams: [
    {
      name: "La Trinidad Benchmark",
      logo: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
      plan: "Thesis 2026",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
      isActive: true,
    },
    {
      title: "Benchmarks",
      url: "/benchmarks",
      icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
      items: [
        { title: "la_trinidad_mini", url: "/benchmarks/la_trinidad_mini" },
      ],
    },
    {
      title: "Compare",
      url: "/compare",
      icon: <HugeiconsIcon icon={AudioWave01Icon} strokeWidth={2} />,
    },
    {
      title: "Live Demo",
      url: "/demo",
      icon: <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />,
    },
    {
      title: "Graph Explorer",
      url: "/graph",
      icon: <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />,
    },
  ],
  projects: [
    {
      name: "Methodology",
      url: "/methodology",
      icon: <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Workspace" />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
