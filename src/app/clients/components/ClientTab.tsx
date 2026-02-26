'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import { Client } from "@/api/hooks/clients/getClient";

const ClientTab: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  const copyParam = (param: string) => navigator.clipboard.writeText(param)

  const Row = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-[200px_1fr] items-start py-2.5 border-b border-surface-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-surface-400">{label}</span>
      {value !== undefined && value !== null && value !== ''
        ? <div className="flex items-center gap-2">
            <span className="text-sm text-surface-800 truncate">
              {value === true ? 'Sí' : value === false ? 'No' : value}
            </span>
            <button className="btn-icon flex-shrink-0" onClick={() => copyParam(String(value))}>
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
            </button>
          </div>
        : <span className="text-sm text-surface-400">No disponible</span>
      }
    </div>
  )

  return (
    <TabPanel>
      {client?.taxing_info
        ? (
          <div>
            <div className="grid grid-cols-2 gap-x-12">
              <div>
                <Row label="RFC"               value={client.taxing_info.taxing_RFC} />
                <Row label="Razón Social"      value={client.taxing_info.taxing_company_name} />
                <Row label="Código Postal"     value={client.taxing_info.zip_code} />
                <Row label="Régimen Fiscal"    value={client.taxing_info.taxing_regime} />
                <Row label="Uso de CFDI"       value={client.taxing_info.taxing_CFDI_use} />
                <Row label="Correo"            value={client.taxing_info.email} />
              </div>
              <div>
                <Row label="Forma de Pago"     value={client.taxing_info.payment_method} />
                <Row label="Método de Pago"    value={client.taxing_info.taxing_payment_method} />
                <Row label="Tipo de Pago"      value={client.taxing_info.taxing_method_of_payment} />
                <Row label="Factura Envíos"    value={client.taxing_info.shipping_invoice} />
                <Row label="Periodo de Cortes" value={client.taxing_info.billing_period} />
                <Row label="Periodo Facturas"  value={client.taxing_info.invoice_period} />
                <Row label="Periodo de Pagos"  value={client.taxing_info.payment_period} />
              </div>
            </div>

            {client.taxing_info.comments && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-2">Comentarios</p>
                <div className="p-4 border border-surface-200 rounded text-sm text-surface-700 bg-surface-50">
                  {client.taxing_info.comments}
                </div>
              </div>
            )}
          </div>
        )
        : <p className="text-sm text-surface-400">Favor de capturar la información fiscal del cliente.</p>
      }
    </TabPanel>
  )
}
export default ClientTab
