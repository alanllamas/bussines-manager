'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import TicketList from "@/components/tickets/ticketList";

const InvoicesTab: React.FC<any> = ({tickets, clientId}) => {
  return (
    <TabPanel className="px-4 q">
      <TicketList ticketData={tickets} itemsPerPage={10} clientId={clientId}/>
    </TabPanel>
  )
}
 export default InvoicesTab