// /supplies/[id] — Server Component: awaita params.id (documentId string) → SupplyPage.
import SupplyPage from "./page-client"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SupplyPage id={id} />
}
