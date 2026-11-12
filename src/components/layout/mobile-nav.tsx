import { NavLink } from "react-router-dom"
import { primaryNav, secondaryNav } from "@/components/layout/nav-config"
import { cn } from "@/lib/utils"

export function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-16 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:hidden"
    >
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto px-3 py-2">
        {[...primaryNav, ...secondaryNav].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )
            }
          >
            <item.icon className="size-3.5" strokeWidth={1.9} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
