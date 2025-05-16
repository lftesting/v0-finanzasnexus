import ExpenseForm from "@/components/expense-form"
import { HeaderWithLogout } from "@/components/header-with-logout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function NewExpensePage() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 space-y-6">
        <HeaderWithLogout title="Registro de Gastos">
          <Link href="/expenses/list">
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Ver Historial
            </Button>
          </Link>
        </HeaderWithLogout>
        <ExpenseForm />
      </div>
    </AuthGuard>
  )
}
