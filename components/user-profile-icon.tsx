"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserProfileIcon() {
  const { user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!user) return null

  // Obtener las iniciales del email del usuario
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email || "")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col space-y-4 p-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.email || "")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Usuario</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-500">En línea</span>
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
