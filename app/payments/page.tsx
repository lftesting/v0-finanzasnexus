import PaymentDashboard from "@/components/payments/payment-dashboard"

export default function PaymentsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de cobros</h1>
      <PaymentDashboard />
    </div>
  )
}
