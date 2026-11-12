import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Plus, Search } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { NotificationsMenu } from "@/components/layout/notifications-menu"
import { SearchDialog } from "@/components/layout/search-dialog"
import { ContributionDialog } from "@/components/dialogs/contribution-dialog"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/store/workspace"
import { useTheme } from "@/components/theme-provider"
import { allNav } from "@/components/layout/nav-config"
import { initials } from "@/lib/format"

export function Topbar() {
  const { workspace } = useWorkspace()
  const { resolvedTheme } = useTheme()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [contributionOpen, setContributionOpen] = useState(false)

  const circleId = location.pathname.startsWith("/circles/")
    ? location.pathname.split("/")[2]
    : null
  const activeCircle = workspace.circles.find((circle) => circle.id === circleId)
  const activeNav = allNav.find(
    (item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to) && item.to !== "/"),
  )

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <Logo compact />
        </div>

        <div className="hidden min-w-0 items-center gap-1.5 text-[12.5px] lg:flex">
          <span className="text-muted-foreground">Workspace</span>
          <ChevronRight className="size-3.5 text-muted-foreground/50" />
          <span className="truncate font-medium text-foreground">
            {activeCircle ? activeCircle.name : activeNav?.label ?? "Overview"}
          </span>
        </div>

        <div className="ml-1 flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group hidden h-9 w-[248px] items-center gap-2 rounded-lg border border-border/80 bg-card/70 px-3 text-left text-[12.5px] text-muted-foreground shadow-soft transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:flex"
          >
            <Search className="size-3.5" />
            <span className="flex-1">Search…</span>
            <kbd className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-[9.5px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg text-muted-foreground hover:text-foreground sm:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>

          <ThemeToggle />
          <NotificationsMenu />

          <Button
            onClick={() => setContributionOpen(true)}
            className="ml-0.5 h-9 rounded-lg px-2.5 shadow-[0_6px_18px_-12px_var(--primary)] sm:px-3.5"
            aria-label="Add money"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add money</span>
          </Button>

          <Link
            to="/settings"
            className="ml-1 hidden size-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-primary/15 transition-colors hover:bg-primary/15 md:flex"
            aria-label="Open your profile settings"
          >
            {initials(workspace.profile.name)}
          </Link>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <ContributionDialog open={contributionOpen} onOpenChange={setContributionOpen} />
      <span className="sr-only" data-theme={resolvedTheme} />
    </header>
  )
}
