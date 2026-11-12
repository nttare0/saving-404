import {
  type BudgetCategory,
  type Circle,
  type Contribution,
  type Loan,
  type Workspace,
  loanInterest,
  loanStatus,
  loanTotalDue,
} from "@/lib/data"

export type LoadedCircle = {
  circle: Circle
  totalContributed: number
  expected: number
  arrears: number
  outstandingLoans: number
  nextPayout: Circle["nextPayout"]
  memberCount: number
  progress: number
  paidMembers: number
}

export function contributionsFor(workspace: Workspace, circleId: string): Contribution[] {
  return workspace.contributions.filter((item) => item.circleId === circleId)
}

export function memberPaid(workspace: Workspace, circleId: string, memberId: string) {
  return contributionsFor(workspace, circleId)
    .filter((item) => item.memberId === memberId)
    .reduce((total, item) => total + item.amount, 0)
}

export function circleStats(workspace: Workspace, circle: Circle): LoadedCircle {
  const contributions = contributionsFor(workspace, circle.id)
  const totalContributed = contributions.reduce((total, item) => total + item.amount, 0)
  const expected = circle.contribution * circle.cycles.length * circle.memberIds.length
  const loans = workspace.loans.filter(
    (loan) => loan.circleId === circle.id && loanStatus(loan) !== "settled",
  )
  const outstandingLoans = loans.reduce(
    (total, loan) => total + Math.max(0, loanTotalDue(loan) - loan.repaid),
    0,
  )
  const paidMembers = circle.memberIds.filter(
    (memberId) => memberPaid(workspace, circle.id, memberId) >= circle.contribution * circle.cycles.length,
  ).length

  return {
    circle,
    totalContributed,
    expected,
    arrears: Math.max(0, expected - totalContributed),
    outstandingLoans,
    nextPayout: circle.nextPayout,
    memberCount: circle.memberIds.length,
    progress: expected > 0 ? Math.min(100, (totalContributed / expected) * 100) : 100,
    paidMembers,
  }
}

export function memberArrears(workspace: Workspace, circle: Circle, memberId: string) {
  const expected = circle.contribution * circle.cycles.length
  const paid = memberPaid(workspace, circle.id, memberId)
  return Math.max(0, expected - paid)
}

export function memberStatus(workspace: Workspace, circle: Circle, memberId: string) {
  const arrears = memberArrears(workspace, circle, memberId)
  if (arrears <= 0) return "up to date" as const
  if (arrears >= circle.contribution) return "behind" as const
  return "partial" as const
}

export function workspaceTotals(workspace: Workspace) {
  const loadedCircles = workspace.circles.map((circle) => circleStats(workspace, circle))
  const circleTotal = loadedCircles.reduce((total, circle) => total + circle.totalContributed, 0)
  const personal = workspace.goals.reduce((total, goal) => total + goal.saved, 0)
  const arrears = loadedCircles.reduce((total, circle) => total + circle.arrears, 0)
  const loans = workspace.loans.filter((loan) => loanStatus(loan) !== "settled")
  const lending = loans.reduce((total, loan) => total + Math.max(0, loanTotalDue(loan) - loan.repaid), 0)
  const expectedInterest = loans.reduce((total, loan) => total + loanInterest(loan), 0)
  const overdue = loans
    .filter((loan) => loanStatus(loan) === "overdue")
    .reduce((total, loan) => total + Math.max(0, loanTotalDue(loan) - loan.repaid), 0)

  return {
    loadedCircles,
    circleTotal,
    personal,
    totalSaved: circleTotal + personal,
    arrears,
    lending,
    expectedInterest,
    overdue,
    membersLate: workspace.members.filter((member) =>
      workspace.circles.some(
        (circle) => circle.memberIds.includes(member.id) && memberArrears(workspace, circle, member.id) > 0,
      ),
    ).length,
  }
}

export function loanRows(loans: Loan[]) {
  return loans
    .map((loan) => {
      const interest = loanInterest(loan)
      const totalDue = loanTotalDue(loan)
      return {
        ...loan,
        interest,
        totalDue,
        outstanding: Math.max(0, totalDue - loan.repaid),
        status: loanStatus(loan),
        repaidPct: Math.min(100, (loan.repaid / totalDue) * 100),
      }
    })
    .sort((a, b) => {
      const rank = { overdue: 0, partial: 1, active: 2, settled: 3 }
      return rank[a.status] - rank[b.status] || b.outstanding - a.outstanding
    })
}

export type LoanRow = ReturnType<typeof loanRows>[number]

export function budgetTotals(categories: BudgetCategory[], income: number) {
  const spent = categories.reduce((total, category) => total + category.spent, 0)
  const allocated = categories.reduce((total, category) => total + category.cap, 0)
  const unallocated = income - allocated
  const remaining = income - spent
  const unused = categories.reduce(
    (total, category) => total + Math.max(0, category.cap - category.spent),
    0,
  )
  const overspent = categories.reduce(
    (total, category) => total + Math.max(0, category.spent - category.cap),
    0,
  )
  return { spent, allocated, unallocated, remaining, unused, overspent }
}

export function bucketTotals(categories: BudgetCategory[]) {
  return categories.reduce(
    (totals, category) => {
      totals[category.bucket].cap += category.cap
      totals[category.bucket].spent += category.spent
      return totals
    },
    {
      needs: { cap: 0, spent: 0 },
      wants: { cap: 0, spent: 0 },
      savings: { cap: 0, spent: 0 },
    },
  )
}

export function usageTone(percent: number): "ok" | "warn" | "over" {
  if (percent >= 100) return "over"
  if (percent >= 78) return "warn"
  return "ok"
}

export function savingsTrend(total: number) {
  const factors = [0.43, 0.46, 0.49, 0.52, 0.55, 0.59, 0.63, 0.68, 0.73, 0.8, 0.88, 1]
  const now = new Date()
  return factors.map((factor, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (factors.length - 1 - index), 1)
    return {
      date,
      saved: Math.round(total * factor),
    }
  })
}

export function personalTrend(current: number, thisMonth: number) {
  const months = 12
  const now = new Date()
  const previous = Math.max(0, current - thisMonth)
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1)
    const saved =
      index === months - 1
        ? current
        : index === months - 2
          ? previous
          : Math.round(previous * (0.6 + 0.4 * (index / (months - 2))))
    return { date, saved }
  })
}

export function monthlyContributionSeries(workspace: Workspace) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const value = workspace.contributions
      .filter((contribution) => {
        const paid = new Date(contribution.date)
        return paid.getFullYear() === date.getFullYear() && paid.getMonth() === date.getMonth()
      })
      .reduce((total, contribution) => total + contribution.amount, 0)
    return {
      month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
      date,
      contributed: value,
    }
  })
}

export function circleMemberTotals(workspace: Workspace, circle: Circle) {
  return circle.memberIds.map((memberId) => {
    const member = workspace.members.find((item) => item.id === memberId)
    const paid = memberPaid(workspace, circle.id, memberId)
    return {
      memberId,
      name: member?.name ?? "Unknown member",
      paid,
      target: circle.contribution * circle.cycles.length,
      arrears: memberArrears(workspace, circle, memberId),
      status: memberStatus(workspace, circle, memberId),
    }
  })
}

export type ActivityItem = {
  id: string
  kind: "contribution" | "loan" | "payout"
  title: string
  detail: string
  amount: number
  date: string
  circleId?: string
  direction: "in" | "out" | "neutral"
}

export function recentActivity(workspace: Workspace, limit = 6): ActivityItem[] {
  const memberName = (id?: string) =>
    workspace.members.find((member) => member.id === id)?.name ?? "Workspace"

  const contributionItems: ActivityItem[] = workspace.contributions.map((item) => ({
    id: item.id,
    kind: "contribution",
    title: `${memberName(item.memberId)} contributed`,
    detail: workspace.circles.find((circle) => circle.id === item.circleId)?.name ?? "Circle",
    amount: item.amount,
    date: item.date,
    circleId: item.circleId,
    direction: "in",
  }))

  const loanItems: ActivityItem[] = workspace.loans.map((loan) => ({
    id: loan.id,
    kind: "loan",
    title: `Loan to ${loan.borrowerName}`,
    detail: loan.circleId
      ? workspace.circles.find((circle) => circle.id === loan.circleId)?.name ?? "Circle loan"
      : "Personal loan",
    amount: loan.principal,
    date: loan.issuedAt,
    circleId: loan.circleId,
    direction: "out",
  }))

  const payoutItems: ActivityItem[] = workspace.payouts.map((payout) => ({
    id: payout.id,
    kind: "payout",
    title: `${memberName(payout.memberId)} received the pot`,
    detail: workspace.circles.find((circle) => circle.id === payout.circleId)?.name ?? "Circle",
    amount: payout.amount,
    date: payout.date,
    circleId: payout.circleId,
    direction: "neutral",
  }))

  return [...contributionItems, ...loanItems, ...payoutItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function nextCycleLabel(circle: Circle) {
  if (circle.cadence === "weekly") return "Next Sunday"
  return "5th of next month"
}

export function vaultSummary(workspace: Workspace) {
  const saved = workspace.goals.reduce((total, goal) => total + goal.saved, 0)
  const target = workspace.goals.reduce((total, goal) => total + goal.target, 0)
  const remaining = Math.max(0, target - saved)
  const completed = workspace.goals.filter((goal) => goal.saved >= goal.target).length
  return {
    saved,
    target,
    remaining,
    completed,
    progress: target > 0 ? (saved / target) * 100 : 100,
  }
}

export function monthToDateSavings(workspace: Workspace) {
  const now = new Date()
  return workspace.vaultLog
    .filter((entry) => {
      const date = new Date(entry.date)
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    .reduce((total, entry) => total + entry.amount, 0)
}

export function vaultActivity(workspace: Workspace, limit = 6) {
  return [...workspace.vaultLog]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((entry) => {
      const goal = workspace.goals.find((item) => item.id === entry.goalId)
      return {
        ...entry,
        goalName: goal?.name ?? "Personal savings",
        reference: entry.source === "auto-save" ? "Auto-save" : entry.source === "round-up" ? "Round-up" : "Top-up",
      }
    })
}
