'use client'
import React from "react";
import { TabPanel } from '@headlessui/react'
import { Client } from "@/api/hooks/getClient";

const ClientTab: React.FC<{client: Client | undefined}> = ({client}: {client: Client | undefined}) => {
  const copyParam = (param: string) => {
      navigator.clipboard.writeText(param)
  }
  const generateCell = (data: any) => {
    return <div className="flex justify-between px-4 pt-1">
        {
          data
            ? ( <>
                  <p className="w-10/12 truncate">{ data === true ? 'si' : data === false ? 'no' : data }</p>
                  <button onClick={() => copyParam(data)}><span className="material-symbols-outlined text-xs text-neutral-500">content_copy</span></button>
                </>
            )
            : <p className="text-neutral-300">No disponible</p>
        }
        </div>
  }

  return (
    <TabPanel>
      {/* <h3>Informacion Fiscal</h3> */}
      {
        client?.taxing_info 
        ? ( <div className="flex-col px-4">
 
              <div className=" flex gap-4">
                  <div className="w-2/12">
                    <p className="font-semibold pt-1">Régimen Fiscal: </p>
                    <p className="font-semibold pt-1">RFC: </p>
                    <p className="font-semibold pt-1">Razón Social: </p>
                    <p className="font-semibold pt-1">Dirección: </p>
                    <p className="font-semibold pt-1">Código Postal: </p>
                    <p className="font-semibold pt-1">uso de CFDI: </p>
                    <p className="font-semibold pt-1">Correo Electronico: </p>
                    <p className="font-semibold pt-1">Forma de Pago: </p>
                    <p className="font-semibold pt-1">Metodo de Pago:</p>
                    <p className="font-semibold pt-1">Tipo de Pago: </p>
                    <p className="font-semibold pt-1">Factura Envíos: </p>
                    <p className="font-semibold pt-1">Periodo de Cortes: </p>
                    <p className="font-semibold pt-1">Periodo de Facturas: </p>
                    <p className="font-semibold pt-1">Periodo de pagos: </p>
                  </div>
                  <div className="w-6/12">
                    { generateCell(client?.taxing_info?.taxing_regime) }
                    { generateCell(client?.taxing_info?.taxing_RFC) }
                    { generateCell(client?.taxing_info?.taxing_company_name) }
                    { generateCell(client?.taxing_info?.zip_code) }
                    { generateCell(client?.taxing_info?.zip_code) }
                    { generateCell(client?.taxing_info?.taxing_CFDI_use) }
                    { generateCell(client?.taxing_info?.email) }
                    { generateCell(client?.taxing_info?.payment_method) }
                    { generateCell(client?.taxing_info?.taxing_payment_method) }
                    { generateCell(client?.taxing_info?.taxing_method_of_payment) }
                    { generateCell(client?.taxing_info?.shipping_invoice) }
                    { generateCell(client?.taxing_info?.billing_period) }
                    { generateCell(client?.taxing_info?.invoice_period) }
                    { generateCell(client?.taxing_info?.payment_period) }
                  </div>
                  
              </div>
              <div className="pt-6">
                <p className="w-full font-semibold">Comentarios</p>
                <div className="p-4 border b-neutral-200 rounded w-8/12">

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