import { createServerSupabaseClient } from "@/lib/server-utils"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json()

    if (!email || !username) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("user_info")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 es el código para "no se encontraron resultados"
      console.error("Error al verificar usuario existente:", checkError)
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
    }

    if (existingUser) {
      // Actualizar el usuario existente
      const { error: updateError } = await supabase
        .from("user_info")
        .update({ username, created_at: new Date().toISOString() })
        .eq("id", existingUser.id)

      if (updateError) {
        console.error("Error al actualizar información de usuario:", updateError)
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    } else {
      // Crear un nuevo registro
      const { error: insertError } = await supabase.from("user_info").insert([{ email, username }])

      if (insertError) {
        console.error("Error al guardar información de usuario:", insertError)
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al guardar información de usuario:", error)
    return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
