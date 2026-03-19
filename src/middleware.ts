import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect authenticated users away from auth page
    if (pathname.startsWith('/auth') && token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl

        // Public routes — always accessible
        const publicRoutes = ['/auth', '/api/auth', '/_next', '/favicon.ico', '/robots.txt', '/logo.svg']
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // API routes that don't need auth (Stripe webhooks, etc.)
        if (pathname === '/api/stripe/webhook') {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, logo.svg (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)',
  ],
}
