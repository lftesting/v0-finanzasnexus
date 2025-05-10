export interface Payment {
  id: number
  date: string
  due_date?: string
  payment_date?: string
  client_id?: number
  client?: {
    id: number
    name: string
    email?: string
  }
  tribe_name?: string
  room_number?: string
  user_id?: string
  user_info?: {
    id: string
    name: string
    email: string
  }
  amount: number
  rent_amount?: number
  services_amount?: number
  status: string
  payment_method?: string
  invoice_number?: string
  description?: string
  document_id?: string
  document_url?: string
  document_ids?: string[]
  document_urls?: string[]
  created_at: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export type Supplier = {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
}
