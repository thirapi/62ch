import { z } from "zod"

const CLOUDINARY_HOST = "res.cloudinary.com"

function cloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
}

/**
 * True only for HTTPS image URLs served from *our* Cloudinary account,
 * e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/abc.jpg
 */
export function isTrustedImageUrl(raw: unknown, cloud: string = cloudName()): raw is string {
  if (typeof raw !== "string" || raw.length > 2048 || !cloud) return false

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }

  return (
    url.protocol === "https:" &&
    url.hostname === CLOUDINARY_HOST &&
    url.port === "" &&
    url.username === "" &&
    url.password === "" &&
    url.search === "" &&
    url.hash === "" &&
    url.pathname.startsWith(`/${cloud}/image/upload/`) &&
    // Cloudinary public ids are URL-safe; reject anything odd.
    /^[A-Za-z0-9/_.,\-]+$/.test(url.pathname)
  )
}

/**
 * Extracts the Cloudinary public id (folders included, version and extension
 * stripped) from a delivery URL. Returns "" when it cannot be determined.
 */
export function extractCloudinaryPublicId(raw: string): string {
  try {
    const { pathname } = new URL(raw)
    const marker = "/image/upload/"
    const idx = pathname.indexOf(marker)
    if (idx === -1) return ""
    let rest = pathname.slice(idx + marker.length)
    rest = rest.replace(/^v\d+\//, "")
    return rest.replace(/\.[A-Za-z0-9]+$/, "")
  } catch {
    return ""
  }
}

const imageMetadataSchema = z.object({
  width: z.number().int().positive().max(100_000),
  height: z.number().int().positive().max(100_000),
  format: z.string().regex(/^[a-z0-9]{1,10}$/i),
  bytes: z.number().int().nonnegative().max(1024 * 1024 * 1024),
  originalName: z.string().max(255).optional().default("image"),
})

/**
 * Validates client-supplied image metadata and re-serialises only the known
 * fields. Returns undefined when it is missing or malformed (metadata is
 * cosmetic, so a bad value should not block the post).
 */
export function sanitizeImageMetadata(raw: unknown): string | undefined {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2000) return undefined
  try {
    const parsed = imageMetadataSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return undefined
    const m = parsed.data
    return JSON.stringify({
      width: m.width,
      height: m.height,
      format: m.format.toLowerCase(),
      bytes: m.bytes,
      originalName: m.originalName.trim() || "image",
    })
  } catch {
    return undefined
  }
}

/**
 * Returns the URL only if it is a plain http(s) link. Use before putting
 * stored, user-influenced URLs into href attributes (blocks javascript:,
 * data:, etc.).
 */
export function safeHttpUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined
  } catch {
    return undefined
  }
}
