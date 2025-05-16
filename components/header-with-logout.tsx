"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
import Image from "next/image"
import { BackToHomeButton } from "./back-to-home-button"

interface HeaderWithLogoutProps {
  title: string
  children?: React.ReactNode
  showBackButton?: boolean
}

export function HeaderWithLogout({ title, children, showBackButton = true }: HeaderWithLogoutProps) {
  const handleLogout = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center">
        <Image src="/images/nexus-logo.webp" alt="Nexus Logo" width={40} height={40} className="mr-3 rounded-full" />
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showBackButton && <BackToHomeButton />}
        {children}
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
