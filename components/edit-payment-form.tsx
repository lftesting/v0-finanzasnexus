"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getTribes, getRoomsByTribe, updatePayment, deletePayment, type Tribe, type Room } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CalendarIcon, Loader2, CheckCircle2, ArrowLeft, Home, FileText, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface EditPaymentFormProps {
  payment: any // El cobro a editar
}

export default function EditPaymentForm({ payment }: EditPaymentFormProps) {
  const router = useRouter()
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedTribe, setSelectedTribe] = useState<string>(payment.tribe_id.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [entryDate, setEntryDate] = useState<Date>(new Date(payment.entry_date))
  const [estimatedDate, setEstimatedDate] = useState<Date>(new Date(payment.estimated_payment_date))
  const [actualDate, setActualDate] = useState<Date | undefined>(
    payment.actual_payment_date ? new Date(payment.actual_payment_date) : undefined,
  )
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [documentsToRemove, setDocumentsToRemove] = useState<number[]>([])

  // Nuevos estados para los importes
  const [rentAmount, setRentAmount] = useState<string>(
    payment.rent_amount?.toString() || payment.amount?.toString() || "",
  )
  const [servicesAmount, setServicesAmount] = useState<string>(payment.services_amount?.toString() || "")
  const [totalAmount, setTotalAmount] = useState<string>(payment.amount?.toString() || "")

  // Cargar las tribus al montar el componente
  useEffect(() => {
    const loadTribes = async () => {
      const tribesData = await getTribes()
      setTribes(tribesData)
    }

    loadTribes()
  }, [])

  // Cargar las habitaciones cuando se selecciona una tribu
  useEffect(() => {
    const loadRooms = async () => {
      if (selectedTribe) {
        const roomsData = await getRoomsByTribe(Number.parseInt(selectedTribe))
        setRooms(roomsData)
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

  // Modificar la función handleSubmit para manejar múltiples archivos
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setShowSuccessMessage(false)

    try {
      const formData = new FormData(event.currentTarget)

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

      // Eliminar el campo documents que se agregó automáticamente
      formData.delete("documents")

      // Agregar cada archivo seleccionado individualmente
      selectedFiles.forEach((file, index) => {
        formData.append(`documents`, file)
      })

      // Agregar información sobre documentos a eliminar
      if (documentsToRemove.length > 0) {
        formData.append("documentsToRemove", JSON.stringify(documentsToRemove))
      }

      const result = await updatePayment(payment.id, formData)

      if (result.success) {
        // Mostrar toast
        toast({
          title: "¡Cobro actualizado correctamente!",
          description: "Los cambios han sido guardados exitosamente.",
        })

        // Mostrar mensaje de éxito en el formulario
        setShowSuccessMessage(true)

        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          router.push("/payments")
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al actualizar el pago.",
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

  const handleDelete = async () => {
    try {
      const result = await deletePayment(payment.id)

      if (result.success) {
        toast({
          title: "Cobro eliminado",
          description: "El cobro ha sido eliminado correctamente.",
        })
        router.push("/payments")
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al eliminar el cobro.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar el cobro:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
        variant: "destructive",
      })
    }
  }

  // Detalles del cobro para mostrar en el diálogo de confirmación
  const paymentDetails = (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-semibold">Tribu:</span> {payment.tribes.name}
        </div>
        <div>
          <span className="font-semibold">Habitación:</span> {payment.rooms.room_number}
        </div>
        <div>
          <span className="font-semibold">Importe total:</span> ${Number(payment.amount).toFixed(2)}
        </div>
        <div>
          <span className="font-semibold">Alquiler:</span> ${Number(payment.rent_amount || payment.amount).toFixed(2)}
        </div>
        {payment.services_amount && Number(payment.services_amount) > 0 && (
          <div>
            <span className="font-semibold">Servicios:</span> ${Number(payment.services_amount).toFixed(2)}
          </div>
        )}
        <div>
          <span className="font-semibold">Método de pago:</span>{" "}
          {payment.payment_method === "efectivo" ? "Efectivo" : "SEPA Transferencia bancaria"}
        </div>
        <div>
          <span className="font-semibold">Fecha de ingreso:</span>{" "}
          {format(new Date(payment.entry_date), "dd/MM/yyyy", { locale: es })}
        </div>
        <div>
          <span className="font-semibold">Fecha estimada:</span>{" "}
          {format(new Date(payment.estimated_payment_date), "dd/MM/yyyy", { locale: es })}
        </div>
        {payment.actual_payment_date && (
          <div>
            <span className="font-semibold">Fecha efectuada:</span>{" "}
            {format(new Date(payment.actual_payment_date), "dd/MM/yyyy", { locale: es })}
          </div>
        )}
      </div>
      {payment.comments && (
        <div>
          <span className="font-semibold">Comentarios:</span> {payment.comments}
        </div>
      )}
    </div>
  )

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Editar Cobro</CardTitle>
            <CardDescription className="text-gray-100">Modifica los detalles del cobro registrado</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-orange-700">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>
            <Link href="/payments">
              <Button variant="ghost" className="text-white hover:bg-orange-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* Fecha de ingreso */}
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
                {tribes.map((tribe) => (
                  <SelectItem key={tribe.id} value={tribe.id.toString()}>
                    {tribe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Habitación ID */}
          <div className="space-y-2">
            <Label htmlFor="roomId">Habitación ID *</Label>
            <Select
              name="roomId"
              required
              disabled={!selectedTribe || rooms.length === 0}
              defaultValue={payment.room_id.toString()}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedTribe
                      ? "Primero selecciona una tribu"
                      : rooms.length === 0
                        ? "No hay habitaciones disponibles"
                        : "Selecciona una habitación"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <RadioGroup name="paymentMethod" defaultValue={payment.payment_method} required>
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
            <RadioGroup name="bankAccount" defaultValue={payment.bank_account || ""}>
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
              defaultValue={payment.comments || ""}
            />
          </div>

          {/* Documentación adjunta (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="documents">Documentación adjunta (opcional)</Label>
            <Input
              type="file"
              id="documents"
              name="documents"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              onChange={(e) => {
                const fileList = e.target.files
                if (fileList) {
                  const newFiles = Array.from(fileList)
                  setSelectedFiles((prev) => [...prev, ...newFiles])
                }
              }}
              className="mb-2"
            />

            {/* Mostrar archivos seleccionados */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Nuevos archivos seleccionados:</p>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={`new-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="truncate max-w-[250px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                        }}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mostrar documentos existentes */}
            {payment.document_urls && payment.document_urls.length > 0 ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Documentos actuales:</p>
                <ul className="text-sm space-y-1">
                  {payment.document_urls
                    .map((url, index) => {
                      // Extraer el nombre del archivo de la URL
                      const fileName = url.split("/").pop() || `Documento ${index + 1}`
                      return (
                        <li
                          key={`existing-${index}`}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center truncate max-w-[250px]"
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            {fileName}
                          </a>
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDocumentsToRemove((prev) => [...prev, index])
                              }}
                              className="h-6 w-6 p-0 text-red-500"
                              disabled={documentsToRemove.includes(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      )
                    })
                    .filter((_, index) => !documentsToRemove.includes(index))}
                </ul>
              </div>
            ) : payment.document_url ? (
              <div className="mt-2 flex items-center text-sm">
                <span className="mr-2">Documento actual:</span>
                <a
                  href={payment.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Ver documento <CheckCircle2 className="ml-1 h-4 w-4 text-green-600" />
                </a>
              </div>
            ) : null}

            <p className="text-sm text-gray-500">
              Formatos aceptados: PDF, JPG, JPEG, PNG, DOC, DOCX (máx. 5MB por archivo)
            </p>
          </div>
        </CardContent>
        {payment.created_by && (
          <div className="mt-4 text-sm text-gray-500 px-6">
            <p>Creado por: {payment.created_by}</p>
            {payment.updated_by && <p>Última actualización por: {payment.updated_by}</p>}
          </div>
        )}
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full justify-between">
            <div className="flex space-x-2">
              <Link href="/payments">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <DeleteConfirmationDialog
                title="Eliminar cobro"
                description="¿Estás seguro de que deseas eliminar este cobro? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                itemDetails={paymentDetails}
                triggerClassName="min-w-[120px]"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>

          {showSuccessMessage && (
            <Alert className="bg-green-50 border-green-500 text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="flex items-center ml-2 text-green-700 font-medium">
                ¡Cobro actualizado correctamente! Redirigiendo al listado...
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  )
}
