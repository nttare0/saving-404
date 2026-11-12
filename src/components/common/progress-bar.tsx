import { cn } from "@/lib/utils"
import { clamp } from "@/lib/format"

export function ProgressBar({
  value,
  tone = "accent",
  className,
  label,
}: {
  value: number
  tone?: "accent" | "ok" | "warn" | "over" | "muted"
  className?: string
  label?: string
}) {
  const width = clamp(value)
  const fills = {
    accent: "bg-primary",
    ok: "bar-fill-ok",
    warn: "bar-fill-warn",
    over: "bar-fill-over",
    muted: "bg-muted-foreground/40",
  }
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", fills[tone])}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
