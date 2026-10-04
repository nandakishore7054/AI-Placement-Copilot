"use client";

import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Bot,
  BrainCircuit,
  FileText,
  Target,
  Map,
  Award,
  Briefcase,
  TrendingUp,
  Terminal,
  ChevronRight,
  Mic,
  Star,
  Shield,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LandingPage() {
  return (
    <ClerkProvider>
      <div className="min-h-screen bg-background text-foreground relative selection:bg-indigo-500/25 selection:text-indigo-600 dark:selection:text-indigo-300">
        {/* Subtle Ambient Background Mesh */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-ambient-radial opacity-70" />
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]"
          aria-hidden="true"
        />

        {/* ─── Navigation ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-foreground">
                  Placement Copilot
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-500">
                  AI v2.0
                </span>
              </div>
            </Link>

            {/* Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Capabilities
              </a>
              <a href="#mockup" className="hover:text-foreground transition-colors">
                AI Platform
              </a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </a>
              <Link href="/experiences" className="hover:text-foreground transition-colors">
                Experiences
              </Link>
              <Link href="/jobs" className="hover:text-foreground transition-colors">
                Browse Jobs
              </Link>
            </nav>

            {/* Auth Actions & Theme */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold hover:text-foreground"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20"
                  >
                    Get Started Free
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 gap-1.5"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </header>

        {/* ─── Hero Section ────────────────────────────────────────────────────── */}
        <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-8 backdrop-blur-md shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>Next-Gen Placement Preparation Powered by Gemini AI</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] mb-6">
              Land Your Dream Tech Job with an{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Intelligent Career Copilot
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              A unified career intelligence engine. Analyze your resume with ATS precision, practice real-time AI voice interviews, bridge skill gaps, and explore real placement experiences.
            </p>

            {/* Primary Calls to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm px-7 py-6 shadow-xl shadow-indigo-500/25 group transition-all duration-200"
                  >
                    <span>Start Free Assessment</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-150" />
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm px-7 py-6 shadow-xl shadow-indigo-500/25 group"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-150" />
                  </Button>
                </Link>
              </SignedIn>

              <Link href="/jobs" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl border-border/80 text-foreground font-semibold text-sm px-7 py-6 hover:bg-muted/60 transition-all duration-200"
                >
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Browse Open Roles</span>
                </Button>
              </Link>
            </div>

            {/* Social Proof / Guarantee Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>94% ATS Score Boost</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Gemini Voice Simulation</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Verified Interview Rounds</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero Cost to Start</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Floating Product Mockup Section ─────────────────────────────────── */}
        <section id="mockup" className="relative z-10 py-10 md:py-16">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative mx-auto rounded-3xl border border-border/80 bg-card p-3 sm:p-5 shadow-2xl shadow-indigo-500/10 shadow-inner-glow">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60 px-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-xs font-medium text-muted-foreground hidden sm:inline">
                    AI Placement Command Center · live preview
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    AI Agent Ready
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Card: Career Readiness Gauge */}
                <div className="lg:col-span-4 rounded-2xl border border-border/60 bg-muted/30 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Readiness Score
                    </span>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Top 10%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      88
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                    <span className="text-xs font-semibold text-indigo-500 ml-auto">
                      Tier 1 Ready
                    </span>
                  </div>

                  {/* Readiness Breakdown Bars */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>ATS Resume Strength</span>
                        <span className="font-semibold text-foreground">92%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full w-[92%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Technical Mock Interviews</span>
                        <span className="font-semibold text-foreground">85%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Skill Matrix Coverage</span>
                        <span className="font-semibold text-foreground">88%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full w-[88%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Card: Live AI Voice Interview Preview */}
                <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-muted/30 p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                          <Mic className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          Live Voice Mock Simulation
                        </span>
                      </div>
                      <span className="text-[10px] bg-red-500/10 text-red-500 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                        RECORDING
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background/90 p-3.5 space-y-2 text-xs">
                      <p className="font-semibold text-indigo-500">Interviewer AI:</p>
                      <p className="text-foreground leading-relaxed">
                        &quot;How does PostgreSQL handle concurrent updates with Multi-Version Concurrency Control (MVCC)?&quot;
                      </p>
                    </div>

                    {/* Audio Waveform visualization mockup */}
                    <div className="flex items-center justify-center gap-1 py-3">
                      {[40, 75, 20, 90, 60, 100, 45, 80, 30, 95, 65, 35, 85, 50, 70].map(
                        (h, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${h}%` }}
                            className="w-1.5 h-7 rounded-full bg-indigo-500/70"
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <p className="font-medium">
                      ✓ Instant Feedback: High clarity, accurate isolation level definition.
                    </p>
                  </div>
                </div>

                {/* Right Card: Semantic Job Match Feed */}
                <div className="lg:col-span-3 rounded-2xl border border-border/60 bg-muted/30 p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Target Matches
                    </span>
                    <span className="text-xs font-semibold text-indigo-500">Vector Rank</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-border/80 bg-background/90 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground">Stripe</h4>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          96% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Fullstack Software Engineer
                      </p>
                      <p className="text-[10px] font-semibold text-foreground">₹28 LPA · Remote</p>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-background/90 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground">Razorpay</h4>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          91% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Backend Systems Engineer
                      </p>
                      <p className="text-[10px] font-semibold text-foreground">₹18-22 LPA · Bengaluru</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Capabilities Bento Grid ────────────────────────────────────────── */}
        <section id="features" className="relative z-10 py-20 md:py-28">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                Comprehensive Career Suite
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mt-2 mb-4">
                Everything You Need to Get Hired
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Replaces disjointed mock tools, generic job boards, and guesswork with an integrated AI pipeline built specifically for campus and off-campus placements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-inner-glow space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    AI Voice Mock Interviews
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Interactive technical and behavioral interview sessions powered by Gemini. Real-time evaluation of clarity, code design, and depth.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-inner-glow space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Deep ATS Resume Analysis
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Scans keyword density, structural impact, metrics, and bullet effectiveness to ensure your resume sails past screening algorithms.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-inner-glow space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Semantic Job Matching
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Uses high-dimensional vector embeddings to compare your candidate profile against job requirements for true competency ranking.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-inner-glow space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Skill Gap Radar
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Identifies missing competencies and system design topics between your current profile and target job descriptions before applying.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-inner-glow space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <Map className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Personalized Career Roadmaps
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Generates step-by-step weekly milestone learning paths tailored to your placement timeline, dream company, and experience level.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-inner-glow space-y-4 hover:border-indigo-500/40 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Verified Interview Experiences
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Read and share authentic interview rounds, actual coding questions, preparation strategies, and verified compensation numbers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How It Works 3-Step Pipeline ───────────────────────────────────── */}
        <section id="how-it-works" className="relative z-10 py-16 md:py-24 border-y border-border/60 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                The Placement Strategy
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2 mb-3">
                How AI Placement Copilot Works
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From unverified resume to offer letter in three streamlined steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 relative shadow-inner-glow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Upload & Benchmark Profile
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Upload your resume to extract vector embeddings, compute baseline ATS score, and automatically discover your biggest skill gaps.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 relative shadow-inner-glow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Simulate & Upskill
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Practice voice mock interviews with live AI feedback. Follow personalized milestone roadmaps to bridge critical technical knowledge.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4 relative shadow-inner-glow">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Apply & Succeed
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Get matched with top tech openings, review peer interview experiences for your specific target role, and interview with total confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── High-Conversion CTA Banner ─────────────────────────────────────── */}
        <section className="relative z-10 py-20 md:py-28">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-background to-background p-8 sm:p-14 text-center shadow-2xl shadow-indigo-500/10 shadow-inner-glow space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Start Preparing Today</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
                Ready to Supercharge Your Placement Preparation?
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Join ambitious engineering candidates leveling up their interview skills with AI Placement Copilot. Free to start, no credit card required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm px-8 py-6 shadow-xl shadow-indigo-500/25"
                    >
                      Get Started Free →
                    </Button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm px-8 py-6 shadow-xl shadow-indigo-500/25"
                    >
                      Go to Dashboard →
                    </Button>
                  </Link>
                </SignedIn>

                <Link href="/experiences" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl border-border/80 text-foreground font-semibold text-sm px-8 py-6"
                  >
                    Read Peer Experiences
                  </Button>
                </Link>
              </div>

              <p className="text-[11px] text-muted-foreground/80 pt-2">
                Designed for students, job seekers, and recruiters · Instant activation
              </p>
            </div>
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="relative z-10 border-t border-border/60 bg-muted/20 py-12 text-xs text-muted-foreground">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-foreground text-sm">Placement Copilot</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Intelligent career readiness platform providing semantic matching, AI interviews, and placement transparency.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
                  Features
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/jobs" className="hover:text-foreground transition-colors">
                      Job Search
                    </Link>
                  </li>
                  <li>
                    <Link href="/interviews" className="hover:text-foreground transition-colors">
                      Mock Interviews
                    </Link>
                  </li>
                  <li>
                    <Link href="/resume" className="hover:text-foreground transition-colors">
                      Resume ATS Scanner
                    </Link>
                  </li>
                  <li>
                    <Link href="/career" className="hover:text-foreground transition-colors">
                      Career Roadmap
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
                  Community
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/experiences" className="hover:text-foreground transition-colors">
                      Interview Experiences
                    </Link>
                  </li>
                  <li>
                    <Link href="/skill-gap" className="hover:text-foreground transition-colors">
                      Skill Gap Analysis
                    </Link>
                  </li>
                  <li>
                    <Link href="/recruiter/dashboard" className="hover:text-foreground transition-colors">
                      Recruiter Portal
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
                  Platform
                </h4>
                <ul className="space-y-2">
                  <li>
                    <span className="text-muted-foreground">Built with Next.js 15 & Prisma</span>
                  </li>
                  <li>
                    <span className="text-muted-foreground">Powered by Gemini AI</span>
                  </li>
                  <li>
                    <span className="text-muted-foreground">Protected by Clerk RBAC</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/40 pt-6 text-[11px]">
              <p>© 2026 AI Placement Copilot. All rights reserved.</p>
              <p className="mt-2 sm:mt-0">Engineered for premier technical placement preparation.</p>
            </div>
          </div>
        </footer>
      </div>
    </ClerkProvider>
  );
}
