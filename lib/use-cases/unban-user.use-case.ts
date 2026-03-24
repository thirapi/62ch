import type { BanRepository } from "@/lib/repositories/ban.repository"

export class UnbanUserUseCase {
    constructor(private banRepository: BanRepository) { }

    async execute(user: any, ipAddress: string): Promise<void> {
        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
            throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
        }

        if (!ipAddress) {
            throw new Error("IP Address is required")
        }

        await this.banRepository.deleteByIp(ipAddress)
    }
}
