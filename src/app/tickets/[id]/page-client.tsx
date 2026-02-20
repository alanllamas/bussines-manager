'use client'
import useGetTicket from "@/api/hooks/tickets/getTicket"
import { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/tickets/getTickets"
import React, { useEffect, useState } from "react"
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import logo from "@/public/logo.png"
import { useAuth } from "@/app/context/AuthUserContext";
import TicketFormat from "@/components/tickets/ticketFormat";

const emptyTicket: TicketProduct = {
  id: 0
}
const ClientTicket: React.FC<{ id: number }> = ({ id }) => {
  // @ts-expect-error no type found
  const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()


  
  useEffect(() => {
    if(!user) {
      const interval =
        setInterval(() => {
          window.location.pathname = '/'
        }, 500)
      setinterval(interval)
    }

  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    // console.log(interval);
    if (user) {
      clearInterval(interval)
    }
  }, [user])

  const [ticket, setTicket] = useState<Ticket>()
  const {
    ticket: ticketData,
    error: ticketError,
    isLoading: ticketIsLoading,
  } = useGetTicket(id)

  useEffect(() => {
    if (ticketData &&!ticketError && !ticketIsLoading) {
      const data = ticketData.data
      while (data.products.length < 10) {
        data.products.push(emptyTicket)
      }
      setTicket(data)
      
    }
  },[ticketData, ticketError, ticketIsLoading])

  return <TicketFormat ticket={ticket}/>
}
export default ClientTicket