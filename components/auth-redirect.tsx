"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getClientSession } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"

export default function AuthRedirect() {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getClientSession()

        if (!session) {
          console.log("No hay sesión, redirigiendo a /login")
          window.location.href = "/login"
          return
        }

        console.log("Sesión encontrada:", session.user.email)
        setIsChecking(false)
      } catch (error) {
        console.error("Error al verificar la autenticación:", error)
        window.location.href = "/login"
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return null
}
