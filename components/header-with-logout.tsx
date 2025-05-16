"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export function HeaderWithLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      window.location.href = "/login" // Usar window.location en lugar de router para forzar una recarga completa
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/nexus-logo.webp" alt="Nexus Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-xl font-bold">Nexus Co-living</h1>
        </Link>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  )
}
