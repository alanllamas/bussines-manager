'use client'
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