# ADR-018 — Módulo de Por Pagar — Alcance 2: Pagos Parciales

**Estado:** Pendiente
**Prioridad:** Media
**Depende de:** ADR-017 (Por Pagar — pago único)
**Nota:** Este ADR extiende y modifica ADR-017. Al implementarse, reemplaza la lógica de `purchase_status` para el seguimiento de pago por un campo dedicado `payment_status`.

---

## Contexto

ADR-017 cubre el caso de pago único usando `purchase_status: 'paid'`. Sin embargo, en la práctica las compras pueden pagarse en partes (anticipo, liquidación, etc.). Este alcance introduce historial de pagos sobre compras, análogo a lo que ADR-016 hace para los Cortes.

---

## Decisión

### Strapi — Cambios en colección `purchase`

Añadir campo:

```
payment_status    Enum    (por-pagar, parcial, pagado)
```

> Se introduce `payment_status` como campo de dominio de cobro, separado de `purchase_status` que refleja el estado operacional de la compra (planned, send, in_progress, completed, canceled). Ambos pueden coexistir independientemente.

---

### Strapi — Nueva colección: `payment_payable`

```
payment_date      Date
amount            Decimal
percentage        Decimal        (sincronizado con amount)
payment_method    Enum           (transferencia, efectivo, cheque, tarjeta)
reference         String         (número de transferencia / cheque)
comments          Text
purchase          Relation → purchase (many-to-one)
```

> Sin relación a proveedor por ahora — se incorporará en un ADR posterior cuando se modele la entidad proveedor.

---

### Lógica de negocio

**Balance de una Compra:**
```
balance = purchase.total - sum(payments_payable.amount)
status  = balance === 0 ? 'pagado' : balance < purchase.total ? 'parcial' : 'por-pagar'
```

**Sincronización amount ↔ percentage:**
- Al cambiar `amount` → `percentage = (amount / purchase.total) * 100`
- Al cambiar `percentage` → `amount = purchase.total * (percentage / 100)`
- Ambos campos visibles en el formulario, se actualizan en tiempo real

**Actualización automática de `payment_status`:**
Al registrar o eliminar un pago, recalcular y actualizar `purchase.payment_status` vía PUT al proxy `/api/purchases/[id]`.

---

### Navegación

Sin cambios respecto a ADR-017 — `/por-pagar` ya está en el dropdown Gastos.

---

### Páginas

#### `/por-pagar` — cambios respecto a ADR-017
- Filtrar por `payment_status` ≠ `pagado` (en lugar de `purchase_status` ≠ `paid`)
- Reemplazar botón "Marcar como pagada" por botón **Registrar pago** que abre `PaymentPayableForm`
- Añadir columna **Pagado** y **Saldo**

#### `/por-pagar/[purchaseId]` (nueva)
Detalle de pagos de una Compra: historial de pagos, registrar nuevo pago, balance visual.

Columnas historial: Fecha · Monto · % · Método · Referencia · Acciones

#### `/purchases` (Compras) — cambios adicionales
- Badge `payment_status` junto al badge de `purchase_status` existente
- Columna **Saldo** = `total - pagado`

---

### Componentes nuevos

| Componente | Descripción |
|---|---|
| `PaymentPayableForm.tsx` | Formulario create/edit con amount + percentage sincronizados, payment_method, reference, comments, payment_date |
| `PaymentPayableList.tsx` | Lista de pagos asociados a una Compra con totales |
| `PurchasePaymentStatusBadge.tsx` | Badge para `por-pagar` / `parcial` / `pagado` (reutilizable) |
| `BalanceSummaryPayable.tsx` | Bloque visual: Total · Pagado · Saldo pendiente |

> `PurchaseStatusBadge` de ADR-017 cubre el estado operacional — este badge cubre el estado de pago.

---

### API proxy routes nuevas

```
GET  /api/payments-payable              → lista de pagos (filtrable por purchase)
POST /api/payments-payable              → crear pago
GET  /api/payments-payable/[id]         → detalle
PUT  /api/payments-payable/[id]         → editar pago
```

---

## Consecuencias

- El ciclo de gastos queda completamente cubierto: Compra → Seguimiento → Pago parcial/total
- `payment_status` queda separado de `purchase_status` — operación y finanzas son dimensiones independientes
- Simétrico con ADR-016: misma arquitectura de pagos en ambos lados del negocio (cobrar / pagar)
- Requiere nueva colección `payment_payable` en Strapi antes de iniciar el desarrollo frontend
- Cuando se modele la entidad proveedor, solo se añade la relación a `payment_payable` sin romper lo existente

---

## Implementación sugerida (orden)

1. Añadir campo `payment_status` (Enum) a colección `purchase` en Strapi
2. Crear colección `payment_payable` en Strapi con los campos definidos
3. Añadir tipos `PaymentPayable` y actualizar `Purchase` (+ `payment_status`) en `src/types/index.ts`
4. API proxy routes `/api/payments-payable` y `/api/payments-payable/[id]`
5. SWR hooks: `useGetPaymentsPayable`, `useGetPaymentsPayableByPurchase`, `useCreatePaymentPayable`, `useEditPaymentPayable`
6. `PaymentPayableForm.tsx` con sincronización amount ↔ percentage
7. `PurchasePaymentStatusBadge.tsx` reutilizable
8. `BalanceSummaryPayable.tsx`
9. `PaymentPayableList.tsx`
10. Actualizar `PurchaseList` con columnas Saldo y badge `payment_status`
11. Página `/por-pagar` actualizada con nueva lógica de filtrado y `PaymentPayableForm` inline
12. Página `/por-pagar/[purchaseId]` con historial y formulario inline
