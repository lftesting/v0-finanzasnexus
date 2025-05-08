"use server"

import { createServerSupabaseClient } from "@/lib/server-utils"

// Función para guardar la sesión del usuario actual en la base de datos
export async function storeUserSession(sessionId: string, userId: string, email: string) {
  const supabase = createServerSupabaseClient()

  // Extraer el nombre de usuario del email
  const username = email.split("@")[0]
  const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1)

  try {
    // Verificar si ya existe una sesión con este ID
    const { data: existingSession } = await supabase
      .from("current_user_sessions")
      .select("id")
      .eq("session_id", sessionId)
      .single()

    if (existingSession) {
      // Actualizar la sesión existente
      const { error } = await supabase
        .from("current_user_sessions")
        .update({
          user_id: userId,
          email,
          username: formattedUsername,
          created_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)

      if (error) {
        console.error("Error al actualizar la sesión de usuario:", error)
        return false
      }
    } else {
      // Crear una nueva sesión
      const { error } = await supabase.from("current_user_sessions").insert([
        {
          session_id: sessionId,
          user_id: userId,
          email,
          username: formattedUsername,
        },
      ])

      if (error) {
        console.error("Error al guardar la sesión de usuario:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error al gestionar la sesión de usuario:", error)
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
