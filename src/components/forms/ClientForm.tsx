'use client'
import React, { useEffect, useState } from "react"
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Field, FieldArray, Form, Formik } from "formik"
import { Client, Contact, TaxingInfo } from "@/api/hooks/clients/getClient"
import useGetClients from "@/api/hooks/clients/getClients"
import useCreateClient from "@/api/hooks/clients/useCreateClient"

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
export type ClientInitialValues = {
  name: string;
  taxing_info: TaxingInfo
  contacts: Contact[]
}
export type createClientReq = {
  name: string;
  taxing_info: TaxingInfo
  contacts: Contact[]
}

export const emptyContact: Contact = {
  name: '',
  area: '',
  email: '',
  extension: '',
  job_title: '',
  phone: ''

}


const ClientsForm: React.FC<any> = () => {

  const [clients, setClients] = useState<string[]>([])
  const [newClient, setNewClient] = useState<createClientReq>()

  const {
    clients: clientsData,
    error: clientsError,
    isLoading: clientsIsLoading
  } = useGetClients()


  const {
    client: ClientData,
    error: ClientError,
    isLoading: ClientIsLoading
  } = useCreateClient(newClient)

  const initialFormValues: ClientInitialValues = {
    name: '',
    contacts: [],
    taxing_info: {
      billing_period: 0,
      taxing_company_name: '',
      taxing_payment_method: '',
      taxing_method_of_payment: '',
      taxing_CFDI_use: '',
      payment_period: 0,
      email: '',
      comments: '',
      shipping_invoice: false, 
      taxing_RFC: '',
      payment_method: '',
      invoice_period: 0,
      zip_code: 0,
      taxing_regime: '',
    }
  }
  const handleSubmit = (values: ClientInitialValues) => {
    // setIsOpen(false)
    const { name, taxing_info, contacts } = values
    
    // if (editTicket) {
    //   setNewEditTicket({ ticket: data, documentId: editTicket.documentId})
    // } else {
      setNewClient(values)
    // }

  }

  useEffect(() => {
    if (!clientsError && !clientsIsLoading) {
      setClients(clientsData?.data?.map(client => client.name) ?? [])
    }
  }, [clientsIsLoading, clientsError])
  useEffect(() => {
    if (!ClientError && !ClientIsLoading) {
      // setClient(ClientData.data.map(Client => Client.name))
    }
  }, [ClientIsLoading, ClientData, ClientError])

// regimenes fiscales
// 601 REGIMEN GENERAL DE LEY PERSONAS MORALES
// 602 RÉGIMEN SIMPLIFICADO DE LEY PERSONAS MORALES
// 603 PERSONAS MORALES CON FINES NO LUCRATIVOS
// 604 RÉGIMEN DE PEQUEÑOS CONTRIBUYENTES
// 605 RÉGIMEN DE SUELDOS Y SALARIOS E INGRESOS ASIMILADOS A SALARIOS
// 606 RÉGIMEN DE ARRENDAMIENTO
// 607 RÉGIMEN DE ENAJENACIÓN O ADQUISICIÓN DE BIENES
// 608 RÉGIMEN DE LOS DEMÁS INGRESOS
// 609 RÉGIMEN DE CONSOLIDACIÓN
// 610 RÉGIMEN RESIDENTES EN EL EXTRANJERO SIN ESTABLECIMIENTO PERMANENTE EN MÉXICO
// 611 RÉGIMEN DE INGRESOS POR DIVIDENDOS (SOCIOS Y ACCIONISTAS)
// 612 RÉGIMEN DE LAS PERSONAS FÍSICAS CON ACTIVIDADES EMPRESARIALES Y PROFESIONALES
// 613 RÉGIMEN INTERMEDIO DE LAS PERSONAS FÍSICAS CON ACTIVIDADES EMPRESARIALES
// 614 RÉGIMEN DE LOS INGRESOS POR INTERESES
// 615 RÉGIMEN DE LOS INGRESOS POR OBTENCIÓN DE PREMIOS
// 616 SIN OBLIGACIONES FISCALES
// 617 PEMEX
// 618 RÉGIMEN SIMPLIFICADO DE LEY PERSONAS FÍSICAS
// 619 INGRESOS POR LA OBTENCIÓN DE PRÉSTAMOS
// 620 SOCIEDADES COOPERATIVAS DE PRODUCCIÓN QUE OPTAN POR DIFERIR SUS INGRESOS.
// 621 RÉGIMEN DE INCORPORACIÓN FISCAL
// 622 RÉGIMEN DE ACTIVIDADES AGRÍCOLAS, GANADERAS, SILVÍCOLAS Y PESQUERAS PM
// 623 RÉGIMEN DE OPCIONAL PARA GRUPOS DE SOCIEDADES
// 624 RÉGIMEN DE LOS COORDINADOS
// 625 RÉGIMEN DE LAS ACTIVIDADES EMPRESARIALES CON INGRESOS A TRAVÉS DE PLATAFORMAS TECNOLÓGICAS.
// 626 RÉGIMEN SIMPLIFICADO DE CONFIANZA




// usos de CFDI por regimen
// c_UsoCFDI Descripción Persona Física Persona Moral Regímen Fiscal Receptor

// G01 Adquisición de mercancías. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625,626

// G02 Devoluciones, descuentos o bonificaciones. SÍ SÍ 601, 603, 606, 612, 616, 620, 621, 622, 623, 624, 625,626

// G03 Gastos en general. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I01 Construcciones. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I02 Mobiliario y equipo de oficina por inversiones. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I03 Equipo de transporte. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I04 Equipo de computo y accesorios. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I05 Dados, troqueles, moldes, matrices y herramental. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I06 Comunicaciones telefónicas. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I07 Comunicaciones satelitales. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// I08 Otra maquinaria y equipo. SÍ SÍ 601, 603, 606, 612, 620, 621, 622, 623, 624, 625, 626

// D01 Honorarios médicos, dentales y gastos hospitalarios. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D02 Gastos médicos por incapacidad o discapacidad. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D03 Gastos funerales. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D04 Donativos. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D05 Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación). SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D06 Aportaciones voluntarias al SAR. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D07 Primas por seguros de gastos médicos. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D08 Gastos de transportación escolar obligatoria. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D09 Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones. SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// D10 Pagos por servicios educativos (colegiaturas). SÍ NO 605, 606, 608, 611, 612, 614, 607, 615, 625

// S01 Sin efectos fiscales. SÍ SÍ 601, 603, 605, 606, 608, 610, 611, 612, 614, 616, 620, 621, 622, 623, 624, 607, 615, 625, 626

// CP01 Pagos SÍ SÍ 601, 603, 605, 606, 608, 610, 611, 612, 614, 616, 620, 621, 622, 623, 624, 607, 615, 625, 626

// CN01 Nómina SÍ NO 605


// Formas de Pago Principales (Catálogo SAT):
// 01 - Efectivo: Dinero en físico.
// 02 - Cheque nominativo: Cheque a nombre del beneficiario.
// 03 - Transferencia electrónica de fondos: CLABE interbancaria.
// 04 - Tarjeta de crédito: Pago con tarjeta.
// 28 - Tarjeta de débito: Pago con tarjeta.
// 05/06 - Monedero/Dinero electrónico: Tarjetas de prepago o vales.
// 08 - Vales de despensa: Vales.
// 17 - Compensación: Cuando se tienen saldos a favor.
// 99 - Por definir: Se usa cuando el pago no se realiza al momento de emitir la factura.



// Métodos de Pago (CFDI):
// PUE (Pago en una sola exhibición): Se utiliza si el pago se recibe a más tardar el último día del mes en que se emite la factura.
// PPD (Pago en parcialidades o diferido): Se utiliza cuando la factura se pagará después o en varias partes.


  return <>
    {
      initialFormValues && <Formik
        initialValues={initialFormValues || null}
        onSubmit={async (values: ClientInitialValues) => values ? handleSubmit(values): null}
      >
        {
          ({values, setFieldValue}) => (
            <Form className="text-neutral-600 w-2/4">
              {/* <Field className="border border-neutral-400 rounded-sm px-2 w-full hidden" id="date" name="date" type="datetime-locale" value={values.date} /> */}
              <div className="flex w-full justify-between">
                <label htmlFor="client" className="px-2">Nombre: </label>
                <Field className="border border-neutral-400 rounded-sm px-2" id="name" name="name" type="text" value={values.name} />
              </div>
              <div className="flex w-full flex-col">
                <FieldArray name="contacts">
                  {({ remove, push }) => (<>
                      <div>
                        <div className="flex justify-between px-2">
                          <h4>Contactos</h4>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => push(emptyContact)}
                          >
                            Agregar +
                          </button>
                        </div>
                      </div>
                      { values.contacts.map((contact, index) => {
                         return <Disclosure key={index}>
                          {({ open }) => (
                            <div key={`contact=${index}`}>
                              <div className="flex justify-between items-center">

                                <DisclosureButton className="py-2 px-2 w-full flex bg-neutral-200 justify-between">
                                  <p className="mx-1 self-start">{ open ? 'A' : 'V' }</p>
                                  <p className="mx-1">{values.contacts[index].name ? values.contacts[index].name : ''}</p>
                                  <p className="mx-1">{values.contacts[index].phone}</p>
                                </DisclosureButton> 
                                <button className="flex justify-end px-3 py-2 bg-red-800 text-white" onClick={() => remove(index)}>X</button>
                              </div>
                              <DisclosurePanel className="text-gray-500">
                                <div className="px-2 pt-0 border border-neutral-300 w-full" key={index}>
                                  <div className="flex w-full justify-between">
                                    <label className="w-3/12" htmlFor="`contacts.${index}.name`">Nombre</label>
                                    <Field className="border border-neutral-400 rounded-sm px-2 w-9/12" id="name" name={`contacts.${index}.name`} type="text" value={values.contacts[index].name} />
                                    
                                  </div>
                                  <div className="flex w-full justify-between">
                                    <label className="w-3/12" htmlFor="`contacts.${index}.area`">Area</label>
                                    <Field className="border border-neutral-400 rounded-sm px-2 w-9/12" id="area" name={`contacts.${index}.area`} type="text" value={values.contacts[index].area} />
                                  </div>
                                  <div className="flex w-full justify-between">
                                    <label className="w-3/12" htmlFor="`contacts.${index}.email`">Correo</label> 
                                    {/* agregar campo de correo */}
                                    <Field className="border border-neutral-400 rounded-sm px-2 w-9/12" id="email" name={`contacts.${index}.email`} type="text" value={values.contacts[index].email} />
                                  </div>
                                  <div className="flex w-full justify-between">
                                    <label className="w-3/12" htmlFor="`contacts.${index}.extension`">Extension</label>
                                    <Field className="border border-neutral-400 rounded-sm px-2 w-9/12" id="extension" name={`contacts.${index}.extension`} type="text" value={values.contacts[index].extension} />
                                  </div>
                                  <div className="flex w-full justify-between">
                                    <label className="w-3/12" htmlFor="`contacts.${index}.job_title`">Titulo laboral</label>
                                    <Field className="border border-neutral-400 rounded-sm px-2 w-9/12" id="job_title" name={`contacts.${index}.job_title`} type="text" value={values.contacts[index].job_title} />
                                  </div>
                                  <div className="flex w-full justify-between">
                                    <label className="w-3/12" htmlFor="`contacts.${index}.phone`">Teléfono</label>
                                    {/* agregar campo telefono */}
                                    <Field className="border border-neutral-400 rounded-sm px-2 w-9/12" id="phone" name={`contacts.${index}.phone`} type="text" value={values.contacts[index].phone} />
                                  </div>
                                </div>
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>
                        })
                      }
                  </>)}
                </FieldArray>
              </div>
              <div>
                <p>Información fiscal</p>
                <div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_company_name" className="px-2">Razón Social: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_company_name" name="taxing_info.taxing_company_name" type="text" value={values.taxing_info.taxing_company_name} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_RFC" className="px-2">RFC: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_RFC" name="taxing_info.taxing_RFC" type="text" value={values.taxing_info.taxing_RFC} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="zip_code" className="px-2">Código Postal: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.zip_code" name="taxing_info.zip_code" type="text" value={values.taxing_info.zip_code} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_regime" className="px-2">Régimen Fiscal: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_regime" name="taxing_info.taxing_regime" type="text" value={values.taxing_info.taxing_regime} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="invoice_period" className="px-2">Periodo de Facturación: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.invoice_period" name="taxing_info.invoice_period" type="text" value={values.taxing_info.invoice_period} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="billing_period" className="px-2">Periodo de Cortes: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.billing_period" name="taxing_info.billing_period" type="text" value={values.taxing_info.billing_period} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="payment_period" className="px-2">Periodo de Pago: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.payment_period" name="taxing_info.payment_period" type="text" value={values.taxing_info.payment_period} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="shipping_invoice" className="px-2">Factura Envios: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.shipping_invoice" name="taxing_info.shipping_invoice" type="boolean" value={values.taxing_info.shipping_invoice} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="payment_method" className="px-2">Forma de Pago: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.payment_method" name="taxing_info.payment_method" type="text" value={values.taxing_info.payment_method} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="email" className="px-2">Correo para Facturas: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.email" name="taxing_info.email" type="email" value={values.taxing_info.email} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_payment_method" className="px-2">Método de Pago Fiscal: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_payment_method" name="taxing_info.taxing_payment_method" type="text" value={values.taxing_info.taxing_payment_method} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_method_of_payment" className="px-2">Forma de Pago Fiscal: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_method_of_payment" name="taxing_info.taxing_method_of_payment" type="text" value={values.taxing_info.taxing_method_of_payment} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_CFDI_use" className="px-2">Uso de CFDI: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_CFDI_use" name="taxing_info.taxing_CFDI_use" type="text" value={values.taxing_info.taxing_CFDI_use} />
                  </div>
                  <div className="flex w-full justify-between">
                    <label htmlFor="taxing_CFDI_use" className="px-2">Comentarios: </label>
                    <Field className="border border-neutral-400 rounded-sm px-2" id="taxing_info.taxing_CFDI_use" name="taxing_info.comments" type="textarea" value={values.taxing_info.comments} />
                  </div>
                </div>
                
              </div>
              <div className="flex gap-4 justify-end">
                {/* <button className="bg-red-800 px-4 py-2 rounded-sm text-white" onClick={() => sendClose()}>Cancelar</button> */}
                {/* <button className="bg-green-700 px-4 py-2 text-white" type="submit">{ editTicket ? 'Editar' : 'Crear'}</button> */}
                <button className="bg-green-700 px-4 py-2 text-white" type="submit">Crear</button>
                {/* <button onClick={() => setIsOpen(false)}>Deactivate</button> */}
              </div>
            </Form>
          )
        }
      </Formik>
    }  
  </>
  

} 

export default ClientsForm

{/* 
  <FieldArray name="products">
    {({ remove, push }) => (
      <div>
        <div className="flex justify-between px-2">
          <h4>Productos</h4>
          <button
            type="button"
            className="secondary"
            onClick={() => push(emptyProduct)}
          >
            Agregar +
          </button>
        
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
                      <div className="px-2 pt-0 border border-neutral-300 w-full" key={index}>
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
  </FieldArray> */}