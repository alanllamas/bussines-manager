'use client'
import React, { useRef } from "react"
import { PrintTicketFormat } from "@/api/hooks/tickets/getTicket"
import TicketBaseFormat from "./ticketBaseFormat"
import { useReactToPrint } from "react-to-print"

const TicketFormat: React.FC<any> = ({ticket}) => {
 
  const date = new Date(ticket?.sale_date || '').toLocaleDateString()
  const contentRef = useRef<HTMLDivElement>(null);
  const PrintTicket = useReactToPrint(PrintTicketFormat(contentRef, ticket));

  return <section className="flex flex-col w-full justify-center items-center">
    <div className="text-neutral-900 flex justify-end w-1/2 py-4">
      <button className="bg-neutral-400 px-3 py-2" onClick={() => PrintTicket()}>imprimir</button>
    </div>

    <section ref={contentRef} className="xl:w-1/3 print:w-full lg:w-1/2 md:w-3/4 print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-neutral-900 border border-neutral-200">
      <TicketBaseFormat ticket={ticket} date={date} />
    </section>
  </section>
} 

export default TicketFormat