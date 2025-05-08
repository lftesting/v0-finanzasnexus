"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Payment } from "@/types/payment"

interface PaymentDetailDialogProps {
  payment: Payment
  isOpen: boolean
  onClose: () => void
}

export function PaymentDetailDialog({ payment, isOpen, onClose }: PaymentDetailDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Cobro</DialogTitle>
          <DialogDescription>
            Cobro realizado el {formatDate(payment.date)} para {payment.client.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Fecha de entrada</h4>
              <p className="text-sm">{formatDate(payment.date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Fecha estimada de pago</h4>
              <p className="text-sm">{formatDate(payment.due_date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Fecha de pago</h4>
              <p className="text-sm">{formatDate(payment.payment_date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Método de pago</h4>
              <p className="text-sm">{getPaymentMethodLabel(payment.payment_method)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Cliente</h4>
              <p className="text-sm">{payment.client.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Estado</h4>
              <p className="text-sm">{payment.status === "paid" ? "Pagado" : "Pendiente"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium">Alquiler</h4>
              <p className="text-sm">{formatCurrency(payment.rent_amount)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Servicios</h4>
              <p className="text-sm">{formatCurrency(payment.services_amount)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Total</h4>
              <p className="text-sm font-bold">{formatCurrency(payment.amount)}</p>
            </div>
          </div>

          {payment.description && (
            <div>
              <h4 className="text-sm font-medium">Descripción</h4>
              <p className="text-sm">{payment.description}</p>
            </div>
          )}

          {payment.document_urls && payment.document_urls.length > 0 && (
            <div>
              <h4 className="text-sm font-medium">Documentos</h4>
              <div className="flex flex-col gap-2 mt-1">
                {payment.document_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver documento {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
