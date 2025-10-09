import { getFamilyMembersAction } from "@/actions/family-members";
import { getProvidersAction } from "@/actions/providers";
import { redirect } from "next/navigation";
import { HealthcarePageClient } from "./healthcare-page-client";

export default async function HealthcarePage() {
  // Fetch data from MongoDB
  const [familyMembersResult, providersResult] = await Promise.all([
    getFamilyMembersAction(),
    getProvidersAction(),
  ]);

  // Handle errors
  if (!familyMembersResult.success) {
    console.error("Failed to fetch family members:", familyMembersResult.error);
    redirect("/family");
  }

  const familyMembers = familyMembersResult.data || [];
  const providers = providersResult.success ? providersResult.data : [];

  if (!providersResult.success) {
    console.error("Failed to fetch providers:", providersResult.error);
    // Continue with empty providers instead of redirecting
  }

  return <HealthcarePageClient familyMembers={familyMembers} providers={providers} />;
}