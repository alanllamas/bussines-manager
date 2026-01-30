'use client'
import React, { useEffect, useRef, useState } from "react"
import { useAuth } from "@/app/context/AuthUserContext";
import useGetInvoice from "@/api/hooks/invoices/getInvoice";
import { Invoice } from "@/api/hooks/invoices/getInvoices";
import logo from '@/public/logo.png'
import { Ticket } from "@/api/hooks/tickets/getTickets";
import { generateResume, Resume, Totals } from "../page-client";
import { useReactToPrint } from "react-to-print";
import ReactMarkdown from 'react-markdown'


const ClientInvoice: React.FC<{ id: number }> = ({ id }) => {
  // @ts-expect-error no type found
  const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()

  useEffect(() => {
    const interval =
      setInterval(() => {
        window.location.pathname = '/'
      }, 500)
    setinterval(interval)
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    // console.log(interval);
    if (user) {
      clearInterval(interval)
    }
  }, [user])

  const [invoice, setInvoice] = useState<Invoice>()
  const [totals, setTotals] = useState<Totals>({total: 0, sub_total:0, total_taxes: 0})
  const [resume, setResume] = useState<Resume>()
  const {
    invoice: invoiceData,
    error: invoiceError,
    isLoading: invoiceIsLoading,
  } = useGetInvoice(id)

  useEffect(() => {
    if (invoiceData &&!invoiceError && !invoiceIsLoading) {
      const data = invoiceData.data
      console.log(data);
      const { client, tickets } = data
      
      const { results, totals } = generateResume(tickets.map(ticket => `${ticket.id}`), tickets, client)
      console.log(results);
      
      setResume(results)
      setTotals(totals)
      setInvoice(data)
      
    }
  },[invoiceData, invoiceError, invoiceIsLoading])

  // const date = new Date(invoice?.sale_date || '').toLocaleDateString()
  const copyParam = (param: string) => {
      navigator.clipboard.writeText(param)
  }

  const contentRef = useRef<HTMLDivElement>(null);

  const initial_date = new Date(invoice?.initial_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const ending_date = new Date(invoice?.ending_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const send_date = (invoice?.invoice_send_date || '').toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit'})
  const client_name = invoice?.client?.name?.toLocaleUpperCase()

  const Print = useReactToPrint({
    contentRef,
    documentTitle: `Corte-${client_name}-${initial_date}-${ending_date}`
  });

  return <section className="flex flex-col w-full justify-center items-center text-neutral-900 py-5">
    <div className="w-full pb-4 px-32 flex justify-end">

      <button className="px-4 py-2 bg-neutral-300" onClick={() => Print()}>Imprimir</button>
    </div>
    <section ref={contentRef} className="flex flex-col print:w-full print:shadow-none w-1/2 px-10 py-3 shadow-xl border text-sm">
      <div className="w-full flex justify-between items-start py-5">
        <img className="w-72" src={logo.src} alt="" />
        <div className="w-1/2 flex flex-col-reverse px-4 pt-12">
          {/* <div className="flex gap-4 border border-neutral-200 px-4 justify-between ">
            <p>Notas: </p>
            <div className="flex flex-row-reverse justify-between gap-2">
              { invoice?.tickets?.map((ticket, index) => {
                return <p>{ticket.id} {index !== 0 && '|'} </p>
              }) }
            </div>
          </div> */}
          <div className="flex gap-4 border border-neutral-200 px-4 justify-between ">
            <p>Fechas de corte: </p>
            <div className="flex justify-between gap-2">
              <p>{initial_date} al</p>
              <p>{ending_date}</p>
            </div>
          </div>
          <div className="flex gap-4 border border-neutral-200 px-4 justify-between ">
            <p>Fecha de envio: </p>
            <p>{send_date}</p>
          </div>
          {/* <div className="flex gap-4 border border-neutral-200 px-4 justify-between ">
            <p>Status: </p>
            <p>{invoice?.invoice_status.replace('-', ' ')}</p>
          </div> */}
        </div>
      </div>
      <h3 className="px-2 font-bold text-base">Data fiscal</h3>
      <div className="w-full flex justify-between pt-2 pb-4">
        <div className="w-1/2">
          <div className="flex gap-1 border border-neutral-200 pl-2 items-center justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p className="">Cliente: </p>
              <p className="text-xs pt-1">{(invoice?.client.name || '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client.name)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 items-center justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Razón social: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.taxing_company_name || '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.taxing_company_name)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 items-center justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>RFC: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.taxing_RFC || '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.taxing_RFC)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 items-center justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Codigo postal: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.zip_code || '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.zip_code)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 items-center justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Regimen fiscal: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.taxing_regime || '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.taxing_regime)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
        </div>
        <div className="w-1/2">

          <div className="flex gap-1 border border-neutral-200 pl-2 justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Forma de pago:</p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.taxing_payment_method|| '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.taxing_payment_method)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Metodo de pago:</p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.taxing_method_of_payment|| '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.taxing_method_of_payment)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Uso de CFDI: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.taxing_CFDI_use|| '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.taxing_CFDI_use)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Correo: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.email|| '')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.email)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
          <div className="flex gap-1 border border-neutral-200 pl-2 justify-between">
            <div className="flex gap-2 justify-between w-full pr-2">
              <p>Factura envios: </p>
              <p className="text-xs pt-1">{(invoice?.client?.taxing_info?.shipping_invoice ? 'Si' : 'No')}</p>
            </div>
            <button onClick={() => copyParam(invoice?.client?.taxing_info?.shipping_invoice)}><span className="material-symbols-outlined text-xs text-neutral-500 print:hidden">content_copy</span></button>
          </div>
        </div>
      </div>
      <h3 className="px-2 font-bold text-base mt-2">Notas</h3>
      <div className="w-full flex justify-between px-2 pt-2 pb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className="w-1/6 text-left pl-4">folio</th>
              <th className="text-left">fecha</th>
              <th className="text-center">sub total</th>
              <th className="text-center">envios</th>
              <th className="text-center">total</th>
            </tr>
          </thead>
          <tbody>
            {
              invoice?.tickets?.map((ticket: Ticket, i) => {
                return   <tr key={`ticket-${i}`} className="border-b border-neutral-300">
                    <td className="w-1/6 text-left pl-4"># { ticket.ticket_number }</td>
                    <td className="text-left">{ new Date(ticket.sale_date).toLocaleDateString('es-mx')}</td>
                    <td>
                      <div className="flex justify-between px-2">
                        <p>$</p>
                        <p>
                          { ticket.sub_total.toLocaleString('es-mx', { minimumFractionDigits: 2 } )}
                        </p>
                      </div>
                      
                    </td>
                    <td>
                      <div className="flex justify-between px-2">
                        <p>$</p>
                        <p>
                          { ticket.shipping_price.toLocaleString('es-mx', { minimumFractionDigits: 2 } )}
                        </p>
                      </div>
                      
                    </td>
                    <td className="pr-4">
                      <div className="flex justify-between px-2">
                        <p>$</p>
                        <p>
                          { ticket.total.toLocaleString('es-mx', { minimumFractionDigits: 2 } )}
                        </p>
                      </div>
                      
                    </td>
                  </tr>
              })
            }
          </tbody>
        </table>
      </div>
      <h3 className="px-2 font-bold text-base mt-2">Resumen</h3>
      <div className="flex flex-col px-2 pt-2 pb-4">
        {
          (resume?.products && resume?.products?.length > 0) || (resume?.envios && resume?.envios.total)
            ? <table className="text-sm w-full text-left font-medium">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="pl-4">Producto</th>
                    <th>Variantes</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center">Precio</th>
                    <th className="text-center">Sub Total</th>
                    <th className="text-center">IVA</th>
                    <th className="text-center">total IVA</th>
                    <th className="text-center pr-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    resume?.products && resume?.products?.length > 0
                      ? resume?.products?.map((res, index: number) => {
                          return <tr className="border-b border-neutral-300" key={index}>
                            <td className="pl-4">{res.name}</td>
                            <td>{res.variants?.join(' ')}</td>
                            <td className="text-right">{res.quantity} {res.unit}</td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {res.price?.toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {res.sub_total?.toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {(res.taxes  ? res.taxes/100 : 0).toLocaleString('es-mx', {style: 'percent'})}
                                </p>
                              </div>
                            
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {(res.total_taxes)?.toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            
                            </td>
                            <td className=" pr-4">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {(res.total || 0).toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            
                            </td>
                            
                          </tr>
                        })
                      : null
                  }
                  {
                    resume?.envios && resume?.envios.total
                      ? <>
                          <tr className="border-b border-neutral-300" key={resume.products.length}>
                            <td className="pl-4">{resume.envios.name}</td>
                            <td>{resume.envios.variants?.join(' ')}</td>
                            <td className="text-right">
                                <p>
                                  {resume.envios.quantity} {resume.envios.unit}
                                </p>
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {resume?.envios.sub_total && resume?.envios.quantity && (resume?.envios.sub_total / resume?.envios.quantity).toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {resume.envios.sub_total?.toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {(resume.envios.taxes  ? resume.envios.taxes/100 : 0).toLocaleString('es-mx', {style: 'percent'})}
                                </p>
                              </div>
                            </td>
                            <td className="">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {(resume.envios.total_taxes)?.toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </td>
                            <td className="pr-4">
                              <div className="flex justify-between px-2">
                                <p>$</p>
                                <p>
                                  {(resume.envios.total || 0).toLocaleString('es-mx', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </>
                      : null
                  }
                </tbody>
              </table>
            : null
        }
      </div>
      <h3 className="px-2 font-bold text-base mt-2">Comentarios</h3>
      <div className="flex flex-col px-2 pt-2 pb-4">
        {
          invoice?.comments
            ? <ReactMarkdown>{invoice.comments}</ReactMarkdown>
            : <p className="text-neutral-500">No hay comentarios</p>
        }
      </div>
      <div className="my-8 w-full flex self-end justify-end">
        {/* add payment rules */}
        <div className="w-1/3 px-4">
          <div className="flex justify-between gap-x-4 my-1">
            <label htmlFor="sub_total">Sub total</label>
            {/* <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300" disabled id="sub_total" value={totals?.sub_total} name="sub_total" type="string" placeholder="sub total" /> */}
            <div className="border border-neutral-400 rounded-sm px-2 w-1/2 flex justify-between bg-neutral-300"><p>$</p>{totals?.sub_total.toLocaleString('es-mx', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex justify-between gap-x-4 my-1">
            <label htmlFor="shipping">Envío</label>
            {/* <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 " id="shipping" value={values.shipping} name="shipping" type="string" placeholder="Envio" /> */}
            <div className="border border-neutral-400 rounded-sm px-2 w-1/2 flex justify-between "><p>$</p>{(resume?.envios?.sub_total || 0)?.toLocaleString('es-mx', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex justify-between gap-x-4 my-1">
            <label htmlFor="total_taxes">IVA</label>
            {/* <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 " id="total_taxes" value={totals?.total_taxes || 0} name="total_taxes" type="string" placeholder="Impuestos" /> */}
            <div className="border border-neutral-400 rounded-sm px-2 w-1/2 flex justify-between "><p>$</p>{(totals?.total_taxes || 0).toLocaleString('es-mx', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex justify-between gap-x-4 my-1">
            <label htmlFor="total">Total</label>
            {/* <Field className="hidden border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300" required disabled id="total" value={totals?.total} name="total" type="string" placeholder="total" /> */}
            <div className="border border-neutral-400 rounded-sm px-2 w-1/2 flex justify-between bg-neutral-300"><p>$</p>{totals?.total.toLocaleString('es-mx', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>
    </section>
  </section>
}
export default ClientInvoice


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