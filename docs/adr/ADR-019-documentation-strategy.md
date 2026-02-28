# ADR-019 — Estrategia de documentación del proyecto

**Estado:** Resuelto
**Prioridad:** Media
**Depende de:** —

---

## Contexto

El proyecto creció sin una convención explícita sobre qué documentar, dónde y en qué formato. Esto derivó en ADRs que mezclaban decisiones arquitecturales, feature specs y tareas de mantenimiento. Este ADR establece la convención definitiva.

---

## Decisión

### Estructura de `docs/`

```
docs/
  adr/                    ← decisiones arquitecturales
  modules/                ← especificaciones de módulos de negocio
  backlog.md              ← tareas técnicas menores sin decisión arquitectural
  optimization-proposals.md  ← índice maestro de todo lo anterior
```

---

### `docs/adr/` — Architecture Decision Records

**Qué va aquí:** una elección técnica entre alternativas, con justificación y consecuencias.

**Criterio de inclusión:** si el documento responde "elegimos X en lugar de Y porque Z", es un ADR.

**Criterio de exclusión:** si solo describe qué construir sin comparar alternativas, no es un ADR — va en `docs/modules/`.

**Formato obligatorio:**

```md
# ADR-NNN — Título corto

**Estado:** Pendiente | En progreso | Resuelto | Cancelado
**Prioridad:** Crítica | Alta | Media | Baja
**Depende de:** ADR-XXX (o —)

## Contexto
Por qué existe este problema. Estado actual del código.

## Decisión
Qué se decide hacer y por qué se eligió esta opción sobre las alternativas.

## Consecuencias
Qué cambia. Qué se gana. Qué se pierde o complica.

## Pasos de implementación   ← opcional, omitir si es solo decisión
1. ...
```

**Numeración:** secuencial, sin reutilizar números. Los ADRs cancelados o resueltos se conservan — son historia del proyecto.

**Valores de estado:**
- `Pendiente` — decisión tomada, no implementada
- `En progreso` — implementación en curso
- `Resuelto` — implementado y verificado
- `Cancelado` — descartado; el documento explica por qué

---

### `docs/modules/` — Especificaciones de módulos

**Qué va aquí:** qué construir en un módulo de negocio — páginas, campos, componentes, rutas API, lógica de negocio.

**Criterio de inclusión:** si el documento describe un flujo de usuario completo o un conjunto de pantallas relacionadas, va aquí.

**Formato sugerido:**

```md
# Módulo: [Nombre]

**Estado:** Pendiente | En progreso | Completado
**Prioridad:** ...
**Depende de:** ...

## Contexto
Por qué se necesita este módulo.

## Decisión
Strapi (colecciones/campos), lógica de negocio, navegación, páginas, componentes, rutas API.

## Consecuencias
Impacto en el resto del sistema.

## Implementación sugerida (orden)
1. ...
```

**Nomenclatura:** nombre del dominio en kebab-case (`cobranza.md`, `por-pagar.md`), sin numeración.

---

### `docs/backlog.md`

**Qué va aquí:** tareas de mantenimiento o mejora que no implican una decisión arquitectural. Limpiezas, optimizaciones puntuales, deuda técnica menor.

**Criterio de inclusión:** si la tarea tiene un "qué hacer" claro sin necesidad de elegir entre alternativas, va en el backlog.

**Formato:** secciones `##` con nombre de la tarea, prioridad, dependencias y pasos de implementación.

---

### `docs/optimization-proposals.md`

Índice maestro. Contiene tres tablas: Decisiones Arquitecturales, Módulos de negocio, Backlog técnico. **No contiene contenido propio** — solo links y estado resumido.

Actualizar este archivo cada vez que se cree, resuelva o cancele un ADR o módulo.

---

### `CLAUDE.md`

**Qué va aquí:** instrucciones para el agente de IA — comandos de desarrollo, convenciones de arquitectura, terminología de dominio, patrones conocidos.

**Qué no va aquí:** feature specs, decisiones pendientes, tareas de mantenimiento. Esas van en `docs/`.

---

## Documentación en código

### TypeScript — cuándo tipear explícitamente

- **Siempre:** props de componentes React, retorno de funciones públicas de servicios, valores de contexto.
- **Nunca:** variables locales cuyo tipo infiere TypeScript sin ambigüedad (`const total = a + b`).
- **Prohibido:** `any`. Usar `unknown` si el tipo es genuinamente desconocido, luego narrowing.

### Comentarios en código

**Regla general:** comentar todo. Cada función, bloque lógico y decisión no trivial debe tener un comentario que explique qué hace y por qué existe, de modo que no sea necesario releer el código para entender su propósito.

El objetivo es que cualquier desarrollador (o el agente de IA) pueda entender el comportamiento completo de un archivo leyendo solo los comentarios, sin necesidad de inferir lógica del código.

**Qué comentar:**

- **Funciones y hooks:** qué hacen, qué reciben, qué retornan.
- **Bloques de lógica:** cada sección con responsabilidad distinta dentro de una función.
- **Decisiones de negocio:** fórmulas, reglas, condiciones.
- **Workarounds y restricciones:** por qué se hace algo de forma no obvia.
- **Referencias a ADRs o módulos** cuando el código implementa una decisión documentada.
- **Efectos secundarios:** mutaciones de estado externo, llamadas API, actualizaciones encadenadas.

```typescript
// Calcula el balance pendiente de un Corte sumando todos sus pagos registrados.
// Retorna 0 si no hay pagos. Usado en InvoiceStatusBadge y BalanceSummary.
function calcBalance(invoice: Invoice, payments: Payment[]): number {
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  return invoice.total - paid;
}

// Sincroniza el campo percentage al cambiar amount, para que ambos reflejen
// el mismo valor relativo al total del Corte. ADR-016 (módulo Cobranza).
const handleAmountChange = (value: number) => {
  setFieldValue("amount", value);
  setFieldValue("percentage", (value / invoice.total) * 100);
};

// Strapi v5 requiere documentId (no id numérico) en relaciones many-to-many.
// Enviar el id numérico resulta en error 400 silencioso en el proxy.
payload.product_variants = selected.map(v => v.documentId);

// setTimeout necesario: DatePicker dispara onChange antes de que Formik
// actualice su estado interno, causando que setFieldValue reciba el valor anterior.
setTimeout(() => setFieldValue("date", value), 0);
```

### JSDoc

No se usa JSDoc en este proyecto. Los comentarios inline son la documentación de las funciones.

---

## Consecuencias

- Los ADRs reflejan exclusivamente decisiones — consultarlos es suficiente para entender por qué el código es como es.
- Las feature specs en `docs/modules/` sirven de referencia durante el desarrollo sin contaminar el historial de decisiones.
- El backlog centraliza la deuda técnica menor en un solo lugar visible.
- La convención de comentarios reduce el ruido sin sacrificar contexto útil.
