import PurchasePage from "./page-client"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PurchasePage id={id} />
}
