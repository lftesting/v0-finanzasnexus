"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface AddSupplierDialogProps {
  onSupplierAdded: (supplier: { id: number; name: string }) => void
}

export function AddSupplierDialog({ onSupplierAdded }: AddSupplierDialogProps) {
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [formError, setFormError] = useState("")

  const isValidEmail = (email: string) => {
    return email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateForm = () => {
    setFormError("")

    // Validar que el nombre no esté vacío
    if (!name.trim()) {
      setFormError("El nombre del proveedor es obligatorio")
      return false
    }

    // Validar email si se ha ingresado
    if (email && !isValidEmail(email)) {
      setEmailError("Por favor ingrese un email válido")
      return false
    } else {
      setEmailError("")
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validar el formulario antes de proceder
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setFormError("")

    try {
      console.log("Enviando datos del proveedor:", { name, contactPerson, email, phone, address })

      const response = await fetch("/api/suppliers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contact_person: contactPerson || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
        }),
      })

      const result = await response.json()

      console.log("Resultado de la API:", result)

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el proveedor")
      }

      if (result.success && result.data) {
        toast({
          title: "Proveedor creado",
          description: `El proveedor "${name}" ha sido creado exitosamente.`,
        })

        // Llamar a la función de callback con los datos del proveedor
        onSupplierAdded(result.data)

        // Cerrar el diálogo y resetear el formulario
        setOpen(false)
        resetForm()
      } else {
        // Mostrar el error específico o un mensaje genérico
        const errorMessage = result.error || "Ha ocurrido un error al crear el proveedor."
        setFormError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al crear el proveedor:", error)
      setFormError(error.message || "Ha ocurrido un error al procesar la solicitud.")
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al procesar la solicitud.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setContactPerson("")
    setPhone("")
    setEmail("")
    setAddress("")
    setEmailError("")
    setFormError("")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Agregar nuevo proveedor</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo proveedor. Haz clic en guardar cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">{formError}</div>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactPerson" className="text-right">
                  Contacto
                </Label>
                <Input
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-3"
                  type="tel"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError("")
                    }}
                    className={emailError ? "border-red-500" : ""}
                    type="email"
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Dirección
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar proveedor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
