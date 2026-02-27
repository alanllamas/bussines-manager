'use client'
import React, { useEffect, useRef, useState } from "react"
import { Invoice } from "@/api/hooks/invoices/getInvoices";
import { useReactToPrint } from "react-to-print";
import InvoiceBaseFormat from "./invoiceBaseFormat";
import { PrintInvoiceFormat } from "@/api/hooks/invoices/getInvoice";


const InvoicePrintFormat: React.FC<any> = ({ invoiceData }) => {
 
  const [invoice, setInvoice] = useState<Invoice>()

  const contentRef = useRef<HTMLDivElement>(null);

  const initial_date = new Date(invoice?.initial_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const ending_date = new Date(invoice?.ending_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const send_date = invoice?.invoice_send_date ? new Date(invoice.invoice_send_date).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'}) : ''
  const client_name = invoice?.client?.name?.toLocaleUpperCase()
  const PrintInvoice = useReactToPrint(PrintInvoiceFormat(contentRef, client_name, initial_date, ending_date));

  useEffect(() => {
    if (invoiceData) {
      // console.log('invoiceData: ', invoiceData);
      setInvoice(invoiceData)
    }
  },[invoiceData])


  useEffect(() => {
    // console.log(interval);
    if (invoice) {
      setTimeout(() => {
        PrintInvoice()
      }, 500);
    }
  }, [invoice])

  

  return <section ref={contentRef} className="hidden print:block w-1/3 print:w-full print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-surface-900 border border-surface-200">
      { invoice && <InvoiceBaseFormat invoiceData={invoice} initial_date={initial_date} ending_date={ending_date} send_date={send_date}/>}
    </section>
}
export default InvoicePrintFormat


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