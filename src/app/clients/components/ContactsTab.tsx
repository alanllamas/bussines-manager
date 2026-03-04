'use client'
// ContactsTab — panel de contactos del cliente (Tab 2 en ClientTabs).
// ContactCard: componente interno con avatar (inicial del nombre), job_title,
//   y campos opcionales (area, email, phone, extension) — se renderizan solo si tienen valor.
// Los contactos vienen pre-cargados en client.contacts desde getClient populate.
import React from "react";
import { TabPanel } from '@headlessui/react'
import { Client, Contact } from "@/api/hooks/clients/getClient";

const ContactCard = ({ contact }: { contact: Contact }) => (
  <div className="border border-surface-200 rounded-lg p-5 bg-white flex flex-col gap-3 w-64">
    <div className="flex items-center gap-3 pb-3 border-b border-surface-100">
      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
        {contact?.name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-surface-900 text-sm truncate">{contact?.name || '—'}</p>
        <p className="text-xs text-surface-400 truncate">{contact?.job_title || '—'}</p>
      </div>
    </div>
    {[
      { icon: 'domain', value: contact?.area },
      { icon: 'mail', value: contact?.email },
      { icon: 'call', value: contact?.phone },
      { icon: 'dialpad', value: contact?.extension },
    ].map(({ icon, value }) => value ? (
      <div key={icon} className="flex items-center gap-2 text-sm text-surface-600">
        <span className="material-symbols-outlined text-[16px] text-surface-400">{icon}</span>
        <span className="truncate">{value}</span>
      </div>
    ) : null)}
  </div>
)

const ContactsTab: React.FC<{client: Client | undefined}> = ({client}) => {
  return (
    <TabPanel className="px-4 py-4 sm:px-6">
      {client?.contacts?.length
        ? <div className="flex flex-wrap gap-4">
            {client.contacts.map((contact: Contact, i: number) => (
              <ContactCard key={i} contact={contact} />
            ))}
          </div>
        : <p className="text-sm text-surface-400">Favor de capturar los contactos del cliente.</p>
      }
    </TabPanel>
  )
}
export default ContactsTab
