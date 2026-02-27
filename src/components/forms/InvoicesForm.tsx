'use client'
import { generateResume, InvoiceInitialValues, Resume, Totals } from "@/api/hooks/invoices/getInvoice"
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { Field, FieldArray, Form, Formik } from "formik"
import * as Yup from "yup"
import React, { ChangeEvent, useEffect, useState } from "react"
import logo from "@/public/logo.png"
import DatePicker from "react-datepicker"
import { Client } from "@/api/hooks/clients/getClient"
import { Ticket } from "@/api/hooks/invoices/getTicketsByClient"
import "react-datepicker/dist/react-datepicker.css";

const invoiceSchema = Yup.object({
  client: Yup.string().required('Selecciona un cliente'),
  initial_date: Yup.date().nullable().required('La fecha inicial es requerida'),
  ending_date: Yup.date().nullable().required('La fecha final es requerida')
    .min(Yup.ref('initial_date'), 'La fecha final debe ser posterior a la inicial'),
  tickets: Yup.array().min(1, 'Agrega al menos una nota al corte'),
})



const InvoicesForm: React.FC<any> = ({
    sendCreate,
    initialFormValues,
    handleSubmit,
    isOpen,
    sendClose,
    editInvoice,
    totals,
    resume,
    clients,
    availableTickets,
    setTotals,
    setResume,
    tickets: ticketsData,
    client: clientData,
    setClient,
    blockClient = false,
    apiError = null
  } : {
    sendCreate: any,
    initialFormValues: InvoiceInitialValues,
    handleSubmit: any,
    isOpen: boolean,
    sendClose: any,
    editInvoice: any,
    totals: Totals,
    resume: Resume,
    clients: Client[],
    availableTickets: Ticket[],
    setTotals: any,
    setResume: any,
    tickets: Ticket[]
    client: Client
    setClient: any,
    blockClient: boolean
    apiError?: any

  }) => {

  const [client, setclient] = useState<Client>()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [openPanel, setOpenPanel] = useState<string | null>(null)
  const togglePanel = (name: string) => setOpenPanel(prev => prev === name ? null : name)

  useEffect(() => {
    setclient(clientData)
    if (clientData) setClient(clientData)
  }, [clientData])
  useEffect(() => {
    if (client) {
      // console.log('client: ', client);
      // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      // setclient(client)
      setClient(client)
    }
  }, [client])
  useEffect(() => {
    if (ticketsData) {
      // console.log('ticketsData: ', ticketsData);
      // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      // settickets(ticketsData)
      setTickets(ticketsData)
    }
  }, [ticketsData])

  return <>
    <div className="flex justify-between">
      {/* <h2>{client?.name}</h2> */}
      <button className="btn-primary" onClick={() => sendCreate()}>
        <span className="material-symbols-outlined text-[16px]">add</span>
        Crear corte
      </button>
    </div>
    {
      initialFormValues && <Formik
        enableReinitialize
        initialValues={initialFormValues || null}
        validationSchema={invoiceSchema}
        onSubmit={async (values: InvoiceInitialValues) => values ? handleSubmit(values): null}
      >
        {
          ({values, setFieldValue, errors, touched, isValid, dirty}) => (
            <Dialog open={isOpen} onClose={() => sendClose()} className="relative z-50 my-20">
              <div className="fixed inset-0 flex w-screen items-center justify-center">
                <DialogPanel className="w-5/12 border bg-surface-50 shadow-2xl text-surface-900 flex flex-col h-[90vh]">
                  <Form className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-8 space-y-2">


                    <DialogTitle className="font-bold flex justify-between items-center">
                      <img className="w-36" src={logo.src} alt="" />
                      {values.invoice_id && <span className="text-lg text-surface-600">Folio {String(values.invoice_id).padStart(5, '0')}</span>}
                    </DialogTitle>
                    {/* <Field className="border border-surface-300 rounded-sm px-2 hidden" id="ticket_number" name="ticket_number" type="number" disabled value={values.ticket_number} /> */}
                    {/* <Field className="border border-surface-300 rounded-sm px-2 w-full" id="payment_date" name="payment_date" type="date-locale" value={values.payment_date} /> */}
                    <div className="flex align-baseline">

                      <label htmlFor="client" className="p-2">Cliente: </label>

                      <Field required as="select" disabled={blockClient} className="field-select" id="client" name="client" value={values.client}
                      onChange={(e: any) => {
                        // console.log(e.target.value);
                        // console.log(clients);
                        
                        const cli = clients.filter((client) => client.id === Number(e.target.value))[0]
                        // console.log('cli: ', cli);
                        
                        setFieldValue("client", e.target.value)
                        setclient(cli)
                      }}>
                        <option value="">Cliente</option>
                        {
                          clients.map((cli: Client, index: number) => {
                            return <option key={`client-${index}`} value={cli.id} >{cli.name}</option>
                          })
                        }
                      </Field>

                    </div>

                    <div className="flex py-2 gap-4">
                      <div className="flex flex-col flex-1">
                        <label className="field-label">Fecha inicial</label>
                        <DatePicker
                          className="field-input"
                          disabled={!client}
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
                      <div className="flex flex-col flex-1">
                        <label className="field-label" htmlFor="">Fecha final</label>
                        <DatePicker
                          className="field-input"
                          disabled={!client}
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

                                const filteredTickets = tickets.reduce((acc: string[], curr: Ticket) => {
                                  const sale_date = new Date(curr.sale_date)
                                  // console.log('sale_date: ', sale_date);
                                  // console.log('initial_date: ', initial_date);
                                  // console.log('ending_date: ', ending_date);
                                  // console.log();
                                  if ((sale_date > initial_date && sale_date < ending_date) && !curr.invoice) {
                                    acc = [...acc, `${curr.id}`]
                                  } 
                                  return acc
                                }, [])
                                // tickets.filter(ticket => {
                                //   const sale_date = new Date(ticket.sale_date)
                                //   console.log('sale_date: ', sale_date);
                                //   console.log('initial_date: ', initial_date);
                                //   console.log('ending_date: ', ending_date);
                                //   // console.log();
                                //   return sale_date > initial_date && sale_date < ending_date
                                // }).map(ticket => `${ticket.id}`)

                               
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
                                }, 300);
                              }
                            }
                          }}
                          selected={values.ending_date}
                          placeholderText="fecha final"
                        />
                      </div>
                    </div>
                    <Disclosure as="div" defaultOpen={openPanel === 'notas'}>
                      <DisclosureButton onClick={() => togglePanel('notas')} className="py-1 px-2 min-h-8 w-full flex bg-surface-100 justify-between items-center">
                        <span className="flex items-center gap-2">
                          Notas
                          {(touched as any).tickets && errors.tickets && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                              <span className="text-xs text-red-500">Agrega al menos una nota</span>
                            </>
                          )}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-surface-400">{openPanel === 'notas' ? 'expand_less' : 'expand_more'}</span>
                      </DisclosureButton>
                      <DisclosurePanel>
                        <FieldArray name="tickets">
                          {({ remove, push }) => (
                            <div>
                              <div className="flex justify-between items-center p-2">
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Notas</h4>
                                <button type="button" className="btn-secondary" onClick={() => push(0)}>
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                  Agregar
                                </button>
                              </div>
                              <div className="max-h-64 overflow-hidden overflow-y-scroll">
                                { values.tickets.map((ticket, index) => {
                                    return (
                                      <Disclosure key={index}>
                                        {({ open }) => (
                                          <div key={`product=${index}`}>
                                            <div className="flex justify-between items-center">

                                              <DisclosureButton className="py-1 px-2 min-h-8 w-full flex bg-surface-100 justify-between">
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
                                                      Nota:  {String(tickets.find((value, i) => { return value.id === Number(values.tickets[index])})?.ticket_number ?? '').padStart(5, '0')}
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
                                              <button type="button" className="btn-danger" onClick={() => {
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
                                              <div className="p-2 pt-0 border border-surface-200 w-full" key={index}>

                                                <div className="flex flex-col w-full">

                                                  <label htmlFor="`tickets.${index}`">Nota</label>
                                                  <Field as="select" className="field-select" value={values.tickets[index]}
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
                                                        return <option className="disabled:bg-surface-100" disabled={values.tickets.includes(`${ticket.id}`)} key={`ticket-${i}`} value={`${ticket.id}`}>{ticket.id} | {ticket.total} | {new Date(ticket.sale_date).toLocaleDateString()}</option>
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
                    <Disclosure as="div" defaultOpen={openPanel === 'comentarios'}>
                      <DisclosureButton onClick={() => togglePanel('comentarios')} className="py-1 px-2 min-h-8 w-full flex bg-surface-100 justify-between items-center">
                        Comentarios
                        <span className="material-symbols-outlined text-[16px] text-surface-400">{openPanel === 'comentarios' ? 'expand_less' : 'expand_more'}</span>
                      </DisclosureButton>
                      <DisclosurePanel>
                        <div className="flex flex-col p-4 gap-2">
                          <Field as="textarea" className="field-textarea" type="text" name="comments" value={values.comments} rows="3" placeholder="Comentarios para el cliente"></Field>
                          <Field as="textarea" className="field-textarea" type="text" name="inner_comments" value={values.inner_comments} rows="3" placeholder="Comentarios internos"></Field>
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
                    <Disclosure as="div" defaultOpen={openPanel === 'resumen'}>
                      <DisclosureButton onClick={() => togglePanel('resumen')} className="py-1 px-2 min-h-8 w-full flex bg-surface-100 justify-between items-center">
                        Resumen
                        <span className="material-symbols-outlined text-[16px] text-surface-400">{openPanel === 'resumen' ? 'expand_less' : 'expand_more'}</span>
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
                                          ? resume?.products?.map((res: any, index: number) => {
                                              return <tr className="border-b border-surface-200" key={index}>
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
                                              <tr className="border-b border-surface-200" key={resume.products.length}>
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
                    <Disclosure as="div" defaultOpen={openPanel === 'fechas'}>
                      <DisclosureButton onClick={() => togglePanel('fechas')} className="py-1 px-2 min-h-8 w-full flex bg-surface-100 justify-between items-center">
                        Fechas y referencias
                        <span className="material-symbols-outlined text-[16px] text-surface-400">{openPanel === 'fechas' ? 'expand_less' : 'expand_more'}</span>
                      </DisclosureButton>
                      <DisclosurePanel>
                      
                        <div className="flex flex-col gap-2">
                          <div className="flex">

                            <div className="flex flex-col w-1/3 px-2">
                              <label className="field-label" htmlFor="invoice_id">Folio de factura</label>
                              <Field className="field-input" type="text" name="invoice_id" value={values?.invoice_id} />
                            </div>
                            <div className="flex flex-col w-1/3 px-2">
                              <label className="field-label" htmlFor="payment_reference">Referencia de pago</label>
                              <Field className="field-input" type="text" name="payment_reference" value={values?.payment_reference} />
                            </div>
                            <div className="flex flex-col w-1/3 px-2">
                              <label className="field-label" htmlFor="invoice_status">Estatus de corte</label>
                              <Field className="field-select" as="select" name="invoice_status" value={values?.invoice_status}>
                                <option value="">Selecciona una opción</option>
                                <option value="creado">Creado</option>
                                <option value="enviado">Enviado</option>
                                <option value="pagado">Pagado</option>
                              </Field>
                            </div>
                          </div>
                          <div className="flex">
                            <div className="flex flex-col w-1/3 px-2">
                              <label className="field-label" htmlFor="invoice_send_date">Fecha de envio</label>
                              <DatePicker
                                className="field-input"
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
                              <label className="field-label" htmlFor="">Fecha de pago</label>
                              <DatePicker
                                className="field-input"
                                onChange={(e: any) => {
                                  const payment_date = new Date(e)
                                  setFieldValue("payment_date", payment_date)
                                }}
                                name="payment_date"
                                selected={values.payment_date}
                              />
                            </div>
                            <div className="flex flex-col w-1/3 px-2">
                              <label className="field-label" htmlFor="">Fecha vencimiento</label>
                              <DatePicker
                                className="field-input"
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
                          <Field className="hidden border border-surface-300 rounded-sm px-2 w-1/2 bg-surface-200" disabled id="sub_total" value={totals?.sub_total} name="sub_total" type="string" placeholder="sub total" />
                          <div className="border border-surface-300 rounded-sm px-2 w-1/2 bg-surface-200">{totals?.sub_total.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                        </div>
                        <div className="flex justify-between gap-x-4 my-2">
                          <label htmlFor="shipping">Envío</label>
                          <Field className="hidden border border-surface-300 rounded-sm px-2 w-1/2 " id="shipping" value={values.shipping} name="shipping" type="string" placeholder="Envio" />
                          <div className="border border-surface-300 rounded-sm px-2 w-1/2 ">{(resume?.envios?.sub_total || 0)?.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                        </div>
                      </div>
                      <div className="w-1/2 px-4">
                        <div className="flex justify-between gap-x-4 my-2">
                          <label htmlFor="total_taxes">IVA</label>
                          <Field className="hidden border border-surface-300 rounded-sm px-2 w-1/2 " id="total_taxes" value={totals?.total_taxes || 0} name="total_taxes" type="string" placeholder="Impuestos" />
                          <div className="border border-surface-300 rounded-sm px-2 w-1/2 ">{(totals?.total_taxes || 0).toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                        </div>
                        <div className="flex justify-between gap-x-4 my-2">
                          <label htmlFor="total">Total</label>
                          <Field className="hidden border border-surface-300 rounded-sm px-2 w-1/2 bg-surface-200" required disabled id="total" value={totals?.total} name="total" type="string" placeholder="total" />
                          <div className="border border-surface-300 rounded-sm px-2 w-1/2 bg-surface-200">{totals?.total.toLocaleString('es-mx', {style:"currency", currency:"MXN"})}</div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  <div className="px-8 py-4 border-t border-surface-200 bg-surface-50 flex flex-col gap-2">
                    {apiError && (
                      <div className="alert-error">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        Error al guardar. Por favor intenta de nuevo.
                      </div>
                    )}
                    {touched.client && errors.client && <p className="alert-field">{errors.client as string}</p>}
                    {touched.initial_date && errors.initial_date && <p className="alert-field">{errors.initial_date as string}</p>}
                    {touched.ending_date && errors.ending_date && <p className="alert-field">{errors.ending_date as string}</p>}
                    {(touched as any).tickets && errors.tickets && <p className="alert-field">{errors.tickets as string}</p>}
                    <div className="flex gap-4 justify-end">
                      <button className="btn-danger" onClick={() => sendClose()}>Cancelar</button>
                      <button disabled={!isValid || !dirty} className="btn-primary disabled:opacity-50" type="submit">{ editInvoice ? 'Editar' : 'Crear'}</button>
                    </div>
                  </div>
                  </Form>
                </DialogPanel>
              </div>
            </Dialog>
          )
        }
      </Formik>
    }
  </>
} 

export default InvoicesForm