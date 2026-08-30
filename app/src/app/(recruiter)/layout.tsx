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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-8">
              <Link href="/recruiter/dashboard" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-500 flex items-center justify-center font-bold text-white text-xs">
                  R
                </div>
                <span className="font-semibold text-sm sm:text-base">Recruiter Portal</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/recruiter/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/recruiter/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
                <Link href="/recruiter/applicants" className="hover:text-foreground transition-colors">Applicants</Link>
                <Link href="/recruiter/experiences" className="hover:text-foreground transition-colors">Experiences</Link>
                <Link href="/recruiter/team" className="hover:text-foreground transition-colors">Team</Link>
              </nav>
            </div>
            <UserButton />
          </div>

          {/* Mobile sub-navigation bar */}
          <div className="flex md:hidden items-center gap-4 overflow-x-auto border-t px-4 py-2 text-xs text-muted-foreground scrollbar-none bg-muted/20">
            <Link href="/recruiter/dashboard" className="hover:text-foreground shrink-0 transition-colors">Dashboard</Link>
            <Link href="/recruiter/jobs" className="hover:text-foreground shrink-0 transition-colors">Jobs</Link>
            <Link href="/recruiter/applicants" className="hover:text-foreground shrink-0 transition-colors font-medium">Applicants</Link>
            <Link href="/recruiter/experiences" className="hover:text-foreground shrink-0 transition-colors">Experiences</Link>
            <Link href="/recruiter/team" className="hover:text-foreground shrink-0 transition-colors">Team</Link>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">{children}</main>
      </div>
    </ClerkProvider>
  );
}
