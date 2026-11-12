import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Coins,
  Laptop,
  PiggyBank,
  Plane,
  Plus,
  Shield,
  Target,
  Vault,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { Panel, SectionLabel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { Button } from "@/components/ui/button"
import { SavingsAreaChart } from "@/components/charts/savings-area"
import { GoalDialog } from "@/components/dialogs/goal-dialog"
import { useWorkspace } from "@/store/workspace"
import {
  budgetTotals,
  monthToDateSavings,
  personalTrend,
  usageTone,
  vaultActivity,
  vaultSummary,
} from "@/lib/analytics"
import { formatCompactMoney, formatDate, formatMoney, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

type Range = "6m" | "12m"

const goalIcons: Record<string, LucideIcon> = {
  shield: Shield,
  laptop: Laptop,
  plane: Plane,
}

const sourceMeta = {
  "auto-save": { label: "Auto-save", icon: PiggyBank, tone: "bg-primary/10 text-primary" },
  "round-up": { label: "Round-up", icon: Coins, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  "top-up": { label: "Top-up", icon: Plus, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
} as const

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function OverviewPage() {
  const { workspace } = useWorkspace()
  const [range, setRange] = useState<Range>("6m")
  const [addOpen, setAddOpen] = useState(false)
  const [goalTarget, setGoalTarget] = useState<string | undefined>(undefined)

  const vault = vaultSummary(workspace)
  const monthSaved = monthToDateSavings(workspace)
  const budget = budgetTotals(workspace.budget.categories, workspace.budget.monthlyIncome)
  const budgetPct = (budget.spent / Math.max(1, workspace.budget.monthlyIncome)) * 100
  const trend = useMemo(() => personalTrend(vault.saved, monthSaved), [vault.saved, monthSaved])
  const chartData = range === "6m" ? trend.slice(-6) : trend
  const activity = useMemo(() => vaultActivity(workspace, 5), [workspace])
  const daysLeft = Math.max(
    1,
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() -
      new Date().getDate() +
      1,
  )
  const safeDaily = Math.max(0, budget.remaining / daysLeft)
  const lastMonth = Math.max(0, vault.saved - monthSaved)
  const monthGrowth = lastMonth > 0 ? (monthSaved / lastMonth) * 100 : 0

  function openAdd(goalId?: string) {
    setGoalTarget(goalId)
    setAddOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(new Date(), "long")}
        title={`${greeting()}, ${workspace.profile.firstName}`}
        description="A calm view of your savings, your goals and this month's plan."
        actions={
          <Button className="h-9 gap-1.5 rounded-lg" onClick={() => openAdd()}>
            <Plus className="size-4" />
            Add money
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent
          label="Vault balance"
          value={formatMoney(vault.saved)}
          icon={Vault}
          delta={monthGrowth > 0 ? `+${formatPercent(monthGrowth, 1)}` : undefined}
          hint={`${workspace.goals.length} goals · ${vault.completed} fully funded`}
        />
        <StatCard
          label="Saved this month"
          value={formatMoney(monthSaved)}
          icon={PiggyBank}
          hint={
            workspace.vault.autoSave
              ? `Auto-save of ${formatMoney(workspace.vault.monthlyAmount)} is on`
              : "Auto-save is paused"
          }
        />
        <StatCard
          label="Still to save"
          value={formatMoney(vault.remaining)}
          icon={Target}
          hint={`${Math.round(vault.progress)}% of ${formatMoney(vault.target)} funded`}
        />
        <StatCard
          label="Left to spend"
          value={formatMoney(budget.remaining)}
          icon={WalletCards}
          delta={formatPercent(budgetPct)}
          deltaTone={budgetPct >= 100 ? "negative" : budgetPct >= 78 ? "neutral" : "positive"}
          hint={`${formatMoney(budget.spent)} of ${formatMoney(workspace.budget.monthlyIncome)} used`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Your savings"
          description="Money in your personal vault, month by month."
          action={
            <div className="flex rounded-lg border border-border/70 bg-muted/40 p-0.5" role="group" aria-label="Chart range">
              {(["6m", "12m"] as Range[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  aria-pressed={range === option}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    range === option
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option === "6m" ? "6M" : "1Y"}
                </button>
              ))}
            </div>
          }
          bodyClassName="pt-2"
        >
          <SavingsAreaChart data={chartData} />
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-4 text-[11.5px] text-muted-foreground">
            <span className="num">
              This month{" "}
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                +{formatMoney(monthSaved)}
              </span>
            </span>
            <span className="num">
              Last month <span className="font-medium text-foreground">{formatMoney(lastMonth)}</span>
            </span>
            <Link to="/vault" className="ml-auto inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Open my vault <ArrowRight className="size-3" />
            </Link>
          </div>
        </Panel>

        <Panel
          title="This month's plan"
          description={`${formatDate(new Date(), "month")} · ${workspace.budget.framework} budgeting`}
          action={
            <Link
              to="/budget"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
            >
              Open <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Left to spend</p>
                <p className="num mt-1 text-[22px] font-semibold tracking-[-0.03em]">{formatMoney(budget.remaining)}</p>
              </div>
              <span className="num rounded-full bg-card px-2 py-1 text-[10.5px] font-medium text-muted-foreground ring-1 ring-border/70">
                {formatPercent(budgetPct)} used
              </span>
            </div>
            <ProgressBar
              value={budgetPct}
              tone={budgetPct >= 100 ? "over" : budgetPct >= 78 ? "warn" : "accent"}
              className="mt-3 h-1.5"
              label="Budget used"
            />
            <div className="mt-2.5 flex justify-between text-[10.5px] text-muted-foreground">
              <span>{formatMoney(budget.spent)} spent</span>
              <span className="num">≈ {formatMoney(safeDaily)} / day</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(["needs", "wants", "savings"] as const).map((bucket) => {
              const bucketData = workspace.budget.categories.filter((item) => item.bucket === bucket)
              const cap = bucketData.reduce((sum, item) => sum + item.cap, 0)
              const spent = bucketData.reduce((sum, item) => sum + item.spent, 0)
              const pct = (spent / Math.max(1, cap)) * 100
              return (
                <div key={bucket}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="capitalize text-muted-foreground">{bucket}</span>
                    <span className="num text-foreground">
                      {formatMoney(spent)}{" "}
                      <span className="text-muted-foreground">/ {formatMoney(cap)}</span>
                    </span>
                  </div>
                  <ProgressBar
                    value={pct}
                    tone={usageTone(pct)}
                    className="mt-1.5 h-1"
                    label={`${bucket} spending`}
                  />
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary/[0.05] px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
            <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {workspace.budget.rolloverMode === "rollover"
              ? `${formatMoney(budget.unused)} of unused caps rolls into next month.`
              : `${formatMoney(budget.unused)} of unused caps sweeps into your vault.`}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          title="Your goals"
          description="Give every goal its own finish line."
          action={
            <Link to="/vault" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline">
              My vault <ArrowRight className="size-3" />
            </Link>
          }
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="divide-y divide-border/50">
            {workspace.goals.map((goal) => {
              const Icon = goalIcons[goal.icon] ?? Target
              const pct = (goal.saved / Math.max(1, goal.target)) * 100
              const done = goal.saved >= goal.target
              return (
                <div key={goal.id} className="flex items-center gap-3 px-2.5 py-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                      done
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border/70 bg-muted/40 text-primary",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[12.5px] font-medium">{goal.name}</p>
                      <span className="num shrink-0 text-[10.5px] text-muted-foreground">
                        {formatDate(goal.deadline, "short")}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <ProgressBar
                        value={pct}
                        tone={done ? "ok" : "accent"}
                        className="h-1"
                        label={`${goal.name} progress`}
                      />
                      <span className="num shrink-0 text-[9.5px] text-muted-foreground">
                        {formatCompactMoney(goal.saved)} / {formatCompactMoney(goal.target).replace("RWF ", "")}
                      </span>
                    </div>
                  </div>
                  {done ? (
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                      Funded
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAdd(goal.id)}
                      className="h-7 shrink-0 gap-1 rounded-lg px-2 text-[10.5px]"
                      aria-label={`Add money to ${goal.name}`}
                    >
                      <Plus className="size-3" />
                      Add
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          title="Recent activity"
          description="Money moving into your vault."
          action={<SectionLabel>Latest</SectionLabel>}
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="divide-y divide-border/50">
            {activity.map((item) => {
              const meta = sourceMeta[item.source]
              const Icon = meta.icon
              return (
                <div key={item.id} className="flex items-center gap-3 px-2.5 py-2.5">
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{item.goalName}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">
                      {meta.label} · {formatDate(item.date)}
                    </p>
                  </div>
                  <span className="num text-[11.5px] font-medium text-emerald-700 dark:text-emerald-300">
                    +{formatMoney(item.amount)}
                  </span>
                </div>
              )
            })}
          </div>
          {activity.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-[13px] font-medium">No savings yet</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Add money once and it will show up here.
              </p>
            </div>
          ) : null}
        </Panel>
      </div>

      <GoalDialog open={addOpen} onOpenChange={setAddOpen} defaultGoalId={goalTarget} />
    </div>
  )
}
