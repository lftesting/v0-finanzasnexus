"use client"

import { useState, useEffect } from "react"
import { getExpenses, getExpensesSummary, deleteExpense, type DateFilter } from "@/app/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, ExternalLink, Loader2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DateRangeFilter, DateRangePresets } from "@/components/date-range-filter"
import { ExpenseSummary } from "@/components/expense-summary"
import { HeaderWithLogout } from "@/components/header-with-logout"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ExpensesListPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    debito: 0,
    pendientes: 0,
    pagados: 0,
  })
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState<DateFilter>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData(currentFilter)
  }, [])

  const loadData = async (filters?: DateFilter) => {
    setLoading(true)
    setError(null)
    try {
      // Wrap each promise in a try/catch to handle individual failures
      let expensesData: any[] = []
      let summaryData = {
        total: 0,
        count: 0,
        efectivo: 0,
        tarjeta: 0,
        transferencia: 0,
        debito: 0,
        pendientes: 0,
        pagados: 0,
      }

      try {
        expensesData = await getExpenses(filters)
        console.log("Expenses data loaded:", expensesData.length, "records")
      } catch (expensesError) {
        console.error("Error loading expenses data:", expensesError)
        setError("Error al cargar los gastos. Por favor, intente nuevamente.")
      }

      try {
        summaryData = await getExpensesSummary(filters)
        console.log("Summary data loaded successfully")
      } catch (summaryError) {
        console.error("Error loading summary data:", summaryError)
        // Continue with default summary values
      }

      setExpenses(expensesData || [])
      setSummary(summaryData)
    } catch (error) {
      console.error("Error general al cargar los datos:", error)
      setError("Ha ocurrido un error al cargar los datos. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (filter: DateFilter) => {
    setCurrentFilter(filter)
    loadData(filter)
  }

  const handlePresetFilter = (preset: string) => {
    // La lógica de filtrado por presets está en el componente
    const dateRangeFilter = document.querySelector("date-range-filter") as any
    if (dateRangeFilter && dateRangeFilter.applyPresetFilter) {
      dateRangeFilter.applyPresetFilter(preset)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteExpense(id)

      if (result.success) {
        toast({
          title: "Gasto eliminado",
          description: "El gasto ha sido eliminado correctamente.",
        })
        // Recargar los datos
        loadData(currentFilter)
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al eliminar el gasto.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar el gasto:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "pagado":
        return <Badge variant="success">Pagado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "efectivo":
        return "Efectivo"
      case "transferencia":
        return "Transferencia"
      case "tarjeta_credito":
        return "Tarjeta Crédito"
      case "tarjeta_debito":
        return "Tarjeta Débito"
      default:
        return method
    }
  }

  const getExpenseDetails = (expense: any) => {
    if (!expense) return <div>No hay detalles disponibles</div>

    // Ensure all date fields are valid before formatting
    const hasValidDate = expense?.date && !isNaN(new Date(expense.date).getTime())
    const hasValidDueDate = expense?.due_date && !isNaN(new Date(expense.due_date).getTime())
    const hasValidPaymentDate = expense?.payment_date && !isNaN(new Date(expense.payment_date).getTime())

    return (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">Proveedor:</span> {expense.suppliers?.name || "Sin proveedor"}
          </div>
          <div>
            <span className="font-semibold">Categoría:</span> {expense.expense_categories?.name || "Sin categoría"}
          </div>
          <div>
            <span className="font-semibold">Importe:</span> ${Number(expense?.amount || 0).toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Estado:</span> {expense?.status === "pendiente" ? "Pendiente" : "Pagado"}
          </div>
          <div>
            <span className="font-semibold">Método de pago:</span>{" "}
            {getPaymentMethodLabel(expense?.payment_method || "")}
          </div>
          <div>
            <span className="font-semibold">Fecha:</span>{" "}
            {hasValidDate ? format(new Date(expense.date), "dd/MM/yyyy", { locale: es }) : "-"}
          </div>
          <div>
            <span className="font-semibold">Vencimiento:</span>{" "}
            {hasValidDueDate ? format(new Date(expense.due_date), "dd/MM/yyyy", { locale: es }) : "-"}
          </div>
          {hasValidPaymentDate && (
            <div>
              <span className="font-semibold">Fecha de pago:</span>{" "}
              {format(new Date(expense.payment_date), "dd/MM/yyyy", { locale: es })}
            </div>
          )}
          {expense?.invoice_number && (
            <div>
              <span className="font-semibold">Factura:</span> {expense.invoice_number}
            </div>
          )}
          {expense?.created_by && (
            <div>
              <span className="font-semibold">Creado por:</span> {expense.created_by}
            </div>
          )}
        </div>
        {expense?.description && (
          <div>
            <span className="font-semibold">Descripción:</span> {expense.description}
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <HeaderWithLogout title="Historial de Gastos">
        <Link href="/expenses/new">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al formulario
          </Button>
        </Link>
      </HeaderWithLogout>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtra los gastos por rango de fechas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangeFilter onFilter={handleFilter} />
            <DateRangePresets onSelectPreset={handlePresetFilter} />
          </CardContent>
        </Card>

        <ExpenseSummary {...summary} />
        {error && (
          <Card className="border-red-300">
            <CardContent className="p-4">
              <div className="flex items-center text-red-600">
                <p>{error}</p>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => loadData(currentFilter)}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-700 text-white">
            <CardTitle>Gastos registrados</CardTitle>
            <CardDescription className="text-gray-100">
              {loading ? "Cargando..." : `${expenses.length} registros encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Pago</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Creado por</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses && expenses.length > 0 ? (
                      expenses.map((expense: any) => {
                        // Ensure all required date fields exist before formatting
                        const hasValidDate = expense?.date && !isNaN(new Date(expense.date).getTime())
                        const hasValidDueDate = expense?.due_date && !isNaN(new Date(expense.due_date).getTime())
                        const hasValidPaymentDate =
                          expense?.payment_date && !isNaN(new Date(expense.payment_date).getTime())

                        return (
                          <TableRow key={expense?.id || Math.random().toString()}>
                            <TableCell>
                              {hasValidDate ? format(new Date(expense.date), "dd/MM/yyyy", { locale: es }) : "-"}
                            </TableCell>
                            <TableCell>
                              {hasValidDueDate ? format(new Date(expense.due_date), "dd/MM/yyyy", { locale: es }) : "-"}
                            </TableCell>
                            <TableCell>
                              {hasValidPaymentDate
                                ? format(new Date(expense.payment_date), "dd/MM/yyyy", { locale: es })
                                : "-"}
                            </TableCell>
                            <TableCell>{expense?.suppliers?.name || "Sin proveedor"}</TableCell>
                            <TableCell>{expense?.expense_categories?.name || "Sin categoría"}</TableCell>
                            <TableCell>{expense?.invoice_number || "-"}</TableCell>
                            <TableCell>${Number(expense?.amount || 0).toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(expense?.status || "")}</TableCell>
                            <TableCell>{getPaymentMethodLabel(expense?.payment_method || "")}</TableCell>
                            <TableCell>
                              {expense?.document_url ? (
                                <a
                                  href={expense.document_url}
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
                            <TableCell>{expense?.created_by || "-"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Link href={`/expenses/${expense?.id}/edit`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar gasto">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <DeleteConfirmationDialog
                                  title="Eliminar gasto"
                                  description="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
                                  onConfirm={() => handleDelete(expense?.id)}
                                  triggerClassName="h-8 w-auto px-2"
                                  variant="ghost"
                                  itemDetails={getExpenseDetails(expense)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-10">
                          No hay gastos registrados que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </main>
  )
}
