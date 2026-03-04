// ClientForm — Formik form for creating and editing a Client (Cliente).
// Used in /clients/new and the client detail edit panel.
//
// Mutation pattern: Formik onSubmit sets a state payload (newClient or editPayload),
// which triggers the SWR mutation hook. A useEffect watches the hook result and shows
// a toast on success/failure, invalidates SWR cache, and redirects or calls onSuccess.
//
// Layout: two-column grid on lg+ (left: name + fiscal info, right: contacts).
// Contacts are managed via Formik FieldArray + Headless UI Disclosure accordion.
'use client'
import React, { useEffect, useState } from "react"
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Field, FieldArray, Form, Formik } from "formik"
import * as Yup from "yup"
import { Client, Contact, TaxingInfo } from "@/api/hooks/clients/getClient"
import useCreateClient from "@/api/hooks/clients/useCreateClient"
import useEditClient from "@/api/hooks/clients/useEditClient"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

// EVariant / EProduct — legacy types, not used within this file.
// Kept for backwards compatibility with any external imports.
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
// ClientInitialValues — Formik initial values shape. Same as createClientReq;
// kept as a separate type to distinguish form state from API request shape.
export type ClientInitialValues = {
  name: string;
  taxing_info: TaxingInfo
  contacts: Contact[]
}
// createClientReq — body sent to POST /api/clients and PUT /api/clients/[id].
export type createClientReq = {
  name: string;
  taxing_info: TaxingInfo
  contacts: Contact[]
}

// emptyContact — blank contact record pushed into the FieldArray when user clicks "Agregar".
export const emptyContact: Contact = {
  name: '',
  area: '',
  email: '',
  extension: '0',
  job_title: '',
  phone: ''
}

// SAT Catálogos — official Mexican tax authority (SAT) dropdown options.
// These must match the values accepted by the CFDI generation service.
// SAT_REGIMENES: fiscal regimes (Régimen Fiscal) per SAT catalog c_RegimenFiscal.
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

// SAT_CFDI_USOS: CFDI usage codes (Uso CFDI) per SAT catalog c_UsoCFDI.
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

// SAT_METODOS_PAGO: payment method codes (Método de Pago) per SAT catalog c_MetodoPago.
// PUE = single payment, PPD = partial/deferred payments.
const SAT_METODOS_PAGO = [
  'PUE - Pago en una sola exhibición',
  'PPD - Pago en parcialidades o diferido',
]

// SAT_FORMAS_PAGO: payment form codes (Forma de Pago) per SAT catalog c_FormaPago.
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

// FORMAS_PAGO_INTERNAS — internal payment methods (not SAT codes).
// Used for the business's own tracking (payment_method field), separate from SAT's forma de pago.
const FORMAS_PAGO_INTERNAS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'credito', label: 'Crédito' },
]

// PERIODOS — billing/payment cycle options in days.
// value: number of days (0 = per-ticket/cash, 7/15/30 = net terms).
// Used for billing_period, invoice_period, and payment_period fields.
const PERIODOS = [
  { value: 0, label: 'Por nota / Contado' },
  { value: 7, label: '7 días' },
  { value: 15, label: '15 días' },
  { value: 30, label: '30 días' },
]

// clientSchema — Yup validation for the client form.
// RFC regex accepts 3-4 uppercase letters + 6 digits + 3 alphanumeric chars (physical/moral persons).
// zip_code uses typeError to show a friendly message when non-numeric input is entered.
// contacts array validates name/email/extension per contact entry.
const clientSchema = Yup.object({
  name: Yup.string().required('El nombre es requerido'),
  taxing_info: Yup.object({
    taxing_RFC: Yup.string().matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, 'RFC inválido').nullable(),
    email: Yup.string().email('Correo inválido').nullable(),
    zip_code: Yup.number().typeError('Debe ser un número').nullable(),
  }),
  contacts: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Nombre requerido'),
      email: Yup.string().email('Correo inválido').required('Correo requerido'),
      extension: Yup.number().min(0, 'Extensión inválida').required('Extensión requerida').transform((v, o) => o === '' ? 0 : v),
    })
  ),
})

// ClientsForm — create/edit form for a Client.
// client prop: if provided, the form operates in edit mode (isEdit = true);
//   initial values are pre-filled from the existing client record.
// onSuccess: optional callback called after successful create (when redirect is not possible)
//   or after successful edit to close the enclosing modal/panel.
const ClientsForm: React.FC<{ client?: Client; onSuccess?: () => void }> = ({ client, onSuccess }) => {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  // isEdit: determines button label, which hook to fire, and post-save behavior.
  const isEdit = !!client

  // SWR mutation state — payload is undefined until Formik submits.
  // Setting the payload triggers the hook to fire the API request.
  const [newClient, setNewClient] = useState<createClientReq>()
  const [editPayload, setEditPayload] = useState<{ data: createClientReq; documentId: string }>()

  const { client: createdClient, error: createError, isLoading: createLoading } = useCreateClient(newClient)
  const { client: editedClient, error: editError, isLoading: editLoading } = useEditClient(editPayload)

  const initialFormValues: ClientInitialValues = {
    name: client?.name ?? '',
    contacts: client?.contacts?.map(c => ({
      name: c.name ?? '',
      area: c.area ?? '',
      email: c.email ?? '',
      extension: c.extension ?? '0',
      job_title: c.job_title ?? '',
      phone: c.phone ?? '',
    })) ?? [],
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

  // Create result effect: on success redirect to the new client's detail page.
  // documentId is nested in createdClient.data.documentId (Strapi v5 response shape).
  useEffect(() => {
    if (createError && !createLoading) {
      toast.error('Error al crear el cliente')
    } else if (!createError && !createLoading && createdClient) {
      toast.success('Cliente creado')
      const id = (createdClient as any)?.data?.documentId
      if (id) router.push(`/clients/${id}`)
      else if (onSuccess) onSuccess()
    }
  }, [createLoading, createdClient, createError])

  // Edit result effect: on success, broadcast SWR cache invalidation for all /api/clients keys
  // so any list or detail view that shows this client refreshes automatically.
  useEffect(() => {
    if (editError && !editLoading) {
      toast.error('Error al guardar el cliente')
    } else if (!editError && !editLoading && editedClient) {
      toast.success('Cliente guardado')
      // Invalidate all SWR keys that include /api/clients (list + detail views).
      mutate((key: unknown) => Array.isArray(key) && typeof key[0] === 'string' && key[0].includes('/api/clients'))
      if (onSuccess) onSuccess()
    }
  }, [editLoading, editedClient, editError])

  const isSubmitting = createLoading || editLoading
  const apiError = createError || editError

  return (
    <Formik initialValues={initialFormValues} onSubmit={handleSubmit} enableReinitialize validationSchema={clientSchema}>
      {({ values, errors, touched, isValid, dirty }) => (
        <Form className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 w-full">

          {/* LEFT: Nombre + Contactos */}
          <div className="flex flex-col gap-6">

            {apiError && (
              <div className="alert-error col-span-2 mb-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                Error al guardar. Por favor intenta de nuevo.
              </div>
            )}

            <div className="field-group">
              <label className="field-label required" htmlFor="name">Nombre</label>
              <Field className="field-input" id="name" name="name" type="text" />
              {touched.name && errors.name && <p className="alert-field">{errors.name}</p>}
            </div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Información fiscal</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="field-group">
                <label className="field-label">Razón Social</label>
                <Field className="field-input" name="taxing_info.taxing_company_name" type="text" />
              </div>

              <div className="field-group">
                <label className="field-label">RFC</label>
                <Field className="field-input" name="taxing_info.taxing_RFC" type="text" />
                {(touched as any).taxing_info?.taxing_RFC && (errors as any).taxing_info?.taxing_RFC && <p className="alert-field">{(errors as any).taxing_info.taxing_RFC}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">Código Postal</label>
                <Field className="field-input" name="taxing_info.zip_code" type="text" />
                {(touched as any).taxing_info?.zip_code && (errors as any).taxing_info?.zip_code && <p className="alert-field">{(errors as any).taxing_info.zip_code}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">Correo para Facturas</label>
                <Field className="field-input" name="taxing_info.email" type="email" />
                {(touched as any).taxing_info?.email && (errors as any).taxing_info?.email && <p className="alert-field">{(errors as any).taxing_info.email}</p>}
              </div>

              <div className="field-group col-span-1 sm:col-span-2">
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

             

              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
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
                                  <span className="font-medium flex items-center gap-2">
                                    {values.contacts[index].name || 'Contacto sin nombre'}
                                    {(touched as any).contacts?.[index] && (errors as any).contacts?.[index] && Object.keys((errors as any).contacts[index]).length > 0 && (
                                      <span className="text-xs text-red-500">Revisa los campos</span>
                                    )}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <span className="text-surface-400 text-xs">{values.contacts[index].phone}</span>
                                    <span className="material-symbols-outlined text-[16px] text-surface-400">
                                      {open ? 'expand_less' : 'expand_more'}
                                    </span>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-t-0 border-surface-200 rounded-b">
                                  {[
                                    { label: 'Nombre', name: `contacts.${index}.name`, key: 'name', required: true },
                                    { label: 'Área', name: `contacts.${index}.area`, key: 'area', required: false },
                                    { label: 'Correo', name: `contacts.${index}.email`, key: 'email', required: true },
                                    { label: 'Extensión', name: `contacts.${index}.extension`, key: 'extension', required: true },
                                    { label: 'Título laboral', name: `contacts.${index}.job_title`, key: 'job_title', required: false },
                                    { label: 'Teléfono', name: `contacts.${index}.phone`, key: 'phone', required: false },
                                  ].map(({ label, name, key, required }) => {
                                    const contactTouched = (touched as any).contacts?.[index]
                                    const contactErrors = (errors as any).contacts?.[index]
                                    return (
                                      <div key={name} className="field-group">
                                        <label className={`field-label${required ? ' required' : ''}`}>{label}</label>
                                        <Field className="field-input" name={name} type="text" />
                                        {contactTouched?.[key] && contactErrors?.[key] && <p className="alert-field">{contactErrors[key]}</p>}
                                      </div>
                                    )
                                  })}
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
              <button className="btn-primary disabled:opacity-50" type="submit" disabled={isSubmitting || !dirty || !isValid}>
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
