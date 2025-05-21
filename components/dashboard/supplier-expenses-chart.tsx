"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SupplierExpensesChart({ dateRange }: { dateRange?: { from: Date; to: Date } }) {
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
            suppliers (
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
        const supplierMap = new Map()

        expensesData?.forEach((expense) => {
          if (!expense.suppliers) return

          const supplierId = expense.suppliers.id
          const supplierName = expense.suppliers.name
          const amount = Number.parseFloat(expense.amount) || 0

          if (supplierMap.has(supplierId)) {
            supplierMap.set(supplierId, {
              name: supplierName,
              amount: supplierMap.get(supplierId).amount + amount,
            })
          } else {
            supplierMap.set(supplierId, {
              name: supplierName,
              amount,
            })
          }
        })

        const chartData = Array.from(supplierMap.values())
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10) // Mostrar solo los 10 proveedores principales

        setData(chartData)
      } catch (err) {
        console.error("Error al cargar datos de proveedores:", err)
        setError("No se pudieron cargar los datos de proveedores")
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Gastos por Proveedor</CardTitle>
        <CardDescription>
          Top 10 proveedores con mayor gasto{" "}
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
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#8884d8" name="Monto" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
