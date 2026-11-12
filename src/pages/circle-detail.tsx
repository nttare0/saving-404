import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  HandCoins,
  Plus,
  ReceiptText,
  UsersRound,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Panel } from "@/components/common/panel"
import { ProgressBar } from "@/components/common/progress-bar"
import { MemberAvatar } from "@/components/common/member-avatar"
import { CircleMark } from "@/components/common/circle-mark"
import { LoanStatusBadge, StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ContributionDialog } from "@/components/dialogs/contribution-dialog"
import { LoanDialog } from "@/components/dialogs/loan-dialog"
import { RepaymentDialog } from "@/components/dialogs/repayment-dialog"
import { MemberContributionsBar } from "@/components/charts/member-contributions-bar"
import { useWorkspace } from "@/store/workspace"
import {
  circleMemberTotals,
  circleStats,
  loanRows,
  type LoanRow,
} from "@/lib/analytics"
import { formatDate, formatMoney, formatPercent } from "@/lib/format"
import { loanInterest, loanStatus } from "@/lib/data"

const statusTone = {
  "up to date": "positive",
  partial: "warning",
  behind: "danger",
} as const

export function CircleDetailPage() {
  const { circleId } = useParams()
  const { workspace } = useWorkspace()
  const [contributionOpen, setContributionOpen] = useState(false)
  const [contributionMember, setContributionMember] = useState<string | undefined>()
  const [loanOpen, setLoanOpen] = useState(false)
  const [repaymentLoan, setRepaymentLoan] = useState<LoanRow | null>(null)
  const [repaymentOpen, setRepaymentOpen] = useState(false)

  const circle = workspace.circles.find((item) => item.id === circleId)

  const data = useMemo(() => {
    if (!circle) return null
    const stats = circleStats(workspace, circle)
    const memberTotals = circleMemberTotals(workspace, circle)
    const loans = loanRows(workspace.loans.filter((loan) => loan.circleId === circle.id))
    const contributions = workspace.contributions
      .filter((item) => item.circleId === circle.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const payouts = workspace.payouts
      .filter((item) => item.circleId === circle.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const interestExpected = workspace.loans
      .filter((loan) => loan.circleId === circle.id && loanStatus(loan) !== "settled")
      .reduce((sum, loan) => sum + loanInterest(loan), 0)
    return { stats, memberTotals, loans, contributions, payouts, interestExpected }
  }, [circle, workspace])

  if (!circle || !data) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-10 text-center shadow-soft">
        <p className="text-[15px] font-medium">This circle could not be found</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          It may have been removed, or the link is out of date.
        </p>
        <Button asChild variant="outline" className="mt-4 h-9">
          <Link to="/circles">Back to circles</Link>
        </Button>
      </div>
    )
  }

  const { stats, memberTotals, loans, contributions, payouts, interestExpected } = data
  const admin = workspace.members.find((item) => item.id === circle.adminId)
  const nextMember = workspace.members.find((item) => item.id === circle.nextPayout.memberId)
  const cycleExpected = circle.contribution * circle.memberIds.length

  const upcoming = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(circle.nextPayout.date)
    if (circle.cadence === "weekly") {
      date.setDate(date.getDate() + index * 7)
    } else {
      date.setMonth(date.getMonth() + index)
    }
    const startIndex = circle.memberIds.indexOf(circle.nextPayout.memberId)
    const memberId = circle.memberIds[(Math.max(0, startIndex) + index) % circle.memberIds.length]
    return {
      date,
      member: workspace.members.find((item) => item.id === memberId),
      amount: cycleExpected,
      isNext: index === 0,
    }
  })

  function openContribution(memberId?: string) {
    setContributionMember(memberId)
    setContributionOpen(true)
  }

  return (
    <div className="space-y-5">
      <Link
        to="/circles"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All circles
      </Link>

      <PageHeader
        eyebrow={`${circle.cadence === "weekly" ? "Weekly" : "Monthly"} circle · ${circle.meeting}`}
        title={circle.name}
        description={circle.purpose}
        actions={
          <>
            <Button variant="outline" className="h-9 gap-1.5 rounded-lg" onClick={() => setLoanOpen(true)}>
              <HandCoins className="size-4" />
              Give a loan
            </Button>
            <Button className="h-9 gap-1.5 rounded-lg" onClick={() => openContribution()}>
              <Plus className="size-4" />
              Contribution
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={circle.status === "active" ? "accent" : "neutral"}>
          {circle.status === "active" ? "Active circle" : "Forming"}
        </StatusBadge>
        <StatusBadge tone="neutral" dot={false}>
          {formatMoney(circle.contribution)} {circle.cadence}
        </StatusBadge>
        <StatusBadge tone="neutral" dot={false}>
          Admin · {admin?.name ?? "Member"}
        </StatusBadge>
        {stats.arrears > 0 ? (
          <StatusBadge tone="warning">{formatMoney(stats.arrears)} in arrears</StatusBadge>
        ) : (
          <StatusBadge tone="positive">No arrears</StatusBadge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-primary/15 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--primary)_8%,var(--card)),var(--card))] p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">Circle balance</p>
            <CircleMark color={circle.color} className="size-7 rounded-lg" />
          </div>
          <p className="num mt-3 text-[21px] font-semibold tracking-[-0.03em]">{formatMoney(stats.totalContributed)}</p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">
            {stats.paidMembers} of {stats.memberCount} members fully paid
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <p className="text-[11px] font-medium text-muted-foreground">Expected by now</p>
          <p className="num mt-3 text-[21px] font-semibold tracking-[-0.03em]">{formatMoney(stats.expected)}</p>
          <ProgressBar value={stats.progress} className="mt-2.5 h-1" label="Circle collection progress" />
          <p className="num mt-1.5 text-[10.5px] text-muted-foreground">{formatPercent(stats.progress)} collected</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <p className="text-[11px] font-medium text-muted-foreground">Loans outstanding</p>
          <p className="num mt-3 text-[21px] font-semibold tracking-[-0.03em]">{formatMoney(stats.outstandingLoans)}</p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">
            {loans.filter((loan) => loan.status !== "settled").length} open · {formatMoney(interestExpected)} interest
          </p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
          <p className="text-[11px] font-medium text-muted-foreground">Next pot</p>
          <p className="num mt-3 text-[21px] font-semibold tracking-[-0.03em]">{formatDate(circle.nextPayout.date)}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <MemberAvatar name={nextMember?.name ?? "Member"} tone={nextMember?.tone} size="xs" />
            <span className="truncate">{nextMember?.name ?? "Member"} · {formatMoney(circle.nextPayout.amount)}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="no-scrollbar h-9 w-full justify-start overflow-x-auto rounded-lg bg-muted/60 p-1 sm:w-auto">
            <TabsTrigger value="members" className="gap-1.5 px-3 text-[12px]">
              <UsersRound className="size-3.5" /> Members
            </TabsTrigger>
            <TabsTrigger value="contributions" className="gap-1.5 px-3 text-[12px]">
              <ReceiptText className="size-3.5" /> Contributions
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-1.5 px-3 text-[12px]">
              <HandCoins className="size-3.5" /> Loans
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5 px-3 text-[12px]">
              <CalendarDays className="size-3.5" /> Schedule
            </TabsTrigger>
          </TabsList>
          <p className="text-[10.5px] text-muted-foreground">
            {circle.cycles.length} cycles · {formatDate(circle.startedAt, "month")} to {formatDate(new Date(), "month")}
          </p>
        </div>

        <TabsContent value="members" className="mt-0 space-y-4 focus-visible:ring-0">
          <Panel
            title="Member contributions"
            description={`Paid so far against a ${formatMoney(circle.contribution * circle.cycles.length)} target per member.`}
            bodyClassName="px-2 pb-3 pt-4 sm:px-3"
          >
            <MemberContributionsBar
              data={memberTotals.map((member) => ({
                name: member.name.split(" ")[0],
                paid: member.paid,
                target: member.target,
              }))}
            />
            <div className="flex flex-wrap items-center gap-4 px-2 text-[10.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-1" /> Paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-border" /> Expected
              </span>
            </div>
          </Panel>

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-10 pl-4 text-[10.5px] uppercase tracking-[0.1em]">Member</TableHead>
                  <TableHead className="text-right text-[10.5px] uppercase tracking-[0.1em]">Paid</TableHead>
                  <TableHead className="hidden text-right text-[10.5px] uppercase tracking-[0.1em] sm:table-cell">
                    Target
                  </TableHead>
                  <TableHead className="text-right text-[10.5px] uppercase tracking-[0.1em]">Arrears</TableHead>
                  <TableHead className="hidden text-[10.5px] uppercase tracking-[0.1em] md:table-cell">Status</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberTotals.map((member) => {
                  const person = workspace.members.find((item) => item.id === member.memberId)
                  return (
                    <TableRow key={member.memberId} className="border-border/50">
                      <TableCell className="py-2.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <MemberAvatar name={member.name} tone={person?.tone} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium">{member.name}</p>
                            <p className="text-[10px] text-muted-foreground md:hidden">
                              {member.status === "up to date" ? "Up to date" : member.status}
                            </p>
                          </div>
                          {member.memberId === circle.adminId ? (
                            <span className="hidden rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary sm:inline">
                              Admin
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="num text-right text-[12px]">{formatMoney(member.paid)}</TableCell>
                      <TableCell className="num hidden text-right text-[12px] text-muted-foreground sm:table-cell">
                        {formatMoney(member.target)}
                      </TableCell>
                      <TableCell
                        className={`num text-right text-[12px] ${
                          member.arrears > 0 ? "font-medium text-amber-700 dark:text-amber-300" : "text-muted-foreground"
                        }`}
                      >
                        {member.arrears > 0 ? formatMoney(member.arrears) : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge tone={statusTone[member.status]}>{member.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="pr-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openContribution(member.memberId)}
                          className="h-8 rounded-lg px-2 text-[10.5px] text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="mt-0 focus-visible:ring-0">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3.5">
              <div>
                <h2 className="text-[14px] font-semibold">Contribution ledger</h2>
                <p className="text-[11.5px] text-muted-foreground">
                  {contributions.length} entries · latest first
                </p>
              </div>
              <Button size="sm" className="h-8 rounded-lg gap-1.5" onClick={() => openContribution()}>
                <Plus className="size-3.5" /> Record
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-10 pl-4 text-[10.5px] uppercase tracking-[0.1em]">Member</TableHead>
                  <TableHead className="text-[10.5px] uppercase tracking-[0.1em]">Cycle</TableHead>
                  <TableHead className="hidden text-[10.5px] uppercase tracking-[0.1em] sm:table-cell">Method</TableHead>
                  <TableHead className="hidden text-[10.5px] uppercase tracking-[0.1em] md:table-cell">Date</TableHead>
                  <TableHead className="pr-4 text-right text-[10.5px] uppercase tracking-[0.1em]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.slice(0, 14).map((entry) => {
                  const person = workspace.members.find((member) => member.id === entry.memberId)
                  const cycle = circle.cycles.find((item) => item.key === entry.cycleKey)
                  return (
                    <TableRow key={entry.id} className="border-border/50">
                      <TableCell className="py-2.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <MemberAvatar name={person?.name ?? "Member"} tone={person?.tone} size="xs" />
                          <span className="text-[12px] font-medium">{person?.name ?? "Member"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11.5px] text-muted-foreground">
                        {cycle?.label ?? entry.cycleKey}
                      </TableCell>
                      <TableCell className="hidden text-[11.5px] text-muted-foreground sm:table-cell">
                        {entry.method}
                      </TableCell>
                      <TableCell className="num hidden text-[11.5px] text-muted-foreground md:table-cell">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="num pr-4 text-right text-[12px] font-medium">
                        {formatMoney(entry.amount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <p className="border-t border-border/60 px-4 py-3 text-[10.5px] text-muted-foreground">
              Showing the 14 most recent entries of {contributions.length}. New contributions appear here immediately.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="mt-0 space-y-3 focus-visible:ring-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11.5px] text-muted-foreground">
              Simple interest is fixed at issue, so returns are predictable.
            </p>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg" onClick={() => setLoanOpen(true)}>
              <Plus className="size-3.5" /> New loan
            </Button>
          </div>
          {loans.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {loans.map((loan) => (
                <div key={loan.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MemberAvatar name={loan.borrowerName} tone="slate" size="sm" />
                      <div>
                        <p className="text-[13px] font-medium">{loan.borrowerName}</p>
                        <p className="text-[10.5px] text-muted-foreground">{loan.purpose}</p>
                      </div>
                    </div>
                    <LoanStatusBadge status={loan.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5">
                    <div>
                      <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Principal</p>
                      <p className="num mt-0.5 text-[11.5px] font-medium">{formatMoney(loan.principal)}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Interest</p>
                      <p className="num mt-0.5 text-[11.5px] font-medium">{formatMoney(loan.interest)}</p>
                    </div>
                    <div>
                      <p className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Outstanding</p>
                      <p className="num mt-0.5 text-[11.5px] font-medium">{formatMoney(loan.outstanding)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10.5px] text-muted-foreground">
                      <span>Repaid {formatMoney(loan.repaid)} of {formatMoney(loan.totalDue)}</span>
                      <span className="num">{Math.round(loan.repaidPct)}%</span>
                    </div>
                    <ProgressBar
                      value={loan.repaidPct}
                      tone={loan.repaidPct >= 100 ? "ok" : "accent"}
                      className="mt-1.5 h-1"
                      label={`${loan.borrowerName} repayment`}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
                    <span className="text-[10.5px] text-muted-foreground">Due {formatDate(loan.dueAt)}</span>
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
                        Record repayment <ArrowRight className="ml-1 size-3" />
                      </Button>
                    ) : (
                      <span className="text-[10.5px] font-medium text-emerald-700 dark:text-emerald-300">
                        Fully returned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-[13px] font-medium">No loans from this circle yet</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Lend to a member and set a simple interest rate and term.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-0 space-y-4 focus-visible:ring-0">
          <Panel
            title="Upcoming rotation"
            description="Every member receives the pot once per rotation."
            action={<StatusBadge tone="accent">{circle.cadence === "weekly" ? "Weekly" : "Monthly"}</StatusBadge>}
            bodyClassName="p-2 sm:p-2.5"
          >
            <div className="divide-y divide-border/60">
              {upcoming.map((entry) => (
                <div key={entry.date.toISOString()} className="flex items-center gap-3 px-2.5 py-3">
                  <span className="num flex size-9 shrink-0 flex-col items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-[9px] uppercase leading-none text-muted-foreground">
                    <span>{formatDate(entry.date).split(" ")[1]}</span>
                    <span className="mt-0.5 text-[11px] font-semibold text-foreground">
                      {formatDate(entry.date).split(" ")[0]}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium">
                      {entry.member?.name ?? "Member"}
                      {entry.isNext ? (
                        <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                          Next
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {formatDate(entry.date, "long")} · {circle.meeting}
                    </p>
                  </div>
                  <span className="num text-[11.5px] font-medium">{formatMoney(entry.amount)}</span>
                </div>
              ))}
            </div>
          </Panel>

          {payouts.length ? (
            <Panel title="Past payouts" description="Recorded pot handovers." bodyClassName="p-2 sm:p-2.5">
              <div className="divide-y divide-border/60">
                {payouts.map((payout) => {
                  const person = workspace.members.find((member) => member.id === payout.memberId)
                  return (
                    <div key={payout.id} className="flex items-center gap-3 px-2.5 py-2.5">
                      <MemberAvatar name={person?.name ?? "Member"} tone={person?.tone} size="xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium">{person?.name ?? "Member"}</p>
                        <p className="text-[10.5px] text-muted-foreground">{formatDate(payout.date, "long")}</p>
                      </div>
                      <span className="num text-[11.5px] font-medium">{formatMoney(payout.amount)}</span>
                    </div>
                  )
                })}
              </div>
            </Panel>
          ) : null}
        </TabsContent>
      </Tabs>

      <ContributionDialog
        open={contributionOpen}
        onOpenChange={(open) => {
          setContributionOpen(open)
          if (!open) setContributionMember(undefined)
        }}
        defaultCircleId={circle.id}
        defaultMemberId={contributionMember}
      />
      <LoanDialog open={loanOpen} onOpenChange={setLoanOpen} defaultCircleId={circle.id} />
      <RepaymentDialog loan={repaymentLoan} open={repaymentOpen} onOpenChange={setRepaymentOpen} />
    </div>
  )
}
