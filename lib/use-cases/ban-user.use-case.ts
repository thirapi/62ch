import type { BanRepository } from "@/lib/repositories/ban.repository"

export interface BanUserCommand {
    ipAddress: string
    reason?: string
    durationHours?: number // null for permanent
}

export class BanUserUseCase {
    constructor(private banRepository: BanRepository) { }

    async execute(user: any, command: BanUserCommand): Promise<void> {
        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
            throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
        }

        if (!command.ipAddress) {
            throw new Error("IP Address is required")
        }

        let expiresAt: Date | undefined
        if (command.durationHours) {
            expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + command.durationHours)
        }

        await this.banRepository.create({
            ipAddress: command.ipAddress,
            reason: command.reason,
            expiresAt
        })
    }
}
