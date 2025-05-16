"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import ExcelExport from "@/components/export/excel-export"

const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800"]

export default function OccupancyReport() {
  const [tribes, setTribes] = useState<any[]>([])
  const [selectedTribe, setSelectedTribe] = useState<string>("all")
  const [occupancyData, setOccupancyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTribes()
  }, [])

  useEffect(() => {
    fetchOccupancyData()
  }, [selectedTribe])

  const fetchTribes = async () => {
    try {
      const { data, error } = await supabase.from("tribes").select("*").order("name")

      if (error) {
        console.error("Error al cargar tribus:", error)
        return
      }

      setTribes(data || [])
    } catch (error) {
      console.error("Error inesperado al cargar tribus:", error)
    }
  }

  const fetchOccupancyData = async () => {
    setLoading(true)
    try {
      // Consulta para obtener todas las habitaciones
      let roomsQuery = supabase.from("rooms").select("*")

      // Filtrar por tribu si se seleccionó una específica
      if (selectedTribe !== "all") {
        roomsQuery = roomsQuery.eq("tribe_id", selectedTribe)
      }

      const { data: roomsData, error: roomsError } = await roomsQuery

      if (roomsError) {
        console.error("Error al cargar habitaciones:", roomsError)
        return
      }

      // Consulta para obtener pagos recientes (último mes)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("room_id, entry_date")
        .gte("entry_date", format(thirtyDaysAgo, "yyyy-MM-dd"))

      if (paymentsError) {
        console.error("Error al cargar pagos:", paymentsError)
        return
      }

      // Crear mapa de habitaciones ocupadas (con pago en el último mes)
      const occupiedRoomIds = new Set(paymentsData?.map((payment) => payment.room_id) || [])

      // Calcular estadísticas de ocupación
      const totalRooms = roomsData?.length || 0
      const occupiedRooms = roomsData?.filter((room) => occupiedRoomIds.has(room.id)).length || 0
      const vacantRooms = totalRooms - occupiedRooms

      // Preparar datos para el gráfico
      const chartData = [
        { name: "Ocupadas", value: occupiedRooms },
        { name: "Vacantes", value: vacantRooms },
      ]

      setOccupancyData(chartData)
    } catch (error) {
      console.error("Error inesperado al cargar datos de ocupación:", error)
    } finally {
      setLoading(false)
    }
  }

  // Preparar datos detallados para exportación
  const prepareExportData = () => {
    // En un entorno real, esto incluiría datos detallados de cada habitación
    return tribes.map((tribe) => {
      const tribeRooms = occupancyData.filter((room) => room.tribe_id === tribe.id)
      const totalRooms = tribeRooms.length
      const occupiedRooms = tribeRooms.filter((room) => room.occupied).length
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

      return {
        Tribu: tribe.name,
        "Total Habitaciones": totalRooms,
        "Habitaciones Ocupadas": occupiedRooms,
        "Habitaciones Vacantes": totalRooms - occupiedRooms,
        "Tasa de Ocupación (%)": occupancyRate.toFixed(2),
      }
    })
  }

  const occupancyRate =
    occupancyData.length > 0 ? (occupancyData[0].value / (occupancyData[0].value + occupancyData[1].value)) * 100 : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Reporte de Ocupación</CardTitle>
          <CardDescription>Tasa de ocupación actual de habitaciones</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTribe} onValueChange={setSelectedTribe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las tribus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tribus</SelectItem>
              {tribes.map((tribe) => (
                <SelectItem key={tribe.id} value={tribe.id.toString()}>
                  {tribe.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ExcelExport data={prepareExportData()} filename="Reporte_Ocupacion" buttonText="Exportar" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium">Tasa de Ocupación</h3>
              <div className="text-5xl font-bold mt-2">{occupancyRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-500 mt-2">
                {occupancyData.length > 0
                  ? `${occupancyData[0].value} de ${occupancyData[0].value + occupancyData[1].value} habitaciones ocupadas`
                  : "Cargando datos..."}
              </p>

              <div className="mt-6">
                <h4 className="text-sm font-medium">Detalles</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Ocupadas</div>
                    <div className="text-xl font-bold text-green-700">
                      {occupancyData.length > 0 ? occupancyData[0].value : 0}
                    </div>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Vacantes</div>
                    <div className="text-xl font-bold text-red-700">
                      {occupancyData.length > 0 ? occupancyData[1].value : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
