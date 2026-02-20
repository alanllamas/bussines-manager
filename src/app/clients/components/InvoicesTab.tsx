'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import InvoiceListByCLient from "@/components/invoices/InvoiceListByClient";

const InvoicesTab: React.FC<any> = ({invoices, clientId}) => {
  console.log('invoices: ', invoices);
  
  return (
    <TabPanel className="px-4 q">
      <InvoiceListByCLient invoicesData={invoices} clientId={clientId}/>

    </TabPanel>
  )
}
 export default InvoicesTab