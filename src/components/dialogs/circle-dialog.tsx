import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, UsersRound } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { MoneyInput } from "@/components/common/money-input"
import { MemberAvatar } from "@/components/common/member-avatar"
import { useWorkspace } from "@/store/workspace"
import { formatMoney } from "@/lib/format"

export function CircleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (show: boolean) => void
}) {
  const { workspace, addCircle } = useWorkspace()
  const [name, setName] = useState("")
  const [purpose, setPurpose] = useState("")
  const [contribution, setContribution] = useState<number | "">(50_000)
  const [cadence, setCadence] = useState<"monthly" | "weekly">("monthly")
  const [memberIds, setMemberIds] = useState<string[]>(["amara"])

  useEffect(() => {
    if (!open) return
    setName("")
    setPurpose("")
    setContribution(50_000)
    setCadence("monthly")
    setMemberIds(["amara"])
  }, [open])

  const amount = typeof contribution === "number" ? contribution : 0
  const pot = amount * memberIds.length
  const canSubmit = name.trim().length > 2 && amount > 0 && memberIds.length > 1

  function toggleMember(id: string) {
    setMemberIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    addCircle({
      name: name.trim(),
      purpose: purpose.trim() || "A new savings circle.",
      contribution: amount,
      cadence,
      memberIds,
    })
    toast.success("Circle created", {
      description: `${name.trim()} is ready with ${memberIds.length} members.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl border-border/80 p-0 sm:max-w-[520px]">
        <form onSubmit={submit}>
          <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-[17px] tracking-[-0.02em]">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UsersRound className="size-4" />
              </span>
              Start a savings circle
            </DialogTitle>
            <DialogDescription>
              Set the contribution, invite your people, and let the ledger do the rest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="circle-name">Circle name</Label>
              <Input
                id="circle-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Kigali Weekend Circle"
                className="h-10"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="circle-purpose">What is it for?</Label>
              <Textarea
                id="circle-purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder="A short note on the goal for this circle."
                className="min-h-[72px] resize-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="circle-contribution">Contribution</Label>
                <MoneyInput
                  id="circle-contribution"
                  value={contribution}
                  onValueChange={setContribution}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="circle-cadence">Cadence</Label>
                <Select value={cadence} onValueChange={(value) => setCadence(value as typeof cadence)}>
                  <SelectTrigger id="circle-cadence" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Members</Label>
                <span className="text-[11px] text-muted-foreground">
                  {memberIds.length} selected · pot of {formatMoney(pot)}
                </span>
              </div>
              <div className="grid max-h-[188px] gap-1 overflow-y-auto rounded-xl border border-border/70 p-1.5">
                {workspace.members.map((member) => {
                  const checked = memberIds.includes(member.id)
                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors hover:bg-muted/60"
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleMember(member.id)} />
                      <MemberAvatar name={member.name} tone={member.tone} size="xs" />
                      <span className="truncate">{member.name}</span>
                      {member.id === "amara" ? (
                        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-medium text-primary">
                          You
                        </span>
                      ) : null}
                    </label>
                  )
                })}
              </div>
              {memberIds.length <= 1 ? (
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Choose at least two members to start a circle.
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Plus className="size-4" />
              Create circle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
