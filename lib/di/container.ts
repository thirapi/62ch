// lib/di/container.ts

// Repositories
import { BoardRepository } from "@/lib/repositories/board.repository"
import { ImageRepository } from "@/lib/repositories/image.repository"
import { PostRepository } from "@/lib/repositories/post.repository"
import { ReplyRepository } from "@/lib/repositories/reply.repository"
import { ReportRepository } from "@/lib/repositories/report.repository"
import { ThreadRepository } from "@/lib/repositories/thread.repository"
import { BanRepository } from "@/lib/repositories/ban.repository"
import { BoardCategoryRepository } from "@/lib/repositories/board-category.repository"

// Services
import { CloudinaryService } from "@/lib/services/cloudinary.service"
import { ContentFilterService } from "@/lib/services/content-filter.service"
import { PasswordService } from "@/lib/services/password.service"

// Use Cases
import { CreateReportUseCase } from "@/lib/use-cases/create-report.use-case"
import { CreateThreadUseCase } from "@/lib/use-cases/create-thread.use-case"
import { BanUserUseCase } from "@/lib/use-cases/ban-user.use-case"
import { UnbanUserUseCase } from "@/lib/use-cases/unban-user.use-case"
import { MarkNsfwUseCase } from "@/lib/use-cases/mark-nsfw.use-case"
import { GetBansUseCase } from "@/lib/use-cases/get-bans.use-case"
import { UpdateBanUseCase } from "@/lib/use-cases/update-ban.use-case"
import { DismissReportUseCase } from "@/lib/use-cases/dismiss-report.use-case"
import { GetBoardListUseCase } from "@/lib/use-cases/get-board-list.use-case"
import { GetBoardByIdUseCase } from "@/lib/use-cases/get-board-by-id.use-case"
import { GetBoardByCodeUseCase } from "@/lib/use-cases/get-board-by-code.use-case"
import { GetLatestPostsUseCase } from "@/lib/use-cases/get-latest-posts.use-case"
import { GetPendingReportsUseCase } from "@/lib/use-cases/get-pending-reports.use-case"
import { GetResolvedReportsUseCase } from "@/lib/use-cases/get-resolved-reports.use-case"
import { GetPostByNumberUseCase } from "@/lib/use-cases/get-post-by-number.use-case"
import { GetRecentImagesUseCase } from "@/lib/use-cases/get-recent-images.use-case"
import { GetSystemStatsUseCase } from "@/lib/use-cases/get-system-stats.use-case"
import { GetReportsUseCase } from "@/lib/use-cases/get-reports.use-case"
import { GetThreadDetailUseCase } from "@/lib/use-cases/get-thread-detail.use-case"
import { GetThreadListUseCase } from "@/lib/use-cases/get-thread-list.use-case"
import { LockThreadUseCase } from "@/lib/use-cases/lock-thread.use-case"
import { PinThreadUseCase } from "@/lib/use-cases/pin-thread.use-case"
import { ReplyToThreadUseCase } from "@/lib/use-cases/reply-to-thread.use-case"
import { ResolveReportUseCase } from "@/lib/use-cases/resolve-report.use-case"
import { SoftDeleteReplyUseCase } from "@/lib/use-cases/soft-delete-reply.use-case"
import { SoftDeleteThreadUseCase } from "@/lib/use-cases/soft-delete-thread.use-case"
import { UnlockThreadUseCase } from "@/lib/use-cases/unlock-thread.use-case"
import { UnpinThreadUseCase } from "@/lib/use-cases/unpin-thread.use-case"
import { SeedBoardLoadTestUseCase } from "@/lib/use-cases/seed-board.use-case"
import { DeletePostWithPasswordUseCase } from "@/lib/use-cases/delete-post-with-password.use-case"
import { BulkResolveReportsUseCase } from "@/lib/use-cases/bulk-resolve-reports.use-case"
import { BulkDismissReportsUseCase } from "@/lib/use-cases/bulk-dismiss-reports.use-case"
import { CreateBoardUseCase } from "@/lib/use-cases/create-board.use-case"
import { UpdateBoardUseCase } from "@/lib/use-cases/update-board.use-case"
import { DeleteBoardUseCase } from "@/lib/use-cases/delete-board.use-case"
import { CreateBoardCategoryUseCase } from "@/lib/use-cases/create-board-category.use-case"
import { UpdateBoardCategoryUseCase } from "@/lib/use-cases/update-board-category.use-case"
import { DeleteBoardCategoryUseCase } from "@/lib/use-cases/delete-board-category.use-case"
import { GetBoardCategoriesUseCase } from "@/lib/use-cases/get-board-categories.use-case"
import { ReorderBoardCategoryUseCase } from "@/lib/use-cases/reorder-board-category.use-case"

// Controllers
import { HomeController } from "@/lib/controllers/home.controller"
import { ModerationController } from "@/lib/controllers/moderation.controller"
import { BoardController } from "@/lib/controllers/board.controller"
import { BoardCategoryController } from "@/lib/controllers/board-category.controller"
import { ReplyController } from "@/lib/controllers/reply.controller"
import { ReportController } from "@/lib/controllers/report.controller"
import { ThreadController } from "@/lib/controllers/thread.controller"
import { SeedController } from "@/lib/controllers/seed.controller"
import { SequenceService } from "../services/sequence.service"

// Instantiate Repositories
const boardRepository = new BoardRepository()
const imageRepository = new ImageRepository()
const postRepository = new PostRepository()
const replyRepository = new ReplyRepository()
const reportRepository = new ReportRepository()
const threadRepository = new ThreadRepository()
const banRepository = new BanRepository()
const categoryRepository = new BoardCategoryRepository()

// Instantiate Services
const cloudinaryService = new CloudinaryService()
const contentFilterService = new ContentFilterService()
const sequenceService = new SequenceService()
const passwordService = new PasswordService()

// Instantiate Use Cases
const createReportUseCase = new CreateReportUseCase(reportRepository)
const createThreadUseCase = new CreateThreadUseCase(
  threadRepository,
  boardRepository,
  imageRepository,
  cloudinaryService,
  sequenceService,
  banRepository,
  passwordService
)
const dismissReportUseCase = new DismissReportUseCase(reportRepository)
const getBoardListUseCase = new GetBoardListUseCase(boardRepository)
const getBoardByIdUseCase = new GetBoardByIdUseCase(boardRepository)
const getBoardByCodeUseCase = new GetBoardByCodeUseCase(boardRepository)
const getLatestPostsUseCase = new GetLatestPostsUseCase(postRepository)
const getPendingReportsUseCase = new GetPendingReportsUseCase(reportRepository, threadRepository, replyRepository, banRepository, boardRepository)
const getResolvedReportsUseCase = new GetResolvedReportsUseCase(reportRepository, threadRepository, replyRepository, banRepository, boardRepository)
const getRecentImagesUseCase = new GetRecentImagesUseCase(postRepository)
const getPostByNumberUseCase = new GetPostByNumberUseCase(postRepository)
const getSystemStatsUseCase = new GetSystemStatsUseCase(postRepository)
const getReportsUseCase = new GetReportsUseCase(reportRepository)
const getThreadDetailUseCase = new GetThreadDetailUseCase(threadRepository, replyRepository)
const getThreadListUseCase = new GetThreadListUseCase(threadRepository)
const lockThreadUseCase = new LockThreadUseCase(threadRepository)
const pinThreadUseCase = new PinThreadUseCase(threadRepository)
const replyToThreadUseCase = new ReplyToThreadUseCase(
  replyRepository,
  threadRepository,
  imageRepository,
  cloudinaryService,
  sequenceService,
  banRepository,
  passwordService
)
const resolveReportUseCase = new ResolveReportUseCase(reportRepository)
const softDeleteReplyUseCase = new SoftDeleteReplyUseCase(replyRepository)
const softDeleteThreadUseCase = new SoftDeleteThreadUseCase(threadRepository)
const unlockThreadUseCase = new UnlockThreadUseCase(threadRepository)
const unpinThreadUseCase = new UnpinThreadUseCase(threadRepository)
const banUserUseCase = new BanUserUseCase(banRepository)
const unbanUserUseCase = new UnbanUserUseCase(banRepository)
const markNsfwUseCase = new MarkNsfwUseCase(threadRepository, replyRepository)
const getBansUseCase = new GetBansUseCase(banRepository)
const updateBanUseCase = new UpdateBanUseCase(banRepository)
const deletePostWithPasswordUseCase = new DeletePostWithPasswordUseCase(threadRepository, replyRepository, passwordService)
const bulkResolveReportsUseCase = new BulkResolveReportsUseCase(reportRepository)
const bulkDismissReportsUseCase = new BulkDismissReportsUseCase(reportRepository)
const createBoardUseCase = new CreateBoardUseCase(boardRepository)
const updateBoardUseCase = new UpdateBoardUseCase(boardRepository)
const deleteBoardUseCase = new DeleteBoardUseCase(boardRepository)
const createBoardCategoryUseCase = new CreateBoardCategoryUseCase(categoryRepository)
const updateBoardCategoryUseCase = new UpdateBoardCategoryUseCase(categoryRepository)
const deleteBoardCategoryUseCase = new DeleteBoardCategoryUseCase(categoryRepository, boardRepository)
const getBoardCategoriesUseCase = new GetBoardCategoriesUseCase(categoryRepository)
const reorderBoardCategoryUseCase = new ReorderBoardCategoryUseCase(categoryRepository)

const seedBoardLoadTestUseCase = new SeedBoardLoadTestUseCase(
  threadRepository,
  replyRepository,
  sequenceService
)

// Instantiate Controllers
const homeController = new HomeController(
  getLatestPostsUseCase,
  getRecentImagesUseCase,
  getBoardListUseCase,
  getPostByNumberUseCase,
  getSystemStatsUseCase
)
const moderationController = new ModerationController(
  lockThreadUseCase,
  unlockThreadUseCase,
  pinThreadUseCase,
  unpinThreadUseCase,
  softDeleteThreadUseCase,
  softDeleteReplyUseCase,
  resolveReportUseCase,
  dismissReportUseCase,
  getPendingReportsUseCase,
  getResolvedReportsUseCase,
  banUserUseCase,
  unbanUserUseCase,
  markNsfwUseCase,
  getBansUseCase,
  updateBanUseCase,
  bulkResolveReportsUseCase,
  bulkDismissReportsUseCase,
)
const replyController = new ReplyController(replyToThreadUseCase)
const reportController = new ReportController(reportRepository, getReportsUseCase)
const threadController = new ThreadController(createThreadUseCase, getThreadListUseCase, getThreadDetailUseCase)
const boardController = new BoardController(
  createBoardUseCase,
  updateBoardUseCase,
  deleteBoardUseCase,
  getBoardListUseCase,
  getBoardByIdUseCase,
  getBoardByCodeUseCase,
  getBoardCategoriesUseCase
)
const boardCategoryController = new BoardCategoryController(
  createBoardCategoryUseCase,
  updateBoardCategoryUseCase,
  deleteBoardCategoryUseCase,
  getBoardCategoriesUseCase,
  reorderBoardCategoryUseCase
)
const seedController = new SeedController(seedBoardLoadTestUseCase)

// Export container
export const container = {
  homeController,
  moderationController,
  replyController,
  reportController,
  threadController,
  boardController,
  boardCategoryController,
  seedController,
  createReportUseCase,
  deletePostWithPasswordUseCase,
  boardRepository, // Export repository for actions
  categoryRepository,
}