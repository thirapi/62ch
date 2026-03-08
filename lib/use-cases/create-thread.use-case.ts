import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { BoardRepository } from "@/lib/repositories/board.repository"
import type { ImageRepository } from "@/lib/repositories/image.repository"
import type { CloudinaryService } from "@/lib/services/cloudinary.service"
import type { BanRepository } from "@/lib/repositories/ban.repository"
import { CreateThreadCommand } from "@/lib/entities/thread.entity"
import { SequenceService } from "../services/sequence.service"
import { generateTripcode } from "../utils/tripcode"
import { hash } from "@node-rs/argon2"

export class CreateThreadUseCase {
  constructor(
    private threadRepository: ThreadRepository,
    private boardRepository: BoardRepository,
    private imageRepository: ImageRepository,
    private cloudinaryService: CloudinaryService,
    private sequenceService: SequenceService,
    private banRepository: BanRepository,
  ) { }

  async execute(input: CreateThreadCommand): Promise<number> {
    // Business rule: Check for IP ban
    if (input.ipAddress) {
      const ban = await this.banRepository.findByIp(input.ipAddress)
      if (ban) {
        throw new Error(`IP Anda sedang diblokir. Alasan: ${ban.reason || "Tidak disebutkan"}. Berakhir pada: ${ban.expiresAt ? ban.expiresAt.toLocaleString() : "Selamanya"}`)
      }

      // Business rule: Rate Limit (10 seconds)
      const lastThread = await this.threadRepository.findLatestByIp(input.ipAddress)
      if (lastThread && new Date().getTime() - lastThread.createdAt.getTime() < 10000) {
        throw new Error("Anda memposting terlalu cepat. Harap tunggu 10 detik.")
      }
    }

    // Business rule: Thread MUST have an image
    if (!input.imageFile || input.imageFile.size === 0) {
      throw new Error("Anda harus mengunggah gambar untuk membuat thread baru.")
    }

    // Business rule: Validate content length
    if (input.content.trim().length < 1) {
      throw new Error("Thread content cannot be empty")
    }

    if (input.content.length > 10000) {
      throw new Error("Thread content is too long (max 10000 characters)")
    }

    // Business rule: Validate board exists
    const board = await this.boardRepository.findById(input.boardId)
    if (!board) {
      throw new Error("Board not found")
    }

    // Business rule: Validate subject length if provided
    if (input.subject && input.subject.length > 200) {
      throw new Error("Subject is too long (max 200 characters)")
    }

    // Business rule: Clean author name and generate tripcode
    const rawAuthor = input.author?.trim() || "Awanama"
    const cleanedAuthor = generateTripcode(rawAuthor)

    const postNumber = await this.sequenceService.getNextPostNumber();

    let imageUrl: string | undefined
    let imageMetadata: string | undefined
    if (input.imageFile && input.imageFile.size > 0) {
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
      hashedPassword = await hash(input.deletionPassword)
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
      ipAddress: input.ipAddress
    })

    if (imageUrl && input.imageFile) {
      try {
        await this.imageRepository.create({
          url: imageUrl,
          publicId: imageUrl.split("/").pop()?.split(".")[0] || "",
          threadId: thread.id,
        })
      } catch (error) {
        console.error("[inzm] Failed to save image metadata:", error)
      }
    }

    return thread.id
  }
}
