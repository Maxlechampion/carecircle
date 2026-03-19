import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err } from '@/lib/api-helpers'

// GET /api/community/posts/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const post = await db.communityPost.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, avatar: true, role: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      },
      _count: { select: { comments: true, likesUsers: true } },
      likesUsers: { where: { userId: session!.user.id }, select: { id: true } },
    },
  })

  if (!post) return err('Discussion introuvable', 404)

  // Increment views
  await db.communityPost.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  return ok({
    ...post,
    likes: post._count.likesUsers,
    isLiked: post.likesUsers.length > 0,
    isOwn: post.authorId === session!.user.id,
    author: post.isAnonymous ? { id: post.authorId, name: 'Anonyme', avatar: null, role: 'caregiver' } : post.author,
    comments: post.comments.map(c => ({
      ...c,
      author: c.isAnonymous ? { id: c.authorId, name: 'Anonyme', avatar: null } : c.author,
      isOwn: c.authorId === session!.user.id,
    })),
  })
}

// DELETE /api/community/posts/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth()
  if (error) return error

  const post = await db.communityPost.findUnique({ where: { id: params.id } })
  if (!post) return err('Discussion introuvable', 404)
  if (post.authorId !== session!.user.id) return err('Non autorisé', 403)

  await db.communityPost.delete({ where: { id: params.id } })
  return ok({ message: 'Discussion supprimée' })
}
