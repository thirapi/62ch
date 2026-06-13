import { cookies } from "next/headers"

export class CaptchaService {
    private static COOKIE_NAME = "captcha_answer"

    static async generate(): Promise<{ question: string; id: string }> {
        const a = Math.floor(Math.random() * 10) + 1
        const b = Math.floor(Math.random() * 10) + 1
        const answer = (a + b).toString()
        const question = `Berapa ${a} + ${b}?`

        // In a real app, we'd encrypt this or use a more secure token
        // For now, let's just store it in a cookie (not secure for real prod, but fine for demo)
        // To make it slightly better, let's hash it or just keep it as is for this case.
        const cookieStore = await cookies()
        cookieStore.set(this.COOKIE_NAME, answer, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 900 // 15 minutes
        })

        return { question, id: "math" }
    }

    static async verify(userAnswer: string): Promise<boolean> {
        const cookieStore = await cookies()
        const correctAnswer = cookieStore.get(this.COOKIE_NAME)?.value

        if (!correctAnswer) return false

        // Clear cookie after verification
        cookieStore.delete(this.COOKIE_NAME)

        return userAnswer === correctAnswer
    }
}
