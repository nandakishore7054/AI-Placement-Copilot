import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/recruiter/dashboard" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-500 flex items-center justify-center font-bold text-white text-xs">
                  R
                </div>
                <span className="font-semibold">Recruiter Portal</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/recruiter/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/recruiter/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
                <Link href="/recruiter/applicants" className="hover:text-foreground transition-colors">Applicants</Link>
                <Link href="/recruiter/experiences" className="hover:text-foreground transition-colors">Experiences</Link>
                <Link href="/recruiter/team" className="hover:text-foreground transition-colors">Team</Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
