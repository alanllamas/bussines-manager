'use client'
import useGetTickets, { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/tickets/getTickets";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import useGetProducts, { Product } from "@/api/hooks/getProducts";
import useGetClients, { Client } from "@/api/hooks/getClients";
import { Formik, Field, Form, FieldArray, useFormikContext, useField } from "formik";
import useCreateTicket from "@/api/hooks/tickets/useCreateTicket";
import logo from "@/public/logo.png"
import { useReactToPrint } from "react-to-print";
import useEditTicket, { EditTicketReq } from "@/api/hooks/tickets/useEditTicket";
import ReactPaginate from 'react-paginate';
import { useAuth } from "@/app/context/AuthUserContext";
import useGetInvoices, { Invoice } from "@/api/hooks/invoices/getInvoices";
import Link from "next/link";

// import { useAuth } from "@/context/AuthUserContext";
// import { useRouter } from "next/navigation";

const ClientInvoices: React.FC = () => {
  // @ts-expect-error no type found
 const { user } = useAuth();
  const [interval, setinterval] = useState<NodeJS.Timeout>()


  
  useEffect(() => {
    if(!user) {

      const interval =
        setInterval(() => {
          window.location.pathname = '/'
        }, 1000)
        console.log(interval);
        
      setinterval(interval)
    }
  }, [])
  // Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    console.log(user);
    console.log(interval);
    if (!user) {
        // window.location.pathname = '/'

    } else {
      clearInterval(interval)

    }
  }, [user])
  // const today: number = new Date().valueOf()
// 

  const [clients, setClients] = useState<Client[]>([])

  // const [products, setProducts] = useState<Product[]>([])
  // const [invoices, setInvoices] = useState<Invoice[]>([])
  // const [isOpen, setIsOpen] = useState(false)
  // const [editTicket, setEditTicket] = useState<Ticket>()
  // const [newTicket, setNewTicket] = useState<createTicketReq>()
  // const [newEditTicket, setNewEditTicket] = useState<{ticket: EditTicketReq, documentId: string}>()
  // const [printTicket, setPrintTicket] = useState<Ticket>()
  // const [initialFormValues, setInitialFormValues] = useState<InitialValues>()

  // const {
  //   invoices: invoicesData,
  //   error: invoicesError,
  //   isLoading: invoicesIsLoading,
  // } = useGetInvoices()
  // const {
  //   products: productsData,
  //   error: productsError,
  //   isLoading: productsIsLoading
  // } = useGetProducts()
  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()
  // const {
  //   ticket: TicketData,
  //   error: TicketError,
  //   isLoading: TicketIsLoading
  // } = useCreateTicket(newTicket)
  // const {
  //   ticket: EditTicketData,
  //   error: EditTicketError,
  //   isLoading: EditTicketIsLoading
  // } = useEditTicket(newEditTicket)
 
  // useEffect(() => {
  //   if ((!invoicesError && !invoicesIsLoading && invoicesData.data)) {
      
  //     console.log('invoicesData.data: ', invoicesData.data);
  //     // console.log('meta.pagination.total: ', invoicesData.meta.pagination.total);
  //     // const data = invoicesData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
  //     //   const dateA: number = new Date(a.sale_date).valueOf();
  //     //   const dateB: number = new Date(b.sale_date).valueOf()
  //     //   return dateB - dateA;
  //     // });
  //     setInvoices(invoicesData.data)
  //   }
  // }, [invoicesIsLoading, invoicesData.data, invoicesError])
  // // useEffect(() => {
  //   if (!productsError && !productsIsLoading) {
      
  //     // console.log('productsData.data: ', productsData.data);
  //     // console.log('meta.pagination.total: ', productsData.meta.pagination.total);
  //     // @ts-expect-error missing type

  //     setProducts(productsData.data)
  //   }
  //     // @ts-expect-error missing type
  // }, [productsIsLoading, productsData.data, productsError])
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // console.log('clientsData.data: ', clientsData.data);
      // console.log('meta.pagination.total: ', clientsData.meta.pagination.total);
      // @ts-expect-error missing type

      setClients(clientsData.data)
    }
      // @ts-expect-error missing type
  }, [clientsIsLoading, clientsData.data, clientsError])
  // useEffect(() => {
  //   // make refresh

  //   if (!TicketError && !TicketIsLoading && TicketData) {
  //     // console.log('TicketData: ', TicketData);
  //     setTimeout(() => window.location.reload(), 500);
      

  //     // setTicket(TicketData.data)
  //   }
  // }, [TicketIsLoading, TicketData, TicketError])
  // useEffect(() => {
  //   // make refresh

  //   if (EditTicketData && !EditTicketError && !EditTicketIsLoading) {
  //     // console.log('EditTicketData: ', EditTicketData);
  //     setTimeout(() => window.location.reload(), 500);
      

  //     // setTicket(TicketData.data)
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
  //       subtotal: editTicket?.sub_total || 0,
  //       shipping: editTicket?.shipping_price || 0,
  //       ticket_number: editTicket?.ticket_number || 0,
  //       total: editTicket?.total || 0
  //     })
  //   } 
    
  // }, [editTicket])

  // useEffect(() => {
  //   // console.log('initialFormValues: ', initialFormValues);
  //   setIsOpen(true)
    
  // }, [initialFormValues])

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
  // const handleSubmit = async (values: InitialValues) => {
  //   setIsOpen(false)
  //   // console.log(values);
  //   // const { date, client, shipping, subtotal, products, ticket_number, total } = values
  //   // const data = {
  //   //   sale_date: new Date(date),
  //   //   client: [Number(client)],
  //   //   shipping_price: shipping,
  //   //   sub_total: subtotal,
  //   //   total,
  //   //   ticket_number,
  //   //   products: products.map((product: EProduct) => {
  //   //     return {
  //   //       product: [product.product],
  //   //       quantity: product.quantity,
  //   //       product_total: product.total,
  //   //       product_variants: product.product_variants.map(variant => { return Number(variant.id) }),
  //   //       price: product.price
  //   //     }
  //   //   })
  //   // } 
  //   // if (editTicket) {
  //   //   setNewEditTicket({ ticket: data, documentId: editTicket.documentId})
  //   // } else {
  //   //   setNewTicket(data)
  //   // }

  // }
  // const sendCreate = () => {
  //   setInitialFormValues({
  //     client: "",
  //     subtotal: 0,
  //     taxes: 0,
  //     total: 0,
  //     comments: "",
  //     inner_comments: "",
  //     ending_date: 0,
  //     expected_payment_date: 0,
  //     initial_date: 0,
  //     invoice_send_date: 0,
  //     payment_date: 0,
  //     invoice_id: "",
  //     invoice_status: "creado",
  //     payment_reference: "",
  //     tickets: []
  //   })
  // }
  // const sendClose = () => {
  //   setEditTicket(undefined)
  //   setInitialFormValues(undefined)
  //   setIsOpen(false)
  // }
  

  // const contentRef = useRef<HTMLDivElement>(null);

  // const Print = useReactToPrint({ contentRef, documentTitle: `Nota-${printTicket?.ticket_number}-${printTicket?.client?.name?.toLocaleUpperCase()}-${new Date(printTicket?.sale_date || '')?.toLocaleDateString()}` });
  // function Items({ currentItems }: {currentItems: Invoice[]}) {
  //   return (
  //     <>
  //       {currentItems &&
  //         currentItems?.map((invoice: Invoice, index: number) => {
  //         // console.log('invoice: ', invoice);
  //         return <tr className="border-b border-neutral-300" key={`invoice-${index}`}>
  //           <td className="py-2"><a href={`/invoices/${invoice.documentId}`}>{invoice.id}</a></td>
  //           <td className="py-2">{invoice.client?.name}</td>
  //           <td className="py-2">{new Date(invoice.initial_date).toLocaleDateString()}</td>
  //           <td className="py-2">{new Date(invoice.ending_date).toLocaleDateString()}</td>
  //           <td className="py-2">$ {invoice.total}</td>
  //           {/* <td className="py-2"><button onClick={() => setEditTicket(ticket)}><span>edit</span></button> | <button onClick={() => sendPrint(ticket)}><span>print</span></button></td> */}
  //         </tr>
  //         return <></>
  //       })}
  //     </>
  //   );
  // }

  // function PaginatedItems({ itemsPerPage }: { itemsPerPage: number }) {
  //   // Here we use item offsets; we could also use page offsets
  //   // following the API or data you're working with.
  //   const [itemOffset, setItemOffset] = useState(0);

  //   // Simulate fetching items from another resources.
  //   // (This could be items from props; or items loaded in a local state
  //   // from an API endpoint with useEffect and useState)
  //   const endOffset = itemOffset + itemsPerPage;
  //   console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  //   const currentItems = invoices?.slice(itemOffset, endOffset);
  //   const pageCount = Math.ceil(invoicesData.data.length / itemsPerPage);

  //   // Invoke when user click to request another page.
  //   const handlePageChange = (event: { selected: number }) => {
  //     const newOffset = (event.selected * itemsPerPage) % invoicesData.data.length;
  //     console.log(
  //       `User requested page number ${event.selected}, which is offset ${newOffset}`
  //     );
  //     setItemOffset(newOffset);
  //   };
  //     return (
  //     <section className="w-full flex flex-col items-center">
  //       <table className="w-full p-4 text-center mt-8">
  //         <thead>
  //           <tr className="border-b border-neutral-500">
  //             <th>Folio</th>
  //             <th>cliente</th>
  //             <th>fecha inicial</th>
  //             <th>fecha final</th>
  //             <th>monto</th>
  //             <th>acciones</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           <Items currentItems={currentItems} />
  //         </tbody>
  //       </table>
  //       <ReactPaginate
  //         className="flex gap-3 p-4 w-1/4 self-center items-center"
  //         breakLabel="..."
  //         pageClassName="bg-neutral-300 px-2 py-1"
  //         activeClassName="bg-neutral-500 text-white"
  //         nextLabel="next >"
  //         onPageChange={handlePageChange}
  //         pageRangeDisplayed={5}
  //         pageCount={pageCount}
  //         previousLabel="< previous"
  //         renderOnZeroPageCount={null}
  //       />
  //     </section>
  //   );
  // }


  return <section className="w-full flex flex-col items-center">
    <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900 flex">
      {
        clients.map((client, index: number) => {
          return <div key={`client-${index}`} className="shadow-md bg-neutral-200 rounded-md px-6 py-2 mx-4">
            <h4>{client.name}</h4>
            <Link href={`/invoices/${client.documentId}`}>
              <p>ver cortes </p>
            </Link>
          </div>
        })      
      }
    </section>


  </section>


}
 export default ClientInvoices