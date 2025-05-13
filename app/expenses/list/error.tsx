"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function ExpensesListError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error en la página de lista de gastos:", error)
  }, [error])

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error al cargar la lista de gastos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4">Lo sentimos, ha ocurrido un error al cargar la lista de gastos.</p>
          <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
            <p className="font-mono">{error.message}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Ir al inicio
          </Button>
          <Button onClick={() => reset()}>Reintentar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
