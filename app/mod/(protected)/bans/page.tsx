import { getBans, getAdminOrModeratorAuthorizer } from "@/lib/actions/moderation.actions";
import { BanList } from "@/components/ban-list";
import { Suspense } from "react";

async function BansListWrapper() {
  const bans = await getBans();
  return <BanList initialBans={bans} />;
}

export default async function BansManagementPage() {
  await getAdminOrModeratorAuthorizer();
  return (
    <div className="space-y-10">
      <header className="mb-0">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          Manajemen Blokir
        </h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
          Kelola daftar pemblokiran IP Address global untuk menjaga keamanan sistem
        </p>
      </header>

      <Suspense fallback={<div className="h-64 animate-pulse bg-muted/5 border rounded-xl" />}>
        <BansListWrapper />
      </Suspense>
    </div>
  );
}
