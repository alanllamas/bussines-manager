'use client'
import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Client } from "@/api/hooks/getClient";

const ClientTabs: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {


  return (
    <TabGroup className="text-neutral-700">
      <TabList>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Cliente</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Contactos</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Notas</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Cortes</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Facturas</Tab>
        <Tab className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 hover:text-neutral-900 mx-2" >Editar</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <p>{client?.name}</p>
        </TabPanel>
        <TabPanel>
          
        </TabPanel>
        <TabPanel>Content 3</TabPanel>
        <TabPanel>Content 3</TabPanel>
      </TabPanels>
    </TabGroup>
  )
}
 export default ClientTabs