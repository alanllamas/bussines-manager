'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import { Client } from "@/api/hooks/clients/getClient";
import ClientsForm from "@/components/forms/ClientForm";

const EditClientTab: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  
  return (
    <TabPanel>
      {/* <h3>Informacion Fiscal</h3> */}
      <ClientsForm client={client} />
    </TabPanel>
  )
}
 export default EditClientTab