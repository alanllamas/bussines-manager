# ADR-003 — Definir tipos TypeScript globales y eliminar `any`

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** — (fundación para todos los ADRs siguientes)

## Contexto

El proyecto tiene más de 10 instancias de `@ts-expect-error` y múltiples componentes declarados como `React.FC<any>`. Esto anula la protección que ofrece TypeScript. Los tipos de dominio están dispersos en `src/api/hooks/` sin un lugar central.

Patrones encontrados:
```typescript
// Contexto sin tipo
const AuthContext = createContext(); // @ts-expect-error

// Componentes sin tipo
const InvoiceList: React.FC<any> = ({ ... })
const ticketsForm: React.FC<any> = ({ ... })

// Funciones sin tipo
const generateCard = (contact: any, i: number) => { ... }
```

## Decisión propuesta

Crear `src/types/` con interfaces compartidas que el resto de ADRs usará como base:

```typescript
// src/types/index.ts
export interface Client { id: string; name: string; rfc?: string; contacts?: Contact[] }
export interface Ticket { id: string; date: string; products: Product[]; subtotal: number; total: number }
export interface Invoice { id: string; client: Client; tickets: string[]; date: string }
export interface Product { name: string; price: number; quantity: number; taxes?: number }

// src/types/auth.ts
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## Consecuencias

- Errores de tipo detectados en tiempo de compilación
- Requiere refactor en todos los componentes que usan `any`
- Habilita autocompletado correcto en el editor

## Pasos de implementación

1. Auditar los tipos existentes dispersos en `src/api/hooks/` y consolidarlos sin duplicar.
2. Crear `src/types/index.ts` con las interfaces de dominio: `Client`, `Contact`, `Ticket`, `Product`, `Invoice`, `Resume`, `Totals`.
3. Crear `src/types/auth.ts` con `AuthContextType` y el tipo `User` extendido de Firebase (incluyendo `displayName` y `photoURL`).
4. Actualizar `AuthUserContext.tsx`:
   - Importar `AuthContextType` desde `src/types/auth.ts`.
   - Reemplazar `createContext()` con `createContext<AuthContextType | undefined>(undefined)`.
   - Agregar `isLoading` al contexto.
   - Eliminar el comentario `@ts-expect-error`.
5. Actualizar cada componente con `React.FC<any>`:
   - `InvoiceList.tsx` → `InvoiceListProps`
   - `ticketsForm.tsx` → `TicketFormProps`
   - `InvoicesForm.tsx` → `InvoicesFormProps`
   - `InvoiceListByClient.tsx` → `InvoiceListByClientProps`
   - `ticketFormat.tsx` → `TicketFormatProps`
   - `ClientForm.tsx` → `ClientFormProps`
6. Reemplazar `contact: any` en `ContactsTab.tsx` con el tipo `Contact`.
7. Reemplazar `data: any` en `generateCell` con `string | number | boolean | null`.
8. Ejecutar `npx tsc --noEmit` y resolver todos los errores que surjan.
9. Activar `"strict": true` en `tsconfig.json` si no está activo y resolver errores adicionales.
