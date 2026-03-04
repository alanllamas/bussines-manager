# Módulo: Cobranza (Cuentas por Cobrar)

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos globales), ADR-015 (Supabase — opcional, puede implementarse sobre Strapi)

---

## Contexto

El flujo de facturación actual termina en la generación de un Corte (`invoice`). No existe forma de registrar pagos, rastrear saldos pendientes ni gestionar el ciclo completo de cobranza. Los clientes ya tienen campos `payment_period`, `billing_period` e `invoice_period` en `taxing_info`, y los Cortes tienen un campo `invoice_status` en Strapi con los valores `por-pagar`, `pagado`, `cancelado`.

El módulo de Cobranza cierra ese ciclo: de "documento emitido" a "dinero cobrado".

---

## Decisión

### Strapi — Nueva colección: `payment`

```
payment_date       Date
amount             Decimal
percentage         Decimal        (sincronizado con amount)
payment_method     Enum           (transferencia, efectivo, cheque, tarjeta)
reference          String         (número de transferencia / cheque)
comments           Text
invoice            Relation → invoice (many-to-one)
client             Relation → client  (many-to-one, inferido del invoice)
```

> `client` puede inferirse del invoice al crear el pago, pero se guarda explícitamente para facilitar consultas por cliente.

---

### Lógica de negocio

**Balance de un Corte:**
```
balance = invoice.total - sum(payments.amount)
status  = balance === 0 ? 'pagado' : balance < invoice.total ? 'parcial' : 'por-pagar'
```

**Sincronización amount ↔ percentage:**
- Al cambiar `amount` → `percentage = (amount / invoice.total) * 100`
- Al cambiar `percentage` → `amount = invoice.total * (percentage / 100)`
- Ambos campos visibles en el formulario de pago, se actualizan en tiempo real

**Actualización automática de `invoice_status`:**
Al registrar o eliminar un pago, recalcular y actualizar `invoice.invoice_status` vía PUT al proxy `/api/invoices/[id]`.

**Datos inferidos del cliente:**
Al abrir el formulario de pago desde un Corte, pre-poblar `payment_method` con el método de pago habitual del cliente (`taxing_info.payment_method`) si está disponible.

---

### Navegación

Reemplazar el enlace suelto **Cortes** por un dropdown **Cobranza**:

```
Cobranza ▾
  ├── Cortes          → /invoices
  └── Por Cobrar      → /por-cobrar
```

---

### Páginas

#### `/invoices` (Cortes) — cambios menores
- Añadir columna **Estado** en la tabla con badge de color:
  - `por-pagar` → amber
  - `parcial` → blue
  - `pagado` → green
  - `cancelado` → surface/gray
- Añadir columna **Saldo** = `total - pagado`

#### `/por-cobrar` (nueva)
Vista principal de cuentas por cobrar. Muestra todos los Cortes con saldo pendiente.

Columnas: Folio · Cliente · Fecha · Total · Pagado · Saldo · Estado · Acciones

Filtros: por estado (`por-pagar`, `parcial`, `cancelado`), por cliente, por rango de fechas.

#### `/por-cobrar/[invoiceId]` (nueva, opcional en v1)
Detalle de cobranza de un Corte: historial de pagos, registrar nuevo pago, balance visual.

#### Tab **Por Cobrar** en `/clients/[id]` (nueva)
Tab contextualizado al cliente, añadido junto a Notas y Cortes en `ClientTabs`.

Contenido:
- **Resumen superior:** total facturado · total pagado · saldo pendiente (con `BalanceSummary`)
- **Lista de Cortes** del cliente con columnas: Folio · Fecha · Total · Pagado · Saldo · Estado (badge)
- **Acción inline:** botón "Registrar pago" por Corte que abre `PaymentForm` sin salir del tab

---

### Componentes nuevos

| Componente | Descripción |
|---|---|
| `PaymentForm.tsx` | Formulario create/edit con campos amount + percentage sincronizados, payment_method, reference, comments, payment_date |
| `InvoiceStatusBadge.tsx` | Badge reutilizable para `por-pagar` / `parcial` / `pagado` / `cancelado` |
| `PaymentList.tsx` | Lista de pagos asociados a un Corte con totales |
| `BalanceSummary.tsx` | Bloque visual: Total · Pagado · Saldo pendiente |

---

### API proxy routes nuevas

```
GET  /api/payments              → lista de pagos (filtrable por invoice, client)
POST /api/payments              → crear pago
GET  /api/payments/[id]         → detalle
PUT  /api/payments/[id]         → editar pago
```

---

## Consecuencias

- El ciclo completo de facturación queda cubierto: Nota → Corte → Pago
- `invoice_status` pasa de campo manual a campo calculado y actualizado automáticamente
- La nav refleja mejor los dominios del negocio: Ingresos (ventas) · Cobranza (cobro) · Gastos (compras)
- Los pagos parciales con amount/percentage sincronizados permiten acuerdos de pago flexibles (30/50/70%)
- Requiere nueva colección `payment` en Strapi antes de iniciar el desarrollo frontend

---

## Implementación sugerida (orden)

1. Crear colección `payment` en Strapi con los campos definidos
2. Añadir tipo `Payment` a `src/types/index.ts`
3. API proxy routes `/api/payments` y `/api/payments/[id]`
4. SWR hooks: `useGetPayments`, `useGetPaymentsByInvoice`, `useCreatePayment`, `useEditPayment`
5. `PaymentForm.tsx` con sincronización amount ↔ percentage
6. `InvoiceStatusBadge.tsx` reutilizable
7. Actualizar `InvoiceList` y `InvoiceListByClient` con columnas Estado y Saldo
8. Página `/por-cobrar` con filtros y tabla
9. Página `/por-cobrar/[invoiceId]` con historial y formulario inline
10. Tab **Por Cobrar** en `ClientTabs` con resumen + lista de Cortes + `PaymentForm` inline
11. Actualizar `NavLinks` — Cobranza dropdown
