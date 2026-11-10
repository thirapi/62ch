import { db } from "@/lib/db"
import { bans } from "@/lib/db/schema"
import { eq, and, gt, or, isNull, inArray } from "drizzle-orm"
import { normalizeIp } from "@/lib/utils/ip"

/** Canonical form plus the raw value, so legacy rows stored un-normalised still match. */
function ipVariants(ip: string): string[] {
    const normalized = normalizeIp(ip)
    return normalized && normalized !== ip ? [normalized, ip] : [ip]
}

export interface BanEntity {
    id: number
    ipAddress: string
    reason: string | null
    expiresAt: Date | null
    createdAt: Date
}

export class BanRepository {
    async findByIp(ip: string): Promise<BanEntity | null> {
        const now = new Date()

        // Check if there's an active ban for this IP
        // Active means either expiresAt is null (permanent) or expiresAt > now
        const row = await db.query.bans.findFirst({
            where: and(
                inArray(bans.ipAddress, ipVariants(ip)),
                or(
                    isNull(bans.expiresAt),
                    gt(bans.expiresAt, now)
                )
            )
        })

        if (!row) return null

        return {
            id: row.id,
            ipAddress: row.ipAddress,
            reason: row.reason,
            expiresAt: row.expiresAt,
            createdAt: row.createdAt!
        }
    }

    async findActiveByIps(ips: string[]): Promise<BanEntity[]> {
        if (ips.length === 0) return []
        ips = [...new Set(ips.flatMap(ipVariants))]
        const now = new Date()
        const rows = await db.query.bans.findMany({
            where: and(
                inArray(bans.ipAddress, ips),
                or(
                    isNull(bans.expiresAt),
                    gt(bans.expiresAt, now)
                )
            )
        })

        return rows.map(row => ({
            id: row.id,
            ipAddress: row.ipAddress,
            reason: row.reason,
            expiresAt: row.expiresAt,
            createdAt: row.createdAt!
        }))
    }

    async create(input: { ipAddress: string; reason?: string; expiresAt?: Date }): Promise<void> {
        await db.insert(bans).values({
            ipAddress: normalizeIp(input.ipAddress) ?? input.ipAddress,
            reason: input.reason ?? null,
            expiresAt: input.expiresAt ?? null
        })
    }

    async deleteByIp(ip: string): Promise<void> {
        await db.delete(bans).where(inArray(bans.ipAddress, ipVariants(ip)))
    }

    async findAll(): Promise<BanEntity[]> {
        const rows = await db.query.bans.findMany({
            orderBy: (bans, { desc }) => [desc(bans.createdAt)]
        })

        return rows.map(row => ({
            id: row.id,
            ipAddress: row.ipAddress,
            reason: row.reason,
            expiresAt: row.expiresAt,
            createdAt: row.createdAt!
        }))
    }

    async update(id: number, input: { reason?: string; expiresAt?: Date | null }): Promise<void> {
        await db.update(bans).set({
            reason: input.reason,
            expiresAt: input.expiresAt
        }).where(eq(bans.id, id))
    }
}
