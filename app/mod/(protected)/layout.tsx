import { getModeratorAuthorizer } from "@/lib/actions/moderation.actions";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Security Check: Redirect to login if user is not authorized
    await getModeratorAuthorizer();
  } catch (error) {
    // Check if the error is specifically about permissions vs not logged in
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("insufficient permissions")) {
      redirect("/");
    } else {
      redirect("/mod/login");
    }
  }

  return <>{children}</>;
}
