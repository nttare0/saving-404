import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Bell, ChevronRight, PiggyBank, Target, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "@/store/workspace"
import { usageTone, budgetTotals } from "@/lib/analytics"
import { formatMoney } from "@/lib/format"
import {
  NOTIFICATIONS_EVENT,
  loadNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs"

export function NotificationsMenu() {
  const { workspace } = useWorkspace()
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadNotificationPrefs)

  useEffect(() => {
    function sync() {
      setPrefs(loadNotificationPrefs())
    }
    window.addEventListener("storage", sync)
    window.addEventListener(NOTIFICATIONS_EVENT, sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener(NOTIFICATIONS_EVENT, sync)
    }
  }, [])

  const alerts = useMemo(() => {
    const budgets = budgetTotals(workspace.budget.categories, workspace.budget.monthlyIncome)
    const capAlerts = workspace.budget.categories.filter(
      (category) => usageTone((category.spent / Math.max(1, category.cap)) * 100) !== "ok",
    )
    const nearlyFunded = workspace.goals
      .map((goal) => ({ goal, pct: (goal.saved / Math.max(1, goal.target)) * 100 }))
      .filter(({ pct }) => pct >= 90 && pct < 100)
      .sort((a, b) => b.pct - a.pct)
    const items = []
    if (prefs.budget && capAlerts.length) {
      items.push({
        id: "budget",
        icon: WalletCards,
        title: `${capAlerts.length} ${capAlerts.length === 1 ? "category is" : "categories are"} near the limit`,
        detail:
          budgets.overspent > 0
            ? `${formatMoney(budgets.overspent)} over budget in total`
            : `${formatMoney(budgets.unused)} left to allocate or roll over`,
        href: "/budget",
        tone: "warning" as const,
      })
    }
    for (const { goal, pct } of (prefs.milestones ? nearlyFunded : [])) {
      items.push({
        id: `goal-${goal.id}`,
        icon: Target,
        title: `${goal.name} is ${Math.round(pct)}% funded`,
        detail: `${formatMoney(goal.target - goal.saved)} to go`,
        href: "/vault",
        tone: "warning" as const,
      })
    }
    if (prefs.savings && !workspace.vault.autoSave) {
      items.push({
        id: "auto-save",
        icon: PiggyBank,
        title: "Auto-save is paused",
        detail: "Turn it on to keep your savings growing",
        href: "/vault",
        tone: "warning" as const,
      })
    }
    return items
  }, [prefs, workspace])

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
          <p className="text-[13px] font-semibold">Worth a look</p>
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
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
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
              You are all clear. Nothing needs a decision today.
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
