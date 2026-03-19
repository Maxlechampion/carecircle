import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// POST /api/community/posts/[id]/comments
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const post = await db.communityPost.findUnique({ where: { id: params.id } })
  if (!post) return err('Discussion introuvable', 404)

  const { content, isAnonymous } = await request.json()
  if (!content?.trim()) return err('Le commentaire ne peut pas être vide')

  const comment = await db.communityComment.create({
    data: {
      postId: params.id,
      authorId: session!.user.id,
      content: content.trim(),
      isAnonymous: isAnonymous || false,
    },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  })

  return ok({
    ...comment,
    author: comment.isAnonymous ? { id: comment.authorId, name: 'Anonyme', avatar: null } : comment.author,
    isOwn: true,
  }, 201)
}
