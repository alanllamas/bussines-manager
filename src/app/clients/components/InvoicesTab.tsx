'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import InvoiceListByCLient from "@/components/invoices/InvoiceListByClient";

interface InvoicesTabProps { clientId?: string }
const InvoicesTab: React.FC<InvoicesTabProps> = ({clientId}) => {
  return (
    <TabPanel className="px-4 q">
      <InvoiceListByCLient clientId={clientId ?? ''}/>

    </TabPanel>
  )
}
 export default InvoicesTab