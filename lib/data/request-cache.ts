import { cache } from "react"
import { cookies } from "next/headers"
import { lucia } from "@/lib/auth"
import { getBoardByCode } from "@/lib/actions/board.actions"
import { BoardRepository } from "@/lib/repositories/board.repository"
import { ThreadRepository } from "@/lib/repositories/thread.repository"
import { ReplyRepository } from "@/lib/repositories/reply.repository"
import { GetThreadDetailUseCase } from "@/lib/use-cases/get-thread-detail.use-case"

/**
 * Per-request memoization (React `cache`). generateMetadata, the page and its
 * nested server components often need the same rows; these helpers make sure
 * each lookup hits the database once per request.
 */

export const getBoardByCodeCached = cache((code: string) => getBoardByCode(code))

export const getBoardByIdCached = cache((id: number) => new BoardRepository().findById(id))

export const getAuthUserCached = cache(async () => {
  try {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value || null
    if (!sessionId) return null
    const { session, user } = await lucia.validateSession(sessionId)
    return session ? user : null
  } catch {
    return null
  }
})

/** Keyed by role so moderators (who also see deleted posts) never share a result with visitors. */
export const getThreadDetailCached = cache((threadId: number, role: string | null) =>
  new GetThreadDetailUseCase(new ThreadRepository(), new ReplyRepository()).execute(
    threadId,
    role ? { role } : undefined,
  ),
)
