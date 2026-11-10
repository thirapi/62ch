/**
 * Pure IP helpers (no Next.js imports) so they can be unit-tested.
 */

// Published Cloudflare edge ranges: https://www.cloudflare.com/ips/
const CLOUDFLARE_RANGES = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
]

/** Parses an IPv4 or IPv6 address into bytes. Returns null when invalid. */
export function parseIp(input: string): Uint8Array | null {
  const ip = input.trim()
  if (ip.includes(":")) return parseIpv6(ip)
  return parseIpv4(ip)
}

function parseIpv4(ip: string): Uint8Array | null {
  const parts = ip.split(".")
  if (parts.length !== 4) return null
  const bytes = new Uint8Array(4)
  for (let i = 0; i < 4; i++) {
    if (!/^\d{1,3}$/.test(parts[i])) return null
    const n = Number(parts[i])
    if (n > 255) return null
    bytes[i] = n
  }
  return bytes
}

function parseIpv6(input: string): Uint8Array | null {
  let ip = input
  // Strip zone id (fe80::1%eth0)
  const zone = ip.indexOf("%")
  if (zone !== -1) ip = ip.slice(0, zone)

  // Embedded IPv4 tail (::ffff:1.2.3.4) -> rewrite as two hex groups
  const lastColon = ip.lastIndexOf(":")
  if (ip.slice(lastColon + 1).includes(".")) {
    const v4 = parseIpv4(ip.slice(lastColon + 1))
    if (!v4) return null
    const g1 = ((v4[0] << 8) | v4[1]).toString(16)
    const g2 = ((v4[2] << 8) | v4[3]).toString(16)
    ip = `${ip.slice(0, lastColon + 1)}${g1}:${g2}`
  }

  const halves = ip.split("::")
  if (halves.length > 2) return null

  const parseGroups = (s: string): number[] | null => {
    if (s === "") return []
    const out: number[] = []
    for (const g of s.split(":")) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null
      out.push(parseInt(g, 16))
    }
    return out
  }

  const head = parseGroups(halves[0])
  const rest = halves.length === 2 ? parseGroups(halves[1]) : []
  if (!head || !rest) return null

  const total = head.length + rest.length
  let groups: number[]
  if (halves.length === 2) {
    if (total > 7) return null
    groups = [...head, ...new Array(8 - total).fill(0), ...rest]
  } else {
    if (total !== 8) return null
    groups = head
  }

  const bytes = new Uint8Array(16)
  groups.forEach((g, i) => {
    bytes[i * 2] = g >> 8
    bytes[i * 2 + 1] = g & 0xff
  })
  return bytes
}

function isIpv4MappedIpv6(bytes: Uint8Array): boolean {
  if (bytes.length !== 16) return false
  for (let i = 0; i < 10; i++) if (bytes[i] !== 0) return false
  return bytes[10] === 0xff && bytes[11] === 0xff
}

/**
 * Canonical textual form: IPv4 dotted quad, IPv4-mapped IPv6 collapsed to
 * IPv4, IPv6 lowercased and compressed. Returns null when invalid.
 */
export function normalizeIp(input: string | null | undefined): string | null {
  if (!input) return null
  const bytes = parseIp(input)
  if (!bytes) return null

  if (bytes.length === 4) return Array.from(bytes).join(".")
  if (isIpv4MappedIpv6(bytes)) return Array.from(bytes.slice(12)).join(".")

  const groups: number[] = []
  for (let i = 0; i < 16; i += 2) groups.push((bytes[i] << 8) | bytes[i + 1])

  // Find the longest run of zero groups (length >= 2) to compress
  let bestStart = -1
  let bestLen = 0
  for (let i = 0; i < 8; ) {
    if (groups[i] !== 0) {
      i++
      continue
    }
    let j = i
    while (j < 8 && groups[j] === 0) j++
    if (j - i > bestLen && j - i >= 2) {
      bestStart = i
      bestLen = j - i
    }
    i = j
  }

  const hex = groups.map((g) => g.toString(16))
  if (bestStart === -1) return hex.join(":")
  const left = hex.slice(0, bestStart).join(":")
  const right = hex.slice(bestStart + bestLen).join(":")
  return `${left}::${right}`
}

export function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/")
  let a = parseIp(ip)
  const b = parseIp(range)
  const bits = Number(bitsStr)
  if (!a || !b || !Number.isInteger(bits)) return false
  if (a.length === 16 && b.length === 4 && isIpv4MappedIpv6(a)) a = a.slice(12)
  if (a.length !== b.length || bits < 0 || bits > a.length * 8) return false

  const fullBytes = Math.floor(bits / 8)
  for (let i = 0; i < fullBytes; i++) if (a[i] !== b[i]) return false
  const remBits = bits % 8
  if (remBits === 0) return true
  const mask = (0xff << (8 - remBits)) & 0xff
  return (a[fullBytes] & mask) === (b[fullBytes] & mask)
}

export function isCloudflareIp(ip: string): boolean {
  return CLOUDFLARE_RANGES.some((cidr) => ipInCidr(ip, cidr))
}

type HeaderGetter = { get(name: string): string | null }

export const FALLBACK_IP = "127.0.0.1"

/**
 * Resolves the real client IP from request headers without trusting
 * anything the client can forge.
 *
 * 1. The "peer" is the address our own edge proxy observed. On Railway the
 *    edge overwrites `X-Real-IP` on every request, so that is the default.
 *    Override with CLIENT_IP_HEADER if deployed elsewhere.
 *    If that header is missing we fall back to the *rightmost* X-Forwarded-For
 *    entry (the one appended by the closest proxy), never the leftmost one,
 *    which the client controls.
 * 2. `CF-Connecting-IP` is honoured only when the peer is a genuine
 *    Cloudflare edge address, so it cannot be spoofed by direct requests.
 */
export function resolveClientIp(
  headers: HeaderGetter,
  trustedHeader: string = process.env.CLIENT_IP_HEADER || "x-real-ip",
): string {
  let peer = normalizeIp(headers.get(trustedHeader.toLowerCase()))

  if (!peer) {
    const xff = headers.get("x-forwarded-for")
    if (xff) {
      const entries = xff.split(",").map((s) => s.trim()).filter(Boolean)
      peer = normalizeIp(entries[entries.length - 1])
    }
  }

  if (!peer) return FALLBACK_IP

  if (isCloudflareIp(peer)) {
    const cf = normalizeIp(headers.get("cf-connecting-ip"))
    if (cf) return cf
  }

  return peer
}
