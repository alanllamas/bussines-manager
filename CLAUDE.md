# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # Start dev server with Turbopack
yarn build      # Production build
yarn lint       # Run ESLint (next lint)
npx tsc --noEmit  # Type-check without emitting
```

Package manager: **yarn** (do not use npm or pnpm).

No test setup exists in this project.

## Architecture

This is a **Next.js 15 App Router** business management app backed by a **Strapi** external API. Firebase handles authentication (Google OAuth only).

### Domain terminology

The UI uses Spanish business terms that differ from the code entity names:

| UI label | Code entity | Description |
|---|---|---|
| Notas | tickets | Sales receipts / work orders |
| Cortes | invoices | Billing summaries grouping multiple tickets |
| Clientes | clients | Customer records |

### Data flow

```
Browser → SWR hooks (src/api/hooks/) → Next.js API routes (src/app/api/) → Strapi external API
```

**Critical (ADR-001, completed):** The Strapi API token lives in `BUSINESS_MANAGER_TOKEN` (no `NEXT_PUBLIC_` prefix). SWR hooks call internal `/api/*` proxy routes, which add the token server-side. The token never reaches the client bundle. Do not call the Strapi API directly from client code.

### Environment variables

```
# Server-side only (Strapi)
BUSINESS_MANAGER_API=     # Strapi base URL (e.g. https://your-instance.com/api)
BUSINESS_MANAGER_TOKEN=   # Strapi Bearer token — server-side only

# Client-side (Firebase)
NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### Page structure convention

Each route follows a two-file pattern:
- `page.tsx` — Server component (thin shell, minimal logic)
- `page-client.tsx` — `'use client'` component with SWR hooks, state, and rendering

### Key directories

```
src/
  app/
    api/                  # Next.js proxy routes (clients, invoices, tickets, products)
      [resource]/route.ts # GET + POST handlers; [id]/route.ts for GET + PUT
    context/
      AuthUserContext.tsx  # Firebase auth context + useAuth() hook
    clients/              # /clients route and sub-pages
    invoices/             # /invoices route and sub-pages
    tickets/              # /tickets route and sub-pages
  api/
    fetcher/              # fetch wrapper (fetcher, serverFetcher, blobFetcher)
    hooks/                # SWR hooks organized by domain (clients/, invoices/, tickets/)
    types/                # Shared TS types (note: domain types are still in the hooks files)
    utils/                # Constants and helper functions
  components/
    forms/                # ClientForm, InvoicesForm, ticketsForm
    invoices/             # InvoiceList, InvoiceListByClient, invoice format components
    tickets/              # ticketList, ticket format components
  lib/
    firebase.js           # Firebase app + auth initialization
```

### Authentication

`AuthUserContext.tsx` wraps the app, exposing `useAuth()` which returns `{ user, signIn, logOut }`. Multiple page-client files use `setInterval` + `window.location` for auth redirect guards — this pattern is known-broken and being replaced (see ADR-002).

### Printing

Invoice and ticket print formats use `react-to-print`. Each has a separate `*PrintFormat.tsx` component distinct from the screen display format.

### Pending technical work

`docs/optimization-proposals.md` contains 13 ADRs tracked in priority order. ADR-001 is complete (server-side token). When adding features, consult this document to avoid working against planned refactors. Key pending items:

- **ADR-002**: Replace `setInterval` auth redirect with `useAuthGuard` hook (depends on ADR-003)
- **ADR-003**: Create `src/types/` with shared interfaces; eliminate `any` and `@ts-expect-error`
- **ADR-005**: Extract `generateResume()` fiscal logic from `getInvoice.ts` into `src/api/services/`
- **ADR-013**: Bug — invoice edit form does not pre-select already-associated tickets
