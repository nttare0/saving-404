import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Plus } from "lucide-react"
import { primaryNav, secondaryNav, type NavItem } from "@/components/layout/nav-config"
import { GoalDialog } from "@/components/dialogs/goal-dialog"
import { cn } from "@/lib/utils"

function MobileTab({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          "flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 pb-1.5 pt-1 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          isActive ? "text-primary" : "text-muted-foreground active:text-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              isActive && "bg-primary/10",
            )}
          >
            <item.icon className="size-[19px]" strokeWidth={isActive ? 2 : 1.8} />
          </span>
          <span className="w-full truncate text-center">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function MobileNav() {
  const [saveOpen, setSaveOpen] = useState(false)
  const tabs = [...primaryNav, ...secondaryNav]
  const left = tabs.slice(0, 2)
  const right = tabs.slice(2)

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-24px_rgb(17_12_28/0.35)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-[520px] grid-cols-5 items-end gap-0.5 px-2 pt-1">
          {left.map((item) => (
            <MobileTab key={item.to} item={item} />
          ))}

          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            aria-label="Save money"
            className="group flex min-w-0 flex-col items-center gap-0.5 pb-1.5 focus-visible:outline-none"
          >
            <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_-10px_var(--primary)] ring-4 ring-background transition-transform active:scale-95 group-focus-visible:ring-ring/40">
              <Plus className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-[10px] font-semibold text-primary">Save</span>
          </button>

          {right.map((item) => (
            <MobileTab key={item.to} item={item} />
          ))}
        </div>
      </nav>

      <GoalDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  )
}
