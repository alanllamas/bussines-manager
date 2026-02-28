// Proxy route: /api/invoices
// Forwards requests to the Strapi `invoices` collection (UI: Cortes).
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

// GET /api/invoices
// Forwards all query params from the caller to Strapi, so the SWR hook controls
// pagination, sorting, filtering by client, and populate fields (tickets, client, etc.).
// cache: 'no-store' prevents Next.js from caching — invoice list must always reflect latest data.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${STRAPI_API}/invoices?${searchParams.toString()}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const data = await res.json();
  // Forward Strapi's HTTP status as-is so the SWR hook can handle errors correctly.
  return Response.json(data, { status: res.status });
}

// POST /api/invoices
// Creates a new invoice (Corte). populate=* returns all related fields (client, tickets, etc.)
// in the response so the UI can display the newly created Corte without a separate GET.
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${STRAPI_API}/invoices?populate=*`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
