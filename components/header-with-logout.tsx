"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { UserProfileIcon } from "@/components/user-profile-icon"

interface HeaderWithLogoutProps {
  title: string
  children?: React.ReactNode
}

export function HeaderWithLogout({ title, children }: HeaderWithLogoutProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex space-x-4 items-center">
        {children}
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Inicio
          </Button>
        </Link>
        <UserProfileIcon />
      </div>
    </div>
  )
}
