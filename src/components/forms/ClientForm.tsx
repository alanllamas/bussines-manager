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

const SAT_METODOS_PAGO = [
  'PUE - Pago en una sola exhibición',
  'PPD - Pago en parcialidades o diferido',
]

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
    <Formik initialValues={initialFormValues} onSubmit={handleSubmit} enableReinitialize>
      {({ values }) => (
        <Form className="grid grid-cols-2 gap-x-12 w-full">

          {/* LEFT: Nombre + Contactos */}
          <div className="flex flex-col gap-6">

            <div className="field-group">
              <label className="field-label" htmlFor="name">Nombre</label>
              <Field className="field-input" id="name" name="name" type="text" />
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Información fiscal</h4>

            <div className="grid grid-cols-2 gap-4">

              <div className="field-group">
                <label className="field-label">Razón Social</label>
                <Field className="field-input" name="taxing_info.taxing_company_name" type="text" />
              </div>

              <div className="field-group">
                <label className="field-label">RFC</label>
                <Field className="field-input" name="taxing_info.taxing_RFC" type="text" />
              </div>

              <div className="field-group">
                <label className="field-label">Código Postal</label>
                <Field className="field-input" name="taxing_info.zip_code" type="text" />
              </div>

              <div className="field-group">
                <label className="field-label">Correo para Facturas</label>
                <Field className="field-input" name="taxing_info.email" type="email" />
              </div>

              <div className="field-group col-span-2">
                <label className="field-label">Régimen Fiscal</label>
                <Field as="select" className="field-select" name="taxing_info.taxing_regime">
                  <option value="">-- Seleccionar --</option>
                  {SAT_REGIMENES.map((v) => <option key={v} value={v}>{v}</option>)}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Uso de CFDI</label>
                <Field as="select" className="field-select" name="taxing_info.taxing_CFDI_use">
                  <option value="">-- Seleccionar --</option>
                  {SAT_CFDI_USOS.map((v) => <option key={v} value={v}>{v}</option>)}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Método de Pago (CFDI)</label>
                <Field as="select" className="field-select" name="taxing_info.taxing_payment_method">
                  <option value="">-- Seleccionar --</option>
                  {SAT_METODOS_PAGO.map((v) => <option key={v} value={v}>{v}</option>)}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Forma de Pago (SAT)</label>
                <Field as="select" className="field-select" name="taxing_info.taxing_method_of_payment">
                  <option value="">-- Seleccionar --</option>
                  {SAT_FORMAS_PAGO.map((v) => <option key={v} value={v}>{v}</option>)}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Forma de Pago</label>
                <Field as="select" className="field-select" name="taxing_info.payment_method">
                  <option value="">-- Seleccionar --</option>
                  {FORMAS_PAGO_INTERNAS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Periodo de Cortes</label>
                <Field as="select" className="field-select" name="taxing_info.billing_period">
                  {PERIODOS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Periodo de Facturación</label>
                <Field as="select" className="field-select" name="taxing_info.invoice_period">
                  {PERIODOS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

              <div className="field-group">
                <label className="field-label">Periodo de Pago</label>
                <Field as="select" className="field-select" name="taxing_info.payment_period">
                  {PERIODOS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Field>
              </div>

             

              <div className="flex items-center gap-2 col-span-2">
                <Field name="taxing_info.shipping_invoice" type="checkbox" id="shipping_invoice" />
                <label htmlFor="shipping_invoice" className="text-sm text-surface-700">Factura Envíos</label>
              </div>

            </div>
            

          </div>

          {/* RIGHT: Información fiscal + Save */}
          <div className="flex flex-col gap-4">


<div>
              <FieldArray name="contacts">
                {({ remove, push }) => (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Contactos</h4>
                      <button type="button" onClick={() => push(emptyContact)} className="btn-secondary">
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      {values.contacts.map((_, index) => (
                        <Disclosure key={index}>
                          {({ open }) => (
                            <div>
                              <div className="flex items-center">
                                <DisclosureButton className="flex-1 flex justify-between items-center px-3 py-2 bg-surface-50 border border-surface-200 rounded text-sm text-surface-700">
                                  <span className="font-medium">{values.contacts[index].name || 'Contacto sin nombre'}</span>
                                  <span className="text-surface-400 text-xs">{values.contacts[index].phone}</span>
                                  <span className="material-symbols-outlined text-[16px] text-surface-400">
                                    {open ? 'expand_less' : 'expand_more'}
                                  </span>
                                </DisclosureButton>
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="btn-danger rounded-l-none ml-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                              <DisclosurePanel>
                                <div className="grid grid-cols-2 gap-3 p-4 border border-t-0 border-surface-200 rounded-b">
                                  {[
                                    { label: 'Nombre', name: `contacts.${index}.name` },
                                    { label: 'Área', name: `contacts.${index}.area` },
                                    { label: 'Correo', name: `contacts.${index}.email` },
                                    { label: 'Extensión', name: `contacts.${index}.extension` },
                                    { label: 'Título laboral', name: `contacts.${index}.job_title` },
                                    { label: 'Teléfono', name: `contacts.${index}.phone` },
                                  ].map(({ label, name }) => (
                                    <div key={name} className="field-group">
                                      <label className="field-label">{label}</label>
                                      <Field className="field-input" name={name} type="text" />
                                    </div>
                                  ))}
                                </div>
                              </DisclosurePanel>
                            </div>
                          )}
                        </Disclosure>
                      ))}
                    </div>
                  </>
                )}
              </FieldArray>
            </div>
              <div className="field-group col-span-2">
                <label className="field-label">Comentarios</label>
                <Field as="textarea" className="field-textarea" name="taxing_info.comments" />
              </div>
            <div className="flex justify-end pt-2">
              <button className="btn-primary" type="submit" disabled={isSubmitting}>
                <span className="material-symbols-outlined text-[16px]">save</span>
                {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
              </button>
            </div>

          </div>

        </Form>
      )}
    </Formik>
  )
}

export default ClientsForm
