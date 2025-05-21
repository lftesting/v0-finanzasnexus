"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { TrendingDown, TrendingUp, DollarSign, CreditCard, Wallet, BanknoteIcon } from "lucide-react"

export default function ExpenseSummaryCards({ dateRange }: { dateRange?: { from: Date; to: Date } }) {
  const [summary, setSummary] = useState({
    total: 0,
    pendiente: 0,
    pagado: 0,
    efectivo: 0,
    transferencia: 0,
    tarjeta: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        let query = supabase.from("expenses").select("amount, status, payment_method")

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

        // Calcular resumen
        const newSummary = {
          total: 0,
          pendiente: 0,
          pagado: 0,
          efectivo: 0,
          transferencia: 0,
          tarjeta: 0,
        }

        expensesData?.forEach((expense) => {
          const amount = Number.parseFloat(expense.amount) || 0
          newSummary.total += amount

          // Por estado
          if (expense.status === "pagado") {
            newSummary.pagado += amount
          } else {
            newSummary.pendiente += amount
          }

          // Por método de pago
          if (expense.payment_method === "efectivo") {
            newSummary.efectivo += amount
          } else if (expense.payment_method === "transferencia") {
            newSummary.transferencia += amount
          } else if (["tarjeta_credito", "tarjeta_debito"].includes(expense.payment_method)) {
            newSummary.tarjeta += amount
          }
        })

        setSummary(newSummary)
      } catch (err) {
        console.error("Error al cargar resumen de gastos:", err)
        setError("No se pudo cargar el resumen de gastos")
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

  return (
    <>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
              <p className="text-xs text-muted-foreground">
                {dateRange?.from && dateRange?.to
                  ? `Del ${dateRange.from.toLocaleDateString()} al ${dateRange.to.toLocaleDateString()}`
                  : "Período actual"}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos Pendientes</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold text-orange-500">{formatCurrency(summary.pendiente)}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.pendiente / summary.total) * 100).toFixed(1)}% del total
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos Pagados</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.pagado)}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.pagado / summary.total) * 100).toFixed(1)}% del total
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
          <BanknoteIcon className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatCurrency(summary.efectivo)}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.efectivo / summary.total) * 100).toFixed(1)}% del total
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transferencia</CardTitle>
          <Wallet className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatCurrency(summary.transferencia)}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.transferencia / summary.total) * 100).toFixed(1)}% del total
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarjeta</CardTitle>
          <CreditCard className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{formatCurrency(summary.tarjeta)}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.tarjeta / summary.total) * 100).toFixed(1)}% del total
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
