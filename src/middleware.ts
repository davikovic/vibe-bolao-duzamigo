import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  // 2. Se não estiver logado, redirecionar IMEDIATAMENTE para login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
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

    // REGRA MULTI-BOLÃO: Se não tem poolId, mandar para explorar (exceto rotas permitidas)
    const isAllowedWithoutPool =
      pathname === "/pools/explore" ||
      pathname.startsWith("/admin") ||
      pathname === "/profile" ||
      pathname === "/pools/my-groups" ||
      // Moderadores podem acessar a página de gerenciamento do seu pool sem ter o poolId ativo no cookie
      /^\/pools\/\d+\/manage$/.test(pathname);

    if (!token.poolId && !isAllowedWithoutPool) {
      return NextResponse.redirect(new URL("/pools/explore", request.url));
    }
  }

  // 6. Bloquear /pools/[poolId]/manage para quem não é moderador nem admin
  const manageMatch = pathname.match(/^\/pools\/(\d+)\/manage$/);
  if (manageMatch) {
    const poolId = Number(manageMatch[1]);
    const isGlobalAdmin = token.role === "admin";
    const moderatedPoolIds: number[] = (token.moderatedPoolIds as number[]) ?? [];
    const isModerator = moderatedPoolIds.includes(poolId);

    if (!isGlobalAdmin && !isModerator) {
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
