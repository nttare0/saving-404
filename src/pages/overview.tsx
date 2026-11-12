import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  HandCoins,
  Plus,
  Sparkles,
  UsersRound,
  Vault,
  Wallet,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { Panel, SectionLabel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { AvatarStack, MemberAvatar } from "@/components/common/member-avatar"
import { CircleMark } from "@/components/common/circle-mark"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { SavingsAreaChart } from "@/components/charts/savings-area"
import { ContributionsBarChart } from "@/components/charts/contributions-bar"
import { ContributionDialog } from "@/components/dialogs/contribution-dialog"
import { CircleDialog } from "@/components/dialogs/circle-dialog"
import { useWorkspace } from "@/store/workspace"
import {
  budgetTotals,
  circleStats,
  monthlyContributionSeries,
  loanRows,
  recentActivity,
  savingsTrend,
  usageTone,
  workspaceTotals,
} from "@/lib/analytics"
import { formatDate, formatMoney, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/lib/analytics"

type Range = "6m" | "12m"

const activityIcons = {
  contribution: Wallet,
  loan: HandCoins,
  payout: Sparkles,
}

const activityTone = {
  contribution: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  loan: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  payout: "bg-primary/10 text-primary",
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function OverviewPage() {
  const { workspace } = useWorkspace()
  const totals = useMemo(() => workspaceTotals(workspace), [workspace])
  const [range, setRange] = useState<Range>("6m")
  const [contributionOpen, setContributionOpen] = useState(false)
  const [circleOpen, setCircleOpen] = useState(false)

  const trend = useMemo(() => savingsTrend(totals.totalSaved), [totals.totalSaved])
  const chartData = range === "6m" ? trend.slice(-6) : trend
  const contributionSeries = useMemo(() => monthlyContributionSeries(workspace), [workspace])
  const budget = budgetTotals(workspace.budget.categories, workspace.budget.monthlyIncome)
  const budgetPct = (budget.spent / Math.max(1, workspace.budget.monthlyIncome)) * 100
  const personalTarget = workspace.goals.reduce((sum, goal) => sum + goal.target, 0)
  const personalProgress = (totals.personal / Math.max(1, personalTarget)) * 100
  const daysLeft = Math.max(
    1,
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() -
      new Date().getDate() +
      1,
  )
  const safeDaily = Math.max(0, budget.remaining / daysLeft)
  const activity = useMemo(() => recentActivity(workspace, 6), [workspace])
  const circles = workspace.circles.map((circle) => circleStats(workspace, circle))
  const uniqueMembers = new Set(workspace.circles.flatMap((circle) => circle.memberIds)).size
  const monthGrowth =
    trend.length > 1 && trend[trend.length - 2].saved > 0
      ? ((trend[trend.length - 1].saved - trend[trend.length - 2].saved) /
          trend[trend.length - 2].saved) *
        100
      : 0

  const attention = useMemo(() => {
    const arrears = circles
      .flatMap(({ circle }) =>
        circle.memberIds.map((memberId) => {
          const member = workspace.members.find((item) => item.id === memberId)
          const expected = circle.contribution * circle.cycles.length
          const paid = workspace.contributions
            .filter((item) => item.circleId === circle.id && item.memberId === memberId)
            .reduce((sum, item) => sum + item.amount, 0)
          return {
            id: `${circle.id}-${memberId}`,
            name: member?.name ?? "Member",
            tone: member?.tone ?? "violet",
            circle: circle.name,
            circleId: circle.id,
            amount: Math.max(0, expected - paid),
          }
        }),
      )
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    return arrears
  }, [circles, workspace])

  const overdueLoans = loanRows(workspace.loans)
    .filter((loan) => loan.status === "overdue")
    .map((loan) => ({ loan }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(new Date(), "long")}
        title={`${greeting()}, ${workspace.profile.firstName}`}
        description="A calm view of everything you are building — with the people around you and on your own."
        actions={
          <>
            <Button variant="outline" className="h-9 gap-1.5 rounded-lg" onClick={() => setCircleOpen(true)}>
              <UsersRound className="size-4" />
              New circle
            </Button>
            <Button className="h-9 gap-1.5 rounded-lg" onClick={() => setContributionOpen(true)}>
              <Plus className="size-4" />
              Add money
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent
          label="Total saved"
          value={formatMoney(totals.totalSaved)}
          icon={Wallet}
          delta={monthGrowth > 0 ? `+${formatPercent(monthGrowth, 1)}` : undefined}
          hint={`${formatMoney(totals.personal)} in your personal vault`}
        />
        <StatCard
          label="In savings circles"
          value={formatMoney(totals.circleTotal)}
          icon={UsersRound}
          hint={`${workspace.circles.length} circles · ${uniqueMembers} people`}
        />
        <StatCard
          label="Lent out"
          value={formatMoney(totals.lending)}
          icon={HandCoins}
          hint={`${formatMoney(totals.expectedInterest)} interest expected`}
        />
        <StatCard
          label="Outstanding arrears"
          value={formatMoney(totals.arrears)}
          icon={AlertTriangle}
          delta={totals.arrears > 0 ? "Needs a nudge" : "All clear"}
          deltaTone={totals.arrears > 0 ? "negative" : "positive"}
          hint={`${totals.membersLate} members behind across your circles`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Savings growth"
          description="Circles and your personal vault, month by month."
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
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" />
              Total saved
            </span>
            <span className="num">
              Last month <span className="font-medium text-foreground">{formatMoney(trend[trend.length - 2]?.saved ?? 0)}</span>
            </span>
            <Link to="/budget" className="ml-auto inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Plan next month <ArrowRight className="size-3" />
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
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {workspace.budget.rolloverMode === "rollover"
              ? `${formatMoney(budget.unused)} of unused caps rolls into next month.`
              : `${formatMoney(budget.unused)} of unused caps sweeps into savings.`}
          </div>

          <Link
            to="/vault"
            className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-primary/[0.02]"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Vault className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[11.5px] font-medium">Personal vault</span>
                <span className="num text-[11px] font-medium">{formatMoney(totals.personal)}</span>
              </span>
              <span className="mt-1 flex items-center gap-2">
                <ProgressBar value={personalProgress} className="h-1" tone="accent" label="Personal goals progress" />
                <span className="num shrink-0 text-[9.5px] text-muted-foreground">{Math.round(personalProgress)}%</span>
              </span>
            </span>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          </Link>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Your circles"
          description="Shared pots, member progress and what comes next."
          action={
            <Link to="/circles" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline">
              View all <ArrowRight className="size-3" />
            </Link>
          }
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="divide-y divide-border/60">
            {circles.map(({ circle, totalContributed, progress, arrears, memberCount }) => (
              <Link
                key={circle.id}
                to={`/circles/${circle.id}`}
                className="group flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-muted/40"
              >
                <CircleMark color={circle.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium">{circle.name}</p>
                    {arrears > 0 ? (
                      <StatusBadge tone="warning" className="hidden sm:inline-flex">
                        {formatMoney(arrears)} behind
                      </StatusBadge>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <AvatarStack
                      size="xs"
                      limit={4}
                      people={circle.memberIds.map((id) => {
                        const member = workspace.members.find((item) => item.id === id)
                        return { name: member?.name ?? "Member", tone: member?.tone }
                      })}
                    />
                    <span className="text-[10.5px] text-muted-foreground">
                      {memberCount} members · {formatMoney(circle.contribution)} {circle.cadence === "weekly" ? "weekly" : "monthly"}
                    </span>
                  </div>
                </div>
                <div className="hidden w-32 shrink-0 sm:block">
                  <div className="flex justify-between text-[10.5px] text-muted-foreground">
                    <span className="num">{formatMoney(totalContributed)}</span>
                    <span className="num">{Math.round(progress)}%</span>
                  </div>
                  <ProgressBar value={progress} className="mt-1.5 h-1" label={`${circle.name} progress`} />
                </div>
                <div className="hidden w-24 shrink-0 text-right md:block">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Next pot</p>
                  <p className="num mt-0.5 text-[11.5px] font-medium">{formatDate(circle.nextPayout.date)}</p>
                </div>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </Panel>

        <Panel
          title="Needs a gentle nudge"
          description="Arrears and loans that are past due."
          action={<StatusBadge tone={totals.overdue > 0 ? "danger" : "positive"}>{totals.overdue > 0 ? "Action needed" : "On track"}</StatusBadge>}
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="space-y-0.5">
            {overdueLoans.map(({ loan }) => (
              <Link
                key={loan.id}
                to="/loans"
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300">
                  <HandCoins className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{loan.borrowerName} · loan past due</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    Due {formatDate(loan.dueAt)} · {loan.circleId ? "circle loan" : "personal loan"}
                  </p>
                </div>
                <span className="num text-[11.5px] font-medium text-rose-600 dark:text-rose-300">
                  {formatMoney(loan.principal + Math.round(loan.principal * (loan.ratePct / 100) * (loan.termMonths / 12)) - loan.repaid)}
                </span>
              </Link>
            ))}
            {attention.map((item) => (
              <Link
                key={item.id}
                to={`/circles/${item.circleId}`}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/40"
              >
                <MemberAvatar name={item.name} tone={item.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{item.name}</p>
                  <p className="truncate text-[10.5px] text-muted-foreground">{item.circle} · contribution arrears</p>
                </div>
                <span className="num text-[11.5px] font-medium text-amber-700 dark:text-amber-300">
                  {formatMoney(item.amount)}
                </span>
              </Link>
            ))}
            {overdueLoans.length === 0 && attention.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-[13px] font-medium">Everyone is up to date</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">Nothing needs chasing today.</p>
              </div>
            ) : null}
          </div>
          <div className="mt-2 border-t border-border/60 px-2.5 pt-3">
            <Link to="/loans" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline">
              Review the loan ledger <ArrowRight className="size-3" />
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          title="Recent activity"
          description="Contributions, payouts and money lent."
          action={
            <span className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
              <CalendarDays className="size-3.5" />
              This cycle
            </span>
          }
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="divide-y divide-border/50">
            {activity.map((item: ActivityItem) => {
              const Icon = activityIcons[item.kind]
              return (
                <div key={item.id} className="flex items-center gap-3 px-2.5 py-2.5">
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", activityTone[item.kind])}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{item.title}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">
                      {item.detail} · {formatDate(item.date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "num text-[11.5px] font-medium",
                      item.direction === "in" && "text-emerald-700 dark:text-emerald-300",
                      item.direction === "out" && "text-muted-foreground",
                    )}
                  >
                    {item.direction === "out" ? "−" : "+"}
                    {formatMoney(item.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          title="Contributions this half-year"
          description="What actually moved into your circles."
          action={<SectionLabel>6 months</SectionLabel>}
          bodyClassName="px-2 pb-3 pt-4 sm:px-3"
        >
          <ContributionsBarChart data={contributionSeries} />
          <p className="px-2 text-[10.5px] leading-relaxed text-muted-foreground">
            The November dip is normal — weekly contributions for Kigali Hustlers are still coming in.
          </p>
        </Panel>
      </div>

      <ContributionDialog open={contributionOpen} onOpenChange={setContributionOpen} />
      <CircleDialog open={circleOpen} onOpenChange={setCircleOpen} />
    </div>
  )
}
