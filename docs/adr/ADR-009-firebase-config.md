# ADR-009 — Consolidar configuración de Firebase y validar credenciales al iniciar

**Estado:** Pendiente
**Prioridad:** Media
**Depende de:** — (independiente, se puede hacer en paralelo con los ADRs de Alta)

## Contexto

`src/lib/firebase.js` contiene lógica para limpiar comillas de variables de entorno, lo que sugiere que las variables están siendo leídas con comillas extras (posible problema en el `.env`). No hay validación de que todas las keys necesarias estén presentes.

```javascript
// Workaround actual — señal de un problema subyacente
Object.keys(firebaseCredentials).forEach((key) => {
  const configValue = firebaseCredentials[key] + "";
  if (configValue.charAt(0) === '"') {
    firebaseCredentials[key] = configValue.substring(1, configValue.length - 1);
  }
});
```

## Decisión propuesta

1. Corregir el `.env` para que no incluya comillas en los valores
2. Convertir `firebase.js` a `firebase.ts`
3. Agregar validación de configuración al inicio

## Consecuencias

- Errores de configuración fallan en startup, no silenciosamente en runtime
- Elimina el workaround de limpieza de comillas
- Migración a TypeScript del módulo base

## Pasos de implementación

1. Abrir `.env.local` y verificar si los valores de Firebase tienen comillas extras (ej. `NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY="abc123"`). Si las tienen, removerlas.
2. Probar que la app sigue funcionando sin las comillas. Si funciona, el workaround ya no es necesario.
3. Renombrar `src/lib/firebase.js` → `src/lib/firebase.ts`.
4. Reemplazar el bloque de limpieza de comillas con una función de validación:
   ```typescript
   const requiredKeys = ['apiKey', 'authDomain', 'projectId'] as const;
   requiredKeys.forEach(key => {
     if (!firebaseCredentials[key]) {
       throw new Error(`Firebase config missing: ${key}`);
     }
   });
   ```
5. Actualizar todos los imports de `firebase.js` a `firebase` (sin extensión).
6. Verificar que TypeScript no genere errores nuevos en el archivo convertido.
7. Actualizar `.env.example` documentando las tres variables requeridas.
