# Backlog técnico

Tareas de mantenimiento y mejora sin decisión arquitectural relevante. Pendientes de ejecutar.

---

## Memoización en listas

**Prioridad:** Media
**Depende de:** ADR-008 (debe hacerse después del refactor de `InvoiceList` para no memoizar código que va a cambiar)

### Contexto

Los componentes de lista (`InvoiceList`, `ticketList`, `ContactsTab`) se re-renderizan completamente cuando cambia cualquier estado del padre, incluso cuando sus props no cambiaron. Las funciones auxiliares definidas dentro del cuerpo del componente se recrean en cada render.

### Trabajo a realizar

- Envolver con `React.memo()` los componentes de lista
- Usar `useCallback` en handlers que se pasan como props
- Usar `useMemo` para cálculos derivados (ej. filtrado de tickets por fecha)

### Consecuencias

- Menos re-renders en interacciones frecuentes (paginación, búsqueda)
- Pequeño overhead de comparación de props (despreciable para estos tamaños de datos)

### Pasos de implementación

1. Instalar React DevTools en el navegador y activar "Highlight updates when components render" para identificar re-renders antes y después.
2. En `ContactsTab.tsx`:
   - Envolver el componente con `export default React.memo(ContactsTab)`.
   - Extraer `generateCard` fuera del cuerpo del componente (es una función pura).
3. En `InvoiceTable.tsx` (resultado de ADR-008):
   - Envolver con `React.memo`.
   - Envolver los handlers `onEdit` y `onPrint` con `useCallback` en el componente padre.
4. En `ticketList.tsx`:
   - Envolver con `React.memo`.
   - Identificar handlers pasados como prop y envolverlos con `useCallback` en el padre.
5. En `InvoicesForm.tsx`, extraer los `onChange` de `DatePicker` a funciones con `useCallback`:
   ```typescript
   const handleInitialDateChange = useCallback((e) => {
     const initial_date = new Date(new Date(e).setHours(0, 0, 0, 0));
     setFieldValue("initial_date", initial_date);
   }, [setFieldValue]);
   ```
6. Reemplazar el `setTimeout` del cálculo de tickets filtrados con un `useMemo` que dependa de las fechas seleccionadas.
7. Validar con React DevTools que los componentes memoizados ya no re-renderizan al cambiar estados del padre que no afectan sus props.

---

## Limpieza de código muerto

**Prioridad:** Baja
**Depende de:** ADR-008 (esperar a que los refactors principales eliminen imports que ya no se usan)

### Contexto

Varios archivos tienen imports comentados que el historial de git ya preserva:

```typescript
// import { useAuth } from "@/context/AuthUserContext";   // page-client.tsx
// import { useRouter } from "next/navigation";            // múltiples archivos
```

`src/lib/useFirebaseAuth.jsx` no se importa en ningún archivo del proyecto.

### Trabajo a realizar

- Remover todos los imports comentados
- Eliminar `useFirebaseAuth.jsx`
- Activar ESLint `no-unused-vars`

### Consecuencias

- Menor ruido en el código
- ESLint previene que se acumulen imports muertos en el futuro

### Pasos de implementación

1. Confirmar con un grep que `useFirebaseAuth` no se importa en ningún archivo del proyecto.
2. Eliminar `src/lib/useFirebaseAuth.jsx`.
3. En cada `page-client.tsx` de los módulos `clients`, `invoices` y `tickets`, eliminar los bloques de imports comentados.
4. En `eslint.config.mjs`, asegurarse de que `@typescript-eslint/no-unused-vars` esté activada con nivel `error` o `warn`.
5. Ejecutar `next lint` y resolver cualquier variable o import no utilizado que reporte.
6. Hacer un grep global de `// import` para confirmar que no queda ninguno pendiente.
