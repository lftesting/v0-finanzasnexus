"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function MonthlyExpensesChart({ year = new Date().getFullYear() }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Crear fechas para el rango del año seleccionado
        const startDate = `${year}-01-01`
        const endDate = `${year}-12-31`

        const { data: expensesData, error } = await supabase
          .from("expenses")
          .select("amount, date, status")
          .gte("date", startDate)
          .lte("date", endDate)

        if (error) {
          throw error
        }

        // Inicializar datos mensuales
        const monthlyData = Array(12)
          .fill(0)
          .map((_, i) => ({
            name: new Date(year, i, 1).toLocaleString("es-AR", { month: "short" }),
            pendiente: 0,
            pagado: 0,
            total: 0,
            month: i + 1,
          }))

        // Procesar datos
        expensesData?.forEach((expense) => {
          if (!expense.date) return

          const date = new Date(expense.date)
          const month = date.getMonth()
          const amount = Number.parseFloat(expense.amount) || 0
          const status = expense.status || "pendiente"

          monthlyData[month].total += amount

          if (status === "pagado") {
            monthlyData[month].pagado += amount
          } else {
            monthlyData[month].pendiente += amount
          }
        })

        // Ordenar por mes
        monthlyData.sort((a, b) => a.month - b.month)

        setData(monthlyData)
      } catch (err) {
        console.error("Error al cargar datos mensuales:", err)
        setError("No se pudieron cargar los datos mensuales")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [year])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">Pagado: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-orange-500">Pendiente: {formatCurrency(payload[1].value)}</p>
          <p className="text-sm font-medium mt-1">Total: {formatCurrency(payload[0].value + payload[1].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Gastos Mensuales {year}</CardTitle>
        <CardDescription>Distribución de gastos pagados y pendientes por mes</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-4 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-64 w-full rounded-md" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No hay datos disponibles para el año {year}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pagado" stackId="a" fill="#4ade80" name="Pagado" />
              <Bar dataKey="pendiente" stackId="a" fill="#fb923c" name="Pendiente" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
