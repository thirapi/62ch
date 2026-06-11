"use server"

import { container } from "@/lib/di/container"
import { revalidatePath } from "next/cache"
import { getAdminAuthorizer } from "./moderation.actions"

const { janitorController } = container

export async function getStaffList() {
  try {
    const user = await getAdminAuthorizer()
    return await janitorController.getJanitors(user)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return []
  }
}

export async function createStaffMember(formData: FormData) {
  try {
    const user = await getAdminAuthorizer()
    const email = formData.get("email") as string
    const password = formData.get("password") as string || undefined
    const role = formData.get("role") as "moderator" | "janitor" || "janitor"

    await janitorController.createJanitor(user, { email, password, role })
    revalidatePath("/mod/staff")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create staff member" }
  }
}

export async function assignBoardToStaff(staffUserId: string, boardId: number) {
  try {
    const user = await getAdminAuthorizer()
    await janitorController.assignBoard(user, staffUserId, boardId)
    revalidatePath("/mod/staff")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign board" }
  }
}

export async function unassignBoardFromStaff(staffUserId: string, boardId: number) {
  try {
    const user = await getAdminAuthorizer()
    await janitorController.unassignBoard(user, staffUserId, boardId)
    revalidatePath("/mod/staff")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to unassign board" }
  }
}

export async function deleteStaffMember(id: string) {
  try {
    const user = await getAdminAuthorizer()
    await janitorController.deleteJanitor(user, id)
    revalidatePath("/mod/staff")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete staff member" }
  }
}

