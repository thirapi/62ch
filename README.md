<p align="center">
  <img src="public/logo-62chan.png" alt="62chan" width="300">
</p>

<p align="center">
  <b>Papan gambar (imageboard) anonim Indonesia</b><br>
  <a href="https://62chan.qzz.io">62chan.qzz.io</a>
</p>

---

62chan adalah forum anonim bergaya imageboard klasik: tanpa akun, diskusi per board, thread naik ke atas setiap ada balasan (bump), dan thread lama tergeser otomatis. Tampilannya semi-modern, dengan rasa chan klasik dan kenyamanan web modern.

## Fitur

**Posting**
- Thread dan balasan anonim, opsional pakai nama atau tripcode
- ID poster per thread, penanda `(Anda)` untuk post sendiri, dan capcode untuk staf
- Greentext (`>teks`), kutipan (`>>123`) dengan pratinjau saat hover, dan backlink "Balasan:"
- Unggah gambar lewat Cloudinary (seret, klik, atau tempel), dengan tanda NSFW atau spoiler
- Draf tersimpan otomatis, captcha, dan hapus post dengan sandi

**Membaca**
- Tampilan list (15 thread per halaman) dan katalog (seluruh board)
- Urutkan berdasarkan aktif atau baru, dan cari judul atau isi OP
- Auto-update thread, pantau thread (thread watcher), dan sembunyikan thread atau balasan
- Postingan dan gambar terbaru di homepage, dengan link langsung ke post-nya

**Moderasi**
- Panel mod: laporan, blokir IP, riwayat tindakan, kelola board, kategori, dan staf
- Moderasi AI opsional (Gemini) untuk menyaring konten
- Batas 128 thread per board: thread tertua yang tidak di-pin otomatis tergeser dan menjadi read-only

## Teknologi

| Bagian | Yang dipakai |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components), React 19, TypeScript |
| Tampilan | Tailwind CSS v4, komponen [shadcn/ui](https://ui.shadcn.com) |
| Database | PostgreSQL ([Supabase](https://supabase.com)) dengan [Drizzle ORM](https://orm.drizzle.team) |
| Autentikasi staf | Lucia |
| Gambar | Cloudinary |
| Hosting | Vercel, region `sin1` (Singapura, satu region dengan database) |
| Pemantauan | Sentry (server), PostHog, Vercel Analytics dan Speed Insights |

Kode mengikuti Clean Architecture (entity → repository → use case → controller → action). Detailnya ada di [ARCHITECTURE.md](ARCHITECTURE.md).

## Menjalankan di lokal

Kebutuhan: Node.js 20 atau lebih baru, npm, database PostgreSQL, dan akun Cloudinary.

```bash
git clone https://github.com/thirapi/62ch.git
cd 62ch
npm ci
cp .env.example .env     # lalu isi nilainya
npm run db:migrate       # buat tabel di database
npm run dev              # http://localhost:3000
```

> [!CAUTION]
> `npm run db:reset`, `npm run dev:setup`, dan `npm run dev:fresh` **menghapus seluruh isi database** (`DROP SCHEMA public CASCADE`).
> Selalu pakai database terpisah untuk development, dan jangan pernah mengarahkan `DATABASE_URL` di `.env` lokal ke database production.

Untuk akun admin pertama, isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env`, lalu jalankan `npm run generate-user-seed`. Script ini mencetak perintah SQL `INSERT` (password sudah di-hash) yang kemudian dijalankan di database, misalnya lewat SQL editor Supabase.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server development (Turbopack) |
| `npm run build` / `npm start` | Build dan jalankan versi production |
| `npm test` | Unit test aturan bisnis (`lib/**/__tests__`) |
| `npm run db:generate` | Buat file migrasi dari perubahan skema di `lib/db/schema` |
| `npm run db:migrate` | Jalankan migrasi ke database |
| `npm run db:reset` | ⚠️ Hapus seluruh skema database |
| `npm run dev:setup` | ⚠️ Reset lalu migrasi ulang database |
| `npm run generate-user-seed` | Cetak SQL untuk membuat akun admin dari `ADMIN_EMAIL` / `ADMIN_PASSWORD` |

## Variabel environment

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | Connection string PostgreSQL (pooler Supabase) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Ya | Nama cloud Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Ya | Upload preset (unsigned) Cloudinary |
| `NEXT_PUBLIC_BASE_URL` | Tidak | URL situs untuk metadata, sitemap, dan canonical. Default `https://62chan.qzz.io` |
| `CLIENT_IP_HEADER` | Tidak | Header IP klien dari proxy tepercaya, untuk blokir dan rate limit |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Tidak | Analitik PostHog |
| `GEMINI_API_KEY` / `GEMINI_API_KEYS`, `GEMINI_MODELS` | Tidak | Moderasi AI (Gemini) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tidak | Hanya untuk `generate-user-seed` |

Contoh lengkapnya ada di [`.env.example`](.env.example).

## Deploy

Deploy dilakukan lewat Vercel: setiap PR mendapat preview deploy, dan merge ke `main` otomatis masuk production.

Region function diatur di [`vercel.json`](vercel.json) (`sin1`). **Region ini harus sama dengan region database.** Kalau database pindah region, ubah juga nilai ini, karena setiap query dari region yang jauh menambah latensi yang besar.

Panduan memulihkan database ada di [DB_RESTORE.md](DB_RESTORE.md).
