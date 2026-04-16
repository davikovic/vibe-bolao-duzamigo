import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // 1. Permitir acesso a rotas públicas e recursos estáticos
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // Recursos como imagens, favicon, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Se não estiver logado, redirecionar para login (opcional, já que NextAuth pode lidar com isso, mas bom para /pending)
  if (!token) {
    if (pathname === "/pending") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 3. Se o usuário estiver PENDING, só pode acessar /pending e /api/auth
  if (token.status === "pending") {
    if (pathname !== "/pending") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }
  }

  // 4. Bloquear acesso ao /admin se não for admin
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 5. Se o usuário estiver ACTIVE e tentar acessar /pending, levar para home
  if (token.status === "active") {
    if (pathname === "/pending") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configuração opcional para otimizar o middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
