"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export function AuthDebugPanel() {
  // No renderizar nada en producción
  const { user, session, refreshSession } = useAuth() // Moved hook call outside conditional
  const [serverAuthInfo, setServerAuthInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [cookies, setCookies] = useState<string[]>([])

  useEffect(() => {
    if (showPanel) {
      // Listar todas las cookies
      const allCookies = document.cookie.split(";").map((cookie) => cookie.trim())
      setCookies(allCookies)
    }
  }, [showPanel])

  const checkServerAuth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Llamar a un endpoint específico para verificar la autenticación en el servidor
      const response = await fetch("/api/debug/auth-check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      setServerAuthInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error al verificar la autenticación:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshSession = async () => {
    setIsLoading(true)
    try {
      await refreshSession()
      await checkServerAuth()
    } catch (error) {
      console.error("Error al refrescar la sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (process.env.NODE_ENV === "production") {
    return null
  }

  if (!showPanel) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowPanel(true)} className="fixed bottom-4 right-4 z-50">
        Debug Auth
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Depuración de Autenticación</span>
          <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>
            Cerrar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={checkServerAuth} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Auth en Servidor"
            )}
          </Button>
          <Button onClick={handleRefreshSession} disabled={isLoading} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refrescar Sesión
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="font-bold">Cliente - Usuario:</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
            <pre>{user ? JSON.stringify(user, null, 2) : "No hay usuario"}</pre>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold">Cliente - Sesión:</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
            <pre>{session ? JSON.stringify(session, null, 2) : "No hay sesión"}</pre>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold">Cliente - Cookies:</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
            <pre>{cookies.length > 0 ? cookies.join("\n") : "No hay cookies"}</pre>
          </div>
        </div>

        {serverAuthInfo && (
          <div className="space-y-2">
            <h3 className="font-bold">Servidor - Información:</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
              <pre>{JSON.stringify(serverAuthInfo, null, 2)}</pre>
            </div>

            <div className="mt-4 text-sm">
              <p>
                <strong>Usuario actual:</strong> {serverAuthInfo.currentUser?.username || "No disponible"}
              </p>
              <p>
                <strong>Email:</strong> {serverAuthInfo.currentUser?.email || "No disponible"}
              </p>
              <p>
                <strong>Sesión activa:</strong> {serverAuthInfo.sessionExists ? "Sí" : "No"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
