'use client'
import React from "react"
import useGetClients from "@/api/hooks/clients/getClients"
import Link from "next/link"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { usePathname } from "next/navigation"

const ClientsSideBar: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const path = usePathname()

  const { clients: clientsData, error, isLoading } = useGetClients()

  if (authLoading) return null

  const clients = (!error && !isLoading) ? (clientsData?.data ?? []) : []

  return (
    <aside className="w-64 shrink-0 border-r border-surface-200 bg-white h-[calc(100vh-5rem)] flex flex-col sticky top-20 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Clientes</h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {clients.map((client) => {
          const active = path === `/clients/${client.documentId}`
          return (
            <Link
              key={client.documentId}
              href={`/clients/${client.documentId}`}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500 font-medium'
                  : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person</span>
                {client.name}
              </span>
              <span className="material-symbols-outlined text-[16px] text-surface-400">chevron_right</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-surface-200">
        <Link
          href="/clients/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Cliente
        </Link>
      </div>
    </aside>
  )
}

export default ClientsSideBar
