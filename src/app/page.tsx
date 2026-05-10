import Link from "next/link";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveJourneyContext } from "@/lib/journey";
import type { BenchmarkSummary } from "@/types/api";

export default async function OverviewPage() {
  const { defaultBenchmarkId, defaultScenarioId, recent, apiOk } =
    await resolveJourneyContext();

  const playbackBase =
    defaultBenchmarkId && defaultScenarioId
      ? `/benchmarks/${encodeURIComponent(defaultBenchmarkId)}/scenarios/${encodeURIComponent(defaultScenarioId)}`
      : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hazard-Aware DRL Routing
        </h1>
        <p className="text-muted-foreground">
          Walk through the system: see the hazard map, generate a benchmark,
          then watch routes play out.
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <JourneyCard
          step="1"
          title="See the hazard data"
          description="Inspect La Trinidad's flood and landslide overlays on the live road network."
          primary={{ label: "Open live demo", href: "/demo" }}
        />

        <JourneyCard
          step="2"
          title="Run a benchmark"
          description="Generate a fresh evaluation cohort, or browse benchmarks already on disk."
          primary={{ label: "Create a benchmark", href: "/benchmarks/new" }}
          secondary={{ label: "Browse existing", href: "/benchmarks" }}
        />

        <JourneyCard
          step="3"
          title="Watch a route play"
          description="Step through a delivery one algorithm at a time, or overlay all of them at once."
          primary={
            playbackBase
              ? { label: "Single-algorithm", href: `${playbackBase}?mode=single` }
              : null
          }
          secondary={
            playbackBase
              ? { label: "Compare algorithms", href: `${playbackBase}?mode=multi` }
              : null
          }
          disabledHint={
            !playbackBase
              ? "Backend unreachable — start it to enable playback."
              : undefined
          }
        />
      </div>

      <RecentBenchmarksStrip recent={recent} apiOk={apiOk} />
    </div>
  );
}

interface CtaLink {
  label: string;
  href: string;
}

interface JourneyCardProps {
  step: string;
  title: string;
  description: string;
  primary: CtaLink | null;
  secondary?: CtaLink | null;
  disabledHint?: string;
}

function JourneyCard({
  step,
  title,
  description,
  primary,
  secondary,
  disabledHint,
}: JourneyCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardAction>
          <span className="text-xs font-mono text-muted-foreground">
            Step {step}
          </span>
        </CardAction>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {primary ? (
          <Link
            href={primary.href}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            {primary.label} →
          </Link>
        ) : null}
        {secondary ? (
          <Link
            href={secondary.href}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
          >
            {secondary.label} →
          </Link>
        ) : null}
        {disabledHint ? (
          <span className="text-xs text-muted-foreground">{disabledHint}</span>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface RecentBenchmarksStripProps {
  recent: BenchmarkSummary[];
  apiOk: boolean;
}

function RecentBenchmarksStrip({ recent, apiOk }: RecentBenchmarksStripProps) {
  if (!apiOk) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
        Backend unreachable. Start the FastAPI service to load benchmarks.
      </div>
    );
  }

  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-sm">
        <span className="text-muted-foreground">No benchmarks yet — </span>
        <Link
          href="/benchmarks/new"
          className="font-medium underline-offset-4 hover:underline"
        >
          create one →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">
        Recent benchmarks
      </h2>
      <div className="grid gap-2 md:grid-cols-3">
        {recent.map((b) => (
          <Link
            key={b.benchmarkId}
            href={`/benchmarks/${encodeURIComponent(b.benchmarkId)}`}
            className="block rounded-lg border bg-card p-4 transition hover:bg-muted"
          >
            <div className="font-mono text-sm">{b.benchmarkId}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {b.numScenarios} scenarios · {b.algorithms.length} algorithms
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
