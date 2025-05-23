"use client"

import { createClientSupabaseClient } from "@/lib/supabase/client"

// Funciones de autenticación para el lado del cliente
export const getClientSession = async () => {
  const supabase = createClientSupabaseClient()

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener la sesión:", error)
      return null
    }

    if (data.session) {
      console.log("Sesión obtenida correctamente en el cliente:", data.session.user?.email)
    } else {
      console.log("No hay sesión activa en el cliente")
    }

    return data.session
  } catch (error) {
    console.error("Error al obtener la sesión:", error)
    return null
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createClientSupabaseClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error, success: false }
    }

    console.log("Inicio de sesión exitoso:", data.user?.email)

    return { error: null, success: true, user: data.user }
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return { error, success: false }
  }
}

export const signOut = async () => {
  const supabase = createClientSupabaseClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error al cerrar sesión:", error)
      return { success: false, error }
    }

    console.log("Sesión cerrada correctamente")
    return { success: true }
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return { success: false, error }
  }
}
