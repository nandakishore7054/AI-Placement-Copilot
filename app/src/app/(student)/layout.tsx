import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                  AI
                </div>
                <span className="font-semibold">Placement Copilot</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link>
                <Link href="/applications" className="hover:text-foreground transition-colors">Applications</Link>
                <Link href="/interviews" className="hover:text-foreground transition-colors">Interviews</Link>
                <Link href="/resume" className="hover:text-foreground transition-colors">Resume</Link>
                <Link href="/career" className="hover:text-foreground transition-colors">Career</Link>
              </nav>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
