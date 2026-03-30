import type { MetadataRoute } from "next";
import { BoardRepository } from "@/lib/repositories/board.repository";
import { ThreadRepository } from "@/lib/repositories/thread.repository";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Force HTTPS as per user request
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://62chan.qzz.io").replace(/\/$/, "");

    // 1. Homepage & Static Pages
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/rules`,
            lastModified: new Date(),
        },
    ];

    try {
        // 2. All Boards
        const boardRepository = new BoardRepository();
        const boards = await boardRepository.findAll();

        const boardRoutes = boards.map((board) => ({
            url: `${baseUrl}/${board.code}`,
            lastModified: new Date(),
        }));

        // 3. Latest Threads
        const threadRepository = new ThreadRepository();
        const latestThreads = await threadRepository.findLatest(50);

        const threadRoutes = latestThreads.map((thread) => {
            const board = boards.find((b) => b.id === thread.boardId);
            if (!board) return null;

            return {
                url: `${baseUrl}/${board.code}/thread/${thread.id}`,
                lastModified: thread.bumpedAt || thread.createdAt,
            };
        }).filter((route) => route !== null);

        return [...routes, ...boardRoutes, ...threadRoutes] as MetadataRoute.Sitemap;
    } catch (error) {
        console.error("Sitemap generation error:", error);
        return routes as MetadataRoute.Sitemap;
    }
}
