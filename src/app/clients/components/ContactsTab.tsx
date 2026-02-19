'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import { Client, Contact } from "@/api/hooks/getClient";

const ContactsTab: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  const copyParam = (param: string) => {
      navigator.clipboard.writeText(param)
  }
  const generateCard = (contact: any, i: number) => {
    return <div key={i} className="w-3/12 p-4 border-2 b-neutral-900 rounded mx-2">
      <p className="flex justify-between">
        <span className="w-4/12">Nombre: </span> 
        <span className="w-8/12">{contact?.name}</span>
      </p>
      <p className="flex justify-between">
        <span className="w-4/12">Area: </span> 
        <span className="w-8/12">{contact?.area}</span>
      </p>
      <p className="flex justify-between">
        <span className="w-4/12">Correo: </span> 
        <span className="w-8/12">{contact?.email}</span>
      </p>
      <p className="flex justify-between">
        <span className="w-4/12">Extension: </span> 
        <span className="w-8/12">{contact?.extension}</span>
      </p>
      <p className="flex justify-between">
        <span className="w-4/12">Titulo Laboral: </span>
        <span className="w-8/12">{contact?.job_title}</span>
      </p>
      <p className="flex justify-between">
        <span className="w-4/12">Telefono: </span> 
        <span className="w-8/12">{contact?.phone}</span>
      </p>
    </div>
  }

  return (
    <TabPanel className="p-4">
      {
        client?.contacts?.length !== undefined && client?.contacts?.length > 0
        ? ( <div className="flex-col p-4">
              <div className=" flex gap-4">
                  {
                    client?.contacts?.map((contact: Contact, i: number) => generateCard(contact, i))
                  }
              </div>
            </div>)
        : ( <div className="flex">
              <h3 className="font-bold">Favor de capturar la data fiscal del cliente</h3>
            </div>)
      }
      
    </TabPanel>
  )
}
 export default ContactsTab