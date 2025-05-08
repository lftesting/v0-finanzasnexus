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
    query: "",
    error: null,
    rawData: null,
  })

  // Función simplificada para obtener pagos
  const fetchPayments = async (pageNumber = 1) => {
    setLoading(true)
    setError(null)

    try {
      console.log("Iniciando consulta simplificada a la tabla payments")

      // Consulta directa sin filtros para verificar si podemos obtener datos
      const { data, error, count } = await supabase
        .from("payments")
        .select(
          `
          id, 
          entry_date, 
          estimated_payment_date, 
          actual_payment_date, 
          tribe_id, 
          tribes:tribes(name), 
          room_id, 
          rooms:rooms(room_number), 
          amount, 
          rent_amount, 
          services_amount, 
          payment_method, 
          comments, 
          document_url, 
          document_urls
        `,
          { count: "exact" },
        )
        .order("entry_date", { ascending: false })
        .range(0, 49) // Obtener los primeros 50 registros

      if (error) {
        console.error("Error en la consulta:", error)
        setDebugInfo((prev) => ({ ...prev, error: error }))
        throw error
      }

      console.log("Datos obtenidos:", data?.length || 0, "registros")
      console.log("Primer registro:", data?.[0])

      setDebugInfo((prev) => ({ ...prev, rawData: data }))

      // Mapear los datos al formato esperado por el componente
      const mappedData =
        data?.map((item) => ({
          id: item.id,
          date: item.entry_date,
          due_date: item.estimated_payment_date,
          payment_date: item.actual_payment_date,
          client: {
            id: item.tribe_id,
            name:
              item.tribes?.name && item.rooms?.room_number
                ? `${item.tribes.name} - ${item.rooms.room_number}`
                : `Tribu ${item.tribe_id} - Habitación ${item.room_id}`,
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
        })) || []

      setPayments(mappedData)

      // Calcular resumen
      calculateSummary(mappedData)
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError("No se pudieron cargar los cobros. Por favor, intente de nuevo.")
      toast({
        title: "Error",
        description: "No se pudieron cargar los cobros. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

  useEffect(() => {
    // Cargar pagos al montar el componente
    fetchPayments()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <PaymentFilters filters={filters} setFilters={setFilters} />

        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => fetchPayments(1)} disabled={loading}>
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

      {/* Panel de depuración mejorado */}
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
      </div>
    </div>
  )
}
