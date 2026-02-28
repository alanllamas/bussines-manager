'use client'
// TicketBaseFormat — layout compartido entre TicketFormat (pantalla) y TicketPrintFormat (impresión).
// Recibe el ticket y la fecha ya formateada como string desde el padre.
// Props tipadas como `any` — pendiente ADR-003 para tipos estrictos.
// Tabla de productos: siempre rellena hasta 10 filas con filas vacías (Math.max(0, 10 - products.length))
//   para dar un aspecto de formulario impreso uniforme.
// `print:text-sm` en la tabla + `print:border-gray-200` en celdas — ajustes visuales solo en impresión.
// Contacto del negocio (email, teléfono) hard-codeado — no es configurable desde Strapi.
// Totales: sub_total · envío · total (sin IVA desglosado, a diferencia de invoiceBaseFormat).
import React from "react"
import logo from "@/public/logo.png"
import { ProductVariant, TicketProduct } from "@/api/hooks/tickets/getTickets"
import { PrintTicketFormat } from "@/api/hooks/tickets/getTicket"

const TicketBaseFormat: React.FC<any> = ({ticket, date}) => {

  return <section>
      <div className="flex justify-between my-3 items-center">
        <img className="w-64" src={logo.src} alt="" />
        <div className="font-bold flex flex-col mt-6 gap-4 w-1/4">
          <span className="flex justify-around">
            <span>Folio:</span>
            <span>{String(ticket?.ticket_number ?? '').padStart(5, '0')}</span>
          </span>
          <span className="flex justify-between">
            <span>Fecha:</span>
            <span>{date}</span>
          </span>
        </div>
      </div>
      <div className="flex mt-4 mb-8">
        <h4 className="mr-8">Cliente: </h4><span className="w-full flex justify-center border-b border-neutral-500">{ticket?.client?.name}</span>
      </div>
      <div className="flex flex-col my-3">
        <table className="print:text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200">Producto</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200">Variantes</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200">Cantidad</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200">Precio</th>
              <th className="px-2 py-1 border border-surface-200 print:border-gray-200">Importe</th>
            </tr>
          </thead>
          <tbody>
            {
              ticket?.products?.map((product: TicketProduct, index: number) => {
                return <tr key={index} className="">
                  <td className="px-2 border border-surface-200 print:border-gray-200">{ product?.product?.name|| ''}</td>
                  <td className="px-2 border border-surface-200 print:border-gray-200">{ product?.product_variants?.map((variant: ProductVariant) => variant.name ).join(' | ') || ''}</td>
                  <td className="px-2 border border-surface-200 print:border-gray-200 text-right">{ product?.quantity } {product?.product?.measurement_unit|| ''}</td>
                  <td className="px-2 border border-surface-200 print:border-gray-200 text-right h-8">{ product?.price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                  <td className="px-2 border border-surface-200 print:border-gray-200 text-right h-8">{ product?.product_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                </tr>
              })
            }
            {
              Array.from({ length: Math.max(0, 10 - (ticket?.products?.length ?? 0)) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="px-2 border border-surface-200 print:border-gray-200">&nbsp;</td>
                  <td className="px-2 border border-surface-200 print:border-gray-200"></td>
                  <td className="px-2 border border-surface-200 print:border-gray-200"></td>
                  <td className="px-2 border border-surface-200 print:border-gray-200"></td>
                  <td className="px-2 border border-surface-200 print:border-gray-200"></td>
                </tr>
              ))
            }
          </tbody>

        </table>
        <div className="my-8 flex justify-between">
          <div className="w-2/3 pr-4 pt-4 text-sm">
            <p className="mb-2">Tu compra ayuda a la conservación de nuestros maíces nativos. Gracias!</p>
            <p><span className="font-bold">Email: </span>itacatedemaiz@gmail.com</p>
            <p><span className="font-bold">Telefono: </span>322-294-7798</p>
          </div>
          <div className=" flex  flex-col w-1/2 gap-y-2 mt-2">
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Sub total</p>
              <p className="border p-0.5 border-surface-200 w-full px-3 text-right">{ticket?.sub_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Envio</p>
              <p className="border p-0.5 border-surface-200 w-full px-3 text-right">{ticket?.shipping_price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Total</p>
              <p className="border p-0.5 border-surface-200 w-full px-3 text-right">{ticket?.total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
} 

export default TicketBaseFormat