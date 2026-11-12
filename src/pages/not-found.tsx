import { Link } from "react-router-dom"
import { ArrowLeft, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center rounded-2xl border border-border/70 bg-card px-6 py-16 text-center shadow-soft">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Compass className="size-5" />
      </span>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Error 404
      </p>
      <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">This page wandered off</h1>
      <p className="mt-2 max-w-[360px] text-[12.5px] leading-relaxed text-muted-foreground">
        The page you were looking for does not exist. Your savings, goals and budget are still right where you left
        them.
      </p>
      <Button asChild variant="outline" className="mt-5 h-9 gap-1.5 rounded-lg">
        <Link to="/">
          <ArrowLeft className="size-4" /> Back to overview
        </Link>
      </Button>
    </div>
  )
}
