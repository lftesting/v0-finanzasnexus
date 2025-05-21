"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#F06292",
  "#4DD0E1",
  "#FFA726",
  "#BA68C8",
]

export default function ExpenseCategoryChart({ dateRange }: { dateRange?: { from: Date; to: Date } }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        let query = supabase.from("expenses").select(`
            amount,
            expense_categories (
              id, name
            )
          `)

        // Aplicar filtros de fecha si existen
        if (dateRange?.from) {
          query = query.gte("date", dateRange.from.toISOString().split("T")[0])
        }

        if (dateRange?.to) {
          query = query.lte("date", dateRange.to.toISOString().split("T")[0])
        }

        const { data: expensesData, error } = await query

        if (error) {
          throw error
        }

        // Procesar datos para el gráfico
        const categoryMap = new Map()

        expensesData?.forEach((expense) => {
          if (!expense.expense_categories) return

          const categoryId = expense.expense_categories.id
          const categoryName = expense.expense_categories.name
          const amount = Number.parseFloat(expense.amount) || 0

          if (categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
              name: categoryName,
              value: categoryMap.get(categoryId).value + amount,
            })
          } else {
            categoryMap.set(categoryId, {
              name: categoryName,
              value: amount,
            })
          }
        })

        const chartData = Array.from(categoryMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 10) // Mostrar solo las 10 categorías principales

        setData(chartData)
      } catch (err) {
        console.error("Error al cargar datos de categorías:", err)
        setError("No se pudieron cargar los datos de categorías")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>
          Distribución de gastos por categoría{" "}
          {dateRange?.from && dateRange?.to
            ? `del ${dateRange.from.toLocaleDateString()} al ${dateRange.to.toLocaleDateString()}`
            : "en el período actual"}
        </CardDescription>
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
            No hay datos disponibles para el período seleccionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
