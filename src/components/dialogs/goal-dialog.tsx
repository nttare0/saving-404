import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ArrowRight, Check, Laptop, PiggyBank, Plane, Shield, Sparkles, Target, Wallet, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/common/money-input"
import { ProgressBar } from "@/components/common/progress-bar"
import { useWorkspace } from "@/store/workspace"
import { formatCompactMoney, formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  laptop: Laptop,
  plane: Plane,
  wallet: Wallet,
}

const quickAmounts = [25_000, 50_000, 100_000]

export function GoalDialog({
  open,
  onOpenChange,
  defaultGoalId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultGoalId?: string
}) {
  const { workspace, addToGoal } = useWorkspace()
  const [goalId, setGoalId] = useState(defaultGoalId ?? workspace.goals[0]?.id ?? "")
  const [amount, setAmount] = useState<number | "">("")

  useEffect(() => {
    if (!open) return
    setGoalId(defaultGoalId ?? workspace.goals[0]?.id ?? "")
    setAmount("")
  }, [open, defaultGoalId])

  const goal = workspace.goals.find((item) => item.id === goalId)
  const entered = typeof amount === "number" ? amount : 0
  const remaining = goal ? Math.max(0, goal.target - goal.saved) : 0
  const nextSaved = goal ? Math.min(goal.target, goal.saved + entered) : 0
  const nextPct = goal ? (nextSaved / Math.max(1, goal.target)) * 100 : 0
  const tooMuch = entered > remaining
  const canSubmit = Boolean(goal) && entered > 0 && !tooMuch && remaining > 0

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!goal || !canSubmit) return
    addToGoal(goal.id, entered)
    toast.success(`${formatMoney(entered)} saved`, {
      description: `Added to ${goal.name}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[470px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="size-4" />
              </span>
              Add money
            </DialogTitle>
            <DialogDescription>Choose a goal, enter an amount, and it is saved.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="goal-amount" className="text-[12px]">
                How much are you putting away?
              </Label>
              <MoneyInput
                id="goal-amount"
                size="large"
                value={amount}
                onValueChange={setAmount}
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value)}
                    className="num h-8 rounded-full px-3 text-[11px]"
                  >
                    {formatMoney(value)}
                  </Button>
                ))}
                {goal && remaining > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAmount(remaining)}
                    className="h-8 rounded-full px-3 text-[11px] font-medium text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    Finish goal · {formatMoney(remaining)}
                  </Button>
                ) : null}
              </div>
              {goal && remaining === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  This goal is fully funded. Choose another goal to keep saving.
                </p>
              ) : tooMuch && goal ? (
                <p className="text-[11px] text-rose-600 dark:text-rose-300">
                  This goal only needs {formatMoney(remaining)} more. Lower the amount or choose another goal.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-[12px]">Save toward</Label>
              <div className="space-y-1.5" role="radiogroup" aria-label="Savings goal">
                {workspace.goals.map((item) => {
                  const Icon = iconMap[item.icon] ?? Target
                  const pct = (item.saved / Math.max(1, item.target)) * 100
                  const done = item.saved >= item.target
                  const selected = item.id === goalId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setGoalId(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        selected
                          ? "border-primary/30 bg-primary/[0.04]"
                          : "border-border/70 hover:border-border hover:bg-muted/30",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                          done
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border/70 bg-card text-primary",
                        )}
                      >
                        <Icon className="size-4" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[12.5px] font-medium">{item.name}</span>
                          <span className="num shrink-0 text-[10.5px] text-muted-foreground">
                            {Math.round(pct)}%
                          </span>
                        </span>
                        <span className="mt-1 flex items-center gap-2">
                          <span
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(Math.min(100, pct))}
                            aria-label={`${item.name} progress`}
                            className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                          >
                            <span
                              className={cn("block h-full rounded-full", done ? "bar-fill-ok" : "bg-primary")}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </span>
                          <span className="num shrink-0 text-[9.5px] text-muted-foreground">
                            {formatCompactMoney(item.saved)} / {formatCompactMoney(item.target).replace("RWF ", "")}
                          </span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {selected ? <Check className="size-2.5" strokeWidth={3} /> : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {goal ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3">
                <div className="flex items-center justify-between gap-3 text-[11.5px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    {entered > 0 ? "After this" : "Where this goal stands"}
                  </span>
                  <span className="num font-medium">
                    {formatMoney(nextSaved)} / {formatMoney(goal.target)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar
                    value={nextPct}
                    tone={nextPct >= 100 ? "ok" : "accent"}
                    className="h-1.5"
                    label="Goal progress after this top-up"
                  />
                  <span className="num w-8 shrink-0 text-right text-[10px] font-medium">
                    {Math.round(nextPct)}%
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Due {formatDate(goal.deadline, "long")}</span>
                  <span className="inline-flex items-center gap-1">
                    {nextPct >= 100 ? "Goal complete" : `${formatMoney(Math.max(0, goal.target - nextSaved))} to go`}
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="min-w-[132px]">
              {entered > 0 ? `Add ${formatMoney(entered)}` : "Add money"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
