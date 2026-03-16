import { getBans, getModeratorAuthorizer } from "@/lib/actions/moderation.actions";
import { BanList } from "@/components/ban-list";
import { ShieldX } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BansManagementPage() {


  const bans = await getBans();

  return (
    <div className="space-y-10">
      <header className="mb-0">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          Manajemen Cekal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola daftar pemblokiran IP Address global untuk menjaga keamanan sistem
        </p>
      </header>

      <BanList initialBans={bans} />
    </div>
  );
}
