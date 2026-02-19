'use client'
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Client } from "@/api/hooks/getClient";
import ClientTab from "./ClientTab";
import ContactsTab from "./ContactsTab";
import TicketsTab from "./TicketsTab";

const ClientTabs: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  return (
    <TabGroup className="text-neutral-700 p-4">
      <TabList>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mr-2" >Cliente</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Contactos</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Notas</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Cortes</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Editar</Tab>
      </TabList>
      <TabPanels>
        <ClientTab client={client}/>
        <ContactsTab client={client}/>
        <TicketsTab tickets={client?.tickets} clientId={client?.id}/>
        <TabPanel>Content 4</TabPanel>
        <TabPanel>Content 5</TabPanel>
      </TabPanels>
    </TabGroup>
  )
}
 export default ClientTabs