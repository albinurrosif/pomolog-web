import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar rute yang TIDAK boleh diakses tanpa login
const protectedRoutes = ['/dashboard', '/history', '/analytics'];

// Daftar rute yang TIDAK boleh diakses jika SUDAH login
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  // Ambil token dari cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika User mencoba masuk ke halaman terlindungi TANPA token
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute && !token) {
    // redirect ke login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika User mencoba masuk ke halaman Login padahal SUDAH punya token
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute && token) {
    // redirect ke dashboard
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Jika tidak ada kondisi di atas yang terpenuhi, lanjutkan request seperti biasa
  return NextResponse.next();
}

// Menentukan rute mana yang akan diproses oleh middleware ini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};