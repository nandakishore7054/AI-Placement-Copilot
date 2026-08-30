import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Verify admin role
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-red-500 flex items-center justify-center font-bold text-white text-xs">
                  A
                </div>
                <span className="font-semibold">Admin Panel</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">Overview</Link>
                <Link href="/admin/audit-log" className="hover:text-foreground transition-colors">Audit Log</Link>
              </nav>
            </div>
            <UserButton />
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    </ClerkProvider>
  );
}
