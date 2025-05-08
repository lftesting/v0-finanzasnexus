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
import { Loader2, Trash2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  title: string
  description: string
  onConfirm: () => Promise<void>
  triggerClassName?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  itemDetails?: React.ReactNode
}

export function DeleteConfirmationDialog({
  title,
  description,
  onConfirm,
  triggerClassName,
  variant = "destructive",
  itemDetails,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error("Error al confirmar la acción:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`bg-red-600 hover:bg-red-700 text-white px-4 min-w-[100px] ${triggerClassName || ""}`}
          variant={variant}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {itemDetails && <div className="my-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">{itemDetails}</div>}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Confirmar eliminación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
