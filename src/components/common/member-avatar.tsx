import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import type { Member } from "@/lib/data"

const toneMap: Record<Member["tone"], string> = {
  violet: "bg-violet-500/12 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  blue: "bg-blue-500/12 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300",
  teal: "bg-teal-500/12 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  amber: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  rose: "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  slate: "bg-slate-500/12 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300",
  indigo: "bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
}

const sizes = {
  xs: "size-6 text-[9px]",
  sm: "size-7 text-[10px]",
  md: "size-9 text-[11px]",
  lg: "size-11 text-xs",
}

export function MemberAvatar({
  name,
  tone = "violet",
  size = "md",
  className,
}: {
  name: string
  tone?: Member["tone"]
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[0.02em] ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]",
        toneMap[tone],
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

export function AvatarStack({
  people,
  limit = 4,
  size = "sm",
}: {
  people: { name: string; tone?: Member["tone"] }[]
  limit?: number
  size?: keyof typeof sizes
}) {
  const visible = people.slice(0, limit)
  const rest = people.length - visible.length
  return (
    <span className="flex items-center" aria-label={`${people.length} members`}>
      {visible.map((person, index) => (
        <MemberAvatar
          key={`${person.name}-${index}`}
          name={person.name}
          tone={person.tone}
          size={size}
          className={cn(
            "ring-2 ring-card",
            index > 0 && "-ml-2",
          )}
        />
      ))}
      {rest > 0 ? (
        <span className="ml-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          +{rest}
        </span>
      ) : null}
    </span>
  )
}
