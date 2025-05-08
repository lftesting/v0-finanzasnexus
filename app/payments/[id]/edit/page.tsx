import { getPaymentById } from "@/app/actions"
import EditPaymentForm from "@/components/edit-payment-form"
import { notFound } from "next/navigation"

interface EditPaymentPageProps {
  params: {
    id: string
  }
}

export default async function EditPaymentPage({ params }: EditPaymentPageProps) {
  const paymentId = Number.parseInt(params.id)

  if (isNaN(paymentId)) {
    notFound()
  }

  const payment = await getPaymentById(paymentId)

  if (!payment) {
    notFound()
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <EditPaymentForm payment={payment} />
    </main>
  )
}
