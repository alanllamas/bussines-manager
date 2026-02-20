'use client'
import React, { useEffect, useState } from "react"
import { ProductVariant, Ticket, TicketProduct} from "@/api/hooks/tickets/getTickets"
import ReactPaginate from "react-paginate"
import TicketFormat from "./ticketPrintFormat"
import TicketsForm, { createTicketReq, emptyProduct, EProduct, InitialValues } from "../forms/ticketsForm"
import useEditTicket, { EditTicketReq } from "@/api/hooks/tickets/useEditTicket"
import useCreateTicket from "@/api/hooks/tickets/useCreateTicket"
import useGetTicketNumber from "@/api/hooks/tickets/getTicketNumber"
import { isNumber } from "util"
import TicketPrintFormat from "./ticketPrintFormat"

const TicketList: React.FC<any> = ({ticketData, itemsPerPage, clientId}) => {
  // ticket form functions


  const [initialFormValues, setInitialFormValues] = useState<InitialValues>()
  const [isOpen, setIsOpen] = useState(false)
  const [editTicket, setEditTicket] = useState<Ticket>()
  const [newEditTicket, setNewEditTicket] = useState<{ticket: EditTicketReq, documentId: string}>()
  const [newTicket, setNewTicket] = useState<createTicketReq>()
  
  const {
    ticket: EditTicketData,
    error: EditTicketError,
    isLoading: EditTicketIsLoading
  } = useEditTicket(newEditTicket)
  const {
    ticket: TicketData,
    error: TicketError,
    isLoading: TicketIsLoading
  } = useCreateTicket(newTicket)

  const {
    ticket_number,
    error: ticketNumberError,
    isLoading: ticketNumberIsLoading
  } = useGetTicketNumber()

  useEffect(() => {
    // make refresh

    if (!ticketNumberError && !ticketNumberIsLoading && ticket_number) {
      console.log('ticket_number: ', ticket_number);
      // setTimeout(() => window.location.reload(), 500);
      

      // setTicket(TicketData.data)
    }
  }, [ticketNumberIsLoading, ticket_number, ticketNumberError])
  useEffect(() => {
    // make refresh

    if (!TicketError && !TicketIsLoading && TicketData) {
      // console.log('TicketData: ', TicketData);
      setTimeout(() => window.location.reload(), 500);
      

      // setTicket(TicketData.data)
    }
  }, [TicketIsLoading, TicketData, TicketError])
  useEffect(() => {
    // make refresh

    if (EditTicketData && !EditTicketError && !EditTicketIsLoading) {
      // console.log('EditTicketData: ', EditTicketData);
      setTimeout(() => window.location.reload(), 500);
      

      // setTicket(TicketData.data)
    }
  }, [EditTicketData, EditTicketError, EditTicketIsLoading])
  useEffect(() => {
    // console.log('editTicket: ', editTicket);
    if (editTicket) {
      
      setInitialFormValues({
        client: editTicket?.client?.id?.toString() || clientId?.toString() || "",
        date: new Date(editTicket?.sale_date || '').valueOf(),
        products: editTicket?.products?.map((product: TicketProduct): EProduct => {
          return {
            name: product?.product?.name || '',
            product: product?.product?.id || 0,
            price: product.price || 0,
            product_variants: product?.product_variants?.map((variant: ProductVariant) => ({id: variant.id, name: variant.name, type: variant.type})) || [],
            quantity: product.quantity || 0,
            total: product.product_total || 0, 
            unit: product?.product?.measurement_unit || '',
          } 
        }) || [emptyProduct],
        subtotal: editTicket?.sub_total || 0,
        shipping: editTicket?.shipping_price || 0,
        ticket_number: editTicket?.ticket_number || 0,
        total: editTicket?.total || 0
      })
    } 
    
  }, [editTicket])
  useEffect(() => {
    // console.log('initialFormValues: ', initialFormValues);
    setIsOpen(true)
    
  }, [initialFormValues])
  const today: number = new Date().valueOf()

  const sendCreate = () => {
    
    setInitialFormValues({
      date: today,
      client: clientId ? clientId : "",
      ticket_number:  ticket_number !== undefined && isNumber(ticket_number) ? ticket_number + 1 : 0,
      products: [emptyProduct],
      shipping: 0,
      subtotal: 0,
      total: 0
    })
  }
  const sendClose = () => {
    setEditTicket(undefined)
    setInitialFormValues(undefined)
    setIsOpen(false)
  }
  
  const handleSubmit = async (values: InitialValues) => {
    setIsOpen(false)
    console.log(values);
    const { date, client, shipping, subtotal, products, ticket_number, total } = values
    const data = {
      sale_date: new Date(date),
      client: [Number(client)],
      shipping_price: shipping,
      sub_total: subtotal,
      total,
      ticket_number,
      products: products.map((product: EProduct) => {
        return {
          product: [product.product],
          quantity: product.quantity,
          product_total: product.total,
          product_variants: product.product_variants.map(variant => { return Number(variant.id) }),
          price: product.price
        }
      })
    } 
    if (editTicket) {
      setNewEditTicket({ ticket: data, documentId: editTicket.documentId})
    } else {
      setNewTicket(data)
    }

  }



  // ticket form functions

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [printTicket, setPrintTicket] = useState<Ticket | null>()

  const sendPrint = (ticket:Ticket) => {
    console.log(ticket);
    
    const emptyTicket: TicketProduct = {
      id: 0
    }
    while (ticket?.products.length < 10) {
      ticket?.products.push(emptyTicket)
    }
    setPrintTicket(ticket)
    unsetPrintTicket()
  }
  const unsetPrintTicket = () => {
    setTimeout(() => {
      setPrintTicket(null)
    }, 1000);
  }
  useEffect(() => {
    // console.log(interval);
    if (ticketData) {
      console.log(ticketData);
      setTickets(ticketData)
    }
  }, [ticketData])
  
  function Items({ currentItems }: {currentItems: Ticket[]}) {
    return (
      <>
        {currentItems &&
          currentItems?.map((ticket: Ticket, index: number) => {
          // console.log('ticket: ', ticket);
          return <tr className="border-b border-neutral-300" key={`ticket-${index}`}>
            <td className="py-2"><a href={`/tickets/${ticket.documentId}`}>{ticket.ticket_number}</a></td>
            <td className="py-2">{ticket.client?.name}</td>
            <td className="py-2">{new Date(ticket.sale_date).toLocaleDateString()}</td>
            <td className="py-2">$ {ticket.total}</td>
            <td className="py-2"> <button onClick={() => setEditTicket(ticket)}><span>edit</span></button> | <button onClick={() => sendPrint(ticket)}><span>print</span></button></td>
            
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
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = tickets?.length > 0 ? tickets?.slice(itemOffset, endOffset) : []
    const pageCount = Math.ceil(tickets?.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageChange = (event: { selected: number }) => {
      const newOffset = (event.selected * itemsPerPage) % tickets.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
      );
      setItemOffset(newOffset);
    };
      return (
      <section className="w-full flex flex-col items-center">
        <table className="w-full p-4 text-center mt-8">
          <thead>
            <tr className="border-b border-neutral-500">
              <th>Folio</th>
              <th>cliente</th>
              <th>fecha de venta</th>
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


  // const ticket_number = tickets?.sort((ticketa: Ticket, ticketB: Ticket) => {
  //   return Number(ticketB.ticket_number) - Number(ticketa.ticket_number)
  // }).map((ticket: Ticket) => ticket.ticket_number)[0]

  

  return <>
    <TicketsForm sendCreate={sendCreate} initialFormValues={initialFormValues} handleSubmit={handleSubmit} isOpen={isOpen} sendClose={sendClose} editTicket={editTicket}/>
    <PaginatedItems itemsPerPage={10}/>
    { printTicket && <TicketPrintFormat ticket={printTicket} /> }
    
  </> 
} 

export default TicketList