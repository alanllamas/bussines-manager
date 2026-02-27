# ADR-007 — Crear componentes UI reutilizables

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos de props), ADR-006 (`DataTable` usa `usePaginatedData` internamente)

## Contexto

Tres patrones se repiten sin abstracción:

1. **Dialog/Modal** — mismo JSX de `@headlessui/react` en `InvoicesForm.tsx` y `ticketsForm.tsx`
2. **Tabla paginada** — lógica de `react-paginate` duplicada en `InvoiceList.tsx`, `InvoiceListByClient.tsx` y `ticketList.tsx`
3. **Botones de acción** — editar/imprimir inline en múltiples tablas

## Decisión propuesta

Crear directorio `src/components/ui/` con:

| Componente | Propósito |
|---|---|
| `FormDialog.tsx` | Wrapper de Dialog con título, submit y cancel |
| `DataTable.tsx` | Tabla genérica con paginación integrada |
| `ActionButtons.tsx` | Botones editar / imprimir / eliminar |
| `TabContainer.tsx` | Wrapper de TabGroup de Headlessui |

## Consecuencias

- Reduce ~200 líneas de código repetido
- Cambios de UI se aplican en un solo lugar
- Los componentes actuales requieren refactor gradual

## Pasos de implementación

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
