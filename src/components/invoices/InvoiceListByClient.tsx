'use client'
import React, { useEffect, useState } from "react"
import { Ticket } from "@/api/hooks/tickets/getTickets"
import ReactPaginate from "react-paginate"
import useGetTicketsByClient from "@/api/hooks/invoices/getTicketsByClient"
import useGetClients from "@/api/hooks/clients/getClients"
import useCreateInvoice from "@/api/hooks/invoices/useCreateInvoice"
import useEditInvoice from "@/api/hooks/invoices/useEditInvoice"
import { createInvoiceReq, generateResume, InvoiceInitialValues, Resume, Totals } from "@/api/hooks/invoices/getInvoice"
import { Client } from "@/api/hooks/clients/getClient"
import { Invoice } from "@/api/hooks/invoices/getInvoices"
import InvoicePrintFormat from "./invoicePrintFormat"
import InvoicesForm from "../forms/InvoicesForm"
import useGetInvoicesByClient from "@/api/hooks/invoices/getInvoicesByClient"
import { useSWRConfig } from "swr"

const InvoiceListByCLient: React.FC<any> = ({itemsPerPage = 10, clientId}) => {
  const { mutate } = useSWRConfig()
  const invalidateInvoices = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && (key[0].includes('/api/invoices') || key[0].includes('/api/tickets'))
  )
// ticket form functions
  const [totals, setTotals] = useState<Totals>({total: 0, sub_total:0, total_taxes: 0})
  const [resume, setResume] = useState<Resume>()
  const [clients, setClients] = useState<Client[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [create, setCreate] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoice>()
  const [newInvoice, setNewInvoice] = useState<createInvoiceReq>()
  const [newEditInvoice, setNewEditInvoice] = useState<{invoice: Invoice, documentId: string}>()
  const [initialFormValues, setInitialFormValues] = useState<InvoiceInitialValues>()
  const [client, setclient] = useState<Client>()
  const [printInvoice, setPrintInvoice] = useState<Invoice>()

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

  useEffect(() => {
    if (!invoicesError && !invoicesIsLoading && invoicesData?.data) {
      setInvoices([...invoicesData.data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)))
    }
  }, [invoicesIsLoading, invoicesError])

  useEffect(() => {
    if (!ticketsError && !ticketsIsLoading) {
      setTickets(ticketsData?.data ?? [])
      setAvailableTickets(ticketsData?.data?.filter(ticket => ticket.invoice === null) ?? [])
    }
  }, [ticketsIsLoading, ticketsError])

  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      const allClients = clientsData?.data ?? []
      const client = allClients.find((cli: Client) => cli.documentId === clientId)
      setClients(allClients)
      setclient(client)
    }
  }, [clientsIsLoading, clientsError])
        
  useEffect(() => {
    // make refresh

    if (!InvoiceError && !InvoiceIsLoading && InvoiceData) {
      invalidateInvoices()
      setNewInvoice(undefined)
    }
  }, [InvoiceIsLoading, InvoiceData, InvoiceError])

  useEffect(() => {
    if (EditInvoiceData && !EditInvoiceError && !EditInvoiceIsLoading) {
      invalidateInvoices()
      setNewEditInvoice(undefined)
      

      // setTicket(InvoiceData.data)
    }
  }, [EditInvoiceData, EditInvoiceError, EditInvoiceIsLoading])

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
        comments: editInvoice.comments,
        inner_comments: editInvoice.inner_comments,
        ending_date: editInvoice.ending_date,
        expected_payment_date: editInvoice.expected_payment_date,
        initial_date: editInvoice.initial_date,
        invoice_send_date: editInvoice.invoice_send_date,
        payment_date: editInvoice.payment_date,
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

  useEffect(() => {
    // console.log('initialFormValues: ', initialFormValues);
    setIsOpen(true)
    
  }, [initialFormValues])

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
      invoice_id: "",
      invoice_status: "por-pagar",
      payment_reference: "",
      tickets: [],
      proof_of_payment: undefined,
      invoice_file: undefined,
      payment_supplement: undefined,
      resume: {}
    })
  }

  const sendClose = () => {
    setEditInvoice(undefined)
    setResume(undefined)
    setTotals({total: 0, sub_total:0, total_taxes: 0})
    setInitialFormValues(undefined)
    setIsOpen(false)
    setCreate(false)
  }

  const handleSubmit = async (values: InvoiceInitialValues) => {
    setIsOpen(false)
    // console.log(values);
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

  const sendPrint = (invoice:Invoice) => {
    setPrintInvoice(invoice)
  }

  function Items({ currentItems }: {currentItems: Invoice[]}) {
    return (
      <>
        {currentItems &&
          currentItems?.map((invoice: Invoice, index: number) => {
          // console.log('invoice: ', invoice);
          return <tr key={`invoice-${index}`}>
            <td><a className="text-primary-600 hover:underline font-medium" href={`/invoices/${invoice.documentId}`}>{invoice.id}</a></td>
            <td>{invoice.client?.name}</td>
            <td>{new Date(invoice.initial_date || 0).toLocaleDateString()}</td>
            <td>{new Date(invoice.ending_date || 0).toLocaleDateString()}</td>
            <td className="font-medium">$ {invoice.total}</td>
            <td>
              <div className="flex gap-1"><button className="btn-icon" onClick={() => setEditInvoice(invoice)}><span className="material-symbols-outlined text-[16px]">edit</span></button><button className="btn-icon" onClick={() => sendPrint(invoice)}><span className="material-symbols-outlined text-[16px]">print</span></button></div>
            </td>
          </tr>
        })}
      </>
    );
  }

  function PaginatedItems({ itemsPerPage }: { itemsPerPage: number }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);

    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;
    // console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = invoices?.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(invoices.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageChange = (event: { selected: number }) => {
      const newOffset = (event.selected * itemsPerPage) % invoices.length;
      // console.log(
      //   `User requested page number ${event.selected}, which is offset ${newOffset}`
      // );
      setItemOffset(newOffset);
    };
      return (
      <section className="w-full flex flex-col items-center">
        <table className="data-table mt-6">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Fecha inicial</th>
              <th>Fecha final</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0
              ? <tr><td colSpan={6} className="py-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-surface-300 block">inbox</span>
                  <p className="text-sm text-surface-400 mt-2">Sin cortes</p>
                </td></tr>
              : <Items currentItems={currentItems} />
            }
          </tbody>
        </table>
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
    { printInvoice && <InvoicePrintFormat invoiceData={printInvoice} />}
  </> 
} 

export default InvoiceListByCLient