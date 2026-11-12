import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { allNav } from "@/components/layout/nav-config"

export function RouteEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    const nav = allNav.find(
      (item) => (item.end ? pathname === item.to : pathname.startsWith(item.to) && item.to !== "/"),
    )
    document.title = `${nav?.label ?? "Page not found"} · Saving 404`
  }, [pathname])

  return null
}
