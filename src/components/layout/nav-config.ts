import { HandCoins, LayoutDashboard, Settings2, UsersRound, Vault, WalletCards, type LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  description: string
}

export const primaryNav: NavItem[] = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true, description: "Your money at a glance" },
  { label: "Circles", to: "/circles", icon: UsersRound, description: "Save together with people you trust" },
  { label: "Loans", to: "/loans", icon: HandCoins, description: "Lending, interest and repayments" },
  { label: "Budget", to: "/budget", icon: WalletCards, description: "Caps, rollovers and spending" },
  { label: "My vault", to: "/vault", icon: Vault, description: "Personal savings and goals" },
]

export const secondaryNav: NavItem[] = [
  { label: "Settings", to: "/settings", icon: Settings2, description: "Profile and preferences" },
]

export const allNav = [...primaryNav, ...secondaryNav]
