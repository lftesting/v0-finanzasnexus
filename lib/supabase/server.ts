import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Crear cliente para el lado del servidor (solo usar en Server Components o Server Actions)
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  // Usar las variables de entorno correctas para el cliente del servidor
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
