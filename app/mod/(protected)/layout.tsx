import { getModeratorAuthorizer } from "@/lib/actions/moderation.actions";
import { redirect, forbidden } from "next/navigation";
import { Suspense } from "react";

async function AuthGuard({ children }: { children: React.ReactNode }) {
  try {
    // Security Check: Redirect to login if user is not authorized
    // getModeratorAuthorizer uses cookies(), which will suspend here during dynamicIO build
    await getModeratorAuthorizer();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("insufficient permissions")) {
      forbidden();
    } else {
      redirect("/mod/login");
    }
  }

  return <>{children}</>;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" /></div>}>
      <AuthGuard>
        {children}
      </AuthGuard>
    </Suspense>
  );
}
