// Modificar el archivo para mejorar el patrón singleton y evitar múltiples instancias

import { createClient } from "@supabase/supabase-js"

// Variable global para almacenar la instancia del cliente
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

// Función para crear o devolver el cliente existente
export const createClientSupabaseClient = () => {
  // Si ya existe una instancia, devolverla
  if (clientSupabaseClient) {
    return clientSupabaseClient
  }

  // Verificar que estamos en el navegador
  if (typeof window === "undefined") {
    throw new Error("createClientSupabaseClient debe ser llamado solo en el cliente")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase")
  }

  console.log("Creando cliente de Supabase para el cliente con URL:", supabaseUrl)

  // Crear una nueva instancia
  clientSupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase-auth",
    },
  })

  return clientSupabaseClient
}

// Función para limpiar la instancia (útil para pruebas o cuando se cierra sesión)
export const clearClientSupabaseClient = () => {
  clientSupabaseClient = null
}
