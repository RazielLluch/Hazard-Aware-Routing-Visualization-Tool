"use client"

import { usePathname, useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AlgorithmId } from "@/types/api"

interface AlgorithmSwitcherProps {
  algorithms: AlgorithmId[]
  current: AlgorithmId
}

export function AlgorithmSwitcher({ algorithms, current }: AlgorithmSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        router.push(`${pathname}?algo=${encodeURIComponent(value)}`)
      }}
    >
      <SelectTrigger className="w-[260px] font-mono">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {algorithms.map((a) => (
          <SelectItem key={a} value={a} className="font-mono">
            {a}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
