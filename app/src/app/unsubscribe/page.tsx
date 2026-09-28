import type { Metadata } from "next";
import Link from "next/link";
import { EmailSubscriptionCard } from "@/components/subscription";
import { Mail, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email Preferences | AI Placement Copilot",
  description: "Manage your email subscriptions and job alert preferences.",
};

interface PageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              AI
            </div>
            <span className="font-bold text-base text-foreground">
              Placement Copilot
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Manage Email Preferences
          </h1>
          <p className="text-xs text-muted-foreground">
            Update your subscription status for weekly job digests and placement notifications.
          </p>
        </div>

        <EmailSubscriptionCard
          defaultEmail={email ?? ""}
          initialSubscribed={Boolean(email)}
        />

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
