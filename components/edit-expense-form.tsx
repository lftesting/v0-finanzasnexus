"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getSuppliers,
  getExpenseCategories,
  updateExpense,
  deleteExpense,
  type Supplier,
  type ExpenseCategory,
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
import { CalendarIcon, Loader2, CheckCircle2, ArrowLeft, Home, FileText, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { AddSupplierDialog } from "@/components/add-supplier-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface EditExpenseFormProps {
  expense: any // El gasto a editar
}

export default function EditExpenseForm({ expense }: EditExpenseFormProps) {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(expense.supplier_id.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date(expense.date))
  const [dueDate, setDueDate] = useState<Date>(new Date(expense.due_date))
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(
    expense.payment_date ? new Date(expense.payment_date) : undefined,
  )
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [documentsToRemove, setDocumentsToRemove] = useState<number[]>([])

  // Cargar los proveedores y categorías al montar el componente
  useEffect(() => {
    const loadData = async () => {
      const [suppliersData, categoriesData] = await Promise.all([getSuppliers(), getExpenseCategories()])
      setSuppliers(suppliersData)
      setCategories(categoriesData)
    }

    loadData()
  }, [])

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

  // Modificar la función handleSubmit para manejar múltiples archivos
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setShowSuccessMessage(false)

    try {
      const formData = new FormData(event.currentTarget)

      // Agregar las fechas al FormData
      formData.set("date", format(date, "yyyy-MM-dd"))

      if (dueDate) {
        formData.set("dueDate", format(dueDate, "yyyy-MM-dd"))
      }

      if (paymentDate) {
        formData.set("paymentDate", format(paymentDate, "yyyy-MM-dd"))
      }

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

      const result = await updateExpense(expense.id, formData)

      if (result.success) {
        // Mostrar toast
        toast({
          title: "¡Gasto actualizado correctamente!",
          description: "Los cambios han sido guardados exitosamente.",
        })

        // Mostrar mensaje de éxito en el formulario
        setShowSuccessMessage(true)

        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          router.push("/expenses/list")
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al actualizar el gasto.",
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
    // Añadir el nuevo proveedor a la lista
    setSuppliers((prev) => [...prev, supplier as Supplier])

    // Seleccionar automáticamente el nuevo proveedor
    setSelectedSupplierId(supplier.id.toString())
  }

  const handleDelete = async () => {
    try {
      const result = await deleteExpense(expense.id)

      if (result.success) {
        toast({
          title: "Gasto eliminado",
          description: "El gasto ha sido eliminado correctamente.",
        })
        router.push("/expenses/list")
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al eliminar el gasto.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar el gasto:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
        variant: "destructive",
      })
    }
  }

  // Detalles del gasto para mostrar en el diálogo de confirmación
  const expenseDetails = (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-semibold">Proveedor:</span> {expense.suppliers.name}
        </div>
        <div>
          <span className="font-semibold">Categoría:</span> {expense.expense_categories.name}
        </div>
        <div>
          <span className="font-semibold">Importe:</span> ${Number(expense.amount).toFixed(2)}
        </div>
        <div>
          <span className="font-semibold">Estado:</span> {expense.status === "pendiente" ? "Pendiente" : "Pagado"}
        </div>
        <div>
          <span className="font-semibold">Método de pago:</span>{" "}
          {expense.payment_method === "efectivo"
            ? "Efectivo"
            : expense.payment_method === "transferencia"
              ? "Transferencia"
              : expense.payment_method === "tarjeta_credito"
                ? "Tarjeta Crédito"
                : "Tarjeta Débito"}
        </div>
        <div>
          <span className="font-semibold">Fecha:</span> {format(new Date(expense.date), "dd/MM/yyyy", { locale: es })}
        </div>
        <div>
          <span className="font-semibold">Vencimiento:</span>{" "}
          {format(new Date(expense.due_date), "dd/MM/yyyy", { locale: es })}
        </div>
        {expense.payment_date && (
          <div>
            <span className="font-semibold">Fecha de pago:</span>{" "}
            {format(new Date(expense.payment_date), "dd/MM/yyyy", { locale: es })}
          </div>
        )}
        {expense.invoice_number && (
          <div>
            <span className="font-semibold">Factura:</span> {expense.invoice_number}
          </div>
        )}
      </div>
      {expense.description && (
        <div>
          <span className="font-semibold">Descripción:</span> {expense.description}
        </div>
      )}
    </div>
  )

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Editar Gasto</CardTitle>
            <CardDescription className="text-gray-100">Modifica los detalles del gasto registrado</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-orange-700">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>
            <Link href="/expenses/list">
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
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoría *</Label>
            <Select name="categoryId" defaultValue={expense.category_id.toString()} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Número de factura (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Número de factura (opcional)</Label>
            <Input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              placeholder="Ej: A-0001-00000123"
              defaultValue={expense.invoice_number || ""}
            />
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
                defaultValue={expense.amount}
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado *</Label>
            <RadioGroup name="status" defaultValue={expense.status} required>
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
            <RadioGroup name="paymentMethod" defaultValue={expense.payment_method} required>
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
            <RadioGroup name="bankAccount" defaultValue={expense.bank_account || ""}>
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
              defaultValue={expense.description || ""}
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
            {expense.document_urls && expense.document_urls.length > 0 ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-medium">Documentos actuales:</p>
                <ul className="text-sm space-y-1">
                  {expense.document_urls
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
            ) : expense.document_url ? (
              <div className="mt-2 flex items-center text-sm">
                <span className="mr-2">Documento actual:</span>
                <a
                  href={expense.document_url}
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
        {/* Añadir la información del usuario que creó y actualizó el registro */}
        {expense.created_by && (
          <div className="mt-4 text-sm text-gray-500 px-6">
            <p>Creado por: {expense.created_by}</p>
            {expense.updated_by && <p>Última actualización por: {expense.updated_by}</p>}
          </div>
        )}
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full justify-between">
            <div className="flex space-x-2">
              <Link href="/expenses/list">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <DeleteConfirmationDialog
                title="Eliminar gasto"
                description="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                itemDetails={expenseDetails}
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
                ¡Gasto actualizado correctamente! Redirigiendo al listado...
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  )
}
