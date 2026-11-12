import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Receipt, Wallet } from "lucide-react"
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
import { categoryIcons } from "@/lib/category-icons"
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
    toast.success("Expense added", {
      description: `${formatMoney(entered)} added to ${category.name}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] overflow-hidden rounded-2xl border-border/80 p-0 max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl sm:max-w-[430px]">
        <form onSubmit={submit} className="flex max-h-[94dvh] flex-col">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/20 sm:hidden" />
          <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="size-4" />
              </span>
              Add an expense
            </DialogTitle>
            <DialogDescription>
              See how it affects the limit you set.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="expense-category">What did you spend on?</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="expense-category" className="h-12 rounded-xl">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {workspace.budget.categories.map((item) => {
                    const Icon = categoryIcons[item.icon] ?? Wallet
                    return (
                      <SelectItem key={item.id} value={item.id} textValue={`${item.name} · ${formatMoney(item.cap)} limit`}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {item.name} · {formatMoney(item.cap)} limit
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">How much?</Label>
              <MoneyInput id="expense-amount" value={amount} onValueChange={setAmount} />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1_000, 5_000, 10_000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value)}
                    className="num h-10 rounded-full px-3.5 text-[11px] sm:h-8 sm:text-[10.5px]"
                  >
                    {formatMoney(value)}
                  </Button>
                ))}
              </div>
            </div>

            {category ? (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                <div className="flex items-baseline justify-between text-[11.5px]">
                  <span className="text-muted-foreground">{category.name}</span>
                  <span className="num">
                    {formatMoney(nextSpent)} of {formatMoney(category.cap)}
                  </span>
                </div>
                <ProgressBar value={nextPct} tone={tone} className="mt-2" label="Category limit after this expense" />
                <div className="mt-2 flex items-center justify-between text-[10.5px]">
                  <span className={cn("text-muted-foreground")}>{Math.round(nextPct)}% of limit</span>
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
                        ? "Limit reached"
                        : `${formatMoney(category.cap - nextSpent)} left`}
                  </span>
                </div>
                {nextSpent > category.cap ? (
                  <p className="mt-2 border-t border-border/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground">
                    This takes the category past its limit. You can raise the limit in the category settings.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11 w-full sm:h-9 sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="h-11 w-full sm:h-9 sm:w-auto">
              Add expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
