"use server"

import { container } from "@/lib/di/container"
import { revalidatePath, updateTag, cacheTag, cacheLife } from "next/cache"
import { lucia } from "@/lib/auth"
import { cookies } from "next/headers"

import { getClientIp } from "@/lib/utils/get-ip"
import { CaptchaService } from "@/lib/services/captcha.service"

const { threadController } = container

export async function createThread(formData: FormData) {
  try {
    const ipAddress = await getClientIp()
    const captchaAnswer = formData.get("captcha") as string

    const isValidCaptcha = await CaptchaService.verify(captchaAnswer)
    if (!isValidCaptcha) {
      throw new Error("Jawaban CAPTCHA salah atau sudah kadaluarsa.")
    }

    // Extract and forward request
    const boardId = Number.parseInt(formData.get("boardId") as string)
    const boardCode = formData.get("boardCode") as string
    const subject = formData.get("subject") as string
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

    const result = await threadController.createThread({
      boardId,
      subject,
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
    updateTag(`board-${boardId}-threads`)
    updateTag("threads")
    updateTag("stats")
    return { success: true, threadId: result.threadId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create thread" }
  }
}

export async function getThreadList(boardId: number, limit: number = 50, offset: number = 0) {
  'use cache';
  cacheLife('minutes');
  cacheTag(`board-${boardId}-threads`, "threads");
  
  try {
    return await threadController.getThreadList(boardId, limit, offset);
  } catch (error) {
    console.error(`Error fetching thread list for board ${boardId}:`, error)
    return { threads: [], totalPages: 0 }
  }
}

export async function getThreadDetail(threadId: number) {
  'use cache';
  cacheLife('minutes');
  cacheTag(`thread-${threadId}`);

  try {
    return await threadController.getThreadDetail(threadId);
  } catch (error) {
    console.error(`Error fetching thread detail for thread ${threadId}:`, error)
    return null
  }
}

export async function getCaptcha() {
  return await CaptchaService.generate()
}
