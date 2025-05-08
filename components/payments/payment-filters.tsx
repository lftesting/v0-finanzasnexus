"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "@/components/icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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

export default function PaymentFilters({ filters, setFilters }: PaymentFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>(
    filters.dateRange
      ? {
          from: filters.dateRange.from,
          to: filters.dateRange.to,
        }
      : undefined,
  )
  const [tribes, setTribes] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedTribe, setSelectedTribe] = useState<string>(filters.tribe || "")
  const supabase = createClientComponentClient()

  // Cargar tribus al montar el componente
  useEffect(() => {
    const fetchTribes = async () => {
      try {
        console.log("Cargando tribus...")
        const { data, error } = await supabase.from("tribes").select("id, name").order("name")
        if (error) {
          console.error("Error al cargar tribus:", error)
          return
        }
        if (data) {
          console.log("Tribus cargadas:", data.length)
          setTribes(data)
        }
      } catch (err) {
        console.error("Error en fetchTribes:", err)
      }
    }
    fetchTribes()
  }, [])

  // Cargar habitaciones cuando se selecciona una tribu
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (selectedTribe && selectedTribe !== "all") {
          console.log("Cargando habitaciones para tribu:", selectedTribe)
          const { data, error } = await supabase
            .from("rooms")
            .select("id, room_number")
            .eq("tribe_id", selectedTribe)
            .order("room_number")

          if (error) {
            console.error("Error al cargar habitaciones:", error)
            return
          }

          if (data) {
            console.log("Habitaciones cargadas:", data.length)
            setRooms(data)
          }
        } else {
          setRooms([])
        }
      } catch (err) {
        console.error("Error en fetchRooms:", err)
      }
    }
    fetchRooms()
  }, [selectedTribe])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range)
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
    setDate(undefined)
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Seleccionar fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>

        <Select value={selectedTribe} onValueChange={handleTribeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
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

        <Select value={filters.room} onValueChange={handleRoomChange} disabled={!selectedTribe || selectedTribe === ""}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={selectedTribe ? "Todas las habitaciones" : "Seleccione tribu primero"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las habitaciones</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id.toString()}>
                {room.room_number}
              </SelectItem>
            ))}
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
