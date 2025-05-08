import { Suspense } from "react"
import PaymentDashboard from "@/components/payments/payment-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { HeaderWithLogout } from "@/components/header-with-logout"

export const metadata = {
  title: "Nexus - Gestión de Cobros",
  description: "Dashboard para la gestión de cobros en Nexus",
}

export default function PaymentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <HeaderWithLogout title="Gestión de Cobros" />

      <Suspense fallback={<DashboardSkeleton />}>
        <PaymentDashboard />
      </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px] ml-auto" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  )
}
