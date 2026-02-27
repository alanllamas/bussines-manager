'use client'
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Client } from "@/api/hooks/clients/getClient";
import ClientTab from "./ClientTab";
import ContactsTab from "./ContactsTab";
import TicketsTab from "./TicketsTab";
import InvoicesTab from "./InvoicesTab";
import EditClientTab from "./EditClientTab";

const tabClass = "shrink-0 px-5 py-2.5 text-sm font-medium text-surface-500 border-b-2 border-transparent transition-colors hover:text-surface-900 data-[selected]:text-primary-600 data-[selected]:border-primary-500"

const ClientTabs: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  return (
    <div className="text-surface-700">
      <TabGroup>
        <TabList className="flex overflow-x-auto px-6 border-b border-surface-200 h-11 items-center scrollbar-none">
          <Tab className={tabClass}>{client?.name}</Tab>
          <Tab className={tabClass}>Contactos</Tab>
          <Tab className={tabClass}>Notas</Tab>
          <Tab className={tabClass}>Cortes</Tab>
          <Tab className={tabClass}>Editar</Tab>
        </TabList>
        <TabPanels className="p-6">
          <ClientTab client={client}/>
          <ContactsTab client={client}/>
          <TicketsTab tickets={client?.tickets} clientId={client?.id}/>
          <InvoicesTab clientId={client?.documentId}/>
          <EditClientTab client={client}/>
          <TabPanel>Content 6</TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  )
}
export default ClientTabs
