import { notFound, redirect } from "next/navigation";
import { createReport } from "@/lib/actions/moderation.actions";
import { Suspense } from "react";

async function ReportContent({
  type,
  contentId,
  error,
}: {
  type: string;
  contentId: string;
  error?: string;
}) {
  if (!type || !contentId) notFound();

  async function handleReport(formData: FormData) {
    "use server";
    const contentType = formData.get("type") as "thread" | "reply";
    const id = Number.parseInt(formData.get("id") as string);
    const reason = formData.get("reason") as string;

    const result = await createReport(contentType, id, reason);

    if (result.success) {
      redirect("/?message=Laporan berhasil dikirim");
    } else {
      redirect(`/action/report?type=${contentType}&id=${id}&error=${encodeURIComponent(result.error || "Gagal mengirim laporan")}`);
    }
  }

  return (
    <main style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
      <h1 className="board-title">Laporkan Konten</h1>
      <p>Melaporkan {type} No. {contentId}</p>

      {error && (
        <div style={{ color: "red", fontWeight: "bold", margin: "10px" }}>
          Kesalahan: {decodeURIComponent(error)}
        </div>
      )}

      <form action={handleReport}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={contentId} />
        
        <table className="post-form" style={{ margin: "auto" }}>
          <tbody>
            <tr>
              <td className="form-label">Alasan</td>
              <td>
                <textarea name="reason" cols={40} rows={5} required placeholder="Jelaskan alasan laporan Anda..."></textarea>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>
                <input type="submit" value="Kirim Laporan" />
                <button type="button" style={{ marginLeft: "10px" }} onClick={() => history.back()}>Batal</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </main>
  );
}

export default async function OldReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type: string; id: string; error?: string }>;
}) {
  const { type, id: contentId, error } = await searchParams;

  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Memuat...</div>}>
      <ReportContent type={type} contentId={contentId} error={error} />
    </Suspense>
  );
}
