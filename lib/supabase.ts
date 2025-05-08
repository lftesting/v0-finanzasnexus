import { createClient } from "@supabase/supabase-js"

// Crear cliente para el lado del cliente (singleton)
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase")
  }

  console.log("Creando cliente de Supabase para el cliente con URL:", supabaseUrl)

  clientSupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase-auth",
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null
          const item = window.localStorage.getItem(key)
          console.log(`Obteniendo item de storage ${key}:`, item ? "Existe" : "No existe")
          return item
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return
          console.log(`Guardando item en storage ${key}`)
          window.localStorage.setItem(key, value)
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return
          console.log(`Eliminando item de storage ${key}`)
          window.localStorage.removeItem(key)
        },
      },
    },
  })

  return clientSupabaseClient
}
