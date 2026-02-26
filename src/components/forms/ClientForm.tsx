'use client'
import React, { useEffect, useState } from "react"
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Field, FieldArray, Form, Formik } from "formik"
import { Client, Contact, TaxingInfo } from "@/api/hooks/clients/getClient"
import useCreateClient from "@/api/hooks/clients/useCreateClient"
import useEditClient from "@/api/hooks/clients/useEditClient"
import { useRouter } from "next/navigation"

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

// SAT Catálogos
const SAT_REGIMENES = [
  '601 - Régimen General de Ley Personas Morales',
  '602 - Régimen Simplificado de Ley Personas Morales',
  '603 - Personas Morales con Fines No Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados',
  '606 - Régimen de Arrendamiento',
  '607 - Enajenación o Adquisición de Bienes',
  '608 - Demás Ingresos',
  '610 - Residentes en el Extranjero',
  '611 - Dividendos (Socios y Accionistas)',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '614 - Ingresos por Intereses',
  '616 - Sin Obligaciones Fiscales',
  '620 - Sociedades Cooperativas de Producción',
  '621 - Régimen de Incorporación Fiscal',
  '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '623 - Opcional para Grupos de Sociedades',
  '624 - Coordinados',
  '625 - Actividades Empresariales con Ingresos por Plataformas Tecnológicas',
  '626 - Régimen Simplificado de Confianza',
]

const SAT_CFDI_USOS = [
  'G01 - Adquisición de mercancías',
  'G02 - Devoluciones, descuentos o bonificaciones',
  'G03 - Gastos en general',
  'I01 - Construcciones',
  'I02 - Mobiliario y equipo de oficina',
  'I03 - Equipo de transporte',
  'I04 - Equipo de cómputo y accesorios',
  'I05 - Dados, troqueles, moldes, matrices',
  'I06 - Comunicaciones telefónicas',
  'I07 - Comunicaciones satelitales',
  'I08 - Otra maquinaria y equipo',
  'D01 - Honorarios médicos, dentales y gastos hospitalarios',
  'D02 - Gastos médicos por incapacidad o discapacidad',
  'D03 - Gastos funerales',
  'D04 - Donativos',
  'D05 - Intereses reales pagados por créditos hipotecarios',
  'D06 - Aportaciones voluntarias al SAR',
  'D07 - Primas por seguros de gastos médicos',
  'D08 - Gastos de transportación escolar obligatoria',
  'D09 - Depósitos en cuentas para el ahorro, pensiones',
  'D10 - Pagos por servicios educativos (colegiaturas)',
  'S01 - Sin efectos fiscales',
  'CP01 - Pagos',
  'CN01 - Nómina',
]

// Métodos de Pago CFDI (PUE / PPD)
const SAT_METODOS_PAGO = [
  'PUE - Pago en una sola exhibición',
  'PPD - Pago en parcialidades o diferido',
]

// Formas de Pago SAT
const SAT_FORMAS_PAGO = [
  '01 - Efectivo',
  '02 - Cheque nominativo',
  '03 - Transferencia electrónica de fondos',
  '04 - Tarjeta de crédito',
  '05 - Monedero electrónico',
  '06 - Dinero electrónico',
  '08 - Vales de despensa',
  '17 - Compensación',
  '28 - Tarjeta de débito',
  '99 - Por definir',
]

// Forma de pago interna (no SAT)
const FORMAS_PAGO_INTERNAS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'credito', label: 'Crédito' },
]

const PERIODOS = [
  { value: 0, label: 'Por nota / Contado' },
  { value: 7, label: '7 días' },
  { value: 15, label: '15 días' },
  { value: 30, label: '30 días' },
]

const selectClass = "border border-neutral-400 rounded-sm px-2 bg-white"
const fieldClass = "border border-neutral-400 rounded-sm px-2"

const ClientsForm: React.FC<{ client?: Client; onSuccess?: () => void }> = ({ client, onSuccess }) => {
  const router = useRouter()
  const isEdit = !!client

  const [newClient, setNewClient] = useState<createClientReq>()
  const [editPayload, setEditPayload] = useState<{ data: createClientReq; documentId: string }>()

  const { client: createdClient, error: createError, isLoading: createLoading } = useCreateClient(newClient)
  const { client: editedClient, error: editError, isLoading: editLoading } = useEditClient(editPayload)

  const initialFormValues: ClientInitialValues = {
    name: client?.name ?? '',
    contacts: client?.contacts ?? [],
    taxing_info: {
      billing_period: client?.taxing_info?.billing_period ?? 0,
      taxing_company_name: client?.taxing_info?.taxing_company_name ?? '',
      taxing_payment_method: client?.taxing_info?.taxing_payment_method ?? '',
      taxing_method_of_payment: client?.taxing_info?.taxing_method_of_payment ?? '',
      taxing_CFDI_use: client?.taxing_info?.taxing_CFDI_use ?? '',
      payment_period: client?.taxing_info?.payment_period ?? 0,
      email: client?.taxing_info?.email ?? '',
      comments: client?.taxing_info?.comments ?? '',
      shipping_invoice: client?.taxing_info?.shipping_invoice ?? false,
      taxing_RFC: client?.taxing_info?.taxing_RFC ?? '',
      payment_method: client?.taxing_info?.payment_method ?? '',
      invoice_period: client?.taxing_info?.invoice_period ?? 0,
      zip_code: client?.taxing_info?.zip_code ?? 0,
      taxing_regime: client?.taxing_info?.taxing_regime ?? '',
    }
  }

  const handleSubmit = (values: ClientInitialValues) => {
    if (isEdit && client?.documentId) {
      setEditPayload({ data: values, documentId: client.documentId })
    } else {
      setNewClient(values)
    }
  }

  useEffect(() => {
    if (!createError && !createLoading && createdClient) {
      const id = (createdClient as any)?.data?.documentId
      if (id) router.push(`/clients/${id}`)
      else if (onSuccess) onSuccess()
    }
  }, [createLoading, createdClient, createError])

  useEffect(() => {
    if (!editError && !editLoading && editedClient) {
      if (onSuccess) onSuccess()
    }
  }, [editLoading, editedClient, editError])

  const isSubmitting = createLoading || editLoading

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values }) => (
        <Form className="text-neutral-600 w-2/4">
          <div className="flex w-full justify-between mb-2">
            <label htmlFor="name" className="px-2">Nombre: </label>
            <Field className={fieldClass} id="name" name="name" type="text" />
          </div>

          {/* Contactos */}
          <div className="flex w-full flex-col mb-2">
            <FieldArray name="contacts">
              {({ remove, push }) => (
                <>
                  <div className="flex justify-between px-2 mb-1">
                    <h4>Contactos</h4>
                    <button type="button" onClick={() => push(emptyContact)}>Agregar +</button>
                  </div>
                  {values.contacts.map((_, index) => (
                    <Disclosure key={index}>
                      {({ open }) => (
                        <div>
                          <div className="flex justify-between items-center">
                            <DisclosureButton className="py-2 px-2 w-full flex bg-neutral-200 justify-between">
                              <p className="mx-1">{open ? 'A' : 'V'}</p>
                              <p className="mx-1">{values.contacts[index].name || ''}</p>
                              <p className="mx-1">{values.contacts[index].phone}</p>
                            </DisclosureButton>
                            <button className="flex justify-end px-3 py-2 bg-red-800 text-white" type="button" onClick={() => remove(index)}>X</button>
                          </div>
                          <DisclosurePanel className="text-gray-500">
                            <div className="px-2 pt-0 border border-neutral-300 w-full">
                              {[
                                { label: 'Nombre', name: `contacts.${index}.name` },
                                { label: 'Área', name: `contacts.${index}.area` },
                                { label: 'Correo', name: `contacts.${index}.email` },
                                { label: 'Extensión', name: `contacts.${index}.extension` },
                                { label: 'Título laboral', name: `contacts.${index}.job_title` },
                                { label: 'Teléfono', name: `contacts.${index}.phone` },
                              ].map(({ label, name }) => (
                                <div key={name} className="flex w-full justify-between">
                                  <label className="w-3/12">{label}</label>
                                  <Field className={`${fieldClass} w-9/12`} name={name} type="text" />
                                </div>
                              ))}
                            </div>
                          </DisclosurePanel>
                        </div>
                      )}
                    </Disclosure>
                  ))}
                </>
              )}
            </FieldArray>
          </div>

          {/* Información fiscal */}
          <div className="mb-2">
            <p className="font-medium mb-1">Información fiscal</p>
            <div className="flex flex-col gap-1">
              <div className="flex w-full justify-between">
                <label className="px-2">Razón Social: </label>
                <Field className={fieldClass} name="taxing_info.taxing_company_name" type="text" />
              </div>
              <div className="flex w-full justify-between">
                <label className="px-2">RFC: </label>
                <Field className={fieldClass} name="taxing_info.taxing_RFC" type="text" />
              </div>
              <div className="flex w-full justify-between">
                <label className="px-2">Código Postal: </label>
                <Field className={fieldClass} name="taxing_info.zip_code" type="text" />
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Régimen Fiscal: </label>
                <Field as="select" className={selectClass} name="taxing_info.taxing_regime">
                  <option value="">-- Seleccionar --</option>
                  {SAT_REGIMENES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Uso de CFDI: </label>
                <Field as="select" className={selectClass} name="taxing_info.taxing_CFDI_use">
                  <option value="">-- Seleccionar --</option>
                  {SAT_CFDI_USOS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Método de Pago (CFDI): </label>
                <Field as="select" className={selectClass} name="taxing_info.taxing_payment_method">
                  <option value="">-- Seleccionar --</option>
                  {SAT_METODOS_PAGO.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Forma de Pago (SAT): </label>
                <Field as="select" className={selectClass} name="taxing_info.taxing_method_of_payment">
                  <option value="">-- Seleccionar --</option>
                  {SAT_FORMAS_PAGO.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Forma de Pago: </label>
                <Field as="select" className={selectClass} name="taxing_info.payment_method">
                  <option value="">-- Seleccionar --</option>
                  {FORMAS_PAGO_INTERNAS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Periodo de Cortes: </label>
                <Field as="select" className={selectClass} name="taxing_info.billing_period">
                  {PERIODOS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Periodo de Facturación: </label>
                <Field as="select" className={selectClass} name="taxing_info.invoice_period">
                  {PERIODOS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Periodo de Pago: </label>
                <Field as="select" className={selectClass} name="taxing_info.payment_period">
                  {PERIODOS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Factura Envíos: </label>
                <Field name="taxing_info.shipping_invoice" type="checkbox" />
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Correo para Facturas: </label>
                <Field className={fieldClass} name="taxing_info.email" type="email" />
              </div>

              <div className="flex w-full justify-between">
                <label className="px-2">Comentarios: </label>
                <Field as="textarea" className={fieldClass} name="taxing_info.comments" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button className="bg-green-700 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ClientsForm
