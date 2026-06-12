import { notFound, redirect } from "next/navigation";
import { deletePost } from "@/lib/actions/post.actions";
import { Suspense } from "react";

async function DeleteContent({
  type,
  contentId,
  error,
}: {
  type: string;
  contentId: string;
  error?: string;
}) {
  if (!type || !contentId) notFound();

  async function handleDelete(formData: FormData) {
    "use server";
    const postType = formData.get("type") as "thread" | "reply";
    const id = Number.parseInt(formData.get("id") as string);
    const password = formData.get("password") as string;

    const result = await deletePost(id, postType, password);

    if (result.success) {
      redirect("/?message=Postingan berhasil dihapus");
    } else {
      redirect(`/action/delete?type=${postType}&id=${id}&error=${encodeURIComponent(result.error || "Gagal menghapus postingan")}`);
    }
  }

  return (
    <main style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
      <h1 className="board-title">Hapus Postingan</h1>
      <p>Menghapus {type} No. {contentId}</p>

      {error && (
        <div style={{ color: "red", fontWeight: "bold", margin: "10px" }}>
          Kesalahan: {decodeURIComponent(error)}
        </div>
      )}

      <form action={handleDelete}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={contentId} />
        
        <table className="post-form" style={{ margin: "auto" }}>
          <tbody>
            <tr>
              <td className="form-label">Sandi</td>
              <td>
                <input type="password" name="password" required placeholder="Masukkan sandi penghapusan" />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>
                <input type="submit" value="Hapus Postingan" style={{ color: "red", fontWeight: "bold" }} />
                <button type="button" style={{ marginLeft: "10px" }} onClick={() => history.back()}>Batal</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </main>
  );
}

export default async function OldDeletePage({
  searchParams,
}: {
  searchParams: Promise<{ type: string; id: string; error?: string }>;
}) {
  const { type, id: contentId, error } = await searchParams;

  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Memuat...</div>}>
      <DeleteContent type={type} contentId={contentId} error={error} />
    </Suspense>
  );
}
