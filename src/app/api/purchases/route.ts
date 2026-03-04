// Proxy route: /api/purchases
// Forwards requests to the Strapi `purchases` collection (Compras / Gastos).
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).
// All client-side SWR hooks call this route instead of Strapi directly.

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/purchases
// Forwards all query params from the caller to Strapi, so the SWR hook controls
// filtering by status or date, pagination, and populate fields.
// cache: 'no-store' prevents Next.js from caching — purchase list must always reflect latest data.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/purchases?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// POST /api/purchases
// Creates a new purchase (Compra). The explicit populate params return the nested supply
// line items with their related supply and supply_variant records in the response,
// so the UI can display the full purchase breakdown without a separate GET.
// populate=supplies populates the supply line items array.
// populate=supplies.supply populates the supply (insumo) within each line item.
// populate=supplies.supply_variants populates the selected supply variants within each line item.
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/purchases?populate=supplies&populate=supplies.supply&populate=supplies.supply_variants`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
