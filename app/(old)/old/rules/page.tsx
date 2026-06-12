export default function OldRulesPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "auto" }}>
      <header>
        <h1 className="board-title">Peraturan & Ketentuan</h1>
        <div className="board-subtitle">Harap dibaca sebelum memposting</div>
      </header>

      <hr />

      <section>
        <h2>Peraturan Global</h2>
        <ol>
          <li>Untuk akses atau posting di 62chan kamu harus berusia, <b>18 tahun atau lebih</b>.</li>
          <li>Jika menurut hukum Indonesia itu illegal, maka itu illegal di 62chan.</li>
          <li>Perilaku <b>spam, flood, atau raid</b> tidak diperbolehkan.</li>
          <li><b>Doxxing</b> atau menyebar informasi pribadi orang lain tidak diperbolehkan.</li>
          <li>Jangan mencoba mengidentifikasi atau melakukan tracking terhadap pengguna anonim.</li>
          <li>Posting di board yang sesuai.</li>
          <li>Keputusan moderator dan admin bersifat final.</li>
        </ol>
      </section>

      <section>
        <h2>Panduan Posting</h2>
        <ul>
          <li>Pakai nama hanya kalau perlu. 62chan menghargai anonimitas.</li>
          <li>Tripcode tersedia (format: Nama#Sandi).</li>
          <li>Jangan minta spoonfeeding.</li>
          <li>Jangan feed the trolls.</li>
        </ul>
      </section>

      <section>
        <h2>Format Pesan</h2>
        <ul>
          <li>Balas post: <code>&gt;&gt;nomorpost</code> (contoh: &gt;&gt;123).</li>
          <li>Link board: <code>&gt;&gt;&gt;/board/</code> (contoh: &gt;&gt;&gt;/k/).</li>
          <li>Greentext: Baris diawali <code>&gt;</code>.</li>
          <li>YouTube: Tempel link langsung.</li>
          <li>Spoiler: <code>[spoiler]teks[/spoiler]</code>.</li>
        </ul>
      </section>

      <section>
        <h2>Moderasi & Sanksi</h2>
        <p>Pelanggaran dapat mengakibatkan:</p>
        <ul>
          <li>Penghapusan post atau thread</li>
          <li>Warning dari moderator</li>
          <li>Ban sementara atau permanen</li>
        </ul>
      </section>

      <hr />
      <div style={{ textAlign: "center", fontSize: "8pt", color: "#666" }}>
        Terakhir diperbarui: Maret 2026.
      </div>
    </main>
  );
}
