import { NavLink } from "react-router-dom"
import { ArrowUpRight, CircleHelp } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { primaryNav, secondaryNav } from "@/components/layout/nav-config"
import { useWorkspace } from "@/store/workspace"
import { budgetTotals, loanRows, workspaceTotals } from "@/lib/analytics"
import { formatDate, formatMoney, formatPercent } from "@/lib/format"
import { ProgressBar } from "@/components/common/progress-bar"
import { MemberAvatar } from "@/components/common/member-avatar"
import { cn } from "@/lib/utils"

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
    isActive
      ? " bg-card text-foreground shadow-[0_1px_2px_rgb(17_12_28/0.04)] ring-1 ring-border/70"
      : " text-muted-foreground hover:bg-card/60 hover:text-foreground",
  )
}

export function Sidebar() {
  const { workspace } = useWorkspace()
  const totals = workspaceTotals(workspace)
  const budget = budgetTotals(workspace.budget.categories, workspace.budget.monthlyIncome)
  const overdueLoans = loanRows(workspace.loans).filter((loan) => loan.status === "overdue").length
  const spentPct = (budget.spent / Math.max(1, workspace.budget.monthlyIncome)) * 100

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="px-4 pb-4 pt-5">
        <Logo />
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3">
        <p className="px-2.5 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Workspace
        </p>
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("size-[17px] shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                    strokeWidth={1.8}
                  />
                  <span>{item.label}</span>
                  {item.label === "Circles" ? (
                    <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {workspace.circles.length}
                    </span>
                  ) : null}
                  {item.label === "Loans" && overdueLoans > 0 ? (
                    <span className="ml-auto rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-300">
                      {overdueLoans}
                    </span>
                  ) : null}
                  {isActive ? (
                    <span className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <p className="px-2.5 pb-1.5 pt-6 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Account
        </p>
        <div className="space-y-0.5">
          {secondaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("size-[17px] shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                    strokeWidth={1.8}
                  />
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary" />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border/70 bg-card/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-muted-foreground">{formatDate(new Date(), "month")} plan</p>
            <span className="num text-[10.5px] font-medium text-foreground">{formatPercent(spentPct)}</span>
          </div>
          <ProgressBar
            value={spentPct}
            tone={spentPct >= 100 ? "over" : spentPct >= 78 ? "warn" : "accent"}
            className="mt-2 h-1"
            label="Monthly budget used"
          />
          <p className="num mt-2 text-[11px] text-muted-foreground">
            {formatMoney(budget.remaining)} left
          </p>
          <NavLink
            to="/budget"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Review budget <ArrowUpRight className="size-3" />
          </NavLink>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl px-2 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <CircleHelp className="mt-0.5 size-3.5 shrink-0" />
          <p>
            This demo keeps your data in this browser. You can reset it any time in Settings.
          </p>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <MemberAvatar name={workspace.profile.name} tone="violet" size="md" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium">{workspace.profile.name}</span>
            <span className="block truncate text-[10.5px] text-muted-foreground">
              {workspace.profile.role} · {workspace.circles.length} circles
            </span>
          </span>
        </NavLink>
        <p className="px-2 pt-2 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/60">
          Saved {formatMoney(totals.totalSaved)} together
        </p>
      </div>
    </aside>
  )
}
