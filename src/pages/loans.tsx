import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Calculator, HandCoins, Plus, Scale, TriangleAlert } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Panel, SectionLabel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { StatCard } from "@/components/common/stat-card"
import { LoanStatusBadge } from "@/components/common/status-badge"
import { MemberAvatar } from "@/components/common/member-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoneyInput } from "@/components/common/money-input"
import { LoanDialog } from "@/components/dialogs/loan-dialog"
import { RepaymentDialog } from "@/components/dialogs/repayment-dialog"
import { useWorkspace } from "@/store/workspace"
import { loanRows, type LoanRow } from "@/lib/analytics"
import { formatDate, formatMoney, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

type Filter = "all" | "overdue" | "partial" | "active" | "settled"

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "partial", label: "Part paid" },
  { value: "active", label: "Active" },
  { value: "settled", label: "Settled" },
]

export function LoansPage() {
  const { workspace } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>("all")
  const [repaymentLoan, setRepaymentLoan] = useState<LoanRow | null>(null)
  const [repaymentOpen, setRepaymentOpen] = useState(false)

  const [calcAmount, setCalcAmount] = useState<number | "">(300_000)
  const [calcRate, setCalcRate] = useState(10)
  const [calcTerm, setCalcTerm] = useState(3)

  const rows = useMemo(() => loanRows(workspace.loans), [workspace.loans])
  const filtered = filter === "all" ? rows : rows.filter((row) => row.status === filter)
  const totals = rows.reduce(
    (summary, loan) => {
      summary.principal += loan.principal
      summary.outstanding += loan.outstanding
      if (loan.status !== "settled") summary.interest += loan.interest
      if (loan.status === "overdue") summary.overdue += loan.outstanding
      return summary
    },
    { principal: 0, outstanding: 0, interest: 0, overdue: 0 },
  )
  const openLoans = rows.filter((row) => row.status !== "settled").length
  const counts = (status: Filter) =>
    status === "all" ? rows.length : rows.filter((row) => row.status === status).length

  const amount = typeof calcAmount === "number" ? calcAmount : 0
  const calcInterest = Math.round(amount * (calcRate / 100) * (calcTerm / 12))
  const calcTotal = amount + calcInterest
  const dueSoon = [...rows]
    .filter((row) => row.status !== "settled")
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lending ledger"
        title="Loans"
        description="Track who borrowed, the interest that comes back, and exactly what is still outstanding."
        actions={
          <Button className="h-9 gap-1.5 rounded-lg" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Record a loan
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          accent
          label="Still to be returned"
          value={formatMoney(totals.outstanding)}
          icon={HandCoins}
          hint={`${openLoans} open loans across circles and personal lending`}
        />
        <StatCard label="Principal issued" value={formatMoney(totals.principal)} icon={Scale} hint="Across all recorded loans" />
        <StatCard
          label="Interest expected"
          value={formatMoney(totals.interest)}
          icon={Calculator}
          hint="On loans still open"
        />
        <StatCard
          label="Overdue balance"
          value={formatMoney(totals.overdue)}
          icon={TriangleAlert}
          delta={totals.overdue > 0 ? "Follow up" : "On track"}
          deltaTone={totals.overdue > 0 ? "negative" : "positive"}
          hint={`${counts("overdue")} loan${counts("overdue") === 1 ? "" : "s"} past the agreed date`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-1">
            {filters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  filter === option.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
                <span className="ml-1.5 text-[10px] text-muted-foreground">{counts(option.value)}</span>
              </button>
            ))}
          </div>
          <p className="text-[10.5px] text-muted-foreground">
            Interest = principal × rate × term ÷ 12. No compounding, no surprises.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="h-10 pl-4 text-[10.5px] uppercase tracking-[0.1em]">Borrower</TableHead>
                <TableHead className="hidden text-[10.5px] uppercase tracking-[0.1em] sm:table-cell">Terms</TableHead>
                <TableHead className="text-right text-[10.5px] uppercase tracking-[0.1em]">Outstanding</TableHead>
                <TableHead className="hidden text-[10.5px] uppercase tracking-[0.1em] lg:table-cell">Repayment</TableHead>
                <TableHead className="hidden text-[10.5px] uppercase tracking-[0.1em] md:table-cell">Due</TableHead>
                <TableHead className="text-[10.5px] uppercase tracking-[0.1em]">Status</TableHead>
                <TableHead className="w-16 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((loan) => {
                const circle = workspace.circles.find((item) => item.id === loan.circleId)
                return (
                  <TableRow key={loan.id} className="border-border/50">
                    <TableCell className="py-2.5 pl-4">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar name={loan.borrowerName} tone={loan.status === "overdue" ? "rose" : "slate"} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-medium">{loan.borrowerName}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {circle?.name ?? "Personal loan"} · {loan.purpose}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="num hidden text-[11px] text-muted-foreground sm:table-cell">
                      {formatMoney(loan.principal)} · {loan.ratePct}% · {loan.termMonths}m
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="num text-[12px] font-medium">{formatMoney(loan.outstanding)}</p>
                      <p className="num text-[10px] text-muted-foreground">of {formatMoney(loan.totalDue)}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="w-[120px]">
                        <div className="flex justify-between text-[9.5px] text-muted-foreground">
                          <span>{formatPercent(loan.repaidPct)}</span>
                          <span className="num">{formatMoney(loan.interest)} int.</span>
                        </div>
                        <ProgressBar
                          value={loan.repaidPct}
                          tone={loan.repaidPct >= 100 ? "ok" : loan.status === "overdue" ? "over" : "accent"}
                          className="mt-1 h-1"
                          label={`${loan.borrowerName} repayment progress`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="num hidden text-[11px] text-muted-foreground md:table-cell">
                      {formatDate(loan.dueAt)}
                    </TableCell>
                    <TableCell>
                      <LoanStatusBadge status={loan.status} />
                    </TableCell>
                    <TableCell className="pr-3 text-right">
                      {loan.status !== "settled" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg px-2 text-[10.5px] text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setRepaymentLoan(loan)
                            setRepaymentOpen(true)
                          }}
                        >
                          Repay
                        </Button>
                      ) : (
                        <Link
                          to={circle ? `/circles/${circle.id}` : "/loans"}
                          className="text-[10.5px] text-muted-foreground hover:text-foreground"
                        >
                          View
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] font-medium">No loans in this view</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Try another status, or record a new loan.
              </p>
            </div>
          ) : null}
          <p className="border-t border-border/60 px-4 py-3 text-[10.5px] text-muted-foreground">
            {filtered.length} of {rows.length} loans · totals update as repayments are recorded.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel
          title="Interest calculator"
          description="Model a loan before you commit to the terms."
          action={<SectionLabel>Simple interest</SectionLabel>}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="calc-amount">Principal</Label>
              <MoneyInput id="calc-amount" value={calcAmount} onValueChange={setCalcAmount} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calc-rate">Rate (per year)</Label>
              <div className="relative">
                <Input
                  id="calc-rate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={calcRate}
                  onChange={(event) => setCalcRate(Number(event.target.value))}
                  className="num h-10 pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calc-term">Term</Label>
              <Select value={String(calcTerm)} onValueChange={(value) => setCalcTerm(Number(value))}>
                <SelectTrigger id="calc-term" className="h-10">
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

          <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 sm:grid-cols-3">
            <div className="bg-card p-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Interest</p>
              <p className="num mt-1 text-[15px] font-semibold">{formatMoney(calcInterest)}</p>
            </div>
            <div className="bg-card p-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Total back</p>
              <p className="num mt-1 text-[15px] font-semibold">{formatMoney(calcTotal)}</p>
            </div>
            <div className="bg-card p-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Per month</p>
              <p className="num mt-1 text-[15px] font-semibold">{formatMoney(calcTotal / Math.max(1, calcTerm))}</p>
            </div>
          </div>
          <Button variant="outline" className="mt-3 h-9 gap-1.5 rounded-lg" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Record a loan with these terms
          </Button>
        </Panel>

        <Panel
          title="Due soon"
          description="The next repayments to watch."
          action={
            <Link to="/budget" className="text-[11px] font-medium text-primary hover:underline">
              Plan cash flow
            </Link>
          }
          bodyClassName="p-2 sm:p-2.5"
        >
          <div className="divide-y divide-border/60">
            {dueSoon.map((loan) => (
              <div key={loan.id} className="flex items-center gap-3 px-2.5 py-2.5">
                <MemberAvatar name={loan.borrowerName} tone={loan.status === "overdue" ? "rose" : "slate"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{loan.borrowerName}</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    Due {formatDate(loan.dueAt, "long")} · {formatMoney(loan.outstanding)} left
                  </p>
                </div>
                <LoanStatusBadge status={loan.status} />
              </div>
            ))}
            {dueSoon.length === 0 ? (
              <p className="px-3 py-8 text-center text-[11.5px] text-muted-foreground">
                No open loans right now.
              </p>
            ) : null}
          </div>
          <div className="mt-2 border-t border-border/60 px-2.5 pt-3 text-[10.5px] leading-relaxed text-muted-foreground">
            Repayments are recorded against principal plus interest. Overdue loans stay visible until fully settled.
          </div>
        </Panel>
      </div>

      <LoanDialog open={open} onOpenChange={setOpen} />
      <RepaymentDialog loan={repaymentLoan} open={repaymentOpen} onOpenChange={setRepaymentOpen} />
    </div>
  )
}
