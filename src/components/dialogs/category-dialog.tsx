import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Home, PiggyBank, Sparkles, Wallet, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/common/money-input"
import { categoryIconChoices, categoryIcons } from "@/lib/category-icons"
import type { BudgetCategory, Bucket } from "@/lib/data"
import { formatMoney } from "@/lib/format"
import { useWorkspace } from "@/store/workspace"
import { cn } from "@/lib/utils"

const bucketOptions: { id: Bucket; label: string; description: string; icon: LucideIcon }[] = [
  { id: "needs", label: "Needs", description: "Essentials like food, rent and transport.", icon: Home },
  { id: "wants", label: "Wants", description: "Fun, extras and the occasional treat.", icon: Sparkles },
  { id: "savings", label: "Savings", description: "Money you keep for later.", icon: PiggyBank },
]

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  defaultBucket = "needs",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: BudgetCategory
  defaultBucket?: Bucket
}) {
  const { addCategory, updateCategory, removeCategory } = useWorkspace()
  const [name, setName] = useState("")
  const [bucket, setBucket] = useState<Bucket>("needs")
  const [icon, setIcon] = useState("wallet")
  const [cap, setCap] = useState<number | "">("")
  const [spent, setSpent] = useState<number | "">("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(category?.name ?? "")
    setBucket(category?.bucket ?? defaultBucket)
    setIcon(category?.icon ?? "wallet")
    setCap(category?.cap ?? "")
    setSpent(category?.spent ?? 0)
    setConfirmDelete(false)
  }, [open, category, defaultBucket])

  const capValue = typeof cap === "number" ? cap : 0
  const spentValue = typeof spent === "number" ? spent : 0
  const canSubmit = name.trim().length > 1 && capValue > 0
  const leftValue = capValue - spentValue
  const activeBucket = bucketOptions.find((option) => option.id === bucket)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    if (category) {
      updateCategory(category.id, {
        name: name.trim(),
        bucket,
        icon,
        cap: capValue,
        spent: spentValue,
      })
      toast.success("Category updated", {
        description: `${name.trim()} now has a ${formatMoney(capValue)} limit.`,
      })
    } else {
      addCategory({ name: name.trim(), bucket, icon, cap: capValue, spent: 0 })
      toast.success("Category added", {
        description: `${name.trim()} is now part of this month's plan.`,
      })
    }
    onOpenChange(false)
  }

  function handleDelete() {
    if (!category) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    removeCategory(category.id)
    toast.success("Category removed", { description: category.name })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] overflow-hidden rounded-2xl border-border/80 p-0 max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl sm:max-w-[460px]">
        <form onSubmit={submit} className="flex max-h-[94dvh] flex-col">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/20 sm:hidden" />
          <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="size-4" />
              </span>
              {category ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              Give it a name, choose a group, and set a monthly limit.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="category-name">What is it for?</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. School snacks"
                className="h-12 rounded-xl text-[15px]"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Which group?</Label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Category group">
                {bucketOptions.map((option) => {
                  const Icon = option.icon
                  const selected = bucket === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBucket(option.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        selected
                          ? "border-primary/30 bg-primary/[0.05] text-foreground"
                          : "border-border/70 text-muted-foreground hover:border-border hover:bg-muted/30",
                      )}
                    >
                      <Icon className={cn("size-4", selected && "text-primary")} strokeWidth={1.9} />
                      <span className="text-[11px] font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                {activeBucket?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pick a picture</Label>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
                {categoryIconChoices.map((choice) => {
                  const Icon = categoryIcons[choice.id] ?? Wallet
                  const selected = icon === choice.id
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      aria-label={choice.label}
                      aria-pressed={selected}
                      onClick={() => setIcon(choice.id)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                        selected
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/70 bg-card text-muted-foreground hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.8} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-cap">Monthly limit</Label>
              <MoneyInput id="category-cap" value={cap} onValueChange={setCap} placeholder="0" />
              <p className="text-[10.5px] text-muted-foreground">
                The most you want to spend here in one month.
              </p>
            </div>

            {category ? (
              <div className="space-y-1.5">
                <Label htmlFor="category-spent">Already spent</Label>
                <MoneyInput id="category-spent" value={spent} onValueChange={setSpent} placeholder="0" />
              </div>
            ) : null}

            {capValue > 0 ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3">
                <p className="text-[11px] text-muted-foreground">
                  {leftValue >= 0 ? "Left for this category" : "Over the limit"}
                </p>
                <p
                  className={cn(
                    "num mt-0.5 text-[17px] font-semibold tracking-[-0.02em]",
                    leftValue < 0 && "text-rose-600 dark:text-rose-300",
                  )}
                >
                  {formatMoney(Math.abs(leftValue))}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {leftValue >= 0
                    ? `Based on a ${formatMoney(capValue)} monthly limit.`
                    : `This is more than the ${formatMoney(capValue)} limit.`}
                </p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center">
            {category ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                className={cn(
                  "h-11 w-full justify-center sm:mr-auto sm:h-9 sm:w-auto",
                  confirmDelete
                    ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                    : "text-muted-foreground hover:text-destructive",
                )}
              >
                {confirmDelete ? "Tap again to delete" : "Delete category"}
              </Button>
            ) : null}
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 sm:h-9">
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit} className="h-11 sm:h-9">
                {category ? "Save changes" : "Create category"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
