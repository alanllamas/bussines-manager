# Módulo: Por Pagar (Cuentas por Pagar) — Alcance 1: Pago único

**Estado:** Pendiente
**Prioridad:** Alta
**Depende de:** ADR-003 (tipos globales)
**Segundo alcance:** [por-pagar-parcial.md](por-pagar-parcial.md) (pagos parciales — pendiente)

---

## Contexto

El flujo de gastos actual termina en la creación de una Compra (`purchase`) con un `purchase_status` que puede ser `planned`, `send`, `paid`, `in_progress`, `completed` o `canceled`. No existe una vista dedicada para gestionar qué compras están pendientes de pago, ni una acción directa para marcarlas como pagadas.

Este módulo cierra ese ciclo desde el lado de los egresos: de "compra registrada" a "compra pagada".

**Alcance de este documento:** pago único por compra. Los pagos parciales se contemplan en [por-pagar-parcial.md](por-pagar-parcial.md).

---

## Decisión

### Strapi — Cambio en colección `purchase`

Añadir un campo opcional:

```
payment_date    Date    (fecha en que se realizó el pago)
```

> `purchase_status: 'paid'` ya existe. `payment_date` complementa registrando cuándo ocurrió el pago para efectos de reportes y auditoría.

No se requiere nueva colección para este alcance.

---

### Lógica de negocio

**Marcar como pagada:**
Al registrar el pago desde la página `/por-pagar` o desde el detalle de una compra:
1. Actualizar `purchase_status → 'paid'`
2. Guardar `payment_date` con la fecha seleccionada (default: hoy)

**Deshacer pago:**
Desde el detalle de la compra, permitir revertir a `purchase_status → 'planned'` y limpiar `payment_date`.

---

### Navegación

Añadir **Por Pagar** al dropdown **Gastos**:

```
Gastos ▾
  ├── Compras         → /purchases
  ├── Por Pagar       → /por-pagar
  ├── Insumos         → /supplies
  └── Variantes       → /supply-variants
```

---

### Páginas

#### `/por-pagar` (nueva)
Vista principal de cuentas por pagar. Muestra todas las compras con `purchase_status` ≠ `paid` y ≠ `canceled`.

Columnas: Folio · Fecha · Razón · Estado · Total · Acciones

Filtros: por estado (`planned`, `send`, `in_progress`), por rango de fechas.

**Acción por fila:** botón **Marcar como pagada** que abre un mini-formulario inline con:
- `payment_date` (Date, default hoy)
- Botón confirmar → PUT `purchase_status: 'paid'` + `payment_date`

#### `/purchases` (Compras) — cambios menores
- Añadir columna **Estado** con badge de color:
  - `planned` → surface/gray
  - `send` → amber
  - `in_progress` → blue
  - `paid` → green
  - `completed` → teal
  - `canceled` → red/surface
- Añadir columna **Fecha de pago** (visible solo si `payment_date` existe)

#### `/purchases/[id]` (detalle) — cambios menores
- Mostrar `payment_date` si existe
- Botón **Marcar como pagada** / **Revertir pago** según estado actual

---

### Componentes nuevos

| Componente | Descripción |
|---|---|
| `PurchaseStatusBadge.tsx` | Badge reutilizable para los 6 estados de compra |
| `MarkAsPaidForm.tsx` | Mini-formulario inline: solo `payment_date` + confirmar |

---

### API proxy routes — cambios

```
PUT  /api/purchases/[id]    → ya existe; se reutiliza para actualizar purchase_status y payment_date
```

No se requieren nuevas rutas proxy.

---

## Consecuencias

- El ciclo de gastos queda cubierto sin nueva colección en Strapi (solo un campo extra)
- `purchase_status` pasa de actualización manual a acción guiada desde `/por-pagar`
- La nav de Gastos refleja el dominio completo: registro → seguimiento → pago
- Sienta las bases para [por-pagar-parcial.md](por-pagar-parcial.md) (pagos parciales) sin conflicto arquitectural

---

## Implementación sugerida (orden)

1. Añadir campo `payment_date` (Date, opcional) a colección `purchase` en Strapi
2. Añadir `payment_date` al tipo `Purchase` en `src/types/index.ts`
3. `PurchaseStatusBadge.tsx` reutilizable
4. `MarkAsPaidForm.tsx` — mini-formulario inline
5. Actualizar `PurchaseList` con columna Estado (badge) y columna Fecha de pago
6. Actualizar `/purchases/[id]` con `payment_date` y botón Marcar/Revertir
7. Página `/por-pagar` con filtros, tabla y acción inline
8. Actualizar `NavLinks` — añadir **Por Pagar** al dropdown Gastos
