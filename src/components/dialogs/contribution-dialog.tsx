import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ArrowDownToLine, Info } from "lucide-react"
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
import { MemberAvatar } from "@/components/common/member-avatar"
import { useWorkspace } from "@/store/workspace"
import { formatMoney } from "@/lib/format"
import { memberArrears, memberPaid } from "@/lib/analytics"

export function ContributionDialog({
  open,
  onOpenChange,
  defaultCircleId,
  defaultMemberId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCircleId?: string
  defaultMemberId?: string
}) {
  const { workspace, addContribution } = useWorkspace()
  const [circleId, setCircleId] = useState(defaultCircleId ?? workspace.circles[0]?.id ?? "")
  const [memberId, setMemberId] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [method, setMethod] = useState<"Mobile money" | "Bank transfer" | "Cash">("Mobile money")

  const circle = workspace.circles.find((item) => item.id === circleId)

  useEffect(() => {
    if (!open) return
    const nextCircle =
      workspace.circles.find((item) => item.id === defaultCircleId) ?? workspace.circles[0]
    setCircleId(nextCircle?.id ?? "")
    setMemberId(
      defaultMemberId && nextCircle?.memberIds.includes(defaultMemberId)
        ? defaultMemberId
        : nextCircle?.memberIds[0] ?? "",
    )
    setAmount(nextCircle?.contribution ?? "")
    setMethod("Mobile money")
  }, [open, defaultCircleId, defaultMemberId, workspace.circles])

  useEffect(() => {
    if (!circle) return
    if (!circle.memberIds.includes(memberId)) setMemberId(circle.memberIds[0] ?? "")
  }, [circle, memberId])

  const member = workspace.members.find((item) => item.id === memberId)
  const expected = circle ? circle.contribution * circle.cycles.length : 0
  const paid = circle ? memberPaid(workspace, circle.id, memberId) : 0
  const arrears = circle ? memberArrears(workspace, circle, memberId) : 0
  const entered = typeof amount === "number" ? amount : 0
  const newTotal = paid + entered
  const coverArrears = Math.min(arrears, entered)
  const canSubmit = Boolean(circle) && Boolean(member) && entered > 0

  const methodOptions = useMemo(
    () => [
      { value: "Mobile money", label: "Mobile money" },
      { value: "Bank transfer", label: "Bank transfer" },
      { value: "Cash", label: "Cash" },
    ],
    [],
  )

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!circle || !member || entered <= 0) return
    addContribution({ circleId: circle.id, memberId: member.id, amount: entered, method })
    toast.success("Contribution recorded", {
      description: `${formatMoney(entered)} from ${member.name} to ${circle.name}.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[480px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ArrowDownToLine className="size-4" />
              </span>
              Record a contribution
            </DialogTitle>
            <DialogDescription>
              Add money to a circle and keep every member&apos;s ledger accurate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contribution-circle">Circle</Label>
                <Select
                  value={circleId}
                  onValueChange={(value) => {
                    setCircleId(value)
                    const next = workspace.circles.find((item) => item.id === value)
                    if (next) setAmount(next.contribution)
                  }}
                >
                  <SelectTrigger id="contribution-circle" className="h-10">
                    <SelectValue placeholder="Choose a circle" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.circles.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contribution-member">Member</Label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger id="contribution-member" className="h-10">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {(circle?.memberIds ?? []).map((id) => {
                      const item = workspace.members.find((candidate) => candidate.id === id)
                      return (
                        <SelectItem key={id} value={id}>
                          {item?.name ?? id}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contribution-amount">Amount</Label>
                <MoneyInput
                  id="contribution-amount"
                  value={amount}
                  onValueChange={setAmount}
                  placeholder="0"
                />
                {circle ? (
                  <p className="text-[11px] text-muted-foreground">
                    Expected per cycle: {formatMoney(circle.contribution)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contribution-method">Paid via</Label>
                <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
                  <SelectTrigger id="contribution-method" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {methodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {member ? (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                <div className="flex items-center gap-2.5">
                  <MemberAvatar name={member.name} tone={member.tone} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{member.name}</p>
                    <p className="num text-[11px] text-muted-foreground">
                      {formatMoney(paid)} of {formatMoney(expected)} saved
                    </p>
                  </div>
                  {arrears > 0 ? (
                    <span className="ml-auto shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-700 dark:text-amber-300">
                      {formatMoney(arrears)} behind
                    </span>
                  ) : (
                    <span className="ml-auto shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700 dark:text-emerald-300">
                      Up to date
                    </span>
                  )}
                </div>
                {entered > 0 ? (
                  <div className="mt-3 space-y-1 border-t border-border/60 pt-3 text-[11.5px] text-muted-foreground">
                    <div className="flex justify-between gap-3">
                      <span>New member total</span>
                      <span className="num text-foreground">{formatMoney(newTotal)}</span>
                    </div>
                    {coverArrears > 0 ? (
                      <div className="flex justify-between gap-3">
                        <span>Arrears cleared</span>
                        <span className="num text-emerald-700 dark:text-emerald-300">
                          {formatMoney(coverArrears)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Contributions are applied to the current cycle. Your demo data is stored only in this browser.
            </p>
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Record contribution
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
