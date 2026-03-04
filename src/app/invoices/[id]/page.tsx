// /invoices/[id] — Server Component: awaita params.id (numeric Strapi id) y lo pasa a ClientInvoice.
// Nota: id es numérico (no documentId) — coincide con lo que espera useGetInvoice(id).
import ClientInvoice from "./page-client";



export default async function Invoice({ params }: { params: Promise<{ id: number }> }) {
    // const id = useDynamicRouteParams('id')
  const id = (await params).id
  return <>
  
    <ClientInvoice id={id}></ClientInvoice>
  </>
}