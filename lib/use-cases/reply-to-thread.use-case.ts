import type { ReplyRepository } from "@/lib/repositories/reply.repository"
import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ImageRepository } from "@/lib/repositories/image.repository"
import type { CloudinaryService } from "@/lib/services/cloudinary.service"
import type { CreateReplyCommand } from "@/lib/entities/reply.entity"
import type { BanRepository } from "@/lib/repositories/ban.repository"
import { SequenceService } from "../services/sequence.service"
import { generateTripcode } from "../utils/tripcode"
import { PasswordService } from "../services/password.service"
import type { AIModerationService } from "../services/ai-moderation.service"
import type { CreateReportUseCase } from "./create-report.use-case"


export class ReplyToThreadUseCase {
  constructor(
    private replyRepository: ReplyRepository,
    private threadRepository: ThreadRepository,
    private imageRepository: ImageRepository,
    private cloudinaryService: CloudinaryService,
    private sequenceService: SequenceService,
    private banRepository: BanRepository,
    private passwordService: PasswordService,
    private aiModerationService: AIModerationService,
    private createReportUseCase: CreateReportUseCase,
  ) { }


  async execute(input: CreateReplyCommand): Promise<{ id: number; postNumber: number }> {
    // Business rule: Check for IP ban
    if (input.ipAddress) {
      const ban = await this.banRepository.findByIp(input.ipAddress)
      if (ban) {
        throw new Error(`IP Anda sedang diblokir. Alasan: ${ban.reason || "Tidak disebutkan"}. Berakhir pada: ${ban.expiresAt ? ban.expiresAt.toLocaleString() : "Selamanya"}`)
      }

      // Business rule: Rate Limit (10 seconds)
      const lastReply = await this.replyRepository.findLatestByIp(input.ipAddress)
      if (lastReply && new Date().getTime() - lastReply.createdAt.getTime() < 10000) {
        throw new Error("Anda memposting terlalu cepat. Harap tunggu 10 detik.")
      }
    }

    // Business rule: Validate content length
    if (input.content.trim().length < 1) {
      throw new Error("Reply content cannot be empty")
    }

    if (input.content.length > 10000) {
      throw new Error("Reply content is too long (max 10000 characters)")
    }

    // Business rule: Validate thread exists and is not locked
    const thread = await this.threadRepository.findById(input.threadId)
    if (!thread) {
      throw new Error("Thread not found")
    }

    if (thread.isLocked) {
      throw new Error("Cannot reply to locked thread")
    }

    if (thread.isDeleted) {
      throw new Error("Cannot reply to deleted thread")
    }

    // Business rule: Clean author name and generate tripcode
    const rawAuthor = input.author?.trim() || "Awanama"
    const cleanedAuthor = generateTripcode(rawAuthor)

    const postNumber = await this.sequenceService.getNextPostNumber();

    let imageUrl: string | undefined = input.imageUrl
    let imageMetadata: string | undefined = input.imageMetadata

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

    // Create reply
    const reply = await this.replyRepository.create({
      threadId: input.threadId,
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

    if (imageUrl && input.imageFile) {
      try {
        await this.imageRepository.create({
          url: imageUrl,
          publicId: imageUrl.split("/").pop()?.split(".")[0] || "",
          replyId: reply.id,
        })
      } catch (error) {
        console.error("[inzm] Failed to save image metadata:", error)
      }
    }

    // Business rule: Bump thread when reply is added (if under bumplimit 450 replies)
    const replyCount = await this.replyRepository.countByThreadId(input.threadId)
    if (replyCount <= 450) {
      await this.threadRepository.updateBumpTime(input.threadId)
    }

    // AI Moderation (Async)
    // Run this in the background to not slow down the user
    this.aiModerationService.evaluateText(input.content).then(async (result) => {
      if (result.isViolation) {
        console.log(`[AIModeration] Violation detected in reply #${reply.postNumber}: ${result.reason}`);
        try {
          await this.createReportUseCase.execute({
            contentType: "reply",
            contentId: reply.id,
            reason: `[AI DETECTION] Berpotensi melanggar: ${result.reason}`,
          });
        } catch (reportError) {
          console.error("[AIModeration] Failed to create AI report for reply:", reportError);
        }
      }
    }).catch(err => {
      console.error("[AIModeration] Error in background moderation check for reply:", err);
    });

    return { id: reply.id, postNumber: reply.postNumber }

  }
}
