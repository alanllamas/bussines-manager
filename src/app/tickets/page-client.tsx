'use client'
// ClientTickets — página /tickets: lista global de notas.
// Fetcha todos los tickets aquí (a diferencia de InvoiceList que fetcha internamente).
// Ordena por sale_date desc antes de pasar a TicketList (TicketList ordena internamente por id desc —
//   aquí se usa fecha para reflejar el orden comercial real, no el de inserción en BD).
// Spinner mientras carga; auth guard retorna null mientras valida sesión.
import React from "react";
import TicketList from "@/components/tickets/ticketList";
import useGetTickets from "@/api/hooks/tickets/getTickets";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Spinner from "@/components/ui/Spinner";

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
      <section className="w-full py-6 px-4 sm:w-11/12 sm:py-8 sm:px-6 lg:w-9/12 lg:py-12 lg:px-8 bg-surface-50 text-surface-900">
        {ticketsIsLoading
          ? <Spinner className="w-full py-24" />
          : <TicketList ticketData={tickets} itemsPerPage={10} />
        }
      </section>
    </section>
  );
}

export default ClientTickets
