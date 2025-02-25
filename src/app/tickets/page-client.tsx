'use client'
import useGetTickets from "@/api/hooks/getTickets";
import React, { useEffect, useState } from "react";

const ClientTickets: React.FC<any> = () => {

  const [tickets, setTickets] = useState([])
  const {
    tickets: ticketsData,
    error,
    isLoading
  } = useGetTickets()
  useEffect(() => {
    if (!error && !isLoading) {
      
      console.log('ticketsData: ', ticketsData);
      setTickets(ticketsData)
    }
  }, [ticketsData])


  const ticketTable = (tickets?: any[]) => {
    return <>
      {
        tickets?.map((ticket: any, index: number) => {
          return <tr key={`ticket-${index}`}>
            <td>{ticket.ticket_number}</td>
            <td>{ticket.client}</td>
            <td>{ticket.sale_date}</td>
            <td>{ticket.total}</td>
          </tr>
        })
      }
    </>
  }
  
  
  return<>
    {
      isLoading
        ? <p>Loading</p>
        : <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
          <div className="flex justify-between">
            <h1>Notas</h1>
            <button className="px-6 py-2 bg-neutral-400">Crear nota</button>
          </div>
          <table className="w-full p-4 text-center mt-8">
            <thead>
              <tr>
                <th>Folio</th>
                <th>cliente</th>
                <th>fecha de venta</th>
                <th>monto</th>
                <th>acciones</th>
              </tr>
            </thead>
            <tbody>
              {
                tickets?.map((ticket: any, index: number) => {
                  console.log('ticket: ', ticket);
                  
                  return <tr key={`ticket-${index}`}>
                    <td><a href={`/tickets/${ticket.id}`}>{ticket.ticket_number}</a></td>
                    <td>{ticket.client.name}</td>
                    <td>{new Date(ticket.sale_date).toLocaleDateString()}</td>
                    <td>$ {ticket.total}</td>
                    <td>edit | print</td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </section>
    }
  </>
}
 export default ClientTickets