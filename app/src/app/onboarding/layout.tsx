import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // If onboarding is already done, go to dashboard
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingDone: true, role: true },
  });

  if (user?.onboardingDone) {
    redirect("/dashboard");
  }

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white">
                AI
              </div>
              <span className="text-white font-semibold text-xl">
                Placement Copilot
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Let's get you set up in 2 minutes
            </p>
          </div>
          {children}
        </div>
      </div>
    </ClerkProvider>
  );
}
