"use server"

import { container } from "@/lib/di/container"
import { revalidatePath, updateTag, cacheTag, cacheLife } from "next/cache"
import { getModeratorAuthorizer } from "./moderation.actions"

const { boardCategoryController } = container

export async function getAllCategories() {
  try {
    await getModeratorAuthorizer()
    const getCached = async () => {
      'use cache';
      cacheLife('hours');
      cacheTag("categories");
      return boardCategoryController.getCategories();
    };
    return await getCached();
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(formData: FormData) {
  try {
    await getModeratorAuthorizer()
    const name = formData.get("name") as string
    const displayOrderRaw = formData.get("displayOrder")
    const displayOrder = displayOrderRaw ? Number.parseInt(displayOrderRaw as string) : undefined

    await boardCategoryController.createCategory({
      name,
      displayOrder,
    })

    revalidatePath("/", "layout")
    revalidatePath("/mod/categories")
    revalidatePath("/mod/boards")
    revalidatePath("/mod/boards/new")
    updateTag("categories")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create category" }
  }
}

export async function updateCategory(formData: FormData) {
  try {
    await getModeratorAuthorizer()
    const id = Number.parseInt(formData.get("id") as string)
    const name = formData.get("name") as string
    const displayOrder = Number.parseInt(formData.get("displayOrder") as string)

    await boardCategoryController.updateCategory({
      id,
      name,
      displayOrder: isNaN(displayOrder) ? undefined : displayOrder,
    })

    revalidatePath("/", "layout")
    revalidatePath("/mod/categories")
    revalidatePath("/mod/boards")
    updateTag("categories")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update category" }
  }
}

export async function deleteCategory(id: number) {
  try {
    await getModeratorAuthorizer()
    await boardCategoryController.deleteCategory(id)
    revalidatePath("/", "layout")
    revalidatePath("/mod/categories")
    revalidatePath("/mod/boards")
    updateTag("categories")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete category" }
  }
}

export async function reorderCategoryUp(id: number) {
  try {
    await getModeratorAuthorizer()
    await boardCategoryController.reorderCategory(id, 'up')
    revalidatePath("/", "layout")
    revalidatePath("/mod/categories")
    updateTag("categories")
    return { success: true }
  } catch (error) {
    console.error("ReorderUp Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengubah urutan." }
  }
}

export async function reorderCategoryDown(id: number) {
  try {
    await getModeratorAuthorizer()
    await boardCategoryController.reorderCategory(id, 'down')
    revalidatePath("/", "layout")
    revalidatePath("/mod/categories")
    updateTag("categories")
    return { success: true }
  } catch (error) {
    console.error("ReorderDown Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengubah urutan." }
  }
}
