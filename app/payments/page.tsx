import PaymentDashboard from "@/components/payments/payment-dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de cobros</h1>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Volver a Inicio
          </Button>
        </Link>
      </div>
      <PaymentDashboard />
    </div>
  )
}
