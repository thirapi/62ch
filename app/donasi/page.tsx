import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Donasi",
  description: "Dukung operasional 62chan.",
};

export default function DonasiPage() {
  return (
    <div className="min-h-[calc(100svh-48px)] bg-background text-foreground flex flex-col">
      <header className="py-6 text-center border-b border-border/40">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-accent mb-2">Donasi</h1>
          <p className="text-sm text-muted-foreground">
            Dukung kami agar server tetap berjalan
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-1 max-w-4xl">
        <div className="space-y-8">
          {/* Alasan Donasi */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-accent border-b border-border/40 pb-2">
              Mengapa Berdonasi?
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
<p>
  62chan dijalankan secara mandiri, dan biaya server saat ini berkisar sekitar{" "}
  <b>$5–$10/bulan (~80–160 ribuan)</b>, tergantung traffic.
</p>
              <p>
                Bantuan Anda sangat berarti untuk memastikan website ini terus
                online.
              </p>
            </div>
          </section>

          {/* Metode Pembayaran */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-accent border-b border-border/40 pb-2">
              Metode Pembayaran
            </h2>
            <div className="space-y-6">
              <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold text-accent mb-2">Saweria</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Dukung kami menggunakan GoPay, OVO, Dana, LinkAja, atau QRIS.
                </p>
                <a
                  href="https://saweria.co/support62chan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded font-medium hover:bg-accent/90 transition-colors"
                >
                  Donasi via Saweria
                </a>
              </div>

              {/* <div className="bg-muted/20 p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold text-accent mb-2">Crypto</h3>
                <p className="text-sm text-muted-foreground">
                  Mungkin nanti akan ditambahkan
                </p>
              </div> */}
            </div>
          </section>

          {/* Transparansi */}
          <section className="border-t border-border/40 pt-8">
            <h2 className="text-2xl font-bold mb-4 text-accent">
              Transparansi
            </h2>
            <div className="text-sm leading-relaxed space-y-3 text-muted-foreground">
              <p>
                semua donasi dipakai untuk biaya server dan pengembangan 62chan.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 bg-muted/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Terima kasih atas dukungan Anda.
          </p>
        </div>
      </footer>
    </div>
  );
}
