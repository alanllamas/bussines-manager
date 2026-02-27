# ADR-006 — Crear custom hook `usePaginatedData`

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipado genérico)

## Contexto

La lógica de paginación con `react-paginate` es idéntica en tres componentes. Cualquier cambio (ej. items por página) requiere editar tres archivos.

## Decisión propuesta

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

## Consecuencias

- Elimina ~60 líneas duplicadas
- El reset automático de página evita desfases tras filtrar datos
- Comportamiento de paginación consistente entre módulos

## Pasos de implementación

1. Crear `src/hooks/usePaginatedData.ts` con la implementación mostrada.
2. En `InvoiceList.tsx`:
   - Eliminar las variables locales `itemOffset`, `endOffset`, `currentItems`, `pageCount` y el handler `handlePageChange`.
   - Sustituir por `const { currentItems, pageCount, handlePageChange } = usePaginatedData(invoices)`.
3. Repetir el paso 2 en `InvoiceListByClient.tsx` y en `ticketList.tsx`.
4. Verificar que el componente `ReactPaginate` siga recibiendo `pageCount` y `onPageChange` correctamente en los tres archivos.
