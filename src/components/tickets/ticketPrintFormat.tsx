'use client'
// TicketPrintFormat — wrapper de auto-impresión usado por TicketList.
// hidden en pantalla, print:block al imprimir — igual que InvoicePrintFormat.
// El padre desmonta/remonta el componente pasando null → ticket vía setPrintTicket + setTimeout(1000),
//   lo que fuerza una nueva instancia para impresiones consecutivas (sin printKey explícito).
//
// Dos-stage useEffect (sin setTimeout — ticket ya disponible al montar):
//   Effect 1 (ticket dep): sincroniza prop → printTicket state para disparar Effect 2.
//   Effect 2 (printTicket dep): llama PrintTicket() directamente — no necesita setTimeout
//     porque PrintTicketFormat recibe el ticket completo y la fecha se calcula del prop, no del state.
import React, { useEffect, useRef, useState } from "react"
import TicketBaseFormat from "./ticketBaseFormat"
import { useReactToPrint } from "react-to-print"
import { PrintTicketFormat } from "@/api/hooks/tickets/getTicket"
import { Ticket } from "@/types"

interface TicketPrintFormatProps { ticket: Ticket }
const TicketPrintFormat: React.FC<TicketPrintFormatProps> = ({ticket}) => {
  const [printTicket, setPrintTicket] = useState<Ticket | null>(null)
  const date = new Date(ticket?.sale_date || '').toLocaleDateString()

  const contentRef = useRef<HTMLDivElement>(null);
  const PrintTicket = useReactToPrint(PrintTicketFormat(contentRef, ticket));
  
  useEffect(() => {
    if (ticket) {
      setPrintTicket(ticket)
      // PrintTicket(contentRef, printTicket)
    }
  }, [ticket])

  useEffect(() => {
    if (printTicket) {
      PrintTicket()
    }
  }, [printTicket])

  return <section ref={contentRef} className="hidden print:block w-1/3 print:w-full print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-surface-900 border border-surface-200">
      <TicketBaseFormat ticket={ticket} date={date} />

    </section>
} 

export default TicketPrintFormat