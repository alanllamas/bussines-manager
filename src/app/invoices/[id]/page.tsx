import ClientInvoice from "./page-client";



export default async function Invoice({ params }: { params: Promise<{ id: number }> }) {
    // const id = useDynamicRouteParams('id')
    // console.log('id: ', id);
  const id = (await params).id
  console.log('id: ', id);
  return <>
  
    <ClientInvoice id={id}></ClientInvoice>
  </>
}