import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Crear una respuesta que podamos modificar
  const res = NextResponse.next()

  // Crear cliente de Supabase para el middleware
  const supabase = createMiddlewareClient({ req, res })

  // Refrescar la sesión si existe
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Registrar el estado de autenticación para depuración
  console.log("Estado de autenticación:", {
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
        }
      : null,
    pathname: req.nextUrl.pathname,
  })

  // Si no hay sesión y no estamos en la página de login, redirigir a login
  if (!session && req.nextUrl.pathname !== "/login") {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay sesión y estamos en la página de login, redirigir a la página principal
  if (session && req.nextUrl.pathname === "/login") {
    const homeUrl = new URL("/", req.url)
    return NextResponse.redirect(homeUrl)
  }

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
