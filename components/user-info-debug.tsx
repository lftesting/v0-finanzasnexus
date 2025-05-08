"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export function UserInfoDebug() {
  const { user } = useAuth()
  const [serverUser, setServerUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const checkServerUser = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/current-user")
      const data = await response.json()
      setServerUser(data)
    } catch (error) {
      console.error("Error al obtener el usuario del servidor:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!showPanel) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowPanel(true)} className="fixed bottom-4 left-4 z-50">
        Debug User
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Información de Usuario</span>
          <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>
            Cerrar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold mb-2">Cliente:</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
            <p>Email: {user?.email || "No disponible"}</p>
            <p>Username: {user?.username || "No disponible"}</p>
          </div>
        </div>

        <Button onClick={checkServerUser} disabled={isLoading} className="w-full">
          {isLoading ? "Verificando..." : "Verificar Usuario en Servidor"}
        </Button>

        {serverUser && (
          <div>
            <h3 className="font-bold mb-2">Servidor:</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
              <p>Email: {serverUser.email || "No disponible"}</p>
              <p>Username: {serverUser.username || "No disponible"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
