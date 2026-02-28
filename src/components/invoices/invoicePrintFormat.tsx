'use client'
// InvoicePrintFormat — auto-print wrapper used by InvoiceList / InvoiceListByClient.
// The section is hidden on screen (hidden) and shown only in the browser print stylesheet (print:block).
// Parent sets key={printKey} and increments it on each sendPrint() to force a full component remount,
// ensuring the print dialog fires again for consecutive prints of different invoices.
//
// Two-stage useEffect pattern (required because date strings and PrintInvoice config derive from invoice state):
//   Effect 1 (invoiceData dep): syncs the received prop into local invoice state so computed
//     date strings and the PrintInvoice config (documentTitle, filename) update before printing.
//   Effect 2 (invoice dep): once invoice state is set, calls PrintInvoice() inside setTimeout(500)
//     to allow react-to-print to resolve the contentRef after the component re-renders with invoice data.
import React, { useEffect, useRef, useState } from "react"
import { Invoice } from "@/api/hooks/invoices/getInvoices";
import { useReactToPrint } from "react-to-print";
import InvoiceBaseFormat from "./invoiceBaseFormat";
import { PrintInvoiceFormat } from "@/api/hooks/invoices/getInvoice";


interface InvoicePrintFormatProps { invoiceData: Invoice }
const InvoicePrintFormat: React.FC<InvoicePrintFormatProps> = ({ invoiceData }) => {
 
  const [invoice, setInvoice] = useState<Invoice>()

  const contentRef = useRef<HTMLDivElement>(null);

  const initial_date = new Date(invoice?.initial_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const ending_date = new Date(invoice?.ending_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const send_date = invoice?.invoice_send_date ? new Date(invoice.invoice_send_date).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'}) : ''
  const client_name = invoice?.client?.name?.toLocaleUpperCase()
  const PrintInvoice = useReactToPrint(PrintInvoiceFormat(contentRef, client_name, initial_date, ending_date));

  // Effect 1: sync invoiceData prop → invoice state so date strings and PrintInvoice config are current.
  useEffect(() => {
    if (invoiceData) {
      setInvoice(invoiceData)
    }
  },[invoiceData])


  // Effect 2: trigger auto-print once invoice state is ready.
  // setTimeout(500) lets react-to-print resolve contentRef after the component renders invoice content.
  useEffect(() => {
    if (invoice) {
      setTimeout(() => {
        PrintInvoice()
      }, 500);
    }
  }, [invoice])

  

  {/* hidden: invisible in browser; print:block: visible only during printing. */}
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