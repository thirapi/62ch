import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peraturan & Ketentuan",
  description: "Daftar peraturan dan ketentuan penggunaan layanan 62chan.",
};

export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl font-sans">
      <div className="space-y-6">
        {/* Header */}
        <header className="border-b border-border pb-3">
          <h1 className="text-xl font-bold ib-subject">
            Peraturan &amp; Ketentuan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Harap dibaca sebelum memposting
          </p>
        </header>

        {/* Peraturan Global */}
        <section className="space-y-1">
          <p className="font-bold text-sm text-foreground">Peraturan Global</p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">1.</span>
              <p>
                untuk akses atau posting di 62chan kamu harus berusia,{" "}
                <strong className="text-foreground">18 tahun atau lebih</strong>
                .
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">2.</span>
              <p>
                jika menurut hukum indonesia itu illegal, maka itu illegal di
                62chan.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">3.</span>
              <p>
                perilaku{" "}
                <strong className="text-foreground">
                  spam, flood, atau raid
                </strong>{" "}
                tidak di perbolehkan. posting berulang dengan konten sama akan
                dihapus.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">4.</span>
              <p>
                <strong className="text-foreground">doxxing</strong> atau
                menyebar informasi pribadi orang lain tanpa izin tidak
                diperbolehkan, termasuk alamat, nomor telepon, atau data
                sensitif lainnya.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">5.</span>
              <p>
                jangan mencoba mengidentifikasi atau melakukan tracking terhadap
                pengguna anonim. privasi orang lain harus dihormati.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">6.</span>
              <p>
                posting di board yang sesuai. baca deskripsi board dulu sebelum
                bikin thread baru.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">7.</span>
              <p>
                keputusan moderator dan admin bersifat final dan tidak bisa
                diganggu gugat.
              </p>
            </div>
          </div>
        </section>

        {/* Panduan Posting */}
        <section className="space-y-1">
          <p className="font-bold text-sm text-foreground">Panduan Posting</p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                pakai nama hanya kalau perlu. 62chan menghargai anonimitas.{" "}
                <strong className="text-foreground">tripcode</strong> tersedia
                kalau butuh buktiin identitas (format:{" "}
                <code className="bg-muted px-1">Nama#Sandi</code>).
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                jangan minta spoonfeeding. coba cari sendiri dulu sebelum nanya.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                jangan feed the trolls. abaikan aja postingan yang jelas-jelas
                cari perhatian atau provokasi.
              </p>
            </div>
          </div>
        </section>

        {/* Format Pesan */}
        <section className="space-y-1">
          <p className="font-bold text-sm text-foreground">Format Pesan</p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                balas post tertentu pakai <strong className="text-foreground">post quote</strong>. format:{" "}
                <code className="bg-muted px-1">&gt;&gt;nomorpost</code> (contoh: &gt;&gt;123).
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                link ke board lain pakai <strong className="text-foreground">cross-board link</strong>. format:{" "}
                <code className="bg-muted px-1">&gt;&gt;&gt;/board/</code> (contoh: &gt;&gt;&gt;/k/).
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                baris yang diawali <code className="bg-muted px-1">&gt;</code> otomatis jadi{" "}
                <strong className="text-foreground">greentext</strong>.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                tempel link <strong className="text-foreground">YouTube</strong> langsung di pesan buat munculin video player otomatis.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                link website biasa (http/https) bakal otomatis aktif dan bisa diklik.
              </p>
            </div>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="space-y-1">
          <p className="font-bold text-sm text-foreground">Pro Tips</p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                62chan adalah tempat untuk menyuarakan pendapat, jadi jangan
                bungkam pendapat orang lain.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>santai aja. enjoy diskusinya. jokes selalu diterima.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                pake akalmu sebelum posting sesuatu yang berpotensi bermasalah.
              </p>
            </div>
          </div>
        </section>

        {/* Kebijakan Konten */}
        <section className="space-y-1">
          <p className="font-bold text-sm text-foreground">Kebijakan Konten</p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                gambar dengan konten dewasa atau disturbing wajib diberi flag{" "}
                <strong className="text-foreground">NSFW</strong> saat posting.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                ukuran file maksimal <strong className="text-foreground">10MB</strong>. format yang didukung: JPG, JPEG, PNG, GIF, WebP.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                jangan repost berlebihan. cek dulu apakah thread dengan topik sama sudah ada.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-accent font-bold min-w-[1.25rem]">•</span>
              <p>
                bungkus konten sensitif pakai{" "}
                <strong className="text-foreground">spoiler</strong>. format:{" "}
                <code className="bg-muted px-1">[spoiler]teks[/spoiler]</code>.
                gambar bisa di-spoiler lewat checkbox saat posting.
              </p>
            </div>
          </div>
        </section>

        {/* Moderasi & Sanksi */}
        <section className="space-y-1">
          <p className="font-bold text-sm text-foreground">
            Moderasi &amp; Sanksi
          </p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>Pelanggaran terhadap peraturan dapat mengakibatkan:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Penghapusan post atau thread</li>
              <li>Warning dari moderator</li>
              <li>Ban sementara (beberapa jam hingga beberapa hari)</li>
              <li>Ban permanen untuk pelanggaran berat atau berulang</li>
            </ul>
            <p className="italic">
              Moderator berhak menghapus konten yang dianggap tidak pantas
              meskipun tidak secara eksplisit melanggar peraturan.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground">Disclaimer</p>
          <p>
            Semua posting di imageboard ini adalah tanggung jawab pengguna yang
            memposting. Kami tidak bertanggung jawab atas konten yang diposting
            oleh pengguna.
          </p>
          <p>
            Dengan menggunakan imageboard ini, Anda menyetujui bahwa Anda telah
            membaca, memahami, dan setuju untuk mematuhi semua peraturan di
            halaman ini.
          </p>
        </section>

        <section className="text-muted-foreground text-sm">
          terakhir diperbarui: Maret 2026.
        </section>
      </div>
    </div>
  );
}
