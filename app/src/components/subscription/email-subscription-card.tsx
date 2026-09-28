"use client";

import { useState, useTransition } from "react";
import { Mail, CheckCircle2, Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeToJobAlerts, unsubscribeFromJobAlerts } from "@/actions/subscribe";
import { cn } from "@/lib/utils";

interface EmailSubscriptionCardProps {
  defaultEmail?: string;
  initialSubscribed?: boolean;
  className?: string;
}

export function EmailSubscriptionCard({
  defaultEmail = "",
  initialSubscribed = false,
  className = "",
}: EmailSubscriptionCardProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await subscribeToJobAlerts(email.trim());
        if (res.success) {
          setIsSubscribed(true);
          toast.success(res.message || "Subscribed to job alerts successfully!");
        } else {
          toast.error(res.error || "Failed to subscribe. Please try again.");
        }
      } catch (err: any) {
        toast.error("An error occurred while subscribing.");
      }
    });
  };

  const handleUnsubscribe = () => {
    if (!confirm("Are you sure you want to stop receiving weekly job alerts?")) return;

    startTransition(async () => {
      try {
        const res = await unsubscribeFromJobAlerts(email.trim());
        if (res.success) {
          setIsSubscribed(false);
          toast.info(res.message || "Unsubscribed from job alerts.");
        } else {
          toast.error(res.error || "Failed to unsubscribe.");
        }
      } catch (err: any) {
        toast.error("An error occurred while unsubscribing.");
      }
    });
  };

  return (
    <div
      className={cn(
        "rounded-3xl border bg-card p-6 sm:p-8 shadow-xs space-y-4",
        isSubscribed ? "border-indigo-100 bg-indigo-50/20" : "",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 mt-0.5",
              isSubscribed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            )}
          >
            {isSubscribed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground">
                Weekly Job Digest & Placement Alerts
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  isSubscribed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isSubscribed ? "Subscribed" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
              Receive curated Monday digests featuring newly posted technical openings matching your verified skills and target roles.
            </p>
          </div>
        </div>

        {isSubscribed ? (
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BellOff className="h-3.5 w-3.5" />
            )}
            <span>Unsubscribe</span>
          </button>
        ) : null}
      </div>

      {!isSubscribed && (
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              placeholder="Enter your email for placement digests"
              className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Subscribe to Alerts</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
