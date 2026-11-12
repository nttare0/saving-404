import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  deltaTone = "positive",
  accent = false,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  hint?: React.ReactNode
  delta?: string
  deltaTone?: "positive" | "negative" | "neutral"
  accent?: boolean
  className?: string
}) {
  const deltaIsNumeric = Boolean(delta && /^[+\-−\d]/.test(delta))
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 shadow-soft sm:p-5",
        accent &&
          "border-primary/15 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--primary)_8%,var(--card)),var(--card)_62%)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10.5px] font-medium text-muted-foreground sm:text-[12px]">{label}</p>
        {Icon ? (
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground sm:size-8",
              accent && "border-primary/15 bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-3.5 sm:size-4" strokeWidth={1.7} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-3">
        <p className="num text-[17px] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[22px] xl:text-[24px]">
          {value}
        </p>
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-medium sm:text-[10.5px]",
              deltaTone === "positive" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              deltaTone === "negative" && "bg-rose-500/10 text-rose-700 dark:text-rose-300",
              deltaTone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            {deltaIsNumeric ? (
              deltaTone === "negative" ? (
                <ArrowDownRight className="size-3" />
              ) : (
                <ArrowUpRight className="size-3" />
              )
            ) : null}
            {delta}
          </span>
        ) : null}
      </div>
      {hint ? <div className="mt-1.5 text-[10.5px] leading-relaxed text-muted-foreground sm:mt-2 sm:text-[11.5px]">{hint}</div> : null}
    </div>
  )
}
