'use client'
import React from "react";
import TicketList from "@/components/tickets/ticketList";
import useGetTickets from "@/api/hooks/tickets/getTickets";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const ClientTickets: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard();

  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading,
  } = useGetTickets()

  if (authLoading) return null;

  const tickets = ticketsData?.data
    ? [...ticketsData.data].sort((a, b) =>
        new Date(b.sale_date).valueOf() - new Date(a.sale_date).valueOf()
      )
    : [];

  return (
    <section className="w-full flex flex-col items-center">
      <section className="w-9/12 py-12 px-8 bg-surface-50 text-surface-900">
        {ticketsIsLoading
          ? null
          : <TicketList ticketData={tickets} itemsPerPage={10} />
        }
      </section>
    </section>
  );
}

export default ClientTickets
