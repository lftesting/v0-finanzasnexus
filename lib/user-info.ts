"use server"

import { createServerSupabaseClient } from "@/lib/server-utils"

// Función para guardar la información del usuario en la tabla user_info
export async function saveUserInfo(email: string, username: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("user_info")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 es el código para "no se encontraron resultados"
      console.error("Error al verificar usuario existente:", checkError)
      return false
    }

    if (existingUser) {
      // Actualizar el usuario existente
      const { error: updateError } = await supabase
        .from("user_info")
        .update({ username, created_at: new Date().toISOString() })
        .eq("id", existingUser.id)

      if (updateError) {
        console.error("Error al actualizar información de usuario:", updateError)
        return false
      }
    } else {
      // Crear un nuevo registro
      const { error: insertError } = await supabase.from("user_info").insert([{ email, username }])

      if (insertError) {
        console.error("Error al guardar información de usuario:", insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error al gestionar información de usuario:", error)
    return false
  }
}

// Función para obtener el nombre de usuario a partir del email
export async function getUsernameByEmail(email: string | null): Promise<string> {
  if (!email) return "Sistema"

  const supabase = createServerSupabaseClient()

  try {
    // Buscar el usuario en la tabla user_info
    const { data, error } = await supabase.from("user_info").select("username").eq("email", email).single()

    if (error || !data) {
      console.error("Error al obtener nombre de usuario:", error)
      // Si no se encuentra, extraer el nombre del email
      const username = email.split("@")[0]
      return username.charAt(0).toUpperCase() + username.slice(1)
    }

    return data.username
  } catch (error) {
    console.error("Error al obtener nombre de usuario:", error)
    // Extraer el nombre del email como fallback
    const username = email.split("@")[0]
    return username.charAt(0).toUpperCase() + username.slice(1)
  }
}
