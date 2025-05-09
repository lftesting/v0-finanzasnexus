"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function PaymentsFixedPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tribesMap, setTribesMap] = useState<Record<number, string>>({})
  const [roomsMap, setRoomsMap] = useState<Record<number, string>>({})
  const [payments, setPayments] = useState([])
  const [mappedPayments, setMappedPayments] = useState([])
  const [debugInfo, setDebugInfo] = useState({
    tribesLoaded: false,
    roomsLoaded: false,
    paymentsLoaded: false,
    tribesCount: 0,
    roomsCount: 0,
    paymentsCount: 0,
    logs: [],
  })

  const supabase = createClientComponentClient()

  const addLog = (message) => {
    setDebugInfo((prev) => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`],
    }))
    console.log(message)
  }

  const loadTribes = async () => {
    try {
      addLog("Cargando tribus...")

      // Primera consulta - intentar obtener todas las columnas
      let { data, error } = await supabase.from("tribes").select("*")

      if (error) {
        addLog(`Error en primera consulta de tribus: ${error.message}`)

        // Segunda consulta - intentar solo con id y name
        const result = await supabase.from("tribes").select("id, name")
        data = result.data
        error = result.error

        if (error) {
          addLog(`Error en segunda consulta de tribus: ${error.message}`)
          throw error
        }
      }

      if (!data || data.length === 0) {
        addLog("No se encontraron tribus en la base de datos")

        // Crear un mapa predeterminado para evitar errores
        const defaultMap = {
          1: "Rancho",
          2: "Hostel",
          3: "Cueva",
          4: "Chateau",
          5: "Catedral",
          6: "Estacion",
          7: "Office",
          8: "Jardin",
        }

        addLog(`Usando mapa de tribus predeterminado con ${Object.keys(defaultMap).length} entradas`)

        setDebugInfo((prev) => ({
          ...prev,
          tribesLoaded: true,
          tribesCount: Object.keys(defaultMap).length,
        }))

        return defaultMap
      }

      addLog(`Tribus cargadas: ${data.length}`)

      // Crear mapa de tribus
      const map = {}
      data.forEach((tribe) => {
        // Asegurarse de que name existe y no es null
        const tribeName = tribe.name ? tribe.name.trim() : `Tribu ${tribe.id}`
        map[tribe.id] = tribeName
        addLog(`Tribu mapeada: ID ${tribe.id} -> "${tribeName}"`)
      })

      setDebugInfo((prev) => ({
        ...prev,
        tribesLoaded: true,
        tribesCount: data.length,
      }))

      return map
    } catch (err) {
      addLog(`Error al cargar tribus: ${err.message}`)

      // Crear un mapa predeterminado como último recurso
      const fallbackMap = {
        1: "Rancho",
        2: "Hostel",
        3: "Cueva",
        4: "Chateau",
        5: "Catedral",
        6: "Estacion",
        7: "Office",
        8: "Jardin",
      }

      addLog(`FALLBACK: Usando mapa de tribus predeterminado con ${Object.keys(fallbackMap).length} entradas`)

      return fallbackMap
    }
  }

  const loadRooms = async () => {
    try {
      addLog("Cargando habitaciones...")

      // Primera consulta - intentar obtener todas las columnas
      let { data, error } = await supabase.from("rooms").select("*")

      if (error) {
        addLog(`Error en primera consulta de habitaciones: ${error.message}`)

        // Segunda consulta - intentar solo con id y room_number
        const result = await supabase.from("rooms").select("id, room_number, tribe_id")
        data = result.data
        error = result.error

        if (error) {
          addLog(`Error en segunda consulta de habitaciones: ${error.message}`)
          throw error
        }
      }

      if (!data || data.length === 0) {
        addLog("No se encontraron habitaciones en la base de datos")

        // Crear un mapa predeterminado para evitar errores
        const defaultMap = {}
        // Generar algunas habitaciones predeterminadas para cada tribu
        for (let tribeId = 1; tribeId <= 8; tribeId++) {
          for (let roomNum = 1; roomNum <= 5; roomNum++) {
            const roomId = (tribeId - 1) * 5 + roomNum
            let prefix = ""

            switch (tribeId) {
              case 1:
                prefix = "R"
                break
              case 2:
                prefix = "H"
                break
              case 3:
                prefix = "C"
                break
              case 4:
                prefix = "CH"
                break
              case 5:
                prefix = "CAT"
                break
              case 6:
                prefix = "E"
                break
              case 7:
                prefix = "O"
                break
              case 8:
                prefix = "J"
                break
              default:
                prefix = "X"
            }

            defaultMap[roomId] = `${prefix}${roomNum}`
          }
        }

        addLog(`Usando mapa de habitaciones predeterminado con ${Object.keys(defaultMap).length} entradas`)

        setDebugInfo((prev) => ({
          ...prev,
          roomsLoaded: true,
          roomsCount: Object.keys(defaultMap).length,
        }))

        return defaultMap
      }

      addLog(`Habitaciones cargadas: ${data.length}`)

      // Crear mapa de habitaciones
      const map = {}
      data.forEach((room) => {
        // Asegurarse de que room_number existe y no es null
        const roomNumber = room.room_number ? room.room_number.trim() : `Hab ${room.id}`
        map[room.id] = roomNumber
        addLog(`Habitación mapeada: ID ${room.id} -> "${roomNumber}"`)
      })

      setDebugInfo((prev) => ({
        ...prev,
        roomsLoaded: true,
        roomsCount: data.length,
      }))

      return map
    } catch (err) {
      addLog(`Error al cargar habitaciones: ${err.message}`)

      // Crear un mapa predeterminado como último recurso
      const fallbackMap = {}
      // Generar algunas habitaciones predeterminadas para cada tribu
      for (let tribeId = 1; tribeId <= 8; tribeId++) {
        for (let roomNum = 1; roomNum <= 5; roomNum++) {
          const roomId = (tribeId - 1) * 5 + roomNum
          let prefix = ""

          switch (tribeId) {
            case 1:
              prefix = "R"
              break
            case 2:
              prefix = "H"
              break
            case 3:
              prefix = "C"
              break
            case 4:
              prefix = "CH"
              break
            case 5:
              prefix = "CAT"
              break
            case 6:
              prefix = "E"
              break
            case 7:
              prefix = "O"
              break
            case 8:
              prefix = "J"
              break
            default:
              prefix = "X"
          }

          fallbackMap[roomId] = `${prefix}${roomNum}`
        }
      }

      addLog(`FALLBACK: Usando mapa de habitaciones predeterminado con ${Object.keys(fallbackMap).length} entradas`)

      return fallbackMap
    }
  }

  const loadPayments = async () => {
    try {
      addLog("Cargando pagos...")
      const { data, error } = await supabase.from("payments").select("*").limit(10)

      if (error) throw error

      if (!data || data.length === 0) {
        addLog("No se encontraron pagos")
        return []
      }

      addLog(`Pagos cargados: ${data.length}`)

      setDebugInfo((prev) => ({
        ...prev,
        paymentsLoaded: true,
        paymentsCount: data.length,
      }))

      return data
    } catch (err) {
      addLog(`Error al cargar pagos: ${err.message}`)
      throw err
    }
  }

  const mapPayments = (paymentsData, tribes, rooms) => {
    addLog(
      `Mapeando ${paymentsData.length} pagos con ${Object.keys(tribes).length} tribus y ${Object.keys(rooms).length} habitaciones`,
    )

    return paymentsData.map((payment) => {
      const tribeName = tribes[payment.tribe_id] || `Tribu ${payment.tribe_id}`
      const roomNumber = rooms[payment.room_id] || `Habitación ${payment.room_id}`
      const clientDisplay = `${tribeName} - ${roomNumber}`

      addLog(
        `Pago ${payment.id}: tribe_id=${payment.tribe_id} -> "${tribeName}", room_id=${payment.room_id} -> "${roomNumber}"`,
      )

      return {
        ...payment,
        tribe_name: tribeName,
        room_number: roomNumber,
        client_display: clientDisplay,
      }
    })
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo({
      tribesLoaded: false,
      roomsLoaded: false,
      paymentsLoaded: false,
      tribesCount: 0,
      roomsCount: 0,
      paymentsCount: 0,
      logs: [],
    })

    try {
      // Cargar tribus y habitaciones de manera síncrona
      const tribes = await loadTribes()
      setTribesMap(tribes)

      const rooms = await loadRooms()
      setRoomsMap(rooms)

      // Verificar que los mapas no estén vacíos
      if (Object.keys(tribes).length === 0) {
        addLog("ADVERTENCIA: El mapa de tribus está vacío, se usarán valores predeterminados")
      }

      if (Object.keys(rooms).length === 0) {
        addLog("ADVERTENCIA: El mapa de habitaciones está vacío, se usarán valores predeterminados")
      }

      // Cargar pagos
      const paymentsData = await loadPayments()
      setPayments(paymentsData)

      // Mapear pagos
      const mapped = mapPayments(paymentsData, tribes, rooms)
      setMappedPayments(mapped)

      addLog("Proceso completado con éxito")
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(`Error al cargar datos: ${err.message}`)
      addLog(`ERROR FATAL: ${err.message}`)
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
        <h1 className="text-2xl font-bold">Historial de Cobros (Versión Corregida)</h1>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Recargar Datos
        </Button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Estado de carga */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border rounded-lg p-4 ${debugInfo.tribesLoaded ? "bg-green-50" : "bg-gray-50"}`}>
          <h3 className="font-medium">Tribus</h3>
          <p>{debugInfo.tribesLoaded ? `${debugInfo.tribesCount} cargadas` : "No cargadas"}</p>
        </div>
        <div className={`border rounded-lg p-4 ${debugInfo.roomsLoaded ? "bg-green-50" : "bg-gray-50"}`}>
          <h3 className="font-medium">Habitaciones</h3>
          <p>{debugInfo.roomsLoaded ? `${debugInfo.roomsCount} cargadas` : "No cargadas"}</p>
        </div>
        <div className={`border rounded-lg p-4 ${debugInfo.paymentsLoaded ? "bg-green-50" : "bg-gray-50"}`}>
          <h3 className="font-medium">Pagos</h3>
          <p>{debugInfo.paymentsLoaded ? `${debugInfo.paymentsCount} cargados` : "No cargados"}</p>
        </div>
      </div>

      {/* Mapas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Mapa de Tribus ({Object.keys(tribesMap).length})</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(tribesMap, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-2">Mapa de Habitaciones ({Object.keys(roomsMap).length})</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(roomsMap, null, 2)}
          </pre>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">Pagos Mapeados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappedPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.entry_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {payment.client_display}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${Number.parseFloat(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="border rounded-lg p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-2">Logs ({debugInfo.logs.length})</h2>
        <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-60">
          {debugInfo.logs.map((log, index) => (
            <div key={index} className="py-1 border-b border-gray-200 last:border-0">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
