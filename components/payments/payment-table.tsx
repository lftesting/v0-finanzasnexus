"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { PaymentDetailDialog } from "./payment-detail-dialog"
import type { Payment } from "@/types/payment"

interface PaymentTableProps {
  payments: Payment[]
  loading: boolean
}

export default function PaymentTable({ payments, loading }: PaymentTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("payments").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Cobro eliminado",
        description: "El cobro ha sido eliminado correctamente.",
      })

      // Recargar la página para actualizar la lista
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar el cobro:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cobro. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      console.error("Error al formatear la fecha:", error)
      return "Fecha inválida"
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "efectivo":
        return "Efectivo"
      case "transferencia":
        return "Transferencia"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-pulse flex flex-col w-full max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-lg font-medium">No se encontraron cobros</h3>
        <p className="text-muted-foreground mt-2">
          No hay cobros que coincidan con los criterios de búsqueda o no se han registrado cobros aún.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Alquiler</TableHead>
              <TableHead className="text-right">Servicios</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{formatDate(payment.date)}</TableCell>
                <TableCell>{payment.client.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(payment.rent_amount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(payment.services_amount)}</TableCell>
                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getPaymentMethodLabel(payment.payment_method)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedPayment(payment)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalles</span>
                    </Button>
                    <Link href={`/payments/${payment.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedPayment(payment)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPayment && (
        <>
          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={() => handleDelete(selectedPayment.id)}
            title="Eliminar cobro"
            description={`¿Está seguro que desea eliminar el cobro de ${formatCurrency(
              selectedPayment.amount,
            )} para ${selectedPayment.client.name}?`}
          />

          <PaymentDetailDialog
            isOpen={isDetailDialogOpen}
            onClose={() => setIsDetailDialogOpen(false)}
            payment={selectedPayment}
          />
        </>
      )}
    </>
  )
}
