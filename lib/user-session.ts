"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

// Función para guardar la sesión del usuario actual en la base de datos
export async function storeUserSession(sessionId: string, userId: string, email: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Extraer nombre de usuario del email
    const username = email.split("@")[0]
    const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1)

    // Insertar en la tabla current_user_sessions
    const { error } = await supabase.from("current_user_sessions").insert({
      session_id: sessionId,
      user_id: userId,
      email: email,
      username: formattedUsername,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error al almacenar la sesión del usuario:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error al almacenar la sesión del usuario:", error)
    return false
  }
}

// Función para obtener el usuario actual desde la base de datos
export async function getCurrentUserFromDB() {
  const supabase = createServerSupabaseClient()

  try {
    // Primero intentamos obtener la sesión actual de Supabase
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      return {
        email: null,
        username: "Sistema",
      }
    }

    // Buscar la sesión en nuestra tabla personalizada
    const { data: userSession, error } = await supabase
      .from("current_user_sessions")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !userSession) {
      // Si no encontramos la sesión, intentamos crearla
      if (sessionData.session.user.email) {
        await storeUserSession(sessionData.session.id, sessionData.session.user.id, sessionData.session.user.email)

        // Extraer el nombre de usuario del email
        const email = sessionData.session.user.email
        const username = email.split("@")[0]
        const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1)

        return {
          id: sessionData.session.user.id,
          email,
          username: formattedUsername,
        }
      }

      return {
        email: null,
        username: "Sistema",
      }
    }

    return {
      id: userSession.user_id,
      email: userSession.email,
      username: userSession.username,
    }
  } catch (error) {
    console.error("Error al obtener el usuario actual desde la base de datos:", error)
    return {
      email: null,
      username: "Sistema",
    }
  }
}
