// /purchases/[id] — Server Component: awaita params.id (documentId string) → PurchasePage.
import PurchasePage from "./page-client"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PurchasePage id={id} />
}
