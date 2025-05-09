import PaymentDashboardSimple from "@/components/payments/payment-dashboard-simple"
import { HeaderWithLogout } from "@/components/header-with-logout"

export default function PaymentsSimplePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <HeaderWithLogout title="Historial de Cobros (Simple)" />
      <PaymentDashboardSimple />
    </div>
  )
}
