// Proxy route: /api/product-variants/[id]
// Forwards single-variant requests to Strapi using the variant's documentId.
// This proxy exists so the Strapi Bearer token never reaches the client bundle (ADR-001).
// This route also supports DELETE, allowing individual variants to be removed.

// Strapi base URL and auth token — loaded from server-side env vars only (no NEXT_PUBLIC_ prefix).
const STRAPI_API = process.env.BUSINESS_MANAGER_API;
const TOKEN = process.env.BUSINESS_MANAGER_TOKEN;

// Headers factory function (not a constant) to avoid sharing the same object reference across requests.
const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// GET /api/product-variants/[id]
// Fetches a single product variant by documentId. No searchParams forwarding — this endpoint
// is only called for a specific variant and doesn't need caller-controlled populate.
// `params` is a Promise in Next.js 15 App Router — must be awaited before destructuring.
// cache: 'no-store' prevents Next.js from caching — variant detail must always be fresh.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${STRAPI_API}/product-variants/${id}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// PUT /api/product-variants/[id]
// Updates an existing product variant. No populate param — variants are flat entities
// with no nested relations that need to be returned after an update.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/product-variants/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

// DELETE /api/product-variants/[id]
// Permanently deletes a product variant from Strapi. The Strapi response is forwarded as-is.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${STRAPI_API}/product-variants/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
