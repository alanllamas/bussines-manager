// Proxy route: /api/tickets/[id]
// Forwards single-ticket requests to Strapi using the ticket's documentId (UI: Nota).
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/tickets/[id]
// Fetches a single ticket (Nota) by documentId. Forwards all query params so the caller
// can pass populate fields (e.g. populate=products&populate=client) without this proxy
// needing to enumerate them.
// `params` is a Promise in Next.js 15 App Router — must be awaited before destructuring.
// cache: 'no-store' prevents Next.js from caching — ticket detail must always be fresh.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/tickets/${id}?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// PUT /api/tickets/[id]
// Updates an existing ticket (Nota). populate=* returns all related fields in the response
// so the UI can reflect the updated Nota (products, variants, client) without a separate GET.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/tickets/${id}?populate=*`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
