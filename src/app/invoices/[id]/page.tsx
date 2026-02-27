import ClientInvoice from "./page-client";



export default async function Invoice({ params }: { params: Promise<{ id: number }> }) {
    // const id = useDynamicRouteParams('id')
  const id = (await params).id
  return <>
  
    <ClientInvoice id={id}></ClientInvoice>
  </>
}