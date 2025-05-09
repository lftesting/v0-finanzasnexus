"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"

interface PaymentFiltersProps {
  filters: {
    dateRange: DateRange | null
    tribe: string
    room: string
    paymentMethod: string
    search: string
  }
  setFilters: (filters: any) => void
}

export default function PaymentFiltersSimple({ filters, setFilters }: PaymentFiltersProps) {
  const [tribes, setTribes] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedTribe, setSelectedTribe] = useState<string>(filters.tribe || "")
  const [loading, setLoading] = useState({
    tribes: false,
    rooms: false,
  })
  const supabase = createClientComponentClient()

  // Cargar tribus directamente desde la base de datos
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        setLoading((prev) => ({ ...prev, tribes: true }))
        console.log("Cargando tribus...")

        // Consulta SQL directa
        const { data, error } = await supabase.from("tribes").select("*")

        if (error) {
          console.error("Error al cargar tribus:", error)
          return
        }

        console.log("Tribus cargadas:", data)
        if (data && data.length > 0) {
          // Ordenar por nombre
          const sortedTribes = [...data].sort((a, b) => a.name.localeCompare(b.name))
          setTribes(sortedTribes)
        }
      } catch (err) {
        console.error("Error en fetchTribes:", err)
      } finally {
        setLoading((prev) => ({ ...prev, tribes: false }))
      }
    }

    fetchTribes()
  }, [])

  // Cargar habitaciones cuando se selecciona una tribu
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (selectedTribe && selectedTribe !== "all") {
          setLoading((prev) => ({ ...prev, rooms: true }))
          console.log("Cargando habitaciones para tribu:", selectedTribe)

          const { data, error } = await supabase.from("rooms").select("*").eq("tribe_id", selectedTribe)

          if (error) {
            console.error("Error al cargar habitaciones:", error)
            return
          }

          console.log("Habitaciones cargadas:", data)
          if (data && data.length > 0) {
            // Ordenar por número de habitación
            const sortedRooms = [...data].sort((a, b) => a.room_number.localeCompare(b.room_number))
            setRooms(sortedRooms)
          } else {
            setRooms([])
          }
        } else {
          setRooms([])
        }
      } catch (err) {
        console.error("Error en fetchRooms:", err)
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }))
      }
    }

    fetchRooms()
  }, [selectedTribe])

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters({ ...filters, dateRange: range || null })
  }

  const handleTribeChange = (value: string) => {
    console.log("Tribu seleccionada:", value)
    setSelectedTribe(value)
    setFilters({ ...filters, tribe: value, room: "" })
  }

  const handleRoomChange = (value: string) => {
    console.log("Habitación seleccionada:", value)
    setFilters({ ...filters, room: value })
  }

  const handlePaymentMethodChange = (value: string) => {
    console.log("Método de pago seleccionado:", value)
    setFilters({ ...filters, paymentMethod: value })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value })
  }

  const clearFilters = () => {
    setSelectedTribe("")
    setFilters({
      dateRange: null,
      tribe: "",
      room: "",
      paymentMethod: "",
      search: "",
    })
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-8 w-full sm:w-[250px]"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <DatePickerWithRange dateRange={filters.dateRange} onChange={handleDateRangeChange} />

        <Select value={selectedTribe} onValueChange={handleTribeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todas las tribus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las tribus</SelectItem>
            {loading.tribes ? (
              <SelectItem value="loading" disabled>
                Cargando tribus...
              </SelectItem>
            ) : tribes.length > 0 ? (
              tribes.map((tribe) => (
                <SelectItem key={tribe.id} value={tribe.id.toString()}>
                  {tribe.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-data" disabled>
                No hay tribus disponibles
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select value={filters.room} onValueChange={handleRoomChange} disabled={!selectedTribe || selectedTribe === ""}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={selectedTribe ? "Todas las habitaciones" : "Seleccione tribu primero"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las habitaciones</SelectItem>
            {loading.rooms ? (
              <SelectItem value="loading" disabled>
                Cargando habitaciones...
              </SelectItem>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  {room.room_number}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-data" disabled>
                No hay habitaciones disponibles
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select value={filters.paymentMethod} onValueChange={handlePaymentMethodChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los métodos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los métodos</SelectItem>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="transferencia">Transferencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filters.dateRange || filters.tribe || filters.room || filters.paymentMethod || filters.search) && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
