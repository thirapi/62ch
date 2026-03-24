import type { UserRepository } from "@/lib/repositories/user.repository"

export class DeleteJanitorUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(user: any, janitorUserId: string) {
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Pelaku bukan admin")
    }

    const janitor = await this.userRepository.findById(janitorUserId)
    if (!janitor || janitor.role !== "janitor") {
      throw new Error("Janitor not found or invalid user role")
    }

    await this.userRepository.delete(janitorUserId)
  }
}
