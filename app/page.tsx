// Importar el componente RLSStatusChecker
import { Suspense } from "react"
import ExpensesTable from "@/components/expenses-table"
import RLSStatusChecker from "@/components/rls-status-checker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Finanzas Nexus - Dashboard</h1>

      <div className="space-y-8">
        <RLSStatusChecker />

        <Suspense fallback={<LoadingSkeleton />}>
          <ExpensesTable />
        </Suspense>
      </div>
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargando gastos...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
