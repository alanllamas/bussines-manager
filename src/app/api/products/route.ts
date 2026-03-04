// Proxy route: /api/products
// Forwards requests to the Strapi `products` collection.
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

// GET /api/products
// Forwards all query params from the caller to Strapi, so the SWR hook controls
// filtering, pagination, and populate fields (e.g. product_variants).
// cache: 'no-store' prevents Next.js from caching — product list must always be fresh.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/products?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// POST /api/products
// Creates a new product in Strapi. No populate param — the creation response from Strapi
// returns the base product fields, which is sufficient for the post-creation flow.
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/products`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
