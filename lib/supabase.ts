import { createClient } from "@supabase/supabase-js"

// Tipos para nuestra base de datos
export type Database = {
  public: {
    tables: {
      expenses: {
        Row: {
          id: number
          date: string
          due_date: string | null
          payment_date: string | null
          supplier_id: number | null
          category_id: number | null
          amount: number
          payment_method: string | null
          status: string | null
          invoice_number: string | null
          description: string | null
          document_url: string | null
          document_urls: string[] | null
          document_id: string | null
          document_ids: string[] | null
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
          tribe_id: number | null
          room_id: number | null
          bank_account: string | null
        }
        Insert: Omit<Database["public"]["tables"]["expenses"]["Row"], "id" | "created_at">
        Update: Partial<Omit<Database["public"]["tables"]["expenses"]["Row"], "id">>
      }
      expense_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
      }
      current_user_sessions: {
        Row: {
          username: string
          id: number
          user_id: string
          created_at: string
          session_id: string
          email: string
        }
      }
    }
  }
}

// Singleton pattern para evitar múltiples instancias durante el desarrollo
let supabase: ReturnType<typeof createClient<Database>> | null = null

// Función para obtener el cliente de Supabase
export const getSupabaseClient = () => {
  if (supabase === null) {
    // Verificar si estamos en el servidor durante el prerenderizado
    if (typeof window === "undefined" && process.env.NEXT_PHASE === "phase-production-build") {
      // Durante el build, devolver un cliente simulado
      return {
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                range: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
        }),
      } as any
    }

    // Crear el cliente real
    supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabase
}

// Cliente para el servidor
export const createClientSupabaseClient = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}
