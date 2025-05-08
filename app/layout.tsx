import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { AuthGuard } from "@/components/auth-guard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nexus Co-living - Sistema de Gestión Financiera",
  description: "Sistema para la gestión de cobros y gastos de Nexus Co-living",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <AuthGuard>{children}</AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
