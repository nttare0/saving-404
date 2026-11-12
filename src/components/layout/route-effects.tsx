import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { allNav } from "@/components/layout/nav-config"
import { useWorkspace } from "@/store/workspace"

export function RouteEffects() {
  const { pathname } = useLocation()
  const { workspace } = useWorkspace()

  useEffect(() => {
    const circleId = pathname.startsWith("/circles/") ? pathname.split("/")[2] : null
    const circle = workspace.circles.find((item) => item.id === circleId)
    const nav = allNav.find(
      (item) => (item.end ? pathname === item.to : pathname.startsWith(item.to) && item.to !== "/"),
    )
    const title = circle ? circle.name : pathname === "/" ? "Overview" : nav?.label ?? "Page not found"

    document.title = `${title} · Saving 404`
  }, [pathname, workspace.circles])

  return null
}
