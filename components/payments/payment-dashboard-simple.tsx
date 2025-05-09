"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Payment } from "@/types/payment"
import PaymentTable from "./payment-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentSummary } from "@/components/payment-summary"

export default function PaymentDashboardSimple() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tribesMap, setTribesMap] = useState<Record<string, string>>({})
  const [roomsMap, setRoomsMap] = useState<Record<string, string>>({})
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    efectivo: 0,
    transferencia: 0,
  })

  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Cargar tribus y habitaciones
  const loadTribesAndRooms = async () => {
    try {
      console.log("Cargando tribus...")
      const { data: tribesData, error: tribesError } = await supabase.from("tribes").select("id, name")

      if (tribesError) {
        console.error("Error al cargar tribus:", tribesError)
        throw tribesError
      }

      console.log("Tribus cargadas:", tribesData)

      // Crear mapa de tribus
      const tribes: Record<string, string> = {}
      tribesData.forEach((tribe) => {
        tribes[tribe.id] = tribe.name
      })
      setTribesMap(tribes)

      console.log("Cargando habitaciones...")
      const { data: roomsData, error: roomsError } = await supabase.from("rooms").select("id, room_number, tribe_id")

      if (roomsError) {
        console.error("Error al cargar habitaciones:", roomsError)
        throw roomsError
      }

      console.log("Habitaciones cargadas:", roomsData)

      // Crear mapa de habitaciones
      const rooms: Record<string, string> = {}
      roomsData.forEach((room) => {
        rooms[room.id] = room.room_number
      })
      setRoomsMap(rooms)

      console.log("Mapas creados:", { tribes, rooms })
    } catch (error) {
      console.error("Error al cargar tribus y habitaciones:", error)
      setError("Error al cargar tribus y habitaciones")
    }
  }

  // Cargar pagos
  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Cargando pagos...")
      const { data, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("entry_date", { ascending: false })
        .limit(50)

      if (paymentsError) {
        console.error("Error al cargar pagos:", paymentsError)
        throw paymentsError
      }

      console.log("Pagos cargados:", data?.length || 0)

      // Mapear pagos con nombres de tribus y habitaciones
      const mappedPayments = data.map((payment) => {
        const tribeName = tribesMap[payment.tribe_id] || `Tribu ${payment.tribe_id}`
        const roomNumber = roomsMap[payment.room_id] || `Habitación ${payment.room_id}`

        return {
          id: payment.id,
          date: payment.entry_date,
          due_date: payment.estimated_payment_date,
          payment_date: payment.actual_payment_date,
          client: {
            id: payment.tribe_id,
            name: `${tribeName} - ${roomNumber}`,
          },
          tribe_name: tribeName,
          room_number: roomNumber,
          amount: Number.parseFloat(payment.amount),
          rent_amount: Number.parseFloat(payment.rent_amount || "0"),
          services_amount: Number.parseFloat(payment.services_amount || "0"),
          status: payment.actual_payment_date ? "paid" : "pending",
          payment_method: payment.payment_method,
          invoice_number: "",
          description: payment.comments,
          document_url: payment.document_url || (payment.document_urls && payment.document_urls[0]),
          document_urls: payment.document_urls,
        }
      })

      setPayments(mappedPayments)

      // Calcular resumen
      let total = 0
      let efectivo = 0
      let transferencia = 0

      mappedPayments.forEach((payment) => {
        total += payment.amount
        if (payment.payment_method === "efectivo") {
          efectivo += payment.amount
        } else {
          transferencia += payment.amount
        }
      })

      setSummary({
        total,
        count: mappedPayments.length,
        efectivo,
        transferencia,
      })
    } catch (error) {
      console.error("Error al cargar pagos:", error)
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

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await loadTribesAndRooms()
      await loadPayments()
    }

    loadInitialData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-lg font-medium">Historial de Cobros</h2>
          <p className="text-sm text-muted-foreground">Mostrando {payments.length} registros</p>

          {/* Depuración */}
          <div className="text-xs text-muted-foreground mt-1">
            <details>
              <summary>Ver mapas de tribus y habitaciones</summary>
              <pre>Tribus: {JSON.stringify(tribesMap)}</pre>
              <pre>Habitaciones: {JSON.stringify(roomsMap)}</pre>
            </details>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadTribesAndRooms().then(() => loadPayments())
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
    </div>
  )
}
