'use client'
import React, { useState } from "react"
import useGetClients from "@/api/hooks/clients/getClients"
import Link from "next/link"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import { usePathname } from "next/navigation"
import Spinner from "@/components/ui/Spinner"

const ClientsSideBar: React.FC = () => {
  const { isLoading: authLoading } = useAuthGuard()
  const path = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const { clients: clientsData, error, isLoading } = useGetClients()

  if (authLoading) return null

  const clients = (!error && !isLoading) ? (clientsData?.data ?? []) : []

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 border-r border-surface-200 bg-white lg:h-[calc(100vh-5rem)] flex flex-col lg:sticky lg:top-20 lg:overflow-hidden">
      {/* Mobile toggle header */}
      <div
        className="lg:hidden flex items-center justify-between px-4 h-11 border-b border-surface-200 cursor-pointer"
        onClick={() => setIsMobileOpen(v => !v)}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Clientes</h2>
        <span className="material-symbols-outlined text-[18px]">{isMobileOpen ? 'expand_less' : 'expand_more'}</span>
      </div>
      {/* Desktop always-visible header */}
      <div className="hidden lg:flex px-4 h-11 items-center border-b border-surface-200">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Clientes</h2>
      </div>
      <div className={`${isMobileOpen ? 'flex' : 'hidden'} lg:flex flex-col flex-1 overflow-hidden`}>
        <nav className="flex-1 overflow-y-auto py-2">
          {isLoading && <Spinner size="sm" className="w-full py-6" />}
          {clients.length === 0 && !isLoading && (
            <p className="px-4 py-6 text-sm text-surface-400 text-center">Sin clientes</p>
          )}
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
                onClick={() => setIsMobileOpen(false)}
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
      </div>
    </aside>
  )
}

export default ClientsSideBar
