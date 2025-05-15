"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getTribes, getRoomsByTribe, createPayment, type Tribe, type Room } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CalendarIcon, Loader2, CheckCircle2, X, Paperclip, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"

export default function PaymentForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedTribe, setSelectedTribe] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [entryDate, setEntryDate] = useState<Date>(new Date())
  const [estimatedDate, setEstimatedDate] = useState<Date | undefined>(undefined)
  const [actualDate, setActualDate] = useState<Date | undefined>(undefined)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)

  // Nuevos estados para los importes
  const [rentAmount, setRentAmount] = useState<string>("")
  const [servicesAmount, setServicesAmount] = useState<string>("")
  const [totalAmount, setTotalAmount] = useState<string>("")

  // Cargar las tribus al montar el componente
  useEffect(() => {
    const loadTribes = async () => {
      try {
        const tribesData = await getTribes()
        console.log("Tribus cargadas:", tribesData)
        setTribes(tribesData)
      } catch (error) {
        console.error("Error al cargar las tribus:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las tribus. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      }
    }

    loadTribes()
  }, [])

  // Cargar las habitaciones cuando se selecciona una tribu
  useEffect(() => {
    const loadRooms = async () => {
      if (selectedTribe && selectedTribe !== "none") {
        setIsLoadingRooms(true)
        try {
          console.log("Cargando habitaciones para la tribu:", selectedTribe)
          const roomsData = await getRoomsByTribe(Number.parseInt(selectedTribe))
          console.log("Habitaciones cargadas:", roomsData)
          setRooms(roomsData)
        } catch (error) {
          console.error("Error al cargar las habitaciones:", error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las habitaciones para esta tribu.",
            variant: "destructive",
          })
          setRooms([])
        } finally {
          setIsLoadingRooms(false)
        }
      } else {
        setRooms([])
      }
    }

    loadRooms()
  }, [selectedTribe])

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

  // Efecto para calcular el total cuando cambian los importes de alquiler y servicios
  useEffect(() => {
    const rent = Number.parseFloat(rentAmount) || 0
    const services = Number.parseFloat(servicesAmount) || 0
    const total = rent + services

    if (total > 0) {
      setTotalAmount(total.toFixed(2))
    } else {
      setTotalAmount("")
    }
  }, [rentAmount, servicesAmount])

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

      // Agregar el usuario actual al FormData
      if (user?.email) {
        formData.set("userEmail", user.email)
      }

      // Agregar las fechas al FormData
      formData.set("entryDate", format(entryDate, "yyyy-MM-dd"))

      if (estimatedDate) {
        formData.set("estimatedPaymentDate", format(estimatedDate, "yyyy-MM-dd"))
      }

      if (actualDate) {
        formData.set("actualPaymentDate", format(actualDate, "yyyy-MM-dd"))
      }

      // Agregar los importes al FormData
      formData.set("rentAmount", rentAmount || "0")
      formData.set("servicesAmount", servicesAmount || "0")
      formData.set("amount", totalAmount || "0")

      // Agregar los archivos seleccionados al FormData
      selectedFiles.forEach((file, index) => {
        formData.append(`document_${index}`, file)
      })

      // Agregar el número total de archivos
      formData.set("documentCount", selectedFiles.length.toString())

      const result = await createPayment(formData)

      if (result.success) {
        // Mostrar toast
        toast({
          title: "¡Cobro ingresado correctamente!",
          description: "El cobro ha sido registrado exitosamente en la base de datos.",
        })

        // Mostrar mensaje de éxito en el formulario
        setShowSuccessMessage(true)

        // Resetear el formulario completamente
        event.currentTarget.reset()
        setSelectedTribe("")
        setRooms([])
        setEstimatedDate(undefined)
        setActualDate(undefined)
        setEntryDate(new Date()) // Reiniciar a la fecha actual
        setSelectedFiles([]) // Limpiar los archivos seleccionados
        setRentAmount("")
        setServicesAmount("")
        setTotalAmount("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al registrar el pago.",
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-700 text-white">
        <CardTitle className="text-2xl">Registro de Cobros - Nexus Co-living</CardTitle>
        <CardDescription className="text-gray-100">Ingresa los detalles del cobro a registrar</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} id="payment-form">
        <CardContent className="space-y-6 pt-6">
          {/* Fecha de ingreso (autocompletada) */}
          <div className="space-y-2">
            <Label htmlFor="entryDate">Fecha de ingreso</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !entryDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {entryDate ? format(entryDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={entryDate}
                  onSelect={(date) => date && setEntryDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha estimada de cobro */}
          <div className="space-y-2">
            <Label htmlFor="estimatedPaymentDate">Fecha estimada de cobro *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !estimatedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {estimatedDate ? format(estimatedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={estimatedDate}
                  onSelect={(date) => date && setEstimatedDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha efectuada (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="actualPaymentDate">Fecha efectuada (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !actualDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualDate ? format(actualDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={actualDate}
                  onSelect={(date) => setActualDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tribu */}
          <div className="space-y-2">
            <Label htmlFor="tribeId">Tribu *</Label>
            <Select name="tribeId" value={selectedTribe} onValueChange={setSelectedTribe} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una tribu" />
              </SelectTrigger>
              <SelectContent>
                {tribes.length > 0 ? (
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
            {tribes.length === 0 && (
              <p className="text-xs text-amber-600">No se encontraron tribus. Contacta al administrador.</p>
            )}
          </div>

          {/* Habitación ID */}
          <div className="space-y-2">
            <Label htmlFor="roomId">Habitación ID *</Label>
            <Select name="roomId" required disabled={!selectedTribe || isLoadingRooms}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingRooms
                      ? "Cargando habitaciones..."
                      : !selectedTribe
                        ? "Primero selecciona una tribu"
                        : rooms.length === 0
                          ? "No hay habitaciones disponibles"
                          : "Selecciona una habitación"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRooms ? (
                  <div className="p-2 text-center text-sm text-gray-500">Cargando habitaciones...</div>
                ) : rooms.length > 0 ? (
                  rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.room_number}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No hay habitaciones disponibles</div>
                )}
              </SelectContent>
            </Select>
            {selectedTribe && !isLoadingRooms && rooms.length === 0 && (
              <p className="text-xs text-amber-600">No hay habitaciones disponibles para esta tribu</p>
            )}
          </div>

          {/* Sección de importes */}
          <div className="space-y-4 border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium text-gray-700">Desglose de importes</h3>

            {/* Importe de alquiler */}
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Importe de alquiler *</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <Input
                  type="number"
                  id="rentAmount"
                  name="rentAmount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Importe de servicios */}
            <div className="space-y-2">
              <Label htmlFor="servicesAmount">Importe de servicios (opcional)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <Input
                  type="number"
                  id="servicesAmount"
                  name="servicesAmount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  value={servicesAmount}
                  onChange={(e) => setServicesAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Importe total (calculado automáticamente) */}
            <div className="space-y-2">
              <Label htmlFor="amount">Importe total *</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7 bg-gray-100"
                  required
                  value={totalAmount}
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500">
                El importe total se calcula automáticamente sumando el alquiler y los servicios.
              </p>
            </div>
          </div>

          {/* Forma de cobro */}
          <div className="space-y-2">
            <Label>Forma de cobro *</Label>
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

          {/* Comentarios (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios (opcional)</Label>
            <Textarea
              id="comments"
              name="comments"
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
                setRentAmount("")
                setServicesAmount("")
                setTotalAmount("")
                if (document.getElementById("payment-form") as HTMLFormElement) {
                  ;(document.getElementById("payment-form") as HTMLFormElement).reset()
                }
              }}
              disabled={isLoading}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={isLoading || !estimatedDate || !rentAmount}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Registrar cobro"
              )}
            </Button>
          </div>

          {showSuccessMessage && (
            <Alert className="bg-green-50 border-green-500 text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="flex items-center ml-2 text-green-700 font-medium">
                ¡Cobro ingresado correctamente! El registro ha sido guardado en la base de datos.
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  )
}
