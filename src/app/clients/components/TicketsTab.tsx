'use client'
// TicketsTab — panel de notas del cliente (Tab 3 en ClientTabs).
// Thin wrapper: pasa client.tickets (pre-cargados) + client.id (numeric) a TicketList.
// hideClient=true oculta la columna Cliente (ya implícita en el contexto del tab).
import React from "react";
import { TabPanel } from '@headlessui/react'
import TicketList from "@/components/tickets/ticketList";
import { Ticket } from "@/types";

interface TicketsTabProps { tickets?: Ticket[]; clientId?: string | number }
const TicketsTab: React.FC<TicketsTabProps> = ({tickets, clientId}) => {
  return (
    <TabPanel className="px-4 py-4 sm:px-6">
      <TicketList ticketData={tickets} itemsPerPage={10} clientId={clientId} hideClient />
    </TabPanel>
  )
}
 export default TicketsTab