import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// POST /api/community/posts/[id]/like — toggle like
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const post = await db.communityPost.findUnique({ where: { id: params.id } })
  if (!post) return err('Discussion introuvable', 404)

  const existing = await db.postLike.findUnique({
    where: { postId_userId: { postId: params.id, userId: session!.user.id } },
  })

  if (existing) {
    await db.postLike.delete({ where: { id: existing.id } })
    const count = await db.postLike.count({ where: { postId: params.id } })
    return ok({ liked: false, likes: count })
  } else {
    await db.postLike.create({
      data: { postId: params.id, userId: session!.user.id },
    })
    const count = await db.postLike.count({ where: { postId: params.id } })
    return ok({ liked: true, likes: count })
  }
}
