import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  type BudgetCategory,
  type BudgetState,
  type Circle,
  type Contribution,
  type Framework,
  type Loan,
  type Member,
  type RolloverMode,
  type VaultEntry,
  type Workspace,
  loanTotalDue,
  seedWorkspace,
} from "@/lib/data"

const STORAGE_KEY = "saving-404:workspace:v2"
const LEGACY_STORAGE_KEY = "saving-404:workspace:v1"

type NewContribution = {
  circleId: string
  memberId: string
  amount: number
  method: Contribution["method"]
}

type NewLoan = {
  borrowerName: string
  memberId?: string
  circleId?: string
  principal: number
  ratePct: number
  termMonths: number
  purpose: string
}

type NewCircle = {
  name: string
  purpose: string
  contribution: number
  cadence: Circle["cadence"]
  memberIds: string[]
}

type NewCategory = {
  name: string
  bucket: BudgetCategory["bucket"]
  cap: number
  spent: number
  icon?: string
}

type WorkspaceContextValue = {
  workspace: Workspace
  addContribution: (input: NewContribution) => void
  addLoan: (input: NewLoan) => void
  recordRepayment: (loanId: string, amount: number) => void
  addCircle: (input: NewCircle) => void
  updateBudget: (patch: Partial<Pick<BudgetState, "monthlyIncome" | "rolloverMode" | "sweepUnused">>) => void
  setFramework: (framework: Framework) => void
  updateCategory: (id: string, patch: Partial<Omit<BudgetCategory, "id">>) => void
  addCategory: (input: NewCategory) => void
  removeCategory: (id: string) => void
  addMember: (input: Omit<Member, "id" | "tone"> & { tone?: Member["tone"] }) => void
  addToGoal: (goalId: string, amount: number) => void
  updateProfile: (patch: Partial<Workspace["profile"]>) => void
  updateVault: (patch: Partial<Workspace["vault"]>) => void
  resetWorkspace: () => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

function normalizeWorkspace(parsed: Workspace): Workspace {
  const legacySavings = parsed.budget.categories.filter(
    (category) => category.id === "circle-saving" || category.id === "personal-saving",
  )
  const categories = (legacySavings.length
    ? [
        ...parsed.budget.categories.filter(
          (category) => category.id !== "circle-saving" && category.id !== "personal-saving",
        ),
        {
          id: "vault-saving",
          name: "Savings deposits",
          bucket: "savings" as const,
          cap: legacySavings.reduce((total, category) => total + category.cap, 0),
          spent: legacySavings.reduce((total, category) => total + category.spent, 0),
          icon: "piggy-bank",
        },
      ]
    : parsed.budget.categories).map((category) =>
    category.id === "vault-saving" && category.name === "Vault deposits"
      ? { ...category, name: "Savings deposits", icon: "piggy-bank" }
      : category,
  )

  return {
    ...parsed,
    profile: {
      ...parsed.profile,
      role: parsed.profile.role === "Workspace owner" ? "Personal saver" : parsed.profile.role,
    },
    budget: { ...parsed.budget, categories },
    vault: parsed.vault ?? seedWorkspace.vault,
    vaultLog: parsed.vaultLog ?? seedWorkspace.vaultLog,
  }
}

function loadWorkspace(): Workspace {
  if (typeof window === "undefined") return seedWorkspace
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return seedWorkspace
    const parsed = JSON.parse(stored) as Workspace
    if (!parsed?.circles || !parsed?.budget?.categories) return seedWorkspace
    return normalizeWorkspace(parsed)
  } catch {
    return seedWorkspace
  }
}

function rebalance(categories: BudgetCategory[], income: number): BudgetCategory[] {
  const shares = { needs: 0.5, wants: 0.3, savings: 0.2 }
  const capsByBucket = categories.reduce(
    (totals, category) => {
      totals[category.bucket] += category.cap
      return totals
    },
    { needs: 0, wants: 0, savings: 0 },
  )

  return categories.map((category) => {
    const bucketCap = capsByBucket[category.bucket]
    const share = bucketCap > 0 ? category.cap / bucketCap : 1 / Math.max(1, categories.filter((c) => c.bucket === category.bucket).length)
    return {
      ...category,
      cap: Math.round((income * shares[category.bucket] * share) / 1000) * 1000,
    }
  })
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

const tones: Member["tone"][] = ["violet", "blue", "teal", "amber", "rose", "slate", "indigo", "emerald"]

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
    } catch {
      // Storage can be unavailable in private contexts; the in-memory session still works.
    }
  }, [workspace])

  const addContribution = useCallback((input: NewContribution) => {
    setWorkspace((current) => {
      const circle = current.circles.find((item) => item.id === input.circleId)
      if (!circle) return current
      const cycle = circle.cycles[circle.cycles.length - 1]
      const contribution: Contribution = {
        id: makeId("ct"),
        circleId: input.circleId,
        memberId: input.memberId,
        amount: Math.max(0, Math.round(input.amount)),
        date: new Date().toISOString(),
        cycleKey: cycle?.key ?? "current",
        method: input.method,
      }
      return { ...current, contributions: [...current.contributions, contribution] }
    })
  }, [])

  const addLoan = useCallback((input: NewLoan) => {
    setWorkspace((current) => {
      const issuedAt = new Date()
      const dueAt = new Date(issuedAt)
      dueAt.setMonth(dueAt.getMonth() + input.termMonths)
      const loan: Loan = {
        id: makeId("ln"),
        borrowerName: input.borrowerName,
        memberId: input.memberId,
        circleId: input.circleId,
        principal: Math.max(0, Math.round(input.principal)),
        ratePct: Math.max(0, input.ratePct),
        termMonths: Math.max(1, Math.round(input.termMonths)),
        issuedAt: issuedAt.toISOString(),
        dueAt: dueAt.toISOString(),
        repaid: 0,
        purpose: input.purpose || "Member loan",
      }
      return { ...current, loans: [loan, ...current.loans] }
    })
  }, [])

  const recordRepayment = useCallback((loanId: string, amount: number) => {
    setWorkspace((current) => ({
      ...current,
      loans: current.loans.map((loan) => {
        if (loan.id !== loanId) return loan
        const total = loanTotalDue(loan)
        return { ...loan, repaid: Math.min(total, loan.repaid + Math.max(0, Math.round(amount))) }
      }),
    }))
  }, [])

  const addCircle = useCallback((input: NewCircle) => {
    setWorkspace((current) => {
      const now = new Date()
      const cycleDate = new Date(now.getFullYear(), now.getMonth(), Math.min(5, now.getDate()))
      const id = makeId("circle")
      const circle: Circle = {
        id,
        name: input.name,
        purpose: input.purpose,
        cadence: input.cadence,
        contribution: Math.max(0, Math.round(input.contribution)),
        memberIds: input.memberIds.length ? input.memberIds : [current.members[0]?.id ?? "amara"],
        adminId: "amara",
        color: ["violet", "blue", "emerald", "amber"][current.circles.length % 4],
        startedAt: now.toISOString(),
        cycles: [
          {
            key: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
            label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(now),
            date: cycleDate.toISOString(),
          },
        ],
        nextPayout: {
          memberId: input.memberIds[0] ?? "amara",
          date: new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString(),
          amount: Math.round(input.contribution * input.memberIds.length),
        },
        meeting: input.cadence === "weekly" ? "Every Sunday · 16:00" : "First Saturday · 10:00",
        status: "forming",
      }
      return { ...current, circles: [...current.circles, circle] }
    })
  }, [])

  const updateBudget = useCallback(
    (patch: Partial<Pick<BudgetState, "monthlyIncome" | "rolloverMode" | "sweepUnused">>) => {
      setWorkspace((current) => ({
        ...current,
        budget: { ...current.budget, ...patch },
      }))
    },
    [],
  )

  const setFramework = useCallback((framework: Framework) => {
    setWorkspace((current) => ({
      ...current,
      budget: {
        ...current.budget,
        framework,
        categories:
          framework === "50/30/20"
            ? rebalance(current.budget.categories, current.budget.monthlyIncome)
            : current.budget.categories,
      },
    }))
  }, [])

  const updateCategory = useCallback((id: string, patch: Partial<Omit<BudgetCategory, "id">>) => {
    setWorkspace((current) => ({
      ...current,
      budget: {
        ...current.budget,
        categories: current.budget.categories.map((category) =>
          category.id === id ? { ...category, ...patch } : category,
        ),
      },
    }))
  }, [])

  const addCategory = useCallback((input: NewCategory) => {
    setWorkspace((current) => ({
      ...current,
      budget: {
        ...current.budget,
        categories: [
          ...current.budget.categories,
          {
            id: makeId("cat"),
            name: input.name,
            bucket: input.bucket,
            cap: Math.max(0, Math.round(input.cap)),
            spent: Math.max(0, Math.round(input.spent)),
            icon: input.icon ?? "wallet",
          },
        ],
      },
    }))
  }, [])

  const removeCategory = useCallback((id: string) => {
    setWorkspace((current) => ({
      ...current,
      budget: {
        ...current.budget,
        categories: current.budget.categories.filter((category) => category.id !== id),
      },
    }))
  }, [])

  const addMember = useCallback((input: Omit<Member, "id" | "tone"> & { tone?: Member["tone"] }) => {
    setWorkspace((current) => {
      const id = makeId("member")
      const member: Member = {
        id,
        name: input.name,
        phone: input.phone,
        tone: input.tone ?? tones[current.members.length % tones.length],
      }
      return { ...current, members: [...current.members, member] }
    })
  }, [])

  const addToGoal = useCallback((goalId: string, amount: number) => {
    setWorkspace((current) => {
      const goal = current.goals.find((item) => item.id === goalId)
      if (!goal) return current
      const rounded = Math.max(0, Math.round(amount))
      const applied = Math.min(rounded, Math.max(0, goal.target - goal.saved))
      if (applied <= 0) return current
      const entry: VaultEntry = {
        id: makeId("vx"),
        goalId,
        amount: applied,
        date: new Date().toISOString(),
        source: "top-up",
      }
      return {
        ...current,
        goals: current.goals.map((item) =>
          item.id === goalId ? { ...item, saved: item.saved + applied } : item,
        ),
        vaultLog: [entry, ...current.vaultLog],
      }
    })
  }, [])

  const updateProfile = useCallback((patch: Partial<Workspace["profile"]>) => {
    setWorkspace((current) => ({
      ...current,
      profile: { ...current.profile, ...patch },
    }))
  }, [])

  const updateVault = useCallback((patch: Partial<Workspace["vault"]>) => {
    setWorkspace((current) => ({
      ...current,
      vault: { ...current.vault, ...patch },
    }))
  }, [])

  const resetWorkspace = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setWorkspace(seedWorkspace)
  }, [])

  const value = useMemo(
    () => ({
      workspace,
      addContribution,
      addLoan,
      recordRepayment,
      addCircle,
      updateBudget,
      setFramework,
      updateCategory,
      addCategory,
      removeCategory,
      addMember,
      addToGoal,
      updateProfile,
      updateVault,
      resetWorkspace,
    }),
    [
      workspace,
      addContribution,
      addLoan,
      recordRepayment,
      addCircle,
      updateBudget,
      setFramework,
      updateCategory,
      addCategory,
      removeCategory,
      addMember,
      addToGoal,
      updateProfile,
      updateVault,
      resetWorkspace,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider")
  return context
}

export type { NewCategory, NewCircle, NewContribution, NewLoan, RolloverMode }
