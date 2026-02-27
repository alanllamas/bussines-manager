# ADR-012 — Eliminar imports comentados y código muerto

**Estado:** Pendiente
**Prioridad:** Baja
**Depende de:** ADR-008 (esperar a que los refactors principales eliminen imports que ya no se usan)

## Contexto

Varios archivos tienen imports comentados que el historial de git ya preserva:

```typescript
// import { useAuth } from "@/context/AuthUserContext";   // page-client.tsx
// import { useRouter } from "next/navigation";            // múltiples archivos
```

`src/lib/useFirebaseAuth.jsx` no se importa en ningún archivo del proyecto.

## Decisión propuesta

- Remover todos los imports comentados
- Eliminar `useFirebaseAuth.jsx`
- Activar ESLint `no-unused-vars`

## Consecuencias

- Menor ruido en el código
- ESLint previene que se acumulen imports muertos en el futuro

## Pasos de implementación

1. Confirmar con un grep que `useFirebaseAuth` no se importa en ningún archivo del proyecto.
2. Eliminar `src/lib/useFirebaseAuth.jsx`.
3. En cada `page-client.tsx` de los módulos `clients`, `invoices` y `tickets`, eliminar los bloques de imports comentados.
4. En `eslint.config.mjs`, asegurarse de que `@typescript-eslint/no-unused-vars` esté activada con nivel `error` o `warn`.
5. Ejecutar `next lint` y resolver cualquier variable o import no utilizado que reporte.
6. Hacer un grep global de `// import` para confirmar que no queda ninguno pendiente.
