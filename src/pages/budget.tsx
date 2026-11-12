import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Pencil, PiggyBank, Plus, ReceiptText, RotateCcw, Wallet } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Panel, SectionLabel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { StatusBadge } from "@/components/common/status-badge"
import { MoneyInput } from "@/components/common/money-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BudgetRings } from "@/components/charts/budget-rings"
import { CategoryDialog } from "@/components/dialogs/category-dialog"
import { ExpenseDialog } from "@/components/dialogs/expense-dialog"
import { useWorkspace } from "@/store/workspace"
import {
  budgetTotals,
  bucketTotals,
  usageTone,
} from "@/lib/analytics"
import { formatDate, formatMoney, formatPercent } from "@/lib/format"
import { categoryIcons } from "@/lib/category-icons"
import type { BudgetCategory, Bucket } from "@/lib/data"
import { cn } from "@/lib/utils"


const bucketMeta: Record<Bucket, { label: string; description: string; color: string }> = {
  needs: { label: "Needs", description: "Essentials that keep life running", color: "bg-chart-1" },
  wants: { label: "Wants", description: "Joy, convenience and the occasional treat", color: "bg-chart-2" },
  savings: { label: "Savings", description: "Money moved toward future you", color: "bg-chart-3" },
}

export function BudgetPage() {
  const { workspace, updateBudget, setFramework } = useWorkspace()
  const budget = workspace.budget
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetCategory | undefined>()
  const [defaultBucket, setDefaultBucket] = useState<Bucket>("needs")
  const [incomeDraft, setIncomeDraft] = useState<number | "">(budget.monthlyIncome)

  const totals = useMemo(() => budgetTotals(budget.categories, budget.monthlyIncome), [budget])
  const buckets = useMemo(() => bucketTotals(budget.categories), [budget.categories])
  const spentPct = (totals.spent / Math.max(1, budget.monthlyIncome)) * 100
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const daysLeft = Math.max(1, daysInMonth - new Date().getDate() + 1)
  const safeDaily = Math.max(0, totals.remaining / daysLeft)

  const targets: Record<Bucket, number> = {
    needs: budget.monthlyIncome * 0.5,
    wants: budget.monthlyIncome * 0.3,
    savings: budget.monthlyIncome * 0.2,
  }

  function openCreate(bucket: Bucket) {
    setEditing(undefined)
    setDefaultBucket(bucket)
    setDialogOpen(true)
  }

  function openEdit(category: BudgetCategory) {
    setEditing(category)
    setDefaultBucket(category.bucket)
    setDialogOpen(true)
  }

  function handleFramework(next: "50/30/20" | "zero-based") {
    if (next === budget.framework) return
    setFramework(next)
    if (next === "50/30/20") {
      toast.success("Switched to 50/30/20", {
        description: "Category limits were rebalanced to fit 50% needs, 30% wants and 20% savings.",
      })
    } else {
      toast.success("Switched to zero-based budgeting", {
        description: "Every franc gets a job. Adjust limits until the plan balances.",
      })
    }
  }

  function saveIncome() {
    if (typeof incomeDraft !== "number" || incomeDraft <= 0) return
    updateBudget({ monthlyIncome: incomeDraft })
    toast.success("Income updated", { description: `This month's plan now uses ${formatMoney(incomeDraft)}.` })
  }

  function setMode(mode: "rollover" | "sweep") {
    updateBudget({ rolloverMode: mode })
    toast.success(mode === "rollover" ? "Rollover turned on" : "Sweep to savings turned on", {
      description:
        mode === "rollover"
          ? `${formatMoney(totals.unused)} of money left will move into next month.`
          : `${formatMoney(totals.unused)} of money left will move into savings.`,
    })
  }

  const unallocated = totals.unallocated

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${formatDate(new Date(), "long")} · ${budget.framework}`}
        title="Budget"
        description="Plan what you can spend, put a limit on each category, and keep a little for later."
        actions={
          <>
            <Button variant="outline" className="h-10 gap-1.5 rounded-lg sm:h-9" onClick={() => openCreate("needs")}>
              <Plus className="size-4" />
              Add category
            </Button>
            <Button className="h-10 gap-1.5 rounded-lg sm:h-9" onClick={() => setExpenseOpen(true)}>
              <ReceiptText className="size-4" />
              Add expense
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-primary/15 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--primary)_8%,var(--card)),var(--card))] p-3.5 shadow-soft sm:p-5">
          <p className="text-[10.5px] font-medium text-muted-foreground sm:text-[11px]">Monthly income</p>
          <p className="num mt-1.5 text-[17px] font-semibold tracking-[-0.03em] sm:mt-2 sm:text-[22px]">{formatMoney(budget.monthlyIncome)}</p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">{formatDate(new Date(), "month")} plan</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-soft sm:p-5">
          <p className="text-[10.5px] font-medium text-muted-foreground sm:text-[11px]">Spent so far</p>
          <p className="num mt-1.5 text-[17px] font-semibold tracking-[-0.03em] sm:mt-2 sm:text-[22px]">{formatMoney(totals.spent)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9.5px] text-muted-foreground sm:text-[10.5px]">
            <span>{formatPercent(spentPct)} of income</span>
            {totals.overspent > 0 ? (
              <StatusBadge tone="danger" className="px-1.5 py-0 text-[9.5px]">
                {formatMoney(totals.overspent)} over
              </StatusBadge>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-soft sm:p-5">
          <p className="text-[10.5px] font-medium text-muted-foreground sm:text-[11px]">Remaining</p>
          <p className="num mt-1.5 text-[17px] font-semibold tracking-[-0.03em] sm:mt-2 sm:text-[22px]">{formatMoney(totals.remaining)}</p>
          <p className="num mt-1 text-[10.5px] text-muted-foreground">
            ≈ {formatMoney(safeDaily)} / day for {daysLeft} days
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-soft sm:p-5">
          <p className="text-[10.5px] font-medium text-muted-foreground sm:text-[11px]">Money left</p>
          <p className="num mt-1.5 text-[17px] font-semibold tracking-[-0.03em] sm:mt-2 sm:text-[22px]">{formatMoney(totals.unused)}</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground sm:text-[10.5px]">
            {budget.rolloverMode === "rollover" ? "Rolls into next month" : "Sweeps into savings"}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[14px] font-semibold tracking-[-0.01em]">Budgeting framework</h2>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Pick how to split your money. You can change this later.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center" role="group" aria-label="Budgeting framework">
            <button
              type="button"
              aria-pressed={budget.framework === "50/30/20"}
              onClick={() => handleFramework("50/30/20")}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:w-[220px] sm:px-3.5",
                budget.framework === "50/30/20"
                  ? "border-primary/30 bg-primary/[0.05]"
                  : "border-border/70 hover:border-border",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold">50 / 30 / 20</span>
                <span
                  className={cn(
                    "flex size-3.5 items-center justify-center rounded-full border",
                    budget.framework === "50/30/20" ? "border-primary" : "border-muted-foreground/40",
                  )}
                >
                  {budget.framework === "50/30/20" ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                </span>
              </span>
              <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground">
                Half for needs, a little for fun, some for later.
              </span>
            </button>
            <button
              type="button"
              aria-pressed={budget.framework === "zero-based"}
              onClick={() => handleFramework("zero-based")}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:w-[220px] sm:px-3.5",
                budget.framework === "zero-based"
                  ? "border-primary/30 bg-primary/[0.05]"
                  : "border-border/70 hover:border-border",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold">Zero-based</span>
                <span
                  className={cn(
                    "flex size-3.5 items-center justify-center rounded-full border",
                    budget.framework === "zero-based" ? "border-primary" : "border-muted-foreground/40",
                  )}
                >
                  {budget.framework === "zero-based" ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                </span>
              </span>
              <span className="mt-0.5 block text-[10.5px] leading-snug text-muted-foreground">
                Every franc gets a job.
              </span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-[10.5px] text-muted-foreground">
          <span>
            Allocated <span className="num font-medium text-foreground">{formatMoney(totals.allocated)}</span> of{" "}
            <span className="num">{formatMoney(budget.monthlyIncome)}</span>
          </span>
          <span
            className={cn(
              "num font-medium",
              Math.abs(unallocated) < 1000 ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300",
            )}
          >
            {Math.abs(unallocated) < 1000
              ? "Perfectly balanced"
              : unallocated > 0
                ? `${formatMoney(unallocated)} unallocated`
                : `${formatMoney(Math.abs(unallocated))} over income`}
          </span>
          <span className="ml-auto">Limits reset on the 1st</span>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          {(["needs", "wants", "savings"] as Bucket[]).map((bucket) => {
            const categories = budget.categories.filter((category) => category.bucket === bucket)
            const bucketCap = buckets[bucket].cap
            const bucketSpent = buckets[bucket].spent
            const bucketPct = (bucketSpent / Math.max(1, bucketCap)) * 100
            const target = targets[bucket]
            return (
              <section key={bucket} className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
                <div className="flex flex-col gap-2 border-b border-border/60 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-5">
                  <div className="flex items-start gap-2.5">
                    <span className={cn("mt-1 size-2 shrink-0 rounded-full", bucketMeta[bucket].color)} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[13.5px] font-semibold capitalize">{bucketMeta[bucket].label}</h2>
                        <span className="num text-[10px] text-muted-foreground">
                          {formatPercent(bucketPct)} used
                        </span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground">{bucketMeta[bucket].description}</p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="num text-[11.5px] font-medium">
                      {formatMoney(bucketSpent)} <span className="font-normal text-muted-foreground">of {formatMoney(bucketCap)}</span>
                    </p>
                    <p className="num text-[9.5px] text-muted-foreground">
                      {formatMoney(target)} target at {budget.framework === "50/30/20" ? (bucket === "needs" ? "50%" : bucket === "wants" ? "30%" : "20%") : "your plan"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/50">
                  {categories.map((category) => {
                    const pct = (category.spent / Math.max(1, category.cap)) * 100
                    const tone = usageTone(pct)
                    const Icon = categoryIcons[category.icon] ?? Wallet
                    return (
                      <div key={category.id} className="group flex items-start gap-2.5 px-3.5 py-3 transition-colors hover:bg-muted/25 sm:items-center sm:gap-3 sm:px-5">
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border sm:mt-0",
                            tone === "over"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300"
                              : tone === "warn"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "border-border/70 bg-muted/40 text-muted-foreground",
                          )}
                        >
                          <Icon className="size-3.5" strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-2">
                            <p className="truncate text-[12.5px] font-medium">{category.name}</p>
                            <p className="num text-[10.5px] text-muted-foreground sm:shrink-0 sm:text-[11px]">
                              <span className="font-medium text-foreground">{formatMoney(category.spent)}</span> of{" "}
                              {formatMoney(category.cap)}
                            </p>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <ProgressBar
                              value={pct}
                              tone={tone}
                              className="h-1.5"
                              label={`${category.name} spending limit`}
                            />
                            <span
                              className={cn(
                                "num w-9 shrink-0 text-right text-[9.5px] font-medium",
                                tone === "over"
                                  ? "text-rose-600 dark:text-rose-300"
                                  : tone === "warn"
                                    ? "text-amber-700 dark:text-amber-300"
                                    : "text-muted-foreground",
                              )}
                            >
                              {Math.round(pct)}%
                            </span>
                          </div>
                          <p
                            className={cn(
                              "mt-1 text-[9.5px]",
                              category.spent > category.cap
                                ? "text-rose-600 dark:text-rose-300"
                                : category.spent === category.cap
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground",
                            )}
                          >
                            {category.spent > category.cap
                              ? `${formatMoney(category.spent - category.cap)} over the limit`
                              : category.spent === category.cap
                                ? "Limit reached"
                                : `${formatMoney(category.cap - category.spent)} left this month`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0 self-start rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:self-center lg:size-8 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                          onClick={() => openEdit(category)}
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                  {categories.length === 0 ? (
                    <p className="px-5 py-5 text-[11.5px] text-muted-foreground">
                      No categories in this bucket yet.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => openCreate(bucket)}
                  className="flex w-full items-center gap-1.5 border-t border-border/60 px-4 py-3 text-left text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-primary sm:px-5"
                >
                  <Plus className="size-3" /> Add a {bucketMeta[bucket].label.toLowerCase()} category
                </button>
              </section>
            )
          })}
        </div>

        <div className="space-y-4">
          <Panel
            title="Where it goes"
            description="Spending against each group's limit."
            action={<SectionLabel>This month</SectionLabel>}
          >
            <div className="flex justify-center py-1">
              <BudgetRings buckets={buckets} />
            </div>
            <div className="mt-2 space-y-2">
              {(["needs", "wants", "savings"] as Bucket[]).map((bucket) => (
                <div key={bucket} className="flex items-center gap-2 text-[11px]">
                  <span className={cn("size-2 rounded-full", bucketMeta[bucket].color)} />
                  <span className="capitalize text-muted-foreground">{bucketMeta[bucket].label}</span>
                  <span className="num ml-auto">
                    {formatMoney(buckets[bucket].spent)}{" "}
                    <span className="text-muted-foreground">of {formatMoney(buckets[bucket].cap)}</span>
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Leftovers" description="Decide what happens to money left at month end.">
            <div className="space-y-2" role="group" aria-label="Rollover behavior">
              <button
                type="button"
                aria-pressed={budget.rolloverMode === "rollover"}
                onClick={() => setMode("rollover")}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  budget.rolloverMode === "rollover"
                    ? "border-primary/30 bg-primary/[0.04]"
                    : "border-border/70 hover:border-border",
                )}
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <RotateCcw className="size-3.5" />
                </span>
                <span>
                  <span className="block text-[12px] font-medium">Roll into next month</span>
                  <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted-foreground">
                    Money left tops up the same categories next month.
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-pressed={budget.rolloverMode === "sweep"}
                onClick={() => setMode("sweep")}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  budget.rolloverMode === "sweep"
                    ? "border-primary/30 bg-primary/[0.04]"
                    : "border-border/70 hover:border-border",
                )}
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PiggyBank className="size-3.5" />
                </span>
                <span>
                  <span className="block text-[12px] font-medium">Sweep into savings</span>
                  <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted-foreground">
                    Leftover money moves straight into your savings.
                  </span>
                </span>
              </button>
            </div>

            <div className="mt-3 flex items-start justify-between gap-3 border-t border-border/60 pt-3">
              <div>
                <Label htmlFor="auto-sweep" className="text-[11.5px] font-medium">
                  Apply automatically
                </Label>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                  At the end of {formatDate(new Date(), "month")}.
                </p>
              </div>
              <Switch
                id="auto-sweep"
                checked={budget.sweepUnused}
                onCheckedChange={(checked) => {
                  updateBudget({ sweepUnused: checked })
                  toast.success(
                    checked ? "Leftovers will apply automatically" : "Leftovers will wait for you",
                    {
                      description: checked
                        ? "At the end of the month, money left follows the rule you picked."
                        : "You can apply leftovers yourself when the month closes.",
                    },
                  )
                }}
                aria-label="Automatically apply leftovers"
              />
            </div>

            <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <span className="num font-medium text-foreground">{formatMoney(totals.unused)}</span>{" "}
              {!budget.sweepUnused
                ? "is waiting for you to apply it when the month closes."
                : budget.rolloverMode === "rollover"
                  ? "is on track to roll into next month."
                  : "is on track to move into savings."}
            </div>
          </Panel>

          <Panel title="Monthly income" description="Everything is measured against this number.">
            <div className="space-y-2">
              <Label htmlFor="monthly-income" className="text-[11.5px]">
                Take-home income
              </Label>
              <MoneyInput id="monthly-income" value={incomeDraft} onValueChange={setIncomeDraft} />
              <Button
                variant="outline"
                className="h-9 w-full rounded-lg"
                onClick={saveIncome}
                disabled={typeof incomeDraft !== "number" || incomeDraft <= 0 || incomeDraft === budget.monthlyIncome}
              >
                Update income
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[10.5px] text-muted-foreground">
              <span>Planned allocation</span>
              <span className="num">{formatPercent((totals.allocated / Math.max(1, budget.monthlyIncome)) * 100)}</span>
            </div>
            <div className="mt-2">
              <ProgressBar
                value={(totals.allocated / Math.max(1, budget.monthlyIncome)) * 100}
                tone={totals.allocated > budget.monthlyIncome ? "warn" : "accent"}
                className="h-1"
                label="Income allocated"
              />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 sm:grid-cols-3 sm:p-5">
        <div>
          <p className="text-[11px] font-medium">Spending pace</p>
          <p className="num mt-1 text-[16px] font-semibold">{formatMoney(safeDaily)}</p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">Safe to spend per day for the rest of the month.</p>
        </div>
        <div>
          <p className="text-[11px] font-medium">Categories near the limit</p>
          <p className="num mt-1 text-[16px] font-semibold">
            {budget.categories.filter((category) => usageTone((category.spent / Math.max(1, category.cap)) * 100) !== "ok").length}
          </p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">Categories at 78% or more of their limit.</p>
        </div>
        <div>
          <p className="text-[11px] font-medium">Overspending</p>
          <p className="num mt-1 text-[16px] font-semibold">{formatMoney(totals.overspent)}</p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">Across all categories this month.</p>
        </div>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        defaultBucket={defaultBucket}
      />
      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} />
    </div>
  )
}
