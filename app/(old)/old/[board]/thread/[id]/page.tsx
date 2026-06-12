import { notFound } from "next/navigation";
import { getBoardByCode } from "@/lib/actions/board.actions";
import { getThreadDetail, getCaptcha } from "@/lib/actions/thread.actions";
import { oldCreateReply } from "@/lib/actions/old.actions";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ExpandableImage } from "@/components/old/expandable-image";

export default async function OldThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ board: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { board: boardCode, id: threadId } = await params;
  const { error } = await searchParams;

  const [board, threadDetail, captcha] = await Promise.all([
    getBoardByCode(boardCode),
    getThreadDetail(Number.parseInt(threadId)),
    getCaptcha(),
  ]);

  if (!board || !threadDetail) notFound();

  const { thread, replies } = threadDetail;

  return (
    <main>
      <header>
        <h1 className="board-title">/{board.code}/ - {board.name}</h1>
        <div className="board-subtitle">{board.description}</div>
      </header>

      <hr />
      [<a href={`/${boardCode}`}>Kembali ke Board</a>]
      <hr />

      {error && (
        <div style={{ color: "red", textAlign: "center", fontWeight: "bold", margin: "10px" }}>
          Kesalahan: {decodeURIComponent(error)}
        </div>
      )}

      <div className="thread-container">
        <div className="post op">
          {thread.image && (
            <div className="post-image-thumb">
              File: <a href={thread.image} target="_blank">{thread.id}.png</a><br />
              <ExpandableImage 
                src={thread.image} 
                isBlurred={thread.isNsfw || thread.isSpoiler}
                blurLabel={thread.isNsfw ? "NSFW" : "SPOILER"}
                maxWidth="250px"
                maxHeight="250px"
              />
            </div>
          )}
          <div className="post-header">
            <span className="post-subject">{thread.subject}</span>{" "}
            <span className="post-name">Awanama</span>{" "}
            {format(new Date(thread.createdAt), "dd/MM/yy(EEE)HH:mm:ss", { locale: id })}{" "}
            <span className="post-id">No.{thread.postNumber}</span>{" "}
            [<a href={`/action/report?type=thread&id=${thread.id}`}>Lapor</a>]{" "}
            [<a href={`/action/delete?type=thread&id=${thread.id}`}>Hapus</a>]
          </div>
          <div className="post-content">
            {thread.content.split("\n").map((line: string, i: number) => (
              <div key={i} className={line.startsWith(">") ? "greentext" : ""}>{line}</div>
            ))}
          </div>
        </div>

        <div className="replies" style={{ marginLeft: "40px" }}>
          {replies.map((reply) => (
            <div key={reply.id} id={`p${reply.postNumber}`} className="post reply">
              <div className="post-header">
                <span className="post-name">Awanama</span>{" "}
                {format(new Date(reply.createdAt), "dd/MM/yy(EEE)HH:mm:ss", { locale: id })}{" "}
                <span className="post-id">No.{reply.postNumber}</span>{" "}
                [<a href={`/action/report?type=reply&id=${reply.id}`}>Lapor</a>]{" "}
                [<a href={`/action/delete?type=reply&id=${reply.id}`}>Hapus</a>]
              </div>
              {reply.image && (
                <div className="post-image-thumb" style={{ float: "none", margin: "5px 0" }}>
                  <ExpandableImage 
                    src={reply.image} 
                    isBlurred={reply.isNsfw || reply.isSpoiler}
                    blurLabel={reply.isNsfw ? "NSFW" : "SPOILER"}
                    maxWidth="200px"
                    maxHeight="200px"
                  />
                </div>
              )}
              <div className="post-content">
                {reply.content.split("\n").map((line: string, i: number) => (
                  <div key={i} className={line.startsWith(">") ? "greentext" : ""}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <form action={oldCreateReply} method="POST">
          <input type="hidden" name="threadId" value={thread.id} />
          <input type="hidden" name="boardCode" value={board.code} />
          <table className="post-form" style={{ margin: "auto" }}>
            <tbody>
              <tr>
                <td className="form-label">Nama</td>
                <td><input type="text" name="author" placeholder="Awanama" /></td>
              </tr>
              <tr>
                <td className="form-label">Komentar</td>
                <td><textarea name="content" cols={48} rows={4}></textarea></td>
              </tr>
              <tr>
                <td className="form-label">Sandi</td>
                <td><input type="password" name="deletionPassword" style={{ width: "100px" }} /> (untuk penghapusan)</td>
              </tr>
              <tr>
                <td className="form-label">Opsi</td>
                <td>
                  <label><input type="checkbox" name="isNsfw" /> NSFW</label>
                  <label style={{ marginLeft: "10px" }}><input type="checkbox" name="isSpoiler" /> Spoiler</label>
                </td>
              </tr>
              <tr>
                <td className="form-label">CAPTCHA</td>
                <td>
                  {captcha.question} 
                  <input type="text" name="captcha" style={{ width: "50px" }} required />
                  <input type="hidden" name="captchaToken" value={captcha.token} />
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}><input type="submit" value="Kirim Balasan" /></td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
      <hr />
      [<a href={`/${boardCode}`}>Kembali ke Board</a>]
    </main>
  );
}
