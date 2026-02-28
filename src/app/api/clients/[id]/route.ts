// Proxy route: /api/clients/[id]
// Forwards single-client requests to Strapi using the client's documentId.
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/clients/[id]
// Fetches a single client by documentId. Forwards all query params so the caller
// can pass populate fields (e.g. populate=contacts&populate=taxing_info) without
// this proxy needing to enumerate them.
// `params` is a Promise in Next.js 15 App Router — must be awaited before destructuring.
// cache: 'no-store' prevents Next.js from caching the response — client data must always be fresh.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/clients/${id}?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// PUT /api/clients/[id]
// Updates an existing client. populate=* returns all related fields in the response
// so the UI can reflect the updated client without a separate GET call.
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
