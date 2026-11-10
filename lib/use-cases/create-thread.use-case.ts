import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { BoardRepository } from "@/lib/repositories/board.repository"
import type { ImageRepository } from "@/lib/repositories/image.repository"
import type { CloudinaryService } from "@/lib/services/cloudinary.service"
import type { BanRepository } from "@/lib/repositories/ban.repository"
import { CreateThreadCommand } from "@/lib/entities/thread.entity"
import { SequenceService } from "../services/sequence.service"
import { generateTripcode } from "../utils/tripcode"
import { PasswordService } from "../services/password.service"
import { MAX_POST_LENGTH, MAX_SUBJECT_LENGTH, POST_COOLDOWN_MS } from "../config/posting"
import { extractCloudinaryPublicId, isTrustedImageUrl, sanitizeImageMetadata } from "../utils/image-validation"
import type { AIModerationService } from "../services/ai-moderation.service"
import type { CreateReportUseCase } from "./create-report.use-case"


export class CreateThreadUseCase {
  constructor(
    private threadRepository: ThreadRepository,
    private boardRepository: BoardRepository,
    private imageRepository: ImageRepository,
    private cloudinaryService: CloudinaryService,
    private sequenceService: SequenceService,
    private banRepository: BanRepository,
    private passwordService: PasswordService,
    private aiModerationService: AIModerationService,
    private createReportUseCase: CreateReportUseCase,
  ) { }


  async execute(input: CreateThreadCommand): Promise<{ id: number; postNumber: number }> {
    // Business rule: Check for IP ban
    if (input.ipAddress) {
      const ban = await this.banRepository.findByIp(input.ipAddress)
      if (ban) {
        throw new Error(`IP Anda sedang diblokir. Alasan: ${ban.reason || "Tidak disebutkan"}. Berakhir pada: ${ban.expiresAt ? ban.expiresAt.toLocaleString() : "Selamanya"}`)
      }

      // Business rule: Rate Limit (10 seconds)
      const lastThread = await this.threadRepository.findLatestByIp(input.ipAddress)
      if (lastThread && new Date().getTime() - lastThread.createdAt.getTime() < POST_COOLDOWN_MS) {
        throw new Error(`Anda memposting terlalu cepat. Harap tunggu ${POST_COOLDOWN_MS / 1000} detik.`)
      }
    }

    // Business rule: Thread MUST have an image
    if (!input.imageUrl && (!input.imageFile || input.imageFile.size === 0)) {
      throw new Error("Anda harus mengunggah gambar untuk membuat thread baru.")
    }

    // Business rule: Validate content length
    if (input.content.trim().length < 1) {
      throw new Error("Thread content cannot be empty")
    }

    if (input.content.length > MAX_POST_LENGTH) {
      throw new Error(`Pesan terlalu panjang (maksimum ${MAX_POST_LENGTH} karakter).`)
    }

    // Business rule: Only accept images hosted on our own Cloudinary account.
    // The URL comes from the client (direct upload), so it must be verified.
    if (input.imageUrl && !isTrustedImageUrl(input.imageUrl)) {
      throw new Error("URL gambar tidak valid.")
    }

    // Business rule: Validate board exists
    const board = await this.boardRepository.findById(input.boardId)
    if (!board) {
      throw new Error("Board not found")
    }

    // Business rule: Validate subject length if provided
    if (input.subject && input.subject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(`Subjek terlalu panjang (maksimum ${MAX_SUBJECT_LENGTH} karakter).`)
    }

    // Business rule: Clean author name and generate tripcode
    const rawAuthor = input.author?.trim() || "Awanama"
    const cleanedAuthor = generateTripcode(rawAuthor)

    const postNumber = await this.sequenceService.getNextPostNumber();

    let imageUrl: string | undefined = input.imageUrl
    let imageMetadata: string | undefined = input.imageUrl ? sanitizeImageMetadata(input.imageMetadata) : undefined
    if (!imageUrl && input.imageFile && input.imageFile.size > 0) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(input.imageFile)
        imageUrl = uploadResult.url
        imageMetadata = JSON.stringify({
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          originalName: input.imageFile.name
        })

        console.log("[inzm] Image uploaded successfully:", uploadResult.url)
      } catch (error) {
        console.error("[inzm] Image upload failed:", error)
        throw new Error(`Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    // Hash deletion password if provided
    let hashedPassword: string | null = null
    if (input.deletionPassword) {
      hashedPassword = await this.passwordService.hash(input.deletionPassword)
    }

    // Create thread
    const thread = await this.threadRepository.create({
      boardId: input.boardId,
      subject: input.subject,
      content: input.content,
      author: cleanedAuthor,
      image: imageUrl,
      imageMetadata: imageMetadata,
      deletionPassword: hashedPassword,
      isNsfw: input.isNsfw ?? false,
      isSpoiler: input.isSpoiler ?? false,
      postNumber: postNumber,
      ipAddress: input.ipAddress,
      capcode: input.capcode
    })

    // Business rule: Board thread limit (128 threads)
    // If more than 128, find and delete the oldest non-pinned thread
    const boardThreadCount = await this.threadRepository.countByBoardId(input.boardId)
    if (boardThreadCount > 128) {
      const excess = boardThreadCount - 128
      const oldestThreads = await this.threadRepository.findOldestNonPinnedByBoardId(input.boardId, excess)
      
      for (const t of oldestThreads) {
        await this.threadRepository.archive(t.id)
      }
    }

    if (imageUrl) {
      try {
        await this.imageRepository.create({
          url: imageUrl,
          publicId: extractCloudinaryPublicId(imageUrl),
          threadId: thread.id,
        })
      } catch (error) {
        console.error("[inzm] Failed to save image metadata:", error)
      }
    }

    // AI Moderation (Async)
    // Run this in the background to not slow down the user
    this.aiModerationService.evaluateText(input.content).then(async (result) => {
      if (result.isViolation) {
        console.log(`[AIModeration] Violation detected in thread #${thread.postNumber}: ${result.reason}`);
        try {
          await this.createReportUseCase.execute({
            contentType: "thread",
            contentId: thread.id,
            reason: `[AI DETECTION] Berpotensi melanggar: ${result.reason}`,
          });
        } catch (reportError) {
          console.error("[AIModeration] Failed to create AI report for thread:", reportError);
        }
      }
    }).catch(err => {
      console.error("[AIModeration] Error in background moderation check for thread:", err);
    });

    return { id: thread.id, postNumber: thread.postNumber }

  }
}
