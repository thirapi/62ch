"use server"

import { container } from "@/lib/di/container"
import { revalidatePath } from "next/cache"
import { getAdminOrModeratorAuthorizer } from "./moderation.actions"

const { boardController } = container

export async function getAllBoards() {
  try {
    await getAdminOrModeratorAuthorizer()
    return await boardController.getAllBoards()
  } catch (error) {
    console.error("Error fetching boards:", error)
    return []
  }
}

export async function getBoardCategories() {
  try {
    await getAdminOrModeratorAuthorizer()
    return await boardController.getBoardCategories()
  } catch (error) {
    console.error("Error fetching board categories:", error)
    return []
  }
}

export async function getBoardById(id: number) {
  try {
    await getAdminOrModeratorAuthorizer()
    return await boardController.getBoardById(id)
  } catch (error) {
    console.error(`Error fetching board with ID ${id}:`, error)
    return null
  }
}

export async function createBoard(formData: FormData) {
  try {
    await getAdminOrModeratorAuthorizer()
    const code = formData.get("code") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const categoryIdStr = formData.get("categoryId") as string
    const categoryId = (categoryIdStr && categoryIdStr !== "none") ? Number.parseInt(categoryIdStr) : null

    await boardController.createBoard({
      code,
      name,
      description,
      categoryId,
    })

    revalidatePath("/")
    revalidatePath("/mod/boards")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create board" }
  }
}

export async function updateBoard(formData: FormData) {
  try {
    await getAdminOrModeratorAuthorizer()
    const id = Number.parseInt(formData.get("id") as string)
    const code = formData.get("code") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const categoryIdStr = formData.get("categoryId") as string
    const categoryId = (categoryIdStr && categoryIdStr !== "none") ? Number.parseInt(categoryIdStr) : null

    await boardController.updateBoard({
      id,
      code,
      name,
      description,
      categoryId,
    })

    revalidatePath("/")
    revalidatePath("/mod/boards")
    revalidatePath(`/mod/boards/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update board" }
  }
}

export async function deleteBoard(id: number) {
  try {
    await getAdminOrModeratorAuthorizer()
    await boardController.deleteBoard(id)
    revalidatePath("/")
    revalidatePath("/mod/boards")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete board" }
  }
}
