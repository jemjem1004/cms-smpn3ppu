import { getInstitutionalContent } from "@/actions/content"
import { ContentManager } from "@/components/admin/content-manager"

export const metadata = {
  title: "Manajemen Konten — Admin SMKN 1 Surabaya",
  description: "Kelola konten institusional website sekolah",
}

export default async function KontenPage() {
  const [heroResult, profileResult, principalResult, departmentResult] =
    await Promise.all([
      getInstitutionalContent("HERO"),
      getInstitutionalContent("PROFILE"),
      getInstitutionalContent("PRINCIPAL_MESSAGE"),
      getInstitutionalContent("DEPARTMENT"),
    ])

  return (
    <ContentManager
      heroContent={heroResult.success ? heroResult.data : null}
      profileContent={profileResult.success ? profileResult.data : null}
      principalContent={principalResult.success ? principalResult.data : null}
      departmentContent={departmentResult.success ? departmentResult.data : null}
    />
  )
}
