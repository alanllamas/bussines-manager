'use client'
import React from "react";
import useGetClients from "@/api/hooks/clients/getClients";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const ClientsSideBar: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard();

  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()

  if (authLoading) return null;

  const clients = (!clientsError && !clientsIsLoading) ? (clientsData?.data ?? []) : [];

  return (
    <section className="w-3/12 bg-neutral-200 text-neutral-900">
      {clients.map((client, index: number) => (
        <Link
          key={`client-${index}`}
          href={`/clients/${client.documentId}`}
          className="flex items-center justify-between shadow-md bg-neutral-200 rounded-md px-6 py-4 hover:bg-neutral-400 hover:text-neutral-700"
        >
          <h4>{client.name}</h4> <h4>{'>'}</h4>
        </Link>
      ))}
      <Link
        href={`/clients/new`}
        className="flex items-center justify-between shadow-md bg-neutral-200 rounded-md px-6 py-4 hover:bg-neutral-400 hover:text-neutral-700"
      >
        <h4>Crear Cliente Nuevo</h4> <h4>{'+'}</h4>
      </Link>
    </section>
  );
}

export default ClientsSideBar
