import type { BanRepository } from "@/lib/repositories/ban.repository"

export interface UpdateBanCommand {
    id: number
    reason?: string
    durationHours?: number | null // null for permanent
}

export class UpdateBanUseCase {
    constructor(private banRepository: BanRepository) { }

    async execute(user: any, command: UpdateBanCommand): Promise<void> {
        // Business rule: Check authorization
        if (!user || user.role !== "admin") {
            throw new Error("Unauthorized: Hanya Admin yang bisa memperbarui ban")
        }

        let expiresAt: Date | null | undefined

        if (command.durationHours === null) {
            expiresAt = null
        } else if (command.durationHours !== undefined) {
            expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + command.durationHours)
        }

        await this.banRepository.update(command.id, {
            reason: command.reason,
            expiresAt
        })
    }
}
