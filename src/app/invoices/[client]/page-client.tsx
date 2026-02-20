'use client'
import { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/tickets/getTickets";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import useGetClients from "@/api/hooks/getClients";
import { Formik, Field, Form, FieldArray } from "formik";
import logo from "@/public/logo.png"
import { useReactToPrint } from "react-to-print";
import ReactPaginate from 'react-paginate';
import { useAuth } from "@/app/context/AuthUserContext";
import useGetInvoices, { Invoice } from "@/api/hooks/invoices/getInvoices";
import useGetTicketsByClient from "@/api/hooks/invoices/getTicketsByClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useCreateInvoice from "@/api/hooks/invoices/useCreateInvoice";
import useEditInvoice, { EditInvoiceReq } from "@/api/hooks/invoices/useEditInvoice";
import { Client } from "@/api/hooks/getClient";
import { createInvoiceReq, generateResume, InitialValues, Resume, Totals } from "@/api/hooks/invoices/getInvoice";


const ClientInvoicesByCLient: React.FC<{ client: string }> = ({ client: client_param }) => {
  // console.log('client_param: ', client_param);
  // @ts-expect-error no type found
  const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()
  

  
  useEffect(() => {
    if(!user) {

      const interval =
        setInterval(() => {
          window.location.pathname = '/'
        }, 1000)
        // console.log(interval);
        
      setinterval(interval)
    }
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    // console.log(user);
    // console.log(interval);
    if (!user) {
        // window.location.pathname = '/'

    } else {
      clearInterval(interval)

    }
  }, [user])
  const today: number = new Date().valueOf()



  const [totals, setTotals] = useState<Totals>({total: 0, sub_total:0, total_taxes: 0})
  const [resume, setResume] = useState<Resume>()
  const [clients, setClients] = useState<Client[]>([])
  const [client, setclient] = useState<Client>()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [create, setCreate] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoice>()
  const [newInvoice, setNewInvoice] = useState<createInvoiceReq>()
  const [newEditInvoice, setNewEditInvoice] = useState<{invoice: Invoice, documentId: string}>()
  const [printTicket, setPrintTicket] = useState<Ticket>()
  const [initialFormValues, setInitialFormValues] = useState<InitialValues>()

  const {
    invoices: invoicesData,
    error: invoicesError,
    isLoading: invoicesIsLoading,
  } = useGetInvoices(client_param)
  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading
  } = useGetTicketsByClient(client_param)
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
    if (!ticketsError && !ticketsIsLoading) {
      
      // console.log('ticketsData.data: ', ticketsData.data);
      // console.log('meta.pagination.total: ', productsData.meta.pagination.total);
      
      setTickets(ticketsData.data)
      setAvailableTickets(ticketsData.data.filter(ticket => ticket.invoice === null))
    }
  }, [ticketsData.data, ticketsError, ticketsIsLoading])
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // console.log('clientsData.data: ', clientsData.data);
      // console.log('meta.pagination.total: ', clientsData.meta.pagination.total);
      // @ts-expect-error missing type
      const clients = clientsData.data
      const client = clients.filter((cli: Client) => cli.documentId === client_param)[0]
      setClients(clients)
      setclient(client)
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

  // useEffect(() => {
  //   if (printTicket) {
  //       Print()
  //   }
  // },[printTicket])

  // const sendPrint = (ticket:Ticket) => {
  //   const emptyTicket: TicketProduct = {
  //     id: 0
  //   }
  //   while (ticket?.products.length < 10) {
  //     ticket?.products.push(emptyTicket)
  //   }
  //   setPrintTicket(ticket)
  // }

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
  

  const contentRef = useRef<HTMLDivElement>(null);

  const Print = useReactToPrint({ contentRef, documentTitle: `Nota-${printTicket?.ticket_number}-${printTicket?.client?.name?.toLocaleUpperCase()}-${new Date(printTicket?.sale_date || '')?.toLocaleDateString()}` });
  function Items({ currentItems }: {currentItems: Invoice[]}) {
    return (
      <>
        {currentItems &&
          currentItems?.map((invoice: Invoice, index: number) => {
          // console.log('invoice: ', invoice);
          return <tr className="border-b border-neutral-300" key={`invoice-${index}`}>

            <td className="py-2"><a href={`/invoices/${client_param}/${invoice.documentId}`}>{invoice.id}</a></td>
            <td className="py-2">{invoice.client?.name}</td>
            <td className="py-2">{new Date(invoice.initial_date || 0).toLocaleDateString()}</td>
            <td className="py-2">{new Date(invoice.ending_date || 0).toLocaleDateString()}</td>
            <td className="py-2">$ {invoice.total}</td>
            <td className="py-2">
              <button onClick={() => setEditInvoice(invoice)}><span>edit</span></button> 
            {/* | <button onClick={() => sendPrint(ticket)}><span>print</span></button> */}
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
    const pageCount = Math.ceil(invoicesData.data.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageChange = (event: { selected: number }) => {
      const newOffset = (event.selected * itemsPerPage) % invoicesData.data.length;
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
  



  return <section className="w-full flex flex-col items-center">
    {
      (invoicesIsLoading
       || ticketsIsLoading
       || clientsIsLoading)
        ? <p>Loading</p>
        : <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
          <div className="flex justify-between">
            <h2>{client?.name}</h2>
            <button className="px-6 py-2 bg-neutral-400" onClick={() => sendCreate()}>Crear corte</button>
          </div>
          <PaginatedItems itemsPerPage={10}/>
          {
            initialFormValues && <Formik
              initialValues={initialFormValues || null}
              onSubmit={async (values: InitialValues) => values ? handleSubmit(values): null}
            >
              {
                ({values, setFieldValue}) => (
                  <Dialog open={isOpen} onClose={() => sendClose()} className="relative z-50 my-20">
                    <div className="fixed inset-0 flex w-screen items-center justify-center">
                      <DialogPanel className="w-5/12 space-y-2 border bg-neutral-100 p-8 shadow-2xl text-neutral-900">
                        


                          <DialogTitle className="font-bold flex flex-col">
                            <img className="w-36" src={logo.src} alt="" />
                            
                          </DialogTitle>
                        {/* form for invoices */}
                        <Form className="flex flex-col gap-y-4">
                          {/* <Field className="border border-neutral-400 rounded-sm px-2 hidden" id="ticket_number" name="ticket_number" type="number" disabled value={values.ticket_number} /> */}
                          {/* <Field className="border border-neutral-400 rounded-sm px-2 w-full" id="payment_date" name="payment_date" type="date-locale" value={values.payment_date} /> */}
                          <div className="flex align-baseline">

                            <label htmlFor="client" className="p-2">Cliente: </label>
                            <Field required as="select" disabled className="border-b border-neutral-400 rounded-sm p-2 w-full" id="client" name="client" value={values.client}>
                              <option value="">Cliente</option>
                              {
                                clients.map((cli, index: number) => {
                                  return <option key={`client-${index}`} value={cli.id} >{cli.name}</option>
                                })
                              }
                            </Field>
                          </div>

                          <div className="flex py-2 justify-around">
                            <div className="flex flex-col">

                              <label htmlFor="">Fecha inicial</label>

                              <DatePicker
                                className="py-1"
                                onChange={(e: any) => {
                                  // console.log(e);
                                  const initial_date = new Date(new Date(e).setHours(0, 0 , 0, 0))
                                  setFieldValue("initial_date", initial_date)
                                  // setFieldValue("ending_date", values.ending_date)

                                  
                                  if (values.ending_date) {
                                    const ending_date = new Date(new Date(values.ending_date).setHours(23, 59 , 59, 999))
                                    if (initial_date < ending_date) {
                                      setFieldValue('tickets', [])
                                      setResume(undefined)
                                      setFieldValue('resume', undefined )

                                      const filteredTickets = tickets.filter(ticket => {
                                        const sale_date = new Date(ticket.sale_date)
                                        // console.log('sale_date: ', sale_date);
                                        // console.log('initial_date: ', initial_date);
                                        // console.log('ending_date: ', ending_date);
                                        // console.log();
                                        return sale_date > initial_date && sale_date < ending_date
                                      }).map(ticket => `${ticket.id}`)
                                      // const filteredTickets = tickets.filter(ticket => {
                                      //   return new Date(ticket.sale_date) >= new Date(values.initial_date) && new Date(ticket.sale_date) <= new Date(e)
                                      // }).map(ticket => `${ticket.id}`)
                                      // console.log('filteredTickets: ', filteredTickets);
                                      setFieldValue('tickets', filteredTickets)
                                      setTimeout(() => {
                                        const { results, totals } = generateResume(filteredTickets, tickets, client)
                                        setFieldValue('shipping', results.envios.sub_total || 0 )
                                        setFieldValue('total', totals.total )
                                        setFieldValue('sub_total', totals.sub_total )
                                        setFieldValue('taxes', totals.total_taxes )
                                        setFieldValue('resume', results )

                                        setResume(results)
                                        setTotals(totals)
                                      }, 300);
                                      
                                    }
                                  }
                                }}
                                selected={values.initial_date}
                                placeholderText="fecha inicial"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label htmlFor="">Fecha final</label>
                              <DatePicker
                                className="py-1"
                                onChange={(e: any) => {
                                  // console.log(e);
                                  // console.log("ending date", e)

                                  // console.log("values.initial_date", values.initial_date)
                                  const ending_date = new Date(new Date(e).setHours(23, 59 , 59, 999))
                                  setFieldValue("ending_date", ending_date)
                                  if (values.initial_date) {
                                      const initial_date = new Date(values.initial_date)
                                    if (initial_date < ending_date) {
                                      setFieldValue('tickets', [])
                                      setResume(undefined)
                                      setFieldValue('resume', {} )

                                      const filteredTickets = tickets.filter(ticket => {
                                        const sale_date = new Date(ticket.sale_date)
                                        // console.log('sale_date: ', sale_date);
                                        // console.log('initial_date: ', initial_date);
                                        // console.log('ending_date: ', ending_date);
                                        // console.log();
                                        return sale_date > initial_date && sale_date < ending_date
                                      }).map(ticket => `${ticket.id}`)
                                      // const filteredTickets = tickets.filter(ticket => {
                                      //   return new Date(ticket.sale_date) >= new Date(values.initial_date) && new Date(ticket.sale_date) <= new Date(e)
                                      // }).map(ticket => `${ticket.id}`)
                                      // console.log('filteredTickets: ', filteredTickets);
                                      setFieldValue('tickets', filteredTickets)
                                      setTimeout(() => {
                                        const { results, totals } = generateResume(filteredTickets, tickets, client)
                                        setFieldValue('shipping', results.envios.sub_total || 0)
                                        setFieldValue('total', totals.total )
                                        setFieldValue('sub_total', totals.sub_total )
                                        setFieldValue('taxes', totals.total_taxes )
                                        setFieldValue('resume', results )
                                        setResume(results)
                                        setTotals(totals)
                                      }, 200);
                                    }
                                  }
                                }}
                                selected={values.ending_date}
                                placeholderText="fecha final"
                              />
                            </div>
                          </div>
                          <Disclosure>
                            <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
                              Notas
                            </DisclosureButton>
                            <DisclosurePanel>
                              <FieldArray name="tickets">
                                {({ remove, push }) => (
                                  <div>
                                    <div className="flex justify-between p-2">
                                      <h4>Notas</h4>
                                      <button
                                        type="button"
                                        className="secondary"
                                        onClick={() => push(0)}
                                      >
                                        Agregar +
                                      </button>
                                    </div>
                                    <div className="max-h-64 overflow-hidden overflow-y-scroll">
                                      { values.tickets.map((ticket, index) => {
                                          return (
                                            <Disclosure key={index}>
                                              {({ open }) => (
                                                <div key={`product=${index}`}>
                                                  <div className="flex justify-between items-center">

                                                    <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
                                                      {/* <p className="mx-1 self-start">{ open ? 'A' : 'V' }</p>
                                                      <p className="mx-1">{values.products[index].name ? values.products[index].name : ''}</p>
                                                      <p className="mx-1">{
                                                        values.products[index].product_variants[0]
                                                          ? values.products[index].product_variants.reduce((acc, variant) => {
                                                            return `${acc} ${variant.name}`
                                                          }, '')
                                                          : ''
                                                      }</p>
                                                      <div className="flex">

                                                        <p className="mx-1">{values.products[index].quantity ? values.products[index].quantity : ''}</p>
                                                        <p className="mx-1">{values.products[index].unit ? values.products[index].unit : ''}</p>
                                                      </div>
                                                      <p className="mx-1">{values.products[index].total ? `$ ${values.products[index].total}` : ''}</p> */}
                                                      {
                                                        !!values.tickets[index] && <div className="flex gap-2">

                                                          <span>
                                                            Nota:  {tickets.find((value, i) => { return value.id === Number(values.tickets[index])})?.ticket_number }
                                                          </span>
                                                          <span>
                                                            Fecha:  {new Date(tickets.find((value, i) => { return value.id === Number(values.tickets[index])})?.sale_date || '').toLocaleDateString('es-mx', {dateStyle: 'short'})}
                                                          </span>
                                                          <span>
                                                            Total:  {tickets.find((value, i) => { return value.id === Number(values.tickets[index])})?.total}
                                                          </span>
                                                        </div>
                                                      }

                                                    </DisclosureButton>
                                                    <button type="button" className="flex justify-end px-3 py-1 bg-red-800 text-white" onClick={() => {
                                                      remove(index)
                                                      const newtickets = values.tickets.filter((_, i: number) => { return index !== i})
                                                      const res = generateResume(newtickets, tickets, client)
                                                      if (res) {
                                                        setFieldValue('shipping', res.results.envios.sub_total || 0 )
                                                        setFieldValue('total', res.totals.total )
                                                        setFieldValue('sub_total', res.totals.sub_total )
                                                        setFieldValue('taxes', res.totals.total_taxes )
                                                        setFieldValue('resume', res.results )
                                                        setResume(res.results)
                                                        setTotals(res.totals)
                                                      }
                                                    }}>X</button>
                                                  </div>
                                                  <DisclosurePanel className="text-gray-500">
                                                    <div className="p-2 pt-0 border border-neutral-300 w-full" key={index}>

                                                      <div className="flex flex-col w-full">

                                                        <label htmlFor="`tickets.${index}`">Nota</label>
                                                        <Field as="select" className="border border-neutral-400 rounded-sm px-2 w-full" value={values.tickets[index]}
                                                          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                            const newtickets = [...values.tickets, e.target.value]
                                                            setFieldValue(`tickets.${index}`, e.target.value)
                                                            const res = generateResume(newtickets, tickets, client)
                                                            if (res) {
                                                              setFieldValue('shipping', res.results.envios.sub_total || 0 )
                                                              setFieldValue('total', res.totals.total )
                                                              setFieldValue('sub_total', res.totals.sub_total )
                                                              setFieldValue('taxes', res.totals.total_taxes )

                                                              setResume(res.results)
                                                              setTotals(res.totals)
                                                            }
                                                          }} name={`tickets.${index}`}
                                                        >
                                                          <option value="">Nota</option>
                                                          {
                                                            [...(editInvoice?.tickets || []), ...availableTickets].map((ticket: Ticket, i: number) => {
                                                              return <option className="disabled:bg-neutral-200" disabled={values.tickets.includes(`${ticket.id}`)} key={`ticket-${i}`} value={`${ticket.id}`}>{ticket.id} | {ticket.total} | {new Date(ticket.sale_date).toLocaleDateString()}</option>
                                                            })
                                                          }
                                                        </Field>
                                                      </div>
                                                    </div>
                                                  </DisclosurePanel>
                                                </div>
                                              )}
                                            </Disclosure>
                                          )
                                        })
                                      }
                                    </div>
                                  </div>
                                )}
                              </FieldArray>
                            </DisclosurePanel>
                          </Disclosure>
                          <Disclosure>
                            <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
                              Comentarios
                            </DisclosureButton>
                            <DisclosurePanel>
                              <div className="flex flex-col p-4 gap-2">
                                <Field as="textarea" className="border border-neutral-300 p-2" type="text" name="comments" value={values.comments} rows="3" placeholder="Comentarios para el cliente"></Field>
                                <Field as="textarea" className="border border-neutral-300 p-2" type="text" name="inner_comments" value={values.inner_comments} rows="3" placeholder="Comentarios internos"></Field>
                              </div>
                              {/* 
                                expected_payment_date
                                invoice_id
                                invoice_send_date
                                invoice_status
                                payment_date
                                payment_reference
                              */}
                            </DisclosurePanel>
                          </Disclosure>
                          <Disclosure>
                            <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
                              Resumen
                            </DisclosureButton>
                            <DisclosurePanel>
                              <div className="flex flex-col">
                                <div className="my-4 w-full">
                                  {
                                    (resume?.products && resume?.products?.length > 0) || (resume?.envios && resume?.envios.total)
                                      ? <table className="text-sm w-full text-left font-medium">
                                          <thead>
                                            <tr>
                                              <th>Producto</th>
                                              <th>Variantes</th>
                                              <th>Cantidad</th>
                                              <th>Precio</th>
                                              <th>Sub Total</th>
                                              <th>IVA</th>
                                              <th>total IVA</th>
                                              <th>Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {
                                              resume?.products && resume?.products?.length > 0
                                                ? resume?.products?.map((res, index: number) => {
                                                    return <tr className="border-b border-neutral-300" key={index}>
                                                      <td>{res.name}</td>
                                                      <td>{res.variants?.join(' ')}</td>
                                                      <td>{res.quantity} {res.unit}</td>
                                                      <td>{res.price?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      <td>{res.sub_total?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      <td>% {res.taxes || 0}</td>
                                                      <td>{(res.total_taxes)?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      <td>{(res.total || 0).toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      
                                                    </tr>
                                                  })
                                                : null
                                            }
                                            {
                                              resume?.envios && resume?.envios.total
                                                ? <>
                                                    <tr className="border-b border-neutral-300" key={resume.products.length}>
                                                      <td>{resume.envios.name}</td>
                                                      <td>{resume.envios.variants?.join(' ')}</td>
                                                      <td>{resume.envios.quantity} {resume.envios.unit}</td>
                                                      <td>{resume?.envios.sub_total && resume?.envios.quantity && (resume?.envios.sub_total / resume?.envios.quantity).toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      <td>{resume.envios.sub_total?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      <td>% {resume.envios.taxes || 0}</td>
                                                      <td>{(resume.envios.total_taxes)?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      <td>{(resume.envios.total || 0).toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</td>
                                                      
                                                    </tr>
                                                  </>
                                                : null
                                            }
                                          </tbody>
                                        </table>
                                      : null
                                  }
                                  
                                </div>
                                
                              </div>
                            </DisclosurePanel>
                          </Disclosure>
                          <Disclosure>
                            <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
                              Fechas y referencias
                            </DisclosureButton>
                            <DisclosurePanel>
                             
                              <div className="flex flex-col gap-2">
                                <div className="flex">

                                  <div className="flex flex-col w-1/3 px-2">
                                    <label htmlFor="invoice_id">Folio de factura</label> 
                                    <Field type="text" name="invoice_id" value={values?.invoice_id}></Field>
                                  </div>
                                  <div className="flex flex-col w-1/3 px-2">
                                    <label htmlFor="payment_reference">Referencia de pago</label> 
                                    <Field type="text" name="payment_reference" value={values?.payment_reference}></Field>
                                  </div>
                                  <div className="flex flex-col w-1/3 px-2">
                                    <label htmlFor="invoice_status">Estatus de corte</label>
                                    <Field as="select" name="invoice_status" value={values?.invoice_status}>
                                      <option value="">Selecciona una opción</option>
                                      <option value="creado">Creado</option>
                                      <option value="enviado">Enviado</option>
                                      <option value="pagado">Pagado</option>
                                    </Field>
                                  </div>
                                </div>
                                <div className="flex">
                                  <div className="flex flex-col w-1/3 px-2">
                                    <label htmlFor="invoice_send_date">Fecha de envio</label>
                                    <DatePicker
                                      className="py-1 w-10/12"
                                      onChange={(e: any) => {
                                        // console.log(e);
                                        
                                        const invoice_send_date = new Date(e)
                                        // console.log('client: ', client);
                                        // console.log('client?.taxing_info: ', client?.taxing_info);
                                        
                                        if (client?.taxing_info) {
                                          // payment_period
                                          setFieldValue("expected_payment_date", new Date(invoice_send_date.setDate(invoice_send_date.getDate() + client?.taxing_info.payment_period)))
                                          setFieldValue("invoice_send_date", e)
                                        } else {
                                          setFieldValue("invoice_send_date", e)

                                        }
                                      }}
                                      selected={values.invoice_send_date}
                                      name="invoice_send_date"
                                    />
                                  </div>
                                  <div className="flex flex-col w-1/3 px-2">
                                    <label htmlFor="">Fecha de pago</label>
                                    <DatePicker
                                      className="py-1 w-10/12"
                                      onChange={(e: any) => {
                                        const payment_date = new Date(e)
                                        setFieldValue("payment_date", payment_date)
                                      }}
                                      name="payment_date"
                                      selected={values.payment_date}
                                    />
                                  </div>
                                  <div className="flex flex-col w-1/3 px-2">
                                    <label htmlFor="">Fecha vencimiento</label> 
                                    <DatePicker
                                      className="py-1 w-10/12"
                                      onChange={(e: any) => {
                                        const expected_payment_date = new Date(e)
                                        setFieldValue("expected_payment_date", expected_payment_date)
                                      }}
                                      name="expected_payment_date"
                                      selected={values.expected_payment_date}
                                    />
                                  </div>
                                </div>
                                
                              </div>
                            </DisclosurePanel>
                          </Disclosure>
                          <div className="my-4 w-full flex justify-between">
                            <div className="w-1/2 px-4">
                              <div className="flex justify-between gap-x-4 my-2">
                                <label htmlFor="sub_total">Sub total</label>
                                <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300" disabled id="sub_total" value={totals?.sub_total} name="sub_total" type="string" placeholder="sub total" />
                                <div className="border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300">{totals?.sub_total.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                              </div>
                              <div className="flex justify-between gap-x-4 my-2">
                                <label htmlFor="shipping">Envío</label>
                                <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 " id="shipping" value={values.shipping} name="shipping" type="string" placeholder="Envio" />
                                <div className="border border-neutral-400 rounded-sm px-2 w-1/2 ">{(resume?.envios?.sub_total || 0)?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                              </div>
                            </div>
                            <div className="w-1/2 px-4">
                              <div className="flex justify-between gap-x-4 my-2">
                                <label htmlFor="total_taxes">IVA</label>
                                <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 " id="total_taxes" value={totals?.total_taxes || 0} name="total_taxes" type="string" placeholder="Impuestos" />
                                <div className="border border-neutral-400 rounded-sm px-2 w-1/2 ">{(totals?.total_taxes || 0).toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                              </div>
                              <div className="flex justify-between gap-x-4 my-2">
                                <label htmlFor="total">Total</label>
                                <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300" required disabled id="total" value={totals?.total} name="total" type="string" placeholder="total" />
                                <div className="border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300">{totals?.total.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 justify-end">
                            <button className="bg-red-800 px-4 py-2 rounded-sm text-white" onClick={() => sendClose()}>Cancelar</button>
                            <button className=" disabled:bg-green-300 bg-green-700 px-4 py-2 text-white" type="submit">{ editInvoice ? 'Editar' : 'Crear'}</button>
                          </div>
                        </Form>
                      </DialogPanel>
                    </div>
                  </Dialog>
                )
              }
            </Formik>
          }
        </section>
    }



  </section>


}
 export default ClientInvoicesByCLient