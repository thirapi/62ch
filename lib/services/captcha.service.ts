import { randomBytes, randomInt } from "node:crypto"
import { eq, lt } from "drizzle-orm"
import { db } from "@/lib/db"
import { captchaChallenges } from "@/lib/db/schema"

const TTL_MS = 15 * 60 * 1000
const CLEANUP_PROBABILITY = 0.05
const ID_PATTERN = /^[a-f0-9]{32}$/

/**
 * Math captcha with server-side state.
 *
 * - The answer is stored only in the database; the client receives an opaque
 *   random id, so it cannot forge a "solved" challenge.
 * - Each challenge is deleted atomically on its first verification attempt
 *   (right or wrong), so it cannot be replayed or brute-forced.
 * - Every form gets its own id, so several forms on one page (reply form +
 *   quick reply) no longer invalidate each other.
 */
export class CaptchaService {
  static async generate(): Promise<{ question: string; id: string }> {
    const a = randomInt(1, 11)
    const b = randomInt(1, 11)
    const id = randomBytes(16).toString("hex")

    await db.insert(captchaChallenges).values({
      id,
      answer: String(a + b),
      expiresAt: new Date(Date.now() + TTL_MS),
    })

    if (Math.random() < CLEANUP_PROBABILITY) {
      // Best effort: purge expired challenges so the table stays small.
      db.delete(captchaChallenges)
        .where(lt(captchaChallenges.expiresAt, new Date()))
        .catch((err) => console.error("[Captcha] cleanup failed:", err))
    }

    return { question: `Berapa ${a} + ${b}?`, id }
  }

  static async verify(id: unknown, userAnswer: unknown): Promise<boolean> {
    if (typeof id !== "string" || !ID_PATTERN.test(id)) return false
    if (typeof userAnswer !== "string") return false

    // Consume the challenge regardless of whether the answer is correct.
    const [row] = await db
      .delete(captchaChallenges)
      .where(eq(captchaChallenges.id, id))
      .returning()

    if (!row) return false
    if (row.expiresAt.getTime() < Date.now()) return false

    return userAnswer.trim() === row.answer
  }
}
