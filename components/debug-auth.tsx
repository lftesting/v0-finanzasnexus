"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugAuth() {
  const { user, session } = useAuth()
  const [showDebug, setShowDebug] = useState(false)
  const [cookies, setCookies] = useState<string[]>([])
  const [serverCheck, setServerCheck] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (showDebug) {
      // Listar todas las cookies
      const allCookies = document.cookie.split(";").map((cookie) => cookie.trim())
      setCookies(allCookies)
    }
  }, [showDebug])

  const checkServerAuth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/check-auth")
      const data = await response.json()
      setServerCheck(data)
    } catch (error) {
      console.error("Error al verificar la autenticación en el servidor:", error)
      setServerCheck({ error: "Error al verificar la autenticación" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!showDebug) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="fixed bottom-4 right-4 z-50">
        Debug Auth
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Debug Auth</span>
          <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
            Cerrar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs overflow-auto max-h-80">
        <h3 className="font-bold mb-2">Usuario:</h3>
        <pre>{user ? JSON.stringify(user, null, 2) : "No hay usuario"}</pre>

        <h3 className="font-bold mt-4 mb-2">Sesión:</h3>
        <pre>{session ? JSON.stringify(session, null, 2) : "No hay sesión"}</pre>

        <h3 className="font-bold mt-4 mb-2">Cookies:</h3>
        <pre>{cookies.length > 0 ? cookies.join("\n") : "No hay cookies"}</pre>

        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={checkServerAuth} disabled={isLoading} className="w-full">
            {isLoading ? "Verificando..." : "Verificar Auth en Servidor"}
          </Button>

          {serverCheck && (
            <div className="mt-2">
              <h3 className="font-bold mb-2">Resultado del servidor:</h3>
              <pre>{JSON.stringify(serverCheck, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
