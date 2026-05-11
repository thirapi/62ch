"use server"

import { container } from "@/lib/di/container"

const { threadController } = container

export async function deletePost(postId: number, postType: "thread" | "reply", password?: string) {
    try {
        await threadController.deletePostWithPassword(postId, postType, password)
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus postingan" }
    }
}

export async function searchThreads(boardId: number, query: string) {
    try {
        return await threadController.searchThreads(boardId, query)
    } catch (error) {
        console.error("Search error:", error)
        return []
    }
}
