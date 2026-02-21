'use client'
import { generateResume, InvoiceInitialValues, Resume, Totals } from "@/api/hooks/invoices/getInvoice"
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { Field, FieldArray, Form, Formik } from "formik"
import React, { ChangeEvent, useEffect, useState } from "react"
import logo from "@/public/logo.png"
import DatePicker from "react-datepicker"
import { Client } from "@/api/hooks/clients/getClient"
import { Ticket } from "@/api/hooks/invoices/getTicketsByClient"
import "react-datepicker/dist/react-datepicker.css";



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
    blockClient = false
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

  }) => {

  const [client, setclient] = useState<Client>()
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
      // console.log('clientData: ', clientData);
    if ((clientData)) {
      // console.log('clientData: ', clientData);
      // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
      // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
      //   const dateA: number = new Date(a.sale_date).valueOf();
      //   const dateB: number = new Date(b.sale_date).valueOf()
      //   return dateB - dateA;
      // });
      setclient(clientData)
      setClient(clientData)
    }
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
      <button className="px-6 py-2 bg-neutral-400" onClick={() => sendCreate()}>Crear corte</button>
    </div>
    {
      initialFormValues && <Formik
        initialValues={initialFormValues || null}
        onSubmit={async (values: InvoiceInitialValues) => values ? handleSubmit(values): null}
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

                      <Field required as="select" disabled={blockClient} className="border-b border-neutral-400 rounded-sm p-2 w-full" id="client" name="client" value={values.client}
                      onChange={(e: any) => {
                        // console.log(e.target.value);
                        // console.log(clients);
                        
                        let cli = clients.filter((client) => client.id === Number(e.target.value))[0]
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

                    <div className="flex py-2 justify-around">
                      <div className="flex flex-col">

                        <label htmlFor="">Fecha inicial</label>

                        <DatePicker
                          className="py-1"
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
                      <div className="flex flex-col">
                        <label htmlFor="">Fecha final</label>
                        <DatePicker
                          className="py-1"
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

                                console.log('tickets: ', tickets);
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
                                          ? resume?.products?.map((res: any, index: number) => {
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
                      <button disabled={values.tickets.length === 0} className=" disabled:bg-green-300 bg-green-700 px-4 py-2 text-white" type="submit">{ editInvoice ? 'Editar' : 'Crear'}</button>
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