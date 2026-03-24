"use server"

import { container } from "@/lib/di/container"
import { revalidatePath } from "next/cache"

const { moderationController, createReportUseCase } = container

import { lucia } from "@/lib/auth"
import { cookies } from "next/headers"

export async function getModeratorAuthorizer() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value || null

  if (!sessionId) {
    throw new Error("Unauthorized: No session found")
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (!session) {
    throw new Error("Unauthorized: Invalid session")
  }

  if (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor") {
    throw new Error("Unauthorized: insufficient permissions")
  }

  const enrichedUser = { ...user, janitorBoards: [] as number[] }
  if (user.role === "janitor") {
    enrichedUser.janitorBoards = await container.boardJanitorRepository.getJanitorBoards(user.id)
  }

  return enrichedUser
}

export async function getAdminOrModeratorAuthorizer() {
  const user = await getModeratorAuthorizer()
  if (user.role === "janitor") {
    throw new Error("Unauthorized: insufficient permissions")
  }
  return user
}

async function handleModerationAction(actionCall: (user: any) => Promise<any>, revalidate: string | null = "/mod") {
  try {
    const user = await getModeratorAuthorizer()
    await actionCall(user)

    // Specifically revalidate the requested path (usually /mod)
    if (revalidate) {
      revalidatePath(revalidate)
    }

    // Aggressively revalidate everything to ensure deleted threads/posts 
    // disappear from Home, Board List, and Thread Detail pages immediately.
    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

export async function lockThread(threadId: number) {
  return handleModerationAction((user) => moderationController.lockThread(user, threadId))
}

export async function unlockThread(threadId: number) {
  return handleModerationAction((user) => moderationController.unlockThread(user, threadId))
}

export async function pinThread(threadId: number) {
  return handleModerationAction((user) => moderationController.pinThread(user, threadId))
}

export async function unpinThread(threadId: number) {
  return handleModerationAction((user) => moderationController.unpinThread(user, threadId))
}

export async function deleteThread(threadId: number) {
  return handleModerationAction((user) => moderationController.deleteThread(user, threadId))
}

export async function deleteReply(replyId: number) {
  return handleModerationAction((user) => moderationController.deleteReply(user, replyId))
}

export async function resolveReport(reportId: number) {
  return handleModerationAction((user) => moderationController.resolveReport(user, reportId, "moderator"))
}

export async function dismissReport(reportId: number) {
  return handleModerationAction((user) => moderationController.dismissReport(user, reportId, "moderator"))
}

export async function createReport(contentType: "thread" | "reply", contentId: number, reason: string) {
  try {
    const reportId = await createReportUseCase.execute({
      contentType,
      contentId,
      reason,
    })
    return { success: true, reportId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create report" }
  }
}

export async function getPendingReports(limit?: number, offset?: number, boardId?: number) {
  try {
    const user = await getModeratorAuthorizer()
    return await moderationController.getPendingReports(user, { limit, offset, boardId })
  } catch (error) {
    console.error("Error fetching pending reports:", error)
    return { reports: [], total: 0 }
  }
}

export async function getResolvedReports(limit?: number, offset?: number, boardId?: number) {
  try {
    const user = await getModeratorAuthorizer()
    return await moderationController.getResolvedReports(user, { limit, offset, boardId })
  } catch (error) {
    console.error("Error fetching resolved reports:", error)
    return { reports: [], total: 0 }
  }
}

export async function banUser(ipAddress: string, reason?: string, durationHours?: number) {
  return handleModerationAction((user) => moderationController.banUser(user, ipAddress, reason, durationHours))
}

export async function unbanUser(ipAddress: string) {
  return handleModerationAction((user) => moderationController.unbanUser(user, ipAddress))
}

export async function markAsNsfw(contentType: "thread" | "reply", contentId: number) {
  return handleModerationAction((user) => moderationController.markAsNsfw(user, contentType, contentId))
}

export async function getBans() {
  try {
    const user = await getModeratorAuthorizer()
    return await moderationController.getBans(user)
  } catch (error) {
    console.error("Error fetching bans:", error)
    return []
  }
}

export async function updateBan(id: number, reason?: string, durationHours?: number | null) {
  return handleModerationAction((user) => moderationController.updateBan(user, id, reason, durationHours))
}

export async function bulkResolveReports(reportIds: number[]) {
  return handleModerationAction((user) => moderationController.bulkResolveReports(user, reportIds))
}

export async function bulkDismissReports(reportIds: number[]) {
  return handleModerationAction((user) => moderationController.bulkDismissReports(user, reportIds))
}

export async function handleSpamMacro(reportId: number, contentType: "thread" | "reply", contentId: number, ipAddress: string) {
  return handleModerationAction(async (user) => {
    // 1. Ban User
    await moderationController.banUser(user, ipAddress, "Spam / Iklan", 24)
    
    // 2. Delete Content
    if (contentType === "thread") {
      await moderationController.deleteThread(user, contentId)
    } else {
      await moderationController.deleteReply(user, contentId)
    }

    // 3. Resolve Report
    await moderationController.resolveReport(user, reportId, "moderator")
  })
}
