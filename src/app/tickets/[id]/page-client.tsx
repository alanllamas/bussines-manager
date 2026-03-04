'use client'
// ClientTicket — vista de detalle de una nota (/tickets/[id]).
// Fetcha el ticket por id (documentId) via useGetTicket.
// Padding: rellena data.products hasta 10 entradas con emptyTicket antes de pasar a TicketFormat,
//   para que ticketBaseFormat muestre la tabla completa de 10 filas aunque haya menos productos.
// Dos guards de render: null mientras auth carga, null mientras ticket no está listo.
import React, { useEffect, useState } from "react"
import useGetTicket from "@/api/hooks/tickets/getTicket"
import { Ticket, TicketProduct } from "@/api/hooks/tickets/getTickets"
import TicketFormat from "@/components/tickets/ticketFormat";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const emptyTicket: TicketProduct = { id: 0 }

const ClientTicket: React.FC<{ id: number }> = ({ id }) => {
  const { isLoading: authLoading } = useAuthGuard();
  const [ticket, setTicket] = useState<Ticket>()

  const {
    ticket: ticketData,
    error: ticketError,
    isLoading: ticketIsLoading,
  } = useGetTicket(id)

  useEffect(() => {
    if (ticketData && !ticketError && !ticketIsLoading) {
      const data = ticketData.data
      while (data.products.length < 10) {
        data.products.push(emptyTicket)
      }
      setTicket(data)
    }
  }, [ticketData, ticketError, ticketIsLoading])

  if (authLoading) return null;

  if (!ticket) return null;
  return <TicketFormat ticket={ticket} />
}

export default ClientTicket
