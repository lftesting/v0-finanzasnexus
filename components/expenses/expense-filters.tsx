"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ExpenseFiltersProps {
  filters: {
    dateRange: DateRange | null
    tribe: string
    room: string
    supplier: string
    category: string
    paymentMethod: string
    status: string
    search: string
  }
  setFilters: (filters: any) => void
}

export default function ExpenseFilters({ filters, setFilters }: ExpenseFiltersProps) {
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
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedTribe, setSelectedTribe] = useState<string>(filters.tribe || "")
  const [loading, setLoading] = useState({
    tribes: false,
    rooms: false,
    suppliers: false,
    categories: false,
  })
  const supabase = createClientComponentClient()

  // Cargar tribus, proveedores y categorías al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar tribus
        setLoading((prev) => ({ ...prev, tribes: true }))
        const { data: tribesData, error: tribesError } = await supabase.from("tribes").select("*").order("name")

        if (tribesError) {
          console.error("Error al cargar tribus:", tribesError)
        } else {
          setTribes(tribesData || [])
        }

        // Cargar proveedores
        setLoading((prev) => ({ ...prev, suppliers: true }))
        const { data: suppliersData, error: suppliersError } = await supabase
          .from("suppliers")
          .select("*")
          .order("name")

        if (suppliersError) {
          console.error("Error al cargar proveedores:", suppliersError)
        } else {
          setSuppliers(suppliersData || [])
        }

        // Cargar categorías
        setLoading((prev) => ({ ...prev, categories: true }))
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("expense_categories")
          .select("*")
          .order("name")

        if (categoriesError) {
          console.error("Error al cargar categorías:", categoriesError)
        } else {
          setCategories(categoriesData || [])
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
      } finally {
        setLoading((prev) => ({
          ...prev,
          tribes: false,
          suppliers: false,
          categories: false,
        }))
      }
    }

    fetchData()
  }, [])

  // Cargar habitaciones cuando se selecciona una tribu
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        if (selectedTribe && selectedTribe !== "all") {
          setLoading((prev) => ({ ...prev, rooms: true }))

          const { data, error } = await supabase
            .from("rooms")
            .select("*")
            .eq("tribe_id", selectedTribe)
            .order("room_number")

          if (error) {
            console.error("Error al cargar habitaciones:", error)
          } else {
            setRooms(data || [])
          }
        } else {
          setRooms([])
        }
      } catch (err) {
        console.error("Error al cargar habitaciones:", err)
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }))
      }
    }

    fetchRooms()
  }, [selectedTribe])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range)
    setFilters({ ...filters, dateRange: range || null })
  }

  const handleTribeChange = (value: string) => {
    setSelectedTribe(value)
    setFilters({ ...filters, tribe: value, room: "" })
  }

  const handleRoomChange = (value: string) => {
    setFilters({ ...filters, room: value })
  }

  const handleSupplierChange = (value: string) => {
    setFilters({ ...filters, supplier: value })
  }

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value })
  }

  const handlePaymentMethodChange = (value: string) => {
    setFilters({ ...filters, paymentMethod: value })
  }

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value })
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
      supplier: "",
      category: "",
      paymentMethod: "",
      status: "",
      search: "",
    })
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
              weekStartsOn={1}
            />
          </PopoverContent>
        </Popover>

        <Select value={filters.supplier} onValueChange={handleSupplierChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los proveedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proveedores</SelectItem>
            {loading.suppliers ? (
              <SelectItem value="loading" disabled>
                Cargando proveedores...
              </SelectItem>
            ) : suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-data" disabled>
                No hay proveedores disponibles
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {loading.categories ? (
              <SelectItem value="loading" disabled>
                Cargando categorías...
              </SelectItem>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-data" disabled>
                No hay categorías disponibles
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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
            <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
            <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filters.dateRange ||
        filters.tribe ||
        filters.room ||
        filters.supplier ||
        filters.category ||
        filters.paymentMethod ||
        filters.status ||
        filters.search) && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
