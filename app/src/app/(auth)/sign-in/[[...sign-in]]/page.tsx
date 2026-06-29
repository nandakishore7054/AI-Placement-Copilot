import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AI Placement Copilot account.",
};

export default function SignInPage() {
  return <SignIn />;
}
