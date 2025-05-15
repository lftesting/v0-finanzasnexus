"use client"

import { useState, useEffect } from "react"
import { getPayments, deletePayment, type DateFilter } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Loader2, Edit, Plus } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import PaymentFilters from "@/components/payments/payment-filters"
import type { DateRange } from "react-day-picker"

export default function PaymentDashboard() {
  const [payments, setPayments] = useState<any[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    efectivo: 0,
    transferencia: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: null as DateRange | null,
    tribe: "",
    room: "",
    paymentMethod: "",
    search: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Convertir filtros de UI a formato para la API
      const apiFilters: DateFilter = {}

      if (filters.dateRange?.from) {
        apiFilters.startDate = format(filters.dateRange.from, "yyyy-MM-dd")
      }

      if (filters.dateRange?.to) {
        apiFilters.endDate = format(filters.dateRange.to, "yyyy-MM-dd")
      }

      // Obtener datos de pagos
      let paymentsData = await getPayments(apiFilters)

      // Aplicar filtros adicionales en el cliente
      if (paymentsData && paymentsData.length > 0) {
        // Filtrar por tribu
        if (filters.tribe && filters.tribe !== "all") {
          paymentsData = paymentsData.filter(
            (payment) => payment.tribe_id && payment.tribe_id.toString() === filters.tribe,
          )
        }

        // Filtrar por habitación
        if (filters.room && filters.room !== "all") {
          paymentsData = paymentsData.filter(
            (payment) => payment.room_id && payment.room_id.toString() === filters.room,
          )
        }

        // Filtrar por método de pago
        if (filters.paymentMethod && filters.paymentMethod !== "all") {
          paymentsData = paymentsData.filter((payment) => payment.payment_method === filters.paymentMethod)
        }

        // Filtrar por búsqueda de texto
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          paymentsData = paymentsData.filter(
            (payment) =>
              (payment.tribes?.name && payment.tribes.name.toLowerCase().includes(searchLower)) ||
              (payment.rooms?.room_number && payment.rooms.room_number.toLowerCase().includes(searchLower)) ||
              (payment.comments && payment.comments.toLowerCase().includes(searchLower)),
          )
        }
      }

      // Calcular resumen basado en los datos filtrados
      const summaryData = calculateSummary(paymentsData)

      setPayments(paymentsData || [])
      setSummary(summaryData)
    } catch (error) {
      console.error("Error al cargar los datos:", error)
      setError("Ha ocurrido un error al cargar los datos. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular el resumen basado en los datos filtrados
  const calculateSummary = (data: any[]) => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        count: 0,
        efectivo: 0,
        transferencia: 0,
      }
    }

    return data.reduce(
      (summary, payment) => {
        const amount = Number(payment?.amount || 0)

        // Incrementar total y contador
        summary.total += amount
        summary.count += 1

        // Incrementar por método de pago
        if (payment.payment_method === "efectivo") {
          summary.efectivo += amount
        } else if (payment.payment_method === "transferencia") {
          summary.transferencia += amount
        }

        return summary
      },
      {
        total: 0,
        count: 0,
        efectivo: 0,
        transferencia: 0,
      },
    )
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await deletePayment(id)

      if (result.success) {
        toast({
          title: "Cobro eliminado",
          description: "El cobro ha sido eliminado correctamente.",
        })
        // Recargar los datos
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al eliminar el cobro.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar el cobro:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
        variant: "destructive",
      })
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

  const getPaymentDetails = (payment: any) => {
    if (!payment) return <div>No hay detalles disponibles</div>

    // Ensure all date fields are valid before formatting
    const hasValidEntryDate = payment?.entry_date && !isNaN(new Date(payment.entry_date).getTime())
    const hasValidEstimatedDate =
      payment?.estimated_payment_date && !isNaN(new Date(payment.estimated_payment_date).getTime())
    const hasValidActualDate = payment?.actual_payment_date && !isNaN(new Date(payment.actual_payment_date).getTime())

    return (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">Tribu:</span> {payment.tribes?.name || "Sin tribu"}
          </div>
          <div>
            <span className="font-semibold">Habitación:</span> {payment.rooms?.room_number || "Sin habitación"}
          </div>
          <div>
            <span className="font-semibold">Importe total:</span> ${Number(payment?.amount || 0).toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Alquiler:</span> ${Number(payment?.rent_amount || 0).toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Servicios:</span> ${Number(payment?.services_amount || 0).toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Método de pago:</span>{" "}
            {getPaymentMethodLabel(payment?.payment_method || "")}
          </div>
          <div>
            <span className="font-semibold">Fecha de ingreso:</span>{" "}
            {hasValidEntryDate ? format(new Date(payment.entry_date), "dd/MM/yyyy", { locale: es }) : "-"}
          </div>
          <div>
            <span className="font-semibold">Fecha estimada de pago:</span>{" "}
            {hasValidEstimatedDate
              ? format(new Date(payment.estimated_payment_date), "dd/MM/yyyy", { locale: es })
              : "-"}
          </div>
          {hasValidActualDate && (
            <div>
              <span className="font-semibold">Fecha real de pago:</span>{" "}
              {format(new Date(payment.actual_payment_date), "dd/MM/yyyy", { locale: es })}
            </div>
          )}
          {payment?.created_by && (
            <div>
              <span className="font-semibold">Creado por:</span> {payment.created_by}
            </div>
          )}
        </div>
        {payment?.comments && (
          <div>
            <span className="font-semibold">Comentarios:</span> {payment.comments}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/payments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cobro
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra los cobros por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentFilters filters={filters} setFilters={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Cobros</CardTitle>
          <CardDescription>
            {loading ? "Cargando..." : `${summary.count} cobros por un total de $${summary.total.toFixed(2)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${summary.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{summary.count} cobros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Efectivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${summary.efectivo.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transferencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${summary.transferencia.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-300">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => loadData()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-700 text-white">
          <CardTitle>Cobros registrados</CardTitle>
          <CardDescription className="text-gray-100">
            {loading ? "Cargando..." : `${payments.length} registros encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Fecha Est. Pago</TableHead>
                    <TableHead>Fecha Real Pago</TableHead>
                    <TableHead>Tribu</TableHead>
                    <TableHead>Habitación</TableHead>
                    <TableHead>Importe Total</TableHead>
                    <TableHead>Alquiler</TableHead>
                    <TableHead>Servicios</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Creado por</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments && payments.length > 0 ? (
                    payments.map((payment: any) => {
                      // Ensure all required date fields exist before formatting
                      const hasValidEntryDate = payment?.entry_date && !isNaN(new Date(payment.entry_date).getTime())
                      const hasValidEstimatedDate =
                        payment?.estimated_payment_date && !isNaN(new Date(payment.estimated_payment_date).getTime())
                      const hasValidActualDate =
                        payment?.actual_payment_date && !isNaN(new Date(payment.actual_payment_date).getTime())

                      return (
                        <TableRow key={payment?.id || Math.random().toString()}>
                          <TableCell>
                            {hasValidEntryDate
                              ? format(new Date(payment.entry_date), "dd/MM/yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {hasValidEstimatedDate
                              ? format(new Date(payment.estimated_payment_date), "dd/MM/yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {hasValidActualDate
                              ? format(new Date(payment.actual_payment_date), "dd/MM/yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell>{payment.tribes?.name || "Sin tribu"}</TableCell>
                          <TableCell>{payment.rooms?.room_number || "Sin habitación"}</TableCell>
                          <TableCell>${Number(payment?.amount || 0).toFixed(2)}</TableCell>
                          <TableCell>${Number(payment?.rent_amount || 0).toFixed(2)}</TableCell>
                          <TableCell>${Number(payment?.services_amount || 0).toFixed(2)}</TableCell>
                          <TableCell>{getPaymentMethodLabel(payment?.payment_method || "")}</TableCell>
                          <TableCell>
                            {payment?.document_urls && payment.document_urls.length > 0 ? (
                              <a
                                href={payment.document_urls[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800"
                                title="Ver documento adjunto"
                              >
                                <FileText className="h-5 w-5 mr-1" />
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{payment?.created_by || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Link href={`/payments/${payment?.id}/edit`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar cobro">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <DeleteConfirmationDialog
                                title="Eliminar cobro"
                                description="¿Estás seguro de que deseas eliminar este cobro? Esta acción no se puede deshacer."
                                onConfirm={() => handleDelete(payment?.id)}
                                triggerClassName="h-8 w-auto px-2"
                                variant="ghost"
                                itemDetails={getPaymentDetails(payment)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-10">
                        No hay cobros registrados que coincidan con los filtros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
