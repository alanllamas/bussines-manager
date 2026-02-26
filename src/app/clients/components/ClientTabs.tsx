'use client'
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Client } from "@/api/hooks/clients/getClient";
import ClientTab from "./ClientTab";
import ContactsTab from "./ContactsTab";
import TicketsTab from "./TicketsTab";
import InvoicesTab from "./InvoicesTab";
import EditClientTab from "./EditClientTab";

const ClientTabs: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  return (
    <TabGroup className="text-surface-700 p-4">
      <TabList>
        <Tab className="px-6 py-3 bg-surface-100 hover:bg-surface-200 hover:text-surface-900 mr-2" >Cliente</Tab>
        <Tab className="px-6 py-3 bg-surface-100 hover:bg-surface-200 hover:text-surface-900 mx-2" >Contactos</Tab>
        <Tab className="px-6 py-3 bg-surface-100 hover:bg-surface-200 hover:text-surface-900 mx-2" >Notas</Tab>
        <Tab className="px-6 py-3 bg-surface-100 hover:bg-surface-200 hover:text-surface-900 mx-2" >Cortes</Tab>
        <Tab className="px-6 py-3 bg-surface-100 hover:bg-surface-200 hover:text-surface-900 mx-2" >Editar</Tab>
      </TabList>
      <TabPanels>
        <h2 className="font-bold p-4">{client?.name}</h2>

        <ClientTab client={client}/>
        <ContactsTab client={client}/>
        <TicketsTab tickets={client?.tickets} clientId={client?.id}/>
        <InvoicesTab invoices={client?.invoices} clientId={client?.documentId}/>
        <EditClientTab client={client}/>
        <TabPanel>Content 6</TabPanel>
      </TabPanels>
    </TabGroup>
  )
}
 export default ClientTabs