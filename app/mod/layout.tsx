import { ModHeader } from "@/components/mod-header";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <ModHeader role={role} />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
    </div>
  );
}
