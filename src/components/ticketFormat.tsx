'use client'
import { useAuth } from "@/app/context/AuthUserContext"
import Image from "next/image"
import React, { useEffect, useRef, useState } from "react"
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { useReactToPrint } from "react-to-print"
import logo from "@/public/logo.png"
import { ProductVariant, TicketProduct } from "@/api/hooks/tickets/getTickets"

const TicketFormat: React.FC<any> = (ticket: any) => {
  // const { signIn } = useAuth();
  // @ts-expect-error no type found
  const [printTicket, setPrintTicket] = useState<Ticket>(null)

  const contentRef = useRef<HTMLDivElement>(null);
  
  const Print = useReactToPrint({ contentRef, documentTitle: `Nota-${printTicket?.ticket_number}-${printTicket?.client?.name?.toLocaleUpperCase()}-${new Date(printTicket?.sale_date || '')?.toLocaleDateString()}` });
  
  useEffect(() => {
    // console.log(interval);
    if (ticket) {
      console.log(ticket);
      setPrintTicket(ticket.ticket)
      Print()
    }
  }, [ticket])

  useEffect(() => {
    // console.log(interval);
    if (printTicket) {
      Print()
    }
  }, [printTicket])

  return <section ref={contentRef} className="hidden print:block w-1/3 print:w-full print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-neutral-900 border border-neutral-200">
      <div className="flex justify-between my-3 items-center">
        <img className="w-64" src={logo.src} alt="" />
        <div className="font-bold flex flex-col mt-6 gap-4 w-1/4">
          <span className="flex justify-around">
            <span>Folio:</span>
            <span>{printTicket?.ticket_number?.toString().padStart(6, "0")}</span>
          </span>
          <span className="flex justify-between">
            <span>Fecha:</span>
            <span>{new Date(printTicket?.sale_date || '')?.toLocaleDateString()}</span>
          </span>
        </div>
      </div>
      <div className="flex mt-4 mb-8">
        <h4 className="mr-8">Cliente: </h4><span className="w-full flex justify-center border-b border-neutral-500">{printTicket?.client?.name}</span>
      </div>
      <div className="flex flex-col my-3">
        <table className="print:text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Producto</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Variantes</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Cantidad</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Precio</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Importe</th>
            </tr>
          </thead>
          <tbody>
            {
              printTicket?.products?.map((product: TicketProduct, index: number) => {
                return <tr key={index} className="">
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200">{ product?.product?.name|| ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200">{ product?.product_variants?.map((variant: ProductVariant) => variant.name ).join(' | ') || ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right">{ product?.quantity } {product?.product?.measurement_unit|| ''}</td>
                  {/* <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right">$ { product?.price || ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right">$ { product?.product_total || ''}</td> */}
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right h-8">{ product?.price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right h-8">{ product?.product_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                </tr>
              })
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
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{printTicket?.sub_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Envio</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{printTicket?.shipping_price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Total</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{printTicket?.total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
} 

export default TicketFormat