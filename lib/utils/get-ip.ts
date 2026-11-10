import { headers } from "next/headers"
import { resolveClientIp } from "./ip"

/**
 * Returns the caller's IP address for bans / rate limiting.
 * See resolveClientIp for the trust model.
 */
export async function getClientIp(): Promise<string> {
  return resolveClientIp(await headers())
}
