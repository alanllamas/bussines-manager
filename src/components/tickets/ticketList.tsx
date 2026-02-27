'use client'
import React, { useEffect, useState } from "react"
import { usePaginatedData } from "@/hooks/usePaginatedData"
import { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/tickets/getTickets"
import ReactPaginate from "react-paginate"
import TicketsForm, { createTicketReq, emptyProduct, EProduct, TicketInitialValues } from "../forms/ticketsForm"
import useEditTicket, { EditTicketReq } from "@/api/hooks/tickets/useEditTicket"
import useCreateTicket from "@/api/hooks/tickets/useCreateTicket"
import useGetTicketNumber from "@/api/hooks/tickets/getTicketNumber"
import { isNumber } from "util"
import TicketPrintFormat from "./ticketPrintFormat"
import { useSWRConfig } from "swr"
import { toast } from "sonner"

interface TicketListProps { ticketData?: Ticket[]; itemsPerPage?: number; clientId?: string | number; hideClient?: boolean }
const TicketList: React.FC<TicketListProps> = ({ticketData, itemsPerPage = 10, clientId, hideClient}) => {
  const { mutate } = useSWRConfig()
  const invalidateTickets = () => mutate(
    (key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && (key[0].includes('/api/tickets') || key[0].includes('/api/clients'))
  )

  // ticket form functions
  const [initialFormValues, setInitialFormValues] = useState<TicketInitialValues>()
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
      // setTimeout(() => window.location.reload(), 500);
      

      // setTicket(TicketData.data)
    }
  }, [ticketNumberIsLoading, ticket_number, ticketNumberError])
  useEffect(() => {
    // make refresh

    if (TicketError && !TicketIsLoading) {
      toast.error('Error al crear la nota')
    } else if (!TicketError && !TicketIsLoading && TicketData) {
      toast.success('Nota creada')
      invalidateTickets()
      setNewTicket(undefined)
      sendClose()
      

      // setTicket(TicketData.data)
    }
  }, [TicketIsLoading, TicketData, TicketError])
  useEffect(() => {
    // make refresh

    if (EditTicketError && !EditTicketIsLoading) {
      toast.error('Error al editar la nota')
    } else if (EditTicketData && !EditTicketError && !EditTicketIsLoading) {
      toast.success('Nota actualizada')
      invalidateTickets()
      setNewEditTicket(undefined)
      sendClose()
      

      // setTicket(TicketData.data)
    }
  }, [EditTicketData, EditTicketError, EditTicketIsLoading])
  useEffect(() => {
    // console.log('editTicket: ', editTicket);
    if (editTicket) {
      setNewTicket(undefined)
      setNewEditTicket(undefined)
      setInitialFormValues({
        client: editTicket?.client?.id?.toString() || clientId?.toString() || "",
        date: new Date(editTicket?.sale_date || '').valueOf(),
        products: editTicket?.products?.map((product: TicketProduct): EProduct => {
          return {
            name: product?.product?.name || '',
            product: product?.product?.id || 0,
            price: product.price || 0,
            product_variants: product?.product_variants?.map((variant: ProductVariant) => variant.documentId) || [],
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
    setNewTicket(undefined)
    setNewEditTicket(undefined)
    setInitialFormValues({
      date: today,
      client: clientId ? String(clientId) : "",
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
  
  const handleSubmit = async (values: TicketInitialValues) => {
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
          product_variants: product.product_variants,
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
      setTickets([...ticketData].sort((a, b) => b.id - a.id))
    }
  }, [ticketData])
  
  function Items({ currentItems }: {currentItems: Ticket[]}) {
    return (
      <>
        {currentItems &&
          currentItems?.map((ticket: Ticket, index: number) => {
          // console.log('ticket: ', ticket);
          return <tr key={`ticket-${index}`}>
            <td><a className="text-primary-600 hover:underline font-medium" href={`/tickets/${ticket.documentId}`}>{String(ticket.ticket_number ?? '').padStart(5, '0')}</a></td>
            {!hideClient && <td>{ticket.client?.name}</td>}
            <td>{new Date(ticket.sale_date).toLocaleDateString()}</td>
            <td className="font-medium">$ {ticket.total}</td>
            <td>{ticket.invoice ? <span className="material-symbols-outlined text-[18px] text-primary-500">check_circle</span> : <span className="material-symbols-outlined text-[18px] text-surface-300">radio_button_unchecked</span>}</td>
            <td><div className="flex gap-1"><button className="btn-icon" onClick={() => setEditTicket(ticket)}><span className="material-symbols-outlined text-[16px]">edit</span></button><button className="btn-icon" onClick={() => sendPrint(ticket)}><span className="material-symbols-outlined text-[16px]">print</span></button></div></td>
            
          </tr>
        })}
      </>
    );
  }

  function PaginatedItems({ itemsPerPage }: { itemsPerPage: number }) {
    const { currentItems, pageCount, handlePageChange } = usePaginatedData(tickets, itemsPerPage);
      return (
      <section className="w-full flex flex-col items-center">
        <table className="data-table mt-6">
          <thead>
            <tr>
              <th>Folio</th>
              {!hideClient && <th>Cliente</th>}
              <th>Fecha de venta</th>
              <th>Monto</th>
              <th>Corte</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0
              ? <tr><td colSpan={hideClient ? 5 : 6} className="py-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-surface-300 block">inbox</span>
                  <p className="text-sm text-surface-400 mt-2">Sin notas</p>
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

  const apiError = TicketError || EditTicketError

  return <>
    <TicketsForm sendCreate={sendCreate} initialFormValues={initialFormValues} handleSubmit={handleSubmit} isOpen={isOpen} sendClose={sendClose} editTicket={editTicket} apiError={apiError}/>
    <PaginatedItems itemsPerPage={10}/>
    { printTicket && <TicketPrintFormat ticket={printTicket} /> }
    
  </> 
} 

export default TicketList