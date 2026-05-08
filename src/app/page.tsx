import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/benchmarks",
    title: "Benchmarks",
    description: "Browse evaluation cohorts and drill into algorithm scoreboards.",
  },
  {
    href: "/demo",
    title: "Live Demo",
    description: "Pick a depot and stops, run the DQN router under chosen RI.",
  },
  {
    href: "/graph",
    title: "Graph Explorer",
    description: "Inspect the road network and hazard layers.",
  },
];

export default function OverviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hazard-Aware Routing
        </h1>
        <p className="text-muted-foreground">
          Analytics over the active benchmark, plus an interactive DQN routing demo.
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block transition hover:opacity-90"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
        Active benchmark: <code className="font-mono">la_trinidad_mini</code> —
        100 scenarios across RI1..RI5, 9 algorithms.
      </div>
    </div>
  );
}
