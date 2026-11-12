import { cn } from "@/lib/utils"

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("rounded-2xl border border-border/80 bg-card shadow-soft", className)}>
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="min-w-0 space-y-0.5">
            {title ? <h2 className="text-[14px] font-semibold tracking-[-0.01em]">{title}</h2> : null}
            {description ? (
              <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  )
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground", className)}>
      {children}
    </p>
  )
}
