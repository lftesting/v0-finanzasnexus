"use client"

import type React from "react"

import { createClientSupabaseClient } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    success: boolean
  }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  const refreshSession = async () => {
    setIsLoading(true)
    try {
      // Obtener la sesión actual
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error al obtener la sesión:", error)
        setSession(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      const session = data.session
      console.log("Sesión actualizada:", session ? "Activa" : "No hay sesión")

      setSession(session)
      setUser(session?.user || null)
    } catch (error) {
      console.error("Error al actualizar la sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        // Obtener la sesión actual
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error al obtener la sesión:", error)
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        const session = data.session
        console.log("Sesión obtenida:", session ? "Activa" : "No hay sesión")

        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error al obtener la sesión:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Cambio en el estado de autenticación:", _event)
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error al iniciar sesión:", error)
        return { error, success: false }
      }

      console.log("Inicio de sesión exitoso:", data.user?.email)

      // Actualizar el estado
      setSession(data.session)
      setUser(data.user)

      return { error: null, success: true }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      return { error, success: false }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      console.log("Sesión cerrada")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
