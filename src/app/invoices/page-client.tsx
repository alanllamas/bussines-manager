'use client'
// ClientInvoices — página /invoices: lista global de cortes.
// useAuthGuard: retorna null mientras carga (evita flash). InvoiceList hace su propio fetch.
import React from "react";
import InvoiceList from "@/components/invoices/InvoiceList";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const ClientInvoices: React.FC = () => {
  const { isLoading } = useAuthGuard();

  if (isLoading) return null;

  return (
    <section className="w-full flex flex-col items-center">
      <section className="w-full py-6 px-4 sm:w-11/12 sm:py-8 sm:px-6 lg:w-9/12 lg:py-12 lg:px-8 bg-surface-50 text-surface-900">
        <InvoiceList />
      </section>
    </section>
  );
}

export default ClientInvoices
