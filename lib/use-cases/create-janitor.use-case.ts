import type { UserRepository } from "@/lib/repositories/user.repository"
import type { PasswordService } from "@/lib/services/password.service"

export class CreateJanitorUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService
  ) { }

  async execute(user: any, data: { email: string; password?: string; role?: "admin" | "moderator" | "janitor" }) {
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Pelaku bukan admin")
    }

    const targetRole = data.role || "janitor"
    if (targetRole !== "moderator" && targetRole !== "janitor") {
      throw new Error("Invalid role: Hanya moderator atau janitor yang dapat dibuat")
    }

    const existingUser = await this.userRepository.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Default password if not provided
    const password = data.password || "staff123"
    const hashedPassword = await this.passwordService.hash(password)

    return await this.userRepository.create({
      email: data.email,
      hashedPassword,
      role: targetRole,
    })
  }
}
