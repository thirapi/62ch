import type { Metadata } from "next";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Donasi",
  description: "Dukung operasional 62chan dan pantau milestone donasi kami.",
  alternates: {
    canonical: "https://62chan.qzz.io/donasi",
  },
};

interface Milestone {
  id: number;
  name: string;
  target_amount: number;
  description: string;
  image_url: string | null;
  created_at: string;
  isUnlocked: boolean;
  progressPercentage: number;
}

interface DonationStats {
  totalAmount: number;
  milestones: Milestone[];
}

async function getStats(): Promise<DonationStats | null> {
  try {
    const res = await fetch(
      "https://saweria-milestone.vercel.app/api/donations/stats",
      {
        next: { revalidate: 600 },
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch donation stats:", error);
    return null;
  }
}

export default async function DonasiPage() {
  const stats = await getStats();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl font-sans">
      <div className="space-y-6">
        {/* Simple Header */}
        <header className="border-b border-border pb-3">
          <h1 className="text-xl font-bold ib-subject">Donasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sharing is caring
          </p>
        </header>

        {/* Milestone List */}
        <section className="space-y-2">
          {stats && stats.milestones && stats.milestones.length > 0 ? (
            stats.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="ib-reply border border-muted/30 space-y-2 px-4 py-3"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-accent text-sm">
                    {milestone.name}
                  </span>
                  <span className="font-mono text-[10px] opacity-60">
                    {milestone.progressPercentage}%
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground italic leading-snug">
                  {milestone.description}
                </p>

                <div className="h-2 w-full bg-muted/20 border border-muted/40 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{
                      width: `${Math.min(milestone.progressPercentage, 100)}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between font-mono text-[10px] opacity-60">
                  <span>terkumpul {formatCurrency(stats.totalAmount)}</span>
                  <span>target {formatCurrency(milestone.target_amount)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic border border-dashed border-border px-3 py-2">
              ga ada milestone aktif saat ini.
            </p>
          )}
        </section>

        {/* Support Methods */}
        <section>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kamu bisa mendukung kami melalui <strong>Saweria</strong> (support
              pembayaran via QRIS, GoPay, OVO, Dana, LinkAja).
            </p>

            <a
              href="https://saweria.co/support62chan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-accent text-accent-foreground px-4 py-1.5 font-bold text-sm border border-accent hover:bg-accent/90 transition-colors"
            >
              Donasi via Saweria
            </a>
          </div>
        </section>

        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-1">
            <p className="font-bold text-foreground">
              Q: kalau target tidak tercapai gimana?
            </p>
            <p>
              kemungkinan ada dua opsi: kembali ke server dengan plan free yang
              berarti spesifikasi akan turun cukup signifikan, atau menyisihkan
              sebagian uangku untuk tetap berada di server sekarang.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-bold text-foreground">
              Q: apakah biaya server selalu 100k?
            </p>
            <p>
              itu hanya estimasi. jumlahnya bisa berubah, bisa lebih rendah atau
              lebih tinggi, tapi kemungkinan tidak akan kurang dari $5 per
              bulan.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-bold text-foreground">
              Q: apakah ada biaya lain selain hosting?
            </p>
            <p>
              untuk sekarang belum ada wan. beberapa layanan gratis masih cukup
              untuk kebutuhan sistem ini.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-bold text-foreground">Q: domain pakai apa?</p>
            <p>
              kita pakai domain gratis dari{" "}
              <a
                href="https://github.com/DigitalPlatDev/FreeDomain"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted hover:text-accent"
              >
                DigitalPlatDev/FreeDomain
              </a>
              . kalau mau support, bisa kasih star di repo tersebut sebagai
              bentuk terima kasih.
            </p>
          </div>
        </section>

        <section className="text-muted-foreground">
          thanks for donating.
        </section>
      </div>
    </div>
  );
}
