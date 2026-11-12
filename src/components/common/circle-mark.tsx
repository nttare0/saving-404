import { UsersRound } from "lucide-react"
import { cn } from "@/lib/utils"

const tones: Record<string, string> = {
  violet: "from-violet-500/20 to-violet-500/5 text-violet-700 dark:text-violet-300",
  blue: "from-blue-500/20 to-blue-500/5 text-blue-700 dark:text-blue-300",
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-700 dark:text-emerald-300",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-300",
}

export function CircleMark({
  color = "violet",
  className,
}: {
  color?: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br",
        tones[color] ?? tones.violet,
        className,
      )}
    >
      <UsersRound className="size-4" strokeWidth={1.9} />
    </span>
  )
}
