import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/** Get the authenticated session or return 401 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }
  return { session, error: null }
}

/** Standard success response */
export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

/** Standard error response */
export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Parse pagination from URL params */
export function parsePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
