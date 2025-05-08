import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Crear una respuesta que podamos modificar
  const res = NextResponse.next()

  // Crear cliente de Supabase para el middleware
  const supabase = createMiddlewareClient({ req, res })

  // Refrescar la sesión si existe
  await supabase.auth.getSession()

  // Permitir que la solicitud continúe
  return res
}

// Configurar las rutas que deben usar el middleware
export const config = {
  matcher: [
    // Excluir archivos estáticos y API routes que no necesitan autenticación
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
