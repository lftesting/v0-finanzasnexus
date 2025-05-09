"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Payment } from "@/types/payment"
import PaymentTable from "./payment-table"
import PaymentFiltersSimple from "./payment-filters-simple"
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

  // Función para obtener pagos directamente con joins
  const fetchPayments = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Iniciando consulta directa a la tabla payments con joins")

      // Construir la consulta SQL directa
      let query = `
        SELECT 
          p.*,
          t.name AS tribe_name,
          r.room_number
        FROM 
          payments p
        JOIN 
          tribes t ON p.tribe_id = t.id
        JOIN 
          rooms r ON p.room_id = r.id
      `

      // Condiciones para los filtros
      const conditions = []
      const params = {}

      // Filtro de fecha
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        conditions.push(`p.entry_date >= :from_date`)
        params.from_date = fromDate.toISOString().split("T")[0]
      }

      if (filters.dateRange?.to) {
        const toDate = new Date(filters.dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        conditions.push(`p.entry_date <= :to_date`)
        params.to_date = toDate.toISOString().split("T")[0]
      }

      // Filtro de tribu
      if (filters.tribe && filters.tribe !== "all") {
        conditions.push(`p.tribe_id = :tribe_id`)
        params.tribe_id = filters.tribe
      }

      // Filtro de habitación
      if (filters.room && filters.room !== "all") {
        conditions.push(`p.room_id = :room_id`)
        params.room_id = filters.room
      }

      // Filtro de método de pago
      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        conditions.push(`p.payment_method = :payment_method`)
        params.payment_method = filters.paymentMethod
      }

      // Filtro de búsqueda
      if (filters.search) {
        conditions.push(`p.comments ILIKE :search`)
        params.search = `%${filters.search}%`
      }

      // Agregar condiciones a la consulta
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      // Ordenar por fecha
      query += ` ORDER BY p.entry_date DESC`

      // Paginación
      query += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`

      console.log("Consulta SQL:", query)
      console.log("Parámetros:", params)

      // Ejecutar la consulta
      const { data, error } = await supabase.rpc("execute_sql", {
        query_text: query,
        query_params: params,
      })

      if (error) {
        console.error("Error en la consulta SQL:", error)
        throw error
      }

      console.log("Datos obtenidos:", data?.length || 0, "registros")
      console.log("Muestra de datos:", data?.[0])

      // Mapear los datos
      const mappedData = mapPaymentsData(data || [])
      setPayments(mappedData)

      // Calcular resumen
      calculateSummary(mappedData)

      // Verificar si hay más páginas
      const countQuery = `
        SELECT COUNT(*) 
        FROM payments p
        JOIN tribes t ON p.tribe_id = t.id
        JOIN rooms r ON p.room_id = r.id
      `

      let countConditions = ""
      if (conditions.length > 0) {
        countConditions = ` WHERE ${conditions.join(" AND ")}`
      }

      const { data: countData, error: countError } = await supabase.rpc("execute_sql", {
        query_text: countQuery + countConditions,
        query_params: params,
      })

      if (countError) {
        console.error("Error en la consulta de conteo:", countError)
      } else {
        const totalCount = Number.parseInt(countData?.[0]?.count || "0")
        setHasMore(totalCount > page * pageSize)
      }
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
        name: `${item.tribe_name} - ${item.room_number}`,
      },
      tribe_name: item.tribe_name,
      room_number: item.room_number,
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
    // Usar un enfoque alternativo para obtener los datos
    const fetchInitialData = async () => {
      try {
        setLoading(true)

        // Consulta SQL directa para obtener los primeros 50 pagos con sus relaciones
        const query = `
          SELECT 
            p.*,
            t.name AS tribe_name,
            r.room_number
          FROM 
            payments p
          JOIN 
            tribes t ON p.tribe_id = t.id
          JOIN 
            rooms r ON p.room_id = r.id
          ORDER BY 
            p.entry_date DESC
          LIMIT 50
        `

        const { data, error } = await supabase
          .from("payments")
          .select(`
            *,
            tribes:tribe_id (name),
            rooms:room_id (room_number)
          `)
          .order("entry_date", { ascending: false })
          .limit(50)

        if (error) {
          console.error("Error en la consulta inicial:", error)
          throw error
        }

        console.log("Datos iniciales obtenidos:", data?.length || 0, "registros")
        console.log("Muestra de datos:", data?.[0])

        // Mapear los datos
        const mappedData = data.map((item) => ({
          id: item.id,
          date: item.entry_date,
          due_date: item.estimated_payment_date,
          payment_date: item.actual_payment_date,
          client: {
            id: item.tribe_id,
            name: `${item.tribes?.name || "Tribu " + item.tribe_id} - ${item.rooms?.room_number || "Habitación " + item.room_id}`,
          },
          tribe_name: item.tribes?.name || "",
          room_number: item.rooms?.room_number || "",
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

        setPayments(mappedData)
        calculateSummary(mappedData)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        setError(`No se pudieron cargar los cobros: ${error.message || "Error desconocido"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Cargar datos filtrados cuando cambian los filtros o la página
  useEffect(() => {
    if (Object.values(filters).some((value) => value !== "" && value !== null) || page > 1) {
      fetchPayments()
    }
  }, [filters, page])

  const loadMorePayments = () => {
    const nextPage = page + 1
    setPage(nextPage)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <PaymentFiltersSimple filters={filters} setFilters={setFilters} />

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
    </div>
  )
}
