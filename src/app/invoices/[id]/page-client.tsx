'use client'
import React from "react"
import InvoiceFormat from "@/components/invoices/invoiceFormat";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const ClientInvoice: React.FC<{ id: number }> = ({ id }) => {
  const { isLoading } = useAuthGuard();

  if (isLoading) return null;

  return <InvoiceFormat id={id} />
}

export default ClientInvoice
