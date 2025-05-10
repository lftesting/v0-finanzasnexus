import { createServerSupabaseClient } from "@/lib/server-utils"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Extraer datos del cuerpo de la solicitud
    const { name, contact_person, phone, email, address } = body

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

    // Preparar los datos para insertar - IMPORTANTE: NO incluir ID
    const supplierToInsert = {
      name,
      contact_person: contact_person || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      // No incluimos created_at para usar el valor por defecto de la base de datos
    }

    console.log("Datos a insertar:", JSON.stringify(supplierToInsert, null, 2))

    // Insertar el proveedor en la base de datos SIN DEVOLVER EL ID
    const { error: insertError } = await supabase.from("suppliers").insert([supplierToInsert])

    if (insertError) {
      console.error("Error al crear el proveedor:", insertError)
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    // Consultar el proveedor recién creado por su nombre
    const { data: newSupplier, error: fetchError } = await supabase
      .from("suppliers")
      .select("*")
      .eq("name", name)
      .single()

    if (fetchError || !newSupplier) {
      console.error("Error al obtener el proveedor recién creado:", fetchError)
      return NextResponse.json({ success: false, error: "Proveedor creado pero no se pudo recuperar" }, { status: 500 })
    }

    console.log("Proveedor creado exitosamente:", newSupplier)

    // Revalidar rutas para actualizar los datos en la UI
    revalidatePath("/expenses/new")
    revalidatePath("/expenses/[id]/edit")

    return NextResponse.json({ success: true, data: newSupplier })
  } catch (error) {
    console.error("Error inesperado en createSupplier API:", error)
    return NextResponse.json({ success: false, error: `Error inesperado: ${error}` }, { status: 500 })
  }
}
