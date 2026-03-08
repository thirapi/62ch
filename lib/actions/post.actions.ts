"use server"

import { db } from "@/lib/db"
import { threads } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { container } from "@/lib/di/container"
import { ThreadUI } from "@/lib/entities/thread.entity"
import { generatePosterId } from "../utils/poster-id"

const { deletePostWithPasswordUseCase } = container

export async function deletePost(postId: number, postType: "thread" | "reply", password?: string) {
    try {
        await deletePostWithPasswordUseCase.execute(postId, postType, password)
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus postingan" }
    }
}

export async function searchThreads(boardId: number, query: string): Promise<ThreadUI[]> {
    // Basic search functionality
    try {
        const results = await db.query.threads.findMany({
            where: and(
                eq(threads.boardId, boardId),
                eq(threads.isDeleted, false)
            )
        })

        // Filter by query and map to safe UI model
        const q = query.toLowerCase()
        return results
            .filter(t =>
                (t.subject?.toLowerCase().includes(q) || t.content.toLowerCase().includes(q))
            )
            .map(t => ({
                id: t.id,
                boardId: t.boardId,
                subject: t.subject,
                content: t.content,
                author: t.author ?? "Awanama",
                createdAt: t.createdAt!,
                isPinned: t.isPinned ?? false,
                isLocked: t.isLocked ?? false,
                isDeleted: t.isDeleted ?? false,
                isNsfw: t.isNsfw ?? false,
                isSpoiler: t.isSpoiler ?? false,
                bumpedAt: t.bumpedAt!,
                image: t.image ?? undefined,
                imageMetadata: t.imageMetadata,
                postNumber: t.postNumber!,
                posterId: generatePosterId(t.ipAddress, t.id),
            }))
    } catch (error) {
        console.error("Search error:", error)
        return []
    }
}
