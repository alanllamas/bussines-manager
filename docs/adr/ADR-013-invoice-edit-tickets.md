# ADR-013 — Corregir visualización de notas en el formulario de cortes

**Estado:** ✅ Completado
**Prioridad:** Baja
**Depende de:** —

## Contexto

En la aplicación, los **cortes** corresponden a invoices (`InvoicesForm.tsx`, `InvoiceList.tsx`) y las **notas** a tickets. Al abrir un corte en modo edición, las notas (tickets) asociadas no se muestran correctamente en el formulario: el selector de notas puede aparecer vacío o sin las notas preseleccionadas aunque el corte ya las tenga asignadas en la base de datos.

Síntomas reportados:
- En `InvoiceList.tsx` y `InvoiceListByClient.tsx`: al hacer click en "editar" sobre un corte, las notas asociadas (`editInvoice.tickets`) pueden no aparecer preseleccionadas o listadas en el formulario.
- El `availableTickets` no incluye las notas que ya pertenecen al corte en edición, impidiendo verlas o modificarlas.

## Decisión propuesta

Corregir el flujo de edición en `InvoiceList` / `InvoiceListByClient` para que al abrir un corte:
1. Las notas ya asociadas al corte aparezcan seleccionadas en el formulario.
2. El listado de notas disponibles incluya tanto las notas sin corte como las que ya pertenecen al corte en edición.

## Consecuencias

- El formulario de edición de cortes refleja fielmente el estado guardado
- El usuario puede agregar o quitar notas sin perder las ya asignadas

## Pasos de implementación

1. En `InvoiceList.tsx` y `InvoiceListByClient.tsx`, dentro del `useEffect` que reacciona a `editInvoice`:
   - Al calcular `availableTickets`, incluir tanto las notas sin corte (`ticket.invoice === null`) como las que pertenecen al corte en edición (`ticket.invoice?.id === editInvoice.id`):
     ```ts
     setAvailableTickets(
       ticketsData?.data?.filter(
         t => t.invoice === null || t.invoice?.id === editInvoice.id
       ) ?? []
     )
     ```
2. Verificar que `initialFormValues.tickets` se construya con los IDs de las notas ya asociadas (`editInvoice.tickets.map(t => \`${t.id}\`)`), y que estos valores preseleccionen las notas en el formulario.
3. Confirmar que `InvoicesForm.tsx` recibe `enableReinitialize` en `Formik` o reinicializa correctamente al cambiar `initialFormValues`.
4. Probar el flujo completo: abrir un corte con notas → verificar que aparecen → agregar/quitar notas → guardar → reabrir y confirmar persistencia.
