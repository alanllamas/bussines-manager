# ADR-015 — Migrar backend de Strapi a Supabase

**Estado:** Pendiente aprobación
**Prioridad:** Alta (arquitectural)
**Bloquea:** ADR-014 (mover lógica de negocio al backend)

## Contexto

El backend actual usa Strapi como API REST. Se ha decidido migrar a Supabase para aprovechar:

- Base de datos PostgreSQL gestionada con acceso directo vía SDK
- Row Level Security (RLS) para control de acceso a nivel de base de datos
- Funciones edge y triggers nativos de PostgreSQL para lógica de negocio (reemplaza los lifecycle hooks de Strapi que plantea ADR-014)
- Reducción de infraestructura — un solo servicio en lugar de Strapi + su base de datos

## Decisión

Migración completa de Strapi a Supabase. Firebase se conserva para autenticación (Google OAuth).

## Alcance

| Aspecto | Actual | Destino |
|---|---|---|
| Base de datos | Strapi ORM (MySQL/PostgreSQL) | Supabase PostgreSQL |
| API | Strapi REST endpoints | Supabase client SDK + RLS |
| Autenticación | Firebase (Google OAuth) | Firebase (sin cambio) |
| Lógica de negocio | Frontend (`invoiceService.ts`) / Strapi lifecycles (planificado) | PostgreSQL functions / triggers |
| Proxy Next.js | `src/app/api/*` routes con token Strapi | `src/app/api/*` routes con Supabase service key |

## Impacto en el frontend

1. Reemplazar todos los hooks SWR (`getClients`, `getInvoices`, etc.) por llamadas al Supabase client
2. Las rutas proxy `src/app/api/*` se mantienen como patrón pero cambian su implementación interna
3. `BUSINESS_MANAGER_API` y `BUSINESS_MANAGER_TOKEN` se reemplazan por `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` (server-side)
4. El cliente Supabase público usará `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Relación con ADR-014

ADR-014 (mover lógica fiscal al backend) se implementará directamente en Supabase como funciones PostgreSQL y triggers, no como lifecycle hooks de Strapi. ADR-014 no debe iniciarse hasta que esta migración esté completa.

## Pasos de implementación

1. Crear proyecto en Supabase y definir el schema de tablas equivalente al modelo de Strapi actual.
2. Migrar datos existentes (clientes, tickets, cortes, productos) de Strapi a Supabase.
3. Crear cliente Supabase en `src/lib/supabase.ts` (server-side con service key + client-side con anon key).
4. Reemplazar las rutas proxy `src/app/api/*` para usar el cliente Supabase server-side.
5. Reemplazar los hooks SWR en `src/api/hooks/` por hooks que llamen a las nuevas rutas proxy.
6. Verificar que Firebase UID se almacene en Supabase para vincular usuarios con sus datos (RLS).
7. Implementar RLS policies en Supabase para que cada usuario solo acceda a sus propios datos.
8. Eliminar toda referencia a `BUSINESS_MANAGER_API` y `BUSINESS_MANAGER_TOKEN`.
9. Ejecutar pruebas del flujo completo: login → clientes → notas → cortes → impresión.
