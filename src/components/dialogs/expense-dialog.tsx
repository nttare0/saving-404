import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Receipt } from "lucide-react"
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
import { formatMoney } from "@/lib/format"
import { usageTone } from "@/lib/analytics"
import { cn } from "@/lib/utils"

export function ExpenseDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { workspace, updateCategory } = useWorkspace()
  const [categoryId, setCategoryId] = useState(workspace.budget.categories[0]?.id ?? "")
  const [amount, setAmount] = useState<number | "">("")

  useEffect(() => {
    if (!open) return
    setCategoryId(workspace.budget.categories[0]?.id ?? "")
    setAmount("")
  }, [open, workspace.budget.categories])

  const category = workspace.budget.categories.find((item) => item.id === categoryId)
  const entered = typeof amount === "number" ? amount : 0
  const nextSpent = (category?.spent ?? 0) + entered
  const nextPct = category ? (nextSpent / Math.max(1, category.cap)) * 100 : 0
  const tone = usageTone(nextPct)
  const canSubmit = Boolean(category) && entered > 0

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!category || entered <= 0) return
    updateCategory(category.id, { spent: nextSpent })
    toast.success("Expense logged", {
      description: `${formatMoney(entered)} added to ${category.name}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[420px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="size-4" />
              </span>
              Log an expense
            </DialogTitle>
            <DialogDescription>
              See exactly how it lands against the category cap.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="expense-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="expense-category" className="h-10">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {workspace.budget.categories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} · {formatMoney(item.cap)} cap
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Amount</Label>
              <MoneyInput id="expense-amount" value={amount} onValueChange={setAmount} autoFocus />
            </div>

            {category ? (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                <div className="flex items-baseline justify-between text-[11.5px]">
                  <span className="text-muted-foreground">{category.name}</span>
                  <span className="num">
                    {formatMoney(nextSpent)} / {formatMoney(category.cap)}
                  </span>
                </div>
                <ProgressBar value={nextPct} tone={tone} className="mt-2" label="Category cap after expense" />
                <div className="mt-2 flex items-center justify-between text-[10.5px]">
                  <span className={cn("text-muted-foreground")}>{Math.round(nextPct)}% of cap</span>
                  <span
                    className={cn(
                      "num font-medium",
                      nextSpent > category.cap
                        ? "text-rose-600 dark:text-rose-300"
                        : "text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {nextSpent > category.cap
                      ? `${formatMoney(nextSpent - category.cap)} over`
                      : nextSpent === category.cap
                        ? "Cap reached"
                        : `${formatMoney(category.cap - nextSpent)} left`}
                  </span>
                </div>
                {nextSpent > category.cap ? (
                  <p className="mt-2 border-t border-border/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground">
                    This takes the category past its cap. You can raise the cap in the category settings.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Log expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
