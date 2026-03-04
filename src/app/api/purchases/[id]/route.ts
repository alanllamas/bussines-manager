// Proxy route: /api/purchases/[id]
// Forwards single-purchase requests to Strapi using the purchase's documentId (Compra).
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/purchases/[id]
// Fetches a single purchase (Compra) by documentId. Forwards all query params so the caller
// can pass populate fields without this proxy needing to enumerate them.
// `params` is a Promise in Next.js 15 App Router — must be awaited before destructuring.
// cache: 'no-store' prevents Next.js from caching — purchase detail must always be fresh.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/purchases/${id}?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// PUT /api/purchases/[id]
// Updates an existing purchase (Compra). The explicit populate params return the nested supply
// line items with their related records in the response so the UI reflects the updated purchase
// without a separate GET.
// populate=supplies populates the supply line items array.
// populate=supplies.supply populates the supply (insumo) within each line item.
// populate=supplies.supply_variants populates the selected supply variants within each line item.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/purchases/${id}?populate=supplies&populate=supplies.supply&populate=supplies.supply_variants`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
