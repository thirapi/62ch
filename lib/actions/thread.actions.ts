"use server"

import { container } from "@/lib/di/container"
import { revalidatePath, revalidateTag } from "next/cache"
import { lucia } from "@/lib/auth"
import { cookies } from "next/headers"

import { getClientIp } from "@/lib/utils/get-ip"
import { CaptchaService } from "@/lib/services/captcha.service"

const { threadController, threadRepository, replyRepository, getArchivedThreadsUseCase } = container

export async function createThread(formData: FormData) {
  try {
    const ipAddress = await getClientIp()
    const isValidCaptcha = await CaptchaService.verify(
      formData.get("captchaId"),
      formData.get("captcha"),
    )
    if (!isValidCaptcha) {
      throw new Error("Jawaban CAPTCHA salah atau sudah kadaluarsa.")
    }

    // Extract and forward request
    const boardId = Number.parseInt(formData.get("boardId") as string)
    const boardCode = formData.get("boardCode") as string
    const subject = formData.get("subject") as string
    const rawContent = formData.get("content")
    const content = typeof rawContent === "string" ? rawContent.replace(/\r\n/g, "\n") : ""
    const author = formData.get("author") as string
    const imageFile = formData.get("image") as File | null
    const imageUrl = formData.get("imageUrl") as string
    const imageMetadata = formData.get("imageMetadata") as string
    const deletionPassword = formData.get("deletionPassword") as string
    const isNsfw = formData.get("isNsfw") === "on"
    const isSpoiler = formData.get("isSpoiler") === "on"
    const withCapcode = formData.get("withCapcode") === "on"

    let userRole: string | undefined
    if (withCapcode) {
      const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value || null
      if (sessionId) {
        const { user } = await lucia.validateSession(sessionId)
        if (user && (user.role === "admin" || user.role === "moderator")) {
          userRole = user.role
        } else {
          throw new Error("Anda tidak memiliki izin untuk menggunakan capcode.")
        }
      } else {
        throw new Error("Anda harus login untuk menggunakan capcode.")
      }
    }

    const { threadId, postNumber } = await threadController.createThread({
      boardId,
      subject,
      content,
      author,
      imageFile,
      imageUrl,
      imageMetadata,
      deletionPassword,
      isNsfw,
      isSpoiler,
      ipAddress,
      capcode: userRole,
    })

    revalidatePath("/")
    revalidatePath(`/${boardCode}`)
    revalidateTag('system-stats', 'default')
    revalidateTag('latest-posts', 'default')
    revalidateTag('recent-images', 'default')
    revalidateTag('boards', 'default')
    return { success: true, threadId, postNumber }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create thread" }
  }
}

export async function getThreadList(
  boardId: number,
  limit?: number,
  offset?: number,
  sortBy?: "bump" | "new" | "replies" | "images",
  search?: string,
) {
  try {
    return await threadController.getThreadList(boardId, limit, offset, sortBy, search)
  } catch (error) {
    console.error(`Error fetching thread list for board ${boardId}:`, error)
    return { threads: [], totalPages: 0 }
  }
}

export async function getThreadDetail(threadId: number) {
  try {
    return await threadController.getThreadDetail(threadId)
  } catch (error) {
    console.error(`Error fetching thread detail for thread ${threadId}:`, error)
    return null
  }
}

/**
 * Lightweight status check used by the thread auto-updater: one row lookup
 * plus a COUNT, instead of fetching the whole thread with all replies.
 */
export async function getThreadStatus(threadId: number) {
  try {
    if (!Number.isInteger(threadId) || threadId <= 0) return null
    const thread = await threadRepository.findById(threadId)
    if (!thread || thread.isDeleted) return null
    const replyCount = await replyRepository.countByThreadId(threadId)
    return {
      replyCount,
      isLocked: !!thread.isLocked,
      isArchived: !!thread.isArchived,
    }
  } catch (error) {
    console.error(`Error fetching thread status for thread ${threadId}:`, error)
    return null
  }
}

/** Batched, lightweight status for the thread watcher. Missing ids mean the thread is gone. */
export async function getWatchedThreadStatuses(threadIds: number[]) {
  try {
    const ids = Array.from(new Set(threadIds))
      .filter((id) => Number.isInteger(id) && id > 0)
      .slice(0, 100)
    const rows = await threadRepository.getWatchStatuses(ids)
    return rows.map((r) => ({ ...r, lastActivityAt: r.lastActivityAt.getTime() }))
  } catch (error) {
    console.error("Error fetching watched thread statuses:", error)
    return null
  }
}

export async function getArchivedThreads(boardId: number) {
  try {
    return await getArchivedThreadsUseCase.execute(boardId)
  } catch (error) {
    console.error(`Error fetching archived threads for board ${boardId}:`, error)
    return []
  }
}

export async function getCaptcha() {
  return await CaptchaService.generate()
}
