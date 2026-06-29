"use client";

import { StudentProfileForm } from "@/components/student/profile-form";
import { updateStudentProfile } from "@/actions/student-profile";
import type { StudentProfile } from "@prisma/client";
import type { UpdateStudentProfileInput } from "@/schemas/student-profile";

interface StudentProfilePageClientProps {
  profile: StudentProfile | null;
  userId: string;
}

export function StudentProfilePageClient({
  profile,
}: StudentProfilePageClientProps) {
  async function handleSubmit(data: UpdateStudentProfileInput) {
    await updateStudentProfile(data);
  }

  if (!profile) {
    return (
      <div className="p-8 text-center border rounded-2xl bg-muted/20">
        <h2 className="font-semibold mb-2">No Profile Found</h2>
        <p className="text-sm text-muted-foreground">
          Please complete onboarding first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border bg-card">
      <StudentProfileForm
        mode="edit"
        profile={profile}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
