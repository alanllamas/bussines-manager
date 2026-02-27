import ClientPage from "./page-client";

export default async function Client({ params }: { params: Promise<{ id: string }> }) {
    // const id = useDynamicRouteParams('id')
  const id = (await params).id
  return <ClientPage id={id}/>
}