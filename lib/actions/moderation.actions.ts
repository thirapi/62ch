"use server"

import { container } from "@/lib/di/container"
import { revalidatePath } from "next/cache"

const { moderationController, createReportUseCase } = container

import { lucia } from "@/lib/auth"
import { cookies } from "next/headers"

async function getModeratorAuthorizer() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value || null

  if (!sessionId) {
    throw new Error("Unauthorized: No session found")
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (!session || (user.role !== "admin" && user.role !== "moderator")) {
    throw new Error("Unauthorized: Invalid session or insufficient permissions")
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

export async function getPendingReports() {
  try {
    const user = await getModeratorAuthorizer()
    return await moderationController.getPendingReports(user)
  } catch (error) {
    console.error("Error fetching pending reports:", error)
    return []
  }
}

export async function getResolvedReports() {
  try {
    const user = await getModeratorAuthorizer()
    return await moderationController.getResolvedReports(user)
  } catch (error) {
    console.error("Error fetching resolved reports:", error)
    return []
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
