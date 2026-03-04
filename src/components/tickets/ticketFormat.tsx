'use client'
// TicketFormat — vista de detalle de una nota en /tickets/[documentId].
// Recibe el ticket como prop directamente (el padre lo fetcha, no hace fetch propio).
// PrintTicketFormat config (de getTicket.ts) configura documentTitle + nombre de archivo para useReactToPrint.
// Fecha formateada con toLocaleDateString() (locale del sistema, no es-MX explícito — distinto a invoiceFormat).
// Botón "imprimir" manual — sin auto-print (ver TicketPrintFormat para ese patrón).
import React, { useRef } from "react"
import { PrintTicketFormat } from "@/api/hooks/tickets/getTicket"
import TicketBaseFormat from "./ticketBaseFormat"
import { useReactToPrint } from "react-to-print"
import { Ticket } from "@/types"

interface TicketFormatProps { ticket: Ticket }
const TicketFormat: React.FC<TicketFormatProps> = ({ticket}) => {
 
  const date = new Date(ticket?.sale_date || '').toLocaleDateString()
  const contentRef = useRef<HTMLDivElement>(null);
  const PrintTicket = useReactToPrint(PrintTicketFormat(contentRef, ticket));

  return <section className="flex flex-col w-full justify-center items-center">
    <div className="w-full pt-4 pb-4 px-4 sm:px-8 md:px-16 lg:px-32 flex justify-end">
      <button className="btn-secondary" onClick={() => PrintTicket()}>
        <span className="material-symbols-outlined text-[16px]">print</span>
        Imprimir
      </button>
    </div>

    <section ref={contentRef} className="xl:w-1/3 print:w-full lg:w-1/2 md:w-3/4 print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-surface-900 border border-surface-200">
      <TicketBaseFormat ticket={ticket} date={date} />
    </section>
  </section>
} 

export default TicketFormat