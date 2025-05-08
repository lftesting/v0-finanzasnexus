import { createServerSupabaseClient, getCurrentUser } from "@/lib/server-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Obtener el usuario actual
    const currentUser = await getCurrentUser()

    // Obtener información adicional sobre las cookies
    const supabase = createServerSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()

    return NextResponse.json({
      success: true,
      currentUser,
      sessionExists: !!sessionData.session,
      sessionUserId: sessionData.session?.user?.id || null,
      sessionUserEmail: sessionData.session?.user?.email || null,
    })
  } catch (error) {
    console.error("Error en la ruta de verificación de autenticación:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar la autenticación",
        errorDetails: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
