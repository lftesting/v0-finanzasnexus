import { createClient } from "@supabase/supabase-js"

// Variable global para almacenar la instancia del cliente
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

// Función para crear o devolver el cliente existente
export const createClientSupabaseClient = () => {
  // Verificar que estamos en el navegador
  if (typeof window === "undefined") {
    // En lugar de lanzar un error, devolvemos un cliente simulado o nulo
    // para evitar errores durante el prerenderizado
    console.warn("Intentando usar createClientSupabaseClient en el servidor. Devolviendo cliente simulado.")

    // Devolver un cliente simulado que no hará nada
    // @ts-ignore - Ignoramos los errores de tipo aquí
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      // Añadir otros métodos simulados según sea necesario
    }
  }

  // Si ya existe una instancia, devolverla
  if (clientSupabaseClient) {
    return clientSupabaseClient
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
