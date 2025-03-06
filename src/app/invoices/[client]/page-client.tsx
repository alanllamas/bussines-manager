'use client'
import { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/tickets/getTickets";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import useGetClients, { Client } from "@/api/hooks/getClients";
import { Formik, Field, Form, FieldArray } from "formik";
import useCreateTicket from "@/api/hooks/tickets/useCreateTicket";
import logo from "@/public/logo.png"
import { useReactToPrint } from "react-to-print";
import useEditTicket, { EditTicketReq } from "@/api/hooks/tickets/useEditTicket";
import ReactPaginate from 'react-paginate';
import { useAuth } from "@/app/context/AuthUserContext";
import useGetInvoices, { Invoice } from "@/api/hooks/invoices/getInvoices";
import useGetTicketsByClient from "@/api/hooks/invoices/getTicketsByClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useCreateInvoice from "@/api/hooks/invoices/useCreateInvoice";
export type StrapiFile = {
    file?: File
    ref: string
    refId: string
    field: string
  }

export type InitialValues = {
  payment_date?: Date | null;
  invoice_id: string;
  client: string;
  tickets: string[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: string
  inner_comments: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: {}
}

export type createInvoiceReq = {
  payment_date?: Date | null;
  invoice_id: string;
  client: string[];
  tickets: string[];
  sub_total: number,
  taxes: number,
  total: number,
  shipping: number
  expected_payment_date?: Date | null
  initial_date?: Date | null
  ending_date?: Date | null
  invoice_send_date?: Date | null
  comments: string
  inner_comments: string
  invoice_status: string
  invoice_file?: StrapiFile
  proof_of_payment?: StrapiFile
  payment_supplement?: StrapiFile
  payment_reference?: string,
  resume: string
}

type ResumeData = {
  price?: number
  quantity?: number
  unit?: string
  taxes?: number
  variants?: string[]
  total?: number
  sub_total?: number
  total_taxes?: number
  name: string
}
type Resume = {
  products: ResumeData[]
  envios: ResumeData
  total: number,
  sub_total: number,
  total_taxes: number
}
type Totals = {
  total: number,
  sub_total: number,
  total_taxes: number
}

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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [create, setCreate] = useState(false)
  const [editTicket, setEditTicket] = useState<Ticket>()
  const [newInvoice, setNewInvoice] = useState<createInvoiceReq>()
  const [newEditTicket, setNewEditTicket] = useState<{ticket: EditTicketReq, documentId: string}>()
  const [printTicket, setPrintTicket] = useState<Ticket>()
  const [initialFormValues, setInitialFormValues] = useState<InitialValues>()

  const {
    invoices: invoicesData,
    error: invoicesError,
    isLoading: invoicesIsLoading,
  } = useGetInvoices()
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
    ticket: EditTicketData,
    error: EditTicketError,
    isLoading: EditTicketIsLoading
  } = useEditTicket(newEditTicket)
 
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
      

      // setTicket(InvoiceData.data)
    }
  }, [InvoiceIsLoading, InvoiceData, InvoiceError])
  // useEffect(() => {
  //   // make refresh

  //   if (EditTicketData && !EditTicketError && !EditTicketIsLoading) {
  //     // console.log('EditTicketData: ', EditTicketData);
  //     setTimeout(() => window.location.reload(), 500);
      

  //     // setTicket(InvoiceData.data)
  //   }
  // }, [EditTicketData, EditTicketError, EditTicketIsLoading])

  // useEffect(() => {
  //   // console.log('editTicket: ', editTicket);
  //   if (editTicket) {
      
  //     setInitialFormValues({
  //       client: editTicket?.client.id.toString() || "",
  //       date: new Date(editTicket?.sale_date || '').valueOf(),
  //       products: editTicket?.products?.map((product: TicketProduct): EProduct => {
  //         return {
  //           name: product?.product?.name || '',
  //           product: product?.product?.id || 0,
  //           price: product.price || 0,
  //           product_variants: product?.product_variants?.map((variant: ProductVariant) => ({id: variant.id, name: variant.name, type: variant.type})) || [],
  //           quantity: product.quantity || 0,
  //           total: product.product_total || 0, 
  //           unit: product?.product?.measurement_unit || '',
  //         } 
  //       }) || [emptyProduct],
  //       sub_total: editTicket?.sub_total || 0,
  //       shipping: editTicket?.shipping_price || 0,
  //       ticket_number: editTicket?.ticket_number || 0,
  //       total: editTicket?.total || 0
  //     })
  //   } 
    
  // }, [editTicket])

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
    console.log(values);
    const data = {
      ...values,

      client: [values.client],
      resume: JSON.stringify(values.resume) 
    } 
    // if (editTicket) {
    //   setNewEditTicket({ ticket: data, documentId: editTicket.documentId})
    // } else {
      setNewInvoice(data)
    // }

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
      invoice_status: "creado",
      payment_reference: "",
      tickets: [],
      proof_of_payment: undefined,
      invoice_file: undefined,
      payment_supplement: undefined,
      resume: {}
    })
    // {
    //   file: undefined,
    //   field: 'proof_of_payment',
    //   refId: '',
    //   ref: 'api::invoice.invoice'
    // }
  }
  const sendClose = () => {
    setEditTicket(undefined)
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
            <td className="py-2"><a href={`/invoices/${invoice.documentId}`}>{invoice.id}</a></td>
            <td className="py-2">{invoice.client?.name}</td>
            <td className="py-2">{new Date(invoice.initial_date).toLocaleDateString()}</td>
            <td className="py-2">{new Date(invoice.ending_date).toLocaleDateString()}</td>
            <td className="py-2">$ {invoice.total}</td>
            {/* <td className="py-2"><button onClick={() => setEditTicket(ticket)}><span>edit</span></button> | <button onClick={() => sendPrint(ticket)}><span>print</span></button></td> */}
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
  
  const generateResume = (filteredTickets: InitialValues['tickets']) => {
    const resume = filteredTickets.reduce((acc: {[key: string]: any}, ticket_id: string) => {
        // console.log(ticket_id);
      const ticket = tickets.find((value, i) => { return value.id === Number(ticket_id)})
      if (ticket) {
        console.log(ticket);
        ticket.products.reduce((prodAcc: {[key: string]: any}, prod: TicketProduct) => {
          // prodAcc = {
          //   ...prodAcc,
          //   [prod?.product?.name || '']: {
          //     ...prod,
          //     name: prod?.product?.name,
          //   }
          // }

          if (acc[prod?.product?.name || ''] && acc[prod?.product?.name || '']?.price === prod?.price) {
            // console.log('prod.product_total: ', prod.product_total);
            acc[prod?.product?.name || ''].total += prod?.product?.taxes ? ((prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes/100)) : prod.product_total,
            acc[prod?.product?.name || ''].sub_total += prod.product_total
            acc[prod?.product?.name || ''].quantity += prod.quantity
            acc[prod?.product?.name || ''].total_taxes += prod?.product?.taxes ? (prod?.product_total || 0) * (prod?.product?.taxes/100) : 0
            
          } else {
            acc[prod?.product?.name || ''] = {
              price: prod.price,
              quantity: prod.quantity,
              unit: prod?.product?.measurement_unit,
              taxes: prod?.product?.taxes,
              variants: [prod.product_variants?.map(variant => variant.name)],
              total:  prod?.product?.taxes ? ((prod.product_total || 0) + (prod?.product_total || 0) * (prod?.product?.taxes/100)) : prod.product_total,
              sub_total: prod.product_total,
              total_taxes: prod?.product?.taxes ? (prod?.product_total || 0) * (prod?.product?.taxes/100) : 0
            }
          }
          return prodAcc
        }, {})
        // console.log('prods: ', prods);

        if (acc['envios'].quantity) {
          if (ticket.shipping_price) {
            acc['envios'].total += ticket.shipping_price + (ticket.shipping_price * (16/100))
            acc['envios'].sub_total += ticket.shipping_price
            acc['envios'].total_taxes += (ticket.shipping_price * (16/100))
            acc['envios'].quantity += 1
          }
        } else  if (ticket.shipping_price) {
          acc.envios = {
            price: 0,
            quantity: 1,
            unit: '',
            taxes: 16,
            variants: [],
            sub_total: ticket.shipping_price || 0,
            total: ticket.shipping_price + (ticket.shipping_price * (16/100)), // catch case for needs or not shipping taxes
            total_taxes: ticket.shipping_price * (16/100)
          }
        }
      }
      return acc
    },{
      envios: {
        price: 0,
        quantity: 0,
        unit: '',
        taxes: 16,
        variants: [],
        sub_total:  0,
        total: 0,
        total_taxes: 0
      }
    })

    // console.log('resume: ', resume);
    const totals = Object.entries(resume).reduce((acc: {total: number, sub_total: number, total_taxes: number},[key, value]) => {
      const { total, sub_total, total_taxes} = value
      // console.log('key: ', key);
      // console.log('value: ', value);
      
      acc = {
        total: (total || 0) + (acc.total),
        sub_total: key === 'envios' ? acc.sub_total : (sub_total || 0) + (acc.sub_total),
        total_taxes: (total_taxes || 0) + (acc.total_taxes) 
      }
      return acc
    }, {total: 0, sub_total: 0, total_taxes: 0})
    // console.table(totals);
    const { envios, ...rest} = resume
    console.log('envios: ', envios);
    const results: Resume = {
      ...totals,
      envios: {
        ...envios,
        name: 'envios'
      },
      products: Object.entries(rest).map(([key, value]) => ({name: key, ...value}))
    }
    console.table(results);
    return {
      totals,
      results
    }
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
                                        const { results, totals } = generateResume(filteredTickets)
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
                                        const { results, totals } = generateResume(filteredTickets)
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
                                                      const res = generateResume(newtickets)
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
                                                            const res = generateResume(newtickets)
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
                                                            tickets.map((ticket: Ticket, index: number) => {
                                                              return <option key={`ticket-${index}`} value={ticket.id}>{ticket.total} | {new Date(ticket.sale_date).toLocaleDateString()}</option>
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
                          {
                            !create && <Disclosure>
                              <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-neutral-200 justify-between">
                                Archivos
                              </DisclosureButton>
                              <DisclosurePanel>
                                <div className="flex flex-col">
                                  <div className="flex justify-between w-full ">
                                    <label htmlFor="file">Factura</label> 
                                    <Field type="file" name="invoice_file.file" value={values?.invoice_file?.file}></Field>
                                  </div>
                                  <div className="flex justify-between w-full ">
                                    <label htmlFor="file">Comprobante de pago</label> 
                                    <Field type="file" name="proof_of_payment.file" value={values?.proof_of_payment?.file}></Field>
                                  </div>
                                  <div className="flex justify-between w-full ">
                                    <label htmlFor="file">Complemento de pago</label> 
                                    <Field type="file" name="payment_supplement.file" value={values?.payment_supplement?.file}></Field>
                                  </div>
                                  
                                </div>
                              </DisclosurePanel>
                            </Disclosure>
                          }
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
                                        console.log(e);
                                        
                                        const invoice_send_date = new Date(e)
                                        console.log('client: ', client);
                                        console.log('client?.taxing_info: ', client?.taxing_info);
                                        
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
                            <button className="bg-green-700 px-4 py-2 text-white" type="submit">{ editTicket ? 'Editar' : 'Crear'}</button>
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


    <section ref={contentRef} className="hidden print:block w-1/3 print:w-full print:shadow-none print:border-none shadow-xl my-2 px-12 pt-2 text-base text-neutral-900 border border-neutral-200">
      <div className="flex justify-between my-3 items-center">
        <img className="w-64" src={logo.src} alt="" />
        <div className="font-bold flex flex-col mt-6 gap-4 w-1/4">
          <span className="flex justify-around">
            <span>Folio:</span>
            <span>{printTicket?.ticket_number.toString().padStart(6, "0")}</span>
          </span>
          <span className="flex justify-between">
            <span>Fecha:</span>
            <span>{new Date(printTicket?.sale_date || '')?.toLocaleDateString()}</span>
          </span>
        </div>
      </div>
      <div className="flex mt-4 mb-8">
        <h4 className="mr-8">Cliente: </h4><span className="w-full flex justify-center border-b border-neutral-500">{printTicket?.client?.name}</span>
      </div>
      <div className="flex flex-col my-3">
        <table className="print:text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Producto</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Variantes</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Cantidad</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Precio</th>
              <th className="px-2 py-1 border  border-neutral-300 print:border-neutral-200">Importe</th>
            </tr>
          </thead>
          <tbody>
            {
              printTicket?.products?.map((product: TicketProduct, index: number) => {
                return <tr key={index} className="">
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200">{ product?.product?.name|| ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200">{ product?.product_variants?.map((variant: ProductVariant) => variant.name ).join(' | ') || ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right">{ product?.quantity } {product?.product?.measurement_unit|| ''}</td>
                  {/* <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right">$ { product?.price || ''}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right">$ { product?.product_total || ''}</td> */}
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right h-8">{ product?.price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                  <td className="px-2 border  border-neutral-300 print:border-neutral-200 text-right h-8">{ product?.product_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</td>
                </tr>
              })
            }
            
          </tbody>

        </table>
        <div className="my-8 flex justify-between">
          <div className="w-2/3 pr-4 pt-4 text-sm">
            <p className="mb-2">Tu compra ayuda a la conservación de nuestros maíces nativos. Gracias!</p>
            <p><span className="font-bold">Email: </span>itacatedemaiz@gmail.com</p>
            <p><span className="font-bold">Telefono: </span>322-294-7798</p>



          </div>
          <div className=" flex  flex-col w-1/2 gap-y-2 mt-2">
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Sub total</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{printTicket?.sub_total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Envio</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{printTicket?.shipping_price?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
            <div className="flex w-full">
              <p className="mr-1 w-3/4" >Total</p>
              <p className="border p-0.5 border-neutral-300 w-full px-3 text-right">{printTicket?.total?.toLocaleString("es-MX", {style:"currency", currency:"MXN"})}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </section>


}
 export default ClientInvoicesByCLient