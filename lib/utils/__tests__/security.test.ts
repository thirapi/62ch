import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { normalizeIp, ipInCidr, isCloudflareIp, resolveClientIp, FALLBACK_IP } from "../ip"
import {
  isTrustedImageUrl,
  extractCloudinaryPublicId,
  sanitizeImageMetadata,
  safeHttpUrl,
} from "../image-validation"

const h = (obj: Record<string, string>) => ({
  get: (name: string) => obj[name.toLowerCase()] ?? null,
})

describe("normalizeIp", () => {
  it("normalises IPv4 and rejects garbage", () => {
    assert.equal(normalizeIp("1.2.3.4"), "1.2.3.4")
    assert.equal(normalizeIp(" 10.0.0.1 "), "10.0.0.1")
    assert.equal(normalizeIp("256.1.1.1"), null)
    assert.equal(normalizeIp("1.2.3"), null)
    assert.equal(normalizeIp("<script>"), null)
    assert.equal(normalizeIp(""), null)
    assert.equal(normalizeIp(null), null)
  })

  it("canonicalises IPv6", () => {
    assert.equal(normalizeIp("2001:DB8:0:0:0:0:0:1"), "2001:db8::1")
    assert.equal(normalizeIp("2001:0db8:0000:0000:0001:0000:0000:0001"), "2001:db8::1:0:0:1")
    assert.equal(normalizeIp("::1"), "::1")
    assert.equal(normalizeIp("::"), "::")
    assert.equal(normalizeIp("fe80::1%eth0"), "fe80::1")
    assert.equal(normalizeIp("1:2:3:4:5:6:7:8"), "1:2:3:4:5:6:7:8")
    assert.equal(normalizeIp("1::2::3"), null)
    assert.equal(normalizeIp("1:2:3:4:5:6:7:8:9"), null)
  })

  it("collapses IPv4-mapped IPv6 to IPv4", () => {
    assert.equal(normalizeIp("::ffff:1.2.3.4"), "1.2.3.4")
    assert.equal(normalizeIp("::FFFF:102:304"), "1.2.3.4")
  })
})

describe("ipInCidr / isCloudflareIp", () => {
  it("matches CIDR ranges", () => {
    assert.ok(ipInCidr("10.1.2.3", "10.0.0.0/8"))
    assert.ok(!ipInCidr("11.0.0.1", "10.0.0.0/8"))
    assert.ok(ipInCidr("192.168.1.130", "192.168.1.128/25"))
    assert.ok(!ipInCidr("192.168.1.127", "192.168.1.128/25"))
    assert.ok(ipInCidr("2001:db8::abcd", "2001:db8::/32"))
    assert.ok(!ipInCidr("2001:db9::1", "2001:db8::/32"))
    assert.ok(!ipInCidr("1.2.3.4", "2001:db8::/32"))
  })

  it("recognises Cloudflare edges only", () => {
    assert.ok(isCloudflareIp("162.158.1.1"))
    assert.ok(isCloudflareIp("2606:4700::1111"))
    assert.ok(!isCloudflareIp("8.8.8.8"))
  })
})

describe("resolveClientIp", () => {
  it("uses the trusted X-Real-IP header", () => {
    assert.equal(resolveClientIp(h({ "x-real-ip": "203.0.113.5" }), "x-real-ip"), "203.0.113.5")
  })

  it("ignores client-forged X-Forwarded-For prefixes", () => {
    const ip = resolveClientIp(
      h({ "x-real-ip": "203.0.113.5", "x-forwarded-for": "6.6.6.6, 203.0.113.5" }),
      "x-real-ip",
    )
    assert.equal(ip, "203.0.113.5")
  })

  it("falls back to the rightmost X-Forwarded-For entry", () => {
    assert.equal(
      resolveClientIp(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }), "x-real-ip"),
      "203.0.113.9",
    )
  })

  it("ignores a spoofed CF-Connecting-IP from a non-Cloudflare peer", () => {
    const ip = resolveClientIp(
      h({ "x-real-ip": "203.0.113.5", "cf-connecting-ip": "6.6.6.6" }),
      "x-real-ip",
    )
    assert.equal(ip, "203.0.113.5")
  })

  it("honours CF-Connecting-IP when the peer is a Cloudflare edge", () => {
    const ip = resolveClientIp(
      h({ "x-real-ip": "162.158.10.10", "cf-connecting-ip": "198.51.100.7" }),
      "x-real-ip",
    )
    assert.equal(ip, "198.51.100.7")
  })

  it("rejects malformed values", () => {
    assert.equal(resolveClientIp(h({ "x-real-ip": "not-an-ip" }), "x-real-ip"), FALLBACK_IP)
    assert.equal(resolveClientIp(h({}), "x-real-ip"), FALLBACK_IP)
  })
})

describe("isTrustedImageUrl", () => {
  const cloud = "mycloud"
  it("accepts our Cloudinary delivery URLs", () => {
    assert.ok(isTrustedImageUrl("https://res.cloudinary.com/mycloud/image/upload/v1712/abc.jpg", cloud))
    assert.ok(isTrustedImageUrl("https://res.cloudinary.com/mycloud/image/upload/folder/x_y-1.webp", cloud))
  })

  it("rejects everything else", () => {
    const bad = [
      "javascript:alert(1)",
      "data:image/png;base64,AAAA",
      "http://res.cloudinary.com/mycloud/image/upload/a.jpg",
      "https://res.cloudinary.com/othercloud/image/upload/a.jpg",
      "https://evil.com/mycloud/image/upload/a.jpg",
      "https://res.cloudinary.com.evil.com/mycloud/image/upload/a.jpg",
      "https://user@res.cloudinary.com/mycloud/image/upload/a.jpg",
      "https://res.cloudinary.com/mycloud/image/upload/a.jpg?x=1",
      "https://res.cloudinary.com/mycloud/video/upload/a.mp4",
      "https://res.cloudinary.com/mycloud/image/upload/../../other/a.jpg",
      "not a url",
      "",
    ]
    for (const url of bad) assert.ok(!isTrustedImageUrl(url, cloud), url)
    assert.ok(!isTrustedImageUrl(123 as unknown, cloud))
    assert.ok(!isTrustedImageUrl("https://res.cloudinary.com/mycloud/image/upload/a.jpg", ""))
  })
})

describe("extractCloudinaryPublicId", () => {
  it("strips version and extension, keeps folders", () => {
    assert.equal(
      extractCloudinaryPublicId("https://res.cloudinary.com/c/image/upload/v1712/folder/abc.jpg"),
      "folder/abc",
    )
    assert.equal(extractCloudinaryPublicId("https://res.cloudinary.com/c/image/upload/abc.png"), "abc")
    assert.equal(extractCloudinaryPublicId("garbage"), "")
  })
})

describe("sanitizeImageMetadata", () => {
  it("keeps only known, valid fields", () => {
    const out = sanitizeImageMetadata(
      JSON.stringify({ width: 10, height: 20, format: "PNG", bytes: 100, originalName: "a.png", evil: "x" }),
    )
    assert.deepEqual(JSON.parse(out!), { width: 10, height: 20, format: "png", bytes: 100, originalName: "a.png" })
  })

  it("returns undefined for malformed input", () => {
    assert.equal(sanitizeImageMetadata("{not json"), undefined)
    assert.equal(sanitizeImageMetadata(JSON.stringify({ width: "10" })), undefined)
    assert.equal(sanitizeImageMetadata(JSON.stringify({ width: 1, height: 1, format: "<b>", bytes: 1 })), undefined)
    assert.equal(sanitizeImageMetadata(null), undefined)
  })
})

describe("safeHttpUrl", () => {
  it("only allows http(s)", () => {
    assert.equal(safeHttpUrl("https://a.com/x.jpg"), "https://a.com/x.jpg")
    assert.equal(safeHttpUrl("javascript:alert(1)"), undefined)
    assert.equal(safeHttpUrl("JaVaScRiPt:alert(1)"), undefined)
    assert.equal(safeHttpUrl("data:text/html,hi"), undefined)
    assert.equal(safeHttpUrl(null), undefined)
  })
})
