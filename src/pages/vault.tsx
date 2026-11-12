import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  CalendarClock,
  Laptop,
  Plane,
  Plus,
  Shield,
  Sparkles,
  Target,
  Vault,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Panel, SectionLabel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { StatusBadge } from "@/components/common/status-badge"
import { MoneyInput } from "@/components/common/money-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SavingsAreaChart } from "@/components/charts/savings-area"
import { GoalDialog } from "@/components/dialogs/goal-dialog"
import { useWorkspace } from "@/store/workspace"
import { monthToDateSavings, personalTrend } from "@/lib/analytics"
import { daysBetween, formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  laptop: Laptop,
  plane: Plane,
  wallet: Wallet,
}

export function VaultPage() {
  const { workspace, updateVault } = useWorkspace()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [goalId, setGoalId] = useState<string | undefined>()
  const [monthlyDraft, setMonthlyDraft] = useState<number | "">(workspace.vault.monthlyAmount)

  const personal = workspace.goals.reduce((sum, goal) => sum + goal.saved, 0)
  const targetTotal = workspace.goals.reduce((sum, goal) => sum + goal.target, 0)
  const remaining = Math.max(0, targetTotal - personal)
  const overall = (personal / Math.max(1, targetTotal)) * 100
  const completed = workspace.goals.filter((goal) => goal.saved >= goal.target).length
  const thisMonth = monthToDateSavings(workspace)
  const trend = useMemo(() => personalTrend(personal, thisMonth), [personal, thisMonth])
  const monthly = workspace.vault.autoSave ? workspace.vault.monthlyAmount : 0
  const monthsToFinish = monthly > 0 ? Math.ceil(remaining / monthly) : 0
  const projection = new Date()
  projection.setMonth(projection.getMonth() + monthsToFinish)

  function openGoal(id?: string) {
    setGoalId(id)
    setDialogOpen(true)
  }

  function saveMonthly() {
    if (typeof monthlyDraft !== "number" || monthlyDraft < 0) return
    updateVault({ monthlyAmount: monthlyDraft })
    toast.success("Auto-save updated", { description: `${formatMoney(monthlyDraft)} per month from now on.` })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Save individually"
        title="Personal vault"
        description="Your own money, kept separate from everyday spending. Set goals, watch the balance grow, and keep a steady auto-save rhythm."
        actions={
          <Button className="h-9 gap-1.5 rounded-lg" onClick={() => openGoal()}>
            <Plus className="size-4" />
            Add money
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-primary/15 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--primary)_8%,var(--card)),var(--card))] p-4 shadow-soft sm:p-5">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">Vault balance</p>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Vault className="size-4" />
            </span>
          </div>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">{formatMoney(personal)}</p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">Ready for anything you planned</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-medium text-muted-foreground">Total goal target</p>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">{formatMoney(targetTotal)}</p>
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar value={overall} className="h-1" label="All goals progress" />
            <span className="num shrink-0 text-[10px] text-muted-foreground">{Math.round(overall)}%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-medium text-muted-foreground">Still to save</p>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">{formatMoney(remaining)}</p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">
            Across {workspace.goals.length - completed} open goals
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-medium text-muted-foreground">Monthly auto-save</p>
          <p className="num mt-2 text-[22px] font-semibold tracking-[-0.03em]">
            {formatMoney(workspace.vault.monthlyAmount)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <StatusBadge tone={workspace.vault.autoSave ? "positive" : "neutral"} className="px-1.5 py-0 text-[9.5px]">
              {workspace.vault.autoSave ? "On" : "Paused"}
            </StatusBadge>
            {workspace.vault.roundUp ? "Round-ups included" : "No round-ups"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title="Your goals"
          description="Each goal has its own balance, deadline and pace."
          action={<SectionLabel>{workspace.goals.length} goals</SectionLabel>}
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="space-y-2">
            {workspace.goals.map((goal) => {
              const pct = (goal.saved / Math.max(1, goal.target)) * 100
              const Icon = iconMap[goal.icon] ?? Target
              const days = daysBetween(new Date(), new Date(goal.deadline))
              const monthsLeft = Math.max(1, Math.ceil(days / 30))
              const pace = Math.max(0, (goal.target - goal.saved) / monthsLeft)
              const done = goal.saved >= goal.target
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-border/60 bg-card p-3.5 transition-colors hover:border-border sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                        done
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-primary/15 bg-primary/[0.07] text-primary",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[13px] font-medium">{goal.name}</h3>
                        {done ? (
                          <StatusBadge tone="positive" className="px-1.5 py-0 text-[9.5px]">
                            Funded
                          </StatusBadge>
                        ) : (
                          <span className="num text-[10px] text-muted-foreground">{Math.round(pct)}%</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="num text-[15px] font-semibold tracking-[-0.02em]">
                          {formatMoney(goal.saved)}
                          <span className="ml-1 text-[10.5px] font-normal text-muted-foreground">
                            of {formatMoney(goal.target)}
                          </span>
                        </p>
                        <p className="num text-[10px] text-muted-foreground">
                          {done ? "Complete" : `${formatMoney(pace)} / month to finish`}
                        </p>
                      </div>
                      <ProgressBar
                        value={pct}
                        tone={done ? "ok" : "accent"}
                        className="mt-2 h-1.5"
                        label={`${goal.name} progress`}
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <CalendarClock className="size-3" />
                          {formatDate(goal.deadline, "long")}
                          {days >= 0 ? ` · ${days} days left` : " · past due"}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 rounded-lg px-2 text-[10.5px] text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => openGoal(goal.id)}
                          disabled={done}
                        >
                          <Plus className="size-3" /> Add money
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Vault growth"
            description="Your individual savings over the last year."
            action={<SectionLabel>12 months</SectionLabel>}
            bodyClassName="px-2 pb-3 pt-4 sm:px-3"
          >
            <SavingsAreaChart data={trend} seriesLabel="Vault balance" />
            <p className="mt-2 px-2 text-[10.5px] leading-relaxed text-muted-foreground">
              Everything here is yours. No shared pots, no payouts to track.
            </p>
          </Panel>

          <Panel title="Auto-save" description="A small, steady habit beats a big maybe.">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label htmlFor="auto-save-vault" className="text-[12px] font-medium">
                  Save every month
                </Label>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
                  Moves money into the vault on the 2nd.
                </p>
              </div>
              <Switch
                id="auto-save-vault"
                checked={workspace.vault.autoSave}
                onCheckedChange={(checked) => {
                  updateVault({ autoSave: checked })
                  toast.success(checked ? "Auto-save is on" : "Auto-save paused")
                }}
                aria-label="Automatically save every month"
              />
            </div>

            <div className="mt-3 space-y-1.5">
              <Label htmlFor="auto-save-amount" className="text-[11.5px]">
                Monthly amount
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <MoneyInput
                    id="auto-save-amount"
                    value={monthlyDraft}
                    onValueChange={setMonthlyDraft}
                    disabled={!workspace.vault.autoSave}
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-11 rounded-lg"
                  onClick={saveMonthly}
                  disabled={
                    !workspace.vault.autoSave ||
                    typeof monthlyDraft !== "number" ||
                    monthlyDraft === workspace.vault.monthlyAmount
                  }
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-start justify-between gap-3 border-t border-border/60 pt-3">
              <div>
                <Label htmlFor="round-up" className="text-[11.5px] font-medium">
                  Round up spending
                </Label>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  Sweep small change into the vault.
                </p>
              </div>
              <Switch
                id="round-up"
                checked={workspace.vault.roundUp}
                onCheckedChange={(checked) => updateVault({ roundUp: checked })}
                aria-label="Round up spending into the vault"
              />
            </div>

            <div className="mt-3 rounded-xl bg-primary/[0.05] p-3 text-[10.5px] leading-relaxed text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {monthly > 0 ? "Projected finish" : "Projection paused"}
              </span>
              <p className="mt-1">
                {monthly > 0
                  ? `At ${formatMoney(monthly)} a month, every goal is funded around ${formatDate(projection, "long")}.`
                  : "Turn auto-save back on to keep the projection going."}
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card/60 px-3.5 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        <Target className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Everything in this vault belongs to you. It is never pooled, lent or paid out to anyone else.
        </p>
      </div>

      <GoalDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultGoalId={goalId} />
    </div>
  )
}
