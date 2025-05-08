import PaymentForm from "@/components/payment-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import { HeaderWithLogout } from "@/components/header-with-logout"

export default function NewPaymentPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <HeaderWithLogout title="Registro de Cobros">
        <Link href="/payments">
          <Button>
            <ListFilter className="mr-2 h-4 w-4" />
            Ver cobros registrados
          </Button>
        </Link>
      </HeaderWithLogout>
      <PaymentForm />
    </main>
  )
}
