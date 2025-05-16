"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getExpenses } from "@/app/expense-actions"
import { getPayments } from "@/app/actions"
import { format, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6B8E23", "#483D8B"]

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("3months")
  const [expenseData, setExpenseData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Calcular fechas según el rango seleccionado
      const endDate = new Date()
      let startDate

      switch (timeRange) {
        case "1month":
          startDate = subMonths(endDate, 1)
          break
        case "3months":
          startDate = subMonths(endDate, 3)
          break
        case "6months":
          startDate = subMonths(endDate, 6)
          break
        case "12months":
          startDate = subMonths(endDate, 12)
          break
        default:
          startDate = subMonths(endDate, 3)
      }

      // Formatear fechas para la API
      const formattedStartDate = format(startDate, "yyyy-MM-dd")
      const formattedEndDate = format(endDate, "yyyy-MM-dd")

      // Obtener datos de gastos y cobros
      const expenses = await getExpenses({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      })

      const payments = await getPayments({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      })

      setExpenseData(expenses || [])
      setPaymentData(payments || [])
    } catch (error) {
      console.error("Error al cargar datos para el dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  // Preparar datos para gráficos
  const prepareMonthlyData = () => {
    const months = {}

    // Inicializar meses en el rango seleccionado
    const currentDate = new Date()
    const monthsToShow = Number.parseInt(timeRange.replace("months", ""))

    for (let i = 0; i < monthsToShow; i++) {
      const date = subMonths(currentDate, i)
      const monthKey = format(date, "yyyy-MM")
      months[monthKey] = {
        name: format(date, "MMM yyyy", { locale: es }),
        ingresos: 0,
        gastos: 0,
        balance: 0,
      }
    }

    // Agregar datos de cobros
    paymentData.forEach((payment) => {
      const date = new Date(payment.entry_date)
      const monthKey = format(date, "yyyy-MM")

      if (months[monthKey]) {
        months[monthKey].ingresos += Number(payment.amount || 0)
      }
    })

    // Agregar datos de gastos
    expenseData.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = format(date, "yyyy-MM")

      if (months[monthKey]) {
        months[monthKey].gastos += Number(expense.amount || 0)
      }
    })

    // Calcular balance
    Object.keys(months).forEach((key) => {
      months[key].balance = months[key].ingresos - months[key].gastos
    })

    // Convertir a array y ordenar por fecha
    return Object.values(months).reverse()
  }

  const prepareCategoryData = () => {
    const categories = {}

    expenseData.forEach((expense) => {
      const categoryName = expense.expense_categories?.name || "Sin categoría"

      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          value: 0,
          count: 0,
        }
      }

      categories[categoryName].value += Number(expense.amount || 0)
      categories[categoryName].count += 1
    })

    return Object.values(categories)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Mostrar solo las 8 categorías principales
  }

  const prepareTribeData = () => {
    const tribes = {}

    paymentData.forEach((payment) => {
      const tribeName = payment.tribes?.name || "Sin tribu"

      if (!tribes[tribeName]) {
        tribes[tribeName] = {
          name: tribeName,
          value: 0,
          count: 0,
        }
      }

      tribes[tribeName].value += Number(payment.amount || 0)
      tribes[tribeName].count += 1
    })

    return Object.values(tribes).sort((a, b) => b.value - a.value)
  }

  const calculateSummary = () => {
    const totalIngresos = paymentData.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    const totalGastos = expenseData.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const balance = totalIngresos - totalGastos

    const efectivoIngresos = paymentData
      .filter((payment) => payment.payment_method === "efectivo")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const transferenciaIngresos = paymentData
      .filter((payment) => payment.payment_method === "transferencia")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

    const efectivoGastos = expenseData
      .filter((expense) => expense.payment_method === "efectivo")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

    const transferenciaGastos = expenseData
      .filter((expense) => expense.payment_method === "transferencia")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

    const tarjetaGastos = expenseData
      .filter((expense) => expense.payment_method === "tarjeta_credito" || expense.payment_method === "tarjeta_debito")
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

    return {
      totalIngresos,
      totalGastos,
      balance,
      efectivoIngresos,
      transferenciaIngresos,
      efectivoGastos,
      transferenciaGastos,
      tarjetaGastos,
    }
  }

  const monthlyData = prepareMonthlyData()
  const categoryData = prepareCategoryData()
  const tribeData = prepareTribeData()
  const summary = calculateSummary()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Último mes</SelectItem>
            <SelectItem value="3months">Últimos 3 meses</SelectItem>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="12months">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Tarjetas de resumen */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalIngresos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">En el período seleccionado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalGastos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">En el período seleccionado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${summary.balance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Ingresos - Gastos</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de ingresos vs gastos por mes */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs Gastos por Mes</CardTitle>
              <CardDescription>Comparativa mensual de ingresos, gastos y balance</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#4CAF50" name="Ingresos" />
                  <Bar dataKey="gastos" fill="#F44336" name="Gastos" />
                  <Bar dataKey="balance" fill="#2196F3" name="Balance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métodos de pago */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago - Ingresos</CardTitle>
                <CardDescription>Distribución de ingresos por método de pago</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Efectivo", value: summary.efectivoIngresos },
                        { name: "Transferencia", value: summary.transferenciaIngresos },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Efectivo", value: summary.efectivoIngresos },
                        { name: "Transferencia", value: summary.transferenciaIngresos },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago - Gastos</CardTitle>
                <CardDescription>Distribución de gastos por método de pago</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Efectivo", value: summary.efectivoGastos },
                        { name: "Transferencia", value: summary.transferenciaGastos },
                        { name: "Tarjeta", value: summary.tarjetaGastos },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Efectivo", value: summary.efectivoGastos },
                        { name: "Transferencia", value: summary.transferenciaGastos },
                        { name: "Tarjeta", value: summary.tarjetaGastos },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          {/* Ingresos por tribu */}
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Tribu</CardTitle>
              <CardDescription>Distribución de ingresos por tribu</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tribeData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de ingresos por tribu (pie) */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ingresos por Tribu</CardTitle>
              <CardDescription>Porcentaje de ingresos por tribu</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tribeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tribeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {/* Gastos por categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>Principales categorías de gastos</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="value" fill="#F44336" name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de gastos por categoría (pie) */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Gastos por Categoría</CardTitle>
              <CardDescription>Porcentaje de gastos por categoría</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
