import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Search, UsersRound } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { allNav } from "@/components/layout/nav-config"
import { useWorkspace } from "@/store/workspace"

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { workspace } = useWorkspace()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setActive(0)
    }
  }, [open])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    const pages = allNav
      .filter((item) => !term || item.label.toLowerCase().includes(term) || item.description.toLowerCase().includes(term))
      .map((item) => ({
        id: item.to,
        label: item.label,
        detail: item.description,
        to: item.to,
        icon: item.icon,
        kind: "page" as const,
      }))
    const circles = workspace.circles
      .filter((circle) => !term || circle.name.toLowerCase().includes(term) || circle.purpose.toLowerCase().includes(term))
      .map((circle) => ({
        id: circle.id,
        label: circle.name,
        detail: `${circle.memberIds.length} members · ${circle.meeting}`,
        to: `/circles/${circle.id}`,
        icon: UsersRound,
        kind: "circle" as const,
      }))
    return [...pages, ...circles]
  }, [query, workspace.circles])

  function select(to: string) {
    navigate(to)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[16%] max-w-[520px] translate-y-0 gap-0 overflow-hidden rounded-2xl border-border/80 p-0">
        <DialogTitle className="sr-only">Search Saving 404</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to a page or savings circle.
        </DialogDescription>
        <div className="flex items-center gap-2.5 border-b border-border/70 px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault()
                setActive((index) => Math.min(results.length - 1, index + 1))
              }
              if (event.key === "ArrowUp") {
                event.preventDefault()
                setActive((index) => Math.max(0, index - 1))
              }
              if (event.key === "Enter" && results[active]) {
                event.preventDefault()
                select(results[active].to)
              }
            }}
            placeholder="Search pages, circles, people…"
            aria-label="Search"
            className="h-14 w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            esc
          </kbd>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {results.length ? (
            <>
              <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {query ? "Results" : "Jump to"}
              </p>
              {results.map((result, index) => (
                <button
                  key={`${result.kind}-${result.id}`}
                  type="button"
                  onClick={() => select(result.to)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                    active === index ? "bg-muted/80" : "hover:bg-muted/50",
                  )}
                >
                  <span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground">
                    <result.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{result.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{result.detail}</span>
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground/50" />
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-10 text-center">
              <p className="text-[13px] font-medium">No results for “{query}”</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Try a circle name, or a page like Budget.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
