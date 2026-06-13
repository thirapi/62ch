import { ModHeader } from "@/components/mod-header";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { Suspense } from "react";

async function ModHeaderWithAuth() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value || null;
  let role: string | null = null;

  if (sessionId) {
    try {
      const { user } = await lucia.validateSession(sessionId);
      if (user) role = user.role;
    } catch (e) {
      // Ignored
    }
  }

  return <ModHeader role={role} />;
}

export default async function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Suspense fallback={<div className="h-16 border-b bg-muted/5 animate-pulse" />}>
        <ModHeaderWithAuth />
      </Suspense>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
}
