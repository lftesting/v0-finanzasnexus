import { storeUserSession } from "@/lib/user-session"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sessionId, userId, email } = await request.json()

    if (!sessionId || !userId || !email) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    const success = await storeUserSession(sessionId, userId, email)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error al almacenar la sesión:", error)
    return NextResponse.json({ success: false, error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
