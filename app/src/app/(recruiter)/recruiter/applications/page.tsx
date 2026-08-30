import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RecruiterApplicationsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const params = await searchParams;
  if (params?.jobId) {
    redirect(`/recruiter/applicants?jobId=${params.jobId}`);
  }
  redirect("/recruiter/applicants");
}
