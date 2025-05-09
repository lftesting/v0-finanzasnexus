"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function PaymentsDebugPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tribes, setTribes] = useState([])
  const [rooms, setRooms] = useState([])
  const [payments, setPayments] = useState([])
  const [mappedPayments, setMappedPayments] = useState([])

  const supabase = createClientComponentClient()

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Cargar tribus
      console.log("Cargando tribus...")
      const { data: tribesData, error: tribesError } = await supabase.from("tribes").select("*")

      if (tribesError) throw tribesError
      setTribes(tribesData)
      console.log("Tribus cargadas:", tribesData)

      // 2. Cargar habitaciones
      console.log("Cargando habitaciones...")
      const { data: roomsData, error: roomsError } = await supabase.from("rooms").select("*")

      if (roomsError) throw roomsError
      setRooms(roomsData)
      console.log("Habitaciones cargadas:", roomsData)

      // 3. Cargar pagos (limitado a 5 para simplificar)
      console.log("Cargando pagos...")
      const { data: paymentsData, error: paymentsError } = await supabase.from("payments").select("*").limit(5)

      if (paymentsError) throw paymentsError
      setPayments(paymentsData)
      console.log("Pagos cargados:", paymentsData)

      // 4. Mapear pagos con nombres de tribus y habitaciones
      const tribesMap = {}
      const roomsMap = {}

      tribesData.forEach((tribe) => {
        tribesMap[tribe.id] = tribe.name
      })

      roomsData.forEach((room) => {
        roomsMap[room.id] = room.room_number
      })

      const mapped = paymentsData.map((payment) => {
        const tribeName = tribesMap[payment.tribe_id] || `Tribu ${payment.tribe_id}`
        const roomNumber = roomsMap[payment.room_id] || `Habitación ${payment.room_id}`

        return {
          ...payment,
          tribe_name: tribeName,
          room_number: roomNumber,
          client_display: `${tribeName} - ${roomNumber}`,
        }
      })

      setMappedPayments(mapped)
      console.log("Pagos mapeados:", mapped)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(`Error al cargar datos: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Depuración de Datos</h1>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Recargar Datos
        </Button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tribus */}
        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Tribus ({tribes.length})</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(tribes, null, 2)}
          </pre>
        </div>

        {/* Habitaciones */}
        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Habitaciones ({rooms.length})</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">{JSON.stringify(rooms, null, 2)}</pre>
        </div>

        {/* Pagos Crudos */}
        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Pagos Crudos ({payments.length})</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(payments, null, 2)}
          </pre>
        </div>

        {/* Pagos Mapeados */}
        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Pagos Mapeados ({mappedPayments.length})</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(mappedPayments, null, 2)}
          </pre>
        </div>
      </div>

      {/* Tabla de comparación */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">Comparación de Datos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tribu ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Tribu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Habitación ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número Habitación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente (Mapeado)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappedPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.tribe_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.tribe_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.room_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.room_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {payment.client_display}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
