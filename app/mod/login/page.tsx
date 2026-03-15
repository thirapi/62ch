import { LoginForm } from "@/components/login-form";
import { getModeratorAuthorizer } from "@/lib/actions/moderation.actions";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    // If already logged in as moderator, skip login page
    try {
        const user = await getModeratorAuthorizer();
        if (user) redirect("/mod");
    } catch (e) {
        // Not logged in, stay on page
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Moderator Login</h1>
            <LoginForm />
        </div>
    );
}
