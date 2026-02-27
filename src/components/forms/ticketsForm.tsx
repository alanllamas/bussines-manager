'use client'
import React, { ChangeEvent, useEffect, useState } from "react"
import { DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { FormDialog } from '@/components/ui'
import { Field, FieldArray, Form, Formik, useField, useFormikContext } from "formik"
import * as Yup from "yup"
import logo from "@/public/logo.png"
import { Client } from "@/api/hooks/clients/getClient"
import useGetProducts, { Product } from "@/api/hooks/getProducts"
import useGetClients from "@/api/hooks/clients/getClients"

const ticketSchema = Yup.object({
  client: Yup.string().required('Selecciona un cliente'),
  products: Yup.array().of(
    Yup.object({
      product: Yup.number().min(1, 'Selecciona un producto').required('Selecciona un producto'),
      quantity: Yup.number().min(1, 'La cantidad debe ser mayor a 0').required('Cantidad requerida'),
    })
  ).min(1, 'Agrega al menos un producto'),
  shipping: Yup.number().min(0, 'El envío no puede ser negativo').required('Ingresa el envío (0 si no aplica)'),
})

export type EProduct = {
  name: string;
  product: number;
  price: number;
  quantity: number;
  total: number
  product_variants: string[]
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
    product_variants: string[]
    price: number
  }[]
}

export const emptyProduct: EProduct = {
  name: '',
  product: 0,
  price: 0,
  product_variants: [],
  quantity: 0,
  total: 0,
  unit: ''
}


const TicketsForm: React.FC<any> = ({sendCreate, initialFormValues, handleSubmit, isOpen, sendClose, editTicket, today, apiError}) => {
  

          
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
        
  
        setProducts(productsData?.data)
      }
  }, [productsIsLoading, productsData?.data, productsError])
  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      

      setClients(clientsData?.data ?? [])
    }
  }, [clientsIsLoading, clientsData?.data, clientsError])
          


          
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
  const VariantsField = ({ products: allProducts, index }: { products?: Product[], index: number }) => {
    const { values } = useFormikContext<TicketInitialValues>();

    const currentProduct = allProducts?.find(p => p.id === values.products[index]?.product)
    const allVariants = currentProduct?.product_variants ?? []
    const selectedDocIds: string[] = values.products[index]?.product_variants ?? []
    const selectedDocIdSet = new Set(selectedDocIds)
    const availableVariants = allVariants.filter(v => v.documentId && !selectedDocIdSet.has(v.documentId))

    return (
      <FieldArray name={`products.${index}.product_variants`}>
        {({ remove: variantRemove, push: variantPush }) => (
          <div className="mt-2">
            <label className="field-label mb-1">Variantes</label>

            {/* Selected chips */}
            {selectedDocIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedDocIds.map((docId, vi) => {
                  const variant = allVariants.find(v => v.documentId === docId)
                  return (
                    <span key={vi} className="flex items-center gap-1 bg-primary-50 border border-primary-200 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                      {variant?.name ?? docId}
                      <button type="button" onClick={() => variantRemove(vi)} className="hover:text-red-600 leading-none">×</button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Add select */}
            {allVariants.length > 0 ? (
              availableVariants.length > 0 ? (
                <select
                  className="field-select"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    variantPush(e.target.value)
                  }}
                >
                  <option value="">+ Agregar variante</option>
                  {availableVariants.map((v, i) => (
                    <option key={i} value={v.documentId}>{v.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-surface-400">Todas las variantes agregadas</p>
              )
            ) : (
              currentProduct && <p className="text-xs text-surface-400">Sin variantes para este producto</p>
            )}
          </div>
        )}
      </FieldArray>
    );
  }
  

  return <>
    <div className="flex justify-end">
      <button className="btn-primary" onClick={() => sendCreate()}>
        <span className="material-symbols-outlined text-[16px]">add</span>
        Crear nota
      </button>
    </div>
    {
      initialFormValues && <Formik
        initialValues={initialFormValues || null}
        validationSchema={ticketSchema}
        onSubmit={async (values: TicketInitialValues) => values ? handleSubmit(values): null}
      >
        {
          ({values, setFieldValue, errors, touched, isValid, dirty}) => (
            <FormDialog isOpen={isOpen} onClose={() => sendClose()} panelClassName="max-w-lg space-y-4 border bg-surface-50 p-12 shadow-2xl text-surface-900">
                  
                  <div className="flex justify-between gap-2">
                    <img className="w-52" src={logo.src} alt="" />

                    <DialogTitle className="font-bold flex flex-col mt-6"><span>Folio: {String(values.ticket_number ?? '').padStart(5, '0')}</span><span>Fecha: {new Date().toLocaleDateString()}</span></DialogTitle>
                  </div>
                  {/* form for tickets */}
                    <Form>
                      <Field className="border border-surface-300 rounded-sm px-2 hidden" id="ticket_number" name="ticket_number" type="number" disabled value={values.ticket_number} />
                      <Field className="border border-surface-300 rounded-sm px-2 w-full hidden" id="date" name="date" type="datetime-locale" value={values.date} />
                      <div className="flex flex-col">
                        <div className="flex align-baseline">
                        <label htmlFor="client" className="p-2">Cliente: <span className="text-red-500">*</span></label>
                        <Field required as="select" className="field-select" id="client" name="client" value={values.client}>
                          <option value="">Cliente</option>
                          {
                            clients.map((client, index: number) => {
                              return <option key={`client-${index}`} value={client.id}>{client.name}</option>
                            })
                          }
                        </Field>
                        </div>
                        {touched.client && errors.client && <p className="alert-field px-2">{errors.client as string}</p>}
                      </div>
                    
                      <FieldArray name="products">
                        {({ remove, push }) => (
                          <div>
                            <div className="flex justify-between items-center p-2">
                              <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Productos</h4>
                              <button type="button" className="btn-secondary" onClick={() => push(emptyProduct)}>
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                Agregar
                              </button>
                              {/* <div className="w-full border border-surface-200">

                                  </div> */}
                            </div>
                            { values.products.map((product_value, index) => {
                                return <Disclosure key={index}>
                                    {({ open }) => (
                                      <div key={`product=${index}`}>
                                        <div className="flex justify-between items-center">

                                          <DisclosureButton className="py-2 px-2 w-full flex bg-surface-100 justify-between items-center">
                                            <span className="material-symbols-outlined text-[16px] text-surface-400">{ open ? 'expand_less' : 'expand_more' }</span>
                                            <p className="mx-1 flex items-center gap-1">
                                              {values.products[index].name ? values.products[index].name : 'Nuevo producto'}
                                              {(touched as any).products?.[index] && (errors as any).products?.[index] && (
                                                <>
                                                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                                  <span className="text-xs text-red-500">Revisa este producto</span>
                                                </>
                                              )}
                                            </p>
                                            <p className="mx-1">{
                                              (() => {
                                                const docIds = values.products[index].product_variants
                                                if (!docIds.length) return ''
                                                const allVariants = products?.find(p => p.id === values.products[index].product)?.product_variants ?? []
                                                return docIds.map(id => allVariants.find(v => v.documentId === id)?.name ?? id).join(', ')
                                              })()
                                            }</p>
                                            <div className="flex">

                                              <p className="mx-1">{values.products[index].quantity ? values.products[index].quantity : ''}</p>
                                              <p className="mx-1">{values.products[index].unit ? values.products[index].unit : ''}</p>
                                            </div>
                                            <p className="mx-1">{values.products[index].total ? `$ ${values.products[index].total}` : ''}</p>

                                          </DisclosureButton>
                                          <button className="btn-danger" onClick={() => remove(index)}>
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                          </button>
                                        </div>
                                        <DisclosurePanel className="text-gray-500">
                                          <div className="p-2 pt-0 border border-surface-200 w-full" key={index}>
                                            <div className="flex flex-col">
                                              <div className="flex  w-full">
                                                <div className="flex flex-col w-full">
                                                  <label htmlFor="`products.${index}.product`">Producto <span className="text-red-500">*</span></label>
                                                  <Field as="select" className="field-select" value={values.products[index].product} onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                    // onProductChange(e.target.value)
                                                      const product = products?.filter((product: Product) => {

                                                        return Number(e.target.value) === product.id
                                                      })[0] || null
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
                                                  {(touched as any).products?.[index]?.product && (errors as any).products?.[index]?.product && <p className="alert-field">{(errors as any).products[index].product}</p>}
                                                </div>
                                              </div>
                                              <div className="w-fullflex flex-col">
                                                <VariantsField products={products} index={index} />
                                              </div>
                                              <div className="w-full flex">
                                                <div className="flex flex-col w-full px-1">
                                                  <label htmlFor={`products.${index}.quantity`}>Cantidad {values.products[index].unit ? `(${values.products[index].unit})` : ''} <span className="text-red-500">*</span></label>
                                                  <Field className="field-input" name={`products.${index}.quantity`} type="number" placeholder="cantidad"
                                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                      const quantity = Number(e.target.value)
                                                      const price = Number(values.products[index].price)
                                                      setFieldValue(`products.${index}.quantity`, quantity)
                                                      setFieldValue(`products.${index}.total`, price * quantity)
                                                    }}
                                                  />
                                                  {(touched as any).products?.[index]?.quantity && (errors as any).products?.[index]?.quantity && <p className="alert-field">{(errors as any).products[index].quantity}</p>}
                                                </div>
                                                <div className="flex flex-col w-full px-1">
                                                  <label htmlFor="">Precio</label>
                                                  <Field className="field-input bg-surface-100" name={`products.${index}.price`} disabled type="number" placeholder="precio" />
                                                </div>
                                                <div className="flex flex-col w-full px-1">
                                                  <label htmlFor="">Monto</label>
                                                  <Field className="field-input bg-surface-100" name={`products.${index}.total`} disabled type="number" placeholder="total" />
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
                      <div className="flex justify-end mt-4">
                        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 w-1/2">
                          <label htmlFor="subtotal" className="text-sm text-right">Subtotal</label>
                          <SubtotalField className="field-input bg-surface-100" disabled id="subtotal" name="subtotal" type="number" placeholder="subtotal" />
                          <label htmlFor="shipping" className="text-sm text-right">Envío <span className="text-red-500">*</span></label>
                          <Field className="field-input" id="shipping" name="shipping" type="number" placeholder="Envío" />
                          {touched.shipping && errors.shipping && <p className="alert-field col-span-2 text-right">{errors.shipping as string}</p>}
                          <label htmlFor="total" className="text-sm font-semibold text-right">Total</label>
                          <TotalField required className="field-input bg-surface-100 font-semibold" disabled id="total" name="total" type="number" placeholder="total" />
                        </div>
                      </div>

                      
                      {apiError && (
                        <div className="alert-error mt-4">
                          <span className="material-symbols-outlined text-[18px]">error</span>
                          Error al guardar. Por favor intenta de nuevo.
                        </div>
                      )}
                      {touched.client && errors.client && <p className="alert-field mt-2">{errors.client as string}</p>}
                      {(touched as any).products && typeof errors.products === 'string' && <p className="alert-field">{errors.products}</p>}
                      <div className="flex gap-4 justify-end mt-6">
                        <button className="btn-danger" onClick={() => sendClose()}>Cancelar</button>
                        <button className="btn-primary disabled:opacity-50" type="submit" disabled={!isValid || !dirty}>{ editTicket ? 'Editar' : 'Crear'}</button>
                        {/* <button onClick={() => setIsOpen(false)}>Deactivate</button> */}
                      </div>
                    </Form>
            </FormDialog>
          )
        }
      </Formik>
    }  
  </>
  

} 

export default TicketsForm