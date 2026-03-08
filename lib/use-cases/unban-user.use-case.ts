import type { BanRepository } from "@/lib/repositories/ban.repository"

export class UnbanUserUseCase {
    constructor(private banRepository: BanRepository) { }

    async execute(user: any, ipAddress: string): Promise<void> {
        // Business rule: Check authorization
        if (!user || user.role !== "admin") {
            throw new Error("Unauthorized: Hanya Admin yang bisa melakukan unban user")
        }

        if (!ipAddress) {
            throw new Error("IP Address is required")
        }

        await this.banRepository.deleteByIp(ipAddress)
    }
}
