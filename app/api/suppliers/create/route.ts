import { createServerSupabaseClient } from "@/lib/server-utils"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, contact_person, phone, email, address } = body

    // Validar que el nombre del proveedor no esté vacío
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "El nombre del proveedor es obligatorio" }, { status: 400 })
    }

    // Crear el objeto con los datos del proveedor
    const supplierToInsert = {
      name,
      contact_person: contact_person || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    }

    console.log("Creando proveedor:", supplierToInsert)

    // Insertar el proveedor en la base de datos
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("suppliers").insert([supplierToInsert]).select().single()

    if (error) {
      console.error("Error al crear el proveedor:", error)
      return NextResponse.json({ error: `Error al crear el proveedor: ${error.message}` }, { status: 500 })
    }

    console.log("Proveedor creado exitosamente:", data)

    // Devolver el proveedor creado
    return NextResponse.json({ success: true, supplier: data })
  } catch (error) {
    console.error("Error inesperado al crear el proveedor:", error)
    return NextResponse.json({ error: "Error inesperado al crear el proveedor" }, { status: 500 })
  }
}
