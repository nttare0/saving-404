import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { AppToaster } from "@/components/common/app-toaster"

export function AppShell() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="app-canvas min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-h-dvh flex-col lg:pl-[244px]">
        <Topbar />
        <MobileNav />
        <main id="main-content" className="mx-auto w-full max-w-[1160px] flex-1 px-4 pb-10 pt-5 sm:px-6 sm:pt-6 lg:px-10 lg:pb-20 lg:pt-9">
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-[1160px] px-4 pb-28 sm:px-6 lg:px-10 lg:pb-8">
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Saving 404 — steady saving, without the noise.</p>
            <p className="num">Kigali · RWF</p>
          </div>
        </footer>
      </div>
      <AppToaster />
    </div>
  )
}
