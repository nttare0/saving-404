export type Cadence = "weekly" | "monthly"
export type Bucket = "needs" | "wants" | "savings"
export type Framework = "50/30/20" | "zero-based"
export type RolloverMode = "rollover" | "sweep"
export type LoanStatus = "active" | "partial" | "overdue" | "settled"

export type Member = {
  id: string
  name: string
  phone: string
  tone: "violet" | "blue" | "teal" | "amber" | "rose" | "slate" | "indigo" | "emerald"
}

export type Cycle = {
  key: string
  label: string
  date: string
}

export type Circle = {
  id: string
  name: string
  purpose: string
  cadence: Cadence
  contribution: number
  memberIds: string[]
  adminId: string
  color: string
  startedAt: string
  cycles: Cycle[]
  nextPayout: { memberId: string; date: string; amount: number }
  meeting: string
  status: "active" | "forming"
}

export type Contribution = {
  id: string
  circleId: string
  memberId: string
  amount: number
  date: string
  cycleKey: string
  method: "Mobile money" | "Bank transfer" | "Cash"
}

export type Payout = {
  id: string
  circleId: string
  memberId: string
  amount: number
  date: string
}

export type Loan = {
  id: string
  borrowerName: string
  memberId?: string
  circleId?: string
  principal: number
  ratePct: number
  termMonths: number
  issuedAt: string
  dueAt: string
  repaid: number
  purpose: string
}

export type BudgetCategory = {
  id: string
  name: string
  bucket: Bucket
  cap: number
  spent: number
  icon: string
  rolloverFrom?: number
}

export type Goal = {
  id: string
  name: string
  target: number
  saved: number
  deadline: string
  icon: string
}

export type BudgetState = {
  monthlyIncome: number
  framework: Framework
  rolloverMode: RolloverMode
  sweepUnused: boolean
  categories: BudgetCategory[]
}

export type VaultSettings = {
  autoSave: boolean
  monthlyAmount: number
  roundUp: boolean
}

export type Workspace = {
  profile: {
    name: string
    firstName: string
    email: string
    phone: string
    role: string
  }
  members: Member[]
  circles: Circle[]
  contributions: Contribution[]
  payouts: Payout[]
  loans: Loan[]
  budget: BudgetState
  goals: Goal[]
  vault: VaultSettings
}

export const TODAY = new Date()

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate())
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function iso(date: Date) {
  return date.toISOString()
}

function monthCycle(date: Date, index: number): Cycle {
  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(date),
    date: iso(new Date(date.getFullYear(), date.getMonth(), 5 + (index % 3))),
  }
}

const members: Member[] = [
  { id: "amara", name: "Amara Nkusi", phone: "+250 788 120 404", tone: "violet" },
  { id: "claudine", name: "Claudine Mutesi", phone: "+250 788 330 218", tone: "blue" },
  { id: "eric", name: "Eric Kamanzi", phone: "+250 788 604 912", tone: "amber" },
  { id: "sandrine", name: "Sandrine Uwase", phone: "+250 788 221 776", tone: "rose" },
  { id: "patrick", name: "Patrick Habimana", phone: "+250 788 410 552", tone: "teal" },
  { id: "diane", name: "Diane Ingabire", phone: "+250 788 990 031", tone: "indigo" },
  { id: "joseph", name: "Joseph Rurangwa", phone: "+250 788 771 209", tone: "emerald" },
  { id: "yvette", name: "Yvette Gasana", phone: "+250 788 512 845", tone: "slate" },
  { id: "kevin", name: "Kevin Mugisha", phone: "+250 788 145 630", tone: "blue" },
  { id: "teta", name: "Teta Umutoni", phone: "+250 788 873 004", tone: "rose" },
  { id: "bruno", name: "Bruno Ndayisaba", phone: "+250 788 302 441", tone: "teal" },
  { id: "ineza", name: "Ineza Mutoni", phone: "+250 788 660 129", tone: "indigo" },
  { id: "samuel", name: "Samuel Nkurunziza", phone: "+250 788 481 233", tone: "amber" },
  { id: "mama", name: "Mama Odette", phone: "+250 788 200 118", tone: "violet" },
  { id: "papa", name: "Papa Augustin", phone: "+250 788 200 119", tone: "slate" },
  { id: "divine", name: "Divine Nkusi", phone: "+250 788 200 120", tone: "emerald" },
]

const thisMonth = startOfMonth(TODAY)

const circleMonths = Array.from({ length: 6 }, (_, index) =>
  monthCycle(addMonths(thisMonth, index - 5), index),
)

const familyMonths = Array.from({ length: 4 }, (_, index) =>
  monthCycle(addMonths(thisMonth, index - 4), index),
)

const sunday = new Date(TODAY)
sunday.setDate(sunday.getDate() - sunday.getDay())
const weeklyCycles: Cycle[] = Array.from({ length: 12 }, (_, index) => {
  const date = addDays(sunday, (index - 11) * 7)
  return {
    key: `w-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
    label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date),
    date: iso(date),
  }
})

const circles: Circle[] = [
  {
    id: "umuganda",
    name: "Umuganda Circle",
    purpose: "Neighbourhood savings and low-interest member loans.",
    cadence: "monthly",
    contribution: 100_000,
    memberIds: ["amara", "claudine", "eric", "sandrine", "patrick", "diane", "joseph", "yvette"],
    adminId: "amara",
    color: "violet",
    startedAt: iso(addMonths(thisMonth, -5)),
    cycles: circleMonths,
    nextPayout: {
      memberId: "amara",
      date: iso(addMonths(thisMonth, 1)),
      amount: 800_000,
    },
    meeting: "First Saturday · 10:00",
    status: "active",
  },
  {
    id: "hustlers",
    name: "Kigali Hustlers",
    purpose: "Weekly float for small businesses and stock purchases.",
    cadence: "weekly",
    contribution: 25_000,
    memberIds: ["amara", "kevin", "teta", "bruno", "ineza", "samuel"],
    adminId: "kevin",
    color: "blue",
    startedAt: iso(addDays(sunday, -77)),
    cycles: weeklyCycles,
    nextPayout: {
      memberId: "amara",
      date: iso(addDays(sunday, 7)),
      amount: 150_000,
    },
    meeting: "Every Sunday · 16:00",
    status: "active",
  },
  {
    id: "family",
    name: "Family Future Fund",
    purpose: "A quiet fund for school fees and family milestones.",
    cadence: "monthly",
    contribution: 100_000,
    memberIds: ["amara", "mama", "papa", "divine"],
    adminId: "mama",
    color: "emerald",
    startedAt: iso(addMonths(thisMonth, -4)),
    cycles: familyMonths,
    nextPayout: {
      memberId: "mama",
      date: iso(addMonths(thisMonth, 2)),
      amount: 400_000,
    },
    meeting: "Last Sunday · 18:00",
    status: "active",
  },
]

const patterns: Record<string, Record<string, number[]>> = {
  umuganda: {
    amara: [1, 1, 1, 1, 1, 1],
    claudine: [1, 1, 1, 1, 1, 1],
    eric: [1, 1, 0, 1, 1, 0],
    sandrine: [1, 1, 1, 1, 1, 0.5],
    patrick: [1, 1, 1, 1, 1, 1],
    diane: [1, 1, 1, 1, 1, 1],
    joseph: [1, 0, 1, 1, 1, 1],
    yvette: [1, 1, 1, 1, 1, 1],
  },
  hustlers: {
    amara: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    kevin: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    teta: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    bruno: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    ineza: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    samuel: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  },
  family: {
    amara: [1, 1, 1, 1],
    mama: [1, 1, 1, 1],
    papa: [1, 1, 1, 1],
    divine: [1, 1, 1, 0],
  },
}

const methods: Contribution["method"][] = ["Mobile money", "Bank transfer", "Cash"]

const contributions: Contribution[] = circles.flatMap((circle) =>
  circle.memberIds.flatMap((memberId, memberIndex) => {
    const pattern = patterns[circle.id]?.[memberId] ?? circle.cycles.map(() => 1)
    return circle.cycles.flatMap((cycle, cycleIndex) => {
      const factor = pattern[cycleIndex] ?? 0
      if (!factor) return []
      return [
        {
          id: `ct-${circle.id}-${memberId}-${cycle.key}`,
          circleId: circle.id,
          memberId,
          amount: Math.round(circle.contribution * factor),
          date: cycle.date,
          cycleKey: cycle.key,
          method: methods[(memberIndex + cycleIndex) % methods.length],
        } satisfies Contribution,
      ]
    })
  }),
)

const payouts: Payout[] = [
  {
    id: "po-umuganda-oct",
    circleId: "umuganda",
    memberId: "claudine",
    amount: 800_000,
    date: iso(addMonths(thisMonth, -1)),
  },
  {
    id: "po-umuganda-sep",
    circleId: "umuganda",
    memberId: "joseph",
    amount: 800_000,
    date: iso(addMonths(thisMonth, -2)),
  },
  {
    id: "po-hustlers-nov",
    circleId: "hustlers",
    memberId: "teta",
    amount: 150_000,
    date: iso(addDays(sunday, -3)),
  },
  {
    id: "po-family-oct",
    circleId: "family",
    memberId: "papa",
    amount: 400_000,
    date: iso(addMonths(thisMonth, -1)),
  },
]

const loans: Loan[] = [
  {
    id: "ln-eric",
    borrowerName: "Eric Kamanzi",
    memberId: "eric",
    circleId: "umuganda",
    principal: 300_000,
    ratePct: 12,
    termMonths: 3,
    issuedAt: iso(addMonths(TODAY, -3)),
    dueAt: iso(addDays(TODAY, -3)),
    repaid: 180_000,
    purpose: "Extra stock for the shop",
  },
  {
    id: "ln-sandrine",
    borrowerName: "Sandrine Uwase",
    memberId: "sandrine",
    circleId: "umuganda",
    principal: 150_000,
    ratePct: 10,
    termMonths: 4,
    issuedAt: iso(addMonths(TODAY, -2)),
    dueAt: iso(addMonths(TODAY, 2)),
    repaid: 40_000,
    purpose: "Tailoring supplies",
  },
  {
    id: "ln-patrick",
    borrowerName: "Patrick Habimana",
    memberId: "patrick",
    circleId: "umuganda",
    principal: 240_000,
    ratePct: 10,
    termMonths: 3,
    issuedAt: iso(addMonths(TODAY, -5)),
    dueAt: iso(addMonths(TODAY, -2)),
    repaid: 246_000,
    purpose: "School fees bridge",
  },
  {
    id: "ln-diane",
    borrowerName: "Diane Ingabire",
    memberId: "diane",
    circleId: "umuganda",
    principal: 120_000,
    ratePct: 10,
    termMonths: 3,
    issuedAt: iso(addMonths(TODAY, -1)),
    dueAt: iso(addMonths(TODAY, 2)),
    repaid: 40_000,
    purpose: "Market stall deposit",
  },
  {
    id: "ln-kevin",
    borrowerName: "Kevin Mugisha",
    circleId: "hustlers",
    principal: 250_000,
    ratePct: 15,
    termMonths: 6,
    issuedAt: iso(addMonths(TODAY, -5)),
    dueAt: iso(addMonths(TODAY, 1)),
    repaid: 100_000,
    purpose: "Boda repair and insurance",
  },
  {
    id: "ln-teta",
    borrowerName: "Teta Umutoni",
    memberId: "teta",
    circleId: "hustlers",
    principal: 200_000,
    ratePct: 10,
    termMonths: 3,
    issuedAt: iso(addMonths(TODAY, -1)),
    dueAt: iso(addMonths(TODAY, 2)),
    repaid: 0,
    purpose: "Wholesale fabric order",
  },
]

const budget: BudgetState = {
  monthlyIncome: 1_650_000,
  framework: "50/30/20",
  rolloverMode: "rollover",
  sweepUnused: true,
  categories: [
    { id: "rent", name: "Rent", bucket: "needs", cap: 420_000, spent: 420_000, icon: "home" },
    { id: "groceries", name: "Groceries", bucket: "needs", cap: 210_000, spent: 168_400, icon: "shopping-basket" },
    { id: "transport", name: "Transport", bucket: "needs", cap: 95_000, spent: 71_300, icon: "bus" },
    { id: "utilities", name: "Utilities", bucket: "needs", cap: 100_000, spent: 82_200, icon: "zap" },
    { id: "dining", name: "Dining out", bucket: "wants", cap: 85_000, spent: 72_400, icon: "utensils" },
    { id: "shopping", name: "Shopping", bucket: "wants", cap: 160_000, spent: 139_000, icon: "shirt" },
    { id: "entertainment", name: "Entertainment", bucket: "wants", cap: 100_000, spent: 41_000, icon: "sparkles" },
    { id: "misc", name: "Data & misc", bucket: "wants", cap: 150_000, spent: 96_000, icon: "smartphone" },
    { id: "circle-saving", name: "Circle contributions", bucket: "savings", cap: 200_000, spent: 200_000, icon: "users" },
    { id: "personal-saving", name: "Personal vault", bucket: "savings", cap: 80_000, spent: 80_000, icon: "vault" },
    { id: "emergency", name: "Emergency fund", bucket: "savings", cap: 50_000, spent: 30_000, icon: "shield" },
  ],
}

const goals: Goal[] = [
  { id: "emergency", name: "Emergency fund", target: 2_000_000, saved: 1_250_000, deadline: iso(addMonths(TODAY, 4)), icon: "shield" },
  { id: "laptop", name: "New laptop", target: 1_200_000, saved: 430_000, deadline: iso(addMonths(TODAY, 6)), icon: "laptop" },
  { id: "trip", name: "Nairobi trip", target: 800_000, saved: 180_000, deadline: iso(addMonths(TODAY, 9)), icon: "plane" },
]

export const seedWorkspace: Workspace = {
  profile: {
    name: "Amara Nkusi",
    firstName: "Amara",
    email: "amara@example.rw",
    phone: "+250 788 120 404",
    role: "Workspace owner",
  },
  members,
  circles,
  contributions,
  payouts,
  loans,
  budget,
  goals,
  vault: {
    autoSave: true,
    monthlyAmount: 150_000,
    roundUp: true,
  },
}

export function loanInterest(loan: Pick<Loan, "principal" | "ratePct" | "termMonths">) {
  return Math.round(loan.principal * (loan.ratePct / 100) * (loan.termMonths / 12))
}

export function loanTotalDue(loan: Pick<Loan, "principal" | "ratePct" | "termMonths">) {
  return loan.principal + loanInterest(loan)
}

export function loanStatus(loan: Loan, reference = TODAY): LoanStatus {
  const total = loanTotalDue(loan)
  if (loan.repaid >= total) return "settled"
  if (new Date(loan.dueAt).getTime() < reference.getTime()) return "overdue"
  if (loan.repaid > 0) return "partial"
  return "active"
}
