const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/clients/${id}?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/clients/${id}?populate=*`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
