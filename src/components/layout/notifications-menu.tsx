import { useMemo } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, Bell, ChevronRight, HandCoins, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "@/store/workspace"
import { loanRows, usageTone, workspaceTotals, budgetTotals } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"

export function NotificationsMenu() {
  const { workspace } = useWorkspace()
  const alerts = useMemo(() => {
    const loans = loanRows(workspace.loans).filter((loan) => loan.status === "overdue")
    const totals = workspaceTotals(workspace)
    const budgets = budgetTotals(workspace.budget.categories, workspace.budget.monthlyIncome)
    const capAlerts = workspace.budget.categories.filter(
      (category) => usageTone((category.spent / Math.max(1, category.cap)) * 100) !== "ok",
    )
    const items = []
    if (loans.length) {
      items.push({
        id: "loans",
        icon: HandCoins,
        title: `${loans.length} overdue loan${loans.length > 1 ? "s" : ""}`,
        detail: `${formatMoney(loans.reduce((sum, loan) => sum + loan.outstanding, 0))} still to return`,
        href: "/loans",
        tone: "danger" as const,
      })
    }
    if (totals.arrears > 0) {
      items.push({
        id: "arrears",
        icon: AlertTriangle,
        title: "Circle arrears need a nudge",
        detail: `${formatMoney(totals.arrears)} across ${totals.membersLate} members`,
        href: "/circles",
        tone: "warning" as const,
      })
    }
    if (capAlerts.length) {
      items.push({
        id: "budget",
        icon: WalletCards,
        title: `${capAlerts.length} categories near their cap`,
        detail:
          budgets.overspent > 0
            ? `${formatMoney(budgets.overspent)} over budget in total`
            : `${formatMoney(budgets.unused)} left to allocate or roll over`,
        href: "/budget",
        tone: "warning" as const,
      })
    }
    return items
  }, [workspace])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label={`Notifications${alerts.length ? `, ${alerts.length} unread` : ""}`}
        >
          <Bell className="size-4" />
          {alerts.length ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] max-w-[calc(100vw-1rem)] rounded-xl p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5">
          <p className="text-[13px] font-semibold">Needs attention</p>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {alerts.length}
          </span>
        </div>
        <div className="p-1.5">
          {alerts.length ? (
            alerts.map((alert) => (
              <Link
                key={alert.id}
                to={alert.href}
                className="flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none"
              >
                <span
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                    alert.tone === "danger"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  <alert.icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium leading-snug">{alert.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                    {alert.detail}
                  </span>
                </span>
                <ChevronRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/60" />
              </Link>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">
              Everything is on track.
            </p>
          )}
        </div>
        <div className="border-t border-border/60 p-1.5">
          <Link
            to="/settings"
            className="block rounded-lg px-2.5 py-2 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            Notification preferences
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
