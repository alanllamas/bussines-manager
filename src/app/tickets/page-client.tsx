'use client'
import useGetTickets, { Ticket } from "@/api/hooks/tickets/getTickets";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthUserContext";
import TicketsForm from "@/components/forms/ticketsForm";
import TicketList from "@/components/tickets/ticketList";

// import { useAuth } from "@/context/AuthUserContext";
// import { useRouter } from "next/navigation";


const ClientTickets: React.FC = () => {
  // @ts-expect-error no type found
 const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()
  
  useEffect(() => {
    if(!user) {
      const interval =
        setInterval(() => {
          window.location.pathname = '/'
        }, 100)
      setinterval(interval)
    }

  }, [])
  // Listen for changes on loading and authUser, redirect if needed

  const [tickets, setTickets] = useState<Ticket[]>()

  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading,
  } = useGetTickets()


 
  useEffect(() => {
    if ((!ticketsError && !ticketsIsLoading && ticketsData.data)) {
      
      // console.log('ticketsData.data: ', ticketsData.data);
      // console.log('meta.pagination.total: ', ticketsData.meta.pagination.total);
      const data = ticketsData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
        const dateA: number = new Date(a.sale_date).valueOf();
        const dateB: number = new Date(b.sale_date).valueOf()
        return dateB - dateA;
      });
      setTickets(data)
    }
  }, [ticketsIsLoading, ticketsData.data, ticketsError])


  return <section className="w-full flex flex-col items-center">
    {
      ticketsIsLoading
        ? <p>Loading</p>
        : <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
          { tickets ? <TicketList ticketData={tickets} itemsPerPage={10}/> : null}
        </section>
    }

  </section>


}
 export default ClientTickets