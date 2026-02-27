'use client'
import React, { useEffect, useRef, useState } from "react"
import TicketBaseFormat from "./ticketBaseFormat"
import { useReactToPrint } from "react-to-print"
import { PrintTicketFormat } from "@/api/hooks/tickets/getTicket"

const TicketPrintFormat: React.FC<any> = ({ticket}) => {
  // const { signIn } = useAuth();
  // @ts-expect-error no type found
  const [printTicket, setPrintTicket] = useState<Ticket>(null)
  const date = new Date(ticket?.sale_date || '').toLocaleDateString()

  const contentRef = useRef<HTMLDivElement>(null);
  const PrintTicket = useReactToPrint(PrintTicketFormat(contentRef, ticket));
  
  useEffect(() => {
    // console.log(interval);
    if (ticket) {
      // console.log(ticket);
      setPrintTicket(ticket)
      // PrintTicket(contentRef, printTicket)
    }
  }, [ticket])

  useEffect(() => {
    // console.log(interval);
    if (printTicket) {
      PrintTicket()
    }
  }, [printTicket])

  return <section ref={contentRef} className="hidden print:block w-1/3 print:w-full print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-surface-900 border border-surface-200">
      <TicketBaseFormat ticket={ticket} date={date} />

    </section>
} 

export default TicketPrintFormat