# ADR-020 — Workflow de activación de planes

**Estado:** Activo
**Prioridad:** Alta
**Depende de:** —

---

## Contexto

Los planes aprobados (`docs/modules/*.md`, `.claude/plans/*.md`) no tenían un proceso formal para convertirse en trabajo ejecutable. Resultado: planes que dormían sin tareas, sin scope claro, y sin forma de retomar el trabajo entre sesiones ni de rastrear qué quedó fuera.

Este ADR define el proceso completo desde que un plan es aprobado hasta que se cierra.

---

## Trigger de activación

Un plan se activa cuando su `**Estado:**` cambia a `Aprobado`. Ese es el único criterio — sin ese campo no hay activación.

Al activarse se ejecutan los pasos de este ADR.

---

## Paso 1 — Definir scope

Antes de crear tareas, el plan debe declarar explícitamente:

```
## Scope

### In scope
- [entregables concretos de esta iteración]

### Out of scope
- [qué se difiere conscientemente, con referencia de seguimiento]

### Criterios de éxito
- [cómo verificamos que el plan terminó — tests, flujos, comandos]
```

---

## Paso 2 — Descomposición en tareas

Reglas:

- Cada tarea debe ser **atómica** — completable en una sola sesión de trabajo
- Mapearse 1:1 con los pasos del plan donde sea posible
- La **primera tarea siempre es**: "Leer el plan + explorar los archivos afectados"
- Cada tarea debe tener:
  - `subject` — imperativo corto (ej. "Crear API proxy routes para quotes")
  - `description` — qué hay que hacer y por qué, con referencias al plan
  - `acceptance criteria` — condición verificable de que está lista
- Las dependencias entre tareas se modelan con `blockedBy`

> **Un plan no se considera terminado hasta que todas sus tareas están escritas en el task list con acceptance criteria y blockedBy configurados.** Tener solo el documento del plan sin las tareas = plan incompleto.

---

## Paso 3 — Seguimiento de items out of scope

Dos casos:

**Con plan futuro claro** → se documenta en la sección `## Alcance futuro` del módulo de origen con una nota de qué plan lo retomará.

**Sin plan claro todavía** → se agrega a `docs/backlog.md` con referencia al módulo/plan de origen para no perder el contexto.

No se crean archivos de plan vacíos — generan ruido sin valor.

---

## Paso 4 — Cierre del plan

Al completar todas las tareas:

1. Actualizar `**Estado:**` del plan doc → `Completado`
2. Actualizar `MEMORY.md` para reflejar el nuevo estado del sistema

---

## Consecuencias

- Los planes aprobados tienen un camino claro de "spec" a "tareas ejecutables"
- Nada queda perdido: lo diferido vive en `## Alcance futuro` o en `docs/backlog.md`
- El estado de cada plan siempre refleja la realidad — `Pendiente` / `Aprobado` / `Completado`
- Las sesiones de trabajo pueden retomarse desde el task list sin releer el plan completo
