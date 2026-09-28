import { redirect } from "next/navigation";

// Until Phase 6 Step 2 (Career Roadmap) is implemented, /career directs to Skill Gap Analysis
export default function CareerPage() {
  redirect("/skill-gap");
}
