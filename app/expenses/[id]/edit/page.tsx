import { getExpenseById } from "@/app/expense-actions"
import EditExpenseForm from "@/components/edit-expense-form"
import { notFound } from "next/navigation"

interface EditExpensePageProps {
  params: {
    id: string
  }
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const expenseId = Number.parseInt(params.id)

  if (isNaN(expenseId)) {
    notFound()
  }

  const expense = await getExpenseById(expenseId)

  if (!expense) {
    notFound()
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <EditExpenseForm expense={expense} />
    </main>
  )
}
