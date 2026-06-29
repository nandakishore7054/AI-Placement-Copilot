import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your AI Placement Copilot account.",
};

export default function SignUpPage() {
  return <SignUp />;
}
