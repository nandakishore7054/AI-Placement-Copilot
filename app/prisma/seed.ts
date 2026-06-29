import { db } from "../src/lib/db";
import {
  UserRole,
  CompanyRole,
  JobLevel,
  JobType,
  InsightCategory,
} from "@prisma/client";

async function main() {
  console.log("🌱 Starting database seed...");

  // ─── Demo Admin User ──────────────────────────────────────────────────────
  // Note: The Clerk webhook creates real users. This seed creates a placeholder
  // for local development. Replace the ID with a real Clerk user ID.
  const adminUser = await db.user.upsert({
    where: { email: "admin@aiplacement.dev" },
    create: {
      id: "seed_admin_user_id",
      email: "admin@aiplacement.dev",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      onboardingDone: true,
    },
    update: {},
  });
  console.log("✅ Admin user:", adminUser.email);

  // ─── Demo Company ─────────────────────────────────────────────────────────
  const company = await db.company.upsert({
    where: { email: "tech@acme.dev" },
    create: {
      name: "Acme Technologies",
      email: "tech@acme.dev",
      description: "A leading technology company building the future.",
      industry: "Technology",
      size: "51-200",
      verified: true,
    },
    update: {},
  });
  console.log("✅ Demo company:", company.name);

  // ─── Demo Jobs ────────────────────────────────────────────────────────────
  const jobs = await Promise.all([
    db.job.upsert({
      where: { id: "seed_job_1" },
      create: {
        id: "seed_job_1",
        title: "Senior Frontend Engineer",
        description:
          "We are looking for a Senior Frontend Engineer to join our growing team. You will build and maintain our customer-facing React applications.",
        location: "Bangalore",
        category: "Software Development",
        level: JobLevel.SENIOR,
        type: JobType.FULL_TIME,
        salary: "25-40 LPA",
        isVisible: true,
        companyId: company.id,
      },
      update: {},
    }),
    db.job.upsert({
      where: { id: "seed_job_2" },
      create: {
        id: "seed_job_2",
        title: "Backend Engineer — Node.js",
        description:
          "Join our platform team to build scalable APIs and microservices. Experience with Node.js, TypeScript, and PostgreSQL required.",
        location: "Remote",
        category: "Software Development",
        level: JobLevel.INTERMEDIATE,
        type: JobType.REMOTE,
        salary: "15-25 LPA",
        isVisible: true,
        companyId: company.id,
      },
      update: {},
    }),
    db.job.upsert({
      where: { id: "seed_job_3" },
      create: {
        id: "seed_job_3",
        title: "ML Engineer — Generative AI",
        description:
          "Work on cutting-edge generative AI projects. Experience with Python, PyTorch, and LLMs required. You will fine-tune and deploy large language models.",
        location: "Hyderabad",
        category: "Machine Learning & AI",
        level: JobLevel.SENIOR,
        type: JobType.FULL_TIME,
        salary: "30-50 LPA",
        isVisible: true,
        companyId: company.id,
      },
      update: {},
    }),
    db.job.upsert({
      where: { id: "seed_job_4" },
      create: {
        id: "seed_job_4",
        title: "Product Manager",
        description:
          "We need an experienced Product Manager to define roadmaps and drive execution for our SaaS platform. 3+ years PM experience required.",
        location: "Mumbai",
        category: "Product Management",
        level: JobLevel.INTERMEDIATE,
        type: JobType.FULL_TIME,
        salary: "20-30 LPA",
        isVisible: true,
        companyId: company.id,
      },
      update: {},
    }),
    db.job.upsert({
      where: { id: "seed_job_5" },
      create: {
        id: "seed_job_5",
        title: "Frontend Intern — React",
        description:
          "6-month internship for students passionate about building beautiful UIs. Learn from senior engineers and work on real production features.",
        location: "Bangalore",
        category: "Software Development",
        level: JobLevel.BEGINNER,
        type: JobType.INTERNSHIP,
        salary: "15,000-25,000 INR/month",
        isVisible: true,
        companyId: company.id,
      },
      update: {},
    }),
  ]);
  console.log(`✅ ${jobs.length} demo jobs created`);

  // ─── Career Insights ──────────────────────────────────────────────────────
  const insights = await Promise.all([
    db.careerInsight.upsert({
      where: { id: "seed_insight_1" },
      create: {
        id: "seed_insight_1",
        category: InsightCategory.SKILL_DEMAND,
        title: "Generative AI Skills Are the #1 In-Demand Skill of 2025",
        content:
          "Prompt engineering, RAG pipelines, and LLM fine-tuning have seen a **340% YoY increase** in job postings. Companies across all sectors are hiring for AI-adjacent roles.\n\n**Top skills in demand:**\n- Prompt Engineering\n- LangChain / LlamaIndex\n- Vector Databases (pgvector, Pinecone)\n- Python + FastAPI\n- Gemini / GPT API integration",
        dataPoints: { growthRate: 340, jobPostings: 45000, avgSalary: "28 LPA" },
        source: "LinkedIn Jobs Report 2025",
        isPublished: true,
      },
      update: {},
    }),
    db.careerInsight.upsert({
      where: { id: "seed_insight_2" },
      create: {
        id: "seed_insight_2",
        category: InsightCategory.SALARY_INSIGHT,
        title: "Full-Stack Engineers Earning 40-60% More with TypeScript",
        content:
          "Developers proficient in **TypeScript + React + Node.js** command a significant salary premium over those using plain JavaScript. The type-safety ecosystem has become the industry standard.",
        dataPoints: {
          premiumPercentage: 47,
          avgSalaryJS: "14 LPA",
          avgSalaryTS: "21 LPA",
        },
        source: "Stack Overflow Developer Survey 2025",
        isPublished: true,
      },
      update: {},
    }),
    db.careerInsight.upsert({
      where: { id: "seed_insight_3" },
      create: {
        id: "seed_insight_3",
        category: InsightCategory.MARKET_TREND,
        title: "Remote-First Companies Now Offer 25% Higher Packages",
        content:
          "The shift to remote work has leveled compensation across geographies. Companies hiring remotely in India now match or exceed Bangalore office salaries to attract top talent.",
        dataPoints: {
          remotePremium: 25,
          topLocations: ["Remote", "Bangalore", "Hyderabad"],
        },
        source: "Naukri Salary Report 2025",
        isPublished: true,
      },
      update: {},
    }),
  ]);
  console.log(`✅ ${insights.length} career insights created`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nNext steps:");
  console.log("  1. Set up your .env.local with real credentials");
  console.log("  2. Run: npm run db:migrate");
  console.log("  3. Configure Clerk webhook at /api/webhooks/clerk");
  console.log("  4. Run: npm run dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
