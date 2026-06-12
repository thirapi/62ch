import { createHmac } from "crypto"

export class CaptchaService {
    private static SECRET = process.env.CAPTCHA_SECRET || "62chan_secret_default_change_this"

    static async generate(): Promise<{ question: string; token: string }> {
        const a = Math.floor(Math.random() * 10) + 1
        const b = Math.floor(Math.random() * 10) + 1
        const answer = (a + b).toString()
        const question = `Berapa ${a} + ${b}?`
        const expiresAt = Date.now() + 1000 * 60 * 15 // 15 minutes

        const payload = `${answer}:${expiresAt}`
        const signature = createHmac("sha256", this.SECRET).update(payload).digest("hex")
        const token = Buffer.from(`${payload}:${signature}`).toString("base64")

        return { question, token }
    }

    static async verify(userAnswer: string, token: string): Promise<boolean> {
        if (!token) return false

        try {
            const decoded = Buffer.from(token, "base64").toString("utf-8")
            const [answer, expiresAt, signature] = decoded.split(":")

            if (!answer || !expiresAt || !signature) return false

            // Check expiry
            if (Date.now() > Number.parseInt(expiresAt)) return false

            // Verify signature
            const payload = `${answer}:${expiresAt}`
            const expectedSignature = createHmac("sha256", this.SECRET).update(payload).digest("hex")

            return userAnswer === answer && signature === expectedSignature
        } catch (e) {
            return false
        }
    }
}
