"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error, success } = await signIn(email, password)

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Credenciales inválidas. Por favor, verifica tu email y contraseña."
            : error.message,
        )
        setIsLoading(false)
        return
      }

      if (success) {
        // Guardar información del usuario en la tabla user_info
        try {
          // Extraer nombre de usuario del email
          const username = email.split("@")[0]
          const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1)

          // Llamar a la API para guardar la información
          await fetch("/api/auth/save-user-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              username: formattedUsername,
            }),
          })
        } catch (saveError) {
          console.error("Error al guardar información de usuario:", saveError)
          // Continuar con la redirección aunque falle el guardado
        }

        // Redirigir inmediatamente sin temporizador
        router.push("/")
      }
    } catch (err) {
      setError("Ha ocurrido un error al iniciar sesión. Por favor, intenta de nuevo.")
      console.error("Error al iniciar sesión:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription className="text-gray-100">Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
