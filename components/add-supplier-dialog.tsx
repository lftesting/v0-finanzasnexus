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
import type { Supplier } from "@/types/payment"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AddSupplierDialogProps {
  onSupplierAdded: (supplier: Supplier) => void
}

export function AddSupplierDialog({ onSupplierAdded }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar que el nombre no esté vacío
    if (!name.trim()) {
      setError("El nombre del proveedor es obligatorio")
      return
    }

    setIsLoading(true)

    try {
      console.log("Enviando datos del proveedor:", { name, contactPerson, phone, email, address })

      const response = await fetch("/api/suppliers/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          contact_person: contactPerson,
          phone,
          email,
          address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el proveedor")
      }

      console.log("Proveedor creado exitosamente:", data.supplier)

      // Llamar a la función de callback con el nuevo proveedor
      onSupplierAdded(data.supplier)

      // Limpiar el formulario y cerrar el diálogo
      resetForm()
      setOpen(false)
    } catch (err) {
      console.error("Error al crear el proveedor:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al crear el proveedor")
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
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Agregar Proveedor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Proveedor</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo proveedor. Haz clic en guardar cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre*
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
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Proveedor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
