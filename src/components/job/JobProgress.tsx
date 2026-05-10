"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { JobEvent, JobStage, JobStatus } from "@/types/api"

const STAGE_LABELS: Record<JobStage, string> = {
  scenario_gen: "Generate scenarios",
  run_policies: "Run policies",
  evaluate: "Evaluate metrics",
}

const STAGE_ORDER: JobStage[] = ["scenario_gen", "run_policies", "evaluate"]

interface JobProgressProps {
  jobId: string
  /** Called once when the job reaches a terminal status. */
  onComplete?: (status: JobStatus, resultPath: string | null) => void
}

interface StatusEnvelope {
  status: JobStatus | "timeout"
  resultPath?: string | null
  error?: string | null
  message?: string
}

/**
 * Consumes the Server-Sent Events stream for one job and renders a vertical
 * stage list with the latest event message under each stage.
 *
 * The backend emits two SSE event names:
 *   - "progress" with a JobEvent payload (replayed + tailed)
 *   - "status"   with a final {status, resultPath, error} envelope
 */
export function JobProgress({ jobId, onComplete }: JobProgressProps) {
  const [events, setEvents] = useState<JobEvent[]>([])
  const [terminal, setTerminal] = useState<StatusEnvelope | null>(null)

  useEffect(() => {
    const url = api.jobStreamUrl(jobId)
    const es = new EventSource(url)

    const handleProgress = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as JobEvent
        setEvents((prev) => [...prev, payload])
      } catch {
        // ignore malformed lines; the next one will arrive shortly
      }
    }

    const handleStatus = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as StatusEnvelope
        setTerminal(payload)
        if (payload.status === "succeeded" || payload.status === "failed") {
          onComplete?.(payload.status, payload.resultPath ?? null)
        }
        es.close()
      } catch {
        // ignore
      }
    }

    es.addEventListener("progress", handleProgress)
    es.addEventListener("status", handleStatus)

    return () => {
      es.removeEventListener("progress", handleProgress)
      es.removeEventListener("status", handleStatus)
      es.close()
    }
  }, [jobId, onComplete])

  const lastEventByStage = events.reduce<Partial<Record<JobStage, JobEvent>>>(
    (acc, ev) => {
      acc[ev.stage] = ev
      return acc
    },
    {},
  )

  const currentStage =
    events.length > 0 ? events[events.length - 1].stage : null

  const stageState = (s: JobStage): "pending" | "active" | "done" => {
    if (
      terminal &&
      (terminal.status === "succeeded" || terminal.status === "failed")
    ) {
      return "done"
    }
    if (!currentStage) return "pending"
    const idx = STAGE_ORDER.indexOf(s)
    const cur = STAGE_ORDER.indexOf(currentStage)
    if (idx < cur) return "done"
    if (idx === cur) return "active"
    return "pending"
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {STAGE_ORDER.map((s) => {
          const state = stageState(s)
          const last = lastEventByStage[s]
          return (
            <li key={s} className="flex items-start gap-3">
              <span
                className={
                  "mt-1 inline-block h-3 w-3 shrink-0 rounded-full " +
                  (state === "done"
                    ? "bg-emerald-500"
                    : state === "active"
                      ? "animate-pulse bg-sky-500"
                      : "bg-muted")
                }
              />
              <div className="flex-1">
                <div className="font-medium">{STAGE_LABELS[s]}</div>
                {last?.message && (
                  <div className="text-muted-foreground truncate text-xs">
                    {last.message}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {terminal && terminal.status === "succeeded" && (
        <p className="text-sm text-emerald-600">
          Done. Result at{" "}
          <span className="font-mono">
            {terminal.resultPath ?? "(unknown)"}
          </span>
        </p>
      )}
      {terminal && terminal.status === "failed" && (
        <p className="text-destructive text-sm">
          Failed: {terminal.error ?? "(no error message)"}
        </p>
      )}
      {terminal && terminal.status === "timeout" && (
        <p className="text-sm text-amber-600">
          Stream timed out. Reconnect to keep watching.
        </p>
      )}
    </div>
  )
}
