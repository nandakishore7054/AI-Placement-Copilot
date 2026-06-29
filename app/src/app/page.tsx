import Link from "next/link";
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <ClerkProvider>

      {/* Navigation */}
      <nav className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">
            AI
          </div>
          <span className="font-semibold text-lg">Placement Copilot</span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-slate-300 hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Powered by Gemini AI · Built for Placements
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Your Intelligent
          <br />
          <span className="gradient-text">Career Copilot</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          AI-powered job matching, voice mock interviews, resume analysis, and
          personalized career roadmaps — all in one platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25">
                Start For Free →
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
          <Link
            href="/jobs"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all duration-200"
          >
            Browse Jobs
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </ClerkProvider>
  );
}

const features = [
  {
    icon: "🔍",
    title: "Semantic Job Matching",
    description:
      "Upload your resume and get jobs ranked by AI-computed similarity — not just keywords.",
  },
  {
    icon: "🎙️",
    title: "AI Voice Interviews",
    description:
      "Practice with a real-time voice AI interviewer powered by Vapi, Deepgram, and ElevenLabs.",
  },
  {
    icon: "📄",
    title: "Resume Analysis",
    description:
      "Get an ATS score, keyword analysis, section scores, and actionable improvement suggestions.",
  },
  {
    icon: "🗺️",
    title: "Career Roadmap",
    description:
      "Generate a personalized milestone-based roadmap to reach your target role and level.",
  },
  {
    icon: "📊",
    title: "Skill Gap Analysis",
    description:
      "Instantly see which skills you're missing for your dream role and how to close the gap.",
  },
  {
    icon: "⚡",
    title: "Smart Recommendations",
    description:
      "Context-aware AI recommendations for jobs, skills, courses, and interview practice.",
  },
];
