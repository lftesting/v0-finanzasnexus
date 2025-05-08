import { createServerSupabaseClient } from "@/lib/supabase/server"

// Función para extraer un nombre de usuario del email
function extractUsernameFromEmail(email: string | null | undefined): string {
  if (!email) return "Sistema"

  // Extraer la parte antes del @
  const username = email.split("@")[0]

  // Capitalizar la primera letra
  return username.charAt(0).toUpperCase() + username.slice(1)
}

// Función auxiliar para obtener el usuario actual
export async function getCurrentUser() {
  try {
    const supabase = createServerSupabaseClient()

    // Intentar obtener la sesión
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener la sesión:", error)
      return {
        email: null,
        username: "Sistema",
      }
    }

    // Si no hay sesión o usuario, devolver "Sistema"
    if (!data.session || !data.session.user) {
      return {
        email: null,
        username: "Sistema",
      }
    }

    const email = data.session.user.email
    const username = extractUsernameFromEmail(email)

    console.log("Usuario autenticado:", email)
    console.log("Nombre de usuario extraído:", username)

    return {
      id: data.session.user.id,
      email: email,
      username: username,
    }
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error)
    return {
      email: null,
      username: "Sistema",
    }
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
      // Si no encontramos la sesión, usamos el email de la sesión actual
      if (sessionData.session.user.email) {
        // Extraer el nombre de usuario del email
        const email = sessionData.session.user.email
        const username = extractUsernameFromEmail(email)

        return {
          id: sessionData.session.user.id,
          email,
          username,
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
