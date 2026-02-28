// Proxy route: /api/product-variants
// Forwards requests to the Strapi `product-variants` collection.
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).
// Product variants are the sellable configurations of a product (e.g. size, color).

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/product-variants
// Forwards all query params from the caller to Strapi, so the SWR hook controls
// filtering by product, pagination, and populate fields.
// cache: 'no-store' prevents Next.js from caching — variant list must always be fresh.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/product-variants?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// POST /api/product-variants
// Creates a new product variant in Strapi. No populate param — the creation response
// returns base variant fields, which is sufficient for the post-creation flow.
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/product-variants`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
