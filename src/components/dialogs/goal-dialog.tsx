import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PiggyBank } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoneyInput } from "@/components/common/money-input"
import { ProgressBar } from "@/components/common/progress-bar"
import { useWorkspace } from "@/store/workspace"
import { formatDate, formatMoney } from "@/lib/format"

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
  const [amount, setAmount] = useState<number | "">(50_000)

  useEffect(() => {
    if (!open) return
    setGoalId(defaultGoalId ?? workspace.goals[0]?.id ?? "")
    setAmount(50_000)
  }, [open, defaultGoalId, workspace.goals])

  const goal = workspace.goals.find((item) => item.id === goalId)
  const entered = typeof amount === "number" ? amount : 0
  const nextSaved = goal ? Math.min(goal.target, goal.saved + entered) : 0
  const nextPct = goal ? (nextSaved / Math.max(1, goal.target)) * 100 : 0
  const canSubmit = Boolean(goal) && entered > 0 && (goal?.saved ?? 0) < (goal?.target ?? 0)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!goal || !canSubmit) return
    addToGoal(goal.id, entered)
    toast.success("Vault topped up", {
      description: `${formatMoney(entered)} added to ${goal.name}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[430px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PiggyBank className="size-4" />
              </span>
              Add to your vault
            </DialogTitle>
            <DialogDescription>
              Put a little away today. Every goal keeps its own progress.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="goal-select">Goal</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger id="goal-select" className="h-10">
                  <SelectValue placeholder="Choose a goal" />
                </SelectTrigger>
                <SelectContent>
                  {workspace.goals.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-amount">Amount</Label>
              <MoneyInput id="goal-amount" value={amount} onValueChange={setAmount} autoFocus />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[25_000, 50_000, 100_000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value)}
                    className="num h-7 rounded-full px-2.5 text-[10.5px]"
                  >
                    {formatMoney(value)}
                  </Button>
                ))}
              </div>
            </div>

            {goal ? (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-muted-foreground">{goal.name}</span>
                  <span className="num">
                    {formatMoney(nextSaved)} / {formatMoney(goal.target)}
                  </span>
                </div>
                <ProgressBar
                  value={nextPct}
                  tone={nextPct >= 100 ? "ok" : "accent"}
                  className="mt-2"
                  label="Goal progress after this top-up"
                />
                <div className="mt-2 flex justify-between text-[10.5px] text-muted-foreground">
                  <span>Due {formatDate(goal.deadline, "long")}</span>
                  <span className="num">{Math.round(nextPct)}% funded</span>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Add to vault
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
