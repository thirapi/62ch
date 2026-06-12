import { getBoardById, getBoardCategories } from "@/lib/actions/board.actions";
import { BoardForm } from "@/components/mod/board-form";
import { notFound } from "next/navigation";

export default async function EditBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id)) notFound();

  const [board, categories] = await Promise.all([
    getBoardById(id),
    getBoardCategories()
  ]);

  if (!board) notFound();
  
  return <BoardForm initialBoard={board} categories={categories} mode="edit" />;
}
