import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Build query with filters
    let query = supabase.from("payments").select(`
      *,
      client:client_id(id, name, email),
      user_info:user_id(id, name, email)
    `)

    // Apply filters from query params
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    if (startDate) {
      query = query.gte("date", startDate)
    }

    if (endDate) {
      query = query.lte("date", endDate)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`
        client.name.ilike.%${search}%,
        invoice_number.ilike.%${search}%,
        description.ilike.%${search}%
      `)
    }

    // Execute query
    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ payments: data })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error al obtener los pagos" }, { status: 500 })
  }
}
