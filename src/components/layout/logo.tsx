import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-lg outline-none", className)}
      aria-label="Saving 404 home"
    >
      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[linear-gradient(145deg,oklch(0.62_0.23_293),oklch(0.46_0.21_285))] text-white shadow-[0_6px_16px_-8px_oklch(0.5_0.22_292/0.9)]">
        <svg viewBox="0 0 32 32" className="size-4" aria-hidden="true" fill="none">
          <path
            d="M8.5 22.4c1.5 1.1 3.5 1.7 5.6 1.7 3.4 0 5.6-1.6 5.6-4.2 0-2.4-1.8-3.6-4.9-4.3-2.5-.6-3.5-1.1-3.5-2.1 0-1 1-1.6 2.6-1.6 1.7 0 3.2.5 4.5 1.5l1.6-3c-1.6-1.1-3.7-1.8-5.9-1.8-3.4 0-5.6 1.7-5.6 4.2 0 2.5 1.8 3.7 4.9 4.4 2.5.6 3.5 1 3.5 2 0 1-1.1 1.6-2.8 1.6-1.8 0-3.5-.6-4.9-1.6L8.5 22.4Z"
            fill="currentColor"
          />
        </svg>
        <span className="absolute inset-x-0 top-0 h-px bg-white/30" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="text-[14.5px] font-semibold tracking-[-0.02em] text-foreground">Saving 404</span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Money, on purpose
          </span>
        </span>
      ) : null}
    </Link>
  )
}
