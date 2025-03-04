import ClientInvoicesByCLient from "./page-client";

export default async function InvoicesByCLient({ params }: { params: Promise<{ client: string }> }) {
    // const id = useDynamicRouteParams('id')
  const client = (await params).client
  console.log('client: ', client);
  return <ClientInvoicesByCLient  client={client} />
}