import { describe, it, mock, before } from "node:test"
import assert from "node:assert/strict"
import { SubmitUserReportUseCase } from "../submit-user-report.use-case"
import { CreateReportUseCase } from "../create-report.use-case"
import { ReplyToThreadUseCase } from "../reply-to-thread.use-case"
import { REPORT_LIMIT } from "../../config/posting"

before(() => {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "mycloud"
})

function reportSetup(overrides: Partial<Record<string, any>> = {}) {
  const reportRepo = {
    create: mock.fn((input: any) => Promise.resolve({ id: 7, ...input })),
    countByReporterIpSince: mock.fn(() => Promise.resolve(0)),
    hasPendingFromReporter: mock.fn(() => Promise.resolve(false)),
    ...overrides.reportRepo,
  }
  const banRepo = { findByIp: mock.fn(() => Promise.resolve(null)), ...overrides.banRepo }
  const threadRepo = {
    findById: mock.fn(() => Promise.resolve({ id: 1, isDeleted: false })),
    ...overrides.threadRepo,
  }
  const replyRepo = {
    findById: mock.fn(() => Promise.resolve({ id: 2, isDeleted: false })),
    ...overrides.replyRepo,
  }
  const uc = new SubmitUserReportUseCase(
    reportRepo as any,
    banRepo as any,
    threadRepo as any,
    replyRepo as any,
    new CreateReportUseCase(reportRepo as any),
  )
  return { uc, reportRepo }
}

const validReport = { contentType: "thread" as const, contentId: 1, reason: "spam", reporterIp: "1.2.3.4" }

describe("SubmitUserReportUseCase", () => {
  it("stores the reporter IP on success", async () => {
    const { uc, reportRepo } = reportSetup()
    assert.equal(await uc.execute(validReport), 7)
    assert.equal(reportRepo.create.mock.calls[0].arguments[0].reporterIp, "1.2.3.4")
  })

  it("rejects banned reporters", async () => {
    const { uc } = reportSetup({ banRepo: { findByIp: mock.fn(() => Promise.resolve({ id: 1 })) } })
    await assert.rejects(uc.execute(validReport), /diblokir/)
  })

  it("rejects reports beyond the rate limit", async () => {
    const { uc } = reportSetup({
      reportRepo: { countByReporterIpSince: mock.fn(() => Promise.resolve(REPORT_LIMIT)) },
    })
    await assert.rejects(uc.execute(validReport), /Terlalu banyak/)
  })

  it("rejects duplicate pending reports", async () => {
    const { uc } = reportSetup({
      reportRepo: { hasPendingFromReporter: mock.fn(() => Promise.resolve(true)) },
    })
    await assert.rejects(uc.execute(validReport), /sudah melaporkan/)
  })

  it("rejects missing, deleted or invalid targets", async () => {
    const { uc } = reportSetup({ replyRepo: { findById: mock.fn(() => Promise.resolve(null)) } })
    await assert.rejects(uc.execute({ ...validReport, contentType: "reply" }), /tidak ditemukan/)

    const deleted = reportSetup({
      threadRepo: { findById: mock.fn(() => Promise.resolve({ id: 1, isDeleted: true })) },
    })
    await assert.rejects(deleted.uc.execute(validReport), /tidak ditemukan/)

    await assert.rejects(uc.execute({ ...validReport, contentId: -1 }), /tidak ditemukan/)
    await assert.rejects(uc.execute({ ...validReport, contentType: "board" as any }), /tidak valid/)
  })

  it("rejects empty or overlong reasons", async () => {
    const { uc } = reportSetup()
    await assert.rejects(uc.execute({ ...validReport, reason: "   " }), /harus diisi/)
    await assert.rejects(uc.execute({ ...validReport, reason: "x".repeat(501) }), /terlalu panjang/)
  })
})

function replySetup(threadOverrides: Record<string, unknown> = {}) {
  const replyRepo = {
    create: mock.fn(() => Promise.resolve({ id: 1, postNumber: 100 })),
    countByThreadId: mock.fn(() => Promise.resolve(1)),
    findLatestByIp: mock.fn(() => Promise.resolve(null)),
  }
  const imageRepo = { create: mock.fn(() => Promise.resolve({})) }
  const uc = new ReplyToThreadUseCase(
    replyRepo as any,
    {
      findById: mock.fn(() =>
        Promise.resolve({ id: 1, isLocked: false, isDeleted: false, isArchived: false, boardId: 1, ...threadOverrides }),
      ),
      updateBumpTime: mock.fn(() => Promise.resolve()),
    } as any,
    imageRepo as any,
    { uploadImage: mock.fn() } as any,
    { getNextPostNumber: () => Promise.resolve(100) } as any,
    { findByIp: mock.fn(() => Promise.resolve(null)) } as any,
    { hash: () => Promise.resolve("hashed") } as any,
    { evaluateText: mock.fn(() => Promise.resolve({ isViolation: false })) } as any,
    { execute: mock.fn() } as any,
  )
  return { uc, replyRepo, imageRepo }
}

describe("ReplyToThreadUseCase security rules", () => {
  const base = { threadId: 1, content: "halo", ipAddress: "1.2.3.4" }

  it("rejects image URLs outside our Cloudinary account", async () => {
    const { uc, replyRepo } = replySetup()
    for (const imageUrl of ["javascript:alert(1)", "https://evil.com/a.jpg", "https://res.cloudinary.com/other/image/upload/a.jpg"]) {
      await assert.rejects(uc.execute({ ...base, imageUrl } as any), /URL gambar tidak valid/)
    }
    assert.equal(replyRepo.create.mock.callCount(), 0)
  })

  it("accepts our Cloudinary URL, sanitises metadata and records the image", async () => {
    const { uc, replyRepo, imageRepo } = replySetup()
    const imageUrl = "https://res.cloudinary.com/mycloud/image/upload/v1/folder/pic.jpg"
    await uc.execute({
      ...base,
      imageUrl,
      imageMetadata: JSON.stringify({ width: 1, height: 1, format: "jpg", bytes: 1, originalName: "p.jpg", x: "<b>" }),
    } as any)
    const created = (replyRepo.create.mock.calls[0].arguments as any[])[0]
    assert.equal(created.image, imageUrl)
    assert.deepEqual(Object.keys(JSON.parse(created.imageMetadata)).sort(), ["bytes", "format", "height", "originalName", "width"])
    assert.equal((imageRepo.create.mock.calls[0].arguments as any[])[0].publicId, "folder/pic")
  })

  it("rejects replies to archived threads", async () => {
    const { uc } = replySetup({ isArchived: true })
    await assert.rejects(uc.execute(base as any), /diarsipkan/)
  })

  it("enforces the shared max length", async () => {
    const { uc } = replySetup()
    await assert.rejects(uc.execute({ ...base, content: "x".repeat(2001) } as any), /terlalu panjang/)
  })
})
