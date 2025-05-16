export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      current_user_sessions: {
        Row: {
          created_at: string | null
          email: string | null
          session_id: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          session_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          session_id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          bank_account: string | null
          category_id: number | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          document_id: string | null
          document_urls: string[] | null
          document_ids: string[] | null
          due_date: string | null
          id: number
          invoice_number: string | null
          payment_date: string | null
          payment_method: string | null
          room_id: number | null
          status: string | null
          supplier_id: number | null
          tribe_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount?: number | null
          bank_account?: string | null
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          document_id?: string | null
          document_urls?: string[] | null
          document_ids?: string[] | null
          due_date?: string | null
          id?: number
          invoice_number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          room_id?: number | null
          status?: string | null
          supplier_id?: number | null
          tribe_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number | null
          bank_account?: string | null
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          document_id?: string | null
          document_urls?: string[] | null
          document_ids?: string[] | null
          due_date?: string | null
          id?: number
          invoice_number?: string | null
          payment_date?: string | null
          payment_method?: string | null
          room_id?: number | null
          status?: string | null
          supplier_id?: number | null
          tribe_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "expense_categories"
          },
          {
            foreignKeyName: "expenses_room_id_fkey"
            columns: ["room_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "rooms"
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "suppliers"
          },
          {
            foreignKeyName: "expenses_tribe_id_fkey"
            columns: ["tribe_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "tribes"
          },
        ]
      }
      payments: {
        Row: {
          actual_payment_date: string | null
          amount: number | null
          bank_account: string | null
          comments: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          document_urls: string[] | null
          document_ids: string[] | null
          entry_date: string | null
          estimated_payment_date: string | null
          id: number
          payment_method: string | null
          rent_amount: number | null
          room_id: number | null
          services_amount: number | null
          tribe_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actual_payment_date?: string | null
          amount?: number | null
          bank_account?: string | null
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          document_urls?: string[] | null
          document_ids?: string[] | null
          entry_date?: string | null
          estimated_payment_date?: string | null
          id?: number
          payment_method?: string | null
          rent_amount?: number | null
          room_id?: number | null
          services_amount?: number | null
          tribe_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actual_payment_date?: string | null
          amount?: number | null
          bank_account?: string | null
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          document_urls?: string[] | null
          document_ids?: string[] | null
          entry_date?: string | null
          estimated_payment_date?: string | null
          id?: number
          payment_method?: string | null
          rent_amount?: number | null
          room_id?: number | null
          services_amount?: number | null
          tribe_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_room_id_fkey"
            columns: ["room_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "rooms"
          },
          {
            foreignKeyName: "payments_tribe_id_fkey"
            columns: ["tribe_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "tribes"
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          id: number
          room_number: string | null
          tribe_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          room_number?: string | null
          tribe_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          room_number?: string | null
          tribe_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_tribe_id_fkey"
            columns: ["tribe_id"]
            isOne: true
            isOtherKeyPresent: false
            isOwner: true
            schema: "public"
            table: "tribes"
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: number
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tribes: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_info: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      execute_sql: {
        Args: {
          sql_query: string
        }
        Returns: Json
      }
      get_table_info: {
        Args: {
          table_name: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
