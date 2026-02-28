'use client'
// InvoicesTab — panel de cortes del cliente (Tab 4 en ClientTabs).
// Thin wrapper: pasa client.documentId (string) a InvoiceListByClient.
// InvoiceListByClient hace su propio fetch filtrado por clientId.
import React from "react";
import { TabPanel } from '@headlessui/react'
import InvoiceListByCLient from "@/components/invoices/InvoiceListByClient";

interface InvoicesTabProps { clientId?: string }
const InvoicesTab: React.FC<InvoicesTabProps> = ({clientId}) => {
  return (
    <TabPanel className="px-4 py-4 sm:px-6">
      <InvoiceListByCLient clientId={clientId ?? ''}/>

    </TabPanel>
  )
}
 export default InvoicesTab