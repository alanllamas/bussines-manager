'use client'
import useGetTicket from "@/api/hooks/getTicket"
import { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/getTickets"
import React, { useEffect, useState } from "react"
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import logo from "@/public/logo.png"
import { useAuth } from "@/app/context/AuthUserContext";

const emptyTicket: TicketProduct = {
  id: 0
}
const ClientTicket: React.FC<{ id: number }> = ({ id }) => {
  // @ts-expect-error no type found
  const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()


  
  useEffect(() => {
    const interval =
      setInterval(() => {
        window.location.pathname = '/'
      }, 200)
    setinterval(interval)
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    // console.log(interval);
    if (user) {
      clearInterval(interval)
    }
  }, [user])

  const [ticket, setTicket] = useState<Ticket>()
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
      setTicket(data)
      
    }
  },[ticketData, ticketError, ticketIsLoading])

  const date = new Date(ticket?.sale_date || '').toLocaleDateString()


  const contentRef = useRef<HTMLDivElement>(null);
  const Print = useReactToPrint({ contentRef, documentTitle: `Nota-${ticket?.ticket_number}-${ticket?.client?.name?.toLocaleUpperCase()}-${new Date(ticket?.sale_date || '').toLocaleDateString()}` });

  return <section className="flex flex-col w-full justify-center items-center">
  <div className="text-neutral-900 flex justify-end w-1/2 py-4">
    <button className="bg-neutral-400 px-3 py-2" onClick={() => Print()}>imprimir</button>
  </div>

    <section ref={contentRef} className="xl:w-1/3 print:w-full lg:w-1/2 md:w-3/4 print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-neutral-900 border border-neutral-200">
      <div className="flex justify-between my-3 items-center">
        <img className="w-64" src={logo.src} alt="" />
        <div className="font-bold flex flex-col mt-6 gap-4 w-1/4">
          <span className="flex justify-around">
            <span>Folio:</span>
            <span>{ticket?.ticket_number.toString().padStart(6, "0")}</span>
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
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-100">Producto</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-100">Variantes</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-100">Cantidad</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-100">Precio</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-100">Importe</th>
            </tr>
          </thead>
          <tbody>
            {
              ticket?.products?.map((product: TicketProduct, index: number) => {
                return <tr key={index} className="">
                  <td className="px-2 border  border-neutral-300 print:border-neutral-100">{ product?.product?.name|| ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-100">{ product?.product_variants?.map((variant: ProductVariant) => variant.name ).join(' | ') || ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-100 text-right">{ product?.quantity } {product?.product?.measurement_unit|| ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-100 text-right h-8">{ product?.price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-100 text-right h-8">{ product?.product_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
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
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{ticket?.sub_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Envio</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{ticket?.shipping_price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Total</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{ticket?.total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </section>
}
export default ClientTicket