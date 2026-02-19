'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import TicketList from "@/components/ticketList";

const TicketsTab: React.FC<any> = ({tickets, clientId}) => {
  return (
    <TabPanel className="p-4 q">
      <TicketList ticketData={tickets} itemsPerPage={10} clientId={clientId}/>
    </TabPanel>
  )
}
 export default TicketsTab