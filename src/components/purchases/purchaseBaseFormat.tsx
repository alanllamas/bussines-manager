'use client'
// PurchaseBaseFormat — layout compartido entre PurchaseFormat (pantalla) y PurchasePrintFormat (impresión).
// Recibe purchase + fecha pre-formateada como string desde el padre.
// REASON_LABELS / STATUS_LABELS duplicados aquí y en PurchaseList (no están en un módulo compartido).
// Tabla de insumos: sin relleno de filas vacías (a diferencia de ticketBaseFormat que rellena a 10 filas).
// Comments: texto plano (no ReactMarkdown como invoiceBaseFormat).
// Totals: subtotal + shipping_cost + total — sin IVA desglosado.
// print:border-gray-200 en celdas y print:text-sm en tabla — ajustes visuales solo en impresión.
import React from "react"
import logo from "@/public/logo.png"
import type { Purchase, PurchaseSupply, SupplyVariant } from "@/types"

const REASON_LABELS: Record<string, string> = {
  supplies: 'Insumos', tools: 'Herramientas', food: 'Comida', drinks: 'Bebidas', other: 'Otro'
}
const STATUS_LABELS: Record<string, string> = {
  planned: 'Planeada', send: 'Enviada', paid: 'Pagada', in_progress: 'En proceso', completed: 'Completada', canceled: 'Cancelada'
}

const PurchaseBaseFormat: React.FC<{ purchase: Purchase; date: string }> = ({ purchase, date }) => {
  return (
    <section>
      <div className="flex justify-between my-3 items-center">
        <img className="w-48 sm:w-64" src={logo.src} alt="" />
        <div className="font-bold flex flex-col mt-6 gap-2 text-sm">
          <span className="flex justify-between gap-4">
            <span>Folio:</span>
            <span>{String(purchase?.purchase_number ?? '').padStart(5, '0')}</span>
          </span>
          <span className="flex justify-between gap-4">
            <span>Fecha:</span>
            <span>{date}</span>
          </span>
          {purchase?.purchase_reason && (
            <span className="flex justify-between gap-4">
              <span>Razón:</span>
              <span>{REASON_LABELS[purchase.purchase_reason] ?? purchase.purchase_reason}</span>
            </span>
          )}
          {purchase?.purchase_status && (
            <span className="flex justify-between gap-4">
              <span>Estado:</span>
              <span>{STATUS_LABELS[purchase.purchase_status] ?? purchase.purchase_status}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col my-6 overflow-x-auto">
        <table className="print:text-sm w-full min-w-[400px] mt-4 mb-4">
          <thead>
            <tr>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200 text-left">Insumo</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200 text-left">Variantes</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200 text-right">Cantidad</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200 text-right">Precio</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {purchase?.supplies?.map((item: PurchaseSupply, index: number) => (
              <tr key={index}>
                <td className="px-2 border border-surface-200 print:border-gray-200">{item?.supply?.name ?? ''}</td>
                <td className="px-2 border border-surface-200 print:border-gray-200">
                  {item?.supply_variants?.map((v: SupplyVariant) => v.name).join(' | ') ?? ''}
                </td>
                <td className="px-2 border border-surface-200 print:border-gray-200 text-right">
                  {item?.quantity} {item?.supply?.measurement_unit ?? ''}
                </td>
                <td className="px-2 border border-surface-200 print:border-gray-200 text-right h-8">
                  {item?.price?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </td>
                <td className="px-2 border border-surface-200 print:border-gray-200 text-right h-8">
                  {item?.supply_total?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="my-6 flex flex-col sm:flex-row justify-end gap-4">
          {purchase?.comments && (
            <div className="flex-1 text-sm text-surface-600 border border-surface-200 rounded p-3">
              <p className="font-semibold text-xs uppercase tracking-wide text-surface-400 mb-1">Comentarios</p>
              <p>{purchase.comments}</p>
            </div>
          )}
          <div className="flex flex-col gap-y-2 text-sm min-w-[180px]">
            <div className="flex w-full">
              <p className="mr-1 w-3/4">Sub total</p>
              <p className="border p-0.5 border-surface-200 w-full px-3 text-right">
                {purchase?.subtotal?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4">Envío</p>
              <p className="border p-0.5 border-surface-200 w-full px-3 text-right">
                {(purchase?.shipping_cost ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </p>
            </div>
            <div className="flex w-full font-semibold">
              <p className="mr-1 w-3/4">Total</p>
              <p className="border p-0.5 border-surface-200 w-full px-3 text-right">
                {purchase?.total?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PurchaseBaseFormat
