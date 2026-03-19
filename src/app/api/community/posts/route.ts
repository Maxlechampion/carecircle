import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, ok, err, parsePagination } from '@/lib/api-helpers'

// GET /api/community/posts
export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const url = new URL(request.url)
  const { skip, limit } = parsePagination(url)
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')

  const where = {
    ...(category && category !== 'all' && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [posts, total] = await Promise.all([
    db.communityPost.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { comments: true, likesUsers: true } },
        likesUsers: {
          where: { userId: session!.user.id },
          select: { id: true },
        },
      },
    }),
    db.communityPost.count({ where }),
  ])

  const formatted = posts.map(p => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    likes: p._count.likesUsers,
    comments: p._count.comments,
    views: p.views,
    isPinned: p.isPinned,
    isAnonymous: p.isAnonymous,
    isLiked: p.likesUsers.length > 0,
    author: p.isAnonymous ? { id: p.authorId, name: 'Anonyme', avatar: null, role: 'caregiver' } : p.author,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    isOwn: p.authorId === session!.user.id,
  }))

  return ok({ posts: formatted, total, page: Math.ceil(skip / limit) + 1 })
}

// POST /api/community/posts
export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const { title, content, category, isAnonymous } = body

    if (!title?.trim()) return err('Le titre est requis')
    if (!content?.trim()) return err('Le contenu est requis')

    const post = await db.communityPost.create({
      data: {
        authorId: session!.user.id,
        title: title.trim(),
        content: content.trim(),
        category: category || 'general',
        isAnonymous: isAnonymous || false,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { comments: true, likesUsers: true } },
      },
    })

    return ok({
      ...post,
      likes: 0,
      comments: 0,
      isLiked: false,
      isOwn: true,
      author: post.isAnonymous
        ? { id: post.authorId, name: 'Anonyme', avatar: null, role: 'caregiver' }
        : post.author,
    }, 201)
  } catch (e) {
    console.error('POST /api/community/posts error:', e)
    return err('Erreur serveur', 500)
  }
}
