"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Crear una única instancia del cliente de Supabase
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClientSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}
