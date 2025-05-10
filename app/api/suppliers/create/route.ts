import { createServerSupabaseClient } from "@/lib/server-utils"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Extraer datos del cuerpo de la solicitud
    const { name, contact_person, phone, email } = body

    // Validar que el nombre no esté vacío
    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, error: "El nombre del proveedor es obligatorio" }, { status: 400 })
    }

    // Validar formato de email si se proporciona
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "El formato del email no es válido" }, { status: 400 })
    }

    // Verificar si ya existe un proveedor con el mismo nombre
    const { data: existingSupplier, error: checkError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("name", name)
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar proveedor existente:", checkError)
      return NextResponse.json(
        { success: false, error: "Error al verificar si el proveedor ya existe" },
        { status: 500 },
      )
    }

    if (existingSupplier) {
      return NextResponse.json({ success: false, error: "Ya existe un proveedor con este nombre" }, { status: 400 })
    }

    // Preparar los datos para insertar
    const supplierToInsert = {
      name,
      contact_person,
      phone,
      email,
      created_at: new Date().toISOString(),
    }

    console.log("Datos a insertar:", supplierToInsert)

    // Insertar el proveedor en la base de datos
    const { data, error } = await supabase.from("suppliers").insert([supplierToInsert]).select()

    if (error) {
      console.error("Error al crear el proveedor:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Verificar que se hayan devuelto datos
    if (!data || data.length === 0) {
      console.error("No se recibieron datos después de insertar el proveedor")
      return NextResponse.json(
        { success: false, error: "Error al crear el proveedor: no se recibieron datos" },
        { status: 500 },
      )
    }

    console.log("Proveedor creado exitosamente:", data[0])

    // Revalidar rutas para actualizar los datos en la UI
    revalidatePath("/expenses/new")
    revalidatePath("/expenses/[id]/edit")

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error inesperado en createSupplier API:", error)
    return NextResponse.json({ success: false, error: `Error inesperado: ${error}` }, { status: 500 })
  }
}
