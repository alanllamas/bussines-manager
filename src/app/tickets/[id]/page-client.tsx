'use client'
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

  return <TicketFormat ticket={ticket} />
}

export default ClientTicket
