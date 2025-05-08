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
import { Loader2, Plus } from "lucide-react"
import { createSupplier } from "@/app/expense-actions"
import { toast } from "@/components/ui/use-toast"

interface AddSupplierDialogProps {
  onSupplierAdded: (supplier: { id: number; name: string }) => void
}

export function AddSupplierDialog({ onSupplierAdded }: AddSupplierDialogProps) {
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const isValidEmail = (email: string) => {
    return email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const [emailError, setEmailError] = useState("")

  // Agregar esta función para validar el email antes de enviar
  const validateForm = () => {
    let isValid = true

    // Validar email si se ha ingresado
    if (email && !isValidEmail(email)) {
      setEmailError("Por favor ingrese un email válido")
      isValid = false
    } else {
      setEmailError("")
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validar el formulario antes de proceder
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await createSupplier({
        name,
        contact_person: contactPerson || null,
        phone: phone || null,
        email: email || null,
      })

      if (result.success) {
        toast({
          title: "Proveedor creado",
          description: "El proveedor ha sido creado exitosamente.",
        })
        onSupplierAdded(result.data)
        setOpen(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al crear el proveedor.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear el proveedor:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
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
  }

  return (
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre *
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
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
  )
}
