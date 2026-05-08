"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const SEGMENT_LABELS: Record<string, string> = {
  benchmarks: "Benchmarks",
  scenarios: "Scenarios",
  algorithms: "Algorithms",
  runs: "Runs",
  compare: "Compare",
  demo: "Live Demo",
  graph: "Graph Explorer",
  methodology: "Methodology",
}

function labelFor(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment
}

export function SiteHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              {segments.length === 0 ? (
                <BreadcrumbPage>Overview</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/">Overview</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {segments.map((segment, idx) => {
              const isLast = idx === segments.length - 1
              const href = "/" + segments.slice(0, idx + 1).join("/")
              return (
                <Fragment key={href}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{labelFor(segment)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{labelFor(segment)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
