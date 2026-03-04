// InvoiceList — global invoice list used on the /invoices page.
// Orchestrates the full invoice workflow: fetching all invoices, opening the InvoicesForm
// dialog for create/edit, managing the print trigger, and invalidating SWR cache on mutations.
//
// State management pattern: all InvoicesForm state (totals, resume, client, tickets, etc.)
// is owned here and passed down as props. The form is a controlled, stateless dialog.
//
// Print pattern: InvoicePrintFormat is always in the DOM when printInvoice is set,
// and it auto-triggers the browser print dialog. printKey is incremented on each print
// request to force a React remount, which re-fires the print useEffect for successive prints.
'use client'
import React, { useEffect, useState } from "react"
import { usePaginatedData } from "@/hooks/usePaginatedData"
import { ActionButtons, EmptyState } from "@/components/ui"
import { Ticket } from "@/api/hooks/tickets/getTickets"
import ReactPaginate from "react-paginate"
import useGetTicketsByClient from "@/api/hooks/invoices/getTicketsByClient"
import useGetClients from "@/api/hooks/clients/getClients"
import useCreateInvoice from "@/api/hooks/invoices/useCreateInvoice"
import useEditInvoice from "@/api/hooks/invoices/useEditInvoice"
import useGetInvoiceNumber from "@/api/hooks/invoices/getInvoiceNumber"
import { createInvoiceReq, generateResume, InvoiceInitialValues, Resume, Totals } from "@/api/hooks/invoices/getInvoice"
import { Client } from "@/api/hooks/clients/getClient"
import useGetInvoices, { Invoice } from "@/api/hooks/invoices/getInvoices"
import InvoicePrintFormat from "./invoicePrintFormat"
import InvoicesForm from "../forms/InvoicesForm"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

interface InvoiceListProps { itemsPerPage?: number }
const InvoiceList: React.FC<InvoiceListProps> = ({itemsPerPage = 10}) => {
  const { mutate } = useSWRConfig()
  // invalidateInvoices: refetches both /api/invoices and /api/tickets keys because
  // creating/editing an invoice changes ticket.invoice associations (tickets gain/lose their Corte link).
  const invalidateInvoices = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && (key[0].includes('/api/invoices') || key[0].includes('/api/tickets'))
  )
  // Form state — owned here, passed down as props to InvoicesForm.
  const [totals, setTotals] = useState<Totals>({total: 0, sub_total:0, total_taxes: 0})
  const [resume, setResume] = useState<Resume>()
  const [clients, setClients] = useState<Client[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  // availableTickets: unassigned tickets for the selected client (invoice === null).
  // On edit: also includes tickets already on the invoice being edited.
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [create, setCreate] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoice>()
  // newInvoice / newEditInvoice: SWR mutation payloads — set on form submit, cleared after response.
  const [newInvoice, setNewInvoice] = useState<createInvoiceReq>()
  const [newEditInvoice, setNewEditInvoice] = useState<{invoice: createInvoiceReq, documentId: string}>()
  // initialFormValues: when set, triggers the dialog to open (via useEffect below).
  const [initialFormValues, setInitialFormValues] = useState<InvoiceInitialValues>()
  const [client, setClient] = useState<Client>()
  // printInvoice / printKey: print trigger state. printKey is incremented to remount
  // InvoicePrintFormat, which re-fires its auto-print useEffect for successive prints.
  const [printInvoice, setPrintInvoice] = useState<Invoice>()
  const [printKey, setPrintKey] = useState(0)

  const [invoices, setInvoices] = useState<Invoice[]>([])

  // Fetch tickets for the currently selected client (undefined = no client selected, hook skips).
  // Used to populate availableTickets for the InvoicesForm ticket selector.
  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading
  } = useGetTicketsByClient(client?.documentId)
  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()
  const {
    invoice: InvoiceData,
    error: InvoiceError,
    isLoading: InvoiceIsLoading
  } = useCreateInvoice(newInvoice)
  const {
    invoice: EditInvoiceData,
    error: EditInvoiceError,
    isLoading: EditInvoiceIsLoading
  } = useEditInvoice(newEditInvoice)
  const {
    invoices: invoicesData,
    error: invoicesError,
    isLoading: invoicesIsLoading,
  } = useGetInvoices()
  const { invoice_number } = useGetInvoiceNumber()

  useEffect(() => {
    if (!invoicesError && !invoicesIsLoading && invoicesData?.data) {
      setInvoices(invoicesData.data)
    }
  }, [invoicesIsLoading, invoicesError, invoicesData])

  useEffect(() => {
    if ((invoicesData.data)) {
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      setInvoices(invoicesData.data)
    }
  }, [])

  // Sync tickets into state when SWR loads; availableTickets excludes already-invoiced tickets.
  useEffect(() => {
    if (!ticketsError && !ticketsIsLoading) {
      setTickets(ticketsData?.data ?? [])
      setAvailableTickets(ticketsData?.data?.filter(ticket => ticket.invoice === null) ?? [])
    }
  }, [ticketsIsLoading, ticketsError])

  // When edit mode is triggered: expand availableTickets to include this invoice's own tickets
  // (t.invoice?.id === editInvoice.id) so they appear pre-selected in the form.
  useEffect(() => {
    if (editInvoice && ticketsData?.data) {
      setAvailableTickets(
        ticketsData.data.filter(
          t => t.invoice === null || t.invoice?.id === editInvoice.id
        )
      )
    }
  }, [editInvoice])

  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      setClients(clientsData?.data ?? [])
    }
  }, [clientsIsLoading, clientsError])
        
  useEffect(() => {
    // make refresh

    if (InvoiceError && !InvoiceIsLoading) {
      toast.error('Error al crear el corte')
    } else if (!InvoiceError && !InvoiceIsLoading && InvoiceData) {
      toast.success('Corte creado')
      invalidateInvoices()
      setNewInvoice(undefined)
    }
  }, [InvoiceIsLoading, InvoiceData, InvoiceError])

  useEffect(() => {
    if (EditInvoiceError && !EditInvoiceIsLoading) {
      toast.error('Error al editar el corte')
    } else if (EditInvoiceData && !EditInvoiceError && !EditInvoiceIsLoading) {
      toast.success('Corte actualizado')
      invalidateInvoices()
      setNewEditInvoice(undefined)
      sendClose()
      

      // setTicket(InvoiceData.data)
    }
  }, [EditInvoiceData, EditInvoiceError, EditInvoiceIsLoading])

  // When editInvoice is set: rebuild totals/resume from the existing ticket data,
  // and populate initialFormValues so InvoicesForm opens with pre-filled values.
  // generateResume is called with the invoice's existing tickets (not the full client ticket list).
  useEffect(() => {
    if (editInvoice) {
      const editTickets = editInvoice?.tickets.map(ticket => `${ticket.id}`)
      // Override tickets state with just this invoice's tickets for generateResume context.
      setTickets(editInvoice.tickets)
      const { results, totals } = generateResume(editTickets, editInvoice.tickets, client)
      setResume(results)
      setTotals(totals)
      // setClient(editInvoice?.client)
      setInitialFormValues({
        client: editInvoice?.client?.id?.toString() || "",
        sub_total: editInvoice?.sub_total || 0,
        shipping: editInvoice?.shipping_price || 0,
        total: editInvoice?.total || 0,
        taxes: editInvoice.taxes,
        comments: editInvoice.comments || '',
        inner_comments: editInvoice.inner_comments || '',
        ending_date: editInvoice.ending_date,
        expected_payment_date: editInvoice.expected_payment_date,
        initial_date: editInvoice.initial_date,
        invoice_send_date: editInvoice.invoice_send_date,
        payment_date: editInvoice.payment_date,
        invoice_number: editInvoice.invoice_number,
        invoice_id: editInvoice.invoice_id,
        invoice_status: editInvoice.invoice_status,
        payment_reference: editInvoice.payment_reference,
        tickets: editTickets,
        resume: results
      })
      // proof_of_payment: editInvoice.proof_of_payment || {
      //   files: undefined,
      //   field: 'proof_of_payment',
      //   refId: editInvoice.documentId || '',
      //   ref: 'api::invoice.invoice'
      // },
      // invoice_file: editInvoice.invoice_file || {
      //   files: undefined,
      //   field: 'invoice_file',
      //   refId: editInvoice.documentId || '',
      //   ref: 'api::invoice.invoice'
      // },
      // payment_supplement: editInvoice.payment_supplement || {
      //   files: undefined,
      //   field: 'payment_supplement',a
      //   refId: editInvoice.documentId || '',
      //   ref: 'api::invoice.invoice'
      // },
      // {
      //   !create && <Disclosure>
      //     <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-surface-100 justify-between">
      //       Archivos
      //     </DisclosureButton>
      //     <DisclosurePanel>
      //       <div className="flex flex-col">
      //         <div className="flex justify-between w-full ">
      //           <label htmlFor="file">Factura</label> 
      //           <Field type="file" name="invoice_file.file" value={values?.invoice_file?.files}></Field>
      //         </div>
      //         <div className="flex justify-between w-full ">
      //           <label htmlFor="file">Comprobante de pago</label> 
      //           <Field type="file" name="proof_of_payment.file" value={values?.proof_of_payment?.files}></Field>
      //         </div>
      //         <div className="flex justify-between w-full ">
      //           <label htmlFor="file">Complemento de pago</label> 
      //           <Field type="file" name="payment_supplement.file" value={values?.payment_supplement?.files}></Field>
      //         </div>
              
      //       </div>
      //     </DisclosurePanel>
      //   </Disclosure>
      // }
      // const proof_of_payment = new FormData()
      // const invoice_file = new FormData()
      // const payment_supplement = new FormData()
      // values.proof_of_payment ?? Object.entries(values.proof_of_payment || {}).forEach(([key, value]) => {
      //   // @ts-expect-error value could be undefined
      //   if(value) proof_of_payment.append(key, value)
      // });
      // values.invoice_file ?? Object.entries(values.invoice_file || {}).forEach(([key, value]) => {
      //   // @ts-expect-error value could be undefined
      //   if(value) invoice_file.append(key, value)
      // });
      // values.payment_supplement ?? Object.entries(values.payment_supplement || {}).forEach(([key, value]) => {
      //   // @ts-expect-error value could be undefined
      //   if(value) payment_supplement.append(key, value)
      // });
    } 
    
  }, [editInvoice])

  // Open the dialog as soon as initialFormValues is populated (either by sendCreate or editInvoice effect).
  useEffect(() => {
    if (initialFormValues) setIsOpen(true)
  }, [initialFormValues])

  // sendCreate — initializes a blank form for a new invoice.
  // invoice_number = last invoice number + 1 (fetched from useGetInvoiceNumber).
  // invoice_status defaults to "por-pagar" (unpaid / accounts receivable initial state).
  const sendCreate = () => {
    setCreate(true)

    setInitialFormValues({
      client: '',
      sub_total: 0,
      taxes: 0,
      total: 0,
      shipping: 0,
      comments: "",
      inner_comments: "",
      ending_date: null,
      expected_payment_date: null,
      initial_date: null,
      invoice_send_date: null,
      payment_date: null,
      // Increment last invoice_number; fallback to 0 if not yet loaded.
      invoice_number: (invoice_number !== undefined && !isNaN(invoice_number) ? invoice_number : 0) + 1,
      invoice_id: '',
      invoice_status: "por-pagar",
      payment_reference: "",
      tickets: [],
      proof_of_payment: undefined,
      invoice_file: undefined,
      payment_supplement: undefined,
      resume: {}
    })
  }

  // sendClose — resets all form state and closes the dialog.
  const sendClose = () => {
    setEditInvoice(undefined)
    setResume(undefined)
    setTotals({total: 0, sub_total:0, total_taxes: 0})
    setInitialFormValues(undefined)
    setClient(undefined)
    setIsOpen(false)
    setCreate(false)
  }

  // handleSubmit — transforms InvoiceInitialValues into createInvoiceReq before firing the mutation.
  // client is wrapped in an array (Strapi v5 relation format: client: [id]).
  // resume is serialized to JSON string (stored as text in Strapi, parsed on read).
  const handleSubmit = async (values: InvoiceInitialValues) => {
    setIsOpen(false)
    const data = {
      ...values,
      client: [values.client],          // Strapi relation: wrap id in array
      resume: JSON.stringify(values.resume)  // stored as JSON string in Strapi
    }
    if (editInvoice) {
      setNewEditInvoice({ invoice: data, documentId: editInvoice.documentId || ''})
    } else {
      setNewInvoice(data)
    }
  }

  // sendPrint — increments printKey to remount InvoicePrintFormat and set the invoice to print.
  // The key increment forces a React remount, which re-fires the auto-print useEffect.
  const sendPrint = (invoice:Invoice) => {
    setPrintKey(k => k + 1)
    setPrintInvoice(invoice)
  }

  // Items — renders invoice rows for the current page slice (desktop table).
  function Items({ currentItems }: {currentItems: Invoice[]}) {
    return (
      <>
        {currentItems &&
          currentItems?.map((invoice: Invoice, index: number) => {
          return <tr key={`invoice-${index}`}>
            <td className="whitespace-nowrap"><a className="text-primary-600 hover:underline font-medium" href={`/invoices/${invoice.documentId}`}>{String(invoice.invoice_number ?? '').padStart(5, '0')}</a></td>
            <td className="max-w-0 truncate">{invoice.client?.name}</td>
            <td className="whitespace-nowrap">{new Date(invoice.initial_date || 0).toLocaleDateString()}</td>
            <td className="whitespace-nowrap">{new Date(invoice.ending_date || 0).toLocaleDateString()}</td>
            <td className="font-medium whitespace-nowrap">$ {invoice.total}</td>
            <td>
              <div className="flex justify-center">
                <ActionButtons onEdit={() => { setClient(invoice.client); setEditInvoice(invoice) }} onPrint={() => sendPrint(invoice)} />
              </div>
            </td>
          </tr>
        })}
      </>
    );
  }

  // PaginatedItems — wraps Items with usePaginatedData and ReactPaginate.
  // Renders a mobile card list (sm:hidden) and a desktop table (hidden sm:block).
  function PaginatedItems({ itemsPerPage }: { itemsPerPage: number }) {
    const { currentItems, pageCount, handlePageChange } = usePaginatedData(invoices, itemsPerPage);
      return (
      <section className="w-full flex flex-col items-center pb-16 sm:pb-0">
        {/* Mobile card list */}
        <div className="sm:hidden w-full space-y-2 mt-4">
          {invoices.length === 0
            ? <EmptyState icon="inbox" message="Sin cortes" />
            : currentItems.map((invoice: Invoice) => (
                <div key={invoice.documentId} className="border border-surface-200 rounded p-3 bg-white text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-surface-800">
                      #{String(invoice.invoice_number ?? '').padStart(5, '0')}
                    </span>
                    <ActionButtons onEdit={() => { setClient(invoice.client); setEditInvoice(invoice) }} onPrint={() => sendPrint(invoice)} />
                  </div>
                  <p className="text-surface-600 mt-1">{invoice.client?.name}</p>
                  <p className="text-surface-400 text-xs mt-1">
                    {new Date(invoice.initial_date || 0).toLocaleDateString()} – {new Date(invoice.ending_date || 0).toLocaleDateString()} · $ {invoice.total}
                  </p>
                </div>
              ))
          }
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="data-table mt-6 min-w-[480px] [&_th]:!text-center [&_td]:text-center">
            <thead>
              <tr>
                <th className="w-20">Folio</th>
                <th className="w-40">Cliente</th>
                <th className="w-28 whitespace-nowrap">Fecha inicial</th>
                <th className="w-28 whitespace-nowrap">Fecha final</th>
                <th className="w-28">Monto</th>
                <th className="w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0
                ? <tr><td colSpan={6}><EmptyState icon="inbox" message="Sin cortes" /></td></tr>
                : <Items currentItems={currentItems} />
              }
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="paginator-bar">
            <ReactPaginate
              className="paginator"
              breakLabel="…"
              nextLabel="siguiente ›"
              previousLabel="‹ anterior"
              onPageChange={handlePageChange}
              pageRangeDisplayed={5}
              pageCount={pageCount}
            />
          </div>
        )}
      </section>
    );
  }

  return<>
    {
      tickets && <InvoicesForm
        sendCreate={sendCreate}
        initialFormValues={initialFormValues}
        handleSubmit={handleSubmit}
        isOpen={isOpen}
        sendClose={sendClose}
        totals={totals}
        resume={resume}
        clients={clients}
        availableTickets={availableTickets}
        create={create}
        setTotals={setTotals}
        setResume={setResume}
        setClients={setClients}
        setClient={setClient}
        setAvailableTickets={setAvailableTickets}
        setCreate={setCreate}
        tickets={tickets}
        client={client}
        editInvoice={editInvoice}
        apiError={InvoiceError || EditInvoiceError}
      />
    }
    <PaginatedItems itemsPerPage={10}/>
    { printInvoice && <InvoicePrintFormat key={printKey} invoiceData={printInvoice} />}
  </> 
} 

export default InvoiceList