import type { UserRepository } from "@/lib/repositories/user.repository"
import type { PasswordService } from "@/lib/services/password.service"

export class CreateJanitorUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService
  ) { }

  async execute(user: any, data: { email: string; password?: string }) {
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Pelaku bukan admin")
    }

    const existingUser = await this.userRepository.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Default password if not provided
    const password = data.password || "janitor123"
    const hashedPassword = await this.passwordService.hash(password)

    return await this.userRepository.create({
      email: data.email,
      hashedPassword,
      role: "janitor",
    })
  }
}
