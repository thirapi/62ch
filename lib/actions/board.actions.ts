"use server"

import { container } from "@/lib/di/container"
import { revalidatePath, updateTag, cacheTag, cacheLife } from "next/cache"
import { getModeratorAuthorizer } from "./moderation.actions"

const { boardController } = container

export async function getAllBoards() {
  try {
    await getModeratorAuthorizer()
    const getCached = async () => {
      'use cache';
      cacheLife('hours');
      cacheTag("boards");
      return boardController.getAllBoards();
    };
    return await getCached();
  } catch (error) {
    console.error("Error fetching boards:", error)
    return []
  }
}

export async function getBoardCategories() {
  try {
    await getModeratorAuthorizer()
    const getCached = async () => {
      'use cache';
      cacheLife('hours');
      cacheTag("categories");
      return boardController.getBoardCategories();
    };
    return await getCached();
  } catch (error) {
    console.error("Error fetching board categories:", error)
    return []
  }
}

export async function getBoardById(id: number) {
  try {
    await getModeratorAuthorizer()
    const getCached = async (boardId: number) => {
      'use cache';
      cacheLife('hours');
      cacheTag(`board-${boardId}`, "boards");
      return boardController.getBoardById(boardId);
    };
    return await getCached(id);
  } catch (error) {
    console.error(`Error fetching board with ID ${id}:`, error)
    return null
  }
}

export async function createBoard(formData: FormData) {
  try {
    await getModeratorAuthorizer()
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

    revalidatePath("/", "layout")
    revalidatePath("/mod/boards")
    updateTag("boards")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create board" }
  }
}

export async function updateBoard(formData: FormData) {
  try {
    await getModeratorAuthorizer()
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

    revalidatePath("/", "layout")
    revalidatePath("/mod/boards")
    revalidatePath(`/mod/boards/${id}`)
    updateTag("boards")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update board" }
  }
}

export async function deleteBoard(id: number) {
    try {
      await getModeratorAuthorizer()
      await boardController.deleteBoard(id)
      revalidatePath("/", "layout")
      revalidatePath("/mod/boards")
      updateTag("boards")
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete board" }
    }
  }

  export async function getBoardByCode(code: string) {
    try {
      const getCached = async (boardCode: string) => {
        'use cache';
        cacheLife('hours');
        cacheTag(`board-code-${boardCode}`, "boards");
        return boardController.getBoardByCode(boardCode);
      };
      return await getCached(code);
    } catch (error) {
      console.error(`Error fetching board with code ${code}:`, error)
      return null
    }
  }
