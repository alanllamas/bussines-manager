'use client'
import React, { useEffect, useRef, useState } from "react"
import useGetInvoice, { generateResume, PrintInvoiceFormat } from "@/api/hooks/invoices/getInvoice";
import { Invoice } from "@/api/hooks/invoices/getInvoices";
import { useReactToPrint } from "react-to-print";
import InvoiceBaseFormat from "./invoiceBaseFormat";


const InvoiceFormat: React.FC<{ id: number }> = ({ id }) => {
 
  const [invoice, setInvoice] = useState<Invoice>()
  const {
    invoice: invoiceData,
    error: invoiceError,
    isLoading: invoiceIsLoading,
  } = useGetInvoice(id)

  useEffect(() => {
    if (invoiceData &&!invoiceError && !invoiceIsLoading) {
      const data = invoiceData.data
      console.log(data);
      const { client, tickets } = data
      
      const { results, totals } = generateResume(tickets.map(ticket => `${ticket.id}`), tickets, client)
      console.log(results);
      setInvoice(data)
      
    }
  },[invoiceData, invoiceError, invoiceIsLoading])

  const contentRef = useRef<HTMLDivElement>(null);

  const initial_date = new Date(invoice?.initial_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const ending_date = new Date(invoice?.ending_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const send_date = invoice?.invoice_send_date ? new Date(invoice.invoice_send_date).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'}) : ''
  const client_name = invoice?.client?.name?.toLocaleUpperCase()
  const PrintInvoice = useReactToPrint(PrintInvoiceFormat(contentRef, client_name, initial_date, ending_date));
   
  return <section className="flex flex-col w-full justify-center items-center text-surface-900 py-5">
    <div className="w-full pb-4 px-32 flex justify-end">
      <button className="px-4 py-2 bg-surface-200" onClick={() => PrintInvoice()}>Imprimir</button>
    </div>
    <section ref={contentRef} className="flex flex-col print:w-full print:shadow-none w-1/2 px-10 py-3 shadow-xl border border-gray-300 text-sm">
    { invoice && <InvoiceBaseFormat invoiceData={invoice} initial_date={initial_date} ending_date={ending_date} send_date={send_date}/>}

    </section>
  </section>
}
export default InvoiceFormat


// <>
//   {/* {
//     ticket.products?.map((prod, j) => {
//       return <tr key={j}>
//         <td>{prod.product?.name}</td>
//         <td>{prod.product_variants?.map(variant => variant.name).join(' ')}</td>
//         <td>{prod.quantity} {prod.product?.measurement_unit}</td>
//         <td>{prod.price?.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</td>
//         <td>{prod.product_total?.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</td>
//       </tr>
//     })
//   } */}
// </>