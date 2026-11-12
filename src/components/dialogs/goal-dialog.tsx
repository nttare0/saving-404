import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Delete,
  Laptop,
  PiggyBank,
  Plane,
  Shield,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react"
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
import { useWorkspace } from "@/store/workspace"
import { formatCompactMoney, formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const goalIcons: Record<string, LucideIcon> = {
  shield: Shield,
  laptop: Laptop,
  plane: Plane,
  wallet: Wallet,
}

const quickAmounts = [1_000, 5_000, 10_000, 25_000]
const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"]

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
  const [step, setStep] = useState<1 | 2>(1)
  const [goalId, setGoalId] = useState("")
  const [amount, setAmount] = useState<number | "">("")

  useEffect(() => {
    if (!open) return
    const preferred = defaultGoalId
      ? workspace.goals.find((goal) => goal.id === defaultGoalId && goal.saved < goal.target)
      : undefined
    setStep(1)
    setGoalId(preferred?.id ?? "")
    setAmount("")
  }, [open, defaultGoalId, workspace.goals])

  const goal = workspace.goals.find((item) => item.id === goalId)
  const entered = typeof amount === "number" ? amount : 0
  const remaining = goal ? Math.max(0, goal.target - goal.saved) : 0
  const nextSaved = goal ? Math.min(goal.target, goal.saved + entered) : 0
  const nextPct = goal ? (nextSaved / Math.max(1, goal.target)) * 100 : 0
  const tooMuch = entered > remaining
  const canSave = Boolean(goal) && entered > 0 && !tooMuch && remaining > 0

  function pressKey(key: string) {
    if (key === "back") {
      const digits = String(entered || "").slice(0, -1)
      setAmount(digits ? Number(digits) : "")
      return
    }
    const digits = `${entered || ""}${key}`.replace(/^0+(?=\d)/, "").slice(0, 9)
    setAmount(!digits || Number(digits) === 0 ? "" : Number(digits))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (step === 1) {
      if (entered > 0) setStep(2)
      return
    }
    if (!goal || !canSave) return
    addToGoal(goal.id, entered)
    toast.success(`${formatMoney(entered)} saved`, {
      description: `Added to ${goal.name}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] overflow-hidden rounded-2xl border-border/80 p-0 max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl sm:max-w-[470px]">
        <form onSubmit={submit} className="flex max-h-[94dvh] flex-col">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/20 sm:hidden" />

          <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-start gap-2.5 pr-7 text-[17px] leading-snug tracking-[-0.02em]">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="size-4" />
              </span>
              <span aria-live="polite">{step === 1 ? "How much do you want to save?" : "Where should it go?"}</span>
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? "Step 1 of 2 · Pick an amount. You can start small."
                : "Step 2 of 2 · Choose the goal you are saving for."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="hidden sm:block">
                  <Label htmlFor="goal-amount" className="text-[12px]">
                    Amount
                  </Label>
                  <MoneyInput
                    id="goal-amount"
                    size="large"
                    value={amount}
                    onValueChange={setAmount}
                    autoFocus
                  />
                </div>

                <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-4 text-center sm:hidden">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Amount to save
                  </p>
                  <p
                    aria-live="polite"
                    aria-label={entered ? `${formatMoney(entered)} to save` : "No amount entered"}
                    className="num mt-1 text-[32px] font-semibold leading-none tracking-[-0.04em]"
                  >
                    <span className="text-[15px] font-medium text-muted-foreground">RWF </span>
                    {entered ? formatNumber(entered) : "0"}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Quick amounts">
                  {quickAmounts.map((value) => {
                    const selected = entered === value
                    return (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        onClick={() => setAmount(value)}
                        aria-pressed={selected}
                        className={cn(
                          "num h-10 rounded-xl px-1 text-[10.5px]",
                          selected && "border-primary/30 bg-primary/[0.06] text-primary",
                        )}
                      >
                        {formatMoney(value)}
                      </Button>
                    )
                  })}
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:hidden" role="group" aria-label="Number pad">
                  {keypadKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => pressKey(key)}
                      aria-label={
                        key === "back"
                          ? "Delete last digit"
                          : key === "00"
                            ? "Add two zeros"
                            : `Add ${key}`
                      }
                      className="flex h-11 items-center justify-center rounded-xl border border-border/70 bg-card text-[18px] font-semibold text-foreground transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    >
                      {key === "back" ? <Delete className="size-4" /> : key}
                    </button>
                  ))}
                </div>

                <p className="text-center text-[10.5px] leading-relaxed text-muted-foreground">
                  <span className="sm:hidden">Tap a quick amount or use the keys.</span>
                  <span className="hidden sm:inline">Type an amount or pick a quick one.</span>{" "}
                  Even RWF 1,000 counts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 text-left transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
                    <ArrowLeft className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      You are saving
                    </span>
                    <span className="num block text-[15px] font-semibold">{formatMoney(entered)}</span>
                  </span>
                  <span className="text-[10.5px] font-medium text-primary">Change</span>
                </button>

                <div className="space-y-1.5" role="group" aria-label="Savings goal">
                  {workspace.goals.map((item) => {
                    const Icon = goalIcons[item.icon] ?? Target
                    const pct = (item.saved / Math.max(1, item.target)) * 100
                    const done = item.saved >= item.target
                    const selected = item.id === goalId
                    const toGo = Math.max(0, item.target - item.saved)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        aria-label={`Save toward ${item.name}`}
                        disabled={done}
                        onClick={() => setGoalId(item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-55",
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
                            <span className="num shrink-0 text-[10px] text-muted-foreground">
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
                              {formatCompactMoney(item.saved)} of{" "}
                              {formatCompactMoney(item.target).replace("RWF ", "")}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-[9.5px] text-muted-foreground">
                            {done ? "Goal reached" : `${formatCompactMoney(toGo)} to go`}
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

                {!goal ? (
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                    Pick a goal to continue.
                  </p>
                ) : goal && remaining === 0 ? (
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                    This goal is already funded. Choose another one.
                  </p>
                ) : tooMuch && goal ? (
                  <div className="rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] text-rose-700 dark:text-rose-300">
                    <p>This goal only needs {formatMoney(remaining)} more.</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAmount(remaining)}
                      className="mt-2 h-10 w-full rounded-lg bg-card text-[11.5px]"
                    >
                      Use {formatMoney(remaining)} instead
                    </Button>
                  </div>
                ) : goal ? (
                  <div className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                    After saving, this goal will be{" "}
                    <span className="num font-medium text-foreground">{Math.round(nextPct)}%</span> funded.
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-11 w-full sm:h-9 sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={entered <= 0}
                  className="h-11 w-full sm:h-9 sm:w-auto"
                >
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="h-11 w-full sm:h-9 sm:w-auto"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button type="submit" disabled={!canSave} className="h-11 w-full sm:h-9 sm:w-auto">
                  {entered > 0 ? `Save ${formatMoney(entered)}` : "Save money"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
