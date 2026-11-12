import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BadgeCheck } from "lucide-react"
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
import type { LoanRow } from "@/lib/analytics"
import { useWorkspace } from "@/store/workspace"
import { formatDate, formatMoney } from "@/lib/format"

export function RepaymentDialog({
  loan,
  open,
  onOpenChange,
}: {
  loan: LoanRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { recordRepayment } = useWorkspace()
  const [amount, setAmount] = useState<number | "">("")

  useEffect(() => {
    if (open) setAmount("")
  }, [open, loan?.id])

  if (!loan) return null

  const entered = typeof amount === "number" ? amount : 0
  const nextRepaid = Math.min(loan.totalDue, loan.repaid + entered)
  const nextOutstanding = Math.max(0, loan.totalDue - nextRepaid)
  const nextPct = (nextRepaid / loan.totalDue) * 100

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!loan || entered <= 0) return
    recordRepayment(loan.id, entered)
    toast.success("Repayment recorded", {
      description: `${formatMoney(entered)} received from ${loan.borrowerName}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[440px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BadgeCheck className="size-4" />
              </span>
              Record a repayment
            </DialogTitle>
            <DialogDescription>
              {loan.borrowerName} · due {formatDate(loan.dueAt, "long")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="repayment-amount">Amount received</Label>
              <MoneyInput
                id="repayment-amount"
                value={amount}
                onValueChange={setAmount}
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[0.25, 0.5, 1].map((ratio) => {
                const value = Math.round((loan.outstanding * ratio) / 1000) * 1000
                return (
                  <Button
                    key={ratio}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(value)}
                    className="num h-7 rounded-full px-2.5 text-[10.5px]"
                  >
                    {ratio === 1 ? "Full" : `${ratio * 100}%`} · {formatMoney(value)}
                  </Button>
                )
              })}
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-muted-foreground">Repaid after this entry</span>
                <span className="num font-medium">
                  {formatMoney(nextRepaid)} / {formatMoney(loan.totalDue)}
                </span>
              </div>
              <ProgressBar
                value={nextPct}
                tone={nextPct >= 100 ? "ok" : "accent"}
                className="mt-2.5"
                label="Loan repayment after this payment"
              />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>{Math.round(nextPct)}% of principal + interest</span>
                <span className="num">{formatMoney(nextOutstanding)} left</span>
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              Interest is calculated as simple interest on the principal for the loan term.
            </p>
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={entered <= 0}>
              Save repayment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
