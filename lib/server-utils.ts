import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Variable global para almacenar la instancia del cliente del servidor
const serverSupabaseClient: ReturnType<typeof createClient> | null = null

// Esta función solo debe usarse en Server Components o Server Actions
export function getServerCookies() {
  return cookies()
}

// Crear cliente para el lado del servidor (solo usar en Server Components o Server Actions)
export function createServerSupabaseClient() {
  // No usamos singleton en el servidor porque cada solicitud debe tener su propio cliente
  // con sus propias cookies
  const cookieStore = getServerCookies()

  // Usar las variables de entorno correctas para el cliente del servidor
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan las variables de entorno de Supabase")
    throw new Error("Faltan las variables de entorno de Supabase")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
      },
    },
  })
}

// Función auxiliar para obtener el usuario actual
export async function getCurrentUser() {
  try {
    // Intentar obtener la sesión
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener la sesión:", error)
      return await getLastUserFromUserInfo()
    }

    // Si no hay sesión o usuario, intentar obtener el último usuario de user_info
    if (!data.session || !data.session.user) {
      return await getLastUserFromUserInfo()
    }

    const email = data.session.user.email

    if (!email) {
      return await getLastUserFromUserInfo()
    }

    // Buscar el usuario en la tabla user_info
    const { data: userInfo, error: userInfoError } = await supabase
      .from("user_info")
      .select("username")
      .eq("email", email)
      .single()

    // Si encontramos el usuario en user_info, usamos ese nombre de usuario
    if (userInfo && !userInfoError) {
      console.log("Usuario encontrado en user_info:", userInfo.username)
      return {
        id: data.session.user.id,
        email: email,
        username: userInfo.username,
      }
    }

    // Si no encontramos el usuario en user_info, lo creamos
    const username = extractUsernameFromEmail(email)
    await saveUserInfo(email, username)

    return {
      id: data.session.user.id,
      email: email,
      username: username,
    }
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error)
    return await getLastUserFromUserInfo()
  }
}

// Función para extraer un nombre de usuario del email
function extractUsernameFromEmail(email: string): string {
  // Extraer la parte antes del @
  const username = email.split("@")[0]

  // Capitalizar la primera letra
  return username.charAt(0).toUpperCase() + username.slice(1)
}

// Función para guardar la información del usuario en la tabla user_info
async function saveUserInfo(email: string, username: string) {
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

// Función para obtener el último usuario de la tabla user_info
async function getLastUserFromUserInfo() {
  const supabase = createServerSupabaseClient()

  try {
    // Obtener el último usuario que se guardó en la tabla user_info
    const { data, error } = await supabase
      .from("user_info")
      .select("email, username")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return {
        email: null,
        username: "Sistema",
      }
    }

    console.log("Último usuario encontrado en user_info:", data.username)
    return {
      email: data.email,
      username: data.username,
    }
  } catch (error) {
    console.error("Error al obtener el último usuario de user_info:", error)
    return {
      email: null,
      username: "Sistema",
    }
  }
}
