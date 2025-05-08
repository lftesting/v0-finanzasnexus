import ExpenseForm from "@/components/expense-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import { HeaderWithLogout } from "@/components/header-with-logout"

export default function NewExpensePage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <HeaderWithLogout title="Registro de Gastos">
        <Link href="/expenses/list">
          <Button>
            <ListFilter className="mr-2 h-4 w-4" />
            Ver gastos registrados
          </Button>
        </Link>
      </HeaderWithLogout>
      <ExpenseForm />
    </main>
  )
}
