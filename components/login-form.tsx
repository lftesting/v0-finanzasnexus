"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { signInWithEmail } from "@/lib/auth-client"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithEmail(email, password)

      if (error) {
        setError(error.message)
        return
      }

      // Redirigir a la página principal
      window.location.href = "/"
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Ocurrió un error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden bg-gray-100">
          <Image src="/images/nexus-logo.webp" alt="Nexus Logo" fill sizes="80px" priority className="object-cover" />
        </div>
        <CardTitle className="text-2xl text-center">Nexus Co-living</CardTitle>
        <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center w-full text-muted-foreground">
          Sistema de Gestión Financiera para Nexus Co-living
        </p>
      </CardFooter>
    </Card>
  )
}
