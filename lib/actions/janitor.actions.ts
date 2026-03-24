"use server"

import { container } from "@/lib/di/container"
import { revalidatePath } from "next/cache"
import { getModeratorAuthorizer } from "./moderation.actions"

const { janitorController } = container

export async function getJanitors() {
  try {
    const user = await getModeratorAuthorizer()
    if (user.role !== "admin") throw new Error("Unauthorized")
    return await janitorController.getJanitors(user)
  } catch (error) {
    console.error("Error fetching janitors:", error)
    return []
  }
}

export async function createJanitor(formData: FormData) {
  try {
    const user = await getModeratorAuthorizer()
    const email = formData.get("email") as string
    const password = formData.get("password") as string || undefined

    await janitorController.createJanitor(user, { email, password })
    revalidatePath("/mod/janitors")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create janitor" }
  }
}

export async function assignBoard(janitorUserId: string, boardId: number) {
  try {
    const user = await getModeratorAuthorizer()
    await janitorController.assignBoard(user, janitorUserId, boardId)
    revalidatePath("/mod/janitors")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign board" }
  }
}

export async function unassignBoard(janitorUserId: string, boardId: number) {
  try {
    const user = await getModeratorAuthorizer()
    await janitorController.unassignBoard(user, janitorUserId, boardId)
    revalidatePath("/mod/janitors")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to unassign board" }
  }
}

export async function deleteJanitor(id: string) {
  try {
    const user = await getModeratorAuthorizer()
    await janitorController.deleteJanitor(user, id)
    revalidatePath("/mod/janitors")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete janitor" }
  }
}

