import "../../styles/retro.css";
import type { Metadata } from "next";
import { getBoardList } from "@/lib/actions/home.actions";

export const metadata: Metadata = {
  title: "62chan",
  description: "Imageboard Indonesia",
};

export default async function OldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const boards = await getBoardList();

  return (
    <html lang="id">
      <body>
        <nav style={{ fontSize: "8pt", textAlign: "center", borderBottom: "1px solid #ccc", padding: "4px" }}>
          [ <a href="/old">home</a> ]
          {boards.map((board) => (
            <span key={board.id}> / <a href={`/old/${board.code}`} title={board.name}>{board.code}</a></span>
          ))}
          [ <a href="/old/rules">rules</a> ] [ <a href="/old/donasi">donasi</a> ]
        </nav>
        {children}
        <footer style={{ textAlign: "center", marginTop: "40px", fontSize: "8pt", color: "#666", paddingBottom: "20px" }}>
          <hr />
          <div style={{ marginBottom: "10px" }}>
            [ <a href="/old">beranda</a> ] [ <a href="/old/rules">peraturan</a> ] [ <a href="/old/donasi">donasi faq</a> ] [ <a href="/">tampilan modern</a> ]
          </div>
          <p style={{ maxWidth: "600px", margin: "0 auto 10px auto", lineHeight: "1.4" }}>
            Semua postingan di 62chan adalah tanggung jawab pengunggahnya dan bukan tanggung jawab 62chan.<br />
            Untuk keluhan hukum, hak cipta, atau laporan konten ilegal, kirim ke: <a href="mailto:62chan@duck.com">62chan@duck.com</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
