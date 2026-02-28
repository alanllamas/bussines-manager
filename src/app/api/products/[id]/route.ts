// Proxy route: /api/products/[id]
// Forwards single-product requests to Strapi using the product's documentId.
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).
// This route also supports DELETE, unlike most other proxy routes.

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/products/[id]
// Fetches a single product by documentId. Forwards all query params so the caller
// can pass populate fields (e.g. populate=product_variants) without this proxy
// needing to enumerate them.
// `params` is a Promise in Next.js 15 App Router — must be awaited before destructuring.
// cache: 'no-store' prevents Next.js from caching — product detail must always be fresh.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/products/${id}?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// PUT /api/products/[id]
// Updates an existing product. No populate param — the update response returns base product
// fields only, which is sufficient; variants are managed separately via /api/product-variants.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/products/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

// DELETE /api/products/[id]
// Permanently deletes a product from Strapi. The Strapi response for DELETE is forwarded
// as-is — typically a 200 with the deleted entry or a 204 with no body.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${STRAPI_API}/products/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
