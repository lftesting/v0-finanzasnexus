"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type Expense = {
  id: number
  date: string
  due_date: string | null
  payment_date: string | null
  supplier_id: number | null
  category_id: number | null
  amount: number
  payment_method: string | null
  status: string | null
  description: string | null
  tribe_id: number | null
  room_id: number | null
  bank_account: string | null
  category_name?: string
  supplier_name?: string
  tribe_name?: string
}

type Category = {
  id: number
  name: string
}

type Tribe = {
  id: number
  name: string
}

export default function ExpensesTable() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [tribeFilter, setTribeFilter] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const supabase = getSupabaseClient()

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Cargar categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("expense_categories")
          .select("id, name")
          .order("name")

        if (categoriesError) throw new Error(`Error al cargar categorías: ${categoriesError.message}`)
        setCategories(categoriesData || [])

        // Cargar tribus (asumiendo que existe una tabla tribes)
        const { data: tribesData, error: tribesError } = await supabase.from("tribes").select("id, name").order("name")

        if (tribesError) {
          console.warn("No se pudieron cargar las tribus:", tribesError.message)
          // No lanzamos error aquí para que la aplicación siga funcionando
        } else {
          setTribes(tribesData || [])
        }

        // Cargar gastos con información relacionada
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select(`
            *,
            expense_categories(name),
            suppliers(name),
            tribes(name)
          `)
          .order("date", { ascending: false })

        if (expensesError) throw new Error(`Error al cargar gastos: ${expensesError.message}`)

        // Transformar los datos para incluir los nombres relacionados
        const formattedExpenses = (expensesData || []).map((expense) => ({
          ...expense,
          category_name: expense.expense_categories?.name || "Sin categoría",
          supplier_name: expense.suppliers?.name || "Sin proveedor",
          tribe_name: expense.tribes?.name || "Sin tribu",
        }))

        setExpenses(formattedExpenses)
        setFilteredExpenses(formattedExpenses)
      } catch (err: any) {
        console.error("Error al cargar datos:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let result = [...expenses]

    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (expense) =>
          expense.description?.toLowerCase().includes(term) ||
          expense.category_name?.toLowerCase().includes(term) ||
          expense.supplier_name?.toLowerCase().includes(term) ||
          expense.tribe_name?.toLowerCase().includes(term) ||
          expense.bank_account?.toLowerCase().includes(term),
      )
    }

    // Filtro por categoría
    if (categoryFilter) {
      result = result.filter((expense) => expense.category_id === Number.parseInt(categoryFilter))
    }

    // Filtro por estado
    if (statusFilter) {
      result = result.filter((expense) => expense.status === statusFilter)
    }

    // Filtro por tribu
    if (tribeFilter) {
      result = result.filter((expense) => expense.tribe_id === Number.parseInt(tribeFilter))
    }

    // Filtro por fecha de inicio
    if (startDate) {
      result = result.filter((expense) => expense.date >= startDate)
    }

    // Filtro por fecha de fin
    if (endDate) {
      result = result.filter((expense) => expense.date <= endDate)
    }

    setFilteredExpenses(result)
  }, [expenses, searchTerm, categoryFilter, statusFilter, tribeFilter, startDate, endDate])

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

  // Formatear monto
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Fecha",
      "Vencimiento",
      "Fecha de Pago",
      "Proveedor",
      "Categoría",
      "Monto",
      "Método de Pago",
      "Estado",
      "Descripción",
      "Tribu",
      "Habitación",
      "Cuenta Bancaria",
    ]

    const csvData = filteredExpenses.map((expense) => [
      expense.id,
      formatDate(expense.date),
      formatDate(expense.due_date),
      formatDate(expense.payment_date),
      expense.supplier_name,
      expense.category_name,
      expense.amount,
      expense.payment_method,
      expense.status,
      expense.description,
      expense.tribe_name,
      expense.room_id,
      expense.bank_account,
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row
          .map((cell) => (cell === null ? "" : typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell))
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `gastos_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <p className="mt-4">
            Esto puede deberse a problemas de permisos. Verifica que las políticas RLS estén correctamente configuradas.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gastos</CardTitle>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select value={tribeFilter} onValueChange={setTribeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tribu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tribus</SelectItem>
                    {tribes.map((tribe) => (
                      <SelectItem key={tribe.id} value={tribe.id.toString()}>
                        {tribe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Fecha inicio"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="Fecha fin"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("")
                    setStatusFilter("")
                    setTribeFilter("")
                    setStartDate("")
                    setEndDate("")
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>

            {/* Tabla */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron gastos con los filtros seleccionados
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Tribu</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{expense.category_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{expense.description || "-"}</TableCell>
                        <TableCell>{expense.tribe_name || "-"}</TableCell>
                        <TableCell className="text-right font-medium">{formatAmount(expense.amount)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              expense.status === "pagado"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {expense.status === "pagado" ? "Pagado" : "Pendiente"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Resumen */}
            <div className="flex justify-between items-center pt-4">
              <div>
                Mostrando {filteredExpenses.length} de {expenses.length} gastos
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold">
                  {formatAmount(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de depuración */}
      <Card>
        <CardHeader>
          <CardTitle>Información de depuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>RLS habilitado:</strong> Sí
            </p>
            <p>
              <strong>Políticas RLS:</strong>
            </p>
            <ul className="list-disc pl-5">
              <li>Allow authenticated users to view all expenses</li>
              <li>Allow authenticated users to insert expenses</li>
              <li>Allow authenticated users to update expenses</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2">
              Si sigues teniendo problemas para ver los gastos, verifica que:
            </p>
            <ol className="list-decimal pl-5 text-sm text-gray-500">
              <li>Estás autenticado correctamente</li>
              <li>Las políticas RLS están aplicadas correctamente</li>
              <li>La tabla expenses tiene los permisos adecuados</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
