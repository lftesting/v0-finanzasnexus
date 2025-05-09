"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Payment } from "@/types/payment"
import PaymentTable from "./payment-table"
import PaymentFilters from "./payment-filters"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentSummary } from "@/components/payment-summary"

export default function PaymentDashboard() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    dateRange: null,
    tribe: "",
    room: "",
    paymentMethod: "",
    search: "",
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 50
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    efectivo: 0,
    transferencia: 0,
  })
  const [debugInfo, setDebugInfo] = useState({
    rawData: null,
    mappedData: null,
    error: null,
  })

  // Paso 1: Obtener datos con joins directamente
  const fetchPayments = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Iniciando consulta a la tabla payments con joins")

      // Consulta con joins para obtener nombres de tribus y habitaciones directamente
      let query = supabase.from("payments").select(`
          *,
          tribes:tribe_id (id, name),
          rooms:room_id (id, room_number)
        `)

      // Aplicar filtros de fecha si existen
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        query = query.gte("entry_date", fromDate.toISOString().split("T")[0])
      }

      if (filters.dateRange?.to) {
        const toDate = new Date(filters.dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        query = query.lte("entry_date", toDate.toISOString().split("T")[0])
      }

      // Aplicar filtro de tribu si existe
      if (filters.tribe && filters.tribe !== "all") {
        query = query.eq("tribe_id", filters.tribe)
      }

      // Aplicar filtro de habitación si existe
      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room)
      }

      // Aplicar filtro de método de pago si existe
      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        query = query.eq("payment_method", filters.paymentMethod)
      }

      // Aplicar filtro de búsqueda si existe
      if (filters.search) {
        query = query.ilike("comments", `%${filters.search}%`)
      }

      // Ordenar por fecha de entrada (más reciente primero)
      query = query.order("entry_date", { ascending: false })

      // Aplicar paginación
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      // Ejecutar la consulta
      const { data, error } = await query

      if (error) {
        console.error("Error en la consulta:", error)
        setDebugInfo((prev) => ({ ...prev, error: error }))
        throw error
      }

      console.log("Datos obtenidos:", data?.length || 0, "registros")
      console.log("Muestra de datos:", data?.[0])
      setDebugInfo((prev) => ({ ...prev, rawData: data }))

      // Mapear los datos
      const mappedData = mapPaymentsData(data || [])
      setPayments(mappedData)
      setDebugInfo((prev) => ({ ...prev, mappedData: mappedData }))

      // Calcular resumen
      calculateSummary(mappedData)

      // Verificar si hay más páginas (consulta separada para el conteo)
      const countQuery = supabase.from("payments").select("id", { count: "exact", head: true })

      // Aplicar los mismos filtros a la consulta de conteo
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        countQuery.gte("entry_date", fromDate.toISOString().split("T")[0])
      }

      if (filters.dateRange?.to) {
        const toDate = new Date(filters.dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        countQuery.lte("entry_date", toDate.toISOString().split("T")[0])
      }

      if (filters.tribe && filters.tribe !== "all") {
        countQuery.eq("tribe_id", filters.tribe)
      }

      if (filters.room && filters.room !== "all") {
        countQuery.eq("room_id", filters.room)
      }

      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        countQuery.eq("payment_method", filters.paymentMethod)
      }

      if (filters.search) {
        countQuery.ilike("comments", `%${filters.search}%`)
      }

      const { count } = await countQuery
      setHasMore(count ? count > page * pageSize : false)
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError(`No se pudieron cargar los cobros: ${error.message || "Error desconocido"}`)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cobros. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mapear los datos con los nombres de tribus y habitaciones
  const mapPaymentsData = (data: any[]): Payment[] => {
    if (!data || data.length === 0) return []

    return data.map((item) => ({
      id: item.id,
      date: item.entry_date,
      due_date: item.estimated_payment_date,
      payment_date: item.actual_payment_date,
      client: {
        id: item.tribe_id,
        name:
          item.tribes && item.rooms
            ? `${item.tribes.name} - ${item.rooms.room_number}`
            : `Tribu ${item.tribe_id} - Habitación ${item.room_id}`,
      },
      tribe_name: item.tribes ? item.tribes.name : "",
      room_number: item.rooms ? item.rooms.room_number : "",
      amount: Number.parseFloat(item.amount),
      rent_amount: Number.parseFloat(item.rent_amount || "0"),
      services_amount: Number.parseFloat(item.services_amount || "0"),
      status: item.actual_payment_date ? "paid" : "pending",
      payment_method: item.payment_method,
      invoice_number: "",
      description: item.comments,
      document_url: item.document_url || (item.document_urls && item.document_urls[0]),
      document_urls: item.document_urls,
    }))
  }

  const calculateSummary = (data: Payment[]) => {
    let total = 0
    let efectivo = 0
    let transferencia = 0

    data.forEach((payment) => {
      total += payment.amount
      if (payment.payment_method === "efectivo") {
        efectivo += payment.amount
      } else {
        transferencia += payment.amount
      }
    })

    setSummary({
      total,
      count: data.length,
      efectivo,
      transferencia,
    })
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchPayments()
  }, [])

  // Cargar datos filtrados cuando cambian los filtros o la página
  useEffect(() => {
    fetchPayments()
  }, [filters, page])

  const loadMorePayments = () => {
    const nextPage = page + 1
    setPage(nextPage)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <PaymentFilters filters={filters} setFilters={setFilters} />

        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPage(1)
              fetchPayments()
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Link href="/payments/new">
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo Cobro
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          </Link>
        </div>
      </div>

      {/* Resumen de cobros */}
      <PaymentSummary
        total={summary.total}
        count={summary.count}
        efectivo={summary.efectivo}
        transferencia={summary.transferencia}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PaymentTable payments={payments} loading={loading} />

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button onClick={loadMorePayments} disabled={loading} variant="outline">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más registros"
            )}
          </Button>
        </div>
      )}

      {/* Panel de depuración */}
      <div className="mt-8 p-4 border rounded-md bg-gray-50 text-xs">
        <h3 className="font-bold mb-2">Información de depuración:</h3>
        <p>Número de registros cargados: {payments.length}</p>
        <p>Estado de carga: {loading ? "Cargando..." : "Completado"}</p>
        <p>Filtros aplicados: {JSON.stringify(filters)}</p>

        <details>
          <summary className="cursor-pointer font-medium">Ver datos crudos (primeros 2 registros)</summary>
          <pre className="mt-2 p-2 bg-gray-100 overflow-auto max-h-40">
            {debugInfo.rawData ? JSON.stringify(debugInfo.rawData.slice(0, 2), null, 2) : "No hay datos disponibles"}
          </pre>
        </details>

        <details>
          <summary className="cursor-pointer font-medium">Ver datos mapeados (primeros 2 registros)</summary>
          <pre className="mt-2 p-2 bg-gray-100 overflow-auto max-h-40">
            {debugInfo.mappedData
              ? JSON.stringify(debugInfo.mappedData.slice(0, 2), null, 2)
              : "No hay datos disponibles"}
          </pre>
        </details>
      </div>
    </div>
  )
}
