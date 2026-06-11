import { getStaffList } from "@/lib/actions/staff.actions";
import { getAllBoards } from "@/lib/actions/board.actions";
import { getAdminAuthorizer } from "@/lib/actions/moderation.actions";
import { StaffManager } from "./staff-manager";

export default async function StaffPage() {
  await getAdminAuthorizer();
  const [staff, allBoards] = await Promise.all([
    getStaffList(),
    getAllBoards()
  ]);

  return (
    <div className="space-y-6">
      <header className="mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
          Kelola akun moderator dan janitor, serta atur akses board mereka secara spesifik.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
          <StaffManager initialStaff={staff} allBoards={allBoards} />
      </div>
    </div>
  );
}
