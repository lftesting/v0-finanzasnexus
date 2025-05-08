import { createServerSupabaseClient, getCurrentUser } from "@/lib/server-utils"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Obtener todas las cookies para depuración
    const allCookies = cookies().getAll()
    const cookieNames = allCookies.map((c) => c.name)
    const authCookies = allCookies.filter((c) => c.name.includes("supabase") || c.name.includes("auth"))

    // Obtener el usuario actual usando la función existente
    const currentUser = await getCurrentUser()

    // Obtener la sesión directamente para comparar
    const supabase = createServerSupabaseClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Verificar si hay una sesión activa
    const sessionExists = !!sessionData.session
    const sessionUser = sessionData.session?.user || null

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      currentUser,
      sessionExists,
      sessionUser: sessionUser
        ? {
            id: sessionUser.id,
            email: sessionUser.email,
            // Omitir datos sensibles
          }
        : null,
      cookieCount: allCookies.length,
      cookieNames,
      authCookies: authCookies.map((c) => ({ name: c.name, value: c.value.substring(0, 20) + "..." })),
      // Incluir información sobre el error de sesión si existe
      sessionError: sessionError
        ? {
            message: sessionError.message,
            status: sessionError.status,
          }
        : null,
    })
  } catch (error) {
    console.error("Error en la ruta de depuración de autenticación:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al verificar la autenticación",
        errorDetails: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
