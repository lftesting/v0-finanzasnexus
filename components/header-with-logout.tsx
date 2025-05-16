"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import NotificationCenter from "@/components/notifications/notification-center"

interface HeaderWithLogoutProps {
  title: string
  children?: React.ReactNode
}

export function HeaderWithLogout({ title, children }: HeaderWithLogoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
      <div className="flex justify-between items-center w-full md:w-auto">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="flex md:hidden">
          <NotificationCenter />
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto mt-4 md:mt-0`}
      >
        <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Inicio
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/payments/list" className="text-gray-600 hover:text-gray-900">
            Cobros
          </Link>
          <Link href="/expenses/list" className="text-gray-600 hover:text-gray-900">
            Gastos
          </Link>
          <Link href="/reports" className="text-gray-600 hover:text-gray-900">
            Reportes
          </Link>
        </nav>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          {children}
          <div className="hidden md:block">
            <NotificationCenter />
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  )
}
