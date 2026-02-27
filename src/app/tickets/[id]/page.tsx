import ClientTicket from "./page-client";

export default async function Ticket({ params }: { params: Promise<{ id: number }> }) {
    // const id = useDynamicRouteParams('id')
  const id = (await params).id
  return <>
  
    <ClientTicket id={id}></ClientTicket>
  </>
}