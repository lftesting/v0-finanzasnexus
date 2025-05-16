"use client"

import type React from "react"

import { createClientSupabaseClient } from "@/lib/supabase/client"
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
  const [supabase] = useState(() => createClientSupabaseClient())

  const refreshSession = async () => {
    setIsLoading(true)
    try {
      // Obtener la sesión actual
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error al obtener la sesión:", error)
        setSession(null)
        setUser(null)
        return
      }

      const currentSession = data.session
      console.log("Sesión actualizada:", currentSession ? "Activa" : "No hay sesión")

      setSession(currentSession)
      setUser(currentSession?.user || null)
    } catch (error) {
      console.error("Error al actualizar la sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true)
      try {
        // Obtener la sesión actual
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error al obtener la sesión inicial:", error)
          return
        }

        const initialSession = data.session
        console.log("Sesión inicial:", initialSession ? "Activa" : "No hay sesión")

        setSession(initialSession)
        setUser(initialSession?.user || null)
      } catch (error) {
        console.error("Error al obtener la sesión inicial:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Configurar el listener para cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log("Cambio en el estado de autenticación:", _event)
      setSession(currentSession)
      setUser(currentSession?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Intentando iniciar sesión con:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de autenticación:", error)
        return { error, success: false }
      }

      console.log("Inicio de sesión exitoso:", data.user?.email)

      // Actualizar el estado
      setSession(data.session)
      setUser(data.user)

      return { error: null, success: true }
    } catch (error) {
      console.error("Error inesperado al iniciar sesión:", error)
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
