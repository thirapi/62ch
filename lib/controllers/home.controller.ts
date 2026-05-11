import type { GetBoardListUseCase } from "@/lib/use-cases/get-board-list.use-case"
import type { GetLatestPostsUseCase } from "@/lib/use-cases/get-latest-posts.use-case"
import type { GetRecentImagesUseCase } from "@/lib/use-cases/get-recent-images.use-case"
import type { GetPostByNumberUseCase } from "@/lib/use-cases/get-post-by-number.use-case"
import type { GetSystemStatsUseCase } from "@/lib/use-cases/get-system-stats.use-case"
import type { GetLatestAnnouncementUseCase } from "@/lib/use-cases/get-latest-announcement.use-case"

export class HomeController {
  constructor(
    private getLatestPostsUseCase: GetLatestPostsUseCase,
    private getRecentImagesUseCase: GetRecentImagesUseCase,
    private getBoardListUseCase: GetBoardListUseCase,
    private getPostByNumberUseCase: GetPostByNumberUseCase,
    private getSystemStatsUseCase: GetSystemStatsUseCase,
    private getLatestAnnouncementUseCase: GetLatestAnnouncementUseCase,
  ) { }

  async getBoardList() {
    return await this.getBoardListUseCase.execute()
  }

  async getLatestPosts(limit?: number, beforeDate?: Date) {
    // Input validation only
    const validLimit = limit && limit > 0 ? limit : 10

    // Call use case
    return await this.getLatestPostsUseCase.execute(validLimit, beforeDate)
  }

  async getRecentImages(limit?: number) {
    // Input validation only
    const validLimit = limit && limit > 0 ? limit : 12

    // Call use case
    return await this.getRecentImagesUseCase.execute(validLimit)
  }


  async getPostByNumber(postNumber: number) {
    return await this.getPostByNumberUseCase.execute(postNumber)
  }

  async getSystemStats() {
    return await this.getSystemStatsUseCase.execute()
  }

  async getLatestAnnouncement() {
    return await this.getLatestAnnouncementUseCase.execute()
  }
}
