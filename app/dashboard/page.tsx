import { HeaderWithLogout } from "@/components/header-with-logout"
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard"

export default function DashboardPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <HeaderWithLogout title="Dashboard Analítico" />
      <div className="mt-6">
        <AnalyticsDashboard />
      </div>
    </main>
  )
}
