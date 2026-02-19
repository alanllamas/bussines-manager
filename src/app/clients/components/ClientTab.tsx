'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import { Client } from "@/api/hooks/getClient";

const ClientTab: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  const copyParam = (param: string) => {
      navigator.clipboard.writeText(param)
  }
  const generateCell = (data: any) => {
    return <div className="flex justify-between px-4">
        {
          data
            ? ( <>
                  <p>{ data }</p>
                  <button onClick={() => copyParam(data)}><span className="material-symbols-outlined text-xs text-neutral-500">content_copy</span></button>
                </>
            )
            : <p className="text-neutral-300">No disponible</p>
        }
        </div>
  }

  return (
    <TabPanel className="p-4">
      <h2 className="font-bold">{client?.name}</h2>
      {/* <h3>Informacion Fiscal</h3> */}
      {
        client?.taxing_info 
        ? ( <div className="flex-col p-4">
              <div className="flex py-4">
 
                <div className="w-1/2 flex gap-4">
                  <div className="w-2/6">
                    <p className="font-semibold">Régimen Fiscal: </p>
                    <p className="font-semibold">RFC: </p>
                    <p className="font-semibold">Razón Social: </p>
                    <p className="font-semibold">Dirección: </p>
                    <p className="font-semibold">Código Postal: </p>
                    <p className="font-semibold">uso de CFDI: </p>
                    <p className="font-semibold">Correo Electronico: </p>
                  </div>
                  <div className="w-4/6">
                    { generateCell(client?.taxing_info?.taxing_regime) }
                    { generateCell(client?.taxing_info?.taxing_RFC) }
                    { generateCell(client?.taxing_info?.taxing_company_name) }
                    { generateCell(client?.taxing_info?.zip_code) }
                    { generateCell(client?.taxing_info?.zip_code) }
                    { generateCell(client?.taxing_info?.taxing_CFDI_use) }
                    { generateCell(client?.taxing_info?.email) }
                  </div>
                  
                </div>
                <div className="w-1/2 flex gap-4">
                  <div className="w-2/6">
                    <p className="font-semibold">Forma de Pago: </p>
                    <p className="font-semibold">Metodo de Pago:</p>
                    <p className="font-semibold">Tipo de Pago: </p>
                    <p className="font-semibold">Factura Envíos: </p>
                    <p className="font-semibold">Periodo de Cortes: </p>
                    <p className="font-semibold">Periodo de Facturas: </p>
                    <p className="font-semibold">Periodo de pagos: </p>
                  </div>
                  <div className="w-4/6">
                    { generateCell(client?.taxing_info?.payment_method) }
                    { generateCell(client?.taxing_info?.taxing_payment_method) }
                    { generateCell(client?.taxing_info?.taxing_method_of_payment) }
                    { generateCell(client?.taxing_info?.shipping_invoice) }
                    { generateCell(client?.taxing_info?.billing_period) }
                    { generateCell(client?.taxing_info?.invoice_period) }
                    { generateCell(client?.taxing_info?.payment_period) }
                  </div>
                  
                </div>
              </div>
              <div>
                <p className="w-full font-semibold">Comentarios</p>
                <div className="p-4 border b-neutral-200 rounded">

                  { client?.taxing_info?.comments }
                </div>

              </div>
            </div>)
        : ( <div className="flex">
              <h3 className="font-bold">Favor de capturar la data fiscal del cliente</h3>
            </div>)
      }
      
    </TabPanel>
  )
}
 export default ClientTab