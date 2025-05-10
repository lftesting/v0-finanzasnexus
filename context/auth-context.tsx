"use client"

import type React from "react"

import { createClientSupabaseClient } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState, useRef } from "react"

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

  // Inicializar Supabase solo en el cliente
  const supabaseRef = useRef(typeof window !== "undefined" ? createClientSupabaseClient() : null)

  // Asegurarse de que supabase esté disponible antes de usarlo
  useEffect(() => {
    // Inicializar supabase si aún no se ha hecho
    if (!supabaseRef.current && typeof window !== "undefined") {
      supabaseRef.current = createClientSupabaseClient()
    }
  }, [])

  const supabase = supabaseRef.current

  const refreshSession = async () => {
    if (!supabase) return

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
    if (!supabase) return

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

    // Solo configurar el listener si supabase está disponible
    let subscription: { unsubscribe: () => void } | null = null

    if (supabase) {
      const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log("Cambio en el estado de autenticación:", _event)
        setSession(session)
        setUser(session?.user || null)
        setIsLoading(false)
      })

      subscription = authListener.data.subscription
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      console.error("No se puede iniciar sesión: Supabase no está disponible")
      return { error: new Error("Supabase no está disponible"), success: false }
    }

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
    if (!supabase) return

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
