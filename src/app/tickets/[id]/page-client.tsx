'use client'
import useGetTicket from "@/api/hooks/getTicket"
import { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/getTickets"
import React, { useEffect, useState } from "react"
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import logo from "@/public/logo.png"
import Image from "next/image";

const emptyTicket: TicketProduct = {
  id: 0
}
const ClientTicket: React.FC<{ id: number }> = ({ id }) => {

  const [ticket, setTicket] = useState<Ticket>()
  console.log('id: ', id);
  
  const {
    ticket: ticketData,
    error: ticketError,
    isLoading: ticketIsLoading,
  } = useGetTicket(id)

  useEffect(() => {
    if (ticketData &&!ticketError && !ticketIsLoading) {
      const data = ticketData.data
      while (data.products.length < 10) {
        data.products.push(emptyTicket)
      }
      // data.products = data.products.fill({}, data.products.length, 10)
      setTicket(data)
      
    }
  },[ticketData, ticketError, ticketIsLoading])

  
  useEffect(() => {
    console.log('ticket: ', ticket);
    
  },[ticket])


  const date = new Date(ticket?.sale_date || '').toLocaleDateString()


  const contentRef = useRef<HTMLDivElement>(null);
  const Print = useReactToPrint({ contentRef });
  return <section className="flex flex-col w-full justify-center items-center">
  <div className="text-neutral-900">

    <h1>Client Ticket</h1>
    <button onClick={() => Print()}>imprimir</button>
  </div>

    <section ref={contentRef} className="w-1/3 print:w-full print:shadow-none print:border-none shadow-xl my-8 p-4 text-neutral-900 border border-neutral-200">
      <div className="flex justify-between my-3">
        {/* <img className="w-60 h-20" src="https://site--strapi-business-manager--gvp7rrrvnwfz.code.run/uploads/logo_16af861cf8.png" alt="" /> */}
        <Image width={240} height={80} src={logo} alt="logo" />
        <div className="font-bold flex flex-col mt-6"><span>Folio: {ticket?.ticket_number}</span><span>Fecha: {date }</span></div>
      </div>
      <div className="flex my-3">
        <h4 className="mr-8">Cliente: </h4><span className="w-full flex justify-center border-b border-neutral-500">{ticket?.client?.name}</span>
      </div>
      <div className="flex flex-col my-3">
        <h4 className="mr-8">Productos: </h4>
        <table className="">
          <thead>
            <tr>
              <th className="px-2 py-1 border border-neutral-300">Producto</th>
              <th className="px-2 py-1 border border-neutral-300">Variantes</th>
              <th className="px-2 py-1 border border-neutral-300">Cantidad</th>
              <th className="px-2 py-1 border border-neutral-300">Precio</th>
              <th className="px-2 py-1 border border-neutral-300">Importe</th>
            </tr>
          </thead>
          <tbody>
            {
              ticket?.products?.map((product: TicketProduct, index: number) => {
                return <tr key={index} className="">
                  <td className="px-2 border border-neutral-300">{ product?.product?.name|| ''}</td>
                  <td className="px-2 border border-neutral-300">{ product?.product_variants?.map((variant: ProductVariant) => variant.name ).join(' | ') || ''}</td>
                  <td className="px-2 border border-neutral-300 text-right">{ product?.quantity } {product?.product?.measurement_unit|| ''}</td>
                  {/* <td className="px-2 border border-neutral-300 text-right">$ { product?.price || ''}</td>
                  <td className="px-2 border border-neutral-300 text-right">$ { product?.product_total || ''}</td> */}
                  <td className="px-2 border border-neutral-300 text-right h-8">{ product?.price ? `$ ${product?.price}` : ''}</td>
                  <td className="px-2 border border-neutral-300 text-right h-8">{ product?.product_total ? `$ ${product?.product_total}` : ''}</td>
                </tr>
              })
            }
            
          </tbody>

        </table>
        <div className="my-3 flex justify-between">
          <div className="w-2/3">
            <p>Tu compra ayuda a la conservación de nuestros maíces nativos. Gracias!</p>
            <p><span className="font-bold">Email: </span>itacatedemaiz@gmail.com</p>
            <p><span className="font-bold">Telefono: </span>322-294-7798</p>



          </div>
          <div className="w-1/3">
            <div className="flex">
              <p className="mr-3 w-1/2">Sub total</p>
              <p className="border border-neutral-300 w-2/3 px-3 text-right">$ {ticket?.sub_total}</p>
            </div>
            <div className="flex">
              <p className="mr-3 w-1/2">Envio</p>
              <p className="border border-neutral-300 w-2/3 px-3 text-right">$ {ticket?.shipping_price}</p>
            </div>
            <div className="flex">
              <p className="mr-3 w-1/2">Total</p>
              <p className="border border-neutral-300 w-2/3 px-3 text-right">$ {ticket?.total}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </section>
}
export default ClientTicket