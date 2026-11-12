import {
  HandCoins,
  LayoutDashboard,
  Settings2,
  UsersRound,
  Vault,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import { GROUP_SAVING_ENABLED } from "@/lib/features"

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
  description: string
  group?: "personal" | "shared"
}

const personalNav: NavItem[] = [
  { label: "Overview", to: "/", icon: LayoutDashboard, end: true, description: "Your money at a glance" },
  { label: "My vault", to: "/vault", icon: Vault, description: "Personal savings and goals" },
  { label: "Budget", to: "/budget", icon: WalletCards, description: "Caps, rollovers and spending" },
]

const sharedNav: NavItem[] = [
  { label: "Circles", to: "/circles", icon: UsersRound, description: "Save together with people you trust", group: "shared" },
  { label: "Loans", to: "/loans", icon: HandCoins, description: "Lending, interest and repayments", group: "shared" },
]

export const primaryNav: NavItem[] = GROUP_SAVING_ENABLED ? [...personalNav, ...sharedNav] : personalNav

export const secondaryNav: NavItem[] = [
  { label: "Settings", to: "/settings", icon: Settings2, description: "Profile and preferences" },
]

export const allNav = [...primaryNav, ...secondaryNav]
