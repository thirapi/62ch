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
      getLatestPosts(8),
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
      </header>

      <div className="old-page-container">
        {announcements.length > 0 && (
          <div className="old-box">
            <div className="old-box-header">
              News
            </div>
            <div className="old-box-content">
              <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.6" }}>
                {announcements.map((ann) => (
                  <li key={ann.id} style={{ marginBottom: "6px" }}>
                    {ann.content}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="old-box">
          <div className="old-box-header">
            Boards
          </div>

          <div className="old-boards-grid">
            {categoryNames.map((categoryName) => (
              <div
                key={categoryName}
                className="old-board-category"
              >
                <h2 className="old-board-category-title">
                  {categoryName}
                </h2>
                <ul className="old-board-list">
                  {groupedBoards.get(categoryName)!.map((board) => (
                    <li key={board.id}>
                      <a
                        href={`/${board.code}`}
                        className="old-board-link"
                      >
                        <b style={{ color: "#ff0000" }}>/{board.code}/</b> -{" "}
                        {board.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr />

        <div className="old-recent-container">
          <section className="old-recent-section old-box">
            <div className="old-box-header">Postingan Terbaru</div>
            <div className="old-box-content">
              <table className="old-posts-table">
                <tbody>
                  {latestPosts.map((post) => (
                    <tr key={post.id}>
                      <td style={{ whiteSpace: "nowrap", paddingRight: "10px" }}>
                        <a
                          href={`/${post.boardCode}/thread/${post.threadId}#p${post.postNumber}`}
                        >
                          /{post.boardCode}/{post.postNumber}
                        </a>
                      </td>
                      <td>
                        <span style={{ color: "#789922", fontWeight: "bold" }}>
                          {post.boardCode}
                        </span>
                        : {post.excerpt}
                      </td>
                      <td className="old-posts-table-date">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="old-recent-section old-box">
            <div className="old-box-header">Gambar Terbaru</div>
            <div className="old-box-content">
              <div className="old-images-grid">
                {recentImages.map((img) => (
                  <a
                    key={img.id}
                    href={`/${img.boardCode}/thread/${img.threadId}#p${img.postNumber}`}
                    className="old-image-item"
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="old-image-img"
                      style={{
                        filter: img.isNsfw || img.isSpoiler ? "blur(10px)" : "none",
                      }}
                    />
                    {(img.isNsfw || img.isSpoiler) && (
                      <div className="old-image-overlay">
                        {img.isNsfw ? "NSFW" : "SPOILER"}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
