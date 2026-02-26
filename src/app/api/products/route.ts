const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/products?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
