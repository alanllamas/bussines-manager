// /products/[id] — Server Component: awaita params.id (documentId string) → ProductPage.
import ProductPage from "./page-client"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductPage id={id} />
}
