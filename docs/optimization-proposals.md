# Optimization Proposals — Business Manager

> Revisión técnica: 2026-02-25
> Rama base analizada: `develop`
> Formato: Architecture Decision Record (ADR)

Los ADRs están ordenados por orden de ejecución recomendado. Dentro de cada nivel de prioridad se respetan las dependencias: un ADR no debe iniciarse hasta que los anteriores del mismo nivel estén completos, ya que sus artefactos (tipos, hooks, componentes) son insumos de los siguientes.

---

## Crítica

---

### ADR-001 — Mover token de autenticación a variables de entorno privadas

**Estado:** Completado
**Prioridad:** Crítica
**Depende de:** —

#### Contexto

El token de la API se expone con el prefijo `NEXT_PUBLIC_`, lo que lo hace visible en el bundle del cliente. Cualquier usuario puede extraerlo desde las herramientas de desarrollo del navegador.

```typescript
// src/api/hooks/clients/getClients.ts
const token = `Bearer ${process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN}`
```

#### Decisión propuesta

Mover las llamadas autenticadas a API Routes de Next.js (`src/app/api/`) que actúen como proxy. El token se guarda en variable de entorno sin prefijo `NEXT_PUBLIC_` y solo existe en el servidor.

#### Consecuencias

- El token nunca llega al cliente
- Requiere crear rutas intermedias en `/api/`
- Agrega una capa de latencia mínima (servidor Next.js → API externa)

#### Pasos de implementación

1. En el archivo `.env.local`, renombrar `NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN` → `BUSINESS_MANAGER_TOKEN` (sin prefijo).
2. Crear las API Routes proxy en `src/app/api/`:
   - `src/app/api/clients/route.ts`
   - `src/app/api/invoices/route.ts`
   - `src/app/api/tickets/route.ts`

   Cada route leerá `process.env.BUSINESS_MANAGER_TOKEN` (server-side) y hará el fetch a la API externa, retornando el resultado.
3. Actualizar cada hook SWR en `src/api/hooks/` para que apunte a las rutas internas (`/api/clients`, `/api/invoices`, etc.) en lugar de a la URL externa.
4. Eliminar todas las referencias a `process.env.NEXT_PUBLIC_BUSINESS_MANAGER_TOKEN` del código cliente.
5. Agregar la nueva variable al archivo `.env.example` (sin valor) para documentarla.
6. Verificar en el bundle de producción (`next build`) que el token no aparezca en los archivos generados en `.next/static/`.

---

### ADR-002 — Centralizar guardia de autenticación en un custom hook

**Estado:** Pendiente
**Prioridad:** Crítica
**Depende de:** ADR-003 (requiere `isLoading` en `AuthContext`, que se define al tipar el contexto)

#### Contexto

La lógica de redirección cuando no hay usuario autenticado está duplicada en al menos 5 archivos con variaciones en los tiempos de intervalo (100ms, 500ms, 1000ms). El patrón de `setInterval` + `clearInterval` dentro de `useEffect` es propenso a memory leaks.

Archivos afectados:
- `src/app/invoices/page-client.tsx`
- `src/app/tickets/page-client.tsx`
- `src/app/clients/components/sidebar.tsx`
- `src/app/invoices/[id]/page-client.tsx`
- `src/app/tickets/[id]/page-client.tsx`

#### Decisión propuesta

Crear `src/hooks/useAuthGuard.ts` con lógica centralizada de redirección usando el router de Next.js en lugar de `window.location`.

```typescript
export function useAuthGuard(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  return { isAuthenticated: !!user, isLoading };
}
```

#### Consecuencias

- Elimina ~50 líneas duplicadas repartidas en 5 archivos
- Comportamiento de redirección consistente
- Uso de `router.replace` evita entradas espurias en el historial del navegador

#### Pasos de implementación

1. Crear el directorio `src/hooks/` si no existe.
2. Crear el archivo `src/hooks/useAuthGuard.ts` con la implementación mostrada.
3. Verificar que `AuthUserContext` exponga `isLoading` (queda tipado en ADR-003). Si ADR-003 aún no está completo, agregar el campo `isLoading` al contexto como paso previo mínimo.
4. En cada uno de los 5 archivos afectados:
   - Eliminar los dos `useEffect` de redirección existentes.
   - Eliminar los estados `interval` / `setinterval` relacionados.
   - Agregar `const { isLoading } = useAuthGuard()` al inicio del componente.
   - Si el componente mostraba un spinner mientras redirigía, reemplazarlo con `if (isLoading) return <LoadingScreen />`.
5. Probar manualmente accediendo a cada ruta sin sesión activa y confirmar que redirige correctamente.
6. Probar que al iniciar sesión no queda ningún intervalo activo (verificar en DevTools → Performance → Memory).

---

## Alta

---

### ADR-003 — Definir tipos TypeScript globales y eliminar `any`

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** — (fundación para todos los ADRs siguientes)

#### Contexto

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

#### Decisión propuesta

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

#### Consecuencias

- Errores de tipo detectados en tiempo de compilación
- Requiere refactor en todos los componentes que usan `any`
- Habilita autocompletado correcto en el editor

#### Pasos de implementación

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

---

### ADR-004 — Agregar Error Boundary y manejo de errores centralizado

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (los tipos de error deben estar definidos antes de tipar el contexto de auth con `authError`)

#### Contexto

No hay manejo de errores en:
- `onAuthStateChanged` en `AuthUserContext.tsx` — si Firebase falla, la app queda en estado desconocido
- El fetcher (`src/api/fetcher/index.ts`) no tiene try-catch global
- Los hooks de datos no validan que `url` o `token` existan antes de hacer fetch
- Los errores al usuario se muestran como texto estático sin información útil

#### Decisión propuesta

1. Crear `src/components/ErrorBoundary.tsx` (class component de React)
2. Agregar archivo `src/app/error.tsx` para errores a nivel de ruta (Next.js App Router)
3. Envolver `onAuthStateChanged` con try-catch
4. Validar en el fetcher que los parámetros requeridos no estén vacíos

#### Consecuencias

- Errores en un módulo no derrumban toda la app
- El usuario ve mensajes útiles en lugar de pantalla en blanco
- Facilita el diagnóstico en producción

#### Pasos de implementación

1. Crear `src/components/ErrorBoundary.tsx` como class component con `componentDidCatch` y `getDerivedStateFromError`. El fallback debe mostrar un mensaje amigable con botón para recargar.
2. Crear `src/app/error.tsx` con la firma de Next.js App Router (`'use client'`, props `error` y `reset`). Este archivo actúa como Error Boundary automático para toda la aplicación.
3. Crear `src/app/loading.tsx` si no existe, para mostrar un indicador de carga durante la navegación.
4. En `AuthUserContext.tsx`:
   - Envolver el callback de `onAuthStateChanged` con try-catch.
   - En el catch, guardar el error en un estado `authError` y exponerlo en el contexto.
5. En `src/api/fetcher/index.ts`:
   - Agregar validación al inicio: si `input` está vacío, lanzar un error descriptivo.
   - Verificar que `response.ok` sea `true` antes de parsear; si no, lanzar un `Error` con el status HTTP.
6. En los hooks SWR (`getClients.ts`, `getInvoice.ts`, etc.):
   - Agregar una guarda al inicio: si `url` o `token` están vacíos, retornar `null` (SWR ignora keys `null` y no hace fetch).
7. Reemplazar las pantallas de error estáticas en `page-client.tsx` de cada módulo con los estados de error de SWR o con el componente `ErrorBoundary`.

---

### ADR-005 — Mover `generateResume` a una capa de servicios

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (los tipos `Ticket`, `Client`, `Resume`, `Totals` deben estar definidos)

#### Contexto

`generateResume()` en `src/api/hooks/invoices/getInvoice.ts` contiene ~80 líneas de lógica fiscal (cálculo de impuestos, agrupación de productos, totales). Esta lógica vive dentro de un hook de React, mezclando cómputo puro con gestión de estado, lo que la hace imposible de testear sin montar componentes.

#### Decisión propuesta

Crear `src/api/services/invoiceService.ts` con funciones puras:

```typescript
export function buildInvoiceResume(ticketIds: string[], tickets: Ticket[], client?: Client): Resume { ... }
export function calculateTotals(resume: Resume): Totals { ... }
export function applyTaxes(amount: number, taxRate: number): number { ... }
```

#### Consecuencias

- Las funciones de cálculo se pueden testear unitariamente
- El hook queda como orquestador, no como contenedor de lógica
- Facilita reutilizar los cálculos desde múltiples puntos

#### Pasos de implementación

1. Crear el directorio `src/api/services/`.
2. Crear `src/api/services/invoiceService.ts`:
   - Copiar el cuerpo de `generateResume()` y dividirlo en funciones puras con nombres descriptivos: `groupProductsByTicket`, `applyTaxes`, `calculateTotals`, `buildInvoiceResume`.
   - Cada función debe tener tipos explícitos en argumentos y retorno, usando las interfaces de ADR-003.
   - No importar nada de React dentro de este archivo.
3. Crear `src/api/services/index.ts` que re-exporte las funciones del servicio.
4. En `src/api/hooks/invoices/getInvoice.ts`:
   - Eliminar la función `generateResume`.
   - Importar `buildInvoiceResume` desde el servicio.
   - Ajustar las llamadas existentes.
5. En `InvoicesForm.tsx` y cualquier otro componente que llame directamente a `generateResume`, reemplazar la llamada por la función del servicio.
6. (Opcional pero recomendado) Crear `src/api/services/invoiceService.test.ts` con casos básicos: cálculo sin impuestos, con impuestos, con productos agrupados.

---

### ADR-006 — Crear custom hook `usePaginatedData`

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipado genérico)

#### Contexto

La lógica de paginación con `react-paginate` es idéntica en tres componentes. Cualquier cambio (ej. items por página) requiere editar tres archivos.

#### Decisión propuesta

```typescript
// src/hooks/usePaginatedData.ts
export function usePaginatedData<T>(data: T[], itemsPerPage = 10) {
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => { setItemOffset(0) }, [data.length]);

  const currentItems = data.slice(itemOffset, itemOffset + itemsPerPage);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setItemOffset((selected * itemsPerPage) % data.length);
  };

  return { currentItems, pageCount, handlePageChange };
}
```

#### Consecuencias

- Elimina ~60 líneas duplicadas
- El reset automático de página evita desfases tras filtrar datos
- Comportamiento de paginación consistente entre módulos

#### Pasos de implementación

1. Crear `src/hooks/usePaginatedData.ts` con la implementación mostrada.
2. En `InvoiceList.tsx`:
   - Eliminar las variables locales `itemOffset`, `endOffset`, `currentItems`, `pageCount` y el handler `handlePageChange`.
   - Sustituir por `const { currentItems, pageCount, handlePageChange } = usePaginatedData(invoices)`.
3. Repetir el paso 2 en `InvoiceListByClient.tsx` y en `ticketList.tsx`.
4. Verificar que el componente `ReactPaginate` siga recibiendo `pageCount` y `onPageChange` correctamente en los tres archivos.

---

### ADR-007 — Crear componentes UI reutilizables

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos de props), ADR-006 (`DataTable` usa `usePaginatedData` internamente)

#### Contexto

Tres patrones se repiten sin abstracción:

1. **Dialog/Modal** — mismo JSX de `@headlessui/react` en `InvoicesForm.tsx` y `ticketsForm.tsx`
2. **Tabla paginada** — lógica de `react-paginate` duplicada en `InvoiceList.tsx`, `InvoiceListByClient.tsx` y `ticketList.tsx`
3. **Botones de acción** — editar/imprimir inline en múltiples tablas

#### Decisión propuesta

Crear directorio `src/components/ui/` con:

| Componente | Propósito |
|---|---|
| `FormDialog.tsx` | Wrapper de Dialog con título, submit y cancel |
| `DataTable.tsx` | Tabla genérica con paginación integrada |
| `ActionButtons.tsx` | Botones editar / imprimir / eliminar |
| `TabContainer.tsx` | Wrapper de TabGroup de Headlessui |

#### Consecuencias

- Reduce ~200 líneas de código repetido
- Cambios de UI se aplican en un solo lugar
- Los componentes actuales requieren refactor gradual

#### Pasos de implementación

1. Crear el directorio `src/components/ui/`.
2. Crear `FormDialog.tsx`:
   - Extraer el JSX de `Dialog` / `DialogPanel` de `InvoicesForm.tsx` como base.
   - Definir props: `isOpen`, `onClose`, `title`, `children`, `onSubmit?`, `submitLabel?`, `cancelLabel?`.
   - Reemplazar el Dialog en `InvoicesForm.tsx` y en `ticketsForm.tsx` con el nuevo componente.
3. Crear `ActionButtons.tsx`:
   - Revisar los botones de editar/imprimir en `InvoiceList.tsx` y `ticketList.tsx`.
   - Definir props: `onEdit?`, `onPrint?`, `onDelete?`.
   - Reemplazar los botones inline en ambas tablas.
4. Crear `DataTable.tsx`:
   - El componente recibe `columns`, `data` (array genérico) y `itemsPerPage?`.
   - Internamente usa `usePaginatedData` (ADR-006) para gestionar la paginación.
   - Reemplazar las tablas en `InvoiceList.tsx`, `InvoiceListByClient.tsx` y `ticketList.tsx`.
5. Crear `TabContainer.tsx`:
   - Extraer el patrón de `TabGroup` / `TabList` / `TabPanels` de `ClientTabs.tsx`.
   - Definir props: `tabs: { label: string; content: ReactNode }[]`.
   - Reemplazar el uso actual en `ClientTabs.tsx`.
6. Crear `src/components/ui/index.ts` que re-exporte todos los componentes del directorio.

---

### ADR-008 — Refactorizar InvoiceList separando responsabilidades

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos), ADR-005 (servicios), ADR-006 (paginación), ADR-007 (componentes UI)

#### Contexto

`src/components/invoices/InvoiceList.tsx` concentra 14 estados locales, lógica de paginación, lógica de formulario y lógica de impresión en un solo componente. Es el ADR de mayor alcance porque integra todos los artefactos creados anteriormente.

```typescript
// 14 useState en un solo componente
const [totals, setTotals] = useState<Totals>({...})
const [resume, setResume] = useState<Resume>()
const [clients, setClients] = useState<Client[]>([])
const [tickets, setTickets] = useState<Ticket[]>([])
// ... 10 más
```

#### Decisión propuesta

Dividir en:
- `InvoiceTable.tsx` — renderizado de filas + columnas (usa `DataTable` de ADR-007)
- `InvoiceFormContainer.tsx` — manejo de estado del formulario de creación/edición
- `InvoicePrintContainer.tsx` — manejo de impresión
- `useInvoiceList.ts` — estado consolidado vía `useReducer`

#### Consecuencias

- Cada pieza es testeable de forma aislada
- Requiere refactor significativo (~400 líneas)
- Mejora el time-to-paint inicial al poder lazy-load el formulario

#### Pasos de implementación

1. Crear una rama `refactor/invoice-list` para aislar los cambios.
2. Crear `src/hooks/useInvoiceList.ts`:
   - Definir `InvoiceListState` agrupando los 14 estados actuales (usar tipos de ADR-003).
   - Implementar `useReducer` con acciones: `SET_INVOICES`, `SET_EDIT`, `SET_CREATE`, `SET_PRINT`, `SET_TOTALS`, `SET_RESUME`, `RESET_FORM`.
   - Mover ahí toda la lógica de carga de datos (efectos de SWR).
   - Retornar estado y dispatchers tipados.
3. Crear `src/components/invoices/InvoiceTable.tsx`:
   - Extraer únicamente el JSX de la tabla.
   - Recibir por props: `invoices`, `onEdit`, `onPrint`.
   - Usar `DataTable` de ADR-007.
4. Crear `src/components/invoices/InvoiceFormContainer.tsx`:
   - Extraer el bloque de apertura/cierre del formulario y la llamada a `InvoicesForm`.
   - Recibir por props los valores del estado del hook y los dispatchers.
5. Crear `src/components/invoices/InvoicePrintContainer.tsx`:
   - Extraer el bloque condicional de impresión y la referencia de `useReactToPrint`.
   - Recibir `printInvoice` y `onDone` por props.
6. Reescribir `InvoiceList.tsx` para que solo orqueste los tres nuevos componentes usando el hook.
7. Verificar que el flujo completo (crear, editar, imprimir) funcione correctamente antes de mergear la rama.

---

## Media

---

### ADR-009 — Consolidar configuración de Firebase y validar credenciales al iniciar

**Estado:** Pendiente
**Prioridad:** Media
**Depende de:** — (independiente, se puede hacer en paralelo con los ADRs de Alta)

#### Contexto

`src/lib/firebase.js` contiene lógica para limpiar comillas de variables de entorno, lo que sugiere que las variables están siendo leídas con comillas extras (posible problema en el `.env`). No hay validación de que todas las keys necesarias estén presentes.

```javascript
// Workaround actual — señal de un problema subyacente
Object.keys(firebaseCredentials).forEach((key) => {
  const configValue = firebaseCredentials[key] + "";
  if (configValue.charAt(0) === '"') {
    firebaseCredentials[key] = configValue.substring(1, configValue.length - 1);
  }
});
```

#### Decisión propuesta

1. Corregir el `.env` para que no incluya comillas en los valores
2. Convertir `firebase.js` a `firebase.ts`
3. Agregar validación de configuración al inicio

#### Consecuencias

- Errores de configuración fallan en startup, no silenciosamente en runtime
- Elimina el workaround de limpieza de comillas
- Migración a TypeScript del módulo base

#### Pasos de implementación

1. Abrir `.env.local` y verificar si los valores de Firebase tienen comillas extras (ej. `NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY="abc123"`). Si las tienen, removerlas.
2. Probar que la app sigue funcionando sin las comillas. Si funciona, el workaround ya no es necesario.
3. Renombrar `src/lib/firebase.js` → `src/lib/firebase.ts`.
4. Reemplazar el bloque de limpieza de comillas con una función de validación:
   ```typescript
   const requiredKeys = ['apiKey', 'authDomain', 'projectId'] as const;
   requiredKeys.forEach(key => {
     if (!firebaseCredentials[key]) {
       throw new Error(`Firebase config missing: ${key}`);
     }
   });
   ```
5. Actualizar todos los imports de `firebase.js` a `firebase` (sin extensión).
6. Verificar que TypeScript no genere errores nuevos en el archivo convertido.
7. Actualizar `.env.example` documentando las tres variables requeridas.

---

### ADR-010 — Limpiar `console.log` y crear una utilidad de logging

**Estado:** Pendiente
**Prioridad:** Media
**Depende de:** — (independiente, pero es más limpio hacerlo después de los refactors grandes)

#### Contexto

Múltiples `console.log` quedaron en código de producción:
- `src/app/clients/[id]/page.tsx`
- `src/components/forms/ticketsForm.tsx`
- `src/api/hooks/invoices/getInvoice.ts`

#### Decisión propuesta

Agregar regla de ESLint `no-console` en nivel `warn` y crear una utilidad:

```typescript
// src/utils/logger.ts
const logger = {
  info: (...args: unknown[]) => process.env.NODE_ENV !== 'production' && console.log(...args),
  error: (...args: unknown[]) => console.error(...args),
};
export default logger;
```

#### Consecuencias

- Logs no llegan a consola en producción
- Errores reales siguen siendo visibles
- Regla de ESLint detecta logs nuevos antes del commit

#### Pasos de implementación

1. Crear `src/utils/logger.ts` con la implementación mostrada.
2. En `eslint.config.mjs`, agregar la regla `'no-console': 'warn'`.
3. Buscar todas las ocurrencias de `console.log` en el proyecto y reemplazarlas por `logger.info(...)`.
4. Las ocurrencias de `console.error` para errores reales reemplazarlas por `logger.error(...)`.
5. Eliminar las líneas comentadas `// console.log(...)` en todos los archivos.
6. Ejecutar `next build` y confirmar que no aparecen logs en la salida de producción.

---

### ADR-011 — Agregar memoización en componentes de lista

**Estado:** Pendiente
**Prioridad:** Media
**Depende de:** ADR-008 (debe hacerse después del refactor de `InvoiceList` para no memoizar código que va a cambiar)

#### Contexto

Los componentes de lista (`InvoiceList`, `ticketList`, `ContactsTab`) se re-renderizan completamente cuando cambia cualquier estado del padre, incluso cuando sus props no cambiaron. Las funciones auxiliares definidas dentro del cuerpo del componente se recrean en cada render.

#### Decisión propuesta

- Envolver con `React.memo()` los componentes de lista
- Usar `useCallback` en handlers que se pasan como props
- Usar `useMemo` para cálculos derivados (ej. filtrado de tickets por fecha)

#### Consecuencias

- Menos re-renders en interacciones frecuentes (paginación, búsqueda)
- Pequeño overhead de comparación de props (despreciable para estos tamaños de datos)

#### Pasos de implementación

1. Instalar React DevTools en el navegador y activar "Highlight updates when components render" para identificar re-renders antes y después.
2. En `ContactsTab.tsx`:
   - Envolver el componente con `export default React.memo(ContactsTab)`.
   - Extraer `generateCard` fuera del cuerpo del componente (es una función pura).
3. En `InvoiceTable.tsx` (resultado de ADR-008):
   - Envolver con `React.memo`.
   - Envolver los handlers `onEdit` y `onPrint` con `useCallback` en el componente padre.
4. En `ticketList.tsx`:
   - Envolver con `React.memo`.
   - Identificar handlers pasados como prop y envolverlos con `useCallback` en el padre.
5. En `InvoicesForm.tsx`, extraer los `onChange` de `DatePicker` a funciones con `useCallback`:
   ```typescript
   const handleInitialDateChange = useCallback((e) => {
     const initial_date = new Date(new Date(e).setHours(0, 0, 0, 0));
     setFieldValue("initial_date", initial_date);
   }, [setFieldValue]);
   ```
6. Reemplazar el `setTimeout` del cálculo de tickets filtrados con un `useMemo` que dependa de las fechas seleccionadas.
7. Validar con React DevTools que los componentes memoizados ya no re-renderizan al cambiar estados del padre que no afectan sus props.

---

## Baja

---

### ADR-012 — Eliminar imports comentados y código muerto

**Estado:** Pendiente
**Prioridad:** Baja
**Depende de:** ADR-008 (esperar a que los refactors principales eliminen imports que ya no se usan)

#### Contexto

Varios archivos tienen imports comentados que el historial de git ya preserva:

```typescript
// import { useAuth } from "@/context/AuthUserContext";   // page-client.tsx
// import { useRouter } from "next/navigation";            // múltiples archivos
```

`src/lib/useFirebaseAuth.jsx` no se importa en ningún archivo del proyecto.

#### Decisión propuesta

- Remover todos los imports comentados
- Eliminar `useFirebaseAuth.jsx`
- Activar ESLint `no-unused-vars`

#### Consecuencias

- Menor ruido en el código
- ESLint previene que se acumulen imports muertos en el futuro

#### Pasos de implementación

1. Confirmar con un grep que `useFirebaseAuth` no se importa en ningún archivo del proyecto.
2. Eliminar `src/lib/useFirebaseAuth.jsx`.
3. En cada `page-client.tsx` de los módulos `clients`, `invoices` y `tickets`, eliminar los bloques de imports comentados.
4. En `eslint.config.mjs`, asegurarse de que `@typescript-eslint/no-unused-vars` esté activada con nivel `error` o `warn`.
5. Ejecutar `next lint` y resolver cualquier variable o import no utilizado que reporte.
6. Hacer un grep global de `// import` para confirmar que no queda ninguno pendiente.

### ADR-013 — Corregir visualización de notas en el formulario de cortes

**Estado:** Pendiente
**Prioridad:** Baja
**Depende de:** —

#### Contexto

En la aplicación, los **cortes** corresponden a invoices (`InvoicesForm.tsx`, `InvoiceList.tsx`) y las **notas** a tickets. Al abrir un corte en modo edición, las notas (tickets) asociadas no se muestran correctamente en el formulario: el selector de notas puede aparecer vacío o sin las notas preseleccionadas aunque el corte ya las tenga asignadas en la base de datos.

Síntomas reportados:
- En `InvoiceList.tsx` y `InvoiceListByClient.tsx`: al hacer click en "editar" sobre un corte, las notas asociadas (`editInvoice.tickets`) pueden no aparecer preseleccionadas o listadas en el formulario.
- El `availableTickets` no incluye las notas que ya pertenecen al corte en edición, impidiendo verlas o modificarlas.

#### Decisión propuesta

Corregir el flujo de edición en `InvoiceList` / `InvoiceListByClient` para que al abrir un corte:
1. Las notas ya asociadas al corte aparezcan seleccionadas en el formulario.
2. El listado de notas disponibles incluya tanto las notas sin corte como las que ya pertenecen al corte en edición.

#### Consecuencias

- El formulario de edición de cortes refleja fielmente el estado guardado
- El usuario puede agregar o quitar notas sin perder las ya asignadas

#### Pasos de implementación

1. En `InvoiceList.tsx` y `InvoiceListByClient.tsx`, dentro del `useEffect` que reacciona a `editInvoice`:
   - Al calcular `availableTickets`, incluir tanto las notas sin corte (`ticket.invoice === null`) como las que pertenecen al corte en edición (`ticket.invoice?.id === editInvoice.id`):
     ```ts
     setAvailableTickets(
       ticketsData?.data?.filter(
         t => t.invoice === null || t.invoice?.id === editInvoice.id
       ) ?? []
     )
     ```
2. Verificar que `initialFormValues.tickets` se construya con los IDs de las notas ya asociadas (`editInvoice.tickets.map(t => \`${t.id}\`)`), y que estos valores preseleccionen las notas en el formulario.
3. Confirmar que `InvoicesForm.tsx` recibe `enableReinitialize` en `Formik` o reinicializa correctamente al cambiar `initialFormValues`.
4. Probar el flujo completo: abrir un corte con notas → verificar que aparecen → agregar/quitar notas → guardar → reabrir y confirmar persistencia.

---

## Resumen de prioridades y orden de ejecución

| Orden | ADR | Tema | Prioridad | Depende de |
|---|---|---|---|---|
| 1 | ADR-001 | Tokens en variables privadas | Crítica | — |
| 2 | ADR-002 | Hook `useAuthGuard` | Crítica | ADR-003 (mínimo: `isLoading` en contexto) |
| 3 | ADR-003 | Tipos TypeScript globales | Alta | — |
| 4 | ADR-004 | Error Boundary y manejo de errores | Alta | ADR-003 |
| 5 | ADR-005 | Capa de servicios para cálculos | Alta | ADR-003 |
| 6 | ADR-006 | Hook `usePaginatedData` | Alta | ADR-003 |
| 7 | ADR-007 | Componentes UI reutilizables | Alta | ADR-003, ADR-006 |
| 8 | ADR-008 | Refactorizar `InvoiceList` | Alta | ADR-003, ADR-005, ADR-006, ADR-007 |
| 9 | ADR-009 | Validación de configuración Firebase | Media | — |
| 10 | ADR-010 | Logging centralizado | Media | — |
| 11 | ADR-011 | Memoización en listas | Media | ADR-008 |
| 12 | ADR-012 | Limpieza de código muerto | Baja | ADR-008 |
| 13 | ADR-013 | Notas en formulario de cortes | Baja | — |
