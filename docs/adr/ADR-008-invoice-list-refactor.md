# ADR-008 — Refactorizar InvoiceList separando responsabilidades

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos), ADR-005 (servicios), ADR-006 (paginación), ADR-007 (componentes UI)

## Contexto

`src/components/invoices/InvoiceList.tsx` concentra 14 estados locales, lógica de paginación, lógica de formulario y lógica de impresión en un solo componente. Es el ADR de mayor alcance porque integra todos los artefactos creados anteriormente.

```typescript
// 14 useState en un solo componente
const [totals, setTotals] = useState<Totals>({...})
const [resume, setResume] = useState<Resume>()
const [clients, setClients] = useState<Client[]>([])
const [tickets, setTickets] = useState<Ticket[]>([])
// ... 10 más
```

## Decisión propuesta

Dividir en:
- `InvoiceTable.tsx` — renderizado de filas + columnas (usa `DataTable` de ADR-007)
- `InvoiceFormContainer.tsx` — manejo de estado del formulario de creación/edición
- `InvoicePrintContainer.tsx` — manejo de impresión
- `useInvoiceList.ts` — estado consolidado vía `useReducer`

## Consecuencias

- Cada pieza es testeable de forma aislada
- Requiere refactor significativo (~400 líneas)
- Mejora el time-to-paint inicial al poder lazy-load el formulario

## Pasos de implementación

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
