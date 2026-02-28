# Módulo: Cotizaciones

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos globales)

---

## Contexto

El flujo de ventas actual comienza directamente en la creación de una Nota (`ticket`). No existe un documento previo que registre el trabajo acordado con el cliente antes de ejecutarlo. Las cotizaciones cubren ese paso: un presupuesto formal con cliente, productos, precios e impuestos que queda documentado y puede imprimirse o enviarse al cliente para su aprobación.

Una cotización no se convierte automáticamente en Nota, pero sí puede servir de base para crear una (alcance futuro).

---

## Decisión

### Strapi — Nueva colección: `quote`

```
quote_number      Integer        (secuencial, igual que ticket_number e invoice_number)
quote_date        Date           (fecha de emisión, default hoy)
valid_until       Date           (fecha de vencimiento — opcional)
status            Enum           (borrador, enviada, aceptada, rechazada)
client            Relation → client  (many-to-one)
products          Component (repetible) — misma estructura que tickets.products:
  product           Relation → product
  product_variants  Relation[] → product_variant
  quantity          Integer
  price             Decimal
  taxes             Decimal
  sub_total         Decimal      (price × quantity)
sub_total         Decimal        (suma de líneas)
taxes             Decimal        (total de impuestos)
total             Decimal        (sub_total + taxes + shipping)
shipping          Decimal        (flete — opcional, default 0)
comments          Text           (visible en el PDF — notas para el cliente)
inner_comments    Text           (interno — no se imprime)
```

---

### Lógica de negocio

**Cálculo de totales** (igual que en PurchaseForm/ticketsForm):
```
line.sub_total  = line.price × line.quantity
quote.sub_total = sum(lines.sub_total)
quote.taxes     = sum(lines.sub_total × (line.taxes / 100))
quote.total     = quote.sub_total + quote.taxes + quote.shipping
```

**Estados:**
- `borrador` → recién creada, no enviada al cliente
- `enviada` → cliente ya tiene el documento
- `aceptada` → cliente aprobó el presupuesto
- `rechazada` → cliente no aceptó

El estado se actualiza manualmente desde la lista o el detalle.

**Auto-numeración:**
Mismo patrón que `useGetInvoiceNumber` y `useGetTicketNumber` — se obtiene el `quote_number` más reciente y se propone `lastNumber + 1` en el formulario.

---

### Navegación

Añadir **Cotizaciones** al dropdown **Ingresos**:

```
Ingresos ▾
  ├── Notas           → /tickets
  ├── Cotizaciones    → /quotes
  ├── Productos       → /products
  └── Variantes       → /product-variants
```

---

### Páginas

#### `/quotes` (nueva)
Lista de todas las cotizaciones con filtro por estado.

Columnas: # · Cliente · Fecha · Válida hasta · Total · Estado · Acciones

Filtros: por estado, por cliente.

Acciones por fila: Editar · Imprimir · Cambiar estado (dropdown inline).

#### `/quotes/[id]` (nueva — opcional en v1)
Vista de detalle con el desglose completo y botón de impresión.

---

### Formato de impresión

Mismo patrón que tickets e invoices — tres archivos:

| Archivo | Descripción |
|---|---|
| `quoteBaseFormat.tsx` | Contenido compartido entre pantalla e impresión |
| `quoteFormat.tsx` | Formato de pantalla con botón "Imprimir" |
| `quotePrintFormat.tsx` | Formato de impresión (react-to-print) — sin botones |

**Contenido del PDF:**
- Header: logo + datos del negocio
- Datos del cliente (nombre, RFC si aplica)
- Número de cotización + fecha de emisión + válida hasta
- Tabla de productos: descripción · cantidad · precio unitario · impuestos · subtotal
- Totales: subtotal · impuestos · flete · **total**
- Sección de comentarios (campo `comments`)
- Footer: texto de validez ("Esta cotización es válida hasta…")

---

### Componentes nuevos

| Componente | Descripción |
|---|---|
| `QuoteForm.tsx` | Formulario create/edit — igual que ticketsForm pero con campo status, valid_until, comments e inner_comments |
| `QuoteList.tsx` | Lista con badges de estado, acciones inline, form modal |
| `QuoteStatusBadge.tsx` | Badge reutilizable para los 4 estados |
| `quoteBaseFormat.tsx` | Contenido base compartido |
| `quoteFormat.tsx` | Formato de pantalla |
| `quotePrintFormat.tsx` | Formato de impresión (react-to-print) |

---

### API proxy routes nuevas

```
GET  /api/quotes              → lista paginada
POST /api/quotes              → crear cotización
GET  /api/quotes/[id]         → detalle con populate completo
PUT  /api/quotes/[id]         → editar / cambiar estado
```

---

### SWR hooks nuevos

```
useGetQuotes            — lista con populate: client, products, products.product, products.product_variants
useGetQuote(id)         — detalle individual
useGetQuoteNumber       — último quote_number para auto-incremento
useCreateQuote          — POST mutation (patrón SWR existente)
useEditQuote            — PUT mutation (patrón SWR existente)
```

---

## Consecuencias

- El ciclo de ventas queda completo: Cotización → Nota → Corte → Cobro
- La cotización es un documento independiente — no bloquea ni fuerza la creación de una Nota
- El formato de impresión sigue el patrón establecido (base/screen/print) — consistente con tickets e invoices
- Sienta las bases para el alcance futuro: "Crear Nota desde cotización"

---

## Alcance futuro (fuera de este documento)

- Botón **Crear Nota desde cotización** que pre-llena el ticketsForm con los datos de la quote
- Botón **Ir a Corte** si el cliente ya aprobó y se quiere facturar directamente
- Relación `quote → ticket` para rastrear el origen de cada Nota

---

## Implementación sugerida (orden)

1. Crear colección `quote` en Strapi con los campos definidos
2. Añadir tipo `Quote` a `src/types/index.ts`
3. API proxy routes `/api/quotes` y `/api/quotes/[id]`
4. SWR hooks: `useGetQuotes`, `useGetQuote`, `useGetQuoteNumber`, `useCreateQuote`, `useEditQuote`
5. `QuoteStatusBadge.tsx` reutilizable
6. `QuoteForm.tsx` — basado en ticketsForm, añadir status, valid_until, comments, inner_comments
7. `quoteBaseFormat.tsx`, `quoteFormat.tsx`, `quotePrintFormat.tsx`
8. `QuoteList.tsx` con form modal y acciones inline
9. Página `/quotes` con layout
10. Actualizar `NavLinks` — añadir Cotizaciones al dropdown Ingresos
