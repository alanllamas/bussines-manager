import ClientTicket from "./page-client";

export default async function Ticket({ params }: { params: Promise<{ id: number }> }) {
    // const id = useDynamicRouteParams('id')
    // console.log('id: ', id);
  const id = (await params).id
  // console.log('id: ', id);
  return <>
  
    <ClientTicket id={id}></ClientTicket>
  </>
}