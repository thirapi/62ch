import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ReplyRepository } from "@/lib/repositories/reply.repository"
import { verify } from "@node-rs/argon2"

export class DeletePostWithPasswordUseCase {
    constructor(
        private threadRepository: ThreadRepository,
        private replyRepository: ReplyRepository
    ) { }

    async execute(postId: number, postType: "thread" | "reply", password?: string): Promise<void> {
        if (!password) {
            throw new Error("Sandi penghapusan diperlukan")
        }

        if (postType === "thread") {
            const thread = await this.threadRepository.findById(postId)
            if (!thread) {
                throw new Error("Thread tidak ditemukan")
            }

            if (!thread.deletionPassword) {
                throw new Error("Sandi penghapusan tidak diatur untuk thread ini")
            }

            // Verify password (argon2 or plain text for legacy)
            const isValid = await this.verifyPassword(password, thread.deletionPassword)
            if (!isValid) {
                throw new Error("Sandi penghapusan salah")
            }

            await this.threadRepository.softDelete(postId)
        } else {
            const reply = await this.replyRepository.findById(postId)
            if (!reply) {
                throw new Error("Balasan tidak ditemukan")
            }

            if (!reply.deletionPassword) {
                throw new Error("Sandi penghapusan tidak diatur untuk balasan ini")
            }

            const isValid = await this.verifyPassword(password, reply.deletionPassword)
            if (!isValid) {
                throw new Error("Sandi penghapusan salah")
            }

            await this.replyRepository.softDelete(postId)
        }
    }

    private async verifyPassword(input: string, stored: string): Promise<boolean> {
        // Check if it's an argon2 hash (usually starts with $argon2)
        if (stored.startsWith("$argon2")) {
            try {
                return await verify(stored, input)
            } catch (e) {
                return false
            }
        }
        // Fallback for plain text (legacy)
        return input === stored
    }
}
