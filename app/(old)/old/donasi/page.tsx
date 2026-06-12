export default function OldDonasiPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "auto" }}>
      <header>
        <h1 className="board-title">FAQ & Donasi</h1>
        <div className="board-subtitle">Sharing is caring</div>
      </header>

      <hr />

      <section>
        <p>
          62chan adalah proyek hobi yang dijalankan oleh komunitas. Dukungan Anda sangat berarti bagi kami untuk menjaga server tetap menyala.
        </p>

        <p>
          Anda dapat mendukung kami melalui <b>Saweria</b>. Saweria mendukung pembayaran via QRIS, GoPay, OVO, Dana, dan LinkAja.
        </p>

        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button disabled style={{ padding: "10px 20px", fontWeight: "bold" }}>
            Donasi via Saweria (Segera Hadir)
          </button>
        </div>
      </section>

      <section>
        <h2>FAQ</h2>
        <p><b>Q: Kenapa donasi?</b></p>
        <p>A: Untuk biaya server, domain, dan infrastruktur lainnya.</p>

        <p><b>Q: Apakah saya dapat fitur khusus?</b></p>
        <p>A: Tidak, 62chan tetap anonim dan sama untuk semua orang. Donasi bersifat sukarela.</p>
      </section>

      <hr />
      <div style={{ textAlign: "center", fontSize: "8pt", color: "#666" }}>
        Terima kasih atas dukungan Anda!
      </div>
    </main>
  );
}

