"use server"

import { container } from "@/lib/di/container"
import { revalidatePath, updateTag } from "next/cache"
import { lucia } from "@/lib/auth"
import { cookies } from "next/headers"

import { getClientIp } from "@/lib/utils/get-ip"
import { CaptchaService } from "@/lib/services/captcha.service"

const { replyController } = container

export async function createReply(formData: FormData) {
  try {
    const ipAddress = await getClientIp()
    const captchaAnswer = formData.get("captcha") as string

    const isValidCaptcha = await CaptchaService.verify(captchaAnswer)
    if (!isValidCaptcha) {
      throw new Error("Jawaban CAPTCHA salah atau sudah kadaluarsa.")
    }

    // Extract and forward request
    const threadId = Number.parseInt(formData.get("threadId") as string)
    const boardId = Number.parseInt(formData.get("boardId") as string)
    const boardCode = formData.get("boardCode") as string
    const content = formData.get("content") as string
    const author = formData.get("author") as string
    const imageFile = formData.get("image") as File | null
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

    const result = await replyController.createReply({
      threadId,
      content,
      author,
      imageFile,
      deletionPassword,
      isNsfw,
      isSpoiler,
      ipAddress,
      capcode: userRole,
    })

    revalidatePath("/", "layout")
    revalidatePath(`/${boardCode}`)
    revalidatePath(`/${boardCode}/thread/${threadId}`)
    updateTag(`thread-${threadId}`)
    if (boardId) {
      updateTag(`board-${boardId}-threads`)
    }
    updateTag("stats")
    return { success: true, replyId: result.replyId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create reply" }
  }
}
