"use server"

import { container } from "@/lib/di/container"
import { revalidatePath, revalidateTag } from "next/cache"
import { lucia } from "@/lib/auth"
import { cookies } from "next/headers"

import { getClientIp } from "@/lib/utils/get-ip"
import { CaptchaService } from "@/lib/services/captcha.service"

const { threadController } = container

export async function createThread(formData: FormData) {
  try {
    const ipAddress = await getClientIp()
    const captchaAnswer = formData.get("captcha") as string
    const captchaToken = formData.get("captchaToken") as string

    const isValidCaptcha = await CaptchaService.verify(captchaAnswer, captchaToken)
    if (!isValidCaptcha) {
      throw new Error("Jawaban CAPTCHA salah atau sudah kadaluarsa.")
    }

    // Extract and forward request
    const boardId = Number.parseInt(formData.get("boardId") as string)
    const boardCode = formData.get("boardCode") as string
    const subject = formData.get("subject") as string
    const rawContent = formData.get("content") as string
    const content = rawContent.replace(/\r\n/g, "\n")
    if (content.length > 2000) {
      throw new Error("Pesan terlalu panjang (maksimum 2000 karakter).")
    }
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
  sortBy?: "bump" | "new" | "replies" | "images"
) {
  try {
    return await threadController.getThreadList(boardId, limit, offset, sortBy)
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

export async function getCaptcha() {
  return await CaptchaService.generate()
}
