// Proxy route: /api/supply-variants/[id]
// Forwards single-variant requests to Strapi using the supply variant's documentId.
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/supply-variants/[id]
// Fetches a single supply variant by documentId. Forwards all query params so the caller
// can pass populate fields without this proxy needing to enumerate them.
// `params` is a Promise in Next.js 15 App Router — must be awaited before destructuring.
// cache: 'no-store' prevents Next.js from caching — variant detail must always be fresh.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/supply-variants/${id}?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// PUT /api/supply-variants/[id]
// Updates an existing supply variant. No populate param — supply variants are flat entities
// with no nested relations that need to be returned after an update.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/supply-variants/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
