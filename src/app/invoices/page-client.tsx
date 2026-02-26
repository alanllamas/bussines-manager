'use client'
import React from "react";
import InvoiceList from "@/components/invoices/InvoiceList";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const ClientInvoices: React.FC = () => {
  const { isLoading } = useAuthGuard();

  if (isLoading) return null;

  return (
    <section className="w-full flex flex-col items-center">
      <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
        <InvoiceList />
      </section>
    </section>
  );
}

export default ClientInvoices
