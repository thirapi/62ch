import { getBoardCategories } from "@/lib/actions/board.actions";
import { getAdminAuthorizer } from "@/lib/actions/moderation.actions";
import { BoardForm } from "@/components/mod/board-form";

export default async function NewBoardPage() {
  await getAdminAuthorizer();
  const categories = await getBoardCategories();

  return <BoardForm categories={categories} mode="create" />;
}
