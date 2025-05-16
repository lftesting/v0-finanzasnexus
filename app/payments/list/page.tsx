import PaymentDashboard from "@/components/payments/payment-dashboard-direct"
import { HeaderWithLogout } from "@/components/header-with-logout"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function PaymentsListPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <HeaderWithLogout title="Historial de Cobros">
          <Link href="/payments/new">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Cobro
            </Button>
          </Link>
        </HeaderWithLogout>
        <PaymentDashboard />
      </div>
    </AuthGuard>
  )
}
