'use client'
import useGetTickets, { ProductVariant, Ticket, TicketProduct } from "@/api/hooks/getTickets";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import useGetProducts, { Product } from "@/api/hooks/getProducts";
import useGetClients, { Client } from "@/api/hooks/getClients";
import { Formik, Field, Form, FieldArray, useFormikContext, useField } from "formik";
import useCreateTicket from "@/api/hooks/useCreateTicket";
import logo from "@/public/logo.png"
import { useReactToPrint } from "react-to-print";
import useEditTicket, { EditTicketReq } from "@/api/hooks/useEditTicket";


type EVariant = {
  name: string;
  type: string;
  id: number
}
type EProduct = {
  name: string;
  product: number;
  price: number;
  quantity: number;
  total: number
  product_variants: EVariant[]
  unit: string;
  subtotal?: number;
}
export type InitialValues = {
  date: number;
  client: string;
  ticket_number: number;
  products: EProduct[];
  shipping: number,
  subtotal: number,
  total: number
}
export type createTicketReq = {
  sale_date: Date
  client: number[]
  shipping_price: number
  subtotal?: number
  total: number
  ticket_number: number
  products: {
    product: number[]
    quantity: number
    product_total: number
    product_variants: number[]
    price: number
  }[]
}

const emptyVariant: EVariant = {
  name: "",
  type: "",
  id: 0
}
const emptyProduct: EProduct = {
  name: '',
  product: 0,
  price: 0,
  product_variants: [emptyVariant],
  quantity: 0,
  total: 0,
  unit: ''
}


const SubtotalField = (props: { className: string, placeholder: string, disabled?: boolean, id:string, name:string, type: string}) => {
  const {
    // @ts-expect-error missing type
    values: { products },
    touched,
    setFieldValue,
  } = useFormikContext();
  const [field, meta] = useField(props);

  React.useEffect(() => {
    // set the value of textC, based on textA and textB
    if (
      // @ts-expect-error missing type
      products && touched.products
    ) {
      const subtotal = products.reduce((acc: number, product: Product) => {
        return acc + Number(product.total)
      }, 0)
      setFieldValue('subtotal', subtotal);
    }
    // @ts-expect-error missing type
  }, [ products, touched.products,  setFieldValue]);

  return (
    <>
      <input {...props} {...field} />
      {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
    </>
  );
};
const TotalField = (props: { required:boolean, className: string, placeholder: string, disabled?: boolean, id:string, name:string, type: string}) => {
  const {
    // @ts-expect-error missing type
    values: { subtotal, shipping },
    touched,
    setFieldValue,
  } = useFormikContext();
  const [field, meta] = useField(props);

  React.useEffect(() => {
    // set the value of textC, based on textA and textB
    if (
      // @ts-expect-error missing type
      subtotal && shipping && touched.shipping
    ) {
      const total = Number(subtotal) + Number(shipping)
      setFieldValue('total', total);
    } else if (subtotal) {
      setFieldValue('total', Number(subtotal));

    }
    // @ts-expect-error missing type
  }, [ subtotal, touched.subtotal, shipping, touched.shipping,  setFieldValue, props.name]);

  return (
    <>
      <input {...props} {...field} />
      {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
    </>
  );
};
const VariantsField = (props: {products: Product[], index: number, className: string, name: string, placeholder: string, disabled?: boolean}) => {
  const {
    values,
    setFieldValue,
  } = useFormikContext<InitialValues>();
  const [field, meta] = useField(props);
  const [variants, setVariants] = useState<Product["product_variants"]>([])
  const [prod, setProd] = useState<Product>()

  useEffect(() => {
    console.log('values.products[index].product: ', values.products[props.index]?.product);
    console.log('products: ', props.products);
    
    const product = props.products?.filter((prod: Product)=> {
      return prod.id === values.products[props.index]?.product
    })[0]
    setProd(product)
  }, [values.products, props.index, props.products])
  useEffect(() => {
    if (prod) {
      
      console.log('prod: ', prod);
      setVariants(prod?.product_variants)
    }
  }, [prod])
  useEffect(() => {
    console.log('variants: ', variants);
    
  }, [variants])
    

    // console.log('variants: ', variants);
  // }
  return (
    <>
      <FieldArray {...props} {...field} name={`products.${props.index}.product_variants`}>
        {({ remove: variantRemove, push: variantpush }) => {
          
          // if (values.products[0] && props.products[0]) {

            return <div>
              <div className="flex justify-between">

                <label htmlFor="`products.${index}.product`">Variantes</label>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {

                    variantpush(emptyVariant)
                  }}
                >
                 Agregar +
                </button>
              </div>
              { values.products[props.index]?.product_variants.map((variant_value, variant_index) => {
                  return (<div className="flex px-2 border border-neutral-400 rounded-sm" key={variant_index}>
                    <Field as='select' className=" px-2 w-full" name={`products.${props.index}.product_variants.${variant_index}.id`}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        if (e.target.value) {
                          setFieldValue(`products.${props.index}.product_variants.${variant_index}.id`, e.target.value || '')
                          const variant = variants.filter((variant) => variant.id === Number(e.target.value))[0]
                          if (variant.name) setFieldValue(`products.${props.index}.product_variants.${variant_index}.name`, variant.name || '')
                          if (variant.type) setFieldValue(`products.${props.index}.product_variants.${variant_index}.type`, variant.type || '')
                          
                        } else {

                          setFieldValue(`products.${props.index}.product_variants.${variant_index}.id`, '')
                        }
                        
                      }}
                    >
                        <option value="">Variante</option>
                        {
                          variants.map((variant, index: number) => {
                            return <option key={`variant-${index}`} value={variant.id || ''}>{variant.name}</option>
                          })
                        }
                    </Field>
                    <Field className="border border-neutral-400 rounded-sm px-2 hidden" name={`products.${props.index}.product_variants.${variant_index}.name`} type="text" />
                    <Field className="border border-neutral-400 rounded-sm px-2 hidden" name={`products.${props.index}.product_variants.${variant_index}.type`} type="text" />
                    <button className="flex justify-end ml-2" onClick={() => variantRemove(variant_index)}>x</button>

                  </div>)
                })
              }
            </div>
        }}
      </FieldArray>
      {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
    </>
  );
}

const ClientTickets: React.FC = () => {
  const today: number = new Date().valueOf()



  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editTicket, setEditTicket] = useState<Ticket>()
  const [newTicket, setNewTicket] = useState<createTicketReq>()
  const [newEditTicket, setNewEditTicket] = useState<{ticket: EditTicketReq, documentId: string}>()
  const [printTicket, setPrintTicket] = useState<Ticket>()
  const [initialFormValues, setInitialFormValues] = useState<InitialValues>()

  const {
    tickets: ticketsData,
    error: ticketsError,
    isLoading: ticketsIsLoading,
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
  const {
    ticket: TicketData,
    error: TicketError,
    isLoading: TicketIsLoading
  } = useCreateTicket(newTicket)
  const {
    ticket: EditTicketData,
    error: EditTicketError,
    isLoading: EditTicketIsLoading
  } = useEditTicket(newEditTicket)
 
  useEffect(() => {
    if ((!ticketsError && !ticketsIsLoading && ticketsData.data)) {
      
      // console.log('ticketsData.data: ', ticketsData.data);
      // console.log('meta.pagination.total: ', ticketsData.meta.pagination.total);
      const data = ticketsData.data.sort(function(a: {sale_date: Date},b: {sale_date: Date}){
        const dateA: number = new Date(a.sale_date).valueOf();
        const dateB: number = new Date(b.sale_date).valueOf()
        return dateB - dateA;
      });
      setTickets(data)
    }
  }, [ticketsIsLoading, ticketsData.data, ticketsError])
  useEffect(() => {
    if (!productsError && !productsIsLoading) {
      
      // console.log('productsData.data: ', productsData.data);
      // console.log('meta.pagination.total: ', productsData.meta.pagination.total);
      // @ts-expect-error missing type

      setProducts(productsData.data)
    }
      // @ts-expect-error missing type
  }, [productsIsLoading, productsData.data, productsError])
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // console.log('clientsData.data: ', clientsData.data);
      // console.log('meta.pagination.total: ', clientsData.meta.pagination.total);
      // @ts-expect-error missing type

      setClients(clientsData.data)
    }
      // @ts-expect-error missing type
  }, [clientsIsLoading, clientsData.data, clientsError])
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
        client: editTicket?.client.id.toString() || "",
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

  useEffect(() => {
    if (printTicket) {
        Print()
    }
  },[printTicket])

  const sendPrint = (ticket:Ticket) => {
    const emptyTicket: TicketProduct = {
      id: 0
    }
    while (ticket?.products.length < 10) {
      ticket?.products.push(emptyTicket)
    }
    setPrintTicket(ticket)
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
  const sendCreate = () => {
    const ticket_number = ticketsData.data.sort((ticketa: Ticket, ticketB: Ticket) => {
      return Number(ticketB.ticket_number) - Number(ticketa.ticket_number)
    }).map((ticket: Ticket) => ticket.ticket_number)[0]
    setInitialFormValues({
      date: today,
      client: "",
      ticket_number: ticket_number + 1 || 0,
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
  

  const contentRef = useRef<HTMLDivElement>(null);

  const Print = useReactToPrint({ contentRef, documentTitle: `Nota-${printTicket?.ticket_number}-${printTicket?.client?.name?.toLocaleUpperCase()}-${new Date(printTicket?.sale_date || '')?.toLocaleDateString()}` });


  return<section className="w-full flex flex-col items-center">
    {
      ticketsIsLoading
       || productsIsLoading
       || clientsIsLoading
        ? <p>Loading</p>
        : <section className="w-9/12 py-12 px-8 bg-neutral-100 text-neutral-900">
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-neutral-400" onClick={() => sendCreate()}>Crear nota</button>
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
                tickets?.map((ticket: Ticket, index: number) => {
                  // console.log('ticket: ', ticket);
                  return <tr className="border-b border-neutral-300" key={`ticket-${index}`}>
                    <td className="py-2"><a href={`/tickets/${ticket.documentId}`}>{ticket.ticket_number}</a></td>
                    <td className="py-2">{ticket.client?.name}</td>
                    <td className="py-2">{new Date(ticket.sale_date).toLocaleDateString()}</td>
                    <td className="py-2">$ {ticket.total}</td>
                    <td className="py-2"><button onClick={() => setEditTicket(ticket)}><span>edit</span></button> | <button onClick={() => sendPrint(ticket)}><span>print</span></button></td>
                  </tr>
                })
              }
            </tbody>
          </table>
          {/* <button >Open dialog</button> */}
          {
            initialFormValues && <Formik
              initialValues={initialFormValues || null}
              onSubmit={async (values: InitialValues) => values ? handleSubmit(values): null}
            >
              {
                ({values, setFieldValue}) => (
                  <Dialog open={isOpen} onClose={() => sendClose()} className="relative z-50">
                    <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                      <DialogPanel className="max-w-lg space-y-4 border bg-neutral-100 p-12 shadow-2xl text-neutral-900">
                        
                        <div className="flex justify-between gap-2">
                          <img className="w-52" src={logo.src} alt="" />

                          <DialogTitle className="font-bold flex flex-col mt-6"><span>Folio: {values.ticket_number}</span><span>Fecha: {new Date(today).toLocaleDateString() }</span></DialogTitle>
                        </div>
                        {/* form for tickets */}
                              <Form>
                                <Field className="border border-neutral-400 rounded-sm px-2 hidden" id="ticket_number" name="ticket_number" type="number" disabled value={values.ticket_number} />
                                <Field className="border border-neutral-400 rounded-sm px-2 w-full hidden" id="date" name="date" type="datetime-locale" value={values.date} />
                                <div className="flex align-baseline">

                                  <label htmlFor="client" className="p-2">Cliente: </label>
                                  <Field required as="select" className="border-b border-neutral-400 rounded-sm p-2 w-full" id="client" name="client" value={values.client}>
                                    <option value="">Cliente</option>
                                    {
                                      clients.map((client, index: number) => {
                                        return <option key={`client-${index}`} value={client.id}>{client.name}</option>
                                      })
                                    }
                                  </Field>
                                </div>
                              
                                <FieldArray name="products">
                                  {({ remove, push }) => (
                                    <div>
                                      <div className="flex justify-between p-2">
                                        <h4>Productos</h4>
                                        <button
                                          type="button"
                                          className="secondary"
                                          onClick={() => push(emptyProduct)}
                                        >
                                          Agregar +
                                        </button>
                                        {/* <div className="w-full border border-neutral-300">

                                            </div> */}
                                      </div>
                                      { values.products.map((product_value, index) => {
                                          return (
                                              <Disclosure key={index}>
                                                {({ open }) => (
                                                  <div key={`product=${index}`}>
                                                    <div className="flex justify-between items-center">

                                                      <DisclosureButton className="py-2 px-2 w-full flex bg-neutral-200 justify-between">
                                                        <p className="mx-1 self-start">{ open ? 'A' : 'V' }</p>
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
                                                        <p className="mx-1">{values.products[index].total ? `$ ${values.products[index].total}` : ''}</p>

                                                      </DisclosureButton>
                                                      <button className="flex justify-end px-3 py-2 bg-red-800 text-white" onClick={() => remove(index)}>X</button>
                                                    </div>
                                                    <DisclosurePanel className="text-gray-500">
                                                      <div className="p-2 pt-0 border border-neutral-300 w-full" key={index}>
                                                        <div className="flex flex-col">
                                                          <div className="flex  w-full">
                                                            <div className="flex flex-col w-full">

                                                              <label htmlFor="`products.${index}.product`">Producto</label>
                                                              <Field as="select" className="border border-neutral-400 rounded-sm px-2 w-full" value={values.products[index].product} onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                                // onProductChange(e.target.value)
                                                                  const product = products.filter((product: Product) => {
                                                                    // console.log(product);
                                                                    
                                                                    return Number(e.target.value) === product.id
                                                                  })[0] || null
                                                                  console.log(product);
                                                                  setFieldValue(`products.${index}.unit`, product.measurement_unit)
                                                                  setFieldValue(`products.${index}.name`, product.name)
                                                                  setFieldValue(`products.${index}.product`, product.id)
                                                                  setFieldValue(`products.${index}.price`, product.price)
                                                                }} name={`products.${index}.product`}
                                                              >
                                                                <option value="">Producto</option>
                                                                {
                                                                  products.map((product: Product, index: number) => {
                                                                    return <option key={`product-${index}`} value={product.id}>{product.name}</option>
                                                                  })
                                                                }
                                                              </Field>
                                                            </div>
                                                          </div>
                                                          <div className="w-fullflex flex-col">

                                                            <VariantsField products={products} index={index} className="border border-neutral-400 rounded-sm px-2" name={`products.${index}.product_variants`} placeholder="variantes"/>
                                                          </div>
                                                          <div className="w-full flex">
                                                            <div className="flex flex-col w-full px-1">
                                                              <label htmlFor={`products.${index}.quantity`}>Cantidad {values.products[index].unit ? `(${values.products[index].unit})` : ''}</label>
                                                              <Field className="border border-neutral-400 rounded-sm px-2 w-full" name={`products.${index}.quantity`} type="number" placeholder="cantidad"
                                                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                                  const quantity = Number(e.target.value)
                                                                  const price = Number(values.products[index].price)
                                                                  setFieldValue(`products.${index}.quantity`, quantity)
                                                                  setFieldValue(`products.${index}.total`, price * quantity)
                                                                }}
                                                              />
                                                            </div>
                                                            <div className="flex flex-col w-full px-1">
                                                              <label htmlFor="">Precio</label>
                                                              <Field className="border border-neutral-400 rounded-sm bg-neutral-300 px-2 w-full" name={`products.${index}.price`} disabled type="number" placeholder="precio" />
                                                            </div>
                                                            <div className="flex flex-col w-full px-1">
                                                              <label htmlFor="">Monto</label>
                                                              <Field className="border border-neutral-400 rounded-sm bg-neutral-300 px-2 w-full" name={`products.${index}.total`} disabled type="number" placeholder="total" />
                                                            </div>
                                                          </div>
                                                          

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
                                  )}
                                </FieldArray>
                                <div className="flex justify-end">

                                  <div className="my-4 w-1/2">
                                    <div className="flex justify-between gap-x-4 my-2">
                                      <label htmlFor="subtotal">Sub total</label>
                                      <SubtotalField className="border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300" disabled id="subtotal" name="subtotal" type="number" placeholder="sub total" />
                                    </div>
                                    <div className="flex justify-between gap-x-4 my-2">
                                      <label htmlFor="shipping">Envío</label>
                                      <Field className="border border-neutral-400 rounded-sm px-2 w-1/2 " id="shipping" name="shipping" type="number" placeholder="Envio" />
                                    </div>
                                    <div className="flex justify-between gap-x-4 my-2">
                                      <label htmlFor="total">Total</label>
                                      <TotalField required className="border border-neutral-400 rounded-sm px-2 w-1/2 bg-neutral-300" disabled id="total" name="total" type="number" placeholder="total" />
                                    </div>
                                  </div>
                                </div>

                                
                                <div className="flex gap-4 justify-end">
                                  <button className="bg-red-800 px-4 py-2 rounded-sm text-white" onClick={() => sendClose()}>Cancelar</button>
                                  <button className="bg-green-700 px-4 py-2 text-white" type="submit">{ editTicket ? 'Editar' : 'Crear'}</button>
                                  {/* <button onClick={() => setIsOpen(false)}>Deactivate</button> */}
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
 export default ClientTickets