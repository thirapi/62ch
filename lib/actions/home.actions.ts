"use server"

import { cacheLife, cacheTag } from "next/cache"

// Kita instansiasi di dalam atau gunakan import murni untuk memastikan serializability
// Next.js 'use cache' sangat sensitif terhadap closure variabel non-serializable

export async function getBoardList() {
  'use cache'
  cacheLife({
    stale: 300,
    revalidate: 600,
    expire: 3600,
  })
  cacheTag('boards')

  try {
    const { container } = await import("@/lib/di/container")
    return await container.homeController.getBoardList()
  } catch (error) {
    console.error("Error fetching board list:", error)
    return []
  }
}

export async function getBoardCategories() {
  'use cache'
  cacheLife({
    stale: 600,
    revalidate: 1200,
    expire: 7200,
  })
  cacheTag('categories')

  try {
    const { container } = await import("@/lib/di/container")
    return await container.boardCategoryController.getCategories()
  } catch (error) {
    console.error("Error fetching board categories:", error)
    return []
  }
}

export async function getLatestPosts(limit = 10, beforeDate?: Date) {
  try {
    const { container } = await import("@/lib/di/container")
    return await container.homeController.getLatestPosts(limit, beforeDate)
  } catch (error) {
    console.error("Error fetching latest posts:", error)
    return []
  }
}

export async function getRecentImages(limit = 12) {
  try {
    const { container } = await import("@/lib/di/container")
    return await container.homeController.getRecentImages(limit)
  } catch (error) {
    console.error("Error fetching recent images:", error)
    return []
  }
}

export async function getPostByNumber(postNumber: number) {
  try {
    const { container } = await import("@/lib/di/container")
    return await container.homeController.getPostByNumber(postNumber)
  } catch (error) {
    console.error(`Error fetching post by number ${postNumber}:`, error)
    return null
  }
}

export async function getSystemStats() {
  try {
    const { container } = await import("@/lib/di/container")
    return await container.homeController.getSystemStats()
  } catch (error) {
    console.error("Error fetching system stats:", error)
    return {
      totalPosts: 0,
      postsToday: 0,
      totalImages: 0,
      activeThreads24h: 0
    }
  }
}

export async function getLatestAnnouncement() {
  try {
    const { container } = await import("@/lib/di/container")
    return await container.homeController.getLatestAnnouncement()
  } catch (error) {
    console.error("Error fetching announcement:", error)
    return null
  }
}
