"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface AddSupplierDialogProps {
  isOpen: boolean
  onClose: () => void
  onSupplierAdded: (supplier: any) => void
}

export function AddSupplierDialog({ isOpen, onClose, onSupplierAdded }: AddSupplierDialogProps) {
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación básica
    if (!name.trim()) {
      setError("El nombre del proveedor es obligatorio")
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El formato del email no es válido")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Enviando datos del proveedor:", { name, contactPerson, phone, email })

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
        }),
      })

      const result = await response.json()
      console.log("Respuesta del servidor:", result)

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el proveedor")
      }

      if (result.success && result.data) {
        toast({
          title: "Proveedor creado",
          description: `El proveedor "${name}" ha sido creado exitosamente.`,
        })

        // Limpiar el formulario
        setName("")
        setContactPerson("")
        setPhone("")
        setEmail("")

        // Cerrar el diálogo y notificar al componente padre
        onClose()
        onSupplierAdded(result.data)
      } else {
        throw new Error("No se recibieron datos del proveedor creado")
      }
    } catch (err: any) {
      console.error("Error al crear proveedor:", err)
      setError(err.message || "Ocurrió un error al crear el proveedor")
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Ocurrió un error al crear el proveedor",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar nuevo proveedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar proveedor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
