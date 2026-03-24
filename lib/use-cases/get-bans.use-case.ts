import type { BanRepository, BanEntity } from "@/lib/repositories/ban.repository"

export class GetBansUseCase {
    constructor(private banRepository: BanRepository) { }

    async execute(user: any): Promise<BanEntity[]> {
        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
            throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
        }
        return await this.banRepository.findAll()
    }
}
