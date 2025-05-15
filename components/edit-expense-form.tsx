"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { updateExpense, getTribes, getRoomsByTribe } from "@/app/expense-actions"

// Esquema de validación para el formulario
const formSchema = z.object({
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  due_date: z.date({
    required_error: "La fecha de vencimiento es requerida",
  }),
  supplier_id: z.string({
    required_error: "El proveedor es requerido",
  }),
  category_id: z.string({
    required_error: "La categoría es requerida",
  }),
  amount: z.string().min(1, "El monto es requerido"),
  description: z.string().optional(),
  invoice_number: z.string().optional(),
  tribe_id: z.string().optional(),
  room_id: z.string().optional(),
})

export default function EditExpenseForm({ expense, suppliers = [], categories = [] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tribes, setTribes] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedTribe, setSelectedTribe] = useState(expense.tribe_id ? expense.tribe_id.toString() : "")
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)

  // Inicializar el formulario con los valores del gasto
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: expense.date ? new Date(expense.date) : new Date(),
      due_date: expense.due_date ? new Date(expense.due_date) : new Date(),
      supplier_id: expense.supplier_id ? expense.supplier_id.toString() : "",
      category_id: expense.category_id ? expense.category_id.toString() : "",
      amount: expense.amount ? expense.amount.toString() : "",
      description: expense.description || "",
      invoice_number: expense.invoice_number || "",
      tribe_id: expense.tribe_id ? expense.tribe_id.toString() : "",
      room_id: expense.room_id ? expense.room_id.toString() : "",
    },
  })

  // Cargar tribus al montar el componente
  useEffect(() => {
    const loadTribes = async () => {
      try {
        const tribesData = await getTribes()
        console.log("Tribus cargadas:", tribesData)
        setTribes(tribesData)
      } catch (error) {
        console.error("Error al cargar tribus:", error)
      }
    }

    loadTribes()
  }, [])

  // Cargar habitaciones cuando cambia la tribu seleccionada o al iniciar
  useEffect(() => {
    const loadRooms = async () => {
      if (!selectedTribe || selectedTribe === "") {
        setRooms([])
        return
      }

      try {
        setIsLoadingRooms(true)
        const tribeId = Number.parseInt(selectedTribe, 10)
        const roomsData = await getRoomsByTribe(tribeId)
        console.log("Habitaciones cargadas para tribu", tribeId, ":", roomsData)
        setRooms(roomsData)
      } catch (error) {
        console.error("Error al cargar habitaciones:", error)
        setRooms([])
      } finally {
        setIsLoadingRooms(false)
      }
    }

    loadRooms()
  }, [selectedTribe])

  // Manejar cambio de tribu
  const handleTribeChange = (value) => {
    setSelectedTribe(value)
    form.setValue("tribe_id", value)
    form.setValue("room_id", "") // Resetear habitación al cambiar tribu
  }

  // Manejar envío del formulario
  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      // Convertir valores numéricos
      const formattedValues = {
        ...values,
        id: expense.id,
        supplier_id: Number.parseInt(values.supplier_id, 10),
        category_id: Number.parseInt(values.category_id, 10),
        amount: Number.parseFloat(values.amount),
        tribe_id: values.tribe_id ? Number.parseInt(values.tribe_id, 10) : null,
        room_id: values.room_id ? Number.parseInt(values.room_id, 10) : null,
      }

      await updateExpense(formattedValues)
      router.push("/expenses")
    } catch (error) {
      console.error("Error al actualizar gasto:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha de vencimiento */}
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de vencimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proveedor */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No hay proveedores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categoría */}
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Monto */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Número de factura */}
          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de factura</FormLabel>
                <FormControl>
                  <Input placeholder="Número de factura" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tribu */}
          <FormField
            control={form.control}
            name="tribe_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tribu</FormLabel>
                <Select onValueChange={(value) => handleTribeChange(value)} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tribu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tribes.length > 0 ? (
                      tribes.map((tribe) => (
                        <SelectItem key={tribe.id} value={tribe.id.toString()}>
                          {tribe.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No se encontraron tribus. Contacta al administrador.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Habitación */}
          <FormField
            control={form.control}
            name="room_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habitación</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedTribe || isLoadingRooms}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingRooms
                            ? "Cargando habitaciones..."
                            : !selectedTribe
                              ? "Primero selecciona una tribu"
                              : "Seleccionar habitación"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingRooms ? (
                      <SelectItem value="loading" disabled>
                        Cargando habitaciones...
                      </SelectItem>
                    ) : !selectedTribe ? (
                      <SelectItem value="none" disabled>
                        Primero selecciona una tribu
                      </SelectItem>
                    ) : rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.room_number}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No hay habitaciones para esta tribu
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del gasto" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Actualizando..." : "Actualizar gasto"}
        </Button>
      </form>
    </Form>
  )
}
