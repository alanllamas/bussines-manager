# ADR-002 — Centralizar guardia de autenticación en un custom hook

**Estado:** Pendiente
**Prioridad:** Crítica
**Depende de:** ADR-003 (requiere `isLoading` en `AuthContext`, que se define al tipar el contexto)

## Contexto

La lógica de redirección cuando no hay usuario autenticado está duplicada en al menos 5 archivos con variaciones en los tiempos de intervalo (100ms, 500ms, 1000ms). El patrón de `setInterval` + `clearInterval` dentro de `useEffect` es propenso a memory leaks.

Archivos afectados:
- `src/app/invoices/page-client.tsx`
- `src/app/tickets/page-client.tsx`
- `src/app/clients/components/sidebar.tsx`
- `src/app/invoices/[id]/page-client.tsx`
- `src/app/tickets/[id]/page-client.tsx`

## Decisión propuesta

Crear `src/hooks/useAuthGuard.ts` con lógica centralizada de redirección usando el router de Next.js en lugar de `window.location`.

```typescript
export function useAuthGuard(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  return { isAuthenticated: !!user, isLoading };
}
```

## Consecuencias

- Elimina ~50 líneas duplicadas repartidas en 5 archivos
- Comportamiento de redirección consistente
- Uso de `router.replace` evita entradas espurias en el historial del navegador

## Pasos de implementación

1. Crear el directorio `src/hooks/` si no existe.
2. Crear el archivo `src/hooks/useAuthGuard.ts` con la implementación mostrada.
3. Verificar que `AuthUserContext` exponga `isLoading` (queda tipado en ADR-003). Si ADR-003 aún no está completo, agregar el campo `isLoading` al contexto como paso previo mínimo.
4. En cada uno de los 5 archivos afectados:
   - Eliminar los dos `useEffect` de redirección existentes.
   - Eliminar los estados `interval` / `setinterval` relacionados.
   - Agregar `const { isLoading } = useAuthGuard()` al inicio del componente.
   - Si el componente mostraba un spinner mientras redirigía, reemplazarlo con `if (isLoading) return <LoadingScreen />`.
5. Probar manualmente accediendo a cada ruta sin sesión activa y confirmar que redirige correctamente.
6. Probar que al iniciar sesión no queda ningún intervalo activo (verificar en DevTools → Performance → Memory).
