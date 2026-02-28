// InvoiceListByClient — invoice list scoped to a single client, used on the client detail page.
// Functionally identical to InvoiceList but with two key differences:
//   1. Uses useGetInvoicesByClient(clientId) instead of useGetInvoices() (filtered by client).
//   2. blockClient={true} is passed to InvoicesForm — client selector is disabled since
//      the client is already known from the page context.
//   3. sendCreate() pre-fills client with the current client's numeric id.
//   4. Invoices are sorted by id desc on load (most recent first).
// clientId: the Strapi documentId of the client (from the page URL param).
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
import { Invoice } from "@/api/hooks/invoices/getInvoices"
import InvoicePrintFormat from "./invoicePrintFormat"
import InvoicesForm from "../forms/InvoicesForm"
import useGetInvoicesByClient from "@/api/hooks/invoices/getInvoicesByClient"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

interface InvoiceListByClientProps { itemsPerPage?: number; clientId: string }
const InvoiceListByCLient: React.FC<InvoiceListByClientProps> = ({itemsPerPage = 10, clientId}) => {
  const { mutate } = useSWRConfig()
  // Same dual-key invalidation as InvoiceList (invoices + tickets both change on mutation).
  const invalidateInvoices = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && (key[0].includes('/api/invoices') || key[0].includes('/api/tickets'))
  )
  // Form state — same structure as InvoiceList (see InvoiceList.tsx for full documentation).
  const [totals, setTotals] = useState<Totals>({total: 0, sub_total:0, total_taxes: 0})
  const [resume, setResume] = useState<Resume>()
  const [clients, setClients] = useState<Client[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [create, setCreate] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoice>()
  const [newInvoice, setNewInvoice] = useState<createInvoiceReq>()
  const [newEditInvoice, setNewEditInvoice] = useState<{invoice: createInvoiceReq, documentId: string}>()
  const [initialFormValues, setInitialFormValues] = useState<InvoiceInitialValues>()
  const [client, setclient] = useState<Client>()
  const [printInvoice, setPrintInvoice] = useState<Invoice>()
  const [printKey, setPrintKey] = useState(0)

  const [invoices, setInvoices] = useState<Invoice[]>([])

  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading
  } = useGetTicketsByClient(clientId)
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
  } = useGetInvoicesByClient(clientId)
  const { invoice_number } = useGetInvoiceNumber()

  // Sort invoices by numeric id desc (most recent first) on load/refresh.
  useEffect(() => {
    if (!invoicesError && !invoicesIsLoading && invoicesData?.data) {
      setInvoices([...invoicesData.data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)))
    }
  }, [invoicesIsLoading, invoicesError, invoicesData])

  // Set availableTickets to unassigned tickets only (invoice === null means free to add to a corte).
  useEffect(() => {
    if (!ticketsError && !ticketsIsLoading) {
      setTickets(ticketsData?.data ?? [])
      setAvailableTickets(ticketsData?.data?.filter(ticket => ticket.invoice === null) ?? [])
    }
  }, [ticketsIsLoading, ticketsError])

  // When editing: expand available pool to include tickets already on this invoice (ADR-013).
  useEffect(() => {
    if (editInvoice && ticketsData?.data) {
      setAvailableTickets(
        ticketsData.data.filter(
          t => t.invoice === null || t.invoice?.id === editInvoice.id
        )
      )
    }
  }, [editInvoice])

  // Resolve the current client object from the global list using the URL param documentId.
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      const allClients = clientsData?.data ?? []
      const client = allClients.find((cli: Client) => cli.documentId === clientId)
      setClients(allClients)
      setclient(client)
    }
  }, [clientsIsLoading, clientsError])
        
  // Create mutation response: show toast, invalidate cache, clear SWR payload on success.
  useEffect(() => {
    if (InvoiceError && !InvoiceIsLoading) {
      toast.error('Error al crear el corte')
    } else if (!InvoiceError && !InvoiceIsLoading && InvoiceData) {
      toast.success('Corte creado')
      invalidateInvoices()
      setNewInvoice(undefined)
    }
  }, [InvoiceIsLoading, InvoiceData, InvoiceError])

  // Edit mutation response: show toast, invalidate cache, clear SWR payload, close dialog on success.
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

  // When editInvoice is set: re-run generateResume and pre-populate initialFormValues
  // so the dialog opens with all existing invoice data pre-filled (ADR-013 fix).
  useEffect(() => {
    if (editInvoice) {
      const editTickets = editInvoice?.tickets.map(ticket => `${ticket.id}`);
      const { results, totals } = generateResume(editTickets, editInvoice.tickets, client)
      setResume(results)
      setTotals(totals)
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

  // Open dialog once initialFormValues are ready (set by sendCreate or the editInvoice effect).
  useEffect(() => {
    if (initialFormValues) setIsOpen(true)
  }, [initialFormValues])

  // Open create dialog: set create flag, pre-fill client id from context, default status "por-pagar".
  const sendCreate = () => {
    setCreate(true)

    setInitialFormValues({
      client: `${client?.id}`,
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

  // Reset all dialog and form state, close the dialog.
  const sendClose = () => {
    setEditInvoice(undefined)
    setResume(undefined)
    setTotals({total: 0, sub_total:0, total_taxes: 0})
    setInitialFormValues(undefined)
    setIsOpen(false)
    setCreate(false)
  }

  // Close dialog, wrap client in array (Strapi relation format), serialize resume to JSON string.
  const handleSubmit = async (values: InvoiceInitialValues) => {
    setIsOpen(false)
    const data = {
      ...values,
      client: [values.client],
      resume: JSON.stringify(values.resume)
    } 
    if (editInvoice) {
      setNewEditInvoice({ invoice: data, documentId: editInvoice.documentId || ''})
    } else {
      setNewInvoice(data)
    }

    // client
    // resume

  }
  // // Invoice form functions

  // Increment printKey to force InvoicePrintFormat remount before setting the new invoice to print.
  const sendPrint = (invoice:Invoice) => {
    setPrintKey(k => k + 1)
    setPrintInvoice(invoice)
  }

  // Inner component: renders one table row per invoice (consumed by PaginatedItems).
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
            <td><div className="flex justify-center"><ActionButtons onEdit={() => setEditInvoice(invoice)} onPrint={() => sendPrint(invoice)} /></div></td>
          </tr>
        })}
      </>
    );
  }

  // Inner component: pagination shell — mobile cards + desktop table + ReactPaginate controls.
  function PaginatedItems({ itemsPerPage }: { itemsPerPage: number }) {
    const { currentItems, pageCount, handlePageChange } = usePaginatedData(invoices, itemsPerPage);
      return (
      <section className="w-full flex flex-col items-center">
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
                    <ActionButtons onEdit={() => setEditInvoice(invoice)} onPrint={() => sendPrint(invoice)} />
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
        <ReactPaginate
          className="paginator"
          breakLabel="…"
          nextLabel="siguiente ›"
          previousLabel="‹ anterior"
          onPageChange={handlePageChange}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          renderOnZeroPageCount={null}
        />
      </section>
    );
  }

  return<>
    <InvoicesForm
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
      setClient={setclient}
      setAvailableTickets={setAvailableTickets}
      client={client}
      setCreate={setCreate}
      tickets={tickets}
      editInvoice={editInvoice}
      blockClient={true}
    />
    <PaginatedItems itemsPerPage={10}/>
    { printInvoice && <InvoicePrintFormat key={printKey} invoiceData={printInvoice} />}
  </> 
} 

export default InvoiceListByCLient