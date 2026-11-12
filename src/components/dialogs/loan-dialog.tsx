import { useEffect, useState } from "react"
import { toast } from "sonner"
import { HandCoins } from "lucide-react"
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
import { useWorkspace } from "@/store/workspace"
import { formatDate, formatMoney } from "@/lib/format"

export function LoanDialog({
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
  const { workspace, addLoan } = useWorkspace()
  const [memberId, setMemberId] = useState(defaultMemberId ?? workspace.members[1]?.id ?? "")
  const [borrowerName, setBorrowerName] = useState("")
  const [circleId, setCircleId] = useState(defaultCircleId ?? "personal")
  const [principal, setPrincipal] = useState<number | "">("")
  const [ratePct, setRatePct] = useState(10)
  const [termMonths, setTermMonths] = useState(3)
  const [purpose, setPurpose] = useState("")

  useEffect(() => {
    if (!open) return
    const member = workspace.members.find((item) => item.id === (defaultMemberId ?? workspace.members[1]?.id))
    setMemberId(member?.id ?? workspace.members[0]?.id ?? "")
    setBorrowerName(member?.name ?? "")
    setCircleId(defaultCircleId ?? "personal")
    setPrincipal("")
    setRatePct(10)
    setTermMonths(3)
    setPurpose("")
  }, [open, defaultCircleId, defaultMemberId, workspace.members])

  const amount = typeof principal === "number" ? principal : 0
  const interest = Math.round(amount * (ratePct / 100) * (termMonths / 12))
  const total = amount + interest
  const dueDate = new Date()
  dueDate.setMonth(dueDate.getMonth() + termMonths)
  const canSubmit = amount > 0 && borrowerName.trim().length > 1

  function changeMember(value: string) {
    setMemberId(value)
    const member = workspace.members.find((item) => item.id === value)
    if (member) setBorrowerName(member.name)
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    addLoan({
      borrowerName: borrowerName.trim(),
      memberId: memberId || undefined,
      circleId: circleId === "personal" ? undefined : circleId,
      principal: amount,
      ratePct,
      termMonths,
      purpose: purpose.trim() || "Member loan",
    })
    toast.success("Loan recorded", {
      description: `${formatMoney(amount)} lent to ${borrowerName.trim()} at ${ratePct}% for ${termMonths} months.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[500px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HandCoins className="size-4" />
              </span>
              Record a loan
            </DialogTitle>
            <DialogDescription>
              Simple interest is calculated upfront so everyone knows what comes back.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="loan-member">Member</Label>
                <Select value={memberId} onValueChange={changeMember}>
                  <SelectTrigger id="loan-member" className="h-10">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loan-circle">Lent from</Label>
                <Select value={circleId} onValueChange={setCircleId}>
                  <SelectTrigger id="loan-circle" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal savings</SelectItem>
                    {workspace.circles.map((circle) => (
                      <SelectItem key={circle.id} value={circle.id}>
                        {circle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loan-borrower">Borrower name</Label>
              <Input
                id="loan-borrower"
                value={borrowerName}
                onChange={(event) => setBorrowerName(event.target.value)}
                placeholder="Who is receiving the loan?"
                className="h-10"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="loan-principal">Principal</Label>
                <MoneyInput
                  id="loan-principal"
                  value={principal}
                  onValueChange={setPrincipal}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loan-rate">Interest rate</Label>
                <div className="relative">
                  <Input
                    id="loan-rate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={ratePct}
                    onChange={(event) => setRatePct(Number(event.target.value))}
                    className="num h-10 pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                    %/yr
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loan-term">Term</Label>
                <Select value={String(termMonths)} onValueChange={(value) => setTermMonths(Number(value))}>
                  <SelectTrigger id="loan-term" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 6, 12].map((months) => (
                      <SelectItem key={months} value={String(months)}>
                        {months} {months === 1 ? "month" : "months"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loan-purpose">Purpose (optional)</Label>
              <Input
                id="loan-purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder="Stock, school fees, tools…"
                className="h-10"
              />
            </div>

            <div className="space-y-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] p-3.5">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Simple interest</span>
                <span className="num font-medium text-foreground">{formatMoney(interest)}</span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Total to be returned</span>
                <span className="num text-[15px] font-semibold text-foreground">{formatMoney(total)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-primary/10 pt-2.5 text-[11.5px] text-muted-foreground">
                <span>Due {formatDate(dueDate, "long")}</span>
                <span className="num">≈ {formatMoney(total / termMonths)} / month</span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Record loan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
