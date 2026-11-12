import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Wallet } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoneyInput } from "@/components/common/money-input"
import type { BudgetCategory, Bucket } from "@/lib/data"
import { formatMoney } from "@/lib/format"
import { useWorkspace } from "@/store/workspace"

const bucketLabels: Record<Bucket, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
}

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
  const [cap, setCap] = useState<number | "">("")
  const [spent, setSpent] = useState<number | "">("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(category?.name ?? "")
    setBucket(category?.bucket ?? defaultBucket)
    setCap(category?.cap ?? "")
    setSpent(category?.spent ?? 0)
    setConfirmDelete(false)
  }, [open, category, defaultBucket])

  const capValue = typeof cap === "number" ? cap : 0
  const spentValue = typeof spent === "number" ? spent : 0
  const canSubmit = name.trim().length > 1 && capValue > 0

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    if (category) {
      updateCategory(category.id, {
        name: name.trim(),
        bucket,
        cap: capValue,
        spent: spentValue,
      })
      toast.success("Category updated", { description: `${name.trim()} now caps at ${formatMoney(capValue)}.` })
    } else {
      addCategory({ name: name.trim(), bucket, cap: capValue, spent: spentValue })
      toast.success("Category added", { description: `${name.trim()} is now part of this month's plan.` })
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
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[440px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="size-4" />
              </span>
              {category ? "Edit category" : "Add a category"}
            </DialogTitle>
            <DialogDescription>
              Set a monthly cap and log what has been spent so far.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Category name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Coffee & lunches"
                className="h-10"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category-bucket">Bucket</Label>
              <Select value={bucket} onValueChange={(value) => setBucket(value as Bucket)}>
                <SelectTrigger id="category-bucket" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(bucketLabels) as Bucket[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {bucketLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category-cap">Monthly cap</Label>
                <MoneyInput id="category-cap" value={cap} onValueChange={setCap} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category-spent">Spent so far</Label>
                <MoneyInput id="category-spent" value={spent} onValueChange={setSpent} placeholder="0" />
              </div>
            </div>

            {capValue > 0 ? (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11.5px] text-muted-foreground">
                {formatMoney(Math.max(0, capValue - spentValue))} will remain in this category.
              </p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            {category ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                className="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {confirmDelete ? "Click again to delete" : "Delete"}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {category ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
