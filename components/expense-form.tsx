"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  getSuppliers,
  getExpenseCategories,
  getTribes,
  createExpense,
  type Supplier,
  type ExpenseCategory,
  type Tribe,
  type Room,
  getRoomsByTribe,
} from "@/app/expense-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CalendarIcon, Loader2, CheckCircle2, X, Paperclip, FileText, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddSupplierDialog } from "@/components/add-supplier-dialog"

export default function ExpenseForm() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
  const [selectedTribeId, setSelectedTribeId] = useState<string>("")
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTribes, setIsLoadingTribes] = useState(true)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [tribesError, setTribesError] = useState<string | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar los proveedores, categorías, tribus y habitaciones al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, categoriesData] = await Promise.all([getSuppliers(), getExpenseCategories()])
        console.log("Datos cargados:", {
          suppliers: suppliersData.length,
          categories: categoriesData.length,
        })
        setSuppliers(suppliersData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar algunos datos. Por favor, recarga la página.",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [])

  // Cargar tribus en un useEffect separado para mejor manejo de errores
  useEffect(() => {
    const loadTribes = async () => {
      try {
        setIsLoadingTribes(true)
        setTribesError(null)
        console.log("Cargando tribus...")
        const tribesData = await getTribes()
        console.log("Tribus cargadas:", tribesData)

        if (!tribesData || tribesData.length === 0) {
          setTribesError("No se encontraron tribus en la base de datos")
        } else {
          setTribes(tribesData)
        }
      } catch (error) {
        console.error("Error al cargar tribus:", error)
        setTribesError("Error al cargar tribus: " + (error.message || "Error desconocido"))
      } finally {
        setIsLoadingTribes(false)
      }
    }

    loadTribes()
  }, [])

  // Add a new useEffect to filter rooms when tribe changes
  useEffect(() => {
    const filterRoomsByTribe = async () => {
      if (selectedTribeId && selectedTribeId !== "none") {
        setIsLoadingRooms(true)
        try {
          console.log("Cargando habitaciones para la tribu:", selectedTribeId)
          const roomsData = await getRoomsByTribe(Number.parseInt(selectedTribeId))
          console.log("Habitaciones cargadas:", roomsData)
          setFilteredRooms(roomsData)
        } catch (error) {
          console.error("Error al cargar habitaciones por tribu:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las habitaciones para esta tribu.",
            variant: "destructive",
          })
          setFilteredRooms([])
        } finally {
          setIsLoadingRooms(false)
        }
      } else {
        setFilteredRooms([])
        // Reset room selection if tribe is deselected
        if (selectedRoomId) {
          setSelectedRoomId("")
        }
      }
    }

    filterRoomsByTribe()
  }, [selectedTribeId])

  // Efecto para ocultar el mensaje de éxito después de 5 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...newFiles])

      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setShowSuccessMessage(false)

    try {
      const formData = new FormData(event.currentTarget)

      // Eliminar el campo document del FormData ya que lo manejaremos manualmente
      formData.delete("document")

      // Agregar las fechas al FormData
      formData.set("date", format(date, "yyyy-MM-dd"))

      if (dueDate) {
        formData.set("dueDate", format(dueDate, "yyyy-MM-dd"))
      }

      if (paymentDate) {
        formData.set("paymentDate", format(paymentDate, "yyyy-MM-dd"))
      }

      // Agregar los archivos seleccionados al FormData
      selectedFiles.forEach((file, index) => {
        formData.append(`document_${index}`, file)
      })

      // Agregar el número total de archivos
      formData.set("documentCount", selectedFiles.length.toString())

      const result = await createExpense(formData)

      if (result.success) {
        // Mostrar toast
        toast({
          title: "¡Gasto ingresado correctamente!",
          description: "El gasto ha sido registrado exitosamente en la base de datos.",
        })

        // Mostrar mensaje de éxito en el formulario
        setShowSuccessMessage(true)

        // Resetear el formulario completamente
        event.currentTarget.reset()
        setDueDate(undefined)
        setPaymentDate(undefined)
        setDate(new Date()) // Reiniciar a la fecha actual
        setSelectedSupplierId("")
        setSelectedTribeId("")
        setSelectedRoomId("")
        setSelectedFiles([]) // Limpiar los archivos seleccionados
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al registrar el gasto.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSupplierAdded = (supplier: { id: number; name: string }) => {
    console.log("Proveedor añadido:", supplier)

    // Añadir el nuevo proveedor a la lista
    setSuppliers((prev) => {
      // Verificar si el proveedor ya existe en la lista
      const exists = prev.some((p) => p.id === supplier.id)
      if (exists) {
        console.log("El proveedor ya existe en la lista")
        return prev
      }
      // Ordenar la lista alfabéticamente después de agregar el nuevo proveedor
      const updatedSuppliers = [...prev, supplier as Supplier].sort((a, b) => a.name.localeCompare(b.name))
      console.log("Lista actualizada de proveedores:", updatedSuppliers)
      return updatedSuppliers
    })

    // Seleccionar automáticamente el nuevo proveedor
    setSelectedSupplierId(supplier.id.toString())
    console.log("Proveedor seleccionado:", supplier.id.toString())

    // Mostrar un mensaje de confirmación
    toast({
      title: "Proveedor seleccionado",
      description: `Se ha seleccionado automáticamente el proveedor "${supplier.name}"`,
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-700 text-white">
        <CardTitle className="text-2xl">Registro de Gastos - Nexus Co-living</CardTitle>
        <CardDescription className="text-gray-100">Ingresa los detalles del gasto a registrar</CardDescription>
      </CardHeader>

      {/* Mostrar información de depuración */}
      {tribesError && (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{tribesError}</AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} id="expense-form">
        <CardContent className="space-y-6 pt-6">
          {/* Fecha de ingreso (autocompletada) */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de ingreso</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de vencimiento */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha de vencimiento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de pago (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Fecha de pago (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => setPaymentDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Proveedor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="supplierId">Proveedor *</Label>
              <AddSupplierDialog onSupplierAdded={handleSupplierAdded} />
            </div>
            <Select name="supplierId" value={selectedSupplierId} onValueChange={setSelectedSupplierId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No hay proveedores disponibles</div>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Si el proveedor no existe, puedes crearlo haciendo clic en "Nuevo"</p>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoría *</Label>
            <Select name="categoryId" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No hay categorías disponibles</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tribu (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="tribeId">Tribu (opcional)</Label>
            <Select
              name="tribeId"
              value={selectedTribeId}
              onValueChange={setSelectedTribeId}
              disabled={isLoadingTribes}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTribes ? "Cargando tribus..." : "Selecciona una tribu"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna</SelectItem>
                {isLoadingTribes ? (
                  <div className="p-2 text-center text-sm text-gray-500">Cargando tribus...</div>
                ) : tribes.length > 0 ? (
                  tribes.map((tribe) => (
                    <SelectItem key={tribe.id} value={tribe.id.toString()}>
                      {tribe.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No hay tribus disponibles</div>
                )}
              </SelectContent>
            </Select>
            {tribesError && <p className="text-xs text-red-500">{tribesError}</p>}
          </div>

          {/* Habitación (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="roomId">Habitación (opcional)</Label>
            <Select
              name="roomId"
              value={selectedRoomId}
              onValueChange={setSelectedRoomId}
              disabled={!selectedTribeId || selectedTribeId === "none" || isLoadingRooms}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingRooms
                      ? "Cargando habitaciones..."
                      : !selectedTribeId || selectedTribeId === "none"
                        ? "Primero selecciona una tribu"
                        : filteredRooms.length === 0
                          ? "No hay habitaciones disponibles"
                          : "Selecciona una habitación"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRooms ? (
                  <div className="p-2 text-center text-sm text-gray-500">Cargando habitaciones...</div>
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.room_number}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No hay habitaciones disponibles</div>
                )}
              </SelectContent>
            </Select>
            {selectedTribeId && selectedTribeId !== "none" && !isLoadingRooms && filteredRooms.length === 0 && (
              <p className="text-xs text-amber-600">No hay habitaciones disponibles para esta tribu</p>
            )}
          </div>

          {/* Número de factura (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Número de factura (opcional)</Label>
            <Input type="text" id="invoiceNumber" name="invoiceNumber" placeholder="Ej: A-0001-00000123" />
          </div>

          {/* Importe */}
          <div className="space-y-2">
            <Label htmlFor="amount">Importe *</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <Input
                type="number"
                id="amount"
                name="amount"
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado *</Label>
            <RadioGroup name="status" defaultValue="pendiente" required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pendiente" id="pendiente" />
                <Label htmlFor="pendiente" className="cursor-pointer">
                  Pendiente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pagado" id="pagado" />
                <Label htmlFor="pagado" className="cursor-pointer">
                  Pagado
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Forma de pago */}
          <div className="space-y-2">
            <Label>Forma de pago *</Label>
            <RadioGroup name="paymentMethod" defaultValue="efectivo" required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label htmlFor="efectivo" className="cursor-pointer">
                  Efectivo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label htmlFor="transferencia" className="cursor-pointer">
                  SEPA Transferencia bancaria
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tarjeta_credito" id="tarjeta_credito" />
                <Label htmlFor="tarjeta_credito" className="cursor-pointer">
                  Tarjeta de crédito
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tarjeta_debito" id="tarjeta_debito" />
                <Label htmlFor="tarjeta_debito" className="cursor-pointer">
                  Tarjeta de débito
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Cuenta bancaria (opcional) */}
          <div className="space-y-2">
            <Label>Cuenta bancaria (opcional)</Label>
            <RadioGroup name="bankAccount" defaultValue="">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nexus" id="nexus" />
                <Label htmlFor="nexus" className="cursor-pointer">
                  Nexus
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="santander_juan_inmo" id="santander_juan_inmo" />
                <Label htmlFor="santander_juan_inmo" className="cursor-pointer">
                  Santander Juan-Inmo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="santander_juan_mauro" id="santander_juan_mauro" />
                <Label htmlFor="santander_juan_mauro" className="cursor-pointer">
                  Santander Juan-Mauro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sabadell_juan_mauro" id="sabadell_juan_mauro" />
                <Label htmlFor="sabadell_juan_mauro" className="cursor-pointer">
                  Sabadell Juan-Mauro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="santander_juan_ameline" id="santander_juan_ameline" />
                <Label htmlFor="santander_juan_ameline" className="cursor-pointer">
                  Santander Juan-Ameline
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Descripción (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Agrega cualquier información adicional relevante"
              className="min-h-[100px]"
            />
          </div>

          {/* Documentación adjunta (opcional) - Múltiples archivos */}
          <div className="space-y-2">
            <Label>Documentación adjunta (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                id="document"
                name="document"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="flex-1"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Adjuntar
              </Button>
            </div>

            {/* Lista de archivos seleccionados */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Archivos seleccionados ({selectedFiles.length}):</p>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Formatos aceptados: PDF, JPG, JPEG, PNG, DOC, DOCX (máx. 5MB por archivo)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setSelectedFiles([])
                if (document.getElementById("expense-form") as HTMLFormElement) {
                  ;(document.getElementById("expense-form") as HTMLFormElement).reset()
                }
              }}
              disabled={isLoading}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={isLoading || !dueDate}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Registrar gasto"
              )}
            </Button>
          </div>

          {showSuccessMessage && (
            <Alert className="bg-green-50 border-green-500 text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="flex items-center ml-2 text-green-700 font-medium">
                ¡Gasto ingresado correctamente! El registro ha sido guardado en la base de datos.
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  )
}
