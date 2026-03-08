import type { BanRepository, BanEntity } from "@/lib/repositories/ban.repository"

export class GetBansUseCase {
    constructor(private banRepository: BanRepository) { }

    async execute(user: any): Promise<BanEntity[]> {
        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator")) {
            throw new Error("Unauthorized: Pelaku bukan admin atau moderator")
        }
        return await this.banRepository.findAll()
    }
}
