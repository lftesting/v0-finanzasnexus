import PaymentDashboard from "@/components/payments/payment-dashboard-direct"
import { HeaderWithLogout } from "@/components/header-with-logout"
import { AuthGuard } from "@/components/auth-guard"

export default function PaymentsListPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <HeaderWithLogout title="Historial de Cobros" />
        <PaymentDashboard />
      </div>
    </AuthGuard>
  )
}
