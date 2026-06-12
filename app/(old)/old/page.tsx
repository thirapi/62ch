import {
  getBoardList,
  getBoardCategories,
  getLatestPosts,
  getRecentImages,
  getAnnouncements,
} from "@/lib/actions/home.actions";
import { BoardEntity, BoardCategoryEntity } from "@/lib/entities/board.entity";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

function groupBoards(boards: BoardEntity[], categories: BoardCategoryEntity[]) {
  const groups: Map<string, BoardEntity[]> = new Map();
  categories.forEach((cat) => groups.set(cat.name, []));
  boards.forEach((board) => {
    const key = board.categoryName || "Lainnya";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(board);
  });
  return groups;
}

export default async function OldHomePage() {
  const [boards, categories, latestPosts, recentImages, announcements] =
    await Promise.all([
      getBoardList(),
      getBoardCategories(),
      getLatestPosts(25),
      getRecentImages(12),
      getAnnouncements(3),
    ]);

  const groupedBoards = groupBoards(boards, categories);
  const categoryNames = Array.from(groupedBoards.keys()).filter(
    (name) => groupedBoards.get(name)!.length > 0,
  );

  return (
    <main>
      <header>
        <h1 className="board-title">62chan</h1>
        <div className="board-subtitle">Papan Gambar Anonim Indonesia</div>
      </header>

      {announcements.length > 0 && (
        <section style={{ margin: "20px auto", maxWidth: "800px", border: "1px dashed red", padding: "10px" }}>
          <b style={{ color: "red" }}>Pengumuman:</b>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            {announcements.map((ann) => (
              <li key={ann.id}>{ann.content}</li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", marginBottom: "40px" }}>
        {categoryNames.map((categoryName) => (
          <div key={categoryName} style={{ minWidth: "200px" }}>
            <h2 style={{ fontSize: "11pt", borderBottom: "1px solid #ccc", color: "#800000" }}>{categoryName}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "9pt" }}>
              {groupedBoards.get(categoryName)!.map((board) => (
                <li key={board.id}>
                  <a href={`/${board.code}`}><b>/{board.code}/</b> - {board.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <hr />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
        <section style={{ flex: "2" }}>
          <h2 style={{ fontSize: "12pt", color: "#800000" }}>Postingan Terbaru</h2>
          <table width="100%" cellPadding="2" cellSpacing="0" style={{ fontSize: "9pt" }}>
            <tbody>
              {latestPosts.map((post) => (
                <tr key={post.id} style={{ verticalAlign: "top" }}>
                  <td style={{ whiteSpace: "nowrap", paddingRight: "10px" }}>
                    <a href={`/${post.boardCode}/thread/${post.threadId}#p${post.postNumber}`}>
                      /{post.boardCode}/{post.postNumber}
                    </a>
                  </td>
                  <td>
                    <span style={{ color: "#789922", fontWeight: "bold" }}>{post.boardCode}</span>: {post.excerpt}
                  </td>
                  <td style={{ textAlign: "right", color: "#666", fontSize: "8pt" }}>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: id })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ flex: "1" }}>
          <h2 style={{ fontSize: "12pt", color: "#800000" }}>Gambar Terbaru</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
            {recentImages.map((img) => (
              <a key={img.id} href={`/${img.boardCode}/thread/${img.threadId}#p${img.postNumber}`} style={{ position: "relative", display: "block", overflow: "hidden" }}>
                <img 
                  src={img.imageUrl} 
                  alt="" 
                  style={{ 
                    width: "100%", 
                    height: "80px", 
                    objectFit: "cover", 
                    border: "1px solid #ccc",
                    filter: (img.isNsfw || img.isSpoiler) ? "blur(10px)" : "none"
                  }} 
                />
                {(img.isNsfw || img.isSpoiler) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "white",
                      textShadow: "0 0 4px black",
                      pointerEvents: "none",
                      fontWeight: "bold",
                      fontSize: "8pt"
                    }}
                  >
                    {img.isNsfw ? "NSFW" : "SPOILER"}
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
