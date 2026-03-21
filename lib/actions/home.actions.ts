"use server"

import { container } from "@/lib/di/container"
import { cacheTag, cacheLife } from "next/cache"

const { homeController, boardController } = container

export async function getBoardList() {
  'use cache';
  cacheLife('hours');
  cacheTag("boards");
  try {
    return await homeController.getBoardList()
  } catch (error) {
    console.error("Error fetching board list:", error)
    return []
  }
}

export async function getBoardCategories() {
  'use cache';
  cacheLife('hours');
  cacheTag("categories");
  try {
    return await boardController.getBoardCategories()
  } catch (error) {
    console.error("Error fetching board categories:", error)
    return []
  }
}

export async function getSystemStats() {
  'use cache';
  cacheLife('minutes'); // Changed to minutes to reflect previous 300s (5m)
  cacheTag("stats");
  try {
    return await homeController.getSystemStats()
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

export async function getLatestPosts(limit?: number, beforeDate?: Date) {
  try {
    return await homeController.getLatestPosts(limit, beforeDate)
  } catch (error) {
    console.error("Error fetching latest posts:", error)
    return []
  }
}

export async function getRecentImages(limit?: number) {
  try {
    return await homeController.getRecentImages(limit)
  } catch (error) {
    console.error("Error fetching recent images:", error)
    return []
  }
}


export async function getPostByNumber(postNumber: number) {
  try {
    return await homeController.getPostByNumber(postNumber)
  } catch (error) {
    console.error(`Error fetching post by number ${postNumber}:`, error)
    return null
  }
}
