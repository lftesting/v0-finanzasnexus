import { getCurrentUser } from "@/lib/server-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    return NextResponse.json(currentUser)
  } catch (error) {
    console.error("Error al obtener el usuario:", error)
    return NextResponse.json({ username: "Sistema" })
  }
}
