"use client"

import { useEffect, useState } from "react"
import { getClientSession } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function AuthDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    setLoading(true)
    try {
      const sessionData = await getClientSession()
      setSession(sessionData)
    } catch (err) {
      console.error("Error al verificar la sesión:", err)
      setError("Error al verificar la sesión")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Depuración de Autenticación</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado de la Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Verificando sesión...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : session ? (
            <div>
              <p className="mb-2">
                <span className="font-semibold">Usuario:</span> {session.user?.email}
              </p>
              <p className="mb-2">
                <span className="font-semibold">ID:</span> {session.user?.id}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Rol:</span> {session.user?.role}
              </p>
              <p className="mb-2">
                <span className="font-semibold">Sesión válida hasta:</span>{" "}
                {new Date(session.expires_at * 1000).toLocaleString()}
              </p>
            </div>
          ) : (
            <p>No hay sesión activa</p>
          )}
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button onClick={checkSession} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar Sesión"
          )}
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Volver al Inicio
        </Button>
      </div>
    </div>
  )
}
