import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Placement Copilot",
    template: "%s | AI Placement Copilot",
  },
  description:
    "Your intelligent career companion — AI-powered job matching, mock interviews, resume analysis, and personalized career roadmaps.",
  keywords: [
    "jobs",
    "career",
    "AI interview",
    "resume analysis",
    "placement",
    "job search",
    "career roadmap",
  ],
  authors: [{ name: "AI Placement Copilot" }],
  openGraph: {
    title: "AI Placement Copilot",
    description:
      "AI-powered job matching, mock interviews, resume analysis, and career roadmaps.",
    type: "website",
    locale: "en_IN",
    siteName: "AI Placement Copilot",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Placement Copilot",
    description: "Your intelligent career companion.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Root layout — provides global styles, fonts, and toast notifications.
 *
 * NOTE: ClerkProvider is intentionally NOT placed here.
 * It is placed in each route-group layout that needs auth:
 *   - (auth)/layout.tsx     — sign-in / sign-up pages
 *   - (student)/layout.tsx  — student portal
 *   - (recruiter)/layout.tsx — recruiter portal
 *   - (admin)/layout.tsx    — admin portal
 *
 * This pattern allows `/_not-found` and the landing page to build
 * statically without requiring a Clerk publishable key at build time.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
