import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "positive" | "warning" | "danger" | "neutral" | "accent"

const tones: Record<Tone, { className: string; dot: string }> = {
  positive: {
    className: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  warning: {
    className: "border-amber-500/25 bg-amber-500/[0.09] text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  danger: {
    className: "border-rose-500/20 bg-rose-500/[0.08] text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  neutral: {
    className: "border-border bg-muted/60 text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  accent: {
    className: "border-primary/20 bg-primary/[0.08] text-primary",
    dot: "bg-primary",
  },
}

export function StatusBadge({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: Tone
  children: React.ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", tones[tone].className, className)}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", tones[tone].dot)} /> : null}
      {children}
    </Badge>
  )
}

export function LoanStatusBadge({ status }: { status: "active" | "partial" | "overdue" | "settled" }) {
  const map = {
    active: { tone: "accent" as const, label: "Active" },
    partial: { tone: "warning" as const, label: "Part paid" },
    overdue: { tone: "danger" as const, label: "Overdue" },
    settled: { tone: "positive" as const, label: "Settled" },
  }
  return <StatusBadge tone={map[status].tone}>{map[status].label}</StatusBadge>
}
