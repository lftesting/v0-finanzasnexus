"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, session } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      try {
        // Esperar un poco para asegurarse de que la sesión se ha cargado
        if (isLoading) {
          return
        }

        console.log("Estado de autenticación:", { user, pathname })

        // Si no hay usuario y no estamos en la página de login, redirigir
        if (!user && pathname !== "/login" && pathname !== "/admin/setup") {
          router.push("/login")
        }

        setIsChecking(false)
      } catch (error) {
        console.error("Error al verificar la sesión:", error)
        setIsChecking(false)
      }
    }

    checkSession()
  }, [user, isLoading, router, pathname])

  // Si está cargando o verificando, mostrar un spinner
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si no hay usuario y no estamos en la página de login o setup, no renderizar nada
  if (!user && pathname !== "/login" && pathname !== "/admin/setup") {
    return null
  }

  // Si hay usuario o estamos en la página de login o setup, renderizar los hijos
  return <>{children}</>
}
