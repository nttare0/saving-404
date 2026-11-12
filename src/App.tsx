import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { WorkspaceProvider } from "@/store/workspace"
import { AppShell } from "@/components/layout/app-shell"
import { RouteEffects } from "@/components/layout/route-effects"
import { OverviewPage } from "@/pages/overview"
import { CirclesPage } from "@/pages/circles"
import { CircleDetailPage } from "@/pages/circle-detail"
import { LoansPage } from "@/pages/loans"
import { BudgetPage } from "@/pages/budget"
import { VaultPage } from "@/pages/vault"
import { SettingsPage } from "@/pages/settings"
import { NotFoundPage } from "@/pages/not-found"

export function AppRoutes() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="circles" element={<CirclesPage />} />
          <Route path="circles/:circleId" element={<CircleDetailPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </WorkspaceProvider>
    </ThemeProvider>
  )
}
