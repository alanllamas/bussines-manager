'use client'
import React, { ChangeEvent, useEffect, useState } from "react"
import { Dialog, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Field, FieldArray, Form, Formik, useField, useFormikContext } from "formik"
import logo from "@/public/logo.png"
import { Client } from "@/api/hooks/clients/getClient"
import useGetProducts, { Product } from "@/api/hooks/getProducts"
import useGetClients from "@/api/hooks/clients/getClients"

export type EVariant = {
  name: string;
  type: string;
  id: number
}
export type EProduct = {
  name: string;
  product: number;
  price: number;
  quantity: number;
  total: number
  product_variants: EVariant[]
  unit: string;
  subtotal?: number;
}
export type TicketInitialValues = {
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

export const emptyVariant: EVariant = {
  name: "",
  type: "",
  id: 0
}
export const emptyProduct: EProduct = {
  name: '',
  product: 0,
  price: 0,
  product_variants: [emptyVariant],
  quantity: 0,
  total: 0,
  unit: ''
}


const TicketsForm: React.FC<any> = ({sendCreate, initialFormValues, handleSubmit, isOpen, sendClose, editTicket, today}) => {
  

          
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[] | undefined>([])



                  

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
      if (!productsError && !productsIsLoading) {
        
        // console.log('productsData.data: ', productsData.data);
        // console.log('meta.pagination.total: ', productsData.meta.pagination.total);
  
        setProducts(productsData?.data)
      }
  }, [productsIsLoading, productsData?.data, productsError])
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      
      // console.log('clientsData.data: ', clientsData.data);
      // console.log('meta.pagination.total: ', clientsData.meta.pagination.total);
      // @ts-expect-error missing type

      setClients(clientsData.data)
    }
      // @ts-expect-error missing type
  }, [clientsIsLoading, clientsData.data, clientsError])
          


          
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
  const VariantsField = (props: {products?: Product[], index: number, className: string, name: string, placeholder: string, disabled?: boolean}) => {
    const {
      values,
      setFieldValue,
    } = useFormikContext<TicketInitialValues>();
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
                { values.products[props.index]?.product_variants.map((_: any, variant_index: any) => {
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
  

  return <>
    <div className="flex justify-end">
      <button className="px-6 py-2 bg-neutral-400" onClick={() => sendCreate()}>Crear nota</button>
    </div>
    {
      initialFormValues && <Formik
        initialValues={initialFormValues || null}
        onSubmit={async (values: TicketInitialValues) => values ? handleSubmit(values): null}
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
                                return <Disclosure key={index}>
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
                                                      const product = products?.filter((product: Product) => {
                                                        // console.log(product);
                                                        
                                                        return Number(e.target.value) === product.id
                                                      })[0] || null
                                                      console.log(product);
                                                      setFieldValue(`products.${index}.unit`, product?.measurement_unit)
                                                      setFieldValue(`products.${index}.name`, product?.name)
                                                      setFieldValue(`products.${index}.product`, product?.id)
                                                      setFieldValue(`products.${index}.price`, product?.price)
                                                    }} name={`products.${index}.product`}
                                                  >
                                                    <option value="">Producto</option>
                                                    {
                                                      products?.map((product: Product, index: number) => {
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
  </>
  

} 

export default TicketsForm