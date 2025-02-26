'use client'
import useGetTickets from "@/api/hooks/getTickets";
import React, { FormEvent, useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import useGetProducts from "@/api/hooks/getProducts";
import useGetClients from "@/api/hooks/getClients";

const ClientTickets: React.FC<any> = () => {

  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [tickets, setTickets] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [ticket, setTicket] = useState(null)
  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading
  } = useGetTickets()
  const {
    products: productsData,
    error: productsError,
    isLoading: productsIsLoading
  } = useGetProducts()
  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()

  useEffect(() => {
    if (!ticketsError && !ticketsIsLoading) {
      
      console.log('ticketsData.data: ', ticketsData.data);
      console.log('meta.pagination.total: ', ticketsData.meta.pagination.total);
      const data = ticketsData.data.sort(function(a: any,b: any){
        const dateA: any = new Date(a.sale_date);
        const dateB: any = new Date(b.sale_date);
        return dateB - dateA;
      });
      setTickets(data)
    }
  }, [ticketsIsLoading])
  useEffect(() => {
    if (!productsError && !productsIsLoading) {
      
      console.log('productsData.data: ', productsData.data);
      console.log('meta.pagination.total: ', productsData.meta.pagination.total);

      setProducts(productsData.data)
    }
  }, [productsIsLoading])
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // console.log('clientsData.data: ', clientsData.data);
      // console.log('meta.pagination.total: ', clientsData.meta.pagination.total);

      setClients(clientsData.data)
    }
  }, [clientsIsLoading])

  useEffect(() => {
    console.log('ticket: ', ticket);
    
  }, [ticket])
  const handleSubmit = (event: FormEvent) => {
    console.log(event);
    
  }

  
  return<>
    {
      ticketsIsLoading
        ? <p>Loading</p>
        : <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
          <div className="flex justify-between">
            <h1>Notas</h1>
            <button className="px-6 py-2 bg-neutral-400" onClick={() => setIsOpen(true)}>Crear nota</button>
          </div>
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
              {
                tickets?.map((ticket: any, index: number) => {
                  // console.log('ticket: ', ticket);
                  return <tr className="border-b border-neutral-300" key={`ticket-${index}`}>
                    <td className="py-2"><a href={`/tickets/${ticket.id}`}>{ticket.ticket_number}</a></td>
                    <td className="py-2">{ticket.client?.name}</td>
                    <td className="py-2">{new Date(ticket.sale_date).toLocaleDateString()}</td>
                    <td className="py-2">$ {ticket.total}</td>
                    <td className="py-2"><button onClick={() => setTicket(ticket.ticket_number)}><span>pencil</span></button> | print</td>
                  </tr>
                })
              }
            </tbody>
          </table>
          {/* <button >Open dialog</button> */}
          <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
              <DialogPanel className="max-w-lg space-y-4 border bg-neutral-100 p-12 shadow-2xl text-neutral-900">
                <DialogTitle className="font-bold">Nota {ticketsData.meta.pagination.total + 1}</DialogTitle>
                {/* form for tickets */}
                <form onSubmit={(e: FormEvent) => handleSubmit(e)}>
                  <input className="border border-neutral-400 rounded-sm px-2 hidden" name="ticket_number" type="number" value={ticketsData.meta.pagination.total + 1}  disabled/>
                  <div>
                    <div className="py-1 w-full flex ">
                      {/* <label className="px-3" htmlFor="product">producto</label> */}
                      <select className="border border-neutral-400 rounded-sm px-2 w-full" name="product" >
                        <option value="">Cliente</option>
                        {
                          clients.map((client: any) => {
                            return <option value={client.id}>{client.name}</option>
                          })
                        }
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="py-1 w-full flex ">
                      {/* <label className="px-3" htmlFor="product">producto</label> */}
                      <select className="border border-neutral-400 rounded-sm px-2 w-full" name="product" >
                        <option value="">Producto</option>
                        {
                          products.map((product: any) => {
                            return <option value={product.id}>{product.name}</option>
                          })
                        }
                      </select>
                    </div>
                  <div className="py-1 w-full flex ">
                    {/* <label className="px-3" htmlFor="product-quantity">Variante</label> */}
                    <select className="border border-neutral-400 rounded-sm px-2 w-full" name="product" >
                      <option value="">Variante</option>
                      {
                        products.map((product: any) => {
                          return <option value={product.id}>{product.name}</option>
                        })
                      }
                    </select>
                  </div>
                    <div className="py-1 w-full flex ">
                      {/* <label className="px-3" htmlFor="product-quantity">Cantidad</label> */}
                      <input className="border border-neutral-400 rounded-sm px-2" type="number" name="product-quantity" placeholder="Cantidad"/>
                    </div>

                  </div>
                </form>
                <div className="flex gap-4">
                  <button onClick={() => setIsOpen(false)}>Cancel</button>
                  <button onClick={() => setIsOpen(false)}>Deactivate</button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </section>
    }
  </>
}
 export default ClientTickets