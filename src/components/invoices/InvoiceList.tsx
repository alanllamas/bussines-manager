'use client'
import React, { useEffect, useState } from "react"
import { Ticket } from "@/api/hooks/tickets/getTickets"
import ReactPaginate from "react-paginate"
import useGetTicketsByClient from "@/api/hooks/invoices/getTicketsByClient"
import useGetClients from "@/api/hooks/getClients"
import useCreateInvoice from "@/api/hooks/invoices/useCreateInvoice"
import useEditInvoice from "@/api/hooks/invoices/useEditInvoice"
import { createInvoiceReq, generateResume, InitialValues, Resume, Totals } from "@/api/hooks/invoices/getInvoice"
import { Client } from "@/api/hooks/getClient"
import useGetInvoices, { Invoice } from "@/api/hooks/invoices/getInvoices"
import InvoicePrintFormat from "./invoicePrintFormat"
import InvoicesForm from "../forms/InvoicesForm"

const InvoiceList: React.FC<any> = ({itemsPerPage = 10}) => {
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
  const [initialFormValues, setInitialFormValues] = useState<InitialValues>()
  const [client, setClient] = useState<Client>()
  const [printInvoice, setPrintInvoice] = useState<Invoice>()

  const [invoices, setInvoices] = useState<Invoice[]>([])

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

  useEffect(() => {
    if ((!invoicesError && !invoicesIsLoading && invoicesData.data)) {
      
      // console.log('invoicesData.data: ', invoicesData.data);
      // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      setInvoices(invoicesData.data)
    }
  }, [invoicesIsLoading, invoicesData.data, invoicesError])
   
  useEffect(() => {
    if ((invoicesData.data)) {
      // console.log('invoicesData.data: ', invoicesData.data);
      // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      setInvoices(invoicesData.data)
    }
  }, [])

  useEffect(() => {
    if (!ticketsError && !ticketsIsLoading) {
      
      // console.log('ticketsData.data: ', ticketsData.data);
      // console.log('meta.pagination.total: ', productsData.meta.pagination.total);
      
      setTickets(ticketsData.data)
      // if (client) {
      //   setAvailableTickets(ticketsData.data.filter(ticket => ticket.invoice === null && client.id === ticket.client.id))

      // } else {
      // }
        setAvailableTickets(ticketsData.data.filter(ticket => ticket.invoice === null))
    }
  }, [ticketsData.data, ticketsError, ticketsIsLoading])

  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // console.log('clientsData.data: ', clientsData.data);
      // console.log('meta.pagination.total: ', clientsData.meta.pagination.total);
      // @ts-expect-error missing type
      const clients = clientsData.data
      // const client = clients.filter((cli: Client) => cli.documentId === clientId)[0]
      setClients(clients)
      // setclient(client)
    }
      // @ts-expect-error missing type
  }, [clientsIsLoading, clientsData.data, clientsError])
        
  useEffect(() => {
    // make refresh

    if (!InvoiceError && !InvoiceIsLoading && InvoiceData) {
      // console.log('InvoiceData: ', InvoiceData);
      setTimeout(() => window.location.reload(), 500);
    }
  }, [InvoiceIsLoading, InvoiceData, InvoiceError])

  useEffect(() => {
    // make refresh

    if (EditInvoiceData && !EditInvoiceError && !EditInvoiceIsLoading) {
      // console.log('EditInvoiceData: ', EditInvoiceData);
      setTimeout(() => window.location.reload(), 500);
      

      // setTicket(InvoiceData.data)
    }
  }, [EditInvoiceData, EditInvoiceError, EditInvoiceIsLoading])

  useEffect(() => {
    if (editInvoice) {
      console.log('editInvoice: ', editInvoice);
      console.log('editInvoice.tickets: ', editInvoice.tickets);
      const editTickets = editInvoice?.tickets.map(ticket => `${ticket.id}`)
      console.log('editInvoice?.tickets.map(ticket => `${ticket.id}`): ', editInvoice?.tickets.map(ticket => `${ticket.id}`));
      const { results, totals } = generateResume(editTickets, tickets, client)
      setResume(results)
      setTotals(totals)
      // setClient(editInvoice?.client)
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
      //     <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
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

  const handleSubmit = async (values: InitialValues) => {
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
          return <tr className="border-b border-neutral-300" key={`invoice-${index}`}>

            <td className="py-2"><a href={`/invoices/${invoice.documentId}`}>{invoice.id}</a></td>
            <td className="py-2">{invoice.client?.name}</td>
            <td className="py-2">{new Date(invoice.initial_date || 0).toLocaleDateString()}</td>
            <td className="py-2">{new Date(invoice.ending_date || 0).toLocaleDateString()}</td>
            <td className="py-2">$ {invoice.total}</td>
            <td className="py-2">
              <button onClick={() => (setClient(invoice.client),setEditInvoice(invoice))}><span>edit</span></button> | <button onClick={() => sendPrint(invoice)}><span>print</span></button>
            </td>
          </tr>
          return <></>
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
        <table className="w-full p-4 text-center mt-8">
          <thead>
            <tr className="border-b border-neutral-500">
              <th>Folio</th>
              <th>cliente</th>
              <th>fecha inicial</th>
              <th>fecha final</th>
              <th>monto</th>
              <th>acciones</th>
            </tr>
          </thead>
          <tbody>
            <Items currentItems={currentItems} />
          </tbody>
        </table>
        <ReactPaginate
          className="flex gap-3 p-4 w-1/4 self-center items-center"
          breakLabel="..."
          pageClassName="bg-neutral-300 px-2 py-1"
          activeClassName="bg-neutral-500 text-white"
          nextLabel="next >"
          onPageChange={handlePageChange}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
        />
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
      />
    }
    <PaginatedItems itemsPerPage={10}/>
    { printInvoice && <InvoicePrintFormat invoiceData={printInvoice} />}
  </> 
} 

export default InvoiceList